'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Mail, Search, RefreshCw, PenSquare, Inbox,
  Send, Star, Trash2, Archive, Clock, Menu, Users, Newspaper, Bell, Sparkles,
  Reply, ReplyAll, Forward, LogOut, Loader2, X, Check, Minus, Tag, Shield, AlertTriangle,
  Calendar, UserCircle, Video
} from 'lucide-react';
import { formatDate, truncate } from '@/lib/utils';
import Link from 'next/link';
import { EmailComposer } from '@/components/features/email-composer';
import { toast } from 'sonner';
import DOMPurify from 'dompurify';

type EmailCategory = 'people' | 'newsletters' | 'notifications';

export default function InboxPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [composing, setComposing] = useState(false);
  const [replyMode, setReplyMode] = useState<{ mode: 'reply' | 'replyAll' | 'forward'; message: any } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
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
  const [selectedAccount, setSelectedAccount] = useState<string>('unified'); // 'unified' or account ID

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

  const fetchAccounts = useCallback(async () => {
    try {
      const response = await fetch('/api/email-accounts');
      const data = await response.json();

      if (data.accounts) {
        setAccounts(data.accounts);
      }
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
    }
  }, []);

  const fetchMessages = useCallback(async (reset: boolean = true) => {
    try {
      if (reset) {
        setLoading(true);
      }

      // Choose endpoint based on selected account
      let endpoint = '/api/messages';
      if (selectedAccount === 'unified') {
        endpoint = '/api/messages/unified';
      } else if (selectedAccount !== 'primary') {
        // Fetch from specific account (will need to implement this)
        endpoint = `/api/messages?accountId=${selectedAccount}`;
      }

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
  }, [selectedAccount]);

  const loadMoreMessages = async () => {
    if (!nextCursor || loadingMore) return;

    try {
      setLoadingMore(true);
      const response = await fetch(`/api/messages?page_token=${encodeURIComponent(nextCursor)}`);
      const data = await response.json();

      if (data.messages) {
        // Append new messages to existing list
        setMessages(prevMessages => [...prevMessages, ...data.messages]);
        setNextCursor(data.nextCursor || null);
        setHasMore(!!data.nextCursor);

        if (data.messages.length > 0) {
          toast.success(`Loaded ${data.messages.length} more message(s)`);
        }
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
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (email) {
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

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setSearchQuery('');
      return;
    }

    try {
      setSearching(true);
      setSearchQuery(query);

      const response = await fetch(`/api/messages/search?q=${encodeURIComponent(query)}`);
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

    // Auto-refresh inbox every 60 seconds
    const refreshInterval = setInterval(() => {
      fetchMessages(false); // Silent refresh without loading state
    }, 60000);

    return () => clearInterval(refreshInterval);
  }, [fetchAccounts, fetchMessages, fetchCategories, fetchLabels]);

  useEffect(() => {
    // Refetch messages when account changes
    fetchMessages(true);
  }, [selectedAccount, fetchMessages]);

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

  // Threading functions
  const groupMessagesByThread = () => {
    const threads = new Map<string, any[]>();

    filteredMessages.forEach((message) => {
      const threadId = message.thread_id || message.id;
      if (!threads.has(threadId)) {
        threads.set(threadId, []);
      }
      threads.get(threadId)!.push(message);
    });

    // Sort messages within each thread by date (oldest first)
    threads.forEach((messages, threadId) => {
      messages.sort((a, b) => a.date - b.date);
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

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      {sidebarOpen && (
        <div className="w-64 border-r border-border bg-card hidden lg:block">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                EaseMail
              </h1>
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                <Menu className="h-5 w-5" />
              </Button>
            </div>
            <Button className="w-full" onClick={() => setComposing(true)}>
              <PenSquare className="mr-2 h-4 w-4" />
              Compose
            </Button>
          </div>

          <ScrollArea className="h-[calc(100vh-140px)]">
            <nav className="p-2 space-y-4">
              {/* Main Folders */}
              <div className="space-y-1">
                {[
                  { icon: Inbox, label: 'All Inbox', category: 'all', count: messages.length },
                  { icon: Star, label: 'Starred', count: 0 },
                  { icon: Send, label: 'Sent', count: 0 },
                  { icon: Clock, label: 'Snoozed', count: 0 },
                  { icon: Archive, label: 'Archive', count: 0 },
                  { icon: Trash2, label: 'Trash', count: 0 },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => item.category && setSelectedCategory(item.category as any)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-accent transition-colors ${
                      selectedCategory === item.category ? 'bg-accent' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      <span className="text-sm">{item.label}</span>
                    </div>
                    {item.count > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {item.count}
                      </Badge>
                    )}
                  </button>
                ))}
              </div>

              {/* Apps */}
              <div className="space-y-1">
                <div className="px-3 py-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">
                    Apps
                  </span>
                </div>
                {[
                  { icon: UserCircle, label: 'Contacts', href: '/app/contacts' },
                  { icon: Calendar, label: 'Calendar', href: '/app/calendar' },
                  { icon: Video, label: 'MS Teams', href: '/app/teams' },
                ].map((item) => (
                  <Link key={item.label} href={item.href}>
                    <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors">
                      <item.icon className="h-4 w-4" />
                      <span className="text-sm">{item.label}</span>
                    </button>
                  </Link>
                ))}
              </div>

              {/* Categories */}
              <div className="space-y-1">
                <div className="px-3 py-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">
                    Smart Categories
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={runCategorization}
                    disabled={categorizing}
                  >
                    <Sparkles className={`h-3 w-3 ${categorizing ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
                {[
                  { icon: Users, label: 'People', category: 'people' as EmailCategory },
                  { icon: Newspaper, label: 'Newsletters', category: 'newsletters' as EmailCategory },
                  { icon: Bell, label: 'Notifications', category: 'notifications' as EmailCategory },
                ].map((item) => {
                  const count = getCategoryCount(item.category);
                  return (
                    <button
                      key={item.label}
                      onClick={() => setSelectedCategory(item.category)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-accent transition-colors ${
                        selectedCategory === item.category ? 'bg-accent' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="h-4 w-4" />
                        <span className="text-sm">{item.label}</span>
                      </div>
                      {count > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {count}
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Custom Labels */}
              <div className="space-y-1">
                <div className="px-3 py-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">
                    Labels
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => setShowCreateLabel(true)}
                  >
                    <Tag className="h-3 w-3" />
                  </Button>
                </div>
                {labels.length === 0 ? (
                  <div className="px-3 py-2 text-xs text-muted-foreground">
                    No labels yet
                  </div>
                ) : (
                  labels.map((label) => (
                    <button
                      key={label.id}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: label.color }}
                        />
                        <span className="text-sm">{label.name}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>

              {/* Account Selector */}
              <div className="space-y-1">
                <div className="px-3 py-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">
                    Accounts
                  </span>
                </div>
                <div className="px-2 space-y-1">
                  {accounts.length === 0 ? (
                    <div className="px-3 py-2 text-xs text-muted-foreground">
                      No accounts connected
                    </div>
                  ) : (
                    accounts.map((account) => (
                      <button
                        key={account.id}
                        onClick={() => setSelectedAccount(account.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-accent transition-colors ${
                          selectedAccount === account.id ? 'bg-accent' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="h-2 w-2 rounded-full bg-green-500" />
                          <span className="text-sm truncate">{account.email}</span>
                        </div>
                        {account.is_primary && (
                          <Badge variant="secondary" className="text-xs shrink-0">
                            Primary
                          </Badge>
                        )}
                      </button>
                    ))
                  )}
                  <Link href="/app/settings/email-accounts">
                    <Button variant="outline" size="sm" className="w-full mt-2">
                      <Tag className="mr-2 h-3 w-3" />
                      Manage Accounts
                    </Button>
                  </Link>
                </div>
              </div>
            </nav>
          </ScrollArea>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b border-border bg-card p-4">
          <div className="flex items-center gap-4">
            {!sidebarOpen && (
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
                <Menu className="h-5 w-5" />
              </Button>
            )}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search emails..."
                className="pl-10 pr-10 w-full max-w-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch(searchQuery);
                  }
                  if (e.key === 'Escape') {
                    clearSearch();
                  }
                }}
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              {searching && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>

            {/* Account Selector */}
            {accounts.length > 1 && (
              <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                <SelectTrigger className="w-[280px]">
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unified">📬 All Accounts ({accounts.length})</SelectItem>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      📧 {account.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Button variant="ghost" size="icon" onClick={() => fetchMessages(true)}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
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

        {/* Email List & Reading Pane */}
        <div className="flex-1 flex overflow-hidden">
          {/* Email List */}
          <div className="w-full md:w-96 lg:w-96 border-r border-border bg-card">
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
                  </div>
                </div>
              </div>
            ) : filteredMessages.length > 0 && (
              <div className="p-2 border-b border-border flex items-center justify-between gap-2">
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
              </div>
            )}
            <ScrollArea className="h-full">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center p-8">
                  <Mail className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="font-semibold text-lg mb-2">
                    {messages.length === 0 ? 'No messages yet' : 'No messages in this category'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {messages.length === 0
                      ? 'Connect an email account to see your messages'
                      : 'Try another category or run AI categorization'
                    }
                  </p>
                  {messages.length === 0 ? (
                    <Link href="/app/connect">
                      <Button className="mt-4">Connect Email</Button>
                    </Link>
                  ) : (
                    <Button className="mt-4" onClick={runCategorization} disabled={categorizing}>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Categorize with AI
                    </Button>
                  )}
                </div>
              ) : viewMode === 'messages' ? (
                // Message View
                filteredMessages.map((message) => {
                  const category = categories[message.id];
                  const isSelected = selectedMessages.has(message.id);
                  return (
                  <div
                    key={message.id}
                    className={`w-full text-left p-4 border-b border-border hover:bg-accent transition-colors ${
                      selectedMessage?.id === message.id ? 'bg-accent' : ''
                    } ${isSelected ? 'bg-primary/5' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Checkbox */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMessageSelection(message.id);
                        }}
                        className="mt-2"
                      >
                        <div className={`h-4 w-4 rounded border flex items-center justify-center ${
                          isSelected ? 'bg-primary border-primary' : 'border-input hover:border-primary'
                        }`}>
                          {isSelected && (
                            <Check className="h-3 w-3 text-primary-foreground" />
                          )}
                        </div>
                      </button>

                      <button
                        onClick={() => setSelectedMessage(message)}
                        className="flex-1 flex items-start gap-3 text-left"
                      >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={`https://logo.clearbit.com/${message.from?.[0]?.email?.split('@')[1]}`} />
                        <AvatarFallback>
                          {getInitials(message.from?.[0]?.name, message.from?.[0]?.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`font-medium truncate ${message.unread ? 'font-bold' : ''}`}>
                            {message.from?.[0]?.name || message.from?.[0]?.email}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(message.date * 1000)}
                          </span>
                        </div>
                        <p className={`text-sm truncate mb-1 ${message.unread ? 'font-semibold' : 'text-muted-foreground'}`}>
                          {message.subject || '(no subject)'}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {message.snippet || ''}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          {message.unread && (
                            <Badge variant="default" className="text-xs">New</Badge>
                          )}
                          {category && (
                            <Badge variant="outline" className={`text-xs ${getCategoryBadgeColor(category)}`}>
                              {category}
                            </Badge>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleStar(message.id, message.starred || false);
                            }}
                            className="ml-auto p-1 hover:bg-accent rounded"
                          >
                            <Star className={`h-4 w-4 ${message.starred ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                          </button>
                        </div>
                      </div>
                      </button>
                    </div>
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
                      <div className={`w-full text-left p-4 hover:bg-accent transition-colors ${
                        selectedMessage?.id === previewMessage.id ? 'bg-accent' : ''
                      }`}>
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => toggleThread(threadId)}
                            className="flex-1 flex items-start gap-3 text-left"
                          >
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={`https://logo.clearbit.com/${previewMessage.from?.[0]?.email?.split('@')[1]}`} />
                              <AvatarFallback>
                                {getInitials(previewMessage.from?.[0]?.name, previewMessage.from?.[0]?.email)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <span className={`font-medium truncate ${hasUnread ? 'font-bold' : ''}`}>
                                  {previewMessage.from?.[0]?.name || previewMessage.from?.[0]?.email}
                                </span>
                                <div className="flex items-center gap-2">
                                  {threadCount > 1 && (
                                    <Badge variant="secondary" className="text-xs">
                                      {threadCount}
                                    </Badge>
                                  )}
                                  <span className="text-xs text-muted-foreground">
                                    {formatDate(previewMessage.date * 1000)}
                                  </span>
                                </div>
                              </div>
                              <p className={`text-sm truncate mb-1 ${hasUnread ? 'font-semibold' : 'text-muted-foreground'}`}>
                                {previewMessage.subject || '(no subject)'}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {previewMessage.snippet || ''}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                {hasUnread && (
                                  <Badge variant="default" className="text-xs">New</Badge>
                                )}
                                {category && (
                                  <Badge variant="outline" className={`text-xs ${getCategoryBadgeColor(category)}`}>
                                    {category}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </button>
                        </div>
                      </div>

                      {/* Expanded Thread Messages */}
                      {isExpanded && threadMessages.length > 1 && (
                        <div className="bg-accent/30 border-t border-border">
                          {threadMessages.slice(0, -1).map((msg) => (
                            <button
                              key={msg.id}
                              onClick={() => setSelectedMessage(msg)}
                              className="w-full text-left p-3 pl-16 border-b border-border/50 hover:bg-accent/50 transition-colors flex items-start gap-3"
                            >
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={`https://logo.clearbit.com/${msg.from?.[0]?.email?.split('@')[1]}`} />
                                <AvatarFallback className="text-xs">
                                  {getInitials(msg.from?.[0]?.name, msg.from?.[0]?.email)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm truncate">
                                    {msg.from?.[0]?.name || msg.from?.[0]?.email}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {formatDate(msg.date * 1000)}
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground truncate">
                                  {msg.snippet || ''}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}

              {/* Load More Button */}
              {!loading && !searchQuery && filteredMessages.length > 0 && hasMore && (
                <div className="p-4 border-t border-border">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={loadMoreMessages}
                    disabled={loadingMore}
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading more...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Load More Messages
                      </>
                    )}
                  </Button>
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Reading Pane */}
          <div className={`flex-1 flex flex-col ${selectedMessage ? 'block' : 'hidden md:block'}`}>
            {selectedMessage ? (
              <>
                <div className="border-b border-border bg-card p-6">
                  <h2 className="text-2xl font-bold mb-2">
                    {selectedMessage.subject || '(no subject)'}
                  </h2>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={`https://logo.clearbit.com/${selectedMessage.from?.[0]?.email?.split('@')[1]}`} />
                      <AvatarFallback>
                        {getInitials(selectedMessage.from?.[0]?.name, selectedMessage.from?.[0]?.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {selectedMessage.from?.[0]?.name || selectedMessage.from?.[0]?.email}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        to {selectedMessage.to?.[0]?.email}
                      </p>
                    </div>
                    <div className="ml-auto text-sm text-muted-foreground">
                      {new Date(selectedMessage.date * 1000).toLocaleString()}
                    </div>
                  </div>
                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 mt-4 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReply(selectedMessage, false)}
                    >
                      <Reply className="mr-2 h-4 w-4" />
                      Reply
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReply(selectedMessage, true)}
                    >
                      <ReplyAll className="mr-2 h-4 w-4" />
                      Reply All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleForward(selectedMessage)}
                    >
                      <Forward className="mr-2 h-4 w-4" />
                      Forward
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSnooze(selectedMessage.id)}
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      Snooze
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleApplyLabel(selectedMessage.id)}
                    >
                      <Tag className="mr-2 h-4 w-4" />
                      Labels
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => reportSpam(selectedMessage.id)}
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      Report Spam
                    </Button>
                    <div className="ml-auto flex items-center gap-2 flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleStar(selectedMessage.id, selectedMessage.starred || false)}
                      >
                        <Star className={`mr-2 h-4 w-4 ${selectedMessage.starred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                        {selectedMessage.starred ? 'Unstar' : 'Star'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleRead(selectedMessage.id, selectedMessage.unread || false)}
                      >
                        <Mail className="mr-2 h-4 w-4" />
                        {selectedMessage.unread ? 'Mark Read' : 'Mark Unread'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleArchive(selectedMessage.id)}
                      >
                        <Archive className="mr-2 h-4 w-4" />
                        Archive
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(selectedMessage.id, false)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
                <ScrollArea className="flex-1 p-6">
                  <div className="prose dark:prose-invert max-w-full" style={{ maxWidth: '100%', overflowX: 'hidden' }}>
                    <div
                      className="email-body-content"
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedMessage.body || selectedMessage.snippet) }}
                    />
                  </div>
                </ScrollArea>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center p-8">
                <div>
                  <Mail className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">No message selected</h3>
                  <p className="text-sm text-muted-foreground">
                    Select a message from the list to read it
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Composer Dialog */}
      {composing && (
        <EmailComposer onClose={() => setComposing(false)} />
      )}

      {/* Reply/Forward Dialog */}
      {replyMode && (
        <EmailComposer
          onClose={() => setReplyMode(null)}
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
    </div>
  );
}
