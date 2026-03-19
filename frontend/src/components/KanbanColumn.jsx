import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, MoreHorizontal } from 'lucide-react';
import { KanbanCard } from './KanbanCard';

export function KanbanColumn({ column, cards, onAddCard, onCardClick }) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id
  });

  const cardIds = cards.map(c => c.id);

  return (
    <div className="kanban-column">
      <div className="column-header">
        <div className="column-title">
          <span 
            className="color-dot" 
            style={{ background: column.color || '#6B7280' }}
          />
          {column.title}
          <span className="column-count">{cards.length}</span>
        </div>
        <button 
          className="btn btn-ghost btn-icon"
          onClick={() => onAddCard(column)}
        >
          <Plus size={16} />
        </button>
      </div>

      <div 
        ref={setNodeRef}
        className="column-content"
        style={{ 
          background: isOver ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
          borderRadius: '8px',
          transition: 'background 0.2s'
        }}
      >
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {cards.map(card => (
            <KanbanCard 
              key={card.id} 
              card={card} 
              onClick={() => onCardClick(card, column)}
              onHistory={onCardHistory}
            />
          ))}
        </SortableContext>

        {cards.length === 0 && (
          <button 
            className="add-card-btn"
            onClick={() => onAddCard(column)}
          >
            <Plus size={16} />
            Add a card
          </button>
        )}
      </div>
    </div>
  );
}
