import { useState, useEffect } from 'react';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../lib/supabase';

export function ActivityFeed({ boardId }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (boardId) {
      loadActivities();
    }
  }, [boardId]);
  
  const loadActivities = async () => {
    setLoading(true);
    try {
      // Get all history for cards in this board
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/card_history?select=*&order=created_at.desc&limit=50`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          }
        }
      );
      const data = await res.json();
      setActivities(data || []);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };
  
  const getActionIcon = (action) => {
    if (action?.toLowerCase().includes('create')) return '➕';
    if (action?.toLowerCase().includes('update')) return '✏️';
    if (action?.toLowerCase().includes('delete')) return '🗑️';
    if (action?.toLowerCase().includes('move')) return '↔️';
    return '📝';
  };
  
  return (
    <div className="activity-feed" style={{
      background: 'var(--bg-secondary)',
      padding: '1.5rem',
      borderRadius: '12px',
      marginBottom: '1rem'
    }}>
      <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem' }}>🕐 Recent Activity</h3>
      
      {loading ? (
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Loading activity...
        </div>
      ) : activities.length === 0 ? (
        <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          No recent activity
        </div>
      ) : (
        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {activities.map(activity => (
            <div key={activity.id} style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              padding: '0.75rem 0',
              borderBottom: '1px solid var(--border-color)'
            }}>
              <span style={{ fontSize: '1rem' }}>
                {getActionIcon(activity.action)}
              </span>
              <div style={{ flex: 1 }}>
                <span style={{ 
                  fontSize: '0.875rem',
                  color: 'var(--text-primary)'
                }}>
                  {activity.action}
                </span>
                <span style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  marginTop: '0.25rem'
                }}>
                  {formatTime(activity.created_at)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
