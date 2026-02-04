import { useEffect, useCallback, useRef } from 'react';

interface ShortcutHandler {
  key: string;
  handler: () => void;
  modifier?: 'ctrl' | 'shift' | 'alt' | 'meta';
  description?: string;
}

interface SequentialShortcut {
  sequence: string[];
  handler: () => void;
  timeout?: number;
  description?: string;
}

interface UseKeyboardShortcutsOptions {
  shortcuts?: ShortcutHandler[];
  sequential?: SequentialShortcut[];
  enabled?: boolean;
  preventDefault?: boolean;
}

export function useKeyboardShortcuts({
  shortcuts = [],
  sequential = [],
  enabled = true,
  preventDefault = true,
}: UseKeyboardShortcutsOptions) {
  const sequenceRef = useRef<string[]>([]);
  const sequenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Don't trigger shortcuts when typing in inputs, textareas, or content editable elements
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        // Allow some shortcuts even in inputs (like Ctrl+S, Ctrl+Enter)
        const allowedInInputs = ['ctrl+s', 'meta+s', 'ctrl+enter', 'meta+enter', 'escape'];
        const key = event.key.toLowerCase();
        const shortcutKey = `${event.ctrlKey || event.metaKey ? 'ctrl+' : ''}${event.shiftKey ? 'shift+' : ''}${key}`;

        if (!allowedInInputs.includes(shortcutKey) && !allowedInInputs.includes(key)) {
          return;
        }
      }

      const key = event.key.toLowerCase();

      // Handle regular shortcuts with modifiers
      for (const shortcut of shortcuts) {
        const matchesKey = shortcut.key.toLowerCase() === key;
        const matchesModifier =
          !shortcut.modifier ||
          (shortcut.modifier === 'ctrl' && (event.ctrlKey || event.metaKey)) ||
          (shortcut.modifier === 'meta' && event.metaKey) ||
          (shortcut.modifier === 'shift' && event.shiftKey) ||
          (shortcut.modifier === 'alt' && event.altKey);

        if (matchesKey && matchesModifier) {
          if (preventDefault) {
            event.preventDefault();
          }
          shortcut.handler();
          return;
        }
      }

      // Handle sequential shortcuts (like "g i" for go to inbox)
      if (sequential.length > 0 && !event.ctrlKey && !event.metaKey && !event.altKey) {
        // Clear existing timeout
        if (sequenceTimeoutRef.current) {
          clearTimeout(sequenceTimeoutRef.current);
        }

        // Add key to sequence
        sequenceRef.current.push(key);

        // Check if any sequential shortcut matches
        for (const seq of sequential) {
          if (seq.sequence.length === sequenceRef.current.length) {
            const matches = seq.sequence.every(
              (k, i) => k.toLowerCase() === sequenceRef.current[i]
            );

            if (matches) {
              if (preventDefault) {
                event.preventDefault();
              }
              seq.handler();
              sequenceRef.current = [];
              return;
            }
          }
        }

        // Set timeout to reset sequence
        sequenceTimeoutRef.current = setTimeout(() => {
          sequenceRef.current = [];
        }, sequential[0]?.timeout || 1000);
      }
    },
    [shortcuts, sequential, enabled, preventDefault]
  );

  useEffect(() => {
    if (enabled) {
      window.addEventListener('keydown', handleKeyPress);

      return () => {
        window.removeEventListener('keydown', handleKeyPress);
        if (sequenceTimeoutRef.current) {
          clearTimeout(sequenceTimeoutRef.current);
        }
      };
    }
  }, [enabled, handleKeyPress]);
}
