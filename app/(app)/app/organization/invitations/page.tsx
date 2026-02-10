'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Mail,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Building2,
} from 'lucide-react';

interface Invitation {
  id: string;
  organization_id: string;
  organization: {
    name: string;
  };
  email: string;
  role: string;
  invited_by: string;
  expires_at: string;
  created_at: string;
  accepted_at: string | null;
}

export default function OrganizationInvitationsPage() {
  const [loading, setLoading] = useState(true);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [accepting, setAccepting] = useState<string | null>(null);
  const [declining, setDeclining] = useState<string | null>(null);

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/organization/invitations');
      const data = await response.json();

      if (response.ok && data.invitations) {
        setInvitations(data.invitations);
      }
    } catch (error) {
      console.error('Failed to fetch invitations:', error);
      toast.error('Failed to load invitations');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (invitationId: string) => {
    try {
      setAccepting(invitationId);
      const response = await fetch(`/api/organization/invitations/${invitationId}/accept`, {
        method: 'POST',
      });

      if (response.ok) {
        toast.success('Invitation accepted!');
        fetchInvitations();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to accept invitation');
      }
    } catch (error) {
      toast.error('Failed to accept invitation');
    } finally {
      setAccepting(null);
    }
  };

  const handleDecline = async (invitationId: string) => {
    try {
      setDeclining(invitationId);
      const response = await fetch(`/api/organization/invitations/${invitationId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Invitation declined');
        fetchInvitations();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to decline invitation');
      }
    } catch (error) {
      toast.error('Failed to decline invitation');
    } finally {
      setDeclining(null);
    }
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const pendingInvitations = invitations.filter(inv => !inv.accepted_at && !isExpired(inv.expires_at));
  const expiredInvitations = invitations.filter(inv => !inv.accepted_at && isExpired(inv.expires_at));
  const acceptedInvitations = invitations.filter(inv => inv.accepted_at);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Organization Invitations</h1>
        <p className="text-muted-foreground mt-1">Manage your organization invitations</p>
      </div>

      {/* Pending Invitations */}
      {pendingInvitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Invitations ({pendingInvitations.length})</CardTitle>
            <CardDescription>Invitations waiting for your response</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingInvitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium text-lg">{invitation.organization?.name || 'Unknown Organization'}</div>
                      <div className="text-sm text-muted-foreground">
                        Role: <Badge variant="outline" className="ml-1">{invitation.role}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        <Clock className="inline h-3 w-3 mr-1" />
                        Expires {new Date(invitation.expires_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDecline(invitation.id)}
                      disabled={declining === invitation.id}
                    >
                      {declining === invitation.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Declining...
                        </>
                      ) : (
                        <>
                          <XCircle className="mr-2 h-4 w-4" />
                          Decline
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleAccept(invitation.id)}
                      disabled={accepting === invitation.id}
                    >
                      {accepting === invitation.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Accepting...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Accept
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Accepted Invitations */}
      {acceptedInvitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Accepted ({acceptedInvitations.length})</CardTitle>
            <CardDescription>Organizations you've joined</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {acceptedInvitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                    <div>
                      <div className="font-medium">{invitation.organization?.name || 'Unknown Organization'}</div>
                      <div className="text-sm text-muted-foreground">
                        Accepted {new Date(invitation.accepted_at!).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <Badge>{invitation.role}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expired Invitations */}
      {expiredInvitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Expired ({expiredInvitations.length})</CardTitle>
            <CardDescription>Invitations that have expired</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {expiredInvitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex items-center justify-between p-4 border rounded-lg opacity-60"
                >
                  <div className="flex items-center gap-4">
                    <XCircle className="h-6 w-6 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{invitation.organization?.name || 'Unknown Organization'}</div>
                      <div className="text-sm text-muted-foreground">
                        Expired {new Date(invitation.expires_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-muted">Expired</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Invitations */}
      {invitations.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Mail className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No invitations</h3>
            <p className="text-muted-foreground text-center">
              You don't have any organization invitations at this time.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
