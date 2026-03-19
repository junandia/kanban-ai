import { useMemo } from 'react';

export function Statistics({ cards, columns }) {
  const stats = useMemo(() => {
    const total = cards.length;
    const byColumn = columns.map(col => ({
      name: col.title,
      count: cards.filter(c => c.column_id === col.id).length
    }));
    const byPriority = {
      low: cards.filter(c => c.priority === 'low').length,
      medium: cards.filter(c => c.priority === 'medium').length,
      high: cards.filter(c => c.priority === 'high').length,
      urgent: cards.filter(c => c.priority === 'urgent').length,
    };
    const completed = cards.filter(c => {
      const doneCol = columns.find(col => col.title.toLowerCase().includes('done'));
      return doneCol && c.column_id === doneCol.id;
    }).length;
    
    return { total, byColumn, byPriority, completed };
  }, [cards, columns]);
  
  return (
    <div className="statistics" style={{
      background: 'var(--bg-secondary)',
      padding: '1.5rem',
      borderRadius: '12px',
      marginBottom: '1rem'
    }}>
      <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem' }}>📊 Board Statistics</h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{
          background: 'var(--bg-primary)',
          padding: '1rem',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
            {stats.total}
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Total Cards
          </div>
        </div>
        <div style={{
          background: 'var(--bg-primary)',
          padding: '1rem',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10B981' }}>
            {stats.completed}
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Completed
          </div>
        </div>
        <div style={{
          background: 'var(--bg-primary)',
          padding: '1rem',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8B5CF6' }}>
            {((stats.completed / stats.total) * 100 || 0).toFixed(0)}%
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Progress
          </div>
        </div>
      </div>
      
      <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
        By Column
      </h4>
      <div style={{ marginBottom: '1.5rem' }}>
        {stats.byColumn.map(col => (
          <div key={col.name} style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '0.5rem',
            gap: '0.75rem'
          }}>
            <span style={{ 
              minWidth: '100px', 
              fontSize: '0.875rem',
              color: 'var(--text-secondary)'
            }}>
              {col.name}
            </span>
            <div style={{
              flex: 1,
              height: '24px',
              background: 'var(--bg-primary)',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${(col.count / stats.total) * 100 || 0}%`,
                height: '100%',
                background: 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                padding: '0 0.5rem',
                fontSize: '0.75rem',
                color: 'white',
                fontWeight: '500',
                minWidth: 'fit-content',
                boxSizing: 'border-box'
              }}>
                {col.count}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
        By Priority
      </h4>
      <div style={{
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap'
      }}>
        <span style={{ fontSize: '0.875rem' }}>🔴 Urgent: {stats.byPriority.urgent}</span>
        <span style={{ fontSize: '0.875rem' }}>🟠 High: {stats.byPriority.high}</span>
        <span style={{ fontSize: '0.875rem' }}>🔵 Medium: {stats.byPriority.medium}</span>
        <span style={{ fontSize: '0.875rem' }}>⚪ Low: {stats.byPriority.low}</span>
      </div>
    </div>
  );
}
