'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { TiptapEditor } from '@/components/ui/tiptap-editor';
import { Plus, Pencil, Trash2, Star, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SignaturesPage() {
  const [signatures, setSignatures] = useState<any[]>([]);
  const [emailAccounts, setEmailAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingSignature, setEditingSignature] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [emailAccountId, setEmailAccountId] = useState<string>('');

  useEffect(() => {
    fetchSignatures();
    fetchEmailAccounts();
  }, []);

  const fetchEmailAccounts = async () => {
    try {
      const response = await fetch('/api/email-accounts');
      const data = await response.json();
      if (response.ok && data.accounts) {
        setEmailAccounts(data.accounts);
      }
    } catch (error) {
      console.error('Failed to fetch email accounts:', error);
    }
  };

  const fetchSignatures = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/signatures');
      const data = await response.json();
      if (response.ok && data.signatures) {
        setSignatures(data.signatures);
      }
    } catch (error) {
      console.error('Failed to fetch signatures:', error);
      toast.error('Failed to load signatures');
    } finally {
      setLoading(false);
    }
  };

  const openDialog = (signature?: any) => {
    if (signature) {
      setEditingSignature(signature);
      setName(signature.name);
      setContent(signature.content);
      setIsDefault(signature.is_default);
      setEmailAccountId(signature.email_account_id || '');
    } else {
      setEditingSignature(null);
      setName('');
      setContent('');
      setIsDefault(false);
      setEmailAccountId('');
    }
    setShowDialog(true);
  };

  const closeDialog = () => {
    setShowDialog(false);
    setEditingSignature(null);
    setName('');
    setContent('');
    setIsDefault(false);
    setEmailAccountId('');
  };

  const handleSave = async () => {
    if (!name.trim() || !content.trim()) {
      toast.error('Name and content are required');
      return;
    }

    try {
      setSaving(true);

      const url = editingSignature
        ? `/api/signatures/${editingSignature.id}`
        : '/api/signatures';

      const method = editingSignature ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          content,
          is_default: isDefault,
          email_account_id: emailAccountId || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(editingSignature ? 'Signature updated' : 'Signature created');
        closeDialog();
        fetchSignatures();
      } else {
        toast.error(data.error || 'Failed to save signature');
      }
    } catch (error) {
      console.error('Save signature error:', error);
      toast.error('Failed to save signature');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this signature?')) {
      return;
    }

    try {
      const response = await fetch(`/api/signatures/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Signature deleted');
        fetchSignatures();
      } else {
        toast.error('Failed to delete signature');
      }
    } catch (error) {
      console.error('Delete signature error:', error);
      toast.error('Failed to delete signature');
    }
  };

  const handleSetDefault = async (signature: any) => {
    try {
      const response = await fetch(`/api/signatures/${signature.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: signature.name,
          content: signature.content,
          is_default: true,
          email_account_id: signature.email_account_id || null,
        }),
      });

      if (response.ok) {
        toast.success('Default signature updated');
        fetchSignatures();
      } else {
        toast.error('Failed to set default signature');
      }
    } catch (error) {
      console.error('Set default error:', error);
      toast.error('Failed to set default signature');
    }
  };

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Email Signatures</h1>
          <p className="text-muted-foreground mt-1">
            Manage your email signatures
          </p>
        </div>
        <Button onClick={() => openDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          New Signature
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : signatures.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No signatures yet</p>
            <Button onClick={() => openDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Create your first signature
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {signatures.map((signature) => (
            <Card key={signature.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle>{signature.name}</CardTitle>
                      {signature.is_default && (
                        <Badge variant="secondary">
                          <Star className="h-3 w-3 mr-1" />
                          Default
                        </Badge>
                      )}
                      {signature.email_account_id && (() => {
                        const account = emailAccounts.find(acc => acc.id === signature.email_account_id);
                        return account ? (
                          <Badge variant="outline" className="text-xs">
                            {account.email}
                          </Badge>
                        ) : null;
                      })()}
                    </div>
                    <CardDescription>
                      Created {new Date(signature.created_at).toLocaleDateString()}
                      {signature.email_account_id && (() => {
                        const account = emailAccounts.find(acc => acc.id === signature.email_account_id);
                        return account ? ` • For ${account.email}` : '';
                      })()}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {!signature.is_default && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(signature)}
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDialog(signature)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(signature.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div
                  className="prose dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: signature.content }}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      {showDialog && (
        <Dialog open={showDialog} onOpenChange={closeDialog}>
          <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>
                {editingSignature ? 'Edit Signature' : 'Create Signature'}
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Professional, Personal, Work"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email_account">Email Account (Optional)</Label>
                <select
                  id="email_account"
                  value={emailAccountId}
                  onChange={(e) => setEmailAccountId(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                >
                  <option value="">All accounts</option>
                  {emailAccounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.email} {account.is_primary ? '(Primary)' : ''}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">
                  Associate this signature with a specific email account, or leave blank for all accounts
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Signature Content *</Label>
                <TiptapEditor
                  content={content}
                  onChange={setContent}
                  placeholder="Create your email signature..."
                  minHeight="200px"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_default"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="h-4 w-4"
                />
                <Label htmlFor="is_default" className="cursor-pointer">
                  Set as default signature{emailAccountId ? ' for this account' : ''}
                </Label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={closeDialog}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Signature'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
