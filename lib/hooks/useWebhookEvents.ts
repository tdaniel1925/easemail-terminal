import { useEffect, useRef, useState, useCallback } from 'react';

interface WebhookEvent {
  id: string;
  user_id: string;
  event_type: string;
  grant_id: string;
  object_id: string;
  payload: any;
  processed: boolean;
  created_at: string;
}

interface UseWebhookEventsOptions {
  enabled?: boolean;
  pollInterval?: number; // milliseconds
  eventTypes?: string[]; // Filter by specific event types
  onNewEvent?: (event: WebhookEvent) => void;
  onNewEvents?: (events: WebhookEvent[]) => void;
}

export function useWebhookEvents(options: UseWebhookEventsOptions = {}) {
  const {
    enabled = true,
    pollInterval = 10000, // 10 seconds
    eventTypes = [],
    onNewEvent,
    onNewEvents,
  } = options;

  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const lastPollTimeRef = useRef<string>(new Date().toISOString());
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchNewEvents = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        since: lastPollTimeRef.current,
        processed: 'false',
        limit: '50',
      });

      if (eventTypes.length > 0) {
        params.append('type', eventTypes.join(','));
      }

      const response = await fetch(`/api/webhooks/events?${params.toString()}`);
      const data = await response.json();

      if (response.ok && data.events && data.events.length > 0) {
        const newEvents = data.events as WebhookEvent[];

        // Update events state
        setEvents((prev) => [...newEvents, ...prev]);
        setUnreadCount((prev) => prev + newEvents.length);

        // Update last poll time to most recent event
        lastPollTimeRef.current = newEvents[0].created_at;

        // Trigger callbacks
        if (onNewEvents) {
          onNewEvents(newEvents);
        }
        if (onNewEvent) {
          newEvents.forEach((event) => onNewEvent(event));
        }
      }
    } catch (error) {
      console.error('Error fetching webhook events:', error);
    }
  }, [eventTypes, onNewEvent, onNewEvents]);

  const markAsProcessed = useCallback(async (eventIds: string[]) => {
    try {
      const response = await fetch('/api/webhooks/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventIds }),
      });

      if (response.ok) {
        // Update local state
        setEvents((prev) =>
          prev.map((event) =>
            eventIds.includes(event.id)
              ? { ...event, processed: true }
              : event
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - eventIds.length));
      }
    } catch (error) {
      console.error('Error marking events as processed:', error);
    }
  }, []);

  const markAllAsProcessed = useCallback(async () => {
    const unprocessedIds = events
      .filter((e) => !e.processed)
      .map((e) => e.id);

    if (unprocessedIds.length > 0) {
      await markAsProcessed(unprocessedIds);
    }
  }, [events, markAsProcessed]);

  const clearEvents = useCallback(() => {
    setEvents([]);
    setUnreadCount(0);
  }, []);

  // Setup polling
  useEffect(() => {
    if (!enabled) {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      return;
    }

    // Initial fetch
    fetchNewEvents();

    // Setup interval
    pollIntervalRef.current = setInterval(fetchNewEvents, pollInterval);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [enabled, pollInterval, fetchNewEvents]);

  return {
    events,
    unreadCount,
    markAsProcessed,
    markAllAsProcessed,
    clearEvents,
    refetch: fetchNewEvents,
  };
}

/**
 * Hook specifically for new email notifications
 */
export function useEmailNotifications(
  onNewEmail?: (event: WebhookEvent) => void
) {
  return useWebhookEvents({
    eventTypes: ['message.created'],
    onNewEvent: onNewEmail,
  });
}

/**
 * Hook for calendar event notifications
 */
export function useCalendarNotifications(
  onNewEvent?: (event: WebhookEvent) => void
) {
  return useWebhookEvents({
    eventTypes: ['event.created', 'event.updated', 'event.deleted'],
    onNewEvent,
  });
}
