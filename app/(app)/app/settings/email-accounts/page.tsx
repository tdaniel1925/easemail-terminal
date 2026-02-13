'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DeleteAccountDialog } from '@/components/dialogs/delete-account-dialog';
import { toast } from 'sonner';
import { Loader2, Mail, Plus, Trash2, Star, CheckCircle2, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface EmailAccount {
  id: string;
  email: string;
  provider: string;
  is_primary: boolean;
  sync_state: string;
  created_at: string;
}

export default function EmailAccountsSettingsPage() {
  const [accounts, setAccounts] = useState<EmailAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<EmailAccount | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchAccounts();

    // Check for success parameter from OAuth redirect
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      toast.success('Email account connected successfully!');
      // Clean up URL
      window.history.replaceState({}, '', '/app/settings/email-accounts');
    }
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/email-accounts');
      const data = await response.json();

      if (data.accounts) {
        setAccounts(data.accounts);
      }
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
      toast.error('Failed to load email accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectNew = () => {
    router.push('/app/connect');
  };

  const handleSetPrimary = async (accountId: string) => {
    try {
      const response = await fetch('/api/email-accounts/set-primary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId }),
      });

      if (response.ok) {
        toast.success('Primary account updated');
        fetchAccounts();
      } else {
        toast.error('Failed to update primary account');
      }
    } catch (error) {
      console.error('Set primary error:', error);
      toast.error('Failed to update primary account');
    }
  };

  const handleRemoveClick = (account: EmailAccount) => {
    console.log('Delete button clicked for account:', account.email);
    setAccountToDelete(account);
    setDeleteDialogOpen(true);
    console.log('Dialog should now open');
  };

  const handleRemoveConfirm = async () => {
    if (!accountToDelete) {
      console.error('No account to delete');
      return;
    }

    console.log('Removing account:', accountToDelete.id, accountToDelete.email);

    try {
      const response = await fetch(`/api/email-accounts/${accountToDelete.id}`, {
        method: 'DELETE',
      });

      console.log('Delete response status:', response.status);

      const data = await response.json();
      console.log('Delete response data:', data);

      if (response.ok) {
        toast.success('Email account and associated data deleted successfully');
        setDeleteDialogOpen(false);
        setAccountToDelete(null);
        fetchAccounts();

        // Notify other components (like sidebar) that accounts have changed
        window.dispatchEvent(new CustomEvent('email-accounts-changed'));
      } else {
        console.error('Delete failed with error:', data.error);
        toast.error(data.error || 'Failed to remove account');
      }
    } catch (error) {
      console.error('Remove account error:', error);
      toast.error('Failed to remove account');
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'google':
        return 'bg-blue-500';
      case 'microsoft':
        return 'bg-orange-500';
      case 'imap':
        return 'bg-gray-500';
      default:
        return 'bg-primary';
    }
  };

  const getSyncStatus = (syncState: string) => {
    switch (syncState?.toLowerCase()) {
      case 'synced':
      case 'active':
        return { icon: CheckCircle2, color: 'text-green-600 dark:text-green-500', label: 'Synced' };
      case 'syncing':
        return { icon: RefreshCw, color: 'text-blue-600 dark:text-blue-500 animate-spin', label: 'Syncing...' };
      case 'error':
      case 'failed':
        return { icon: XCircle, color: 'text-red-600 dark:text-red-500', label: 'Sync Failed' };
      case 'paused':
        return { icon: AlertCircle, color: 'text-orange-600 dark:text-orange-500', label: 'Paused' };
      default:
        return { icon: CheckCircle2, color: 'text-green-600 dark:text-green-500', label: 'Connected' };
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Email Accounts</CardTitle>
              <CardDescription>Manage your connected email accounts</CardDescription>
            </div>
            <Button type="button" onClick={handleConnectNew}>
              <Plus className="mr-2 h-4 w-4" />
              Connect Account
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Connected Accounts */}
      {accounts.length === 0 ? (
        <Card data-testid="email-accounts-empty">
          <CardContent className="flex flex-col items-center justify-center h-64">
            <Mail className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">No email accounts connected</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Connect your first email account to get started
            </p>
            <Button type="button" onClick={handleConnectNew}>
              <Plus className="mr-2 h-4 w-4" />
              Connect Account
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4" data-testid="email-accounts-list">
          {accounts.map((account) => (
            <Card key={account.id}>
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                  <Avatar className={getProviderColor(account.provider)}>
                    <AvatarFallback className="text-white dark:text-white">
                      {account.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{account.email}</h4>
                      {account.is_primary && (
                        <Badge variant="default" className="gap-1">
                          <Star className="h-3 w-3" />
                          Primary
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{account.provider}</Badge>
                      {(() => {
                        const status = getSyncStatus(account.sync_state);
                        const StatusIcon = status.icon;
                        return (
                          <div className={`flex items-center gap-1 text-xs ${status.color}`}>
                            <StatusIcon className="h-3 w-3" />
                            {status.label}
                          </div>
                        );
                      })()}
                      <span className="text-xs text-muted-foreground">
                        Added {new Date(account.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      toast.success('Re-syncing account...');
                      fetchAccounts();
                    }}
                    title="Re-sync account"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  {!account.is_primary && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetPrimary(account.id)}
                    >
                      Set as Primary
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveClick(account)}
                    className="text-destructive hover:text-destructive"
                    title="Delete account"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Sync Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Sync Settings</CardTitle>
          <CardDescription>Configure how your emails are synchronized</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Auto Sync</h4>
              <p className="text-sm text-muted-foreground">
                Automatically sync emails in the background
              </p>
            </div>
            <Button type="button" variant="outline" size="sm">
              Enabled
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Sync Frequency</h4>
              <p className="text-sm text-muted-foreground">How often to check for new emails</p>
            </div>
            <Button type="button" variant="outline" size="sm">
              Every 5 minutes
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Sync History</h4>
              <p className="text-sm text-muted-foreground">
                How far back to sync your email history
              </p>
            </div>
            <Button type="button" variant="outline" size="sm">
              Last 6 months
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Account Confirmation Dialog */}
      {accountToDelete && (
        <DeleteAccountDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          accountEmail={accountToDelete.email}
          onConfirm={handleRemoveConfirm}
        />
      )}
    </div>
  );
}
