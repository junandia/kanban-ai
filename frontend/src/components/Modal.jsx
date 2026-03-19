import { useState } from 'react';
import { Plus, X, Sparkles, Loader2, History } from 'lucide-react';
import { api } from '../lib/supabase';

export function CardModal({ card, column, onClose, onUpdate, onDelete, onExecuteAI }) {
  const [title, setTitle] = useState(card?.title || '');
  const [description, setDescription] = useState(card?.description || '');
  const [priority, setPriority] = useState(card?.priority || 'medium');
  const [assignee, setAssignee] = useState(card?.assignee || '');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const handleSave = () => {
    if (title.trim()) {
      onUpdate({ title, description, priority, assignee: assignee || null });
    }
  };

  const handleAIExecute = async () => {
    if (!aiPrompt.trim()) return;
    setIsExecuting(true);
    try {
      await onExecuteAI(aiPrompt);
      setAiPrompt('');
    } finally {
      setIsExecuting(false);
    }
  };

  const loadHistory = async () => {
    if (!card?.id) return;
    setLoadingHistory(true);
    try {
      const data = await api.getCardHistory(card.id);
      setHistory(data);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const openHistory = () => {
    setShowHistory(true);
    loadHistory();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ minWidth: '450px' }}>
        <div className="modal-header">
          <div className="modal-title">
            {card ? 'Edit Card' : 'New Card'}
          </div>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            {card && (
              <button className="btn btn-ghost btn-icon" onClick={openHistory} title="View History">
                <History size={18} />
              </button>
            )}
            <button className="btn btn-ghost btn-icon" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Title</label>
            <input
              type="text"
              className="form-input"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Enter card title..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-input form-textarea"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Add a description..."
            />
          </div>

          {/* Priority Selector */}
          <div className="form-group">
            <label className="form-label">Priority</label>
            <select 
              className="form-input" 
              value={priority}
              onChange={e => setPriority(e.target.value)}
              style={{ cursor: 'pointer' }}
            >
              <option value="low">🟤 Low</option>
              <option value="medium">🔵 Medium</option>
              <option value="high">🟠 High</option>
              <option value="urgent">🔴 Urgent</option>
            </select>
          </div>

          {/* Assignee Selector */}
          <div className="form-group">
            <label className="form-label">Assignee</label>
            <select 
              className="form-input" 
              value={assignee}
              onChange={e => setAssignee(e.target.value)}
              style={{ cursor: 'pointer' }}
            >
              <option value="">Unassigned</option>
              <option value="Mandor">👨‍💼 Mandor</option>
              <option value="Tukang Ketik">⌨️ Tukang Ketik</option>
              <option value="Ceker">🐔 Ceker</option>
            </select>
          </div>

          {/* AI Execution Section */}
          <div className="form-group">
            <label className="form-label">
              <Sparkles size={14} style={{ display: 'inline', marginRight: '4px' }} />
              AI Task Prompt
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                className="form-input"
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                placeholder="Enter task for AI to execute..."
                style={{ flex: 1 }}
              />
              <button
                className="btn btn-primary"
                onClick={handleAIExecute}
                disabled={!aiPrompt.trim() || isExecuting}
              >
                {isExecuting ? <Loader2 size={16} className="spin" /> : <Sparkles size={16} />}
                Execute
              </button>
            </div>
          </div>

          {/* AI Tasks History */}
          {card?.ai_tasks?.length > 0 && (
            <div className="form-group">
              <label className="form-label">AI Tasks</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {card.ai_tasks.map(task => (
                  <div key={task.id} style={{
                    padding: '0.5rem',
                    background: 'var(--bg-card)',
                    borderRadius: '6px',
                    fontSize: '0.8rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span className={`ai-badge ${task.status}`}>{task.status}</span>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>
                        {new Date(task.created_at).toLocaleString()}
                      </span>
                    </div>
                    <div style={{ color: 'var(--text-secondary)' }}>Prompt: {task.prompt}</div>
                    {task.result && (
                      <div style={{ marginTop: '0.25rem' }}>Result: {task.result}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button className="btn btn-primary" onClick={handleSave} style={{ flex: 1 }}>
              Save
            </button>
            {card && (
              <button className="btn btn-secondary" onClick={() => onDelete()} style={{ color: '#ef4444' }}>
                Delete
              </button>
            )}
          </div>
        </div>
      </div>

      {/* History Modal */}
      {showHistory && (
        <div className="modal-overlay" style={{ zIndex: 1001 }} onClick={() => setShowHistory(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ minWidth: '500px', maxHeight: '80vh' }}>
            <div className="modal-header">
              <div className="modal-title">📋 Card History</div>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowHistory(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              {loadingHistory ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <Loader2 size={24} className="spin" />
                </div>
              ) : history.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
                  No history yet
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {history.map((entry, index) => (
                    <div key={entry.id} style={{
                      padding: '0.75rem',
                      background: 'var(--bg-card)',
                      borderRadius: '8px',
                      borderLeft: '3px solid var(--primary)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ 
                          fontWeight: '600', 
                          fontSize: '0.85rem',
                          textTransform: 'capitalize',
                          color: 'var(--primary)'
                        }}>
                          {entry.action}
                        </span>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>
                          {new Date(entry.created_at).toLocaleString()}
                        </span>
                      </div>
                      
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {entry.old_value && (
                          <div style={{ marginBottom: '0.25rem' }}>
                            <span style={{ fontWeight: '500' }}>From:</span>{' '}
                            <code style={{ 
                              background: 'var(--bg-secondary)', 
                              padding: '2px 6px', 
                              borderRadius: '4px',
                              fontSize: '0.75rem'
                            }}>
                              {JSON.stringify(entry.old_value)}
                            </code>
                          </div>
                        )}
                        {entry.new_value && (
                          <div>
                            <span style={{ fontWeight: '500' }}>To:</span>{' '}
                            <code style={{ 
                              background: 'var(--bg-secondary)', 
                              padding: '2px 6px', 
                              borderRadius: '4px',
                              fontSize: '0.75rem'
                            }}>
                              {JSON.stringify(entry.new_value)}
                            </code>
                          </div>
                        )}
                      </div>
                      
                      {entry.changed_by && (
                        <div style={{ marginTop: '0.5rem', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                          by {entry.changed_by}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function AddColumnModal({ onAdd, onClose }) {
  const [title, setTitle] = useState('');

  const handleSubmit = () => {
    if (title.trim()) {
      onAdd(title);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Add Column</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Column Title</label>
            <input
              type="text"
              className="form-input"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g., To Do, In Progress, Done"
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              autoFocus
            />
          </div>
          <button className="btn btn-primary" onClick={handleSubmit} style={{ width: '100%' }}>
            <Plus size={16} /> Add Column
          </button>
        </div>
      </div>
    </div>
  );
}
