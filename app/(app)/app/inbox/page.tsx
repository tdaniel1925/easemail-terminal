'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from '@/components/ui/dropdown-menu';
import {
  Mail, Search, RefreshCw, PenSquare, Inbox,
  Send, Star, Trash2, Archive, Clock, Menu, Users, Newspaper, Bell, Sparkles,
  Reply, ReplyAll, Forward, LogOut, Loader2, X, Check, Minus, Tag, Shield, AlertTriangle,
  Calendar, UserCircle, Video, HelpCircle, PanelRightOpen, PanelRightClose, MoreHorizontal, FolderOpen, Tags
} from 'lucide-react';
import { formatDate, truncate } from '@/lib/utils';
import Link from 'next/link';
import { EmailComposer } from '@/components/features/email-composer';
import { MobileNav } from '@/components/layout/mobile-nav';
import { KeyboardShortcutsDialog } from '@/components/features/keyboard-shortcuts-dialog';
import { CommandPalette } from '@/components/features/command-palette';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { toast } from 'sonner';
import DOMPurify from 'dompurify';
import {
  requestNotificationPermission,
  canShowNotifications,
  showEmailNotification,
  showBulkEmailNotification,
  loadNotificationPreferences,
  type NotificationPreferences,
} from '@/lib/notifications';

type EmailCategory = 'people' | 'newsletters' | 'notifications';

