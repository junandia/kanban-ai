export function ShortcutsHelp({ onClose }) {
  const shortcuts = [
    { key: 'N', description: 'Create new card' },
    { key: '/', description: 'Focus search' },
    { key: 'D', description: 'Toggle dark/light mode' },
    { key: 'E', description: 'Export board' },
    { key: '?', description: 'Show this help' },
    { key: 'Esc', description: 'Close modal' },
  ];
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
        <div className="modal-header">
          <div className="modal-title">⌨️ Keyboard Shortcuts</div>
        </div>
        <div className="modal-body">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {shortcuts.map(shortcut => (
              <div key={shortcut.key} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.5rem',
                background: 'var(--bg-secondary)',
                borderRadius: '6px'
              }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  {shortcut.description}
                </span>
                <kbd style={{
                  padding: '0.25rem 0.5rem',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}>
                  {shortcut.key}
                </kbd>
              </div>
            ))}
          </div>
          <button 
            className="btn btn-primary" 
            onClick={onClose}
            style={{ width: '100%', marginTop: '1rem' }}
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}
