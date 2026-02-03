'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Briefcase,
  Search,
  Loader2,
  Mail,
  Phone,
  Building2,
  Users,
  Calendar,
  FileText,
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
} from 'lucide-react';

interface EnterpriseLead {
  id: string;
  company_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  estimated_seats: number;
  message: string | null;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'closed_won' | 'closed_lost';
  assigned_to: string | null;
  next_follow_up: string | null;
  notes: string | null;
  source: string;
  created_at: string;
  contacted_at: string | null;
  closed_at: string | null;
}

export default function AdminSalesPage() {
  const [leads, setLeads] = useState<EnterpriseLead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<EnterpriseLead[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<EnterpriseLead | null>(null);

  useEffect(() => {
    fetchLeads();
  }, []);

  useEffect(() => {
    let filtered = leads;

    if (searchQuery) {
      filtered = filtered.filter(
        (lead) =>
          lead.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lead.contact_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lead.contact_email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((lead) => lead.status === statusFilter);
    }

    setFilteredLeads(filtered);
  }, [searchQuery, statusFilter, leads]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/enterprise-leads');
      const data = await response.json();

      if (response.ok && data.leads) {
        setLeads(data.leads);
        setFilteredLeads(data.leads);
      } else {
        toast.error(data.error || 'Failed to load leads');
      }
    } catch (error) {
      console.error('Failed to fetch leads:', error);
      toast.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, any> = {
      new: AlertCircle,
      contacted: Mail,
      qualified: CheckCircle,
      proposal: FileText,
      closed_won: CheckCircle,
      closed_lost: XCircle,
    };
    return icons[status] || Clock;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: 'bg-blue-500',
      contacted: 'bg-yellow-500',
      qualified: 'bg-purple-500',
      proposal: 'bg-orange-500',
      closed_won: 'bg-green-500',
      closed_lost: 'bg-red-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      new: 'New',
      contacted: 'Contacted',
      qualified: 'Qualified',
      proposal: 'Proposal Sent',
      closed_won: 'Closed Won',
      closed_lost: 'Closed Lost',
    };
    return labels[status] || status;
  };

  const calculatePotentialRevenue = (seats: number) => {
    // Enterprise pricing: $20 per seat/month
    return seats * 20;
  };

  const statusCounts = {
    all: leads.length,
    new: leads.filter((l) => l.status === 'new').length,
    contacted: leads.filter((l) => l.status === 'contacted').length,
    qualified: leads.filter((l) => l.status === 'qualified').length,
    proposal: leads.filter((l) => l.status === 'proposal').length,
    closed_won: leads.filter((l) => l.status === 'closed_won').length,
    closed_lost: leads.filter((l) => l.status === 'closed_lost').length,
  };

  const totalPotentialRevenue = leads
    .filter((l) => !['closed_lost', 'closed_won'].includes(l.status))
    .reduce((sum, lead) => sum + calculatePotentialRevenue(lead.estimated_seats), 0);

  const wonRevenue = leads
    .filter((l) => l.status === 'closed_won')
    .reduce((sum, lead) => sum + calculatePotentialRevenue(lead.estimated_seats), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pipeline Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Total Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leads.length}</div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Active Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statusCounts.new + statusCounts.contacted + statusCounts.qualified + statusCounts.proposal}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Open opportunities</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Potential MRR
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPotentialRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">In pipeline</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Won MRR
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${wonRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {statusCounts.closed_won} deals closed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by company, contact name, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Leads ({statusCounts.all})</SelectItem>
                <SelectItem value="new">New ({statusCounts.new})</SelectItem>
                <SelectItem value="contacted">Contacted ({statusCounts.contacted})</SelectItem>
                <SelectItem value="qualified">Qualified ({statusCounts.qualified})</SelectItem>
                <SelectItem value="proposal">Proposal ({statusCounts.proposal})</SelectItem>
                <SelectItem value="closed_won">Closed Won ({statusCounts.closed_won})</SelectItem>
                <SelectItem value="closed_lost">Closed Lost ({statusCounts.closed_lost})</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Leads List */}
      <Card>
        <CardHeader>
          <CardTitle>Enterprise Leads ({filteredLeads.length})</CardTitle>
          <CardDescription>Manage your enterprise sales pipeline</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredLeads.map((lead) => {
              const StatusIcon = getStatusIcon(lead.status);
              const potentialMRR = calculatePotentialRevenue(lead.estimated_seats);

              return (
                <div
                  key={lead.id}
                  className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedLead(lead)}
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="font-semibold text-lg">{lead.company_name}</div>
                        <Badge className={getStatusColor(lead.status)}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {getStatusLabel(lead.status)}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {lead.contact_name}
                          </span>
                          <span>{lead.contact_email}</span>
                          {lead.contact_phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {lead.contact_phone}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {lead.estimated_seats} seats
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Created {new Date(lead.created_at).toLocaleDateString()}
                          </span>
                          {lead.source && (
                            <span className="capitalize">Source: {lead.source.replace('_', ' ')}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-lg font-bold text-primary">
                      ${potentialMRR}/mo
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ${(potentialMRR * 12).toLocaleString()}/yr
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredLeads.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No leads found matching your filters
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lead Details Dialog */}
      {selectedLead && (
        <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {selectedLead.company_name}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(selectedLead.status)}>
                  {getStatusLabel(selectedLead.status)}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Contact Name</Label>
                  <div className="font-medium">{selectedLead.contact_name}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <div className="font-medium">{selectedLead.contact_email}</div>
                </div>
                {selectedLead.contact_phone && (
                  <div>
                    <Label className="text-muted-foreground">Phone</Label>
                    <div className="font-medium">{selectedLead.contact_phone}</div>
                  </div>
                )}
                <div>
                  <Label className="text-muted-foreground">Estimated Seats</Label>
                  <div className="font-medium">{selectedLead.estimated_seats}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Potential MRR</Label>
                  <div className="font-medium">
                    ${calculatePotentialRevenue(selectedLead.estimated_seats)}/mo
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Source</Label>
                  <div className="font-medium capitalize">
                    {selectedLead.source?.replace('_', ' ') || 'N/A'}
                  </div>
                </div>
              </div>

              {selectedLead.message && (
                <div>
                  <Label className="text-muted-foreground">Message</Label>
                  <div className="mt-1 p-3 bg-muted rounded-md">
                    {selectedLead.message}
                  </div>
                </div>
              )}

              {selectedLead.notes && (
                <div>
                  <Label className="text-muted-foreground">Notes</Label>
                  <div className="mt-1 p-3 bg-muted rounded-md whitespace-pre-wrap">
                    {selectedLead.notes}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">Created</Label>
                  <div>{new Date(selectedLead.created_at).toLocaleString()}</div>
                </div>
                {selectedLead.contacted_at && (
                  <div>
                    <Label className="text-muted-foreground">Contacted</Label>
                    <div>{new Date(selectedLead.contacted_at).toLocaleString()}</div>
                  </div>
                )}
                {selectedLead.closed_at && (
                  <div>
                    <Label className="text-muted-foreground">Closed</Label>
                    <div>{new Date(selectedLead.closed_at).toLocaleString()}</div>
                  </div>
                )}
                {selectedLead.next_follow_up && (
                  <div>
                    <Label className="text-muted-foreground">Next Follow-up</Label>
                    <div>{new Date(selectedLead.next_follow_up).toLocaleDateString()}</div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => {
                    window.location.href = `mailto:${selectedLead.contact_email}`;
                  }}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Send Email
                </Button>
                {selectedLead.contact_phone && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      window.location.href = `tel:${selectedLead.contact_phone}`;
                    }}
                  >
                    <Phone className="mr-2 h-4 w-4" />
                    Call
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
