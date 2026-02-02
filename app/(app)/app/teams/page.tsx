'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Video, Search, Plus, Calendar, Users, Phone, MessageSquare, Settings } from 'lucide-react';
import { BackButton } from '@/components/ui/back-button';

export default function TeamsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  // Placeholder meetings data
  const upcomingMeetings = [
    {
      id: '1',
      title: 'Weekly Team Standup',
      time: 'Today at 10:00 AM',
      duration: '30 min',
      participants: ['Sarah Johnson', 'Michael Chen', 'Emily Rodriguez'],
      type: 'Recurring',
      link: 'https://teams.microsoft.com/meeting/...',
    },
    {
      id: '2',
      title: 'Client Presentation',
      time: 'Today at 2:00 PM',
      duration: '1 hour',
      participants: ['Sarah Johnson', 'John Doe'],
      type: 'Important',
      link: 'https://teams.microsoft.com/meeting/...',
    },
    {
      id: '3',
      title: 'Design Review',
      time: 'Tomorrow at 11:00 AM',
      duration: '45 min',
      participants: ['Emily Rodriguez', 'Design Team'],
      type: 'Review',
      link: 'https://teams.microsoft.com/meeting/...',
    },
  ];

  const quickActions = [
    { icon: Video, label: 'Start Instant Meeting', color: 'bg-blue-500' },
    { icon: Calendar, label: 'Schedule Meeting', color: 'bg-green-500' },
    { icon: Phone, label: 'Make a Call', color: 'bg-purple-500' },
    { icon: MessageSquare, label: 'Send Message', color: 'bg-orange-500' },
  ];

  const getParticipantCount = (participants: string[]) => {
    return participants.length;
  };

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
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Schedule Meeting
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search meetings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="max-w-5xl mx-auto space-y-4">
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
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Upcoming Meetings</CardTitle>
                  <CardDescription>Your scheduled video calls and meetings</CardDescription>
                </div>
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingMeetings
                .filter(meeting =>
                  meeting.title.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((meeting) => (
                  <Card key={meeting.id} className="border-l-4 border-l-purple-600">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-base">{meeting.title}</h3>
                            <Badge variant="secondary" className="text-xs">
                              {meeting.type}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {meeting.time}
                            </div>
                            <div className="flex items-center gap-1">
                              <Video className="h-4 w-4" />
                              {meeting.duration}
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {getParticipantCount(meeting.participants)} participants
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex -space-x-2">
                              {meeting.participants.slice(0, 3).map((participant, i) => (
                                <Avatar key={i} className="h-6 w-6 border-2 border-background">
                                  <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                                    {participant.split(' ').map(n => n[0]).join('').toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                            </div>
                            {meeting.participants.length > 3 && (
                              <span className="text-xs text-muted-foreground">
                                +{meeting.participants.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 ml-4">
                          <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                            <Video className="mr-2 h-4 w-4" />
                            Join
                          </Button>
                          <Button variant="outline" size="sm">
                            Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

              {/* Empty State */}
              {upcomingMeetings.filter(meeting =>
                meeting.title.toLowerCase().includes(searchQuery.toLowerCase())
              ).length === 0 && (
                <div className="text-center py-12">
                  <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">No meetings found</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {searchQuery ? 'Try a different search term' : 'You have no upcoming meetings'}
                  </p>
                  {!searchQuery && (
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Schedule Meeting
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Integration Status */}
          <Card>
            <CardHeader>
              <CardTitle>Integration Status</CardTitle>
              <CardDescription>Microsoft Teams connection status</CardDescription>
            </CardHeader>
            <CardContent>
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
                <Button variant="outline" size="sm">
                  Configure
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}
