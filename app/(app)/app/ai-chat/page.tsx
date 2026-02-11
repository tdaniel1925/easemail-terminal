'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, Send, Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AIChatPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Welcome to EaseMail! 👋\n\nI\'m your AI assistant, here to help you navigate the platform. I can assist with:\n\n📧 **Email Management**\n• Composing and sending emails\n• Using AI Remix for tone adjustments\n• Voice dictation and voice messages\n• Managing attachments and templates\n• Setting up signatures\n\n🏢 **Organizations**\n• Creating and managing organizations\n• Inviting team members\n• Assigning roles and permissions\n• Organization analytics and audit logs\n\n⚙️ **Settings & Features**\n• Calendar integration\n• MS Teams integration\n• Account preferences\n• Security settings\n\n👤 **Admin Features** (Super Admins)\n• User management\n• Organization oversight\n• System settings\n• Revenue tracking\n\nAsk me anything!',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          history: messages,
        }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || 'I apologize, but I encountered an error. Please try again.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I\'m currently unavailable. Please try again later.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEmailSearch = () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set('search', searchQuery);
    router.push(`/app/inbox?${params.toString()}`);
    toast.success(`Searching for: ${searchQuery}`);
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleEmailSearch();
    }
    if (e.key === 'Escape') {
      setSearchQuery('');
    }
  };

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="w-full rounded-none border-b">
            <TabsTrigger value="chat" className="flex-1">
              <MessageCircle className="h-4 w-4 mr-2" />
              AI Chat
            </TabsTrigger>
            <TabsTrigger value="search" className="flex-1">
              <Search className="h-4 w-4 mr-2" />
              Email Search
            </TabsTrigger>
          </TabsList>

          {/* Chat Tab */}
          <TabsContent value="chat" className="flex-1 flex flex-col mt-0 overflow-hidden">
            <ScrollArea className="flex-1 p-6" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p
                        className={`text-[10px] mt-1 ${
                          message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted text-foreground rounded-2xl px-4 py-2.5">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Chat Input */}
            <div className="p-6 border-t border-border bg-background shrink-0">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything..."
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  size="icon"
                  className="shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Press Enter to send
              </p>
            </div>
          </TabsContent>

          {/* Email Search Tab */}
          <TabsContent value="search" className="flex-1 flex flex-col mt-0 overflow-hidden">
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-6 max-w-2xl mx-auto">
                <div>
                  <h4 className="font-semibold text-lg mb-2">Search Your Emails</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Use operators to find emails quickly
                  </p>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium">Quick Examples:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <button
                      onClick={() => setSearchQuery('is:unread')}
                      className="text-left px-4 py-3 bg-accent/30 hover:bg-accent rounded-lg text-sm transition-colors"
                    >
                      <div className="font-medium">Unread emails</div>
                      <div className="text-xs text-muted-foreground">is:unread</div>
                    </button>
                    <button
                      onClick={() => setSearchQuery('has:attachment')}
                      className="text-left px-4 py-3 bg-accent/30 hover:bg-accent rounded-lg text-sm transition-colors"
                    >
                      <div className="font-medium">With attachments</div>
                      <div className="text-xs text-muted-foreground">has:attachment</div>
                    </button>
                    <button
                      onClick={() => setSearchQuery('is:starred')}
                      className="text-left px-4 py-3 bg-accent/30 hover:bg-accent rounded-lg text-sm transition-colors"
                    >
                      <div className="font-medium">Starred</div>
                      <div className="text-xs text-muted-foreground">is:starred</div>
                    </button>
                    <button
                      onClick={() => setSearchQuery('is:unread has:attachment')}
                      className="text-left px-4 py-3 bg-accent/30 hover:bg-accent rounded-lg text-sm transition-colors"
                    >
                      <div className="font-medium">Unread with files</div>
                      <div className="text-xs text-muted-foreground">is:unread has:attachment</div>
                    </button>
                  </div>
                </div>

                <div className="bg-accent/30 rounded-lg p-4 space-y-2">
                  <p className="font-medium text-sm">Search Operators:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div>
                      <code className="bg-background px-2 py-1 rounded">from:name</code>
                      <span className="ml-2 text-muted-foreground">From sender</span>
                    </div>
                    <div>
                      <code className="bg-background px-2 py-1 rounded">to:name</code>
                      <span className="ml-2 text-muted-foreground">To recipient</span>
                    </div>
                    <div>
                      <code className="bg-background px-2 py-1 rounded">subject:word</code>
                      <span className="ml-2 text-muted-foreground">In subject</span>
                    </div>
                    <div>
                      <code className="bg-background px-2 py-1 rounded">has:attachment</code>
                      <span className="ml-2 text-muted-foreground">Has files</span>
                    </div>
                    <div>
                      <code className="bg-background px-2 py-1 rounded">is:unread</code>
                      <span className="ml-2 text-muted-foreground">Unread</span>
                    </div>
                    <div>
                      <code className="bg-background px-2 py-1 rounded">is:starred</code>
                      <span className="ml-2 text-muted-foreground">Starred</span>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>

            {/* Search Input */}
            <div className="p-6 border-t border-border bg-background shrink-0">
              <div className="max-w-2xl mx-auto">
                <div className="flex gap-2">
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearchKeyPress}
                    placeholder="Search emails..."
                    className="flex-1"
                  />
                  <Button
                    onClick={handleEmailSearch}
                    disabled={!searchQuery.trim()}
                    className="shrink-0"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Press Enter to search • Results will appear in your inbox
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
