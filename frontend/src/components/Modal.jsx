import { useState } from 'react';
import { Plus, X, Sparkles, Loader2 } from 'lucide-react';

export function CardModal({ card, column, onClose, onUpdate, onDelete, onExecuteAI }) {
  const [title, setTitle] = useState(card?.title || '');
  const [description, setDescription] = useState(card?.description || '');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);

  const handleSave = () => {
    if (title.trim()) {
      onUpdate({ title, description });
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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            {card ? 'Edit Card' : 'New Card'}
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
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
