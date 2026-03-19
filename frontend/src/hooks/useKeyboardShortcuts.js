import { useEffect } from 'react';

export function useKeyboardShortcuts(handlers) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if typing in input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      // N = New card
      if (e.key === 'n' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        handlers.onNewCard?.();
      }
      
      // / = Focus search
      if (e.key === '/') {
        e.preventDefault();
        handlers.onFocusSearch?.();
      }
      
      // D = Toggle dark mode
      if (e.key === 'd' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        handlers.onToggleTheme?.();
      }
      
      // E = Export
      if (e.key === 'e' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        handlers.onExport?.();
      }
      
      // ? = Show shortcuts help
      if (e.key === '?') {
        e.preventDefault();
        handlers.onShowHelp?.();
      }
      
      // Esc = Close modal
      if (e.key === 'Escape') {
        handlers.onCloseModal?.();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
}
