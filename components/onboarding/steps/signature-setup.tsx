'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Mail, Loader2, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface EmailAccount {
  id: string;
  email: string;
  provider: string;
}

interface SignatureTemplate {
  id: string;
  name: string;
  description: string;
  content: string;
  category: string;
}

interface SignatureSetupStepProps {
  data: any;
  onNext: (data: any) => void;
  onBack?: () => void;
  saving?: boolean;
}

export function SignatureSetupStep({ data, onNext, onBack }: SignatureSetupStepProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [emailAccounts, setEmailAccounts] = useState<EmailAccount[]>([]);
  const [templates, setTemplates] = useState<SignatureTemplate[]>([]);
  const [signatures, setSignatures] = useState<Record<string, string>>({});
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load user name
      const { data: userData } = await supabase
        .from('users')
        .select('name')
        .eq('id', user.id)
        .single() as { data: { name: string } | null };

      if (userData) {
        setUserName(userData.name);
      }

      // Load connected email accounts
      const { data: accounts } = await supabase
        .from('email_accounts')
        .select('id, email, provider')
        .eq('user_id', user.id)
        .eq('needs_oauth_connection', false) as { data: EmailAccount[] | null };

      setEmailAccounts(accounts || []);

      // Initialize signatures for each account
      const initialSignatures: Record<string, string> = {};
      accounts?.forEach(account => {
        initialSignatures[account.id] = '';
      });
      setSignatures(initialSignatures);

      // Load signature templates
      const { data: templateData } = await supabase
        .from('signature_templates')
        .select('*')
        .eq('is_system_template', true)
        .order('name');

      setTemplates(templateData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyTemplate = (templateContent: string) => {
    // Replace placeholders with user data
    const populated = templateContent
      .replace(/\{\{name\}\}/g, userName)
      .replace(/\{\{title\}\}/g, '')
      .replace(/\{\{company\}\}/g, '')
      .replace(/\{\{phone\}\}/g, '')
      .replace(/\{\{email\}\}/g, '');

    // Apply to all email accounts
    const updatedSignatures: Record<string, string> = {};
    emailAccounts.forEach(account => {
      updatedSignatures[account.id] = populated.replace(/\{\{email\}\}/g, account.email);
    });
    setSignatures(updatedSignatures);
  };

  const handleSaveSignatures = async () => {
    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Save signatures for each email account
      const signaturesToSave = emailAccounts
        .filter(account => signatures[account.id]?.trim())
        .map(account => ({
          user_id: user.id,
          email_account_id: account.id,
          name: `${account.email} Signature`,
          content: signatures[account.id],
          is_default: emailAccounts.length === 1, // Set as default if only one account
          created_during_onboarding: true,
        }));

      if (signaturesToSave.length > 0) {
        const { error } = await (supabase
          .from('signatures') as any)
          .insert(signaturesToSave);

        if (error) {
          console.error('Error saving signatures:', error);
          toast.error('Failed to save signatures');
          setSaving(false);
          return;
        }

        toast.success(`${signaturesToSave.length} signature(s) created!`);
      }

      onNext({ signatures_created: signaturesToSave.length });
    } catch (error) {
      console.error('Error saving signatures:', error);
      toast.error('Failed to save signatures');
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    onNext({ signatures_created: 0 });
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-2xl">
        <CardContent className="p-8 flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </CardContent>
      </Card>
    );
  }

  if (emailAccounts.length === 0) {
    // No email accounts connected, skip this step
    return (
      <Card className="border-0 shadow-2xl">
        <CardContent className="p-8 space-y-6">
          <div className="space-y-3">
            <h1 className="text-3xl font-bold">Email Signatures</h1>
            <p className="text-muted-foreground">
              You haven't connected any email accounts yet. You can add signatures later from Settings.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            {onBack && (
              <Button variant="outline" onClick={onBack} className="flex-1">
                Back
              </Button>
            )}
            <Button onClick={handleSkip} className="flex-1">
              Continue
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-2xl">
      <CardContent className="p-8 space-y-6">
        <div className="space-y-3">
          <h1 className="text-3xl font-bold">Create Email Signatures</h1>
          <p className="text-muted-foreground">
            Add professional signatures to your emails
          </p>
        </div>

        {/* Template Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-600" />
            Choose a Template (Optional)
          </Label>
          <div className="grid grid-cols-2 gap-2">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => {
                  setSelectedTemplate(template.id);
                  applyTemplate(template.content);
                }}
                className={`p-3 text-left border rounded-lg transition-all ${
                  selectedTemplate === template.id
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="font-medium text-sm">{template.name}</div>
                <div className="text-xs text-gray-500">{template.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Signature Editor for Each Account */}
        <div className="space-y-4">
          <Label className="text-sm font-semibold">
            Customize Signatures:
          </Label>
          {emailAccounts.map((account) => (
            <div key={account.id} className="space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium">{account.email}</span>
                <Badge variant="secondary" className="text-xs">
                  {account.provider}
                </Badge>
              </div>
              <Textarea
                value={signatures[account.id] || ''}
                onChange={(e) => setSignatures({
                  ...signatures,
                  [account.id]: e.target.value,
                })}
                placeholder={`Best regards,\n${userName}\n${account.email}`}
                rows={4}
                className="font-mono text-sm"
              />
            </div>
          ))}
        </div>

        {/* Info Box */}
        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-3">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            💡 Tip: You can edit or add more signatures later in Settings
          </p>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-3 pt-4">
          {onBack && (
            <Button
              variant="outline"
              onClick={onBack}
              disabled={saving}
              className="flex-1"
            >
              Back
            </Button>
          )}
          <Button
            variant="outline"
            onClick={handleSkip}
            disabled={saving}
            className="flex-1"
          >
            Skip for Now
          </Button>
          <Button
            onClick={handleSaveSignatures}
            disabled={saving || !Object.values(signatures).some(s => s.trim())}
            className="flex-1"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save & Continue'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
