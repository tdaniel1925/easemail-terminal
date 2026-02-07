'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, CheckCircle2, Loader2, ExternalLink } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface EmailAccount {
  id: string;
  email: string;
  provider: string;
  email_provider: string;
  needs_oauth_connection: boolean;
  grant_id: string | null;
}

interface EmailConnectionStepProps {
  data: any;
  onNext: (data: any) => void;
  onBack?: () => void;
  saving?: boolean;
}

export function EmailConnectionStep({ data, onNext, onBack }: EmailConnectionStepProps) {
  const [loading, setLoading] = useState(true);
  const [emailAccounts, setEmailAccounts] = useState<EmailAccount[]>([]);
  const [connectedCount, setConnectedCount] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    loadEmailAccounts();
  }, []);

  const loadEmailAccounts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: accounts, error } = await supabase
        .from('email_accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true }) as { data: EmailAccount[] | null; error: any };

      if (error) {
        console.error('Error loading email accounts:', error);
        return;
      }

      setEmailAccounts(accounts || []);
      const connected = accounts?.filter(a => !a.needs_oauth_connection) || [];
      setConnectedCount(connected.length);
    } catch (error) {
      console.error('Error loading email accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectProvider = async (provider: 'gmail' | 'outlook') => {
    try {
      // Store onboarding state to return after OAuth
      sessionStorage.setItem('onboarding_in_progress', 'true');
      sessionStorage.setItem('onboarding_return_step', 'email-connection');

      // Redirect to OAuth flow
      if (provider === 'gmail') {
        window.location.href = '/api/oauth/gmail?onboarding=true';
      } else if (provider === 'outlook') {
        window.location.href = '/api/oauth/outlook?onboarding=true';
      }
    } catch (error) {
      console.error('Error connecting provider:', error);
      toast.error('Failed to start connection');
    }
  };

  const handleConnectAccount = async (account: EmailAccount) => {
    // Determine provider based on email_provider
    const provider = account.email_provider === 'gmail' ? 'gmail' :
                    account.email_provider === 'outlook' ? 'outlook' : null;

    if (!provider) {
      toast.error('This email provider is not yet supported for OAuth connection');
      return;
    }

    handleConnectProvider(provider);
  };

  const handleSkip = () => {
    onNext({ email_accounts_connected: connectedCount });
  };

  const handleContinue = () => {
    if (connectedCount === 0) {
      toast.error('Please connect at least one email account');
      return;
    }
    onNext({ email_accounts_connected: connectedCount });
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

  const preConfiguredAccounts = emailAccounts.filter(a => a.needs_oauth_connection);
  const connectedAccounts = emailAccounts.filter(a => !a.needs_oauth_connection);

  return (
    <Card className="border-0 shadow-2xl">
      <CardContent className="p-8 space-y-6">
        <div className="space-y-3">
          <h1 className="text-3xl font-bold">Connect Your Email</h1>
          <p className="text-muted-foreground">
            Connect your email accounts to start managing your inbox
          </p>
        </div>

        {/* Pre-configured accounts from admin */}
        {preConfiguredAccounts.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">
              Your admin added these accounts for you:
            </h3>
            <div className="space-y-2">
              {preConfiguredAccounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      account.email_provider === 'gmail'
                        ? 'bg-red-50'
                        : account.email_provider === 'outlook'
                        ? 'bg-blue-50'
                        : 'bg-gray-50'
                    }`}>
                      <Mail className={`h-5 w-5 ${
                        account.email_provider === 'gmail'
                          ? 'text-red-600'
                          : account.email_provider === 'outlook'
                          ? 'text-blue-600'
                          : 'text-gray-600'
                      }`} />
                    </div>
                    <div>
                      <div className="font-medium">{account.email}</div>
                      <div className="text-xs text-gray-500 capitalize">
                        {account.email_provider} Account
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleConnectAccount(account)}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Connect Now
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Connected accounts */}
        {connectedAccounts.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">
              Connected Accounts:
            </h3>
            <div className="space-y-2">
              {connectedAccounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-4 border border-green-200 bg-green-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="font-medium">{account.email}</div>
                      <div className="text-xs text-green-700">
                        Connected successfully
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Active
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add new account buttons */}
        {preConfiguredAccounts.length === 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">
              Connect an email provider:
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-auto py-6 flex flex-col items-center gap-2"
                onClick={() => handleConnectProvider('gmail')}
              >
                <div className="p-3 bg-red-50 rounded-lg">
                  <Mail className="h-6 w-6 text-red-600" />
                </div>
                <span className="font-semibold">Gmail</span>
                <span className="text-xs text-gray-500">Connect Google account</span>
              </Button>

              <Button
                variant="outline"
                className="h-auto py-6 flex flex-col items-center gap-2"
                onClick={() => handleConnectProvider('outlook')}
              >
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Mail className="h-6 w-6 text-blue-600" />
                </div>
                <span className="font-semibold">Outlook</span>
                <span className="text-xs text-gray-500">Connect Microsoft account</span>
              </Button>
            </div>
          </div>
        )}

        {/* Info box */}
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>Secure Connection:</strong> We use OAuth 2.0 for secure authentication.
            We never store your email password.
          </p>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-3 pt-4">
          {onBack && (
            <Button
              variant="outline"
              onClick={onBack}
              className="flex-1"
            >
              Back
            </Button>
          )}
          {connectedCount > 0 ? (
            <Button
              onClick={handleContinue}
              className="flex-1"
            >
              Continue ({connectedCount} connected)
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={handleSkip}
              className="flex-1"
            >
              Skip for Now
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
