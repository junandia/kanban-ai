import { useState, useEffect } from 'react';
import { DndContext, DragOverlay, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { api } from '../lib/supabase';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';
import { CardModal } from './CardModal';
import { HistoryModal } from './HistoryModal';

export function KanbanBoard({ board, showArchived = false }) {
  const [columns, setColumns] = useState([]);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCard, setActiveCard] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [historyCard, setHistoryCard] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 }
    })
  );

  useEffect(() => {
    if (board) {
      loadData();
    }
  }, [board]);

  const loadData = async () => {
    try {
      const [columnsData, cardsData] = await Promise.all([
        api.getColumns(board.id),
        api.getCards(board.id)
      ]);
      setColumns(columnsData);
      setCards(cardsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCardsByColumn = (columnId) => {
    return cards
      .filter(c => c.column_id === columnId)
      .filter(c => showArchived ? c.archived === true : !c.archived)
      .sort((a, b) => a.order - b.order);
  };

  const handleDragStart = (event) => {
    const card = cards.find(c => c.id === event.active.id);
    setActiveCard(card);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveCard(null);

    if (!over) return;

    const activeCard = cards.find(c => c.id === active.id);
    const overCard = cards.find(c => c.id === over.id);

    if (!activeCard || !overCard) return;

    if (active.id !== over.id) {
      if (activeCard.column_id === overCard.column_id) {
        // Reorder within same column
        const columnCards = getCardsByColumn(activeCard.column_id);
        const oldIndex = columnCards.findIndex(c => c.id === active.id);
        const newIndex = columnCards.findIndex(c => c.id === over.id);
        
        const reordered = arrayMove(columnCards, oldIndex, newIndex);
        
        // Update orders
        for (let i = 0; i < reordered.length; i++) {
          await api.updateCard(reordered[i].id, { order: i });
        }
        
        await loadData();
      } else {
        // Move to different column
        await api.updateCard(active.id, { 
          column_id: overCard.column_id,
          order: 999 // Will be reordered if needed
        });
        await loadData();
      }
    }
  };

  const handleAddCard = async (columnId, title) => {
    const columnCards = getCardsByColumn(columnId);
    const newOrder = columnCards.length > 0 ? Math.max(...columnCards.map(c => c.order)) + 1 : 0;
    
    await api.createCard({
      column_id: columnId,
      title,
      order: newOrder
    });
    loadData();
  };

  const handleCardClick = (card, column) => {
    setSelectedCard(card);
    setSelectedColumn(column);
  };

  const handleUpdateCard = async (cardId, updates) => {
    await api.updateCard(cardId, updates);
    loadData();
  };

  const handleDeleteCard = async (cardId) => {
    if (window.confirm('Are you sure you want to delete this card?')) {
      await api.deleteCard(cardId);
      setSelectedCard(null);
      loadData();
    }
  };

  const handleExecuteAI = async (prompt) => {
    if (selectedCard) {
      await api.createAITask(selectedCard.id, prompt);
      loadData();
    }
  };

  const handleArchiveCard = async (cardId, archive = true) => {
    if (archive) {
      await api.archiveCard(cardId, 'user');
    } else {
      await api.unarchiveCard(cardId, 'user');
    }
    loadData();
  };

  const cardIds = cards.map(c => c.id);
  const columnIds = columns.map(c => c.id);

  if (loading) {
    return <div className="loading">Loading board...</div>;
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="board-container">
          <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
            {columns
              .sort((a, b) => a.order - b.order)
              .map(column => (
                <KanbanColumn
                  key={column.id}
                  column={column}
                  cards={getCardsByColumn(column.id)}
                  onAddCard={handleAddCard}
                  onCardClick={handleCardClick}
                  onCardHistory={handleCardClick}
                  onCardArchive={handleArchiveCard}
                />
              ))}
          </SortableContext>
        </div>
        
        <DragOverlay>
          {activeCard && <KanbanCard card={activeCard} />}
        </DragOverlay>
      </DndContext>

      {/* Card Modal */}
      {selectedCard && (
        <CardModal
          card={selectedCard}
          column={selectedColumn}
          columns={columns}
          onClose={() => {
            setSelectedCard(null);
            setSelectedColumn(null);
          }}
          onUpdate={handleUpdateCard}
          onDelete={handleDeleteCard}
          onExecuteAI={handleExecuteAI}
          onHistory={() => {
            setHistoryCard(selectedCard);
            setSelectedCard(null);
          }}
        />
      )}

      {/* History Modal */}
      {historyCard && (
        <HistoryModal
          card={historyCard}
          onClose={() => setHistoryCard(null)}
        />
      )}
    </>
  );
}
