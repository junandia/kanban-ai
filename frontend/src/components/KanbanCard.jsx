import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Sparkles } from 'lucide-react';

export function KanbanCard({ card, onClick }) {
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
  
  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return 'priority-normal';
    }
  };

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
        <span className={`card-priority ${getPriorityClass(card.priority)}`}>
          {card.priority || 'normal'}
        </span>
        
        {hasAITasks && latestTask && (
          <span className={`ai-badge ${latestTask.status}`}>
            <Sparkles size={10} />
            AI
          </span>
        )}
      </div>
    </div>
  );
}
