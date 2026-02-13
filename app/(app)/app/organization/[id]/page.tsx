'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { AddUserModal } from '@/components/admin/add-user-modal';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Mail,
  Crown,
  Shield,
  User,
  Eye,
  Loader2,
  Settings,
  Search,
} from 'lucide-react';

interface Member {
  user_id: string;
  role: string;
  created_at: string;
  users: { email: string };
}

interface PendingInvite {
  id: string;
  email: string;
  role: string;
  created_at: string;
  expires_at: string;
  invited_by: string;
}

interface Organization {
  id: string;
  name: string;
  plan: string;
  seats: number;
  seats_used: number;
  created_at: string;
}

export default function OrganizationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const orgId = params.id as string;
  const action = searchParams.get('action');

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('MEMBER');
  const [inviting, setInviting] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [editedOrgName, setEditedOrgName] = useState('');
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [newRole, setNewRole] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [transferTargetUserId, setTransferTargetUserId] = useState('');
  const [transferring, setTransferring] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [memberRoleFilter, setMemberRoleFilter] = useState<string>('all');

  useEffect(() => {
    if (orgId) {
      fetchOrganization();
    }
  }, [orgId]);

  useEffect(() => {
    if (organization) {
      setEditedOrgName(organization.name);
    }
  }, [organization]);

  // Handle action query parameter
  useEffect(() => {
    if (action === 'invite' && organization && currentUserRole) {
      const canInviteRole = ['OWNER', 'ADMIN'].includes(currentUserRole);
      if (canInviteRole) {
        setShowInviteDialog(true);
        // Remove query parameter
        router.replace(`/app/organization/${orgId}`);
      }
    }
  }, [action, organization, currentUserRole, orgId, router]);

  const fetchOrganization = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/organizations/${orgId}`);
      const data = await response.json();

      if (response.ok) {
        setOrganization(data.organization);
        setMembers(data.members || []);
        setPendingInvites(data.pendingInvites || []);
        setCurrentUserRole(data.currentUserRole);
      } else {
        toast.error(data.error || 'Failed to load organization');
        router.push('/app/organization');
      }
    } catch (error) {
      console.error('Failed to fetch organization:', error);
      toast.error('Failed to load organization');
      router.push('/app/organization');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteMember = async () => {
    if (!inviteEmail) {
      toast.error('Email is required');
      return;
    }

    try {
      setInviting(true);
      const response = await fetch(`/api/organizations/${orgId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Invite sent successfully!');
        setShowInviteDialog(false);
        setInviteEmail('');
        setInviteRole('MEMBER');
        fetchOrganization();
      } else {
        toast.error(data.error || 'Failed to invite member');
      }
    } catch (error) {
      console.error('Invite member error:', error);
      toast.error('Failed to invite member');
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) {
      return;
    }

    try {
      const response = await fetch(`/api/organizations/${orgId}/members?userId=${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Member removed successfully');
        fetchOrganization();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to remove member');
      }
    } catch (error) {
      console.error('Remove member error:', error);
      toast.error('Failed to remove member');
    }
  };

  const handleUpdateOrgSettings = async () => {
    if (!editedOrgName.trim()) {
      toast.error('Organization name is required');
      return;
    }

    try {
      const response = await fetch(`/api/organizations/${orgId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editedOrgName }),
      });

      if (response.ok) {
        toast.success('Organization updated successfully');
        setShowSettingsDialog(false);
        fetchOrganization();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to update organization');
      }
    } catch (error) {
      console.error('Update organization error:', error);
      toast.error('Failed to update organization');
    }
  };

  const handleChangeRole = async () => {
    if (!selectedMember || !newRole) return;

    try {
      const response = await fetch(`/api/organizations/${orgId}/members/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedMember.user_id, role: newRole }),
      });

      if (response.ok) {
        toast.success('Role updated successfully');
        setShowRoleDialog(false);
        setSelectedMember(null);
        fetchOrganization();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to update role');
      }
    } catch (error) {
      console.error('Update role error:', error);
      toast.error('Failed to update role');
    }
  };

  const handleDeleteOrganization = async () => {
    if (!confirm('Are you sure you want to delete this organization? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/organizations/${orgId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Organization deleted successfully');
        router.push('/app/organization');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to delete organization');
      }
    } catch (error) {
      console.error('Delete organization error:', error);
      toast.error('Failed to delete organization');
    }
  };

  const handleTransferOwnership = async () => {
    if (!transferTargetUserId) {
      toast.error('Please select a member to transfer ownership to');
      return;
    }

    try {
      setTransferring(true);

      const response = await fetch(`/api/organizations/${orgId}/transfer-ownership`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newOwnerId: transferTargetUserId }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Ownership transferred successfully');
        setShowTransferDialog(false);
        setTransferTargetUserId('');
        fetchOrganization();
      } else {
        toast.error(data.error || 'Failed to transfer ownership');
      }
    } catch (error) {
      console.error('Transfer ownership error:', error);
      toast.error('Failed to transfer ownership');
    } finally {
      setTransferring(false);
    }
  };

  const handleResendInvite = async (inviteId: string) => {
    try {
      const response = await fetch(`/api/organizations/${orgId}/invites/${inviteId}/resend`, {
        method: 'POST',
      });

      if (response.ok) {
        toast.success('Invite resent successfully');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to resend invite');
      }
    } catch (error) {
      console.error('Resend invite error:', error);
      toast.error('Failed to resend invite');
    }
  };

  const handleRevokeInvite = async (inviteId: string) => {
    try {
      const response = await fetch(`/api/organizations/${orgId}/invites/${inviteId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Invite revoked successfully');
        fetchOrganization();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to revoke invite');
      }
    } catch (error) {
      console.error('Revoke invite error:', error);
      toast.error('Failed to revoke invite');
    }
  };

  const handleLeaveOrganization = async () => {
    if (!confirm('Are you sure you want to leave this organization?')) {
      return;
    }

    try {
      // Get current user ID from members list
      const currentUserData = members.find((m) => m.role === currentUserRole);
      if (!currentUserData) {
        toast.error('Could not determine user ID');
        return;
      }

      const response = await fetch(`/api/organizations/${orgId}/members?userId=${currentUserData.user_id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('You have left the organization');
        router.push('/app/organization');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to leave organization');
      }
    } catch (error) {
      console.error('Leave organization error:', error);
      toast.error('Failed to leave organization');
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'OWNER':
        return Crown;
      case 'ADMIN':
        return Shield;
      case 'MEMBER':
        return User;
      default:
        return User;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'OWNER':
        return 'bg-purple-500';
      case 'ADMIN':
        return 'bg-blue-500';
      case 'MEMBER':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const canInvite = ['OWNER', 'ADMIN'].includes(currentUserRole);
  const canRemove = ['OWNER', 'ADMIN'].includes(currentUserRole);
  const canEditSettings = ['OWNER', 'ADMIN'].includes(currentUserRole);
  const canDelete = currentUserRole === 'OWNER';

  if (loading) {
    return (
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!organization) {
    return null;
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Home', href: '/app/inbox' },
          { label: 'Organizations', href: '/app/organization' },
          { label: organization.name },
        ]}
      />

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.push('/app/organization')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{organization.name}</h1>
          <p className="text-muted-foreground">Manage your organization</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/app/organization/${orgId}/dashboard`)}
          >
            Dashboard
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push(`/app/organization/${orgId}/analytics`)}
          >
            Analytics
          </Button>
          {canEditSettings && (
            <Button
              variant="outline"
              onClick={() => router.push(`/app/organization/${orgId}/audit-logs`)}
            >
              <Shield className="mr-2 h-4 w-4" />
              Audit Logs
            </Button>
          )}
          {canEditSettings && (
            <Button variant="outline" onClick={() => setShowSettingsDialog(true)}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          )}
          {canInvite && (
            <>
              <Button variant="outline" onClick={() => setShowAddUserModal(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add User
              </Button>
              <Button onClick={() => setShowInviteDialog(true)}>
                <Mail className="mr-2 h-4 w-4" />
                Invite Member
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{organization.plan}</div>
            <p className="text-xs text-muted-foreground mt-1">Current subscription</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Seats Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {organization.seats_used} / {organization.seats}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {organization.seats - organization.seats_used} available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Your Role</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={getRoleBadgeColor(currentUserRole)}>{currentUserRole}</Badge>
            <p className="text-xs text-muted-foreground mt-2">Access level</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Invites */}
      {pendingInvites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Invites</CardTitle>
            <CardDescription>
              {pendingInvites.length} pending {pendingInvites.length === 1 ? 'invitation' : 'invitations'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingInvites.map((invite, index) => {
                const RoleIcon = getRoleIcon(invite.role);
                const isExpired = new Date(invite.expires_at) < new Date();
                return (
                  <div key={invite.id}>
                    {index > 0 && <Separator />}
                    <div className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-yellow-100 text-yellow-700">
                            {invite.email.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{invite.email}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <RoleIcon className="h-3 w-3" />
                            {invite.role}
                            {isExpired && (
                              <span className="text-red-500">(Expired)</span>
                            )}
                            {!isExpired && (
                              <span>• Expires {new Date(invite.expires_at).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {canInvite && (
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleResendInvite(invite.id)}
                          >
                            Resend
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRevokeInvite(invite.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            Revoke
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Members List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>
                {(() => {
                  const filteredMembers = members.filter((member) => {
                    const matchesSearch = member.users.email
                      .toLowerCase()
                      .includes(memberSearchQuery.toLowerCase());
                    const matchesRole =
                      memberRoleFilter === 'all' || member.role === memberRoleFilter;
                    return matchesSearch && matchesRole;
                  });
                  return filteredMembers.length === members.length
                    ? `${members.length} ${members.length === 1 ? 'member' : 'members'}`
                    : `${filteredMembers.length} of ${members.length} ${members.length === 1 ? 'member' : 'members'}`;
                })()}
              </CardDescription>
            </div>
            {members.length > 0 && (
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search members..."
                    value={memberSearchQuery}
                    onChange={(e) => setMemberSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <select
                  value={memberRoleFilter}
                  onChange={(e) => setMemberRoleFilter(e.target.value)}
                  className="h-10 px-3 rounded-md border border-input bg-background"
                >
                  <option value="all">All Roles</option>
                  <option value="OWNER">Owner</option>
                  <option value="ADMIN">Admin</option>
                  <option value="MEMBER">Member</option>
                </select>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <User className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">No team members yet</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-md">
                {canInvite
                  ? "Get started by adding team members to your organization. You can invite existing users or create new accounts."
                  : "There are no members in this organization yet. Contact your organization admin to add team members."
                }
              </p>
              {canInvite && (
                <div className="flex gap-2">
                  <Button onClick={() => setShowAddUserModal(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add User
                  </Button>
                  <Button variant="outline" onClick={() => setShowInviteDialog(true)}>
                    <Mail className="mr-2 h-4 w-4" />
                    Invite Member
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {(() => {
                const filteredMembers = members.filter((member) => {
                  const matchesSearch = member.users.email
                    .toLowerCase()
                    .includes(memberSearchQuery.toLowerCase());
                  const matchesRole =
                    memberRoleFilter === 'all' || member.role === memberRoleFilter;
                  return matchesSearch && matchesRole;
                });

                if (filteredMembers.length === 0) {
                  return (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                      <Search className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="font-semibold text-lg mb-2">No members found</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        No members match your search criteria. Try adjusting your filters.
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setMemberSearchQuery('');
                          setMemberRoleFilter('all');
                        }}
                      >
                        Clear filters
                      </Button>
                    </div>
                  );
                }

                return filteredMembers.map((member, index) => {
                  const RoleIcon = getRoleIcon(member.role);
                  return (
                  <div key={member.user_id}>
                    {index > 0 && <Separator />}
                    <div className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {member.users.email.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{member.users.email}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <RoleIcon className="h-3 w-3" />
                            {member.role}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {canRemove && member.role !== 'OWNER' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedMember(member);
                                setNewRole(member.role);
                                setShowRoleDialog(true);
                              }}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              Edit Role
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveMember(member.user_id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
                });
              })()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Organization Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Organization Settings</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="orgName">Organization Name</Label>
              <Input
                id="orgName"
                value={editedOrgName}
                onChange={(e) => setEditedOrgName(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="ghost" onClick={() => setShowSettingsDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateOrgSettings}>
                Save Changes
              </Button>
            </div>

            {(canDelete || currentUserRole !== 'OWNER') && (
              <div className="pt-4 border-t">
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 space-y-4">
                  <div>
                    <h4 className="font-semibold text-destructive mb-2">Danger Zone</h4>
                    <p className="text-sm text-muted-foreground">
                      Critical actions that can significantly affect your organization.
                    </p>
                  </div>

                  {currentUserRole !== 'OWNER' && (
                    <div>
                      <p className="text-sm font-medium mb-1">Leave Organization</p>
                      <p className="text-sm text-muted-foreground mb-3">
                        Remove yourself from this organization. You will lose access immediately.
                      </p>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          setShowSettingsDialog(false);
                          handleLeaveOrganization();
                        }}
                      >
                        Leave Organization
                      </Button>
                    </div>
                  )}

                  {currentUserRole === 'OWNER' && members.length > 1 && (
                    <div className={currentUserRole !== 'OWNER' ? 'border-t pt-4' : ''}>
                      <p className="text-sm font-medium mb-1">Transfer Ownership</p>
                      <p className="text-sm text-muted-foreground mb-3">
                        Transfer organization ownership to another member. You will become an admin.
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowSettingsDialog(false);
                          setShowTransferDialog(true);
                        }}
                      >
                        <Crown className="mr-2 h-4 w-4" />
                        Transfer Ownership
                      </Button>
                    </div>
                  )}

                  {canDelete && (
                    <div className={(currentUserRole === 'OWNER' && members.length > 1) || currentUserRole !== 'OWNER' ? 'border-t pt-4' : ''}>
                      <p className="text-sm font-medium mb-1">Delete Organization</p>
                      <p className="text-sm text-muted-foreground mb-3">
                        Permanently delete this organization and all associated data. This action cannot be undone.
                      </p>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          setShowSettingsDialog(false);
                          setShowDeleteDialog(true);
                        }}
                      >
                        Delete Organization
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Change Role Dialog */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Member Role</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Member</Label>
              <div className="font-medium">{selectedMember?.users.email}</div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newRole">New Role</Label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="MEMBER">Member</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="ghost" onClick={() => setShowRoleDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleChangeRole}>
                Update Role
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Organization Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Organization</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="text-sm text-destructive font-medium mb-2">
                This action cannot be undone!
              </p>
              <p className="text-sm text-muted-foreground">
                Deleting "{organization?.name}" will permanently remove:
              </p>
              <ul className="text-sm text-muted-foreground list-disc list-inside mt-2 space-y-1">
                <li>All organization data</li>
                <li>All member access</li>
                <li>All billing information</li>
                <li>All usage history</li>
              </ul>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="ghost" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteOrganization}>
                Delete Organization
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add User Modal */}
      {organization && (
        <AddUserModal
          open={showAddUserModal}
          onOpenChange={setShowAddUserModal}
          organizationId={organization.id}
          organizationName={organization.name}
          onSuccess={() => {
            fetchOrganization();
          }}
        />
      )}

      {/* Invite Member Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="colleague@company.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="MEMBER">Member</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="ghost" onClick={() => setShowInviteDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleInviteMember} disabled={inviting}>
                {inviting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Invite
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Transfer Ownership Dialog */}
      <Dialog open={showTransferDialog} onOpenChange={setShowTransferDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer Ownership</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <p className="text-sm font-medium">What happens when you transfer ownership:</p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                <li>The selected member will become the new owner</li>
                <li>You will be demoted to Admin role</li>
                <li>Only the new owner can transfer ownership again</li>
                <li>The new owner will have full control over the organization</li>
              </ul>
            </div>

            <div>
              <Label htmlFor="transferTarget">Select New Owner</Label>
              <Select value={transferTargetUserId} onValueChange={setTransferTargetUserId}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose a member..." />
                </SelectTrigger>
                <SelectContent>
                  {members
                    .filter((member) => member.role !== 'OWNER')
                    .map((member) => (
                      <SelectItem key={member.user_id} value={member.user_id}>
                        {member.users.email} ({member.role})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="bg-destructive/10 p-4 rounded-lg border border-destructive/20">
              <p className="text-sm font-medium text-destructive mb-1">Warning</p>
              <p className="text-sm text-muted-foreground">
                This action is permanent and cannot be undone. Make sure you trust the new owner.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="ghost" onClick={() => setShowTransferDialog(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleTransferOwnership}
                disabled={transferring || !transferTargetUserId}
              >
                {transferring ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Transferring...
                  </>
                ) : (
                  <>
                    <Crown className="mr-2 h-4 w-4" />
                    Transfer Ownership
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
