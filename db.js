const postgres = require('postgres');

async function initDB() {
  const sql = postgres({
    host: process.env.PGHOST || 'localhost',
    port: process.env.PGPORT || 5432,
    database: process.env.PGDATABASE || 'chatbot',
    username: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'postgres',
    ssl: process.env.DATABASE_URL ? 'require' : false,
  });

  // Create tables
  await sql`
    CREATE TABLE IF NOT EXISTS conversations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      session_id VARCHAR(255) NOT NULL UNIQUE,
      user_email VARCHAR(255),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      role VARCHAR(50) NOT NULL, -- 'user' or 'assistant'
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS analytics (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      message_count INT DEFAULT 0,
      avg_response_time INT,
      resolved BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_conversations_session ON conversations(session_id);
    CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
    CREATE INDEX IF NOT EXISTS idx_analytics_conversation ON analytics(conversation_id);
  `;

  console.log('Database tables initialized');
  return sql;
}

module.exports = { initDB };
