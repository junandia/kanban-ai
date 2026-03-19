import { useState, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy
} from '@dnd-kit/sortable';
import { KanbanColumn } from './KanbanColumn';
import { CardModal, AddColumnModal } from './Modal';
import { Plus } from 'lucide-react';
import { api } from '../lib/supabase';

export function KanbanBoard({ board }) {
  const [columns, setColumns] = useState([]);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [activeCard, setActiveCard] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  // Load data
  useEffect(() => {
    if (board) {
      loadData();
    }
  }, [board]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [columnsData, cardsData] = await Promise.all([
        api.getColumns(board.id),
        api.getCardsByBoard(board.id)
      ]);
      setColumns(columnsData.sort((a, b) => a.order - b.order));
      
      // Group cards by column and load AI tasks for each
      const cardsWithTasks = await Promise.all(
        cardsData.map(async (card) => {
          const tasks = await api.getAITasks(card.id);
          return { ...card, ai_tasks: tasks };
        })
      );
      
      setCards(cardsWithTasks);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCardsByColumn = (columnId) => {
    return cards
      .filter(c => c.column_id === columnId)
      .sort((a, b) => a.order - b.order);
  };

  // Drag handlers
  const handleDragStart = (event) => {
    const { active } = event;
    const card = cards.find(c => c.id === active.id);
    setActiveCard(card);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveCard(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Find active card
    const activeCard = cards.find(c => c.id === activeId);
    if (!activeCard) return;

    // Check if dropped on column or another card
    const overColumn = columns.find(c => c.id === overId);
    const overCard = cards.find(c => c.id === overId);

    if (overColumn) {
      // Dropped on empty column space
      const newColumnId = overColumn.id;
      if (activeCard.column_id !== newColumnId) {
        await api.moveCard(activeId, newColumnId, 0);
        loadData();
      }
    } else if (overCard && activeId !== overId) {
      // Dropped on another card
      const newColumnId = overCard.column_id;
      const newOrder = overCard.order;

      if (activeCard.column_id !== newColumnId) {
        // Moving to different column
        await api.moveCard(activeId, newColumnId, newOrder);
      } else {
        // Reordering within same column
        const columnCards = getCardsByColumn(newColumnId);
        const oldIndex = columnCards.findIndex(c => c.id === activeId);
        const newIndex = columnCards.findIndex(c => c.id === overId);
        
        if (oldIndex !== newIndex) {
          const reordered = arrayMove(columnCards, oldIndex, newIndex);
          // Update orders in DB
          for (let i = 0; i < reordered.length; i++) {
            await api.updateCard(reordered[i].id, { order: i });
          }
        }
      }
      loadData();
    }
  };

  // Card actions
  const handleAddCard = (column) => {
    setSelectedColumn(column);
    setSelectedCard(null);
  };

  const handleCardClick = (card, column) => {
    setSelectedCard(card);
    setSelectedColumn(column);
  };

  const handleSaveCard = async (updates) => {
    if (selectedCard) {
      await api.updateCard(selectedCard.id, updates);
    } else {
      const order = getCardsByColumn(selectedColumn.id).length;
      await api.createCard(selectedColumn.id, updates.title, updates.description, order);
    }
    setSelectedCard(null);
    setSelectedColumn(null);
    loadData();
  };

  const handleDeleteCard = async () => {
    if (selectedCard) {
      await api.deleteCard(selectedCard.id);
      setSelectedCard(null);
      setSelectedColumn(null);
      loadData();
    }
  };

  const handleExecuteAI = async (prompt) => {
    if (selectedCard) {
      await api.createAITask(selectedCard.id, prompt);
      loadData();
    }
  };

  // Column actions
  const handleAddColumn = async (title) => {
    const order = columns.length;
    await api.createColumn(board.id, title, order);
    setShowAddColumn(false);
    loadData();
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="kanban-board">
        <SortableContext items={columns.map(c => c.id)} strategy={horizontalListSortingStrategy}>
          {columns.map(column => (
            <KanbanColumn
              key={column.id}
              column={column}
              cards={getCardsByColumn(column.id)}
              onAddCard={handleAddCard}
              onCardClick={handleCardClick}
            />
          ))}
        </SortableContext>

        {/* Add Column Button */}
        <button 
          className="add-card-btn"
          onClick={() => setShowAddColumn(true)}
          style={{
            minWidth: '300px',
            height: 'fit-content',
            padding: '1rem'
          }}
        >
          <Plus size={16} />
          Add Column
        </button>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeCard && (
          <div className="kanban-card" style={{ cursor: 'grabbing' }}>
            <div className="card-title">{activeCard.title}</div>
          </div>
        )}
      </DragOverlay>

      {/* Modals */}
      {(selectedCard || selectedColumn) && (
        <CardModal
          card={selectedCard}
          column={selectedColumn}
          onClose={() => { setSelectedCard(null); setSelectedColumn(null); }}
          onUpdate={handleSaveCard}
          onDelete={handleDeleteCard}
          onExecuteAI={handleExecuteAI}
        />
      )}

      {showAddColumn && (
        <AddColumnModal
          onAdd={handleAddColumn}
          onClose={() => setShowAddColumn(false)}
        />
      )}
    </DndContext>
  );
}
