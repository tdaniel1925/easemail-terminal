'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, Loader2, Sparkles } from 'lucide-react';
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
  const [creating, setCreating] = useState(false);
  const [aiExtracting, setAiExtracting] = useState(false);

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

      if (data.event) {
        const event = data.event;
        if (event.title) setTitle(event.title);
        if (event.date && event.time) {
          const eventDate = new Date(`${event.date}T${event.time}`);
          setStartTime(eventDate.toISOString().slice(0, 16));

          // Set end time 1 hour after start
          const endDate = new Date(eventDate.getTime() + (event.duration || 60) * 60000);
          setEndTime(endDate.toISOString().slice(0, 16));
        }
        if (event.location) setLocation(event.location);

        toast.success('✨ Event details extracted!');
      }
    } catch (error) {
      console.error('AI extract error:', error);
      toast.error('Failed to extract event details');
    } finally {
      setAiExtracting(false);
    }
  };

  const handleCreate = async () => {
    if (!title || !startTime || !endTime) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      setCreating(true);
      const response = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          startTime,
          endTime,
          location,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('📅 Event created successfully!');
        onCreated();
      } else {
        toast.error(data.error || 'Failed to create event');
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Calendar Event</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
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
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t border-border">
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
