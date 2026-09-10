/**
NEXA Database Schema
Local SQLite Database
*/

-- Guilds Table
CREATE TABLE IF NOT EXISTS guilds (
  id TEXT PRIMARY KEY,
  guild_id TEXT NOT NULL UNIQUE,
  prefix TEXT NOT NULL DEFAULT '-',
  ai_enabled BOOLEAN NOT NULL DEFAULT 1,
  max_concurrent_requests INTEGER NOT NULL DEFAULT 2,
  system_prompt TEXT,
  custom_settings JSON,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_guilds_guild_id ON guilds(guild_id);

-- Conversations Table
CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  guild_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  channel_id TEXT NOT NULL,
  title TEXT,
  is_active BOOLEAN NOT NULL DEFAULT 1,
  last_message_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (guild_id) REFERENCES guilds(guild_id),
  CHECK (guild_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_conversations_guild_user ON conversations(guild_id, user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_guild_id ON conversations(guild_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);

-- Messages Table
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  guild_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  token_count INTEGER,
  metadata JSON,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id),
  CHECK (guild_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_guild ON messages(guild_id);

-- Feedback Table (Future)
CREATE TABLE IF NOT EXISTS feedback (
  id TEXT PRIMARY KEY,
  guild_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  message_id TEXT,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  reason TEXT,
  metadata JSON,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (guild_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_feedback_guild ON feedback(guild_id);
CREATE INDEX IF NOT EXISTS idx_feedback_user ON feedback(user_id);

-- Learning Dataset Table (Future)
CREATE TABLE IF NOT EXISTS learning_dataset (
  id TEXT PRIMARY KEY,
  guild_id TEXT NOT NULL,
  interaction_type TEXT,
  input TEXT,
  output TEXT,
  quality_score REAL,
  metadata JSON,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (guild_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_learning_guild ON learning_dataset(guild_id);
