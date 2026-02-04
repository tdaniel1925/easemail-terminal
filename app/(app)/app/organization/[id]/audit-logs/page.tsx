'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft, Shield, Loader2, Search, Filter, Download } from 'lucide-react';

interface AuditLog {
  id: string;
  action: string;
  details: any;
  timestamp: string;
  ip_address?: string;
  user_agent?: string;
  users: { email: string };
}

export default function AuditLogsPage() {
  const router = useRouter();
  const params = useParams();
  const orgId = params.id as string;

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [total, setTotal] = useState(0);
  const [limit] = useState(50);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (orgId) {
      fetchAuditLogs();
    }
  }, [orgId, actionFilter, offset]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      let url = `/api/organizations/${orgId}/audit-logs?limit=${limit}&offset=${offset}`;

      if (actionFilter !== 'all') {
        url += `&action=${actionFilter}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        setLogs(data.logs);
        setTotal(data.total);
      } else {
        toast.error(data.error || 'Failed to load audit logs');
      }
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.users.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const getActionBadgeColor = (action: string) => {
    if (action.includes('delete') || action.includes('remove') || action.includes('revoke') || action.includes('cancel')) {
      return 'destructive';
    }
    if (action.includes('add') || action.includes('create') || action.includes('accept')) {
      return 'default';
    }
    if (action.includes('change') || action.includes('update')) {
      return 'secondary';
    }
    return 'outline';
  };

  const getActionLabel = (action: string): string => {
    return action
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const exportLogs = () => {
    const csv = [
      ['Timestamp', 'User', 'Action', 'Details'].join(','),
      ...filteredLogs.map((log) =>
        [
          log.timestamp,
          log.users.email,
          getActionLabel(log.action),
          JSON.stringify(log.details).replace(/,/g, ';'),
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString()}.csv`;
    a.click();
  };

  if (loading && logs.length === 0) {
    return (
      <div className="container max-w-7xl mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.push(`/app/organization/${orgId}`)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Audit Logs
          </h1>
          <p className="text-muted-foreground">Security and activity monitoring</p>
        </div>
        <Button variant="outline" onClick={exportLogs} disabled={filteredLogs.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by user or action..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="member_added">Member Added</SelectItem>
                <SelectItem value="member_removed">Member Removed</SelectItem>
                <SelectItem value="member_role_changed">Role Changed</SelectItem>
                <SelectItem value="invite_sent">Invite Sent</SelectItem>
                <SelectItem value="transfer_ownership">Ownership Transfer</SelectItem>
                <SelectItem value="plan_changed">Plan Changed</SelectItem>
                <SelectItem value="settings_changed">Settings Changed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {(searchQuery || actionFilter !== 'all') && (
            <div className="flex items-center gap-2 mt-3">
              <span className="text-sm text-muted-foreground">
                Showing {filteredLogs.length} of {total} logs
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setActionFilter('all');
                }}
              >
                Clear filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Audit Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
          <CardDescription>Complete history of organization actions and changes</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">No audit logs found</p>
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="space-y-3">
                {filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={getActionBadgeColor(log.action)}>
                          {getActionLabel(log.action)}
                        </Badge>
                        <span className="text-sm text-muted-foreground">by</span>
                        <span className="text-sm font-medium">{log.users.email}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {formatTimestamp(log.timestamp)}
                      </p>
                      {log.details && Object.keys(log.details).length > 0 && (
                        <div className="text-xs text-muted-foreground bg-background p-2 rounded border">
                          <pre className="whitespace-pre-wrap break-all">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}

          {/* Pagination */}
          {total > limit && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t">
              <p className="text-sm text-muted-foreground">
                Showing {offset + 1} - {Math.min(offset + limit, total)} of {total}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOffset(Math.max(0, offset - limit))}
                  disabled={offset === 0}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOffset(offset + limit)}
                  disabled={offset + limit >= total}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
