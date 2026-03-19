import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Sparkles, User, History } from 'lucide-react';

export function KanbanCard({ card, onClick, onHistory }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  const hasAITasks = card.ai_tasks?.length > 0;
  const latestTask = card.ai_tasks?.[0];
  
  const getPriorityConfig = (priority) => {
    switch (priority) {
      case 'urgent':
        return { label: 'Urgent', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' };
      case 'high':
        return { label: 'High', color: '#f97316', bg: 'rgba(249, 115, 22, 0.15)' };
      case 'low':
        return { label: 'Low', color: '#6b7280', bg: 'rgba(107, 114, 128, 0.15)' };
      default:
        return { label: 'Medium', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' };
    }
  };

  const getAssigneeInitials = (assignee) => {
    if (!assignee) return null;
    switch (assignee) {
      case 'Mandor': return '👨‍💼';
      case 'Tukang Ketik': return '⌨️';
      case 'Ceker': return '🐔';
      default: return assignee.charAt(0).toUpperCase();
    }
  };

  const priorityConfig = getPriorityConfig(card.priority);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`kanban-card ${isDragging ? 'dragging' : ''}`}
      onClick={onClick}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
        <button
          {...attributes}
          {...listeners}
          style={{
            cursor: 'grab',
            padding: '2px',
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)'
          }}
          onClick={e => e.stopPropagation()}
        >
          <GripVertical size={14} />
        </button>
        <div style={{ flex: 1 }}>
          <div className="card-title">{card.title}</div>
          {card.description && (
            <div className="card-description">
              {card.description.length > 80 
                ? card.description.substring(0, 80) + '...' 
                : card.description}
            </div>
          )}
        </div>
      </div>
      
      <div className="card-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {/* Priority Badge */}
          <span 
            className="priority-badge"
            style={{
              fontSize: '0.65rem',
              fontWeight: '600',
              padding: '2px 8px',
              borderRadius: '12px',
              color: priorityConfig.color,
              backgroundColor: priorityConfig.bg,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            {priorityConfig.label}
          </span>
          
          {/* Assignee Badge */}
          {card.assignee && (
            <span 
              className="assignee-badge"
              style={{
                fontSize: '0.65rem',
                fontWeight: '500',
                padding: '2px 8px',
                borderRadius: '12px',
                color: 'var(--text-primary)',
                backgroundColor: 'var(--bg-card)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span>{getAssigneeInitials(card.assignee)}</span>
              {card.assignee}
            </span>
          )}
          
          {/* AI Badge */}
          {hasAITasks && latestTask && (
            <span className={`ai-badge ${latestTask.status}`}>
              <Sparkles size={10} />
              AI
            </span>
          )}
        </div>
        
        {/* History Button */}
        <button
          className="btn btn-ghost btn-icon"
          onClick={(e) => {
            e.stopPropagation();
            onHistory?.(card);
          }}
          style={{
            padding: '2px',
            opacity: 0.6,
            transition: 'opacity 0.2s'
          }}
          title="View History"
        >
          <History size={12} />
        </button>
      </div>
    </div>
  );
}
