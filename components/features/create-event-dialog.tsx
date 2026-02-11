'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Loader2, Sparkles, Video, X, Plus } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { extractCalendarEvent } from '@/lib/openai/client';

interface CreateEventDialogProps {
  onClose: () => void;
  onCreated: () => void;
}

export function CreateEventDialog({ onClose, onCreated }: CreateEventDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [attendees, setAttendees] = useState<string[]>([]);
  const [attendeeInput, setAttendeeInput] = useState('');
  const [isTeamsMeeting, setIsTeamsMeeting] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState<string>('none');
  const [recurrenceInterval, setRecurrenceInterval] = useState(1);
  const [creating, setCreating] = useState(false);
  const [aiExtracting, setAiExtracting] = useState(false);

  const addAttendee = () => {
    if (!attendeeInput.trim()) return;

    const email = attendeeInput.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (attendees.includes(email)) {
      toast.error('Attendee already added');
      return;
    }

    setAttendees([...attendees, email]);
    setAttendeeInput('');
  };

  const removeAttendee = (email: string) => {
    setAttendees(attendees.filter(a => a !== email));
  };

  const handleAIExtract = async () => {
    if (!description || description.length < 10) {
      toast.error('Please write some event details first');
      return;
    }

    try {
      setAiExtracting(true);
      const response = await fetch('/api/ai/extract-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: description }),
      });

      const data = await response.json();
      console.log('AI extracted event:', data.event);

      if (data.event) {
        const event = data.event;
        let fieldsPopulated = 0;

        // Extract title
        if (event.title) {
          setTitle(event.title);
          fieldsPopulated++;
        }

        // Extract date and time
        if (event.date && event.time) {
          try {
            // Handle various time formats (HH:MM or HH:MM:SS)
            let timeStr = event.time;
            if (timeStr.length === 5) {
              timeStr = timeStr + ':00'; // Add seconds if missing
            }

            // CRITICAL FIX: Build datetime string in LOCAL time format
            // Do NOT use .toISOString() as it converts to UTC and causes timezone offset bugs
            // For datetime-local inputs, we need "YYYY-MM-DDTHH:MM" in local time
            const datetimeLocal = `${event.date}T${timeStr.slice(0, 5)}`; // HH:MM format

            // Validate by creating a date object
            const testDate = new Date(datetimeLocal);
            if (!isNaN(testDate.getTime())) {
              // Use the local datetime string directly (NO timezone conversion)
              setStartTime(datetimeLocal);
              console.log('✅ Set start time (local):', datetimeLocal);

              // Calculate end time
              const durationMinutes = event.duration;

              if (durationMinutes && durationMinutes > 0) {
                // If duration provided, calculate end time
                const endMs = new Date(datetimeLocal).getTime() + durationMinutes * 60000;
                const endDate = new Date(endMs);
                const endYear = endDate.getFullYear();
                const endMonth = String(endDate.getMonth() + 1).padStart(2, '0');
                const endDay = String(endDate.getDate()).padStart(2, '0');
                const endHour = String(endDate.getHours()).padStart(2, '0');
                const endMinute = String(endDate.getMinutes()).padStart(2, '0');
                const endLocal = `${endYear}-${endMonth}-${endDay}T${endHour}:${endMinute}`;
                setEndTime(endLocal);
                console.log('✅ Set end time (local):', endLocal, `(${durationMinutes} minutes)`);
              } else {
                // No duration - leave end time empty, user will be prompted
                setEndTime('');
                console.log('⚠️ No duration provided - end time left empty for user input');
              }
              fieldsPopulated++;
            } else {
              console.error('❌ Invalid date created from:', event.date, event.time);
              toast.error('Could not parse date/time from AI response');
            }
          } catch (dateError) {
            console.error('❌ Date parsing error:', dateError);
            toast.error('Could not parse date/time format');
          }
        } else {
          console.warn('⚠️ AI did not return both date and time:', { date: event.date, time: event.time });
        }

        // Extract location
        if (event.location) {
          setLocation(event.location);
          fieldsPopulated++;
        }

        // Extract attendees if provided
        if (event.attendees && Array.isArray(event.attendees)) {
          const validEmails = event.attendees.filter((email: string) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return typeof email === 'string' && emailRegex.test(email);
          });
          if (validEmails.length > 0) {
            setAttendees(validEmails);
            fieldsPopulated++;
          }
        }

        if (fieldsPopulated > 0) {
          // Check if any required fields are still missing
          const stillMissing = [];
          if (!title) stillMissing.push('title');
          if (!startTime) stillMissing.push('start time');
          if (!endTime) stillMissing.push('end time');

          if (stillMissing.length > 0) {
            toast.success(`✨ Extracted ${fieldsPopulated} field${fieldsPopulated > 1 ? 's' : ''}! Please also add: ${stillMissing.join(', ')}`);
          } else {
            toast.success(`✨ Extracted ${fieldsPopulated} field${fieldsPopulated > 1 ? 's' : ''}! Ready to create.`);
          }
        } else {
          toast.error('Could not extract event details. Please fill manually.');
        }
      } else {
        toast.error('No event data received from AI');
      }
    } catch (error) {
      console.error('AI extract error:', error);
      toast.error('Failed to extract event details');
    } finally {
      setAiExtracting(false);
    }
  };

  const handleCreate = async () => {
    // Validate required fields and give helpful messages
    const missingFields = [];
    if (!title || title.trim() === '') missingFields.push('title');
    if (!startTime) missingFields.push('start time');
    if (!endTime) missingFields.push('end time');

    if (missingFields.length > 0) {
      const fieldsText = missingFields.join(', ');
      toast.error(`Please provide: ${fieldsText}`);
      return;
    }

    try {
      setCreating(true);

      // Build recurrence rules if needed
      let recurrence = null;
      if (recurrenceType !== 'none') {
        recurrence = [
          `RRULE:FREQ=${recurrenceType.toUpperCase()};INTERVAL=${recurrenceInterval}`
        ];
      }

      // If Teams meeting, create via Teams API
      if (isTeamsMeeting) {
        const response = await fetch('/api/teams/meetings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subject: title,
            startDateTime: startTime,
            endDateTime: endTime,
            content: description,
            attendees: attendees,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          toast.success('📅 Teams meeting created successfully!');
          onCreated();
        } else {
          toast.error(data.error || 'Failed to create Teams meeting');
        }
      } else {
        // Regular calendar event
        const response = await fetch('/api/calendar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            description,
            startTime,
            endTime,
            location,
            attendees: attendees.length > 0 ? attendees : undefined,
            recurrence,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          toast.success('📅 Event created successfully!');
          onCreated();
        } else {
          toast.error(data.error || 'Failed to create event');
        }
      }
    } catch (error) {
      console.error('Create event error:', error);
      toast.error('Failed to create event');
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-2 shrink-0">
          <DialogTitle>Create Calendar Event</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 overflow-y-auto">
          <div className="space-y-3 pb-4">
          {/* Description (AI Input) */}
          <div className="space-y-2">
            <Label htmlFor="description">Event Description (Natural Language)</Label>
            <Textarea
              id="description"
              placeholder="e.g., 'Meet with John next Tuesday at 2pm to discuss Q1 budget at Conference Room A'"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAIExtract}
              disabled={aiExtracting || description.length < 10}
            >
              {aiExtracting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Extracting...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Extract with AI
                </>
              )}
            </Button>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Event title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Times */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time *</Label>
              <Input
                id="startTime"
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time *</Label>
              <Input
                id="endTime"
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="Meeting location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={isTeamsMeeting}
            />
            {isTeamsMeeting && (
              <p className="text-xs text-muted-foreground">Location set to Microsoft Teams (online)</p>
            )}
          </div>

          {/* Attendees */}
          <div className="space-y-2">
            <Label htmlFor="attendees">Attendees (Optional)</Label>
            <div className="flex gap-2">
              <Input
                id="attendees"
                type="email"
                placeholder="email@example.com"
                value={attendeeInput}
                onChange={(e) => setAttendeeInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addAttendee();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addAttendee}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {attendees.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {attendees.map((email) => (
                  <div
                    key={email}
                    className="flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm"
                  >
                    <span>{email}</span>
                    <button
                      type="button"
                      onClick={() => removeAttendee(email)}
                      className="hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Teams Meeting Toggle */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Video className="h-4 w-4 text-purple-600" />
              <div>
                <Label htmlFor="teams-toggle" className="cursor-pointer">Make this a Teams meeting</Label>
                <p className="text-xs text-muted-foreground">Generates join link automatically</p>
              </div>
            </div>
            <Switch
              id="teams-toggle"
              checked={isTeamsMeeting}
              onCheckedChange={setIsTeamsMeeting}
            />
          </div>

          {/* Recurrence */}
          {!isTeamsMeeting && (
            <div className="space-y-2">
              <Label htmlFor="recurrence">Recurrence (Optional)</Label>
              <div className="grid grid-cols-2 gap-4">
                <Select value={recurrenceType} onValueChange={setRecurrenceType}>
                  <SelectTrigger id="recurrence">
                    <SelectValue placeholder="Does not repeat" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Does not repeat</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
                {recurrenceType !== 'none' && (
                  <div className="flex items-center gap-2">
                    <Label htmlFor="interval" className="whitespace-nowrap text-sm">Every</Label>
                    <Input
                      id="interval"
                      type="number"
                      min="1"
                      max="30"
                      value={recurrenceInterval}
                      onChange={(e) => setRecurrenceInterval(parseInt(e.target.value) || 1)}
                      className="w-20"
                    />
                    <span className="text-sm text-muted-foreground">
                      {recurrenceType === 'daily' ? 'day(s)' :
                       recurrenceType === 'weekly' ? 'week(s)' :
                       recurrenceType === 'monthly' ? 'month(s)' : 'year(s)'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
          </div>
        </ScrollArea>

        {/* Actions */}
        <div className="flex justify-end gap-2 p-6 pt-4 border-t border-border shrink-0">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={creating}>
            {creating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Calendar className="mr-2 h-4 w-4" />
                Create Event
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
