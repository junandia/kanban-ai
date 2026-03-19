import { useState, useEffect } from 'react';

export function CardModal({ card, onClose, onSave, onDelete }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    assignee: '',
    due_date: '',
    labels: []
  });

  useEffect(() => {
    if (card) {
      setFormData({
        title: card.title || '',
        description: card.description || '',
        priority: card.priority || 'medium',
        assignee: card.assignee || '',
        due_date: card.due_date || '',
        labels: card.labels || []
      });
    }
  }, [card]);

  if (!card) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...card, ...formData });
  };

  const availableLabels = [
    { name: 'Bug', color: '#ef4444' },
    { name: 'Feature', color: '#3b82f6' },
    { name: 'Enhancement', color: '#8b5cf6' },
    { name: 'Documentation', color: '#10b981' },
    { name: 'Urgent', color: '#f97316' }
  ];

  const toggleLabel = (labelName) => {
    setFormData(prev => ({
      ...prev,
      labels: prev.labels.includes(labelName)
        ? prev.labels.filter(l => l !== labelName)
        : [...prev.labels, labelName]
    }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Card</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              rows="4"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Priority</label>
              <select
                value={formData.priority}
                onChange={e => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div className="form-group">
              <label>Assignee</label>
              <input
                type="text"
                value={formData.assignee}
                onChange={e => setFormData({ ...formData, assignee: e.target.value })}
                placeholder="Who's working on this?"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Due Date</label>
            <input
              type="date"
              value={formData.due_date}
              onChange={e => setFormData({ ...formData, due_date: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Labels</label>
            <div className="labels-selector">
              {availableLabels.map(label => (
                <button
                  key={label.name}
                  type="button"
                  className={`label-btn ${formData.labels.includes(label.name) ? 'selected' : ''}`}
                  style={{ backgroundColor: formData.labels.includes(label.name) ? label.color : 'transparent', borderColor: label.color }}
                  onClick={() => toggleLabel(label.name)}
                >
                  {label.name}
                </button>
              ))}
            </div>
          </div>

          <div className="modal-actions">
            <button type="submit" className="btn-primary">Save</button>
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            {onDelete && (
              <button type="button" className="btn-danger" onClick={() => onDelete(card.id)}>Delete</button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
