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
    messageId?: string;
    to: string | string[];
    cc?: string[];
    subject: string;
    body?: string;
    from?: string;
    date?: number;
    replyAll?: boolean;
    isForward?: boolean;
  };
}

export function EmailComposer({ onClose, replyTo }: EmailComposerProps) {
  // Format recipients
  const formatRecipients = (recipients?: string | string[]) => {
    if (!recipients) return '';
    return Array.isArray(recipients) ? recipients.join(', ') : recipients;
  };

  // Prepare initial values
  const initialTo = formatRecipients(replyTo?.to);
  const initialCc = formatRecipients(replyTo?.cc);
  const initialSubject = replyTo?.subject
    ? (replyTo.isForward
        ? `Fwd: ${replyTo.subject.replace(/^(Re:|Fwd:)\s*/i, '')}`
        : `Re: ${replyTo.subject.replace(/^Re:\s*/i, '')}`)
    : '';

  // Format quoted message
  const quotedBody = replyTo?.body && !replyTo.isForward
    ? `\n\n---\nOn ${replyTo.date ? new Date(replyTo.date * 1000).toLocaleString() : 'previous date'}, ${replyTo.from || 'sender'} wrote:\n\n${replyTo.body.replace(/^/gm, '> ')}`
    : replyTo?.isForward && replyTo?.body
    ? `\n\n---------- Forwarded message ---------\nFrom: ${replyTo.from}\nDate: ${replyTo.date ? new Date(replyTo.date * 1000).toLocaleString() : ''}\nSubject: ${replyTo.subject}\n\n${replyTo.body}`
    : '';

  const [to, setTo] = useState(initialTo);
  const [cc, setCc] = useState(initialCc);
  const [bcc, setBcc] = useState('');
  const [showCc, setShowCc] = useState(!!initialCc);
  const [showBcc, setShowBcc] = useState(false);
  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody] = useState(quotedBody);
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

      // Parse recipients (comma-separated)
      const toArray = to.split(',').map(e => e.trim()).filter(e => e);
      const ccArray = cc ? cc.split(',').map(e => e.trim()).filter(e => e) : [];
      const bccArray = bcc ? bcc.split(',').map(e => e.trim()).filter(e => e) : [];

      // Use reply endpoint if this is a reply, otherwise use send endpoint
      const endpoint = replyTo?.messageId ? '/api/messages/reply' : '/api/messages/send';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: toArray.length === 1 ? toArray[0] : toArray,
          ...(ccArray.length > 0 && { cc: ccArray }),
          ...(bccArray.length > 0 && { bcc: bccArray }),
          subject,
          body,
          ...(replyTo?.messageId && { messageId: replyTo.messageId, replyAll: replyTo.replyAll }),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(replyTo?.messageId ? '📧 Reply sent successfully!' : '📧 Email sent successfully!');
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
            <div className="flex items-center justify-between">
              <Label htmlFor="to">To</Label>
              <div className="flex gap-2">
                {!showCc && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCc(true)}
                    className="h-6 text-xs"
                  >
                    Cc
                  </Button>
                )}
                {!showBcc && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowBcc(true)}
                    className="h-6 text-xs"
                  >
                    Bcc
                  </Button>
                )}
              </div>
            </div>
            <Input
              id="to"
              type="email"
              placeholder="recipient@example.com (separate multiple with commas)"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>

          {/* CC */}
          {showCc && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="cc">Cc</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowCc(false);
                    setCc('');
                  }}
                  className="h-6 text-xs"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <Input
                id="cc"
                type="email"
                placeholder="cc@example.com (separate multiple with commas)"
                value={cc}
                onChange={(e) => setCc(e.target.value)}
              />
            </div>
          )}

          {/* BCC */}
          {showBcc && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="bcc">Bcc</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowBcc(false);
                    setBcc('');
                  }}
                  className="h-6 text-xs"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <Input
                id="bcc"
                type="email"
                placeholder="bcc@example.com (separate multiple with commas)"
                value={bcc}
                onChange={(e) => setBcc(e.target.value)}
              />
            </div>
          )}

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
