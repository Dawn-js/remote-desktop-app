import { useEffect } from 'react';

interface KeyboardShortcutsOptions {
  onNewTab?: () => void;
  onCloseTab?: () => void;
  onNewConnection?: () => void;
}

export function useKeyboardShortcuts(options: KeyboardShortcutsOptions = {}) {
  const { onNewTab, onCloseTab, onNewConnection } = options;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isCtrlOrMeta = event.ctrlKey || event.metaKey;

      if (!isCtrlOrMeta) return;

      switch (event.key.toLowerCase()) {
        case 't':
          event.preventDefault();
          onNewTab?.();
          break;
        case 'w':
          event.preventDefault();
          onCloseTab?.();
          break;
        case 'n':
          event.preventDefault();
          onNewConnection?.();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNewTab, onCloseTab, onNewConnection]);
}
