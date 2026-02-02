'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Building2,
  Plus,
  Search,
  Users,
  Crown,
  Loader2,
  Settings,
  TrendingUp,
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
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Create org form
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgOwnerEmail, setNewOrgOwnerEmail] = useState('');
  const [newOrgPlan, setNewOrgPlan] = useState('FREE');
  const [newOrgSeats, setNewOrgSeats] = useState('1');
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

  const handleCreateOrganization = async () => {
    if (!newOrgName || !newOrgOwnerEmail) {
      toast.error('Organization name and owner email are required');
      return;
    }

    try {
      setCreating(true);
      const response = await fetch('/api/admin/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newOrgName,
          owner_email: newOrgOwnerEmail,
          plan: newOrgPlan,
          seats: parseInt(newOrgSeats),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Organization created successfully!');
        setShowCreateDialog(false);
        setNewOrgName('');
        setNewOrgOwnerEmail('');
        setNewOrgPlan('FREE');
        setNewOrgSeats('1');
        fetchOrganizations();
      } else {
        toast.error(data.error || 'Failed to create organization');
      }
    } catch (error) {
      console.error('Create organization error:', error);
      toast.error('Failed to create organization');
    } finally {
      setCreating(false);
    }
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

  if (loading) {
    return (
      <div className="container max-w-7xl mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold">Organization Management</h1>
          <p className="text-muted-foreground">System-wide organization administration</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
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

      {/* Search */}
      <Card className="mb-4">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search organizations by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Organizations List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredOrgs.map((org) => (
          <Card
            key={org.id}
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => router.push(`/app/organization/${org.id}`)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-base">{org.name}</CardTitle>
                </div>
                <Badge className={getPlanBadgeColor(org.plan)}>{org.plan}</Badge>
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

      {/* Create Organization Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Organization</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="org-name">Organization Name *</Label>
              <Input
                id="org-name"
                placeholder="Acme Inc."
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="owner-email">Owner Email *</Label>
              <Input
                id="owner-email"
                type="email"
                placeholder="owner@company.com"
                value={newOrgOwnerEmail}
                onChange={(e) => setNewOrgOwnerEmail(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                User must already exist in the system
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="plan">Plan</Label>
              <Select value={newOrgPlan} onValueChange={setNewOrgPlan}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FREE">Free</SelectItem>
                  <SelectItem value="PRO">Pro</SelectItem>
                  <SelectItem value="BUSINESS">Business</SelectItem>
                  <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="seats">Seats</Label>
              <Input
                id="seats"
                type="number"
                min="1"
                value={newOrgSeats}
                onChange={(e) => setNewOrgSeats(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="ghost"
                onClick={() => setShowCreateDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateOrganization} disabled={creating}>
                {creating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Organization
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
