-- Fix RLS Policies - Run ini di Supabase SQL Editor
-- Untuk development, kita allow semua requests tanpa auth

-- Drop existing policies
DROP POLICY IF EXISTS "Allow all for authenticated users" ON boards;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON columns;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON cards;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON ai_tasks;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON ai_agents;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON task_assignments;

-- Create new policies that allow all (for development)
CREATE POLICY "Allow all access" ON boards FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON columns FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON cards FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON ai_tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON ai_agents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON task_assignments FOR ALL USING (true) WITH CHECK (true);

SELECT '✅ RLS policies updated!' as status;
