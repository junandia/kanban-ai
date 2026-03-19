-- =====================================================
-- KANBAN AI - Database Schema
-- Copy & paste ini ke Supabase SQL Editor
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Boards table
CREATE TABLE IF NOT EXISTS boards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Columns table
CREATE TABLE IF NOT EXISTS columns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  board_id UUID REFERENCES boards(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  "order" INTEGER DEFAULT 0,
  color VARCHAR(7) DEFAULT '#6B7280',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cards table
CREATE TABLE IF NOT EXISTS cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  column_id UUID REFERENCES columns(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  "order" INTEGER DEFAULT 0,
  priority VARCHAR(20) DEFAULT 'normal',
  labels TEXT[] DEFAULT '{}',
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Tasks table
CREATE TABLE IF NOT EXISTS ai_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  result TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  model VARCHAR(50) DEFAULT 'gpt-4',
  tokens_used INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- AI Agents table (multi-agent support)
CREATE TABLE IF NOT EXISTS ai_agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  system_prompt TEXT,
  model VARCHAR(50) DEFAULT 'gpt-4',
  api_key_ref VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task assignments
CREATE TABLE IF NOT EXISTS task_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ai_task_id UUID REFERENCES ai_tasks(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES ai_agents(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(ai_task_id, agent_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_columns_board ON columns(board_id);
CREATE INDEX IF NOT EXISTS idx_cards_column ON cards(column_id);
CREATE INDEX IF NOT EXISTS idx_ai_tasks_card ON ai_tasks(card_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS boards_updated_at ON boards;
CREATE TRIGGER boards_updated_at BEFORE UPDATE ON boards FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS cards_updated_at ON cards;
CREATE TRIGGER cards_updated_at BEFORE UPDATE ON cards FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies (allow all for now - adjust for production)
CREATE POLICY "Allow all for authenticated users" ON boards FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON columns FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON cards FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON ai_tasks FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON ai_agents FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON task_assignments FOR ALL USING (true);

-- Insert default agent
INSERT INTO ai_agents (name, description, system_prompt, model)
VALUES (
  'Default Agent',
  'General purpose AI assistant',
  'You are a helpful AI assistant. Execute tasks efficiently and provide clear results.',
  'gpt-4'
) ON CONFLICT DO NOTHING;

-- Insert sample board
INSERT INTO boards (name, description) VALUES ('My First Board', 'Welcome to Kanban AI!');
INSERT INTO columns (board_id, title, "order", color)
SELECT id, 'To Do', 0, '#EF4444' FROM boards WHERE name = 'My First Board';
INSERT INTO columns (board_id, title, "order", color)
SELECT id, 'In Progress', 1, '#F59E0B' FROM boards WHERE name = 'My First Board';
INSERT INTO columns (board_id, title, "order", color)
SELECT id, 'Done', 2, '#10B981' FROM boards WHERE name = 'My First Board';

SELECT '✅ Database schema created successfully!' as status;
