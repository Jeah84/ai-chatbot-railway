const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { initDB } = require('./lib/db');
const { initRedis } = require('./lib/redis');
const chatRoutes = require('./api/chat');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const PORT = process.env.PORT || 3000;

// Build Express app once — not inside every request
const expressApp = express();
expressApp.use(express.json());
expressApp.use(cors());

async function startServer() {
  await app.prepare();

  let db, redis;

  // Initialize database and cache
  try {
    db = await initDB();
    redis = await initRedis();
    console.log('✓ Database connected');
    console.log('✓ Redis cache connected');
  } catch (error) {
    console.error('Connection error:', error);
    process.exit(1);
  }

  // Attach db and redis to every request
  expressApp.use((req, res, next) => {
    req.db = db;
    req.redis = redis;
    next();
  });

  expressApp.use('/api/chat', chatRoutes);

  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      const { pathname } = parsedUrl;

      if (pathname.startsWith('/api/')) {
        return expressApp(req, res);
      }

      return handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Server error:', err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  });

  server.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`📝 Chat at http://localhost:${PORT}/chat`);
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down...');
    await db.end();
    if (redis) await redis.quit();
    server.close(() => process.exit(0));
  });
}

startServer().catch(console.error);
