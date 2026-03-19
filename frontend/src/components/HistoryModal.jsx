import { useState, useEffect } from 'react';

export function HistoryModal({ card, onClose }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const cardId = card?.id;

  useEffect(() => {
    if (cardId) {
      fetchHistory();
    }
  }, [cardId]);

  const fetchHistory = async () => {
    try {
      const response = await fetch(
        `https://lbbnfvqehfyavvkdxilg.supabase.co/rest/v1/card_history?card_id=eq.${cardId}&order=created_at.desc`,
        {
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxiYm5mdnFlaGZ5YXZ2a2R4aWxnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4ODU0NjcsImV4cCI6MjA4OTQ2MTQ2N30.--c2fNkKqsDw2dMDK1vITSzuSLS-mtVCAConbGKYOhU',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxiYm5mdnFlaGZ5YXZ2a2R4aWxnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4ODU0NjcsImV4cCI6MjA4OTQ2MTQ2N30.--c2fNkKqsDw2dMDK1vITSzuSLS-mtVCAConbGKYOhU'
          }
        }
      );
      const data = await response.json();
      setHistory(data || []);
    } catch (error) {
      console.error('Failed to fetch history:', error);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  if (!card) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content history-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🕐 Card History</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="card-info">
          <strong>{card.title || 'Untitled Card'}</strong>
        </div>

        <div className="history-content">
          {loading ? (
            <div className="loading-state">
              <p>Loading history...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="no-history">
              <p>No history found for this card.</p>
            </div>
          ) : (
            <ul className="history-list">
              {history.map((item, index) => (
                <li key={item.id || index} className="history-item">
                  <div className="history-header">
                    <span className="history-time">
                      {new Date(item.created_at).toLocaleString()}
                    </span>
                    <span className="history-action">{item.action || 'Updated'}</span>
                  </div>
                  {item.changes && (
                    <div className="history-changes">
                      <pre>{JSON.stringify(item.changes, null, 2)}</pre>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="modal-actions">
          <button className="btn-primary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
