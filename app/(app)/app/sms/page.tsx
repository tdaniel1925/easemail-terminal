'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { MessageSquare, Send, Loader2, Phone, RefreshCw } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface SMSMessage {
  id: string;
  from_number: string;
  to_number: string;
  body: string;
  direction: 'inbound' | 'outbound';
  status: string;
  created_at: string;
}

export default function SMSPage() {
  const [messages, setMessages] = useState<SMSMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [toNumber, setToNumber] = useState('');
  const [messageBody, setMessageBody] = useState('');

  useEffect(() => {
    fetchMessages();
  }, []);

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
    if (!phoneRegex.test(toNumber.replace(/[\s-()]/g, ''))) {
      toast.error('Please enter a valid phone number (e.g., +1234567890)');
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

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">SMS Messages</h1>
          <p className="text-muted-foreground">Send and receive text messages</p>
        </div>
        <Button variant="outline" onClick={fetchMessages} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Send SMS Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Send SMS
            </CardTitle>
            <CardDescription>Send a text message to any phone number</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">
                Phone Number
              </label>
              <Input
                id="phone"
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
              <label htmlFor="message" className="text-sm font-medium">
                Message
              </label>
              <Textarea
                id="message"
                placeholder="Type your message here..."
                rows={4}
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                maxLength={160}
              />
              <p className="text-xs text-muted-foreground text-right">
                {messageBody.length}/160 characters
              </p>
            </div>

            <Button onClick={handleSendSMS} disabled={sending} className="w-full">
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
          </CardContent>
        </Card>

        {/* Message List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Recent Messages
            </CardTitle>
            <CardDescription>{messages.length} messages</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="font-semibold text-lg mb-2">No messages yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Send your first SMS to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-4 rounded-lg border ${
                        message.direction === 'outbound'
                          ? 'bg-primary/5 border-primary/20'
                          : 'bg-muted/50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {message.direction === 'outbound'
                              ? `To: ${message.to_number}`
                              : `From: ${message.from_number}`}
                          </span>
                        </div>
                        <Badge
                          variant={
                            message.direction === 'outbound' ? 'default' : 'secondary'
                          }
                        >
                          {message.direction}
                        </Badge>
                      </div>
                      <p className="text-sm mb-2">{message.body}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{formatDate(new Date(message.created_at))}</span>
                        <Badge variant="outline" className="text-xs">
                          {message.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
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
