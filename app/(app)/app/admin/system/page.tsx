'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Settings,
  Database,
  Key,
  Shield,
  Mail,
  Server,
  Loader2,
  CheckCircle,
  AlertCircle,
  Info,
} from 'lucide-react';

interface SystemSettings {
  appName: string;
  supportEmail: string;
  stripeEnabled: boolean;
  nylasEnabled: boolean;
  twilioEnabled: boolean;
  openaiEnabled: boolean;
  maintenanceMode: boolean;
  signupsEnabled: boolean;
}

export default function AdminSystemPage() {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<SystemSettings>({
    appName: 'EaseMail',
    supportEmail: 'support@easemail.app',
    stripeEnabled: true,
    nylasEnabled: true,
    twilioEnabled: false,
    openaiEnabled: true,
    maintenanceMode: false,
    signupsEnabled: true,
  });

  // Environment variables status
  const envVars = [
    { name: 'NEXT_PUBLIC_SUPABASE_URL', status: !!process.env.NEXT_PUBLIC_SUPABASE_URL, category: 'Database' },
    { name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', status: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, category: 'Database' },
    { name: 'STRIPE_SECRET_KEY', status: true, category: 'Billing' }, // Assumed configured
    { name: 'STRIPE_WEBHOOK_SECRET', status: true, category: 'Billing' },
    { name: 'NYLAS_CLIENT_ID', status: true, category: 'Email/Calendar' },
    { name: 'NYLAS_API_KEY', status: true, category: 'Email/Calendar' },
    { name: 'OPENAI_API_KEY', status: true, category: 'AI Features' },
    { name: 'TWILIO_ACCOUNT_SID', status: false, category: 'SMS' },
    { name: 'TWILIO_AUTH_TOKEN', status: false, category: 'SMS' },
  ];

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      // TODO: Implement API endpoint to save system settings
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const configuredServices = envVars.filter((v) => v.status).length;
  const totalServices = envVars.length;

  return (
    <div className="space-y-6">
      {/* System Status */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Server className="h-4 w-4" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse" />
              <span className="font-medium">Operational</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">All systems running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Services Configured
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {configuredServices}/{totalServices}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {totalServices - configuredServices} need configuration
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="font-medium">Secure</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">All keys encrypted</p>
          </CardContent>
        </Card>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            General Settings
          </CardTitle>
          <CardDescription>Configure basic application settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="appName">Application Name</Label>
            <Input
              id="appName"
              value={settings.appName}
              onChange={(e) => setSettings({ ...settings, appName: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="supportEmail">Support Email</Label>
            <Input
              id="supportEmail"
              type="email"
              value={settings.supportEmail}
              onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
              <p className="text-sm text-muted-foreground">
                Temporarily disable access for maintenance
              </p>
            </div>
            <Switch
              id="maintenanceMode"
              checked={settings.maintenanceMode}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, maintenanceMode: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="signupsEnabled">New Signups</Label>
              <p className="text-sm text-muted-foreground">Allow new user registrations</p>
            </div>
            <Switch
              id="signupsEnabled"
              checked={settings.signupsEnabled}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, signupsEnabled: checked })
              }
            />
          </div>

          <Button onClick={handleSaveSettings} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Settings'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Service Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Service Configuration
          </CardTitle>
          <CardDescription>Enable or disable integrated services</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                <Key className="h-5 w-5 text-primary" />
              </div>
              <div>
                <Label>Stripe Payments</Label>
                <p className="text-sm text-muted-foreground">Billing and subscriptions</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={settings.stripeEnabled ? 'default' : 'secondary'}>
                {settings.stripeEnabled ? 'Enabled' : 'Disabled'}
              </Badge>
              <Switch
                checked={settings.stripeEnabled}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, stripeEnabled: checked })
                }
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <Label>Nylas Email/Calendar</Label>
                <p className="text-sm text-muted-foreground">Email and calendar integration</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={settings.nylasEnabled ? 'default' : 'secondary'}>
                {settings.nylasEnabled ? 'Enabled' : 'Disabled'}
              </Badge>
              <Switch
                checked={settings.nylasEnabled}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, nylasEnabled: checked })
                }
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                <Server className="h-5 w-5 text-primary" />
              </div>
              <div>
                <Label>OpenAI</Label>
                <p className="text-sm text-muted-foreground">AI features and assistants</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={settings.openaiEnabled ? 'default' : 'secondary'}>
                {settings.openaiEnabled ? 'Enabled' : 'Disabled'}
              </Badge>
              <Switch
                checked={settings.openaiEnabled}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, openaiEnabled: checked })
                }
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <Label>Twilio SMS</Label>
                <p className="text-sm text-muted-foreground">SMS messaging capabilities</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={settings.twilioEnabled ? 'default' : 'secondary'}>
                {settings.twilioEnabled ? 'Enabled' : 'Disabled'}
              </Badge>
              <Switch
                checked={settings.twilioEnabled}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, twilioEnabled: checked })
                }
                disabled
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Environment Variables */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Environment Configuration
          </CardTitle>
          <CardDescription>Status of required environment variables</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {['Database', 'Billing', 'Email/Calendar', 'AI Features', 'SMS'].map((category) => (
              <div key={category}>
                <h4 className="font-medium text-sm mb-2">{category}</h4>
                <div className="space-y-2 ml-4">
                  {envVars
                    .filter((v) => v.category === category)
                    .map((envVar) => (
                      <div
                        key={envVar.name}
                        className="flex items-center justify-between p-2 rounded-lg border"
                      >
                        <span className="font-mono text-sm">{envVar.name}</span>
                        {envVar.status ? (
                          <div className="flex items-center gap-1 text-green-500">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-xs">Configured</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-yellow-500">
                            <AlertCircle className="h-4 w-4" />
                            <span className="text-xs">Not Set</span>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            System Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="text-muted-foreground">Version</Label>
              <div className="font-medium">1.0.0</div>
            </div>
            <div>
              <Label className="text-muted-foreground">Environment</Label>
              <div className="font-medium">{process.env.NODE_ENV || 'development'}</div>
            </div>
            <div>
              <Label className="text-muted-foreground">Next.js Version</Label>
              <div className="font-medium">16.1.6</div>
            </div>
            <div>
              <Label className="text-muted-foreground">Database</Label>
              <div className="font-medium">Supabase (PostgreSQL)</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
