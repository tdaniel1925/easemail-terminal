'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KeyboardShortcutsDialog({ open, onOpenChange }: KeyboardShortcutsDialogProps) {
  const shortcuts = [
    {
      category: 'Navigation',
      items: [
        { keys: ['j', 'k'], description: 'Move between emails' },
        { keys: ['o', 'Enter'], description: 'Open selected email' },
        { keys: ['u'], description: 'Return to inbox' },
        { keys: ['g', 'i'], description: 'Go to inbox' },
        { keys: ['g', 's'], description: 'Go to starred' },
        { keys: ['g', 't'], description: 'Go to sent' },
        { keys: ['g', 'd'], description: 'Go to drafts' },
        { keys: ['/'], description: 'Focus search' },
      ],
    },
    {
      category: 'Actions',
      items: [
        { keys: ['c'], description: 'Compose new email' },
        { keys: ['r'], description: 'Reply' },
        { keys: ['a'], description: 'Reply all' },
        { keys: ['f'], description: 'Forward' },
        { keys: ['s'], description: 'Star/unstar' },
        { keys: ['e'], description: 'Archive' },
        { keys: ['#'], description: 'Delete' },
        { keys: ['!'], description: 'Mark as spam' },
        { keys: ['Shift', 'i'], description: 'Mark as read' },
        { keys: ['Shift', 'u'], description: 'Mark as unread' },
        { keys: ['z'], description: 'Snooze' },
        { keys: ['l'], description: 'Apply label' },
      ],
    },
    {
      category: 'Selection',
      items: [
        { keys: ['x'], description: 'Select email' },
        { keys: ['*', 'a'], description: 'Select all' },
        { keys: ['*', 'n'], description: 'Deselect all' },
        { keys: ['*', 'r'], description: 'Select read' },
        { keys: ['*', 'u'], description: 'Select unread' },
        { keys: ['*', 's'], description: 'Select starred' },
      ],
    },
    {
      category: 'Composer',
      items: [
        { keys: ['Ctrl', 'Enter'], description: 'Send email' },
        { keys: ['Cmd', 'Enter'], description: 'Send email (Mac)' },
        { keys: ['Ctrl', 'S'], description: 'Save draft' },
        { keys: ['Cmd', 'S'], description: 'Save draft (Mac)' },
        { keys: ['Ctrl', 'Shift', 'S'], description: 'Schedule send' },
        { keys: ['Ctrl', 'B'], description: 'Bold text' },
        { keys: ['Ctrl', 'I'], description: 'Italic text' },
        { keys: ['Ctrl', '/'], description: 'Insert canned response' },
        { keys: ['Esc'], description: 'Close composer' },
      ],
    },
    {
      category: 'View',
      items: [
        { keys: ['v'], description: 'Toggle preview pane' },
        { keys: ['t'], description: 'Toggle thread view' },
        { keys: ['1'], description: 'Messages view' },
        { keys: ['2'], description: 'Threads view' },
      ],
    },
    {
      category: 'Application',
      items: [
        { keys: ['?'], description: 'Show shortcuts help' },
        { keys: ['Esc'], description: 'Close dialogs' },
        { keys: ['Ctrl', 'K'], description: 'Quick command' },
      ],
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Keyboard Shortcuts</DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Use these shortcuts to navigate and perform actions quickly
          </p>
        </DialogHeader>

        <ScrollArea className="mt-6 h-[calc(85vh-120px)]">
          <div className="space-y-8 pr-4">
            {shortcuts.map((section) => (
              <div key={section.category}>
                <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wide">
                  {section.category}
                </h3>
                <div className="space-y-2.5">
                  {section.items.map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <span className="text-sm text-foreground/90">
                        {shortcut.description}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {shortcut.keys.map((key, keyIndex) => (
                          <div key={keyIndex} className="flex items-center gap-1">
                            <Badge
                              variant="outline"
                              className="px-2.5 py-1 text-xs font-mono font-medium"
                            >
                              {key}
                            </Badge>
                            {keyIndex < shortcut.keys.length - 1 && (
                              <span className="text-xs text-muted-foreground">+</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start gap-2">
            <div className="text-blue-600 dark:text-blue-400 mt-0.5">ℹ</div>
            <div className="text-xs text-blue-900 dark:text-blue-100">
              <p className="font-medium mb-1">Pro Tips:</p>
              <ul className="space-y-0.5 list-disc list-inside">
                <li>Press <Badge variant="outline" className="px-1.5 py-0.5 text-[10px] font-mono">?</Badge> anytime to see this help</li>
                <li>Sequential shortcuts (like <Badge variant="outline" className="px-1.5 py-0.5 text-[10px] font-mono">g</Badge> then <Badge variant="outline" className="px-1.5 py-0.5 text-[10px] font-mono">i</Badge>) should be pressed in order</li>
                <li>Use <Badge variant="outline" className="px-1.5 py-0.5 text-[10px] font-mono">j</Badge> / <Badge variant="outline" className="px-1.5 py-0.5 text-[10px] font-mono">k</Badge> for Gmail-style navigation</li>
              </ul>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
