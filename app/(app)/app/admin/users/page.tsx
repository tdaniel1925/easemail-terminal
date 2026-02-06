'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Users,
  Search,
  Plus,
  Mail,
  Shield,
  Loader2,
  Ban,
  CheckCircle,
  Eye,
  Settings,
  UserCog,
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string | null;
  two_factor_enabled: boolean;
  created_at: string;
  organization_count: number;
  email_account_count: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Create user form
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [creating, setCreating] = useState(false);

  // Impersonate feature
  const [showImpersonateDialog, setShowImpersonateDialog] = useState(false);
  const [impersonateUserId, setImpersonateUserId] = useState<string | null>(null);
  const [impersonateReason, setImpersonateReason] = useState('');
  const [impersonating, setImpersonating] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = users.filter(
        (user) =>
          user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users');
      const data = await response.json();

      if (response.ok && data.users) {
        setUsers(data.users);
        setFilteredUsers(data.users);
      } else {
        toast.error(data.error || 'Access denied');
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!newUserEmail || !newUserPassword) {
      toast.error('Email and password are required');
      return;
    }

    try {
      setCreating(true);
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newUserEmail,
          name: newUserName,
          password: newUserPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('User created successfully!');
        setShowCreateDialog(false);
        setNewUserEmail('');
        setNewUserName('');
        setNewUserPassword('');
        fetchUsers();
      } else {
        toast.error(data.error || 'Failed to create user');
      }
    } catch (error) {
      console.error('Create user error:', error);
      toast.error('Failed to create user');
    } finally {
      setCreating(false);
    }
  };

  const handleImpersonate = async () => {
    if (!impersonateUserId) {
      toast.error('User ID required');
      return;
    }

    if (!impersonateReason.trim()) {
      toast.error('Please provide a reason for impersonation');
      return;
    }

    try {
      setImpersonating(true);
      const response = await fetch('/api/admin/impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserId: impersonateUserId,
          reason: impersonateReason,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Impersonating user...');
        // Redirect to verify the magic link token
        window.location.href = `/api/auth/callback?token_hash=${data.impersonateToken}&type=magiclink&next=/app/inbox`;
      } else {
        toast.error(data.error || 'Failed to impersonate user');
      }
    } catch (error) {
      console.error('Impersonate error:', error);
      toast.error('Failed to impersonate user');
      setImpersonating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex items-center justify-end">
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create User
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">2FA Enabled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter((u) => u.two_factor_enabled).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avg Organizations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.length > 0
                ? (
                    users.reduce((sum, u) => sum + u.organization_count, 0) / users.length
                  ).toFixed(1)
                : 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Email Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.reduce((sum, u) => sum + u.email_account_count, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-4">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users by email or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>All Users ({filteredUsers.length})</CardTitle>
          <CardDescription>System-wide user list</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>
                      {user.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{user.name || user.email}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <Mail className="h-3 w-3" />
                      {user.email}
                    </div>
                    <div className="flex gap-2 mt-1">
                      {user.two_factor_enabled && (
                        <Badge variant="secondary" className="text-xs">
                          <Shield className="h-3 w-3 mr-1" />
                          2FA
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {user.organization_count} org{user.organization_count !== 1 ? 's' : ''}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {user.email_account_count} account{user.email_account_count !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedUser(user)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setImpersonateUserId(user.id);
                      setShowImpersonateDialog(true);
                    }}
                    title="Impersonate user"
                  >
                    <UserCog className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {filteredUsers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No users found
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Name (optional)</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Temporary Password *</Label>
              <Input
                id="password"
                type="password"
                placeholder="Min 8 characters"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                User will be prompted to change on first login
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="ghost"
                onClick={() => setShowCreateDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateUser} disabled={creating}>
                {creating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create User
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Impersonate Dialog */}
      <Dialog open={showImpersonateDialog} onOpenChange={setShowImpersonateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Impersonate User</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Warning:</strong> You are about to log in as another user. This action is logged for audit purposes.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Impersonation *</Label>
              <Textarea
                id="reason"
                placeholder="e.g., Troubleshooting login issue, Support request #12345"
                value={impersonateReason}
                onChange={(e) => setImpersonateReason(e.target.value)}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                This reason will be recorded in the audit log
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowImpersonateDialog(false);
                  setImpersonateReason('');
                  setImpersonateUserId(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleImpersonate}
                disabled={impersonating || !impersonateReason.trim()}
                variant="destructive"
              >
                {impersonating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Impersonating...
                  </>
                ) : (
                  <>
                    <UserCog className="mr-2 h-4 w-4" />
                    Impersonate User
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* User Details Dialog */}
      {selectedUser && (
        <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-2xl">
                    {selectedUser.email.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-xl font-bold">{selectedUser.name || 'No name set'}</div>
                  <div className="text-sm text-muted-foreground">{selectedUser.email}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div>
                  <div className="text-sm text-muted-foreground">User ID</div>
                  <div className="font-mono text-xs">{selectedUser.id}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Created</div>
                  <div className="text-sm">{new Date(selectedUser.created_at).toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Organizations</div>
                  <div className="text-sm">{selectedUser.organization_count}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Email Accounts</div>
                  <div className="text-sm">{selectedUser.email_account_count}</div>
                </div>
              </div>

              <div className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Two-Factor Authentication</div>
                    <div className="text-sm text-muted-foreground">
                      {selectedUser.two_factor_enabled ? 'Enabled' : 'Disabled'}
                    </div>
                  </div>
                  {selectedUser.two_factor_enabled ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <Ban className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
