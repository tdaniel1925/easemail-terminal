'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, CheckCircle2, Loader2, ExternalLink, Server } from 'lucide-react';
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
  const [connecting, setConnecting] = useState<string | null>(null);
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

  const handleConnectProvider = async (provider: 'google' | 'microsoft' | 'imap') => {
    setConnecting(provider);

    try {
      // Store onboarding state to return after OAuth
      sessionStorage.setItem('onboarding_in_progress', 'true');
      sessionStorage.setItem('onboarding_return_step', 'email-connection');

      if (provider === 'imap') {
        // Redirect to email accounts settings for manual IMAP setup
        window.location.href = '/app/settings/email-accounts?setup=imap&return=onboarding';
      } else {
        // Call Nylas OAuth API
        const response = await fetch('/api/nylas/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ provider }),
        });

        // Check if the response is OK
        if (!response.ok) {
          const errorText = await response.text();
          console.error('OAuth API error:', response.status, errorText);
          throw new Error(`OAuth API returned ${response.status}: ${errorText}`);
        }

        const responseData = await response.json();
        console.log('OAuth response:', responseData);

        if (responseData.url) {
          console.log('Redirecting to OAuth URL:', responseData.url);
          // Redirect to Nylas OAuth URL
          window.location.href = responseData.url;
        } else {
          console.error('No URL in response:', responseData);
          throw new Error(responseData.error || 'Failed to get OAuth URL');
        }
      }
    } catch (error) {
      console.error('Error connecting provider:', error);
      toast.error('Failed to start connection. Please try again.');
      setConnecting(null);
    }
  };

  const handleConnectAccount = async (account: EmailAccount) => {
    // Determine provider based on email_provider
    const provider = account.email_provider === 'gmail' ? 'google' :
                    account.email_provider === 'outlook' ? 'microsoft' : null;

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
                    disabled={connecting !== null}
                  >
                    {connecting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Connect Now
                      </>
                    )}
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Button
                variant="outline"
                className="h-auto py-6 flex flex-col items-center gap-2"
                onClick={() => handleConnectProvider('google')}
                disabled={connecting !== null}
              >
                <div className="p-3 bg-red-50 rounded-lg">
                  <svg className="h-6 w-6" viewBox="0 0 48 48">
                    <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"/>
                    <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"/>
                    <path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z"/>
                    <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"/>
                  </svg>
                </div>
                <span className="font-semibold">Gmail</span>
                <span className="text-xs text-gray-500">Google Workspace</span>
              </Button>

              <Button
                variant="outline"
                className="h-auto py-6 flex flex-col items-center gap-2"
                onClick={() => handleConnectProvider('microsoft')}
                disabled={connecting !== null}
              >
                <div className="p-3 bg-blue-50 rounded-lg">
                  <svg className="h-6 w-6" viewBox="0 0 48 48">
                    <path fill="#0078D4" d="M44 24c0 11.05-8.95 20-20 20S4 35.05 4 24 12.95 4 24 4s20 8.95 20 20z"/>
                    <path fill="#FFF" d="M24 11.5c-6.9 0-12.5 5.6-12.5 12.5s5.6 12.5 12.5 12.5 12.5-5.6 12.5-12.5-5.6-12.5-12.5-12.5zm0 21.25c-4.83 0-8.75-3.92-8.75-8.75s3.92-8.75 8.75-8.75 8.75 3.92 8.75 8.75-3.92 8.75-8.75 8.75z"/>
                  </svg>
                </div>
                <span className="font-semibold">Outlook</span>
                <span className="text-xs text-gray-500">Office 365</span>
              </Button>

              <Button
                variant="outline"
                className="h-auto py-6 flex flex-col items-center gap-2"
                onClick={() => handleConnectProvider('imap')}
                disabled={connecting !== null}
              >
                <div className="p-3 bg-purple-50 rounded-lg">
                  <Server className="h-6 w-6 text-purple-600" />
                </div>
                <span className="font-semibold">IMAP</span>
                <span className="text-xs text-gray-500">iCloud, Yahoo, Other</span>
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
              disabled={connecting !== null}
              className="flex-1"
            >
              Back
            </Button>
          )}
          {connectedCount > 0 ? (
            <Button
              onClick={handleContinue}
              disabled={connecting !== null}
              className="flex-1"
            >
              {connecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>Continue ({connectedCount} connected)</>
              )}
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={handleSkip}
              disabled={connecting !== null}
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
