export function KanbanCard({ card, onEdit, onDragStart }) {
  const getPriorityColor = (priority) => {
    const colors = {
      low: '#94a3b8',
      medium: '#3b82f6',
      high: '#f97316',
      urgent: '#ef4444'
    };
    return colors[priority] || colors.medium;
  };

  const getPriorityIcon = (priority) => {
    const icons = {
      low: '⚪',
      medium: '🔵',
      high: '🟠',
      urgent: '🔴'
    };
    return icons[priority] || '🔵';
  };

  const getLabelColor = (labelName) => {
    const colors = {
      'Bug': '#ef4444',
      'Feature': '#3b82f6',
      'Enhancement': '#8b5cf6',
      'Documentation': '#10b981',
      'Urgent': '#f97316'
    };
    return colors[labelName] || '#6b7280';
  };

  const isOverdue = (date) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(date) < today;
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div
      className="kanban-card"
      draggable
      onDragStart={(e) => onDragStart(e, card)}
      onClick={() => onEdit(card)}
      style={{
        background: 'var(--bg-primary)',
        borderRadius: '8px',
        padding: '0.75rem',
        marginBottom: '0.5rem',
        cursor: 'grab',
        border: '1px solid var(--border-color)',
        transition: 'all 0.2s'
      }}
    >
      {/* Labels/Tags */}
      {card.labels && card.labels.length > 0 && (
        <div className="card-labels" style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.25rem',
          marginBottom: '0.5rem'
        }}>
          {card.labels.map(label => (
            <span
              key={label}
              className="label-tag"
              style={{
                padding: '0.125rem 0.5rem',
                borderRadius: '9999px',
                background: getLabelColor(label),
                color: 'white',
                fontSize: '0.625rem',
                fontWeight: '500',
                textTransform: 'uppercase'
              }}
            >
              {label}
            </span>
          ))}
        </div>
      )}

      {/* Title */}
      <div style={{
        fontWeight: '500',
        marginBottom: '0.5rem',
        fontSize: '0.875rem',
        color: 'var(--text-primary)'
      }}>
        {card.title}
      </div>

      {/* Description preview */}
      {card.description && (
        <div style={{
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          marginBottom: '0.5rem',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {card.description}
        </div>
      )}

      {/* Footer with Priority and Due Date */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.75rem'
      }}>
        <span style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem'
        }}>
          <span>{getPriorityIcon(card.priority)}</span>
          <span style={{ color: 'var(--text-muted)', textTransform: 'capitalize' }}>
            {card.priority}
          </span>
        </span>

        {card.due_date && (
          <span className={`due-date ${isOverdue(card.due_date) ? 'overdue' : ''}`} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.125rem 0.5rem',
            borderRadius: '4px',
            background: isOverdue(card.due_date) ? '#fee2e2' : 'var(--bg-secondary)',
            color: isOverdue(card.due_date) ? '#dc2626' : 'var(--text-muted)'
          }}>
            📅 {formatDate(card.due_date)}
          </span>
        )}
      </div>
    </div>
  );
}
