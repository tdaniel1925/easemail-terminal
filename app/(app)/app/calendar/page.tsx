'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Calendar as CalendarIcon, Plus, RefreshCw, Clock, MapPin,
  Video, List, Grid, X
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { CreateEventDialog } from '@/components/features/create-event-dialog';
import { BackButton } from '@/components/ui/back-button';
import { toast } from 'sonner';

export default function CalendarPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'list'>('month');
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);

      // Fetch Nylas calendar events
      const nylasResponse = await fetch('/api/calendar');
      const nylasData = await nylasResponse.json();
      const nylasEvents = nylasData.events || [];

      // Fetch Teams meetings
      let teamsEvents: any[] = [];
      try {
        const teamsResponse = await fetch('/api/teams/meetings?days=30');
        const teamsData = await teamsResponse.json();

        if (teamsResponse.ok && teamsData.meetings) {
          // Transform Teams meetings to match event format
          teamsEvents = teamsData.meetings.map((meeting: any) => ({
            id: `teams-${meeting.id}`,
            title: meeting.subject,
            description: `Microsoft Teams Meeting`,
            when: {
              start_time: new Date(meeting.start.dateTime).getTime() / 1000,
              end_time: new Date(meeting.end.dateTime).getTime() / 1000,
            },
            location: meeting.onlineMeeting?.joinUrl || 'Microsoft Teams',
            status: 'confirmed',
            source: 'teams',
            joinUrl: meeting.onlineMeeting?.joinUrl,
          }));
        }
      } catch (teamsError) {
        console.log('Teams not connected or error fetching meetings');
      }

      // Merge and sort all events
      const allEvents = [...nylasEvents, ...teamsEvents].sort((a, b) => {
        const aTime = a.when?.start_time || 0;
        const bTime = b.when?.start_time || 0;
        return aTime - bTime;
      });

      setEvents(allEvents);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      toast.error('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      if (!event.when?.start_time) return false;
      const eventDate = new Date(event.when.start_time * 1000);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const getEventsForSelectedDate = () => {
    return getEventsForDate(selectedDate);
  };

  const groupEventsByDate = () => {
    const grouped: { [key: string]: any[] } = {};

    events.forEach(event => {
      const startTime = event.when?.start_time ? new Date(event.when.start_time * 1000) : new Date();
      const dateKey = startTime.toDateString();

      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });

    return grouped;
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleCreateEvent = () => {
    setCreating(true);
  };

  const datesWithEvents = events
    .filter(event => event.when?.start_time)
    .map(event => new Date(event.when.start_time * 1000));

  return (
    <div className="container max-w-7xl mx-auto py-6 px-4 h-full flex flex-col">
      {/* Back Button */}
      <div className="mb-4">
        <BackButton href="/app/inbox" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Calendar</h1>
          <p className="text-muted-foreground">Manage your schedule and events</p>
        </div>
        <div className="flex gap-2">
          <div className="flex border border-border rounded-lg p-1">
            <Button
              variant={viewMode === 'month' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('month')}
              className="h-8 px-3"
            >
              <Grid className="h-4 w-4 mr-2" />
              Month
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-8 px-3"
            >
              <List className="h-4 w-4 mr-2" />
              List
            </Button>
          </div>
          <Button variant="outline" onClick={fetchEvents} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={handleCreateEvent}>
            <Plus className="mr-2 h-4 w-4" />
            New Event
          </Button>
        </div>
      </div>

      {/* Calendar Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : viewMode === 'month' ? (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Grid */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardContent className="p-6">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  modifiers={{
                    hasEvents: datesWithEvents,
                  }}
                  modifiersClassNames={{
                    hasEvents: 'relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-primary after:rounded-full',
                  }}
                  className="rounded-md border-0"
                />
              </CardContent>
            </Card>
          </div>

          {/* Selected Date Events */}
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    {selectedDate.toLocaleDateString('default', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </CardTitle>
                  {getEventsForSelectedDate().length > 0 && (
                    <Badge variant="secondary">
                      {getEventsForSelectedDate().length} event{getEventsForSelectedDate().length !== 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                  {getEventsForSelectedDate().length === 0 ? (
                    <div className="text-center py-8">
                      <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                      <p className="text-sm text-muted-foreground mb-3">
                        No events scheduled
                      </p>
                      <Button size="sm" onClick={handleCreateEvent}>
                        <Plus className="mr-2 h-3 w-3" />
                        Create Event
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {getEventsForSelectedDate().map((event: any) => (
                        <Card
                          key={event.id}
                          className="cursor-pointer hover:border-primary transition-colors"
                          onClick={() => setSelectedEvent(event)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold text-sm line-clamp-1">
                                {event.title || '(No title)'}
                              </h4>
                              {event.source === 'teams' && (
                                <Badge variant="secondary" className="ml-2 text-xs bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                                  <Video className="h-3 w-3 mr-1" />
                                  Teams
                                </Badge>
                              )}
                            </div>
                            {event.when?.start_time && (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {new Date(event.when.start_time * 1000).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                                {event.when?.end_time && (
                                  <> - {new Date(event.when.end_time * 1000).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}</>
                                )}
                              </div>
                            )}
                            {event.location && !event.joinUrl && (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                <MapPin className="h-3 w-3" />
                                <span className="line-clamp-1">{event.location}</span>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        // List View
        <div className="flex-1">
          {events.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-64">
                <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg mb-2">No events yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create your first event to get started
                </p>
                <Button onClick={handleCreateEvent}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Event
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupEventsByDate()).map(([date, dayEvents]) => (
                <div key={date}>
                  <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" />
                    {date}
                  </h2>
                  <div className="space-y-2">
                    {dayEvents.map((event: any) => (
                      <Card key={event.id}>
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-base">{event.title || '(No title)'}</CardTitle>
                              {event.description && (
                                <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              {event.source === 'teams' && (
                                <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                                  <Video className="h-3 w-3 mr-1" />
                                  Teams
                                </Badge>
                              )}
                              <Badge variant={event.status === 'confirmed' ? 'default' : 'secondary'}>
                                {event.status || 'pending'}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            {event.when?.start_time && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {new Date(event.when.start_time * 1000).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                                {event.when?.end_time && (
                                  <> - {new Date(event.when.end_time * 1000).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}</>
                                )}
                              </div>
                            )}
                            {event.location && !event.joinUrl && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {event.location}
                              </div>
                            )}
                          </div>
                          {event.joinUrl && (
                            <div className="mt-4">
                              <Button
                                size="sm"
                                className="bg-purple-600 hover:bg-purple-700"
                                onClick={() => window.open(event.joinUrl, '_blank')}
                              >
                                <Video className="mr-2 h-4 w-4" />
                                Join Teams Meeting
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Event Dialog */}
      {creating && (
        <CreateEventDialog
          onClose={() => setCreating(false)}
          onCreated={() => {
            setCreating(false);
            fetchEvents();
          }}
        />
      )}

      {/* Event Details Dialog */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle>{selectedEvent.title || '(No title)'}</CardTitle>
                  {selectedEvent.description && (
                    <p className="text-sm text-muted-foreground mt-2">{selectedEvent.description}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedEvent(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedEvent.when?.start_time && (
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Time</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(selectedEvent.when.start_time * 1000).toLocaleString()}
                      {selectedEvent.when?.end_time && (
                        <> - {new Date(selectedEvent.when.end_time * 1000).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}</>
                      )}
                    </p>
                  </div>
                </div>
              )}
              {selectedEvent.location && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">{selectedEvent.location}</p>
                  </div>
                </div>
              )}
              {selectedEvent.source === 'teams' && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                    <Video className="h-3 w-3 mr-1" />
                    Microsoft Teams Meeting
                  </Badge>
                </div>
              )}
              {selectedEvent.joinUrl && (
                <div className="pt-2 border-t border-border">
                  <Button
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    onClick={() => window.open(selectedEvent.joinUrl, '_blank')}
                  >
                    <Video className="mr-2 h-4 w-4" />
                    Join Teams Meeting
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
