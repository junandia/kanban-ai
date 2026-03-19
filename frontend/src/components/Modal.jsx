import { useState, useEffect } from 'react';
import { Comments } from './Comments';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../lib/supabase';

export function Modal({ card, onClose, onUpdate, onDelete, columns }) {
  const [editedCard, setEditedCard] = useState(card);
  const [selectedLabels, setSelectedLabels] = useState(card.labels || []);
  
  const availableLabels = [
    { name: 'Bug', color: '#ef4444' },
    { name: 'Feature', color: '#3b82f6' },
    { name: 'Enhancement', color: '#8b5cf6' },
    { name: 'Documentation', color: '#10b981' },
    { name: 'Urgent', color: '#f97316' },
  ];

  const handleLabelToggle = (labelName) => {
    setSelectedLabels(prev => 
      prev.includes(labelName) 
        ? prev.filter(l => l !== labelName)
        : [...prev, labelName]
    );
  };

  const handleSave = () => {
    onUpdate({ ...editedCard, labels: selectedLabels });
  };

  // Keyboard shortcut to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const isOverdue = (date) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(date) < today;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Edit Card</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        
        <div className="modal-body">
          {/* Title */}
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={editedCard.title || ''}
              onChange={e => setEditedCard({ ...editedCard, title: e.target.value })}
              placeholder="Card title..."
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={editedCard.description || ''}
              onChange={e => setEditedCard({ ...editedCard, description: e.target.value })}
              placeholder="Add a description..."
              rows="3"
            />
          </div>

          {/* Due Date */}
          <div className="form-group">
            <label>Due Date</label>
            <input
              type="date"
              value={editedCard.due_date || ''}
              onChange={e => setEditedCard({ ...editedCard, due_date: e.target.value })}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '6px',
                border: `1px solid ${isOverdue(editedCard.due_date) ? '#ef4444' : 'var(--border-color)'}`,
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)'
              }}
            />
            {isOverdue(editedCard.due_date) && (
              <span style={{ 
                color: '#ef4444', 
                fontSize: '0.75rem',
                marginTop: '0.25rem',
                display: 'block'
              }}>
                ⚠️ This task is overdue
              </span>
            )}
          </div>

          {/* Priority */}
          <div className="form-group">
            <label>Priority</label>
            <select
              value={editedCard.priority || 'medium'}
              onChange={e => setEditedCard({ ...editedCard, priority: e.target.value })}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)'
              }}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          {/* Column */}
          <div className="form-group">
            <label>Column</label>
            <select
              value={editedCard.column_id || ''}
              onChange={e => setEditedCard({ ...editedCard, column_id: e.target.value })}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)'
              }}
            >
              {columns.map(col => (
                <option key={col.id} value={col.id}>{col.title}</option>
              ))}
            </select>
          </div>

          {/* Labels/Tags */}
          <div className="form-group">
            <label>Labels</label>
            <div className="labels-selector" style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
              marginTop: '0.5rem'
            }}>
              {availableLabels.map(label => (
                <button
                  key={label.name}
                  type="button"
                  onClick={() => handleLabelToggle(label.name)}
                  style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '9999px',
                    border: '2px solid transparent',
                    background: selectedLabels.includes(label.name) ? label.color : 'transparent',
                    color: selectedLabels.includes(label.name) ? 'white' : label.color,
                    borderColor: label.color,
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    transition: 'all 0.2s'
                  }}
                >
                  {label.name}
                </button>
              ))}
            </div>
            {selectedLabels.length > 0 && (
              <div style={{
                marginTop: '0.5rem',
                fontSize: '0.75rem',
                color: 'var(--text-muted)'
              }}>
                Selected: {selectedLabels.join(', ')}
              </div>
            )}
          </div>

          {/* Comments Section */}
          <Comments cardId={card.id} />

          {/* Actions */}
          <div className="modal-actions">
            <button className="btn btn-danger" onClick={() => onDelete(card.id)}>
              🗑️ Delete
            </button>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSave}>
                💾 Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
