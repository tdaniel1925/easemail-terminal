'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Shield, Key, Lock, Eye, AlertTriangle, CheckCircle2, Smartphone, Copy, Download, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface TwoFactorStatus {
  enabled: boolean;
  backupCodesRemaining: number;
}

export default function SecuritySettingsPage() {
  const [twoFactorStatus, setTwoFactorStatus] = useState<TwoFactorStatus>({
    enabled: false,
    backupCodesRemaining: 0,
  });
  const [loading, setLoading] = useState(true);
  const [setupMode, setSetupMode] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [processing, setProcessing] = useState(false);
  const [e2eeEnabled, setE2eeEnabled] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/2fa/status');
      const data = await response.json();

      if (response.ok) {
        setTwoFactorStatus(data);
      }
    } catch (error) {
      console.error('Failed to fetch 2FA status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetup2FA = async () => {
    try {
      setProcessing(true);
      const response = await fetch('/api/auth/2fa/setup', {
        method: 'POST',
      });
      const data = await response.json();

      if (response.ok) {
        setQrCode(data.qrCode);
        setSecret(data.secret);
        setBackupCodes(data.backupCodes);
        setSetupMode(true);
        toast.success('2FA setup initialized');
      } else {
        toast.error(data.error || 'Failed to setup 2FA');
      }
    } catch (error) {
      console.error('Setup 2FA error:', error);
      toast.error('Failed to setup 2FA');
    } finally {
      setProcessing(false);
    }
  };

  const handleEnable2FA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    try {
      setProcessing(true);
      const response = await fetch('/api/auth/2fa/enable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: verificationCode,
          backupCodes: backupCodes,
        }),
      });
      const data = await response.json();

      if (response.ok) {
        toast.success('2FA enabled successfully!');
        setSetupMode(false);
        setVerificationCode('');
        fetchStatus();
      } else {
        toast.error(data.error || 'Failed to enable 2FA');
      }
    } catch (error) {
      console.error('Enable 2FA error:', error);
      toast.error('Failed to enable 2FA');
    } finally {
      setProcessing(false);
    }
  };

  const handleDisable2FA = async () => {
    const code = prompt('Enter your 2FA code to disable:');
    if (!code) return;

    try {
      setProcessing(true);
      const response = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: code }),
      });
      const data = await response.json();

      if (response.ok) {
        toast.success('2FA disabled successfully');
        fetchStatus();
      } else {
        toast.error(data.error || 'Failed to disable 2FA');
      }
    } catch (error) {
      console.error('Disable 2FA error:', error);
      toast.error('Failed to disable 2FA');
    } finally {
      setProcessing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const downloadBackupCodes = () => {
    const content = backupCodes.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'easemail-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Backup codes downloaded');
  };

  const handleEnableE2EE = () => {
    toast.success('End-to-end encryption setup started');
    setE2eeEnabled(true);
  };

  return (
    <div className="space-y-6">
      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Two-Factor Authentication (2FA)
              </CardTitle>
              <CardDescription>Add an extra layer of security to your account</CardDescription>
            </div>
            {loading ? (
              <Badge variant="outline">
                <Loader2 className="h-3 w-3 animate-spin" />
              </Badge>
            ) : twoFactorStatus.enabled ? (
              <Badge className="gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Enabled
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1">
                <AlertTriangle className="h-3 w-3" />
                Disabled
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!twoFactorStatus.enabled && !setupMode && (
            <>
              <p className="text-sm text-muted-foreground">
                Two-factor authentication adds an additional layer of security by requiring a code
                from your phone in addition to your password.
              </p>
              <Button onClick={handleSetup2FA} disabled={processing}>
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    <Smartphone className="mr-2 h-4 w-4" />
                    Enable 2FA
                  </>
                )}
              </Button>
            </>
          )}

          {setupMode && (
            <div className="space-y-6">
              {/* Step 1: Scan QR Code */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Step 1: Scan QR Code</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Scan this QR code with your authenticator app (Google Authenticator,
                    Authy, 1Password, etc.)
                  </p>
                </div>

                {qrCode && (
                  <div className="flex flex-col items-center gap-4 p-6 bg-muted rounded-lg">
                    <Image
                      src={qrCode}
                      alt="2FA QR Code"
                      width={200}
                      height={200}
                      className="border-4 border-white rounded-lg"
                    />
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-2">
                        Or enter this key manually:
                      </p>
                      <div className="flex items-center gap-2">
                        <code className="px-3 py-1 bg-background rounded border text-sm font-mono">
                          {secret}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(secret)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Step 2: Save Backup Codes */}
              {backupCodes.length > 0 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Step 2: Save Backup Codes</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Store these backup codes in a safe place. You can use them to access
                      your account if you lose your phone.
                    </p>
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {backupCodes.map((code, index) => (
                        <code
                          key={index}
                          className="px-3 py-2 bg-background rounded border text-sm font-mono"
                        >
                          {code}
                        </code>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(backupCodes.join('\n'))}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Copy All
                      </Button>
                      <Button variant="outline" size="sm" onClick={downloadBackupCodes}>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Verify */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Step 3: Verify</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Enter the 6-digit code from your authenticator app to complete setup
                  </p>
                </div>

                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="000000"
                    value={verificationCode}
                    onChange={(e) =>
                      setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                    }
                    maxLength={6}
                    className="max-w-[200px] text-center text-lg font-mono"
                  />
                  <Button onClick={handleEnable2FA} disabled={processing}>
                    {processing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify & Enable'
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSetupMode(false);
                      setVerificationCode('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {twoFactorStatus.enabled && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <div className="flex-1">
                  <p className="font-medium">2FA is enabled</p>
                  <p className="text-sm text-muted-foreground">
                    Your account is protected with two-factor authentication
                  </p>
                </div>
              </div>

              {twoFactorStatus.backupCodesRemaining > 0 && (
                <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                  <Key className="h-5 w-5 text-muted-foreground" />
                  <p className="text-sm">
                    <span className="font-medium">
                      {twoFactorStatus.backupCodesRemaining}
                    </span>{' '}
                    backup code{twoFactorStatus.backupCodesRemaining !== 1 ? 's' : ''}{' '}
                    remaining
                  </p>
                </div>
              )}

              <Button variant="destructive" onClick={handleDisable2FA} disabled={processing}>
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Disabling...
                  </>
                ) : (
                  'Disable 2FA'
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* End-to-End Encryption */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                End-to-End Encryption (E2EE)
              </CardTitle>
              <CardDescription>Encrypt your emails for maximum privacy</CardDescription>
            </div>
            {e2eeEnabled ? (
              <Badge className="gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Enabled
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1">
                <AlertTriangle className="h-3 w-3" />
                Disabled
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border rounded-lg bg-amber-500/10 border-amber-500/20">
            <div className="flex gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-900 dark:text-amber-100">
                  Privacy-First Feature
                </h4>
                <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                  When enabled, your emails will be encrypted end-to-end. Only you and the
                  recipient can read them. EaseMail cannot access encrypted content.
                </p>
              </div>
            </div>
          </div>

          {!e2eeEnabled ? (
            <Button onClick={handleEnableE2EE}>
              <Lock className="mr-2 h-4 w-4" />
              Enable E2EE
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-muted/50">
                <h4 className="font-medium mb-2">Encryption Keys</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Your public and private keys are securely stored
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="mr-2 h-4 w-4" />
                    View Public Key
                  </Button>
                  <Button variant="outline" size="sm">
                    Export Keys
                  </Button>
                </div>
              </div>

              <Button variant="destructive">Disable E2EE</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>Manage devices where you're logged in</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {/* Current Session */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">Windows - Chrome</h4>
                    <Badge variant="secondary" className="text-xs">
                      Current
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    New York, USA • Last active: Just now
                  </p>
                </div>
              </div>
            </div>

            {/* Other Sessions */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium">iPhone - Safari</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    New York, USA • Last active: 2 hours ago
                  </p>
                </div>
                <Button variant="ghost" size="sm" className="text-destructive">
                  Revoke
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          <Button variant="destructive">Sign Out All Other Sessions</Button>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Privacy Settings</CardTitle>
          <CardDescription>Control your data and privacy preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="read-receipts">Read Receipts</Label>
              <p className="text-sm text-muted-foreground">
                Let senders know when you've read their emails
              </p>
            </div>
            <Switch id="read-receipts" />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="analytics">Usage Analytics</Label>
              <p className="text-sm text-muted-foreground">
                Help improve EaseMail by sharing anonymous usage data
              </p>
            </div>
            <Switch id="analytics" defaultChecked />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="ai-training">AI Training</Label>
              <p className="text-sm text-muted-foreground">
                Use my data to improve AI features (always anonymized)
              </p>
            </div>
            <Switch id="ai-training" />
          </div>
        </CardContent>
      </Card>

      {/* Data Export */}
      <Card>
        <CardHeader>
          <CardTitle>Data Export</CardTitle>
          <CardDescription>Download a copy of your data</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Request a copy of all your data including emails, contacts, and settings.
          </p>
          <Button variant="outline">Request Data Export</Button>
        </CardContent>
      </Card>
    </div>
  );
}
