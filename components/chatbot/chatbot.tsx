'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { MessageCircle, X, Send, Loader2, Search, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function Chatbot() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
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
      // Call your AI API here
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

    // Navigate to inbox with search parameter
    const params = new URLSearchParams(searchParams.toString());
    params.set('search', searchQuery);

    // If not on inbox page, navigate to it
    if (!pathname.includes('/inbox')) {
      router.push(`/app/inbox?${params.toString()}`);
    } else {
      router.push(`${pathname}?${params.toString()}`);
    }

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
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all hover:scale-110 flex items-center justify-center"
        aria-label="Open chatbot"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 h-[600px] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                {activeTab === 'chat' ? (
                  <MessageCircle className="h-5 w-5" />
                ) : (
                  <Search className="h-5 w-5" />
                )}
              </div>
              <div>
                <h3 className="font-semibold">
                  {activeTab === 'chat' ? 'EaseMail Assistant' : 'Email Search'}
                </h3>
                <p className="text-xs opacity-90">
                  {activeTab === 'chat' ? 'Always here to help' : 'Search your emails'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-primary-foreground/10 p-1 rounded transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="w-full rounded-none border-b">
              <TabsTrigger value="chat" className="flex-1">
                <MessageCircle className="h-4 w-4 mr-2" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="search" className="flex-1">
                <Search className="h-4 w-4 mr-2" />
                Email Search
              </TabsTrigger>
            </TabsList>

            {/* Chat Tab */}
            <TabsContent value="chat" className="flex-1 flex flex-col mt-0 overflow-hidden">
              {/* Messages */}
              <ScrollArea className="flex-1 p-4" ref={scrollRef}>
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
              <div className="p-4 border-t border-border bg-background shrink-0">
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
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Search Your Emails</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Use operators to find emails quickly
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-medium">Quick Examples:</p>
                    <div className="space-y-1">
                      <button
                        onClick={() => setSearchQuery('is:unread')}
                        className="w-full text-left px-3 py-2 bg-accent/30 hover:bg-accent rounded-md text-sm transition-colors"
                      >
                        Unread emails
                      </button>
                      <button
                        onClick={() => setSearchQuery('has:attachment')}
                        className="w-full text-left px-3 py-2 bg-accent/30 hover:bg-accent rounded-md text-sm transition-colors"
                      >
                        With attachments
                      </button>
                      <button
                        onClick={() => setSearchQuery('is:starred')}
                        className="w-full text-left px-3 py-2 bg-accent/30 hover:bg-accent rounded-md text-sm transition-colors"
                      >
                        Starred
                      </button>
                    </div>
                  </div>

                  <div className="bg-accent/30 rounded-lg p-3 text-xs space-y-1">
                    <p className="font-medium">Search Operators:</p>
                    <p><code className="bg-background px-1 rounded">from:name</code> Sender</p>
                    <p><code className="bg-background px-1 rounded">subject:word</code> Subject</p>
                    <p><code className="bg-background px-1 rounded">has:attachment</code> Files</p>
                  </div>
                </div>
              </ScrollArea>

              {/* Search Input */}
              <div className="p-4 border-t border-border bg-background shrink-0">
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
                    size="icon"
                    className="shrink-0"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Press Enter to search
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </>
  );
}
