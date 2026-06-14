const redis = require('redis');

async function initRedis() {
  // Redis v4 uses url-based connection
  const client = redis.createClient({
    url: process.env.REDIS_URL || `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
    password: process.env.REDIS_PASSWORD || undefined,
  });

  client.on('error', (err) => console.error('Redis error:', err));
  client.on('connect', () => console.log('Redis connected'));

  await client.connect();
  return client;
}

// Rate limiting middleware
async function rateLimitMiddleware(req, res, next) {
  const sessionId = req.query.sessionId || req.body.sessionId;
  if (!sessionId) return res.status(400).json({ error: 'Missing sessionId' });

  const key = `ratelimit:${sessionId}`;
  const limit = 10; // 10 messages per minute
  const window = 60; // 1 minute

  try {
    const current = await req.redis.incr(key);

    if (current === 1) {
      await req.redis.expire(key, window);
    }

    if (current > limit) {
      return res.status(429).json({ error: 'Too many requests. Try again later.' });
    }

    next();
  } catch (error) {
    console.error('Rate limit error:', error);
    next(); // Continue on error to be safe
  }
}

module.exports = { initRedis, rateLimitMiddleware };
