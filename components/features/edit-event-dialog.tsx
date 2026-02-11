'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Loader2, X, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface EditEventDialogProps {
  event: any;
  onClose: () => void;
  onUpdated: () => void;
}

export function EditEventDialog({ event, onClose, onUpdated }: EditEventDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [attendees, setAttendees] = useState<string[]>([]);
  const [attendeeInput, setAttendeeInput] = useState('');
  const [recurrenceType, setRecurrenceType] = useState<string>('none');
  const [recurrenceInterval, setRecurrenceInterval] = useState(1);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (event) {
      setTitle(event.title || '');
      setDescription(event.description || '');

      if (event.when?.start_time) {
        const startDate = new Date(event.when.start_time * 1000);
        setStartTime(startDate.toISOString().slice(0, 16));
      }

      if (event.when?.end_time) {
        const endDate = new Date(event.when.end_time * 1000);
        setEndTime(endDate.toISOString().slice(0, 16));
      }

      setLocation(event.location || '');

      if (event.participants && event.participants.length > 0) {
        setAttendees(event.participants.map((p: any) => p.email).filter(Boolean));
      }

      // Parse recurrence if exists
      if (event.recurrence && event.recurrence.length > 0) {
        const rrule = event.recurrence[0];
        if (rrule.includes('FREQ=DAILY')) setRecurrenceType('daily');
        else if (rrule.includes('FREQ=WEEKLY')) setRecurrenceType('weekly');
        else if (rrule.includes('FREQ=MONTHLY')) setRecurrenceType('monthly');
        else if (rrule.includes('FREQ=YEARLY')) setRecurrenceType('yearly');

        const intervalMatch = rrule.match(/INTERVAL=(\d+)/);
        if (intervalMatch) {
          setRecurrenceInterval(parseInt(intervalMatch[1]));
        }
      }
    }
  }, [event]);

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

  const handleUpdate = async () => {
    if (!title || !startTime || !endTime) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      setUpdating(true);

      // Build recurrence rules if needed
      let recurrence = null;
      if (recurrenceType !== 'none') {
        recurrence = [
          `RRULE:FREQ=${recurrenceType.toUpperCase()};INTERVAL=${recurrenceInterval}`
        ];
      }

      const response = await fetch(`/api/calendar/${event.id}`, {
        method: 'PUT',
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
        toast.success('✅ Event updated successfully!');
        onUpdated();
      } else {
        toast.error(data.error || 'Failed to update event');
      }
    } catch (error) {
      console.error('Update event error:', error);
      toast.error('Failed to update event');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);

      const response = await fetch(`/api/calendar/${event.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('🗑️ Event deleted successfully!');
        onUpdated();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to delete event');
      }
    } catch (error) {
      console.error('Delete event error:', error);
      toast.error('Failed to delete event');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (showDeleteConfirm) {
    return (
      <Dialog open onOpenChange={() => setShowDeleteConfirm(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Event?</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete "{title}"? This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
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
                  Delete Event
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
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

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Event description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
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
            />
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

          {/* Recurrence */}
          {!event.source || event.source !== 'teams' ? (
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
          ) : null}
        </div>

        {/* Actions */}
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => setShowDeleteConfirm(true)}
            className="mr-auto"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleUpdate} disabled={updating}>
            {updating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Calendar className="mr-2 h-4 w-4" />
                Update Event
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
