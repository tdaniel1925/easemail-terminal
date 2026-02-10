'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { CreateOrganizationWizard } from '@/components/admin/create-organization-wizard';
import { toast } from 'sonner';
import {
  Building2,
  Plus,
  Search,
  Users,
  Crown,
  Loader2,
  TrendingUp,
  Trash2,
} from 'lucide-react';

interface Organization {
  id: string;
  name: string;
  plan: string;
  seats: number;
  seats_used: number;
  created_at: string;
  member_count: number;
  email_account_count: number;
  usage_count: number;
}

export default function AdminOrganizationsPage() {
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [filteredOrgs, setFilteredOrgs] = useState<Organization[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [selectedOrgs, setSelectedOrgs] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [orgToDelete, setOrgToDelete] = useState<Organization | null>(null);

  // Quick create form state
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [quickCreateName, setQuickCreateName] = useState('');
  const [quickCreateOwnerEmail, setQuickCreateOwnerEmail] = useState('');
  const [quickCreatePlan, setQuickCreatePlan] = useState('PRO');
  const [quickCreateSeats, setQuickCreateSeats] = useState(1);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = organizations.filter(
        (org) =>
          org.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredOrgs(filtered);
    } else {
      setFilteredOrgs(organizations);
    }
  }, [searchQuery, organizations]);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/organizations');
      const data = await response.json();

      if (response.ok && data.organizations) {
        setOrganizations(data.organizations);
        setFilteredOrgs(data.organizations);
      } else {
        toast.error(data.error || 'Access denied');
      }
    } catch (error) {
      console.error('Failed to fetch organizations:', error);
      toast.error('Failed to load organizations');
    } finally {
      setLoading(false);
    }
  };

  const handleWizardComplete = () => {
    setShowWizard(false);
    fetchOrganizations();
    toast.success('Organization created successfully!');
  };

  const handleQuickCreate = async () => {
    if (!quickCreateName.trim()) {
      toast.error('Organization name is required');
      return;
    }
    if (!quickCreateOwnerEmail.trim()) {
      toast.error('Owner email is required');
      return;
    }

    try {
      setCreating(true);
      const response = await fetch('/api/admin/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: quickCreateName,
          owner_email: quickCreateOwnerEmail,
          plan: quickCreatePlan,
          seats: quickCreateSeats,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Organization created successfully!');
        setShowQuickCreate(false);
        setQuickCreateName('');
        setQuickCreateOwnerEmail('');
        setQuickCreatePlan('PRO');
        setQuickCreateSeats(1);
        fetchOrganizations();
      } else {
        toast.error(data.error || 'Failed to create organization');
      }
    } catch (error) {
      console.error('Quick create error:', error);
      toast.error('Failed to create organization');
    } finally {
      setCreating(false);
    }
  };

  const switchToWizard = () => {
    setShowQuickCreate(false);
    setShowWizard(true);
  };

  const getPlanBadgeColor = (plan: string) => {
    const colors: Record<string, string> = {
      FREE: 'bg-gray-500',
      PRO: 'bg-blue-500',
      BUSINESS: 'bg-purple-500',
      ENTERPRISE: 'bg-orange-500',
    };
    return colors[plan] || 'bg-gray-500';
  };

  const toggleSelectOrg = (orgId: string) => {
    const newSelected = new Set(selectedOrgs);
    if (newSelected.has(orgId)) {
      newSelected.delete(orgId);
    } else {
      newSelected.add(orgId);
    }
    setSelectedOrgs(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedOrgs.size === filteredOrgs.length) {
      setSelectedOrgs(new Set());
    } else {
      setSelectedOrgs(new Set(filteredOrgs.map(org => org.id)));
    }
  };

  const handleDeleteSingle = (org: Organization, e: React.MouseEvent) => {
    e.stopPropagation();
    setOrgToDelete(org);
    setShowDeleteConfirm(true);
  };

  const handleDeleteBulk = () => {
    if (selectedOrgs.size === 0) {
      toast.error('No organizations selected');
      return;
    }
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      setDeleting(true);
      const idsToDelete = orgToDelete ? [orgToDelete.id] : Array.from(selectedOrgs);

      const deletePromises = idsToDelete.map(id =>
        fetch(`/api/organizations/${id}`, { method: 'DELETE' })
      );

      const results = await Promise.all(deletePromises);
      const failures = [];

      for (const result of results) {
        if (!result.ok) {
          try {
            const data = await result.json();
            failures.push(data.error || 'Unknown error');
          } catch {
            failures.push('Unknown error');
          }
        }
      }

      if (failures.length > 0) {
        // Show the actual error message from the API
        const errorMsg = failures.length === 1
          ? failures[0]
          : `Failed to delete ${failures.length} organization(s): ${failures[0]}`;
        toast.error(errorMsg);
        console.error('Delete failures:', failures);
      } else {
        toast.success(`Successfully deleted ${idsToDelete.length} organization(s)`);
        setShowDeleteConfirm(false);
        setOrgToDelete(null);
        setSelectedOrgs(new Set());
        fetchOrganizations();
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete organization(s)');
    } finally {
      setDeleting(false);
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {selectedOrgs.size > 0 && (
            <>
              <Button
                variant="destructive"
                onClick={handleDeleteBulk}
                disabled={deleting}
              >
                {deleting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Delete Selected ({selectedOrgs.size})
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedOrgs(new Set())}
              >
                Clear Selection
              </Button>
            </>
          )}
        </div>
        <Button onClick={() => setShowQuickCreate(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Organization
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Organizations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{organizations.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {organizations.reduce((sum, org) => sum + org.member_count, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Seats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {organizations.reduce((sum, org) => sum + org.seats, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Paid Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {organizations.filter((org) => org.plan !== 'FREE').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Select All */}
      <Card className="mb-4">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filteredOrgs.length > 0 && selectedOrgs.size === filteredOrgs.length}
                onChange={toggleSelectAll}
                className="h-4 w-4 rounded border-gray-300"
              />
              <span className="text-sm text-muted-foreground">Select All</span>
            </label>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search organizations by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Organizations List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredOrgs.map((org) => (
          <Card
            key={org.id}
            className={`hover:shadow-lg transition-shadow ${selectedOrgs.has(org.id) ? 'ring-2 ring-primary' : ''}`}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedOrgs.has(org.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleSelectOrg(org.id);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                  <CardTitle
                    className="text-base cursor-pointer hover:underline"
                    onClick={() => router.push(`/app/organization/${org.id}`)}
                  >
                    {org.name}
                  </CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getPlanBadgeColor(org.plan)}>{org.plan}</Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={(e) => handleDeleteSingle(org, e)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>
                Created {new Date(org.created_at).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    Members
                  </span>
                  <span className="font-medium">{org.member_count}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Crown className="h-4 w-4" />
                    Seats
                  </span>
                  <span className="font-medium">
                    {org.seats_used} / {org.seats}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    Usage (30d)
                  </span>
                  <span className="font-medium">{org.usage_count}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{
                      width: `${org.seats > 0 ? (org.seats_used / org.seats) * 100 : 0}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {org.seats - org.seats_used} seat{org.seats - org.seats_used !== 1 ? 's' : ''} available
                </p>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredOrgs.length === 0 && (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            No organizations found
          </div>
        )}
      </div>

      {/* Quick Create Organization Dialog */}
      <Dialog open={showQuickCreate} onOpenChange={setShowQuickCreate}>
        <DialogContent>
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Create Organization</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Quick create with basic details
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Organization Name *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Acme Corporation"
                  value={quickCreateName}
                  onChange={(e) => setQuickCreateName(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="ownerEmail">Owner Email *</Label>
                <Input
                  id="ownerEmail"
                  name="ownerEmail"
                  type="email"
                  placeholder="owner@example.com"
                  value={quickCreateOwnerEmail}
                  onChange={(e) => setQuickCreateOwnerEmail(e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  User must already exist in the system
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="plan">Plan</Label>
                  <select
                    id="plan"
                    value={quickCreatePlan}
                    onChange={(e) => setQuickCreatePlan(e.target.value)}
                    className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background"
                  >
                    <option value="FREE">Free</option>
                    <option value="PRO">Pro</option>
                    <option value="BUSINESS">Business</option>
                    <option value="ENTERPRISE">Enterprise</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="seats">Seats</Label>
                  <Input
                    id="seats"
                    type="number"
                    min="1"
                    value={quickCreateSeats}
                    onChange={(e) => setQuickCreateSeats(parseInt(e.target.value) || 1)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <button
                type="button"
                onClick={switchToWizard}
                className="text-sm text-primary hover:underline"
              >
                Need more options? Use Advanced Wizard →
              </button>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowQuickCreate(false)}
                disabled={creating}
              >
                Cancel
              </Button>
              <Button onClick={handleQuickCreate} disabled={creating}>
                {creating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Organization Wizard */}
      <Dialog open={showWizard} onOpenChange={setShowWizard}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <CreateOrganizationWizard
            onComplete={handleWizardComplete}
            onCancel={() => setShowWizard(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <Trash2 className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Delete Organization{selectedOrgs.size > 1 || (!orgToDelete && selectedOrgs.size > 0) ? 's' : ''}</h3>
                <p className="text-sm text-muted-foreground">
                  This action cannot be undone
                </p>
              </div>
            </div>

            {orgToDelete ? (
              <div className="rounded-lg border p-4 space-y-2">
                <p className="text-sm font-medium">{orgToDelete.name}</p>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>• {orgToDelete.member_count} member{orgToDelete.member_count !== 1 ? 's' : ''}</p>
                  <p>• {orgToDelete.email_account_count} email account{orgToDelete.email_account_count !== 1 ? 's' : ''}</p>
                  <p>• {orgToDelete.plan} plan</p>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border p-4">
                <p className="text-sm">
                  You are about to delete <span className="font-semibold">{selectedOrgs.size}</span> organization{selectedOrgs.size !== 1 ? 's' : ''}.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  All organization data, members, and settings will be permanently removed.
                </p>
              </div>
            )}

            <div className="flex items-center gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setOrgToDelete(null);
                }}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
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
