'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, Send, Loader2, X, Mic, Paperclip, Save, FileText, BookmarkPlus, Clock, AlertCircle, Eye, Smile, Flag, Undo2, Zap, Braces } from 'lucide-react';
import { toast } from 'sonner';
import { useHotkeys } from 'react-hotkeys-hook';
import dynamic from 'next/dynamic';
import { VoiceInput } from '@/components/features/voice-input';
import { VoiceMessageRecorder } from '@/components/features/voice-message-recorder';
import { AttachmentUploader } from '@/components/email/attachment-uploader';
import { TiptapEditor } from '@/components/ui/tiptap-editor';
import { RecipientInput } from '@/components/ui/recipient-input';
import { DEFAULT_VARIABLES, replaceTemplateVariables, getRecipientVariables, hasTemplateVariables } from '@/lib/template-variables';
import { hasURLs, detectURLs, highlightURLs } from '@/lib/link-utils';

// Dynamically import emoji picker to avoid SSR issues
const EmojiPicker = dynamic(
  () => import('emoji-picker-react'),
  { ssr: false }
);

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
  const [attachments, setAttachments] = useState<Array<{ id: string; name: string; size: number; type: string; file: File }>>([]);

  // Draft-related state
  const [draftId, setDraftId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Template-related state
  const [templates, setTemplates] = useState<any[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateCategory, setTemplateCategory] = useState('');

  // Schedule-related state
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [scheduling, setScheduling] = useState(false);

  // AI Remix subject confirmation state
  const [showSubjectConfirm, setShowSubjectConfirm] = useState(false);
  const [suggestedSubject, setSuggestedSubject] = useState('');
  const [pendingBody, setPendingBody] = useState('');

  // New feature states
  const [priority, setPriority] = useState<'normal' | 'high' | 'low'>('normal');
  const [showPreview, setShowPreview] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [undoSendCountdown, setUndoSendCountdown] = useState<number | null>(null);
  const undoSendTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Signature states
  const [signatures, setSignatures] = useState<any[]>([]);
  const [selectedSignature, setSelectedSignature] = useState<string>('');

  // Canned responses states
  const [showCannedResponses, setShowCannedResponses] = useState(false);
  const [cannedResponseSearch, setCannedResponseSearch] = useState('');
  const [filteredTemplates, setFilteredTemplates] = useState<any[]>([]);

  // Template variables states
  const [showVariables, setShowVariables] = useState(false);

  // Save draft function
  const saveDraft = async (showToast: boolean = false) => {
    // Don't save empty drafts
    if (!to && !subject && !body) {
      return;
    }

    try {
      setSaving(true);

      // Parse recipients
      const toArray = to ? to.split(',').map(e => e.trim()).filter(e => e) : [];
      const ccArray = cc ? cc.split(',').map(e => e.trim()).filter(e => e) : [];
      const bccArray = bcc ? bcc.split(',').map(e => e.trim()).filter(e => e) : [];

      const draftData = {
        to_recipients: toArray,
        cc_recipients: ccArray,
        bcc_recipients: bccArray,
        subject: subject || '',
        body: body || '',
        reply_to_message_id: replyTo?.messageId,
        is_forward: replyTo?.isForward || false,
      };

      if (draftId) {
        // Update existing draft
        const response = await fetch(`/api/drafts/${draftId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(draftData),
        });

        if (response.ok) {
          setLastSaved(new Date());
          if (showToast) toast.success('💾 Draft saved');
        }
      } else {
        // Create new draft
        const response = await fetch('/api/drafts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(draftData),
        });

        const data = await response.json();

        if (response.ok && data.draft) {
          setDraftId(data.draft.id);
          setLastSaved(new Date());
          if (showToast) toast.success('💾 Draft saved');
        }
      }
    } catch (error) {
      console.error('Save draft error:', error);
      if (showToast) toast.error('Failed to save draft');
    } finally {
      setSaving(false);
    }
  };

  // Delete draft function
  const deleteDraft = async () => {
    if (!draftId) return;

    try {
      await fetch(`/api/drafts/${draftId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Delete draft error:', error);
    }
  };

  // Template functions
  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/templates');
      const data = await response.json();
      if (response.ok && data.templates) {
        setTemplates(data.templates);
      }
    } catch (error) {
      console.error('Fetch templates error:', error);
    }
  };

  const useTemplate = (template: any) => {
    setSubject(template.subject || '');
    setBody(template.body || '');
    setShowTemplates(false);
    toast.success(`📄 Template "${template.name}" loaded`);
  };

  const insertCannedResponse = (template: any) => {
    // Insert at the end of current body content
    setBody((currentBody) => {
      const separator = currentBody ? '\n\n' : '';
      return currentBody + separator + template.body;
    });
    setShowCannedResponses(false);
    toast.success(`✨ Inserted "${template.name}"`);
  };

  const insertVariable = (variable: string) => {
    setBody((currentBody) => currentBody + variable);
    setShowVariables(false);
    toast.success(`Added ${variable}`);
  };

  const saveAsTemplate = async () => {
    if (!templateName || !body) {
      toast.error('Please provide template name and content');
      return;
    }

    try {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: templateName,
          subject,
          body,
          category: templateCategory || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('📚 Template saved successfully');
        setShowSaveTemplate(false);
        setTemplateName('');
        setTemplateCategory('');
      } else {
        toast.error(data.error || 'Failed to save template');
      }
    } catch (error) {
      console.error('Save template error:', error);
      toast.error('Failed to save template');
    }
  };

  // Signature functions
  const fetchSignatures = async () => {
    try {
      const response = await fetch('/api/signatures');
      const data = await response.json();
      if (response.ok && data.signatures) {
        setSignatures(data.signatures);
        // Auto-insert default signature if available and body is empty
        const defaultSig = data.signatures.find((sig: any) => sig.is_default);
        if (defaultSig && !body) {
          insertSignature(defaultSig.content);
          setSelectedSignature(defaultSig.id);
        }
      }
    } catch (error) {
      console.error('Fetch signatures error:', error);
    }
  };

  const insertSignature = (signatureContent: string) => {
    const separator = '\n\n---\n\n';
    setBody((currentBody) => {
      // Remove any existing signature (content after ---)
      const bodyWithoutSig = currentBody.split('---')[0].trim();
      return bodyWithoutSig + separator + signatureContent;
    });
  };

  const handleSignatureChange = (signatureId: string) => {
    setSelectedSignature(signatureId);
    if (signatureId) {
      const signature = signatures.find((sig) => sig.id === signatureId);
      if (signature) {
        insertSignature(signature.content);
      }
    } else {
      // Remove signature
      setBody((currentBody) => currentBody.split('---')[0].trim());
    }
  };

  // Fetch signatures when composer opens
  useEffect(() => {
    fetchSignatures();
  }, []);

  // Filter templates for canned responses
  useEffect(() => {
    if (cannedResponseSearch) {
      const filtered = templates.filter((template) =>
        template.name.toLowerCase().includes(cannedResponseSearch.toLowerCase()) ||
        (template.category && template.category.toLowerCase().includes(cannedResponseSearch.toLowerCase()))
      );
      setFilteredTemplates(filtered);
    } else {
      setFilteredTemplates(templates);
    }
  }, [cannedResponseSearch, templates]);

  const handleScheduleSend = async () => {
    if (!to || !subject || !body) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!scheduleDate || !scheduleTime) {
      toast.error('Please select date and time');
      return;
    }

    try {
      setScheduling(true);

      // Combine date and time
      const scheduledFor = new Date(`${scheduleDate}T${scheduleTime}`);

      if (scheduledFor <= new Date()) {
        toast.error('Scheduled time must be in the future');
        return;
      }

      // Parse recipients
      const toArray = to.split(',').map(e => e.trim()).filter(e => e);
      const ccArray = cc ? cc.split(',').map(e => e.trim()).filter(e => e) : [];
      const bccArray = bcc ? bcc.split(',').map(e => e.trim()).filter(e => e) : [];

      // Process attachments if any
      let processedAttachments: any[] | null = null;
      if (attachments.length > 0) {
        const formData = new FormData();
        attachments.forEach((attachment) => formData.append('files', attachment.file));

        const uploadResponse = await fetch('/api/attachments/upload', {
          method: 'POST',
          body: formData,
        });

        const uploadData = await uploadResponse.json();
        if (uploadResponse.ok && uploadData.attachments) {
          processedAttachments = uploadData.attachments;
        }
      }

      const response = await fetch('/api/scheduled-emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: toArray,
          cc: ccArray.length > 0 ? ccArray : undefined,
          bcc: bccArray.length > 0 ? bccArray : undefined,
          subject,
          body,
          attachments: processedAttachments,
          scheduledFor: scheduledFor.toISOString(),
          reply_to_message_id: replyTo?.messageId,
          is_forward: replyTo?.isForward,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`📅 ${data.message}`);

        // Delete draft if exists
        await deleteDraft();

        // Close composer
        onClose();
      } else {
        toast.error(data.error || 'Failed to schedule email');
      }
    } catch (error) {
      console.error('Schedule email error:', error);
      toast.error('Failed to schedule email');
    } finally {
      setScheduling(false);
    }
  };

  // Auto-save effect - every 30 seconds
  useEffect(() => {
    // Clear any existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Set new timer
    autoSaveTimerRef.current = setTimeout(() => {
      if (to || subject || body) {
        saveDraft(false); // Auto-save silently
      }
    }, 30000); // 30 seconds

    // Cleanup
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [to, cc, bcc, subject, body]); // Re-run when any field changes

  // Keyboard shortcuts
  useHotkeys('ctrl+enter,meta+enter', (e) => {
    e.preventDefault();
    if (!sending && to && subject && body) {
      handleSend();
    }
  }, { enableOnFormTags: ['INPUT', 'TEXTAREA'] });

  useHotkeys('ctrl+s,meta+s', (e) => {
    e.preventDefault();
    saveDraft(true);
  }, { enableOnFormTags: ['INPUT', 'TEXTAREA'] });

  useHotkeys('ctrl+shift+s,meta+shift+s', (e) => {
    e.preventDefault();
    setShowSchedule(true);
  }, { enableOnFormTags: ['INPUT', 'TEXTAREA'] });

  useHotkeys('ctrl+e,meta+e', (e) => {
    e.preventDefault();
    setShowEmojiPicker(!showEmojiPicker);
  }, { enableOnFormTags: ['INPUT', 'TEXTAREA'] });

  useHotkeys('ctrl+slash,meta+slash', (e) => {
    e.preventDefault();
    setShowCannedResponses(!showCannedResponses);
  }, { enableOnFormTags: ['INPUT', 'TEXTAREA'] });

  useHotkeys('escape', () => {
    if (showEmojiPicker) {
      setShowEmojiPicker(false);
    } else if (showCannedResponses) {
      setShowCannedResponses(false);
    } else if (showPreview) {
      setShowPreview(false);
    } else {
      onClose();
    }
  });

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
        // If user already has a subject and AI suggested one, confirm
        if (subject && data.suggestedSubject) {
          setPendingBody(data.remixed);
          setSuggestedSubject(data.suggestedSubject);
          setShowSubjectConfirm(true);
        } else {
          // No existing subject, just apply everything
          setBody(data.remixed);
          if (data.suggestedSubject && !subject) {
            setSubject(data.suggestedSubject);
            toast.success('✨ Email remixed with suggested subject!');
          } else {
            toast.success('✨ Email remixed!');
          }
        }
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

  const applyAISubject = (useAISubject: boolean) => {
    setBody(pendingBody);
    if (useAISubject && suggestedSubject) {
      setSubject(suggestedSubject);
    }
    setShowSubjectConfirm(false);
    setPendingBody('');
    setSuggestedSubject('');
    toast.success('✨ Email remixed!');
  };

  const cancelUndoSend = () => {
    if (undoSendTimerRef.current) {
      clearInterval(undoSendTimerRef.current);
      undoSendTimerRef.current = null;
    }
    setUndoSendCountdown(null);
    setSending(false);
    toast.success('Send cancelled');
  };

  const actualSend = async () => {
    try {

      // Parse recipients (comma-separated)
      const toArray = to.split(',').map(e => e.trim()).filter(e => e);
      const ccArray = cc ? cc.split(',').map(e => e.trim()).filter(e => e) : [];
      const bccArray = bcc ? bcc.split(',').map(e => e.trim()).filter(e => e) : [];

      // Replace template variables if present
      let processedSubject = subject;
      let processedBody = body;

      if (hasTemplateVariables(subject) || hasTemplateVariables(body)) {
        // Get variables for the first recipient
        const primaryRecipient = toArray[0];
        if (primaryRecipient) {
          const variables = await getRecipientVariables(primaryRecipient);
          processedSubject = replaceTemplateVariables(subject, variables);
          processedBody = replaceTemplateVariables(body, variables);
        }
      }

      // Process attachments if any
      let processedAttachments: any[] = [];
      if (attachments.length > 0) {
        const formData = new FormData();
        attachments.forEach((attachment) => {
          formData.append('files', attachment.file);
        });

        const uploadResponse = await fetch('/api/attachments/upload', {
          method: 'POST',
          body: formData,
        });

        const uploadData = await uploadResponse.json();
        if (uploadResponse.ok && uploadData.attachments) {
          processedAttachments = uploadData.attachments;
        } else {
          toast.error('Failed to process attachments');
          setSending(false);
          return;
        }
      }

      // Use reply endpoint if this is a reply, otherwise use send endpoint
      const endpoint = replyTo?.messageId ? '/api/messages/reply' : '/api/messages/send';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: toArray.length === 1 ? toArray[0] : toArray,
          ...(ccArray.length > 0 && { cc: ccArray }),
          ...(bccArray.length > 0 && { bcc: bccArray }),
          subject: processedSubject,
          body: processedBody,
          ...(processedAttachments.length > 0 && { attachments: processedAttachments }),
          ...(replyTo?.messageId && { messageId: replyTo.messageId, replyAll: replyTo.replyAll }),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Delete draft after successful send
        await deleteDraft();

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
      setUndoSendCountdown(null);
    }
  };

  const handleSend = () => {
    if (!to || !subject || !body) {
      toast.error('Please fill in all fields');
      return;
    }

    // Start undo countdown
    setSending(true);
    setUndoSendCountdown(5);

    let countdown = 5;
    undoSendTimerRef.current = setInterval(() => {
      countdown -= 1;
      setUndoSendCountdown(countdown);

      if (countdown <= 0) {
        if (undoSendTimerRef.current) {
          clearInterval(undoSendTimerRef.current);
          undoSendTimerRef.current = null;
        }
        actualSend();
      }
    }, 1000);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>New Message</DialogTitle>
            {/* Auto-save indicator */}
            <div className="text-xs text-muted-foreground">
              {saving ? (
                <span className="flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Saving...
                </span>
              ) : lastSaved ? (
                <span>Saved {new Date(lastSaved).toLocaleTimeString()}</span>
              ) : null}
            </div>
          </div>
        </DialogHeader>

        <TooltipProvider>
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
            <RecipientInput
              id="to"
              placeholder="recipient@example.com (separate multiple with commas)"
              value={to}
              onChange={setTo}
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
              <RecipientInput
                id="cc"
                placeholder="cc@example.com (separate multiple with commas)"
                value={cc}
                onChange={setCc}
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
              <RecipientInput
                id="bcc"
                placeholder="bcc@example.com (separate multiple with commas)"
                value={bcc}
                onChange={setBcc}
              />
            </div>
          )}

          {/* Subject */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="subject">Subject</Label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Priority:</span>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="text-xs border rounded px-2 py-1"
                >
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="low">Low</option>
                </select>
                {priority === 'high' && <Flag className="h-4 w-4 text-red-500" />}
              </div>
            </div>
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
              <div className="flex items-center gap-2">
                <Label htmlFor="body">Message</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    >
                      <Smile className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Add emoji (Ctrl/Cmd+E)</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => {
                        fetchTemplates();
                        setShowCannedResponses(!showCannedResponses);
                      }}
                    >
                      <Zap className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Insert canned response (Ctrl/Cmd+/)</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => setShowVariables(!showVariables)}
                    >
                      <Braces className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Insert template variable</TooltipContent>
                </Tooltip>
              </div>
              <div className="flex items-center gap-4">
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
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Signature:</span>
                  <select
                    value={selectedSignature}
                    onChange={(e) => handleSignatureChange(e.target.value)}
                    className="text-xs border rounded px-2 py-1"
                  >
                    <option value="">None</option>
                    {signatures.map((sig) => (
                      <option key={sig.id} value={sig.id}>
                        {sig.name} {sig.is_default ? '(Default)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            {showEmojiPicker && (
              <div className="relative">
                <div className="absolute z-50 top-0 left-0 shadow-lg">
                  <EmojiPicker
                    onEmojiClick={(emojiData) => {
                      setBody(body + emojiData.emoji);
                      setShowEmojiPicker(false);
                    }}
                  />
                </div>
              </div>
            )}
            <TiptapEditor
              content={body}
              onChange={setBody}
              placeholder="Write your message here... You can use messy text - we'll polish it with AI!"
              minHeight="300px"
            />
          </div>

          {/* Voice Message Recorder */}
          <VoiceMessageRecorder
            onRecorded={(blob, duration) => {
              setVoiceAttachments([...voiceAttachments, { blob, duration }]);
            }}
          />

          {/* File Attachments */}
          <AttachmentUploader
            attachments={attachments}
            onAttachmentsChange={setAttachments}
            maxSize={25}
            maxFiles={10}
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
        </TooltipProvider>

        {/* Actions */}
        <TooltipProvider>
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="flex gap-2 flex-wrap">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    onClick={() => {
                      fetchTemplates();
                      setShowTemplates(true);
                    }}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Use Template
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Load a saved email template</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    onClick={() => setShowSaveTemplate(true)}
                    disabled={!body}
                  >
                    <BookmarkPlus className="mr-2 h-4 w-4" />
                    Save as Template
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Save this email as a reusable template</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
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
                </TooltipTrigger>
                <TooltipContent>Polish your email with AI and get a subject suggestion</TooltipContent>
              </Tooltip>

              <VoiceInput
                onTranscript={(text) => setBody(text)}
                tone={tone}
              />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    onClick={() => saveDraft(true)}
                    disabled={saving || (!to && !subject && !body)}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Draft
                      </>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Save as draft (auto-saves every 30s)</TooltipContent>
              </Tooltip>
            </div>

            <div className="flex gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" onClick={onClose}>
                    Cancel
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Close without sending</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" onClick={() => setShowPreview(true)}>
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Preview email before sending</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" onClick={() => setShowSchedule(true)}>
                    <Clock className="mr-2 h-4 w-4" />
                    Schedule
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Schedule this email to send later (Ctrl/Cmd+Shift+S)</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={handleSend} disabled={sending || undoSendCountdown !== null}>
                    {undoSendCountdown !== null ? (
                      <>
                        <Undo2 className="mr-2 h-4 w-4" />
                        Undo ({undoSendCountdown}s)
                      </>
                    ) : sending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Now
                      </>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Send email immediately (Ctrl/Cmd+Enter)</TooltipContent>
              </Tooltip>

              {undoSendCountdown !== null && (
                <Button variant="destructive" onClick={cancelUndoSend}>
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </TooltipProvider>
      </DialogContent>

      {/* Templates Selection Dialog */}
      {showTemplates && (
        <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>Choose a Template</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 mt-4">
              {templates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No templates yet. Create your first template!</p>
                </div>
              ) : (
                templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => useTemplate(template)}
                    className="w-full text-left p-4 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold">{template.name}</h3>
                        {template.subject && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Subject: {template.subject}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                          {template.body}
                        </p>
                      </div>
                      {template.category && (
                        <Badge variant="secondary" className="ml-2">
                          {template.category}
                        </Badge>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Save as Template Dialog */}
      {showSaveTemplate && (
        <Dialog open={showSaveTemplate} onOpenChange={setShowSaveTemplate}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save as Template</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="template-name">Template Name *</Label>
                <Input
                  id="template-name"
                  placeholder="e.g., Meeting Follow-up"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="template-category">Category (optional)</Label>
                <Input
                  id="template-category"
                  placeholder="e.g., work, personal, marketing"
                  value={templateCategory}
                  onChange={(e) => setTemplateCategory(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="ghost" onClick={() => setShowSaveTemplate(false)}>
                  Cancel
                </Button>
                <Button onClick={saveAsTemplate}>
                  <BookmarkPlus className="mr-2 h-4 w-4" />
                  Save Template
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Schedule Send Dialog */}
      {showSchedule && (
        <Dialog open={showSchedule} onOpenChange={setShowSchedule}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule Email</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="schedule-date">Date *</Label>
                <Input
                  id="schedule-date"
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <Label htmlFor="schedule-time">Time *</Label>
                <Input
                  id="schedule-time"
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                />
              </div>
              {scheduleDate && scheduleTime && (
                <div className="bg-accent/50 p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Email will be sent on{' '}
                    <strong>
                      {new Date(`${scheduleDate}T${scheduleTime}`).toLocaleString()}
                    </strong>
                  </p>
                </div>
              )}
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="ghost" onClick={() => setShowSchedule(false)}>
                  Cancel
                </Button>
                <Button onClick={handleScheduleSend} disabled={scheduling}>
                  {scheduling ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Scheduling...
                    </>
                  ) : (
                    <>
                      <Clock className="mr-2 h-4 w-4" />
                      Schedule Send
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Subject Confirmation Dialog */}
      {showSubjectConfirm && (
        <Dialog open={showSubjectConfirm} onOpenChange={setShowSubjectConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Use AI-Suggested Subject?</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label className="text-sm text-muted-foreground">Your Current Subject:</Label>
                <div className="mt-1 p-3 bg-accent/50 rounded-lg">
                  <p className="font-medium">{subject}</p>
                </div>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">AI-Suggested Subject:</Label>
                <div className="mt-1 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="font-medium text-blue-900 dark:text-blue-100">{suggestedSubject}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Would you like to replace your current subject with the AI-suggested one?
              </p>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => applyAISubject(false)}>
                  Keep Mine
                </Button>
                <Button onClick={() => applyAISubject(true)}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Use AI Subject
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Email Preview Dialog */}
      {showPreview && (
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Email Preview</DialogTitle>
            </DialogHeader>
            <ScrollArea className="flex-1 mt-4">
              <div className="space-y-4">
                {/* Preview Header */}
                <div className="border-b pb-4 space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-sm font-medium text-muted-foreground w-16">To:</span>
                    <span className="text-sm flex-1">{to}</span>
                  </div>
                  {cc && (
                    <div className="flex items-start gap-2">
                      <span className="text-sm font-medium text-muted-foreground w-16">Cc:</span>
                      <span className="text-sm flex-1">{cc}</span>
                    </div>
                  )}
                  {bcc && (
                    <div className="flex items-start gap-2">
                      <span className="text-sm font-medium text-muted-foreground w-16">Bcc:</span>
                      <span className="text-sm flex-1">{bcc}</span>
                    </div>
                  )}
                  <div className="flex items-start gap-2">
                    <span className="text-sm font-medium text-muted-foreground w-16">Subject:</span>
                    <span className="text-sm flex-1 font-semibold">{subject || '(no subject)'}</span>
                    {priority === 'high' && (
                      <Badge variant="destructive" className="ml-2">
                        <Flag className="h-3 w-3 mr-1" />
                        High Priority
                      </Badge>
                    )}
                    {priority === 'low' && (
                      <Badge variant="secondary" className="ml-2">
                        Low Priority
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Preview Body */}
                <div className="prose dark:prose-invert max-w-none">
                  <div
                    className="whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: highlightURLs(body.replace(/</g, '&lt;').replace(/>/g, '&gt;')) }}
                  />
                </div>

                {/* Link Preview Info */}
                {hasURLs(body) && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-center gap-2 text-sm">
                      <AlertCircle className="h-4 w-4 text-blue-600" />
                      <span className="text-blue-900 dark:text-blue-100">
                        {detectURLs(body).length} link(s) detected and will be clickable
                      </span>
                    </div>
                  </div>
                )}

                {/* Attachments */}
                {attachments.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium mb-2">Attachments ({attachments.length})</h4>
                    <div className="space-y-2">
                      {attachments.map((attachment) => (
                        <div
                          key={attachment.id}
                          className="flex items-center gap-2 p-2 bg-accent rounded-lg"
                        >
                          <Paperclip className="h-4 w-4" />
                          <span className="text-sm">{attachment.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({(attachment.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Warnings */}
                <div className="space-y-2">
                  {!subject && (
                    <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm text-yellow-900 dark:text-yellow-100">
                        Subject line is empty
                      </span>
                    </div>
                  )}
                  {body.toLowerCase().includes('attach') && attachments.length === 0 && (
                    <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm text-yellow-900 dark:text-yellow-100">
                        You mentioned an attachment but none are attached
                      </span>
                    </div>
                  )}
                  {to.split(',').length > 10 && (
                    <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <AlertCircle className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-blue-900 dark:text-blue-100">
                        This email will be sent to {to.split(',').length} recipients
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowPreview(false)}>
                Edit
              </Button>
              <Button onClick={() => {
                setShowPreview(false);
                handleSend();
              }}>
                <Send className="mr-2 h-4 w-4" />
                Send Now
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Canned Responses Dialog */}
      {showCannedResponses && (
        <Dialog open={showCannedResponses} onOpenChange={setShowCannedResponses}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>Insert Canned Response</DialogTitle>
            </DialogHeader>

            {/* Search */}
            <div className="mt-4">
              <Input
                placeholder="Search canned responses..."
                value={cannedResponseSearch}
                onChange={(e) => setCannedResponseSearch(e.target.value)}
                autoFocus
              />
            </div>

            {/* Templates List */}
            <div className="space-y-3 mt-4">
              {filteredTemplates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Zap className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  {cannedResponseSearch ? (
                    <p>No canned responses found matching "{cannedResponseSearch}"</p>
                  ) : (
                    <>
                      <p>No canned responses yet.</p>
                      <p className="text-sm mt-2">Create templates in Settings to use as quick responses.</p>
                    </>
                  )}
                </div>
              ) : (
                filteredTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => insertCannedResponse(template)}
                    className="w-full text-left p-4 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold">{template.name}</h3>
                        {template.subject && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Subject: {template.subject}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                          {template.body.replace(/<[^>]*>/g, '')}
                        </p>
                      </div>
                      {template.category && (
                        <Badge variant="secondary" className="ml-2">
                          {template.category}
                        </Badge>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Template Variables Dialog */}
      {showVariables && (
        <Dialog open={showVariables} onOpenChange={setShowVariables}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Insert Template Variable</DialogTitle>
            </DialogHeader>

            <div className="space-y-2 mt-4">
              <p className="text-sm text-muted-foreground mb-4">
                Click a variable to insert it. Variables will be automatically replaced when sending.
              </p>
              {DEFAULT_VARIABLES.map((variable) => (
                <button
                  key={variable.key}
                  onClick={() => insertVariable(variable.key)}
                  className="w-full text-left p-3 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                          {variable.key}
                        </code>
                        <span className="text-sm font-medium">{variable.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {variable.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                How it works
              </h4>
              <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Variables are replaced with actual values when sending</li>
                <li>• Values are extracted from the first recipient's contact info</li>
                <li>• Great for personalized email campaigns and templates</li>
              </ul>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
}
