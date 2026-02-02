'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Sparkles, Send, Loader2, X, Mic, Paperclip, Save, FileText, BookmarkPlus, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { VoiceInput } from '@/components/features/voice-input';
import { VoiceMessageRecorder } from '@/components/features/voice-message-recorder';
import { AttachmentUploader } from '@/components/email/attachment-uploader';

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
          subject,
          body,
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
    }
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
                  <Button variant="outline" onClick={() => setShowSchedule(true)}>
                    <Clock className="mr-2 h-4 w-4" />
                    Schedule
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Schedule this email to send later</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={handleSend} disabled={sending}>
                    {sending ? (
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
                <TooltipContent>Send email immediately</TooltipContent>
              </Tooltip>
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
    </Dialog>
  );
}
