import { useState, useEffect } from 'react';
import { Layout, Plus, Settings, Sparkles, Moon, Sun, Archive } from 'lucide-react';
import { api } from './lib/supabase';
import { KanbanBoard } from './components/KanbanBoard';

function App() {
  const [boards, setBoards] = useState([]);
  const [currentBoard, setCurrentBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNewBoard, setShowNewBoard] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    loadBoards();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(t => t === 'dark' ? 'light' : 'dark');
  };

  const loadBoards = async () => {
    try {
      const data = await api.getBoards();
      setBoards(data);
      if (data.length > 0 && !currentBoard) {
        setCurrentBoard(data[0]);
      }
    } catch (error) {
      console.error('Error loading boards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBoard = async () => {
    if (!newBoardName.trim()) return;
    
    try {
      const board = await api.createBoard(newBoardName);
      
      // Create default columns
      await api.createColumn(board.id, 'To Do', 0, '#EF4444');
      await api.createColumn(board.id, 'In Progress', 1, '#F59E0B');
      await api.createColumn(board.id, 'Done', 2, '#10B981');
      
      setBoards([...boards, board]);
      setCurrentBoard(board);
      setNewBoardName('');
      setShowNewBoard(false);
    } catch (error) {
      console.error('Error creating board:', error);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Header */}
      <header className="header">
        <div className="header-title">
          <Sparkles size={24} style={{ color: '#8b5cf6' }} />
          <h1>Kanban AI</h1>
          {currentBoard && (
            <span style={{ 
              color: 'var(--text-secondary)', 
              fontSize: '0.875rem',
              marginLeft: '0.5rem'
            }}>
              / {currentBoard.name}
            </span>
          )}
        </div>
        
        <div className="header-actions">
          {/* Board Selector */}
          {boards.length > 1 && (
            <select 
              className="form-input"
              value={currentBoard?.id || ''}
              onChange={(e) => {
                const board = boards.find(b => b.id === e.target.value);
                setCurrentBoard(board);
              }}
              style={{ padding: '0.375rem 0.75rem' }}
            >
              {boards.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          )}
          
          <button className="btn btn-secondary" onClick={() => setShowNewBoard(true)}>
            <Plus size={16} /> New Board
          </button>
          
          <button 
            className={`btn ${showArchived ? 'btn-primary' : 'btn-secondary'}`} 
            onClick={() => setShowArchived(!showArchived)}
            title={showArchived ? 'Hide Archived' : 'Show Archived'}
          >
            <Archive size={16} /> {showArchived ? 'Hide Archived' : 'Show Archived'}
          </button>
          
          <button className="btn btn-ghost btn-icon">
            <Settings size={18} />
          </button>
          
          <button className="btn btn-ghost btn-icon" onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      {/* Board Content */}
      {currentBoard ? (
        <KanbanBoard board={currentBoard} showArchived={showArchived} />
      ) : (
        <div className="empty-state" style={{ minHeight: 'calc(100vh - 80px)' }}>
          <Layout size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <h2>No boards yet</h2>
          <p style={{ marginBottom: '1.5rem' }}>Create your first board to get started</p>
          <button className="btn btn-primary" onClick={() => setShowNewBoard(true)}>
            <Plus size={16} /> Create Board
          </button>
        </div>
      )}

      {/* New Board Modal */}
      {showNewBoard && (
        <div className="modal-overlay" onClick={() => setShowNewBoard(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Create New Board</div>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Board Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={newBoardName}
                  onChange={e => setNewBoardName(e.target.value)}
                  placeholder="e.g., Project Alpha"
                  onKeyDown={e => e.key === 'Enter' && handleCreateBoard()}
                  autoFocus
                />
              </div>
              <button className="btn btn-primary" onClick={handleCreateBoard} style={{ width: '100%' }}>
                Create Board
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
