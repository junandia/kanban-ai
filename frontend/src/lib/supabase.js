import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper functions
export const api = {
  // Boards
  async getBoards() {
    const { data, error } = await supabase.from('boards').select('*');
    if (error) throw error;
    return data;
  },

  async createBoard(name, description = '') {
    const { data, error } = await supabase
      .from('boards')
      .insert([{ name, description }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Columns
  async getColumns(boardId) {
    const { data, error } = await supabase
      .from('columns')
      .select('*')
      .eq('board_id', boardId)
      .order('order');
    if (error) throw error;
    return data;
  },

  async createColumn(boardId, title, order, color = '#6B7280') {
    const { data, error } = await supabase
      .from('columns')
      .insert([{ board_id: boardId, title, order, color }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Cards
  async getCards(columnId) {
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('column_id', columnId)
      .order('order');
    if (error) throw error;
    return data;
  },

  async getCardsByBoard(boardId) {
    const { data, error } = await supabase
      .from('cards')
      .select('*, columns!inner(board_id)')
      .eq('columns.board_id', boardId)
      .order('order');
    if (error) throw error;
    return data;
  },

  async createCard(columnId, title, description = '', order = 0) {
    const { data, error } = await supabase
      .from('cards')
      .insert([{ column_id: columnId, title, description, order }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateCard(cardId, updates) {
    const { data, error } = await supabase
      .from('cards')
      .update(updates)
      .eq('id', cardId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async moveCard(cardId, columnId, order) {
    return this.updateCard(cardId, { column_id: columnId, order });
  },

  async deleteCard(cardId) {
    const { error } = await supabase.from('cards').delete().eq('id', cardId);
    if (error) throw error;
  },

  // AI Tasks
  async createAITask(cardId, prompt) {
    const { data, error } = await supabase
      .from('ai_tasks')
      .insert([{ card_id: cardId, prompt, status: 'pending' }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getAITasks(cardId) {
    const { data, error } = await supabase
      .from('ai_tasks')
      .select('*')
      .eq('card_id', cardId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async updateAITask(taskId, updates) {
    const { data, error } = await supabase
      .from('ai_tasks')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // AI Agents
  async getAgents() {
    const { data, error } = await supabase
      .from('ai_agents')
      .select('*')
      .eq('is_active', true);
    if (error) throw error;
    return data;
  },

  async createAgent(name, description, systemPrompt, model = 'gpt-4') {
    const { data, error } = await supabase
      .from('ai_agents')
      .insert([{ name, description, system_prompt: systemPrompt, model }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Realtime subscription
  subscribeToBoard(boardId, callback) {
    return supabase
      .channel(`board:${boardId}`)
      .on('postgres_changes', { event: '*', schema: 'public' }, callback)
      .subscribe();
  }
};
