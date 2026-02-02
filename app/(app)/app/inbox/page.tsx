'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Mail, Search, RefreshCw, PenSquare, Inbox,
  Send, Star, Trash2, Archive, Clock, Menu, Users, Newspaper, Bell, Sparkles,
  Reply, ReplyAll, Forward
} from 'lucide-react';
import { formatDate, truncate } from '@/lib/utils';
import Link from 'next/link';
import { EmailComposer } from '@/components/features/email-composer';
import { toast } from 'sonner';

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

  useEffect(() => {
    fetchMessages();
    fetchCategories();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/messages');
      const data = await response.json();

      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/messages/categorize');
      const data = await response.json();

      if (data.categories) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

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

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      {sidebarOpen && (
        <div className="w-64 border-r border-border bg-card">
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
                className="pl-10 w-full max-w-xl"
              />
            </div>
            <Button variant="ghost" size="icon" onClick={fetchMessages}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </header>

        {/* Email List & Reading Pane */}
        <div className="flex-1 flex overflow-hidden">
          {/* Email List */}
          <div className="w-96 border-r border-border bg-card">
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
              ) : (
                filteredMessages.map((message) => {
                  const category = categories[message.id];
                  return (
                  <button
                    key={message.id}
                    onClick={() => setSelectedMessage(message)}
                    className={`w-full text-left p-4 border-b border-border hover:bg-accent transition-colors ${
                      selectedMessage?.id === message.id ? 'bg-accent' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
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
                    </div>
                  </button>
                  );
                })
              )}
            </ScrollArea>
          </div>

          {/* Reading Pane */}
          <div className="flex-1 flex flex-col">
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
                  <div className="flex items-center gap-2 mt-4">
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
                    <div className="ml-auto flex items-center gap-2">
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
                  <div
                    className="prose dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: selectedMessage.body || selectedMessage.snippet }}
                  />
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
    </div>
  );
}
