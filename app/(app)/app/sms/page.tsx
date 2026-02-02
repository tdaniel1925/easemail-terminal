'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  MessageSquare,
  Send,
  Loader2,
  Phone,
  RefreshCw,
  Plus,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface SMSMessage {
  id: string;
  user_id: string;
  from_number: string;
  to_number: string;
  body: string;
  direction: 'inbound' | 'outbound';
  status: string;
  twilio_sid: string;
  created_at: string;
}

interface Conversation {
  phoneNumber: string;
  messages: SMSMessage[];
  lastMessage: SMSMessage;
  unreadCount: number;
}

export default function SMSPage() {
  const [messages, setMessages] = useState<SMSMessage[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [toNumber, setToNumber] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [showNewMessageDialog, setShowNewMessageDialog] = useState(false);

  useEffect(() => {
    fetchMessages();
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchMessages, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Group messages into conversations
    const conversationMap = new Map<string, SMSMessage[]>();

    messages.forEach((msg) => {
      const phoneNumber = msg.direction === 'outbound' ? msg.to_number : msg.from_number;
      if (!conversationMap.has(phoneNumber)) {
        conversationMap.set(phoneNumber, []);
      }
      conversationMap.get(phoneNumber)!.push(msg);
    });

    const conversationList: Conversation[] = Array.from(conversationMap.entries()).map(
      ([phoneNumber, msgs]) => {
        const sortedMsgs = msgs.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        return {
          phoneNumber,
          messages: sortedMsgs,
          lastMessage: sortedMsgs[0],
          unreadCount: 0,
        };
      }
    );

    conversationList.sort(
      (a, b) =>
        new Date(b.lastMessage.created_at).getTime() -
        new Date(a.lastMessage.created_at).getTime()
    );

    setConversations(conversationList);
  }, [messages]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/sms');
      const data = await response.json();

      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSendSMS = async () => {
    if (!toNumber || !messageBody) {
      toast.error('Phone number and message are required');
      return;
    }

    // Basic phone number validation
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    const cleanNumber = toNumber.replace(/[\s-()]/g, '');
    if (!phoneRegex.test(cleanNumber)) {
      toast.error('Please enter a valid phone number with country code (e.g., +1234567890)');
      return;
    }

    try {
      setSending(true);
      const response = await fetch('/api/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: toNumber, body: messageBody }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('SMS sent successfully!');
        setShowNewMessageDialog(false);
        setToNumber('');
        setMessageBody('');
        fetchMessages();
      } else {
        toast.error(data.error || 'Failed to send SMS');
      }
    } catch (error) {
      console.error('Send SMS error:', error);
      toast.error('Failed to send SMS');
    } finally {
      setSending(false);
    }
  };

  const handleReplyToConversation = (phoneNumber: string) => {
    setToNumber(phoneNumber);
    setShowNewMessageDialog(true);
  };

  const formatPhoneNumber = (phone: string) => {
    if (phone.startsWith('+1') && phone.length === 12) {
      return `+1 (${phone.slice(2, 5)}) ${phone.slice(5, 8)}-${phone.slice(8)}`;
    }
    return phone;
  };

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.phoneNumber.includes(searchQuery) ||
      conv.lastMessage.body.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedConversationData = conversations.find(
    (c) => c.phoneNumber === selectedConversation
  );

  if (loading && messages.length === 0) {
    return (
      <div className="container max-w-7xl mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">SMS Messages</h1>
          <p className="text-muted-foreground">Send and receive text messages</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchMessages} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={showNewMessageDialog} onOpenChange={setShowNewMessageDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Message
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Send SMS Message</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="to">To (Phone Number) *</Label>
                  <Input
                    id="to"
                    type="tel"
                    placeholder="+1234567890"
                    value={toNumber}
                    onChange={(e) => setToNumber(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Include country code (e.g., +1 for US)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="body">Message *</Label>
                  <Textarea
                    id="body"
                    placeholder="Enter your message..."
                    value={messageBody}
                    onChange={(e) => setMessageBody(e.target.value)}
                    rows={4}
                    maxLength={1600}
                  />
                  <p className="text-xs text-muted-foreground">
                    {messageBody.length} / 1600 characters
                  </p>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="ghost"
                    onClick={() => setShowNewMessageDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSendSMS} disabled={sending}>
                    {sending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send SMS
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{messages.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Conversations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{conversations.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {messages.filter((m) => m.direction === 'outbound').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Received</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {messages.filter((m) => m.direction === 'inbound').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content: Conversations and Message Thread */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Conversations List */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Conversations</CardTitle>
            <CardDescription>
              {filteredConversations.length} conversation{filteredConversations.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <ScrollArea className="h-[500px]">
              <div className="space-y-2">
                {filteredConversations.map((conv) => (
                  <div
                    key={conv.phoneNumber}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedConversation === conv.phoneNumber
                        ? 'bg-accent border-primary'
                        : 'hover:bg-accent/50'
                    }`}
                    onClick={() => setSelectedConversation(conv.phoneNumber)}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarFallback className="bg-primary/10">
                          <Phone className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="font-medium text-sm truncate">
                            {formatPhoneNumber(conv.phoneNumber)}
                          </div>
                          <div className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                            {formatDate(new Date(conv.lastMessage.created_at))}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          {conv.lastMessage.direction === 'outbound' ? (
                            <ArrowUpRight className="h-3 w-3 text-blue-500 flex-shrink-0" />
                          ) : (
                            <ArrowDownLeft className="h-3 w-3 text-green-500 flex-shrink-0" />
                          )}
                          <span className="truncate">{conv.lastMessage.body}</span>
                        </div>
                        <div className="mt-1">
                          <Badge variant="outline" className="text-xs">
                            {conv.messages.length} message{conv.messages.length !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredConversations.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No conversations found</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Message Thread */}
        <Card className="md:col-span-2">
          <CardHeader>
            {selectedConversationData ? (
              <>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {formatPhoneNumber(selectedConversationData.phoneNumber)}
                  </CardTitle>
                  <Button
                    size="sm"
                    onClick={() => handleReplyToConversation(selectedConversationData.phoneNumber)}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Reply
                  </Button>
                </div>
                <CardDescription>
                  {selectedConversationData.messages.length} message
                  {selectedConversationData.messages.length !== 1 ? 's' : ''}
                </CardDescription>
              </>
            ) : (
              <>
                <CardTitle>Select a Conversation</CardTitle>
                <CardDescription>Choose a conversation to view messages</CardDescription>
              </>
            )}
          </CardHeader>
          <CardContent>
            {selectedConversationData ? (
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {[...selectedConversationData.messages].reverse().map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.direction === 'outbound' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          msg.direction === 'outbound'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {msg.direction === 'outbound' ? (
                            <ArrowUpRight className="h-3 w-3" />
                          ) : (
                            <ArrowDownLeft className="h-3 w-3" />
                          )}
                          <span className="text-xs opacity-70">
                            {msg.direction === 'outbound' ? 'Sent' : 'Received'}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
                        <div className="flex items-center justify-between gap-2 mt-2 text-xs opacity-70">
                          <span>
                            {new Date(msg.created_at).toLocaleString()}
                          </span>
                          {msg.status && (
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                msg.direction === 'outbound'
                                  ? 'border-primary-foreground/20'
                                  : ''
                              }`}
                            >
                              {msg.status}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="h-[500px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Select a conversation to view messages</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Info Card */}
      <Card className="mt-6 border-blue-500/20 bg-blue-500/5">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <MessageSquare className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium mb-1">SMS Integration Active</h4>
              <p className="text-sm text-muted-foreground">
                You can now send and receive text messages directly from EaseMail. Messages
                are stored securely and sync across all your devices. Configure your Twilio
                credentials in environment variables to enable this feature.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
