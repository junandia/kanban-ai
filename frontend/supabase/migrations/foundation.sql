-- Migration: Foundation - Priority, Assignee, History
-- Date: 2026-03-19

-- Add priority and assignee to cards table
ALTER TABLE cards 
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
ADD COLUMN IF NOT EXISTS assignee TEXT DEFAULT NULL;

-- Create card_history table for audit log
CREATE TABLE IF NOT EXISTS card_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  old_value JSONB,
  new_value JSONB,
  changed_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on card_history
ALTER TABLE card_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for now" ON card_history FOR ALL USING (true);

-- Create index for faster history queries
CREATE INDEX IF NOT EXISTS idx_card_history_card_id ON card_history(card_id);
CREATE INDEX IF NOT EXISTS idx_card_history_created_at ON card_history(created_at DESC);
