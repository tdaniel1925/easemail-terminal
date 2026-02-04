'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Key, Plus, Trash2, RefreshCw, Copy, Eye, EyeOff, AlertCircle, Shield, Loader2 } from 'lucide-react';

interface ApiKey {
  id: string;
  key_name: string;
  is_active: boolean;
  created_at: string;
  last_used_at: string | null;
  usage_count: number;
}

export default function ApiKeysPage() {
  const [apiKey, setApiKey] = useState<ApiKey | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showRotateDialog, setShowRotateDialog] = useState(false);
  const [showRevokeDialog, setShowRevokeDialog] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');
  const [showKeyValue, setShowKeyValue] = useState(false);
  const [creating, setCreating] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const [generatedKey, setGeneratedKey] = useState('');
  const [showGeneratedKey, setShowGeneratedKey] = useState(false);

  useEffect(() => {
    fetchApiKey();
  }, []);

  const fetchApiKey = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/api-keys');
      const data = await response.json();

      if (response.ok) {
        setApiKey(data.api_key);
      } else {
        toast.error(data.error || 'Failed to load API key');
      }
    } catch (error) {
      console.error('Failed to fetch API key:', error);
      toast.error('Failed to load API key');
    } finally {
      setLoading(false);
    }
  };

  const generateRandomKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const prefix = 'sk_live_';
    let key = prefix;
    for (let i = 0; i < 48; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
  };

  const handleCreateKey = async () => {
    if (!newKeyName) {
      toast.error('Please enter a key name');
      return;
    }

    if (!newKeyValue) {
      toast.error('Please enter a key value');
      return;
    }

    try {
      setCreating(true);

      const response = await fetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key_name: newKeyName,
          key_value: newKeyValue,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('API key created successfully');
        setGeneratedKey(newKeyValue);
        setShowGeneratedKey(true);
        setShowCreateDialog(false);
        setNewKeyName('');
        setNewKeyValue('');
        fetchApiKey();
      } else {
        toast.error(data.error || 'Failed to create API key');
      }
    } catch (error) {
      console.error('Create API key error:', error);
      toast.error('Failed to create API key');
    } finally {
      setCreating(false);
    }
  };

  const handleRotateKey = async () => {
    if (!apiKey) return;

    if (!newKeyValue) {
      toast.error('Please enter a new key value');
      return;
    }

    try {
      setRotating(true);

      const response = await fetch('/api/api-keys', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key_id: apiKey.id,
          key_value: newKeyValue,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('API key rotated successfully');
        setGeneratedKey(newKeyValue);
        setShowGeneratedKey(true);
        setShowRotateDialog(false);
        setNewKeyValue('');
        fetchApiKey();
      } else {
        toast.error(data.error || 'Failed to rotate API key');
      }
    } catch (error) {
      console.error('Rotate API key error:', error);
      toast.error('Failed to rotate API key');
    } finally {
      setRotating(false);
    }
  };

  const handleRevokeKey = async () => {
    if (!apiKey) return;

    try {
      setRevoking(true);

      const response = await fetch(`/api/api-keys?id=${apiKey.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('API key revoked successfully');
        setShowRevokeDialog(false);
        fetchApiKey();
      } else {
        toast.error(data.error || 'Failed to revoke API key');
      }
    } catch (error) {
      console.error('Revoke API key error:', error);
      toast.error('Failed to revoke API key');
    } finally {
      setRevoking(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Key className="h-8 w-8" />
          API Keys
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage OpenAI API keys for your organization
        </p>
      </div>

      {/* Current API Key */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current API Key</CardTitle>
              <CardDescription>
                {apiKey ? 'Your organization is using a custom OpenAI API key' : 'Using master API key (default)'}
              </CardDescription>
            </div>
            {!apiKey && (
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Custom Key
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {apiKey ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="font-medium">{apiKey.key_name}</p>
                    {apiKey.is_active ? (
                      <Badge variant="default">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Created: {formatDate(apiKey.created_at)}
                  </p>
                  {apiKey.last_used_at && (
                    <p className="text-sm text-muted-foreground">
                      Last used: {formatDate(apiKey.last_used_at)}
                    </p>
                  )}
                  {apiKey.usage_count > 0 && (
                    <p className="text-sm text-muted-foreground">
                      Usage count: {apiKey.usage_count}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowRotateDialog(true)}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setShowRevokeDialog(true)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg border">
                <div className="flex items-start gap-2">
                  <Shield className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium mb-1">Security Note</p>
                    <p>API key values are not stored visibly. Keep your key secure and never share it publicly.</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm mb-4">No custom API key configured</p>
              <p className="text-xs">Your organization is using the master API key</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>About API Keys</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            <strong>Custom API Keys:</strong> Use your own OpenAI API key to have full control over usage and billing.
          </p>
          <p>
            <strong>Master API Key:</strong> The default option that uses our shared key for convenience.
          </p>
          <p>
            <strong>Security:</strong> API keys are sensitive. Rotate them regularly and revoke immediately if compromised.
          </p>
          <p>
            <strong>Best Practices:</strong> Never commit API keys to version control or share them in public channels.
          </p>
        </CardContent>
      </Card>

      {/* Create Key Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Custom API Key</DialogTitle>
            <DialogDescription>
              Enter your OpenAI API key to use for this organization
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="keyName">Key Name</Label>
              <Input
                id="keyName"
                placeholder="e.g., Production Key"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="keyValue">API Key Value</Label>
              <div className="flex gap-2 mt-1">
                <div className="relative flex-1">
                  <Input
                    id="keyValue"
                    type={showKeyValue ? 'text' : 'password'}
                    placeholder="sk-..."
                    value={newKeyValue}
                    onChange={(e) => setNewKeyValue(e.target.value)}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => setShowKeyValue(!showKeyValue)}
                  >
                    {showKeyValue ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    const key = generateRandomKey();
                    setNewKeyValue(key);
                    setShowKeyValue(true);
                  }}
                >
                  Generate
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Enter your OpenAI API key or generate a placeholder for testing
              </p>
            </div>

            <div className="bg-destructive/10 p-3 rounded-lg border border-destructive/20">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  This will replace any existing API key. The old key will be deactivated.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateKey} disabled={creating}>
              {creating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Key'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rotate Key Dialog */}
      <Dialog open={showRotateDialog} onOpenChange={setShowRotateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rotate API Key</DialogTitle>
            <DialogDescription>
              Replace your current API key with a new one
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="rotateKeyValue">New API Key Value</Label>
              <div className="flex gap-2 mt-1">
                <div className="relative flex-1">
                  <Input
                    id="rotateKeyValue"
                    type={showKeyValue ? 'text' : 'password'}
                    placeholder="sk-..."
                    value={newKeyValue}
                    onChange={(e) => setNewKeyValue(e.target.value)}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => setShowKeyValue(!showKeyValue)}
                  >
                    {showKeyValue ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    const key = generateRandomKey();
                    setNewKeyValue(key);
                    setShowKeyValue(true);
                  }}
                >
                  Generate
                </Button>
              </div>
            </div>

            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">
                The old key will be deactivated immediately after rotation.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowRotateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRotateKey} disabled={rotating}>
              {rotating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rotating...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Rotate Key
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke Key Dialog */}
      <Dialog open={showRevokeDialog} onOpenChange={setShowRevokeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke API Key</DialogTitle>
            <DialogDescription>
              Are you sure you want to revoke this API key?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-destructive/10 p-4 rounded-lg border border-destructive/20">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-destructive mb-1">Warning</p>
                  <p className="text-sm text-muted-foreground">
                    Revoking this key will deactivate it immediately. Your organization will revert to using the master API key.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowRevokeDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRevokeKey} disabled={revoking}>
              {revoking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Revoking...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Revoke Key
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generated Key Display Dialog */}
      <Dialog open={showGeneratedKey} onOpenChange={setShowGeneratedKey}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>API Key Created Successfully</DialogTitle>
            <DialogDescription>
              Save this key securely - you won't be able to see it again
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex items-center justify-between gap-2">
                <code className="text-sm break-all">{generatedKey}</code>
                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(generatedKey)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="bg-destructive/10 p-3 rounded-lg border border-destructive/20">
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  Copy and store this key securely. For security reasons, it will not be shown again.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setShowGeneratedKey(false)}>
              I've Saved the Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
