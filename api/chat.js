const express = require('express');
const { v4: uuidv4 } = require('uuid');
const OpenAI = require('openai').default;
const { rateLimitMiddleware } = require('../lib/redis');

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are a helpful customer support assistant for an e-commerce business.
Your role is to:
- Answer product questions
- Help with order tracking
- Process returns and refunds
- Provide shipping information
- Suggest relevant products
- Always be polite and professional
- Keep responses concise (under 150 words)
- If you can't help, suggest contacting support@store.com`;

// Create or get conversation
router.post('/init', async (req, res) => {
  try {
    const { sessionId, userEmail } = req.body;
    const finalSessionId = sessionId || uuidv4();

    const existing = await req.db`
      SELECT id FROM conversations WHERE session_id = ${finalSessionId}
    `;

    let conversationId;
    if (existing.length > 0) {
      conversationId = existing[0].id;
    } else {
      const result = await req.db`
        INSERT INTO conversations (session_id, user_email)
        VALUES (${finalSessionId}, ${userEmail || null})
        RETURNING id
      `;
      conversationId = result[0].id;
    }

    res.json({ conversationId, sessionId: finalSessionId });
  } catch (error) {
    console.error('Init error:', error);
    res.status(500).json({ error: 'Failed to initialize conversation' });
  }
});

// Stream chat response
router.post('/message', rateLimitMiddleware, async (req, res) => {
  try {
    const { conversationId, message } = req.body;

    if (!conversationId || !message) {
      return res.status(400).json({ error: 'Missing conversationId or message' });
    }

    // Store user message
    await req.db`
      INSERT INTO messages (conversation_id, role, content)
      VALUES (${conversationId}, 'user', ${message})
    `;

    // Get conversation history
    const history = await req.db`
      SELECT role, content FROM messages
      WHERE conversation_id = ${conversationId}
      ORDER BY created_at ASC
      LIMIT 10
    `;

    const messages = history.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));

    // Stream response
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let assistantMessage = '';

    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages,
      ],
      stream: true,
      temperature: 0.7,
      max_tokens: 500,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        assistantMessage += content;
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    // Store assistant message
    await req.db`
      INSERT INTO messages (conversation_id, role, content)
      VALUES (${conversationId}, 'assistant', ${assistantMessage})
    `;

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('Message error:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

// Get conversation history
router.get('/history/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;

    const messages = await req.db`
      SELECT id, role, content, created_at FROM messages
      WHERE conversation_id = ${conversationId}
      ORDER BY created_at ASC
    `;

    res.json(messages);
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

module.exports = router;
