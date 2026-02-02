'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Send, Loader2, X, Mic, Paperclip } from 'lucide-react';
import { toast } from 'sonner';
import { VoiceInput } from '@/components/features/voice-input';
import { VoiceMessageRecorder } from '@/components/features/voice-message-recorder';

interface EmailComposerProps {
  onClose: () => void;
  replyTo?: {
    to: string;
    subject: string;
  };
}

export function EmailComposer({ onClose, replyTo }: EmailComposerProps) {
  const [to, setTo] = useState(replyTo?.to || '');
  const [subject, setSubject] = useState(replyTo?.subject || '');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [remixing, setRemixing] = useState(false);
  const [tone, setTone] = useState<'professional' | 'friendly' | 'brief' | 'detailed'>('professional');
  const [voiceAttachments, setVoiceAttachments] = useState<Array<{ blob: Blob; duration: number }>>([]);

  const handleAIRemix = async () => {
    if (!body || body.length < 10) {
      toast.error('Please write at least 10 characters to remix');
      return;
    }

    try {
      setRemixing(true);
      const response = await fetch('/api/ai/remix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: body, tone }),
      });

      const data = await response.json();

      if (data.remixed) {
        setBody(data.remixed);
        toast.success('✨ Email remixed!');
      } else {
        toast.error(data.error || 'Failed to remix');
      }
    } catch (error) {
      console.error('Remix error:', error);
      toast.error('Failed to remix email');
    } finally {
      setRemixing(false);
    }
  };

  const handleSend = async () => {
    if (!to || !subject || !body) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setSending(true);
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, body }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('📧 Email sent successfully!');
        onClose();
      } else {
        toast.error(data.error || 'Failed to send email');
      }
    } catch (error) {
      console.error('Send error:', error);
      toast.error('Failed to send email');
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>New Message</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {/* To */}
          <div className="space-y-2">
            <Label htmlFor="to">To</Label>
            <Input
              id="to"
              type="email"
              placeholder="recipient@example.com"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder="Email subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          {/* Body */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="body">Message</Label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Tone:</span>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value as any)}
                  className="text-xs border rounded px-2 py-1"
                >
                  <option value="professional">Professional</option>
                  <option value="friendly">Friendly</option>
                  <option value="brief">Brief</option>
                  <option value="detailed">Detailed</option>
                </select>
              </div>
            </div>
            <Textarea
              id="body"
              placeholder="Write your message here... You can use messy text - we'll polish it with AI!"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={12}
              className="resize-none"
            />
          </div>

          {/* Voice Message Recorder */}
          <VoiceMessageRecorder
            onRecorded={(blob, duration) => {
              setVoiceAttachments([...voiceAttachments, { blob, duration }]);
            }}
          />

          {/* AI Remix Hint */}
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-100 mb-1">
                  ✨ AI Features Available
                </h4>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  • <strong>AI Remix:</strong> Polish your text instantly<br />
                  • <strong>AI Dictate:</strong> Speak and get a perfect email<br />
                  • <strong>Voice Message:</strong> Add personality with audio
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleAIRemix}
              disabled={remixing || body.length < 10}
            >
              {remixing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Remixing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  AI Remix
                </>
              )}
            </Button>

            <VoiceInput
              onTranscript={(text) => setBody(text)}
              tone={tone}
            />
          </div>

          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSend} disabled={sending}>
              {sending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Email
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
