'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Calendar as CalendarIcon, Plus, RefreshCw, Clock, MapPin,
  Video, List, Grid, X, Search, Filter, Check, AlertCircle,
  TrendingUp, Users as UsersIcon, Repeat, Bell, ExternalLink, Edit
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { CreateEventDialog } from '@/components/features/create-event-dialog';
import { EditEventDialog } from '@/components/features/edit-event-dialog';
import { toast } from 'sonner';

export default function CalendarPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month' | 'agenda'>('month');
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showTeamsEvents, setShowTeamsEvents] = useState(true);
  const [showCalendarEvents, setShowCalendarEvents] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string[]>(['confirmed', 'tentative', 'pending']);
  const [showStats, setShowStats] = useState(false);

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
    const filtered = getFilteredEvents();
    return filtered.filter(event => {
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
    const filtered = getFilteredEvents();

    filtered.forEach(event => {
      const startTime = event.when?.start_time ? new Date(event.when.start_time * 1000) : new Date();
      const dateKey = startTime.toDateString();

      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });

    return grouped;
  };

  const getWeekDates = (date: Date) => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay()); // Start on Sunday
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      dates.push(d);
    }
    return dates;
  };

  const getTodayEvents = () => {
    const today = new Date();
    const filtered = getFilteredEvents();
    return filtered.filter(event => {
      if (!event.when?.start_time) return false;
      const eventDate = new Date(event.when.start_time * 1000);
      return (
        eventDate.getDate() === today.getDate() &&
        eventDate.getMonth() === today.getMonth() &&
        eventDate.getFullYear() === today.getFullYear()
      );
    }).sort((a, b) => {
      const aTime = a.when?.start_time || 0;
      const bTime = b.when?.start_time || 0;
      return aTime - bTime;
    });
  };

  const getEventColor = (event: any) => {
    if (event.source === 'teams') {
      return 'bg-purple-500 border-purple-600 text-purple-50';
    }
    // Add more calendar sources with different colors
    return 'bg-blue-500 border-blue-600 text-blue-50';
  };

  const getEventBadgeColor = (event: any) => {
    if (event.source === 'teams') {
      return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
    }
    return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
  };

  // Check if event is recurring
  const isRecurring = (event: any) => {
    return event.recurrence || event.recurring || event.seriesMasterId || event.recurrenceRule;
  };

  // Filter events based on search, calendar source, and status
  const getFilteredEvents = () => {
    return events.filter(event => {
      // Filter by calendar source
      if (event.source === 'teams' && !showTeamsEvents) return false;
      if (event.source !== 'teams' && !showCalendarEvents) return false;

      // Filter by status
      const status = event.status || 'pending';
      if (!filterStatus.includes(status)) return false;

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const title = (event.title || '').toLowerCase();
        const description = (event.description || '').toLowerCase();
        const location = (event.location || '').toLowerCase();
        return title.includes(query) || description.includes(query) || location.includes(query);
      }

      return true;
    });
  };

  // Check for overlapping events (conflicts)
  const hasConflict = (event: any) => {
    if (!event.when?.start_time || !event.when?.end_time) return false;

    const eventStart = event.when.start_time;
    const eventEnd = event.when.end_time;

    return events.some(other => {
      if (other.id === event.id) return false;
      if (!other.when?.start_time || !other.when?.end_time) return false;

      const otherStart = other.when.start_time;
      const otherEnd = other.when.end_time;

      // Check for overlap
      return (eventStart < otherEnd && eventEnd > otherStart);
    });
  };

  // Get meeting stats
  const getMeetingStats = () => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    const thisWeekEvents = events.filter(event => {
      if (!event.when?.start_time) return false;
      const eventDate = new Date(event.when.start_time * 1000);
      return eventDate >= weekStart && eventDate < weekEnd;
    });

    const totalMeetings = thisWeekEvents.length;
    const totalMinutes = thisWeekEvents.reduce((sum, event) => {
      if (!event.when?.start_time || !event.when?.end_time) return sum;
      const duration = (event.when.end_time - event.when.start_time) / 60;
      return sum + duration;
    }, 0);

    const teamsMeetings = thisWeekEvents.filter(e => e.source === 'teams').length;
    const conflicts = thisWeekEvents.filter(e => hasConflict(e)).length / 2; // Divide by 2 as each conflict is counted twice

    return {
      totalMeetings,
      totalHours: Math.round(totalMinutes / 60 * 10) / 10,
      teamsMeetings,
      conflicts: Math.floor(conflicts),
    };
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleCreateEvent = () => {
    setCreating(true);
  };

  const handleEditEvent = (event: any) => {
    setEventToEdit(event);
    setEditing(true);
    setSelectedEvent(null);
  };

  const handleRSVP = async (eventId: string, status: 'yes' | 'no' | 'maybe') => {
    try {
      const response = await fetch(`/api/calendar/${eventId}/rsvp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        const statusText = status === 'yes' ? 'Accepted' : status === 'no' ? 'Declined' : 'Marked as tentative';
        toast.success(`${statusText} event`);
        setSelectedEvent(null);
        fetchEvents(); // Refresh events to show updated status
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to send RSVP');
      }
    } catch (error) {
      console.error('RSVP error:', error);
      toast.error('Failed to send RSVP');
    }
  };

  const datesWithEvents = getFilteredEvents()
    .filter(event => event.when?.start_time)
    .map(event => new Date(event.when.start_time * 1000));

  return (
    <div className="container max-w-7xl mx-auto py-6 px-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Calendar</h1>
          <p className="text-muted-foreground">Manage your schedule and events</p>
        </div>
        <div className="flex gap-2">
          <div className="flex border border-border rounded-lg p-1">
            <Button
              variant={viewMode === 'day' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('day')}
              className="h-8 px-3"
            >
              Day
            </Button>
            <Button
              variant={viewMode === 'week' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('week')}
              className="h-8 px-3"
            >
              Week
            </Button>
            <Button
              variant={viewMode === 'month' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('month')}
              className="h-8 px-3"
            >
              Month
            </Button>
            <Button
              variant={viewMode === 'agenda' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('agenda')}
              className="h-8 px-3"
            >
              <List className="h-4 w-4 mr-2" />
              Agenda
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

      {/* Search, Filters, and Stats */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[250px] max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Calendar Source Filters */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Calendars
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Show/Hide Calendars</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={showCalendarEvents}
                onCheckedChange={setShowCalendarEvents}
              >
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span>Email Calendar</span>
                </div>
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={showTeamsEvents}
                onCheckedChange={setShowTeamsEvents}
              >
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span>Microsoft Teams</span>
                </div>
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Stats Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowStats(!showStats)}
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            {showStats ? 'Hide Stats' : 'Show Stats'}
          </Button>

          {/* Color Legend */}
          <div className="flex items-center gap-4 px-3 py-1.5 bg-muted/50 rounded-lg text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-muted-foreground">Calendar</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span className="text-muted-foreground">Teams</span>
            </div>
          </div>
        </div>

        {/* Stats Panel */}
        {showStats && (
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">This Week</p>
                  <p className="text-2xl font-bold">{getMeetingStats().totalMeetings}</p>
                  <p className="text-xs text-muted-foreground">meetings</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Time</p>
                  <p className="text-2xl font-bold">{getMeetingStats().totalHours}h</p>
                  <p className="text-xs text-muted-foreground">in meetings</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Teams Meetings</p>
                  <p className="text-2xl font-bold">{getMeetingStats().teamsMeetings}</p>
                  <p className="text-xs text-muted-foreground">online</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Conflicts</p>
                  <p className="text-2xl font-bold text-orange-500">{getMeetingStats().conflicts}</p>
                  <p className="text-xs text-muted-foreground">overlapping</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Calendar Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : viewMode === 'agenda' ? (
        // Agenda View - Today's Events
        <div className="flex-1">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Today's Agenda</CardTitle>
                <Badge variant="secondary">
                  {getTodayEvents().length} event{getTodayEvents().length !== 1 ? 's' : ''}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString('default', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                {getTodayEvents().length === 0 ? (
                  <div className="text-center py-16">
                    <CalendarIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">No events today</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Enjoy your free time!
                    </p>
                    <Button size="sm" onClick={handleCreateEvent}>
                      <Plus className="mr-2 h-3 w-3" />
                      Create Event
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {getTodayEvents().map((event: any) => (
                      <Card
                        key={event.id}
                        className={`cursor-pointer hover:shadow-md transition-all border-l-4 ${getEventColor(event).replace('bg-', 'border-l-')}`}
                        onClick={() => setSelectedEvent(event)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-base">
                                  {event.title || '(No title)'}
                                </h4>
                                {hasConflict(event) && (
                                  <Badge variant="destructive" className="text-xs">
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    Conflict
                                  </Badge>
                                )}
                              </div>
                              {event.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {event.description}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              {event.source === 'teams' && (
                                <Badge variant="secondary" className={getEventBadgeColor(event)}>
                                  <Video className="h-3 w-3 mr-1" />
                                  Teams
                                </Badge>
                              )}
                              {isRecurring(event) && (
                                <Badge variant="outline" className="text-xs">
                                  <Repeat className="h-3 w-3 mr-1" />
                                  Recurring
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm">
                            {event.when?.start_time && (
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">
                                  {new Date(event.when.start_time * 1000).toLocaleTimeString([], {
                                    hour: 'numeric',
                                    minute: '2-digit',
                                  })}
                                  {event.when?.end_time && (
                                    <> - {new Date(event.when.end_time * 1000).toLocaleTimeString([], {
                                      hour: 'numeric',
                                      minute: '2-digit',
                                    })}</>
                                  )}
                                </span>
                              </div>
                            )}
                            {event.location && !event.joinUrl && (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground line-clamp-1">{event.location}</span>
                              </div>
                            )}
                          </div>
                          {event.joinUrl && (
                            <div className="mt-3 pt-3 border-t border-border">
                              <Button
                                size="sm"
                                className="bg-purple-600 hover:bg-purple-700"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(event.joinUrl, '_blank');
                                }}
                              >
                                <Video className="mr-2 h-4 w-4" />
                                Join Meeting
                              </Button>
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
      ) : viewMode === 'day' ? (
        // Day View - Single day with hourly timeline
        <div className="flex-1">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">
                    {selectedDate.toLocaleDateString('default', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </CardTitle>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newDate = new Date(selectedDate);
                      newDate.setDate(newDate.getDate() - 1);
                      setSelectedDate(newDate);
                    }}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDate(new Date())}
                  >
                    Today
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newDate = new Date(selectedDate);
                      newDate.setDate(newDate.getDate() + 1);
                      setSelectedDate(newDate);
                    }}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                {getEventsForSelectedDate().length === 0 ? (
                  <div className="text-center py-16">
                    <CalendarIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">No events scheduled</p>
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
                        className={`cursor-pointer hover:shadow-md transition-all border-l-4 ${getEventColor(event).replace('bg-', 'border-l-')}`}
                        onClick={() => setSelectedEvent(event)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2 flex-1">
                              <h4 className="font-semibold text-base">
                                {event.title || '(No title)'}
                              </h4>
                              {hasConflict(event) && (
                                <Badge variant="destructive" className="text-xs">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Conflict
                                </Badge>
                              )}
                            </div>
                            <div className="flex gap-2">
                              {event.source === 'teams' && (
                                <Badge variant="secondary" className={getEventBadgeColor(event)}>
                                  <Video className="h-3 w-3 mr-1" />
                                  Teams
                                </Badge>
                              )}
                              {isRecurring(event) && (
                                <Badge variant="outline" className="text-xs">
                                  <Repeat className="h-3 w-3" />
                                </Badge>
                              )}
                            </div>
                          </div>
                          {event.description && (
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {event.description}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-4 text-sm">
                            {event.when?.start_time && (
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">
                                  {new Date(event.when.start_time * 1000).toLocaleTimeString([], {
                                    hour: 'numeric',
                                    minute: '2-digit',
                                  })}
                                  {event.when?.end_time && (
                                    <> - {new Date(event.when.end_time * 1000).toLocaleTimeString([], {
                                      hour: 'numeric',
                                      minute: '2-digit',
                                    })}</>
                                  )}
                                </span>
                              </div>
                            )}
                            {event.location && !event.joinUrl && (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">{event.location}</span>
                              </div>
                            )}
                          </div>
                          {event.joinUrl && (
                            <div className="mt-3 pt-3 border-t border-border">
                              <Button
                                size="sm"
                                className="bg-purple-600 hover:bg-purple-700"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(event.joinUrl, '_blank');
                                }}
                              >
                                <Video className="mr-2 h-4 w-4" />
                                Join Meeting
                              </Button>
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
      ) : viewMode === 'week' ? (
        // Week View - 7 days in columns
        <div className="flex-1">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Week View</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newDate = new Date(selectedDate);
                      newDate.setDate(newDate.getDate() - 7);
                      setSelectedDate(newDate);
                    }}
                  >
                    Previous Week
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDate(new Date())}
                  >
                    This Week
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newDate = new Date(selectedDate);
                      newDate.setDate(newDate.getDate() + 7);
                      setSelectedDate(newDate);
                    }}
                  >
                    Next Week
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="grid grid-cols-7 gap-2">
                  {getWeekDates(selectedDate).map((date, index) => {
                    const dayEvents = getEventsForDate(date);
                    const isToday = date.toDateString() === new Date().toDateString();
                    return (
                      <div key={index} className={`border rounded-lg p-2 ${isToday ? 'border-primary bg-primary/5' : 'border-border'}`}>
                        <div className="text-center mb-2">
                          <div className="text-xs font-medium text-muted-foreground">
                            {date.toLocaleDateString('default', { weekday: 'short' })}
                          </div>
                          <div className={`text-lg font-bold ${isToday ? 'text-primary' : ''}`}>
                            {date.getDate()}
                          </div>
                        </div>
                        <div className="space-y-1">
                          {dayEvents.length === 0 ? (
                            <p className="text-xs text-muted-foreground text-center py-2">No events</p>
                          ) : (
                            dayEvents.map((event: any) => (
                              <div
                                key={event.id}
                                className={`p-1.5 rounded text-xs cursor-pointer hover:opacity-80 transition-opacity ${getEventColor(event)}`}
                                onClick={() => setSelectedEvent(event)}
                              >
                                <div className="font-medium line-clamp-1 text-white">
                                  {event.title || '(No title)'}
                                </div>
                                {event.when?.start_time && (
                                  <div className="text-white/90 text-[10px]">
                                    {new Date(event.when.start_time * 1000).toLocaleTimeString([], {
                                      hour: 'numeric',
                                      minute: '2-digit',
                                    })}
                                  </div>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      ) : viewMode === 'month' ? (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Grid */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardContent className="p-6 flex items-center justify-center">
                <div className="w-full max-w-3xl">
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
                    className="rounded-md border-0 w-full"
                  />
                </div>
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
                <ScrollArea className="h-[650px] pr-4">
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
                      {getEventsForSelectedDate().map((event: any) => {
                        const borderColor = event.source === 'teams' ? 'border-l-purple-500' : 'border-l-blue-500';
                        return (
                          <Card
                            key={event.id}
                            className={`cursor-pointer hover:shadow-md transition-all border-l-4 ${borderColor}`}
                            onClick={() => setSelectedEvent(event)}
                          >
                            <CardContent className="p-3">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-1 flex-1 min-w-0">
                                  <h4 className="font-semibold text-sm line-clamp-1">
                                    {event.title || '(No title)'}
                                  </h4>
                                  {hasConflict(event) && (
                                    <AlertCircle className="h-3 w-3 text-orange-500 flex-shrink-0" />
                                  )}
                                  {isRecurring(event) && (
                                    <Repeat className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                  )}
                                </div>
                                {event.source === 'teams' && (
                                  <Badge variant="secondary" className={`ml-2 text-xs ${getEventBadgeColor(event)}`}>
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
                        );
                      })}
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
          existingEvents={events}
        />
      )}

      {/* Edit Event Dialog */}
      {editing && eventToEdit && (
        <EditEventDialog
          event={eventToEdit}
          onClose={() => {
            setEditing(false);
            setEventToEdit(null);
          }}
          onUpdated={() => {
            setEditing(false);
            setEventToEdit(null);
            fetchEvents();
          }}
        />
      )}

      {/* Event Details Dialog */}
      {selectedEvent && (() => {
        const now = new Date();
        const eventStart = selectedEvent.when?.start_time ? new Date(selectedEvent.when.start_time * 1000) : null;
        const eventEnd = selectedEvent.when?.end_time ? new Date(selectedEvent.when.end_time * 1000) : null;
        const minutesUntilStart = eventStart ? Math.floor((eventStart.getTime() - now.getTime()) / (1000 * 60)) : null;
        const isStartingSoon = minutesUntilStart !== null && minutesUntilStart >= 0 && minutesUntilStart <= 15;
        const isHappening = eventStart && eventEnd && now >= eventStart && now <= eventEnd;
        const conflict = hasConflict(selectedEvent);

        return (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedEvent(null)}>
            <Card className="w-full max-w-lg max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
              <CardHeader className="shrink-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <CardTitle>{selectedEvent.title || '(No title)'}</CardTitle>
                      {conflict && (
                        <Badge variant="destructive" className="text-xs">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Conflict
                        </Badge>
                      )}
                      {isRecurring(selectedEvent) && (
                        <Badge variant="outline" className="text-xs">
                          <Repeat className="h-3 w-3 mr-1" />
                          Recurring
                        </Badge>
                      )}
                    </div>
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
              <ScrollArea className="flex-1 overflow-y-auto">
                <CardContent className="space-y-4">
                {/* Starting Soon Banner */}
                {(isStartingSoon || isHappening) && selectedEvent.joinUrl && (
                  <div className={`p-3 rounded-lg ${isHappening ? 'bg-green-100 dark:bg-green-900' : 'bg-blue-100 dark:bg-blue-900'}`}>
                    <p className={`text-sm font-medium ${isHappening ? 'text-green-900 dark:text-green-100' : 'text-blue-900 dark:text-blue-100'}`}>
                      {isHappening ? '🟢 Meeting is happening now!' : `⏰ Starting in ${minutesUntilStart} minute${minutesUntilStart !== 1 ? 's' : ''}`}
                    </p>
                  </div>
                )}

                {selectedEvent.when?.start_time && (
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
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
                      <p className="text-xs text-muted-foreground mt-1">
                        {Intl.DateTimeFormat().resolvedOptions().timeZone}
                      </p>
                    </div>
                  </div>
                )}

                {conflict && (
                  <div className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm text-orange-900 dark:text-orange-100">Schedule Conflict</p>
                      <p className="text-xs text-orange-700 dark:text-orange-200">
                        This event overlaps with another meeting
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

                {/* Attendees if available */}
                {selectedEvent.participants && selectedEvent.participants.length > 0 && (
                  <div className="flex items-start gap-3">
                    <UsersIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium">Attendees</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedEvent.participants.length} participant{selectedEvent.participants.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="flex gap-2 pt-2 border-t border-border">
                  {selectedEvent.source !== 'teams' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditEvent(selectedEvent)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit Event
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      toast.success('Reminder set for 15 minutes before');
                    }}
                  >
                    <Bell className="h-4 w-4 mr-1" />
                    Set Reminder
                  </Button>
                  {selectedEvent.htmlLink && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(selectedEvent.htmlLink, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Open in Calendar
                    </Button>
                  )}
                </div>

                {/* RSVP Buttons */}
                {selectedEvent.source !== 'teams' && (
                  <div className="pt-2 border-t border-border">
                    <p className="text-sm font-medium mb-2">Response</p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleRSVP(selectedEvent.id, 'yes')}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Accept
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleRSVP(selectedEvent.id, 'maybe')}
                      >
                        Tentative
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleRSVP(selectedEvent.id, 'no')}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Decline
                      </Button>
                    </div>
                  </div>
                )}

                {/* Join Meeting Button */}
                {selectedEvent.joinUrl && (
                  <div className="pt-2 border-t border-border">
                    <Button
                      className={`w-full ${isStartingSoon || isHappening ? 'bg-green-600 hover:bg-green-700 animate-pulse' : 'bg-purple-600 hover:bg-purple-700'}`}
                      onClick={() => window.open(selectedEvent.joinUrl, '_blank')}
                    >
                      <Video className="mr-2 h-4 w-4" />
                      {isHappening ? 'Join Now' : isStartingSoon ? 'Join Meeting (Starting Soon)' : 'Join Teams Meeting'}
                    </Button>
                  </div>
                )}
                </CardContent>
              </ScrollArea>
            </Card>
          </div>
        );
      })()}
    </div>
  );
}
