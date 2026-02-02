'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Video, Search, Plus, Calendar, Users, Phone, MessageSquare, Settings, Loader2, Link as LinkIcon, RefreshCw, XCircle } from 'lucide-react';
import { BackButton } from '@/components/ui/back-button';
import { toast } from 'sonner';

interface TeamsMeeting {
  id: string;
  subject: string;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  onlineMeeting?: {
    joinUrl: string;
  };
  organizer: {
    emailAddress: {
      name: string;
      address: string;
    };
  };
  attendees: Array<{
    emailAddress: {
      name: string;
      address: string;
    };
  }>;
}

export default function TeamsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [meetings, setMeetings] = useState<TeamsMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const response = await fetch('/api/teams/status');
      const data = await response.json();

      if (data.connected) {
        setConnected(true);
        fetchMeetings();
      } else {
        setConnected(false);
        setLoading(false);
      }
    } catch (error) {
      console.error('Status check error:', error);
      setConnected(false);
      setLoading(false);
    }
  };

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/teams/meetings?days=14');
      const data = await response.json();

      if (response.ok && data.meetings) {
        setMeetings(data.meetings);
      } else if (data.needsAuth) {
        setConnected(false);
        toast.error('Please connect to Microsoft Teams');
      } else {
        toast.error('Failed to fetch meetings');
      }
    } catch (error) {
      console.error('Fetch meetings error:', error);
      toast.error('Failed to fetch meetings');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleConnect = () => {
    window.location.href = '/api/teams/auth';
  };

  const handleDisconnect = async () => {
    try {
      const response = await fetch('/api/teams/status', {
        method: 'DELETE',
      });

      if (response.ok) {
        setConnected(false);
        setMeetings([]);
        toast.success('Disconnected from Microsoft Teams');
      } else {
        toast.error('Failed to disconnect');
      }
    } catch (error) {
      console.error('Disconnect error:', error);
      toast.error('Failed to disconnect');
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMeetings();
  };

  const formatMeetingTime = (meeting: TeamsMeeting) => {
    const start = new Date(meeting.start.dateTime);
    const end = new Date(meeting.end.dateTime);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let dayLabel = start.toLocaleDateString();
    if (start.toDateString() === today.toDateString()) {
      dayLabel = 'Today';
    } else if (start.toDateString() === tomorrow.toDateString()) {
      dayLabel = 'Tomorrow';
    }

    const timeStr = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${dayLabel} at ${timeStr}`;
  };

  const getMeetingDuration = (meeting: TeamsMeeting) => {
    const start = new Date(meeting.start.dateTime);
    const end = new Date(meeting.end.dateTime);
    const minutes = Math.round((end.getTime() - start.getTime()) / 60000);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins} min`;
  };

  const quickActions = [
    { icon: Video, label: 'Start Instant Meeting', color: 'bg-blue-500', disabled: !connected },
    { icon: Calendar, label: 'Schedule Meeting', color: 'bg-green-500', disabled: !connected },
    { icon: Phone, label: 'Make a Call', color: 'bg-purple-500', disabled: !connected },
    { icon: MessageSquare, label: 'Send Message', color: 'bg-orange-500', disabled: !connected },
  ];

  const filteredMeetings = meetings.filter(meeting =>
    meeting.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card p-4">
        <div className="mb-4">
          <BackButton href="/app/inbox" />
        </div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Video className="h-6 w-6 text-purple-600" />
              MS Teams Integration
            </h1>
            <p className="text-muted-foreground mt-1">Manage your meetings and video calls</p>
          </div>
          {connected && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
                <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Schedule Meeting
              </Button>
            </div>
          )}
        </div>

        {/* Search */}
        {connected && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search meetings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        )}
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="max-w-5xl mx-auto space-y-4">
          {/* Integration Status */}
          <Card>
            <CardHeader>
              <CardTitle>Integration Status</CardTitle>
              <CardDescription>Microsoft Teams connection status</CardDescription>
            </CardHeader>
            <CardContent>
              {connected ? (
                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
                    <div>
                      <p className="font-medium text-green-900 dark:text-green-100">Connected</p>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Teams integration is active
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleDisconnect}>
                    <XCircle className="mr-2 h-4 w-4" />
                    Disconnect
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-yellow-500" />
                    <div>
                      <p className="font-medium text-yellow-900 dark:text-yellow-100">Not Connected</p>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        Connect to Microsoft Teams to see your meetings
                      </p>
                    </div>
                  </div>
                  <Button onClick={handleConnect}>
                    <LinkIcon className="mr-2 h-4 w-4" />
                    Connect Teams
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {connected && (
            <>
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Start or schedule a meeting in seconds</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {quickActions.map((action, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        className="h-24 flex-col gap-2 hover:bg-accent"
                        disabled={action.disabled}
                      >
                        <div className={`${action.color} p-3 rounded-full text-white`}>
                          <action.icon className="h-5 w-5" />
                        </div>
                        <span className="text-sm font-medium">{action.label}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Meetings */}
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Meetings</CardTitle>
                  <CardDescription>Your scheduled Microsoft Teams meetings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loading ? (
                    <div className="flex items-center justify-center h-32">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : filteredMeetings.length === 0 ? (
                    <div className="text-center py-12">
                      <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-semibold text-lg mb-2">No meetings found</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {searchQuery ? 'Try a different search term' : 'You have no upcoming Teams meetings in the next 14 days'}
                      </p>
                      {!searchQuery && (
                        <Button>
                          <Plus className="mr-2 h-4 w-4" />
                          Schedule Meeting
                        </Button>
                      )}
                    </div>
                  ) : (
                    filteredMeetings.map((meeting) => (
                      <Card key={meeting.id} className="border-l-4 border-l-purple-600">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-base">{meeting.subject}</h3>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {formatMeetingTime(meeting)}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Video className="h-4 w-4" />
                                  {getMeetingDuration(meeting)}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Users className="h-4 w-4" />
                                  {meeting.attendees.length} participants
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex -space-x-2">
                                  {meeting.attendees.slice(0, 3).map((attendee, i) => (
                                    <Avatar key={i} className="h-6 w-6 border-2 border-background">
                                      <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                                        {attendee.emailAddress.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                  ))}
                                </div>
                                {meeting.attendees.length > 3 && (
                                  <span className="text-xs text-muted-foreground">
                                    +{meeting.attendees.length - 3} more
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col gap-2 ml-4">
                              {meeting.onlineMeeting?.joinUrl && (
                                <Button
                                  size="sm"
                                  className="bg-purple-600 hover:bg-purple-700"
                                  onClick={() => window.open(meeting.onlineMeeting!.joinUrl, '_blank')}
                                >
                                  <Video className="mr-2 h-4 w-4" />
                                  Join
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
