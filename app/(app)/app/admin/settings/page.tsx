'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  Settings as SettingsIcon,
  Loader2,
  Save,
  Shield,
  Mail,
  Key,
  Database,
} from 'lucide-react';

export default function AdminSystemSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [clearingCache, setClearingCache] = useState(false);

  // System settings state
  const [settings, setSettings] = useState({
    siteName: 'EaseMail',
    supportEmail: 'support@easemail.app',
    maintenanceMode: false,
    allowSignups: true,
    requireEmailVerification: true,
    enableAIFeatures: true,
  });

  useEffect(() => {
    checkAccessAndLoadSettings();
  }, []);

  const checkAccessAndLoadSettings = async () => {
    try {
      setLoading(true);
      // Fetch system settings (this also checks if user is super admin)
      const response = await fetch('/api/admin/system-settings');
      if (response.ok) {
        const data = await response.json();
        setHasAccess(true);
        // Update settings state with fetched values
        if (data.settings) {
          setSettings(data.settings);
        }
      } else {
        setHasAccess(false);
      }
    } catch (error) {
      setHasAccess(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/admin/system-settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Settings saved successfully!');
      } else {
        toast.error(data.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Save settings error:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleClearCache = async () => {
    try {
      setClearingCache(true);
      const response = await fetch('/api/admin/cache', {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Cache cleared! ${data.clearedPaths} paths and ${data.clearedTags} tags revalidated.`);
      } else {
        toast.error(data.error || 'Failed to clear cache');
      }
    } catch (error) {
      console.error('Clear cache error:', error);
      toast.error('Failed to clear cache');
    } finally {
      setClearingCache(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Shield className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Unauthorized</h2>
        <p className="text-muted-foreground">You don't have permission to access system settings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Settings</h1>
          <p className="text-muted-foreground mt-1">Configure system-wide settings</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>Basic system configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="siteName">Site Name</Label>
            <Input
              id="siteName"
              value={settings.siteName}
              onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
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
        </CardContent>
      </Card>

      {/* Access Control */}
      <Card>
        <CardHeader>
          <CardTitle>Access Control</CardTitle>
          <CardDescription>Manage user access and authentication</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Allow New Signups</Label>
              <p className="text-sm text-muted-foreground">
                Enable or disable new user registration
              </p>
            </div>
            <Switch
              checked={settings.allowSignups}
              onCheckedChange={(checked) => setSettings({ ...settings, allowSignups: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Require Email Verification</Label>
              <p className="text-sm text-muted-foreground">
                Force users to verify their email before accessing the app
              </p>
            </div>
            <Switch
              checked={settings.requireEmailVerification}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, requireEmailVerification: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Feature Flags */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Flags</CardTitle>
          <CardDescription>Enable or disable system features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>AI Features</Label>
              <p className="text-sm text-muted-foreground">
                Enable AI-powered features (Remix, Dictate, etc.)
              </p>
            </div>
            <Switch
              checked={settings.enableAIFeatures}
              onCheckedChange={(checked) => setSettings({ ...settings, enableAIFeatures: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Maintenance Mode</Label>
              <p className="text-sm text-muted-foreground">
                Put the site in maintenance mode (only admins can access)
              </p>
            </div>
            <Switch
              checked={settings.maintenanceMode}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, maintenanceMode: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>Irreversible and destructive actions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Clear All Caches</Label>
              <p className="text-sm text-muted-foreground">
                Clear all application caches and revalidate paths
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleClearCache} disabled={clearingCache}>
              {clearingCache ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Clearing...
                </>
              ) : (
                'Clear Cache'
              )}
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Reset Database</Label>
              <p className="text-sm text-muted-foreground">
                WARNING: This will delete all data
              </p>
            </div>
            <Button variant="destructive" size="sm" disabled>
              Reset Database
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