export default function InboxPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const folderParam = searchParams.get('folder');
  const filterParam = searchParams.get('filter'); // Support both filter and folder params
  const composeParam = searchParams.get('compose');
  const accountIdParam = searchParams.get('accountId'); // Get selected account from URL

  // Use filter or folder param (filter takes priority for backward compatibility)
  const activeFolderFilter = filterParam || folderParam;

  const [messages, setMessages] = useState<any[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [composing, setComposing] = useState(false);
  const [replyMode, setReplyMode] = useState<{ mode: 'reply' | 'replyAll' | 'forward'; message: any } | null>(null);
  const [categories, setCategories] = useState<Record<string, EmailCategory>>({});
  const [categorizing, setCategorizing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'all' | EmailCategory>('all');
  const [loggingOut, setLoggingOut] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set());
  const [bulkActionInProgress, setBulkActionInProgress] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [viewMode, setViewMode] = useState<'messages' | 'threads'>('messages');
  const [expandedThreads, setExpandedThreads] = useState<Set<string>>(new Set());
  const [threadMessages, setThreadMessages] = useState<Record<string, any[]>>({});
  const [accounts, setAccounts] = useState<any[]>([]);

  // Snooze state
  const [showSnooze, setShowSnooze] = useState(false);
  const [snoozeMessageId, setSnoozeMessageId] = useState<string | null>(null);
  const [snoozeUntil, setSnoozeUntil] = useState('');
  const [snoozing, setSnoozing] = useState(false);

  // Labels state
  const [labels, setLabels] = useState<any[]>([]);
  const [showLabels, setShowLabels] = useState(false);
  const [labelMessageId, setLabelMessageId] = useState<string | null>(null);
  const [messageLabels, setMessageLabels] = useState<Record<string, any[]>>({});
  const [showCreateLabel, setShowCreateLabel] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('#3B82F6');

  // Spam state
  const [detectingSpam, setDetectingSpam] = useState(false);

  // Notification state
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences | null>(null);
  const [showNotificationBanner, setShowNotificationBanner] = useState(false);
  const previousMessageCountRef = useRef<number>(0);

  // Preview pane state
  const [showPreviewPane, setShowPreviewPane] = useState(false);

  // Keyboard shortcuts state
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Infinite scroll ref
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const fetchAccounts = useCallback(async () => {
    try {
      const response = await fetch('/api/email-accounts');
      const data = await response.json();

      if (data.accounts) {
        setAccounts(data.accounts);

        // If no accountId in URL, add the primary account
        if (!accountIdParam && data.accounts.length > 0) {
          const primary = data.accounts.find((a: any) => a.is_primary);
          if (primary) {
            const currentParams = new URLSearchParams(searchParams.toString());
            currentParams.set('accountId', primary.id);
            router.replace(`${pathname}?${currentParams.toString()}`);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
    }
  }, [accountIdParam, searchParams, pathname, router]);

  const fetchMessages = useCallback(async (reset: boolean = true) => {
    try {
      if (reset) {
        setLoading(true);
      }

      // Choose endpoint based on selected account from URL
      let endpoint = '/api/messages';
      if (accountIdParam) {
        endpoint = `/api/messages?accountId=${accountIdParam}`;
      }

      // Add folder filtering (supports both filter and folder params)
      if (activeFolderFilter) {
        console.log('Filtering by folder/filter:', activeFolderFilter);
        endpoint += `${endpoint.includes('?') ? '&' : '?'}folder=${encodeURIComponent(activeFolderFilter)}`;
      }

      console.log('Fetching messages from:', endpoint);
      const response = await fetch(endpoint);
      const data = await response.json();

      if (data.messages) {
        setMessages(data.messages);
        setNextCursor(data.nextCursor || null);
        setHasMore(!!data.nextCursor);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  }, [activeFolderFilter, accountIdParam]);

  const loadMoreMessages = async () => {
    if (!nextCursor || loadingMore) return;

    try {
      setLoadingMore(true);

      // Build endpoint with folder parameter if present
      let endpoint = `/api/messages?page_token=${encodeURIComponent(nextCursor)}`;
      if (accountIdParam) {
        endpoint = `/api/messages?accountId=${accountIdParam}&page_token=${encodeURIComponent(nextCursor)}`;
      }

      // Add folder parameter
      if (activeFolderFilter) {
        endpoint += `&folder=${encodeURIComponent(activeFolderFilter)}`;
      }

      const response = await fetch(endpoint);
      const data = await response.json();

      if (data.messages) {
        // Append new messages to existing list
        setMessages(prevMessages => [...prevMessages, ...data.messages]);
        setNextCursor(data.nextCursor || null);
        setHasMore(!!data.nextCursor);
      }
    } catch (error) {
      console.error('Failed to load more messages:', error);
      toast.error('Failed to load more messages');
    } finally {
      setLoadingMore(false);
    }
  };

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/messages/categorize');
      const data = await response.json();

      if (data.categories) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  }, []);

  const runCategorization = async () => {
    try {
      setCategorizing(true);
      toast.info('Categorizing emails with AI...');
      const response = await fetch('/api/messages/categorize', {
        method: 'POST',
      });
      const data = await response.json();

      if (data.categories) {
        setCategories(data.categories);
        toast.success('✨ Emails categorized!');
      }
    } catch (error) {
      console.error('Failed to categorize:', error);
      toast.error('Failed to categorize emails');
    } finally {
      setCategorizing(false);
    }
  };

  const getFilteredMessages = () => {
    // If searching, return search results
    if (searchQuery && searchResults.length >= 0) {
      return searchResults;
    }

    // Otherwise filter by category
    if (selectedCategory === 'all') {
      return messages;
    }
    return messages.filter(msg => categories[msg.id] === selectedCategory);
  };

  const getCategoryCount = (category: EmailCategory) => {
    return messages.filter(msg => categories[msg.id] === category).length;
  };

  const getCategoryBadgeColor = (category: EmailCategory) => {
    switch (category) {
      case 'people':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-300';
      case 'newsletters':
        return 'bg-purple-500/10 text-purple-700 dark:text-purple-300';
      case 'notifications':
        return 'bg-orange-500/10 text-orange-700 dark:text-orange-300';
      default:
        return '';
    }
  };

  const filteredMessages = getFilteredMessages();

  const getInitials = (name?: string, email?: string) => {
    if (name && typeof name === 'string' && name.trim().length > 0) {
      const parts = name.trim().split(/\s+/).filter(p => p.length > 0);
      if (parts.length > 0) {
        return parts
          .slice(0, 2)
          .map(p => p[0] || '')
          .join('')
          .toUpperCase() || '?';
      }
    }
    if (email && typeof email === 'string' && email.length > 0) {
      return email[0].toUpperCase();
    }
    return '?';
  };

  const handleReply = (message: any, replyAll: boolean = false) => {
    const recipients = replyAll
      ? [
          message.from?.[0]?.email,
          ...(message.to?.map((r: any) => r.email) || []),
          ...(message.cc?.map((r: any) => r.email) || []),
        ].filter((email, index, self) => email && self.indexOf(email) === index) // Remove duplicates
      : [message.from?.[0]?.email];

    setReplyMode({
      mode: replyAll ? 'replyAll' : 'reply',
      message: {
        messageId: message.id,
        to: recipients,
        subject: message.subject,
        body: message.body || message.snippet,
        from: message.from?.[0]?.name || message.from?.[0]?.email,
        date: message.date,
        replyAll,
      },
    });
  };

  const handleForward = (message: any) => {
    setReplyMode({
      mode: 'forward',
      message: {
        to: '',
        subject: message.subject,
        body: message.body || message.snippet,
        from: message.from?.[0]?.name || message.from?.[0]?.email,
        date: message.date,
        isForward: true,
      },
    });
  };

  const handleDelete = async (messageId: string, permanent: boolean = false) => {
    try {
      const response = await fetch(`/api/messages/${messageId}?permanent=${permanent}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(permanent ? '🗑️ Message permanently deleted' : '🗑️ Message moved to trash');
        // Remove from local state
        setMessages(messages.filter(m => m.id !== messageId));
        if (selectedMessage?.id === messageId) {
          setSelectedMessage(null);
        }
      } else {
        toast.error(data.error || 'Failed to delete message');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete message');
    }
  };

  const handleToggleRead = async (messageId: string, currentUnread: boolean) => {
    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unread: !currentUnread }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(currentUnread ? '📧 Marked as read' : '✉️ Marked as unread');
        // Update local state
        setMessages(messages.map(m =>
          m.id === messageId ? { ...m, unread: !currentUnread } : m
        ));
        if (selectedMessage?.id === messageId) {
          setSelectedMessage({ ...selectedMessage, unread: !currentUnread });
        }
      } else {
        toast.error(data.error || 'Failed to update message');
      }
    } catch (error) {
      console.error('Toggle read error:', error);
      toast.error('Failed to update message');
    }
  };

  const handleToggleStar = async (messageId: string, currentStarred: boolean) => {
    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ starred: !currentStarred }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(currentStarred ? 'Unstarred' : '⭐ Starred');
        // Update local state
        setMessages(messages.map(m =>
          m.id === messageId ? { ...m, starred: !currentStarred } : m
        ));
        if (selectedMessage?.id === messageId) {
          setSelectedMessage({ ...selectedMessage, starred: !currentStarred });
        }
      } else {
        toast.error(data.error || 'Failed to update message');
      }
    } catch (error) {
      console.error('Toggle star error:', error);
      toast.error('Failed to update message');
    }
  };

  const handleArchive = async (messageId: string) => {
    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folders: ['archive'] }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('📦 Message archived');
        // Remove from inbox view
        setMessages(messages.filter(m => m.id !== messageId));
        if (selectedMessage?.id === messageId) {
          setSelectedMessage(null);
        }
      } else {
        toast.error(data.error || 'Failed to archive message');
      }
    } catch (error) {
      console.error('Archive error:', error);
      toast.error('Failed to archive message');
    }
  };

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (response.ok) {
        toast.success('👋 Logged out successfully');
        // Redirect to login page
        window.location.href = '/login';
      } else {
        toast.error('Failed to logout');
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    } finally {
      setLoggingOut(false);
    }
  };

  const parseSearchQuery = (query: string) => {
    const params: any = {};
    let remainingQuery = query;

    // Extract operators: from:, to:, subject:, has:, is:
    const operators = [
      { pattern: /from:(\S+)/g, key: 'from' },
      { pattern: /to:(\S+)/g, key: 'to' },
      { pattern: /subject:"([^"]+)"|subject:(\S+)/g, key: 'subject' },
      { pattern: /has:attachment/g, key: 'has_attachment', value: 'true' },
      { pattern: /is:unread/g, key: 'unread', value: 'true' },
      { pattern: /is:read/g, key: 'unread', value: 'false' },
      { pattern: /is:starred/g, key: 'starred', value: 'true' },
    ];

    operators.forEach(({ pattern, key, value }) => {
      const matches = [...remainingQuery.matchAll(pattern)];
      if (matches.length > 0) {
        if (value) {
          params[key] = value;
        } else {
          // For from:, to:, subject: - get the captured group
          params[key] = matches[0][1] || matches[0][2]; // Handle both quoted and unquoted
        }
        // Remove the operator from the remaining query
        remainingQuery = remainingQuery.replace(pattern, '').trim();
      }
    });

    // Add remaining text as general query
    if (remainingQuery.trim()) {
      params.q = remainingQuery.trim();
    }

    return params;
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setSearchQuery('');
      return;
    }

    try {
      setSearching(true);
      setSearchQuery(query);

      // Parse search query for operators
      const searchParams = parseSearchQuery(query);

      // Build query string
      const queryString = new URLSearchParams(searchParams).toString();

      const response = await fetch(`/api/messages/search?${queryString}`);
      const data = await response.json();

      if (response.ok && data.messages) {
        setSearchResults(data.messages);
        toast.success(`Found ${data.messages.length} result(s)`);
      } else {
        toast.error(data.error || 'Search failed');
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to search messages');
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  // Snooze handlers
  const fetchLabels = useCallback(async () => {
    try {
      const response = await fetch('/api/labels');
      const data = await response.json();
      if (response.ok && data.labels) {
        setLabels(data.labels);
      }
    } catch (error) {
      console.error('Failed to fetch labels:', error);
    }
  }, []);

  // Effects - placed after function definitions
  useEffect(() => {
    fetchAccounts();
    fetchMessages();
    fetchCategories();
    fetchLabels();

    // Auto-refresh inbox every 60 seconds (only when page is visible)
    const refreshInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchMessages(false); // Silent refresh without loading state
      }
    }, 60000);

    // Refetch when page becomes visible after being hidden
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchMessages(false);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(refreshInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchAccounts, fetchMessages, fetchCategories, fetchLabels]);

  // Notification setup and monitoring
  useEffect(() => {
    // Load notification preferences
    const prefs = loadNotificationPreferences();
    setNotificationPrefs(prefs);

    // Check if we should request notification permission
    if (prefs.enabled && !canShowNotifications() && Notification.permission === 'default') {
      setShowNotificationBanner(true);
    }

    // Initialize previous message count
    previousMessageCountRef.current = messages.length;
  }, []);

  // Monitor for new messages and show notifications
  useEffect(() => {
    if (!notificationPrefs?.enabled || !canShowNotifications()) {
      return;
    }

    // Check if we have new messages
    const currentCount = messages.length;
    const previousCount = previousMessageCountRef.current;

    if (currentCount > previousCount && previousCount > 0) {
      // We have new messages!
      const newMessagesCount = currentCount - previousCount;
      const newMessages = messages.slice(0, newMessagesCount);

      // Filter to unread messages only
      const unreadNewMessages = newMessages.filter(m => m.unread);

      if (unreadNewMessages.length > 0) {
        // Show notification based on count
        if (unreadNewMessages.length === 1) {
          const msg = unreadNewMessages[0];
          const from = msg.from?.[0]?.name || msg.from?.[0]?.email || 'Unknown';
          const subject = msg.subject || '(No subject)';
          const snippet = msg.snippet ? truncate(msg.snippet, 100) : '';

          showEmailNotification({
            from,
            subject,
            snippet: notificationPrefs.showPreview ? snippet : undefined,
            silent: notificationPrefs.silent,
            onClick: () => {
              setSelectedMessage(msg);
              window.focus();
            },
          });
        } else {
          showBulkEmailNotification(unreadNewMessages.length, () => {
            window.focus();
          });
        }
      }
    }

    // Update the previous count
    previousMessageCountRef.current = currentCount;
  }, [messages, notificationPrefs]);

  // Handle compose query parameter
  useEffect(() => {
    if (composeParam === 'true') {
      setComposing(true);
      // Remove the query parameter from URL to prevent reopening on refresh
      const url = new URL(window.location.href);
      url.searchParams.delete('compose');
      window.history.replaceState({}, '', url.toString());
    }
  }, [composeParam]);

  // Handle search from URL parameter (from chatbot)
  useEffect(() => {
    const searchParam = searchParams.get('search');
    if (searchParam && searchParam !== searchQuery) {
      handleSearch(searchParam);
    }
  }, [searchParams]);

  // Clear search when account or folder changes
  useEffect(() => {
    clearSearch();
  }, [accountIdParam, activeFolderFilter]);

  useEffect(() => {
    // Refetch messages when account or folder changes
    fetchMessages(true);
  }, [activeFolderFilter, accountIdParam, fetchMessages]);

  // Infinite scroll with IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore && !loadingMore && !loading) {
          loadMoreMessages();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMore, loadingMore, loading]); // Removed loadMoreMessages from deps to prevent infinite loop

  const handleSnooze = async (messageId: string) => {
    setSnoozeMessageId(messageId);
    setShowSnooze(true);
  };

  const confirmSnooze = async () => {
    if (!snoozeMessageId || !snoozeUntil) {
      toast.error('Please select a time');
      return;
    }

    try {
      setSnoozing(true);
      const message = messages.find(m => m.id === snoozeMessageId);

      const response = await fetch('/api/snooze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId: snoozeMessageId,
          threadId: message?.thread_id,
          snoozeUntil,
          originalFolder: 'inbox',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        setMessages(messages.filter(m => m.id !== snoozeMessageId));
        setShowSnooze(false);
        setSnoozeMessageId(null);
        setSnoozeUntil('');
      } else {
        toast.error(data.error || 'Failed to snooze');
      }
    } catch (error) {
      console.error('Snooze error:', error);
      toast.error('Failed to snooze email');
    } finally {
      setSnoozing(false);
    }
  };

  const quickSnooze = async (messageId: string, hours: number) => {
    const snoozeDate = new Date();
    snoozeDate.setHours(snoozeDate.getHours() + hours);

    try {
      const message = messages.find(m => m.id === messageId);

      const response = await fetch('/api/snooze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId,
          threadId: message?.thread_id,
          snoozeUntil: snoozeDate.toISOString(),
          originalFolder: 'inbox',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Snoozed for ${hours} hour(s)`);
        setMessages(messages.filter(m => m.id !== messageId));
      } else {
        toast.error(data.error || 'Failed to snooze');
      }
    } catch (error) {
      console.error('Quick snooze error:', error);
      toast.error('Failed to snooze email');
    }
  };

  // Label handlers
  const handleApplyLabel = async (messageId: string) => {
    setLabelMessageId(messageId);
    setShowLabels(true);

    // Fetch current labels for this message
    try {
      const response = await fetch(`/api/messages/${messageId}/labels`);
      const data = await response.json();
      if (response.ok && data.labels) {
        setMessageLabels(prev => ({ ...prev, [messageId]: data.labels }));
      }
    } catch (error) {
      console.error('Failed to fetch message labels:', error);
    }
  };

  const toggleLabelOnMessage = async (labelId: string) => {
    if (!labelMessageId) return;

    const currentLabels = messageLabels[labelMessageId] || [];
    const hasLabel = currentLabels.some((l: any) => l.id === labelId);

    try {
      if (hasLabel) {
        // Remove label
        const response = await fetch(`/api/messages/${labelMessageId}/labels?labelId=${labelId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setMessageLabels(prev => ({
            ...prev,
            [labelMessageId]: currentLabels.filter((l: any) => l.id !== labelId),
          }));
          toast.success('Label removed');
        }
      } else {
        // Add label
        const response = await fetch(`/api/messages/${labelMessageId}/labels`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ labelId }),
        });

        const data = await response.json();

        if (response.ok) {
          const label = labels.find(l => l.id === labelId);
          setMessageLabels(prev => ({
            ...prev,
            [labelMessageId]: [...currentLabels, label],
          }));
          toast.success('Label added');
        }
      }
    } catch (error) {
      console.error('Toggle label error:', error);
      toast.error('Failed to update label');
    }
  };

  const createLabel = async () => {
    if (!newLabelName.trim()) {
      toast.error('Label name is required');
      return;
    }

    try {
      const response = await fetch('/api/labels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newLabelName,
          color: newLabelColor,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Label created');
        setLabels([...labels, data.label]);
        setNewLabelName('');
        setNewLabelColor('#3B82F6');
        setShowCreateLabel(false);
      } else {
        toast.error(data.error || 'Failed to create label');
      }
    } catch (error) {
      console.error('Create label error:', error);
      toast.error('Failed to create label');
    }
  };

  // Spam handlers
  const detectSpam = async (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (!message) return;

    try {
      setDetectingSpam(true);
      const response = await fetch('/api/spam/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId,
          subject: message.subject,
          body: message.snippet || message.body,
          senderEmail: message.from?.[0]?.email,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.isSpam) {
          toast.warning(`⚠️ Spam detected (${data.spamScore}% confidence)\n${data.reasons[0] || ''}`, {
            duration: 5000,
          });
        } else {
          toast.success('✅ Message appears safe');
        }
      }
    } catch (error) {
      console.error('Spam detection error:', error);
    } finally {
      setDetectingSpam(false);
    }
  };

  const reportSpam = async (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (!message) return;

    try {
      const response = await fetch('/api/spam/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId,
          senderEmail: message.from?.[0]?.email,
          subject: message.subject,
          isSpam: true,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('🛡️ Reported as spam and moved to spam folder');
        setMessages(messages.filter(m => m.id !== messageId));
        if (selectedMessage?.id === messageId) {
          setSelectedMessage(null);
        }
      } else {
        toast.error(data.error || 'Failed to report spam');
      }
    } catch (error) {
      console.error('Report spam error:', error);
      toast.error('Failed to report spam');
    }
  };

  // Bulk selection handlers
  const toggleMessageSelection = (messageId: string) => {
    const newSelection = new Set(selectedMessages);
    if (newSelection.has(messageId)) {
      newSelection.delete(messageId);
    } else {
      newSelection.add(messageId);
    }
    setSelectedMessages(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedMessages.size === filteredMessages.length && filteredMessages.length > 0) {
      setSelectedMessages(new Set());
    } else {
      const allIds = new Set(filteredMessages.map(m => m.id));
      setSelectedMessages(allIds);
    }
  };

  const clearSelection = () => {
    setSelectedMessages(new Set());
  };

  // Bulk operations
  const handleBulkDelete = async () => {
    if (selectedMessages.size === 0) return;

    try {
      setBulkActionInProgress(true);
      const messageIds = Array.from(selectedMessages);

      // Delete all selected messages
      await Promise.all(
        messageIds.map(id =>
          fetch(`/api/messages/${id}?permanent=false`, { method: 'DELETE' })
        )
      );

      toast.success(`🗑️ ${messageIds.length} message(s) moved to trash`);

      // Update local state
      setMessages(messages.filter(m => !selectedMessages.has(m.id)));
      setSearchResults(searchResults.filter(m => !selectedMessages.has(m.id)));
      clearSelection();

      if (selectedMessage && selectedMessages.has(selectedMessage.id)) {
        setSelectedMessage(null);
      }
    } catch (error) {
      console.error('Bulk delete error:', error);
      toast.error('Failed to delete some messages');
    } finally {
      setBulkActionInProgress(false);
    }
  };

  const handleBulkArchive = async () => {
    if (selectedMessages.size === 0) return;

    try {
      setBulkActionInProgress(true);
      const messageIds = Array.from(selectedMessages);

      await Promise.all(
        messageIds.map(id =>
          fetch(`/api/messages/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ folders: ['archive'] }),
          })
        )
      );

      toast.success(`📦 ${messageIds.length} message(s) archived`);

      setMessages(messages.filter(m => !selectedMessages.has(m.id)));
      setSearchResults(searchResults.filter(m => !selectedMessages.has(m.id)));
      clearSelection();

      if (selectedMessage && selectedMessages.has(selectedMessage.id)) {
        setSelectedMessage(null);
      }
    } catch (error) {
      console.error('Bulk archive error:', error);
      toast.error('Failed to archive some messages');
    } finally {
      setBulkActionInProgress(false);
    }
  };

  const handleBulkMarkRead = async (unread: boolean) => {
    if (selectedMessages.size === 0) return;

    try {
      setBulkActionInProgress(true);
      const messageIds = Array.from(selectedMessages);

      await Promise.all(
        messageIds.map(id =>
          fetch(`/api/messages/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ unread }),
          })
        )
      );

      toast.success(`📧 ${messageIds.length} message(s) marked as ${unread ? 'unread' : 'read'}`);

      // Update local state
      setMessages(messages.map(m =>
        selectedMessages.has(m.id) ? { ...m, unread } : m
      ));
      setSearchResults(searchResults.map(m =>
        selectedMessages.has(m.id) ? { ...m, unread } : m
      ));
      clearSelection();
    } catch (error) {
      console.error('Bulk mark read error:', error);
      toast.error('Failed to update some messages');
    } finally {
      setBulkActionInProgress(false);
    }
  };

  const handleBulkStar = async (starred: boolean) => {
    if (selectedMessages.size === 0) return;

    try {
      setBulkActionInProgress(true);
      const messageIds = Array.from(selectedMessages);

      await Promise.all(
        messageIds.map(id =>
          fetch(`/api/messages/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ starred }),
          })
        )
      );

      toast.success(`⭐ ${messageIds.length} message(s) ${starred ? 'starred' : 'unstarred'}`);

      setMessages(messages.map(m =>
        selectedMessages.has(m.id) ? { ...m, starred } : m
      ));
      setSearchResults(searchResults.map(m =>
        selectedMessages.has(m.id) ? { ...m, starred } : m
      ));
      clearSelection();
    } catch (error) {
      console.error('Bulk star error:', error);
      toast.error('Failed to update some messages');
    } finally {
      setBulkActionInProgress(false);
    }
  };

  const handleBulkMoveToFolder = async (folder: string) => {
    if (selectedMessages.size === 0) return;

    try {
      setBulkActionInProgress(true);
      const messageIds = Array.from(selectedMessages);

      await Promise.all(
        messageIds.map(id =>
          fetch(`/api/messages/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ folders: [folder] }),
          })
        )
      );

      toast.success(`📁 ${messageIds.length} message(s) moved to ${folder}`);

      // Remove from current view if not inbox
      setMessages(messages.filter(m => !selectedMessages.has(m.id)));
      setSearchResults(searchResults.filter(m => !selectedMessages.has(m.id)));
      clearSelection();
    } catch (error) {
      console.error('Bulk move error:', error);
      toast.error('Failed to move some messages');
    } finally {
      setBulkActionInProgress(false);
    }
  };

  const handleBulkApplyLabel = async (labelId: string, labelName: string) => {
    if (selectedMessages.size === 0) return;

    try {
      setBulkActionInProgress(true);
      const messageIds = Array.from(selectedMessages);

      await Promise.all(
        messageIds.map(id =>
          fetch(`/api/messages/${id}/labels`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ labelId }),
          })
        )
      );

      toast.success(`🏷️ Label "${labelName}" applied to ${messageIds.length} message(s)`);
      clearSelection();
    } catch (error) {
      console.error('Bulk apply label error:', error);
      toast.error('Failed to apply label to some messages');
    } finally {
      setBulkActionInProgress(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    // Get all unread messages in current view
    const unreadMessages = filteredMessages.filter(m => m.unread);

    if (unreadMessages.length === 0) {
      toast.info('No unread messages to mark as read');
      return;
    }

    try {
      setBulkActionInProgress(true);
      const messageIds = unreadMessages.map(m => m.id);

      await Promise.all(
        messageIds.map(id =>
          fetch(`/api/messages/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ unread: false }),
          })
        )
      );

      toast.success(`✓ ${messageIds.length} message(s) marked as read`);

      // Update local state
      setMessages(messages.map(m =>
        messageIds.includes(m.id) ? { ...m, unread: false } : m
      ));
      setSearchResults(searchResults.map(m =>
        messageIds.includes(m.id) ? { ...m, unread: false } : m
      ));
    } catch (error) {
      console.error('Mark all as read error:', error);
      toast.error('Failed to mark all messages as read');
    } finally {
      setBulkActionInProgress(false);
    }
  };

  // Threading functions
  const groupMessagesByThread = () => {
    const threads = new Map<string, any[]>();

    filteredMessages.forEach((message) => {
      const threadId = message.thread_id || message.id;
      if (!threads.has(threadId)) {
        threads.set(threadId, []);
      }
      const thread = threads.get(threadId);
      if (thread) {
        thread.push(message);
      }
    });

    // Sort messages within each thread by date (oldest first)
    threads.forEach((messages, threadId) => {
      messages.sort((a, b) => (a.date || 0) - (b.date || 0));
    });

    return threads;
  };

  const toggleThread = async (threadId: string) => {
    const newExpanded = new Set(expandedThreads);

    if (newExpanded.has(threadId)) {
      newExpanded.delete(threadId);
      setExpandedThreads(newExpanded);
    } else {
      newExpanded.add(threadId);
      setExpandedThreads(newExpanded);

      // Fetch thread messages if not already loaded
      if (!threadMessages[threadId]) {
        try {
          const response = await fetch(`/api/threads/${threadId}`);
          const data = await response.json();

          if (response.ok && data.messages) {
            setThreadMessages(prev => ({
              ...prev,
              [threadId]: data.messages.sort((a: any, b: any) => a.date - b.date),
            }));
          }
        } catch (error) {
          console.error('Failed to fetch thread messages:', error);
          toast.error('Failed to load thread messages');
        }
      }
    }
  };

  const getThreadPreview = (thread: any[]) => {
    // Return the most recent message
    return thread[thread.length - 1];
  };

  const getDisplayItems = () => {
    if (viewMode === 'messages') {
      return filteredMessages.map(msg => ({ type: 'message' as const, data: msg }));
    } else {
      const threads = groupMessagesByThread();
      return Array.from(threads.entries()).map(([threadId, messages]) => ({
        type: 'thread' as const,
        threadId,
        messages,
        preview: getThreadPreview(messages),
      }));
    }
  };

  // Keyboard shortcuts
  useKeyboardShortcuts({
    shortcuts: [
      // Command palette
      { key: 'k', modifier: 'ctrl', handler: () => setShowCommandPalette(true), description: 'Command palette' },

      // Navigation
      { key: 'j', handler: () => setSelectedIndex(prev => Math.min(prev + 1, filteredMessages.length - 1)), description: 'Next email' },
      { key: 'k', handler: () => setSelectedIndex(prev => Math.max(prev - 1, 0)), description: 'Previous email' },
      { key: 'o', handler: () => filteredMessages[selectedIndex] && setSelectedMessage(filteredMessages[selectedIndex]), description: 'Open email' },
      { key: 'u', handler: () => setSelectedMessage(null), description: 'Back to list' },
      { key: '/', handler: () => (document.querySelector('input[placeholder*="Search"]') as HTMLInputElement)?.focus(), description: 'Focus search' },

      // Actions
      { key: 'c', handler: () => setComposing(true), description: 'Compose' },
      { key: 'r', handler: () => selectedMessage && handleReply(selectedMessage, false), description: 'Reply' },
      { key: 'a', handler: () => selectedMessage && handleReply(selectedMessage, true), description: 'Reply all' },
      { key: 'f', handler: () => selectedMessage && handleForward(selectedMessage), description: 'Forward' },
      { key: 's', handler: () => selectedMessage && handleToggleStar(selectedMessage.id, selectedMessage.starred || false), description: 'Star' },
      { key: 'e', handler: () => selectedMessage && handleArchive(selectedMessage.id), description: 'Archive' },
      { key: '#', handler: () => selectedMessage && handleDelete(selectedMessage.id, false), description: 'Delete' },
      { key: 'z', handler: () => selectedMessage && handleSnooze(selectedMessage.id), description: 'Snooze' },

      // View
      { key: 'v', handler: () => setShowPreviewPane(prev => !prev), description: 'Toggle preview' },
      { key: 't', handler: () => setViewMode(prev => prev === 'messages' ? 'threads' : 'messages'), description: 'Toggle threads' },
      { key: '1', handler: () => setViewMode('messages'), description: 'Messages view' },
      { key: '2', handler: () => setViewMode('threads'), description: 'Threads view' },

      // Selection
      { key: 'x', handler: () => {
        const msg = filteredMessages[selectedIndex];
        if (msg) {
          const newSelected = new Set(selectedMessages);
          if (newSelected.has(msg.id)) {
            newSelected.delete(msg.id);
          } else {
            newSelected.add(msg.id);
          }
          setSelectedMessages(newSelected);
        }
      }, description: 'Select email' },

      // Help
      { key: '?', handler: () => setShowKeyboardShortcuts(true), description: 'Show shortcuts' },
      { key: 'escape', handler: () => {
        if (showKeyboardShortcuts) setShowKeyboardShortcuts(false);
        else if (selectedMessage) setSelectedMessage(null);
      }, description: 'Close/back' },
    ],
    sequential: [
      { sequence: ['g', 'i'], handler: () => window.location.href = '/app/inbox', description: 'Go to inbox' },
      { sequence: ['g', 's'], handler: () => window.location.href = '/app/inbox?filter=starred', description: 'Go to starred' },
      { sequence: ['g', 't'], handler: () => window.location.href = '/app/inbox?filter=sent', description: 'Go to sent' },
      { sequence: ['g', 'd'], handler: () => window.location.href = '/app/inbox?filter=drafts', description: 'Go to drafts' },
      { sequence: ['*', 'a'], handler: () => setSelectedMessages(new Set(filteredMessages.map(m => m.id))), description: 'Select all' },
      { sequence: ['*', 'n'], handler: () => setSelectedMessages(new Set()), description: 'Deselect all' },
      { sequence: ['*', 'r'], handler: () => setSelectedMessages(new Set(filteredMessages.filter(m => !m.unread).map(m => m.id))), description: 'Select read' },
      { sequence: ['*', 'u'], handler: () => setSelectedMessages(new Set(filteredMessages.filter(m => m.unread).map(m => m.id))), description: 'Select unread' },
      { sequence: ['*', 's'], handler: () => setSelectedMessages(new Set(filteredMessages.filter(m => m.starred).map(m => m.id))), description: 'Select starred' },
    ],
    enabled: !composing,
  });

  return (
    <div className="flex h-full flex-col bg-background pt-16 lg:pt-0">
      {/* Mobile Navigation */}
      <MobileNav
        onCompose={() => setComposing(true)}
        labels={labels}
        accounts={accounts}
      />

      {/* Header */}
      <header className="border-b border-border bg-card p-4 lg:block hidden">
          <div className="flex items-center gap-4 justify-end">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => fetchMessages(true)}>
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh messages</TooltipContent>
            </Tooltip>
            <Button
              onClick={() => setComposing(true)}
              className="ml-2"
            >
              <PenSquare className="mr-2 h-4 w-4" />
              Compose
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              disabled={loggingOut}
            >
              {loggingOut ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </>
              )}
            </Button>
          </div>
      </header>

      {/* Notification Permission Banner */}
      {showNotificationBanner && (
        <div className="bg-primary/10 border-b border-border p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Enable desktop notifications</p>
                <p className="text-xs text-muted-foreground">Get notified when new emails arrive, even when you're away</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={async () => {
                  const permission = await requestNotificationPermission();
                  if (permission === 'granted') {
                    toast.success('Notifications enabled!');
                    setShowNotificationBanner(false);
                  } else {
                    toast.error('Notification permission denied');
                  }
                }}
              >
                Enable
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNotificationBanner(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Email List - With Preview Pane Support */}
      <div className="flex-1 flex overflow-hidden">
        {/* Email List */}
        <div className={`bg-card border-r ${showPreviewPane ? 'w-full lg:w-1/2' : 'w-full'}`}>
            {/* Search Results Header */}
            {searchQuery && (
              <div className="p-3 border-b border-border bg-accent/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      Search results for "{searchQuery}"
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSearch}
                    className="h-7 text-xs"
                  >
                    Clear
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {filteredMessages.length} result(s) found
                </p>
              </div>
            )}

            {/* Bulk Actions Toolbar */}
            {selectedMessages.size > 0 ? (
              <div className="p-3 border-b border-border bg-primary/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearSelection}
                      className="h-8"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Clear ({selectedMessages.size})
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleBulkMarkRead(false)}
                      disabled={bulkActionInProgress}
                      className="h-8"
                    >
                      <Mail className="h-4 w-4 mr-1" />
                      Read
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleBulkMarkRead(true)}
                      disabled={bulkActionInProgress}
                      className="h-8"
                    >
                      <Mail className="h-4 w-4 mr-1" />
                      Unread
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleBulkStar(true)}
                      disabled={bulkActionInProgress}
                      className="h-8"
                    >
                      <Star className="h-4 w-4 mr-1" />
                      Star
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleBulkArchive}
                      disabled={bulkActionInProgress}
                      className="h-8"
                    >
                      <Archive className="h-4 w-4 mr-1" />
                      Archive
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleBulkDelete}
                      disabled={bulkActionInProgress}
                      className="h-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={bulkActionInProgress}
                          className="h-8"
                        >
                          <MoreHorizontal className="h-4 w-4 mr-1" />
                          More
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>
                            <FolderOpen className="h-4 w-4 mr-2" />
                            Move to folder
                          </DropdownMenuSubTrigger>
                          <DropdownMenuSubContent>
                            <DropdownMenuItem onClick={() => handleBulkMoveToFolder('inbox')}>
                              <Inbox className="h-4 w-4 mr-2" />
                              Inbox
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleBulkMoveToFolder('archive')}>
                              <Archive className="h-4 w-4 mr-2" />
                              Archive
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleBulkMoveToFolder('spam')}>
                              <Shield className="h-4 w-4 mr-2" />
                              Spam
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleBulkMoveToFolder('trash')}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Trash
                            </DropdownMenuItem>
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                        {labels.length > 0 && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger>
                                <Tags className="h-4 w-4 mr-2" />
                                Apply label
                              </DropdownMenuSubTrigger>
                              <DropdownMenuSubContent>
                                {labels.slice(0, 10).map(label => (
                                  <DropdownMenuItem
                                    key={label.id}
                                    onClick={() => handleBulkApplyLabel(label.id, label.name)}
                                  >
                                    <div className="flex items-center gap-2">
                                      <div
                                        className="h-3 w-3 rounded-full"
                                        style={{ backgroundColor: label.color }}
                                      />
                                      <span>{label.name}</span>
                                    </div>
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuSubContent>
                            </DropdownMenuSub>
                          </>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleBulkStar(false)}>
                          <Star className="h-4 w-4 mr-2" />
                          Remove stars
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ) : filteredMessages.length > 0 && (
              <div className="p-2 border-b border-border flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleSelectAll}
                    className="h-8"
                  >
                    <div className={`h-4 w-4 rounded border flex items-center justify-center ${
                      selectedMessages.size === filteredMessages.length && filteredMessages.length > 0
                        ? 'bg-primary border-primary'
                        : 'border-input'
                    }`}>
                      {selectedMessages.size === filteredMessages.length && filteredMessages.length > 0 && (
                        <Check className="h-3 w-3 text-primary-foreground" />
                      )}
                      {selectedMessages.size > 0 && selectedMessages.size < filteredMessages.length && (
                        <Minus className="h-3 w-3" />
                      )}
                    </div>
                    <span className="ml-2 text-xs">
                      {selectedMessages.size > 0 ? `${selectedMessages.size} selected` : 'Select all'}
                    </span>
                  </Button>
                  {filteredMessages.filter(m => m.unread).length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleMarkAllAsRead}
                      disabled={bulkActionInProgress}
                      className="h-8"
                    >
                      <Mail className="h-4 w-4 mr-1" />
                      Mark all as read
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-1 bg-accent/50 rounded-md p-1">
                  <Button
                    variant={viewMode === 'messages' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('messages')}
                    className="h-6 text-xs px-2"
                  >
                    <Mail className="h-3 w-3 mr-1" />
                    Messages
                  </Button>
                  <Button
                    variant={viewMode === 'threads' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('threads')}
                    className="h-6 text-xs px-2"
                  >
                    <Users className="h-3 w-3 mr-1" />
                    Threads
                  </Button>
                </div>
                <div className="w-px h-6 bg-border mx-1" />
                <Button
                  variant={showPreviewPane ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setShowPreviewPane(!showPreviewPane)}
                  className="h-6 text-xs px-2"
                  title={showPreviewPane ? 'Hide preview pane' : 'Show preview pane'}
                >
                  {showPreviewPane ? (
                    <PanelRightClose className="h-3 w-3 mr-1" />
                  ) : (
                    <PanelRightOpen className="h-3 w-3 mr-1" />
                  )}
                  {showPreviewPane ? 'Hide' : 'Preview'}
                </Button>
              </div>
            )}
            <ScrollArea className="h-full pr-2">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-96 text-center p-12">
                  <Mail className="h-20 w-20 text-muted-foreground mb-6 opacity-50" />
                  <h3 className="font-bold text-2xl mb-3">
                    {messages.length === 0 ? 'No messages yet' : 'No messages in this category'}
                  </h3>
                  <p className="text-base text-muted-foreground max-w-md">
                    {messages.length === 0
                      ? 'Connect an email account to see your messages'
                      : 'Try another category or run AI categorization'
                    }
                  </p>
                  {messages.length === 0 ? (
                    <Link href="/app/connect">
                      <Button className="mt-6" size="lg">Connect Email</Button>
                    </Link>
                  ) : (
                    <Button className="mt-6" size="lg" onClick={runCategorization} disabled={categorizing}>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Categorize with AI
                    </Button>
                  )}
                </div>
              ) : viewMode === 'messages' ? (
                // Message View
                filteredMessages.map((message) => {
                  const category = categories[message.id];
                  const isSelected = selectedMessages.has(message.id);
                  const isExpanded = selectedMessage?.id === message.id;
                  return (
                  <div key={message.id} className="border-b border-border">
                    <div
                      className={`w-full text-left py-4 px-5 hover:bg-accent/50 transition-all cursor-pointer group ${
                        isExpanded ? 'bg-accent' : ''
                      } ${isSelected ? 'bg-accent/30' : ''}`}
                      onClick={() => setSelectedMessage(isExpanded ? null : message)}
                    >
                      <div className="flex items-start gap-4">
                      {/* Checkbox */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMessageSelection(message.id);
                        }}
                        className={`mt-1 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}
                      >
                        <div className={`h-5 w-5 rounded border-2 flex items-center justify-center ${
                          isSelected ? 'bg-primary border-primary' : 'border-gray-600 bg-background hover:border-primary'
                        }`}>
                          {isSelected && (
                            <Check className="h-3.5 w-3.5 text-primary-foreground" />
                          )}
                        </div>
                      </button>

                      {/* Star - visible on hover or if starred */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleStar(message.id, message.starred || false);
                        }}
                        className={`mt-1 ${message.starred ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}
                      >
                        <Star className={`h-5 w-5 ${message.starred ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                      </button>

                      {/* Avatar */}
                      <Avatar className="h-10 w-10 shrink-0 mt-1">
                        <AvatarImage src={`https://logo.clearbit.com/${message.from?.[0]?.email?.split('@')[1]}`} />
                        <AvatarFallback className="text-sm">
                          {getInitials(message.from?.[0]?.name, message.from?.[0]?.email)}
                        </AvatarFallback>
                      </Avatar>

                      {/* Content - 3 Lines */}
                      <div className="flex-1 min-w-0 pr-12">
                        {/* First Line: Sender and Date */}
                        <div className="flex items-baseline justify-between gap-4 mb-1.5">
                          <span className={`text-sm line-clamp-1 ${message.unread ? 'font-semibold text-foreground' : 'text-foreground'}`}>
                            {message.from?.[0]?.name || message.from?.[0]?.email}
                          </span>
                          <span className="text-xs text-muted-foreground shrink-0 whitespace-nowrap ml-2">
                            {formatDate(message.date * 1000)}
                          </span>
                        </div>

                        {/* Second Line: Subject - wraps to 2 lines */}
                        <div className={`text-sm ${message.unread ? 'font-medium text-foreground' : 'text-foreground/90'} line-clamp-2 mb-1.5 break-words`}>
                          {message.subject || '(no subject)'}
                        </div>

                        {/* Third Line: Preview - wraps to 2 lines */}
                        <div className="text-sm text-muted-foreground line-clamp-2 break-words">
                          {message.snippet}
                        </div>
                      </div>
                    </div>
                  </div>

                    {/* Expanded Email Content */}
                    {isExpanded && (
                      <div className="bg-accent/30 border-t border-border">
                        {/* Action Toolbar */}
                        <div className="flex items-center gap-2 p-4 px-8 border-b border-border bg-card">
                          <Button size="sm" onClick={() => handleReply(message, false)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                            <Reply className="h-4 w-4 mr-1.5" />
                            Reply
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleReply(message, true)}>
                            <ReplyAll className="h-4 w-4 mr-1.5" />
                            Reply All
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleForward(message)}>
                            <Forward className="h-4 w-4 mr-1.5" />
                            Forward
                          </Button>
                          <div className="flex-1" />
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleArchive(message.id); }}>
                            <Archive className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDelete(message.id, false); }}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleToggleStar(message.id, message.starred || false); }}>
                            <Star className={`h-4 w-4 ${message.starred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleSnooze(message.id); }}>
                            <Clock className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleApplyLabel(message.id); }}>
                            <Tag className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Email Body */}
                        <div className="py-8 px-4 bg-background">
                          <div className="prose dark:prose-invert max-w-5xl mx-auto prose-sm prose-img:max-w-full prose-img:h-auto prose-img:rounded-lg prose-img:shadow-sm">
                            <div
                              className="email-body-content break-words"
                              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(message.body || message.snippet) }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  );
                })
              ) : (
                // Thread View
                Array.from(groupMessagesByThread().entries()).map(([threadId, threadMessages]) => {
                  const previewMessage = getThreadPreview(threadMessages);
                  const category = categories[previewMessage.id];
                  const isExpanded = expandedThreads.has(threadId);
                  const threadCount = threadMessages.length;
                  const hasUnread = threadMessages.some(m => m.unread);

                  return (
                    <div key={threadId} className="border-b border-border">
                      {/* Thread Preview */}
                      <div
                        className={`w-full text-left py-4 px-5 hover:bg-accent/50 transition-all cursor-pointer group ${
                          selectedMessage?.id === previewMessage.id ? 'bg-accent' : ''
                        }`}
                        onClick={() => toggleThread(threadId)}
                      >
                        <div className="flex items-start gap-4">
                          {/* Checkbox placeholder for alignment */}
                          <div className="w-5 h-5 shrink-0 mt-1" />

                          {/* Star placeholder for alignment */}
                          <div className="w-4 h-4 shrink-0 mt-1" />

                          {/* Avatar */}
                          <Avatar className="h-10 w-10 shrink-0">
                            <AvatarImage src={`https://logo.clearbit.com/${previewMessage.from?.[0]?.email?.split('@')[1]}`} />
                            <AvatarFallback className="text-sm">
                              {getInitials(previewMessage.from?.[0]?.name, previewMessage.from?.[0]?.email)}
                            </AvatarFallback>
                          </Avatar>

                          {/* Content - 3 Lines */}
                          <div className="flex-1 min-w-0 pr-12">
                            {/* First Line: Sender and Date */}
                            <div className="flex items-baseline justify-between gap-4 mb-1.5">
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <span className={`text-sm line-clamp-1 ${hasUnread ? 'font-semibold text-foreground' : 'text-foreground'}`}>
                                  {previewMessage.from?.[0]?.name || previewMessage.from?.[0]?.email}
                                </span>
                                {threadCount > 1 && (
                                  <Badge variant="secondary" className="text-xs px-1.5 py-0 shrink-0">
                                    {threadCount}
                                  </Badge>
                                )}
                              </div>
                              <span className="text-xs text-muted-foreground shrink-0 whitespace-nowrap ml-2">
                                {formatDate(previewMessage.date * 1000)}
                              </span>
                            </div>

                            {/* Second Line: Subject - wraps to 2 lines */}
                            <div className={`text-sm ${hasUnread ? 'font-medium text-foreground' : 'text-foreground/90'} line-clamp-2 mb-1.5 break-words`}>
                              {previewMessage.subject || '(no subject)'}
                            </div>

                            {/* Third Line: Preview - wraps to 2 lines */}
                            <div className="text-sm text-muted-foreground line-clamp-2 break-words">
                              {previewMessage.snippet}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Thread Messages */}
                      {isExpanded && threadMessages.length > 1 && (
                        <div className="bg-accent/20">
                          {threadMessages.slice(0, -1).map((msg) => (
                            <div
                              key={msg.id}
                              onClick={() => setSelectedMessage(msg)}
                              className="w-full text-left py-4 px-5 pl-24 border-b border-border/50 hover:bg-accent/50 transition-colors cursor-pointer"
                            >
                              <div className="flex items-start gap-4">
                                <Avatar className="h-10 w-10 shrink-0">
                                  <AvatarImage src={`https://logo.clearbit.com/${msg.from?.[0]?.email?.split('@')[1]}`} />
                                  <AvatarFallback className="text-sm">
                                    {getInitials(msg.from?.[0]?.name, msg.from?.[0]?.email)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0 pr-12">
                                  {/* First Line: Sender and Date */}
                                  <div className="flex items-baseline justify-between gap-4 mb-1.5">
                                    <span className="text-sm text-foreground line-clamp-1">
                                      {msg.from?.[0]?.name || msg.from?.[0]?.email}
                                    </span>
                                    <span className="text-xs text-muted-foreground shrink-0 whitespace-nowrap ml-2">
                                      {formatDate(msg.date * 1000)}
                                    </span>
                                  </div>

                                  {/* Second Line: Preview - wraps to 2 lines */}
                                  <div className="text-sm text-muted-foreground line-clamp-2 break-words">
                                    {msg.snippet || ''}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}

              {/* Infinite scroll trigger */}
              <div ref={loadMoreRef} className="h-4" />

              {/* Loading indicator for infinite scroll */}
              {loadingMore && (
                <div className="flex items-center justify-center p-4 border-t border-border">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">Loading more messages...</span>
                </div>
              )}
            </ScrollArea>
          </div>

        {/* Preview Pane */}
        {showPreviewPane && (
          <div className="hidden lg:flex lg:w-1/2 bg-card overflow-hidden flex-col">
            {selectedMessage ? (
              <>
                {/* Preview Header */}
                <div className="p-4 border-b border-border">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold mb-2">
                        {selectedMessage.subject || '(No subject)'}
                      </h2>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={`https://logo.clearbit.com/${selectedMessage.from?.[0]?.email?.split('@')[1]}`} />
                          <AvatarFallback>
                            {getInitials(selectedMessage.from?.[0]?.name, selectedMessage.from?.[0]?.email)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="font-medium text-sm">
                            {selectedMessage.from?.[0]?.name || selectedMessage.from?.[0]?.email}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {selectedMessage.from?.[0]?.email}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(selectedMessage.date * 1000)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReply(selectedMessage, false)}
                    >
                      <Reply className="h-4 w-4 mr-1" />
                      Reply
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReply(selectedMessage, true)}
                    >
                      <ReplyAll className="h-4 w-4 mr-1" />
                      Reply All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleForward(selectedMessage)}
                    >
                      <Forward className="h-4 w-4 mr-1" />
                      Forward
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStar(selectedMessage.id, selectedMessage.starred || false)}
                    >
                      <Star className={`h-4 w-4 ${selectedMessage.starred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleArchive(selectedMessage.id)}
                    >
                      <Archive className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(selectedMessage.id, false)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Preview Body */}
                <ScrollArea className="flex-1">
                  <div className="p-6">
                    <div
                      className="prose dark:prose-invert max-w-none prose-sm"
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedMessage.body || selectedMessage.snippet) }}
                    />
                  </div>
                </ScrollArea>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Mail className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Select a message to preview</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Composer Dialog */}
      {composing && (
        <EmailComposer
          onClose={() => setComposing(false)}
          accountId={accountIdParam || undefined}
        />
      )}

      {/* Reply/Forward Dialog */}
      {replyMode && (
        <EmailComposer
          onClose={() => setReplyMode(null)}
          accountId={accountIdParam || undefined}
          replyTo={replyMode.message}
        />
      )}

      {/* Snooze Dialog */}
      {showSnooze && (
        <Dialog open={showSnooze} onOpenChange={setShowSnooze}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Snooze Email</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="snooze-until">Snooze until</Label>
                <Input
                  id="snooze-until"
                  type="datetime-local"
                  value={snoozeUntil}
                  onChange={(e) => setSnoozeUntil(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (snoozeMessageId) {
                      quickSnooze(snoozeMessageId, 1);
                      setShowSnooze(false);
                    }
                  }}
                >
                  1 hour
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (snoozeMessageId) {
                      quickSnooze(snoozeMessageId, 3);
                      setShowSnooze(false);
                    }
                  }}
                >
                  3 hours
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (snoozeMessageId) {
                      quickSnooze(snoozeMessageId, 24);
                      setShowSnooze(false);
                    }
                  }}
                >
                  Tomorrow
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (snoozeMessageId) {
                      quickSnooze(snoozeMessageId, 168);
                      setShowSnooze(false);
                    }
                  }}
                >
                  Next week
                </Button>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="ghost" onClick={() => setShowSnooze(false)}>
                  Cancel
                </Button>
                <Button onClick={confirmSnooze} disabled={snoozing || !snoozeUntil}>
                  {snoozing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Snoozing...
                    </>
                  ) : (
                    <>
                      <Clock className="mr-2 h-4 w-4" />
                      Snooze
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Labels Dialog */}
      {showLabels && (
        <Dialog open={showLabels} onOpenChange={setShowLabels}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Manage Labels</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              {labels.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Tag className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No labels yet. Create your first label!</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {labels.map((label: any) => {
                    const hasLabel = labelMessageId && messageLabels[labelMessageId]?.some((l: any) => l.id === label.id);
                    return (
                      <button
                        key={label.id}
                        onClick={() => toggleLabelOnMessage(label.id)}
                        className="w-full flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: label.color }}
                          />
                          <span className="font-medium">{label.name}</span>
                        </div>
                        {hasLabel && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
              <div className="pt-4 border-t">
                {!showCreateLabel ? (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowCreateLabel(true)}
                  >
                    <Tag className="mr-2 h-4 w-4" />
                    Create New Label
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="label-name">Label Name</Label>
                      <Input
                        id="label-name"
                        placeholder="e.g., Important"
                        value={newLabelName}
                        onChange={(e) => setNewLabelName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="label-color">Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="label-color"
                          type="color"
                          value={newLabelColor}
                          onChange={(e) => setNewLabelColor(e.target.value)}
                          className="w-20 h-10"
                        />
                        <Input
                          value={newLabelColor}
                          onChange={(e) => setNewLabelColor(e.target.value)}
                          placeholder="#3B82F6"
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowCreateLabel(false);
                          setNewLabelName('');
                          setNewLabelColor('#3B82F6');
                        }}
                      >
                        Cancel
                      </Button>
                      <Button size="sm" onClick={createLabel}>
                        Create
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Keyboard Shortcuts Dialog */}
      <KeyboardShortcutsDialog
        open={showKeyboardShortcuts}
        onOpenChange={setShowKeyboardShortcuts}
      />

      {/* Command Palette */}
      <CommandPalette
        open={showCommandPalette}
        onOpenChange={setShowCommandPalette}
        onCompose={() => setComposing(true)}
        onRefresh={fetchMessages}
      />
    </div>
  );
}
