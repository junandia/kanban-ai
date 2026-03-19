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

  async createCard(columnId, title, description = '', order = 0, priority = 'medium', assignee = null) {
    const { data, error } = await supabase
      .from('cards')
      .insert([{ 
        column_id: columnId, 
        title, 
        description, 
        order,
        priority,
        assignee
      }])
      .select()
      .single();
    if (error) throw error;
    
    // Log history
    await this.addCardHistory(data.id, 'created', null, { title, priority, assignee });
    
    return data;
  },

  async updateCard(cardId, updates, changedBy = null) {
    // Get old values first
    const { data: oldCard } = await supabase
      .from('cards')
      .select('*')
      .eq('id', cardId)
      .single();
    
    const { data, error } = await supabase
      .from('cards')
      .update(updates)
      .eq('id', cardId)
      .select()
      .single();
    if (error) throw error;
    
    // Log history for tracked fields
    const trackedFields = ['title', 'description', 'priority', 'assignee', 'column_id'];
    for (const field of trackedFields) {
      if (updates[field] !== undefined && oldCard[field] !== updates[field]) {
        await this.addCardHistory(
          cardId, 
          `${field}_changed`, 
          { [field]: oldCard[field] }, 
          { [field]: updates[field] },
          changedBy
        );
      }
    }
    
    return data;
  },

  async moveCard(cardId, columnId, order, changedBy = null) {
    return this.updateCard(cardId, { column_id: columnId, order }, changedBy);
  },

  async deleteCard(cardId) {
    // Log history before delete
    await this.addCardHistory(cardId, 'deleted', null, null);
    
    const { error } = await supabase.from('cards').delete().eq('id', cardId);
    if (error) throw error;
  },

  async archiveCard(cardId, changedBy = null) {
    const { data, error } = await supabase
      .from('cards')
      .update({ archived: true })
      .eq('id', cardId)
      .select()
      .single();
    if (error) throw error;
    
    await this.addCardHistory(cardId, 'archived', { archived: false }, { archived: true }, changedBy);
    return data;
  },

  async unarchiveCard(cardId, changedBy = null) {
    const { data, error } = await supabase
      .from('cards')
      .update({ archived: false })
      .eq('id', cardId)
      .select()
      .single();
    if (error) throw error;
    
    await this.addCardHistory(cardId, 'unarchived', { archived: true }, { archived: false }, changedBy);
    return data;
  },

  // Card History
  async getCardHistory(cardId) {
    const { data, error } = await supabase
      .from('card_history')
      .select('*')
      .eq('card_id', cardId)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    return data;
  },

  async addCardHistory(cardId, action, oldValue, newValue, changedBy = null) {
    try {
      const { data, error } = await supabase
        .from('card_history')
        .insert([{
          card_id: cardId,
          action,
          old_value: oldValue,
          new_value: newValue,
          changed_by: changedBy
        }])
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to add card history:', error);
      // Don't throw - history logging should not break main operations
    }
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
