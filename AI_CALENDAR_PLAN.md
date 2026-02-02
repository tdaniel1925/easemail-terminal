# AI-Powered Calendar Feature - Implementation Plan

## Executive Summary

This document outlines the complete implementation plan for adding an AI-powered calendar feature to EaseMail. The calendar will intelligently extract events from emails, parse natural language dates, sync with external calendars, and provide smart scheduling suggestions.

---

## Table of Contents

1. [Feature Overview](#feature-overview)
2. [Architecture](#architecture)
3. [Database Schema](#database-schema)
4. [AI Components](#ai-components)
5. [API Endpoints](#api-endpoints)
6. [Frontend Components](#frontend-components)
7. [Third-Party Integrations](#third-party-integrations)
8. [Implementation Phases](#implementation-phases)
9. [Security Considerations](#security-considerations)
10. [Testing Strategy](#testing-strategy)

---

## Feature Overview

### Core Features

1. **AI Event Extraction**
   - Automatically detect events, meetings, and appointments in emails
   - Extract event details: title, date, time, location, attendees
   - Confidence scoring for extracted events
   - User confirmation before adding to calendar

2. **Natural Language Processing**
   - Parse dates like "next Tuesday", "in 3 days", "tomorrow at 2pm"
   - Handle relative dates, recurring patterns
   - Multi-language support (starting with English)

3. **Calendar Sync**
   - Two-way sync with Google Calendar
   - Two-way sync with Microsoft Outlook Calendar
   - Apple Calendar (iCal) support
   - Sync conflicts resolution

4. **Smart Scheduling**
   - Suggest optimal meeting times based on availability
   - Consider time zones for attendees
   - Respect working hours and preferences
   - Buffer time between meetings

5. **Conflict Detection**
   - Real-time conflict warnings
   - Alternative time suggestions
   - Visual conflict indicators

6. **AI-Powered Features**
   - Smart reminders based on event type and importance
   - Meeting preparation summaries
   - Automatic meeting notes from email threads
   - Travel time calculations for in-person meetings

---

## Architecture

### High-Level Flow

```
┌─────────────────┐
│  Incoming Email │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  AI Classifier  │ ──► Is this event-related?
└────────┬────────┘
         │ Yes
         ▼
┌─────────────────┐
│ Event Extractor │ ──► Extract event details
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  NLP Date Parser│ ──► Parse dates/times
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│Conflict Detector│ ──► Check for conflicts
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  User Approval  │ ──► Show suggestion to user
└────────┬────────┘
         │ Approved
         ▼
┌─────────────────┐
│  Save to DB +   │
│  Sync External  │
└─────────────────┘
```

### Tech Stack

- **AI/ML**: Anthropic Claude API, OpenAI GPT-4
- **NLP**: Chrono-node (date parsing), natural library
- **Calendar APIs**: Google Calendar API, Microsoft Graph API
- **Database**: PostgreSQL (Supabase)
- **Backend**: Next.js API routes
- **Frontend**: React, shadcn/ui components
- **Real-time**: Supabase real-time subscriptions

---

## Database Schema

### 1. Calendar Events Table

```sql
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Event details
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  event_type TEXT, -- meeting, appointment, reminder, deadline, etc.

  -- Timing
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  timezone TEXT DEFAULT 'UTC',
  is_all_day BOOLEAN DEFAULT FALSE,

  -- Recurrence
  recurrence_rule TEXT, -- RRULE format
  recurrence_end_date TIMESTAMP WITH TIME ZONE,
  parent_event_id UUID REFERENCES calendar_events(id) ON DELETE CASCADE,

  -- Source tracking
  source_email_id TEXT, -- Nylas message ID
  source_type TEXT DEFAULT 'email', -- email, manual, imported, synced
  extracted_by_ai BOOLEAN DEFAULT FALSE,
  confidence_score DECIMAL(3,2), -- 0.00 to 1.00

  -- Attendees
  attendees JSONB, -- [{ email, name, status, response }]
  organizer JSONB, -- { email, name }

  -- Sync status
  synced_to_google BOOLEAN DEFAULT FALSE,
  google_event_id TEXT,
  synced_to_outlook BOOLEAN DEFAULT FALSE,
  outlook_event_id TEXT,
  last_synced_at TIMESTAMP WITH TIME ZONE,

  -- Status
  status TEXT DEFAULT 'confirmed', -- tentative, confirmed, cancelled
  visibility TEXT DEFAULT 'default', -- public, private, default

  -- Reminders
  reminders JSONB, -- [{ method: 'email'|'popup', minutes: 30 }]

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_calendar_events_user_id ON calendar_events(user_id);
CREATE INDEX idx_calendar_events_start_time ON calendar_events(start_time);
CREATE INDEX idx_calendar_events_end_time ON calendar_events(end_time);
CREATE INDEX idx_calendar_events_source_email_id ON calendar_events(source_email_id);
CREATE INDEX idx_calendar_events_deleted_at ON calendar_events(deleted_at);

-- RLS Policies
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own events"
  ON calendar_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own events"
  ON calendar_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own events"
  ON calendar_events FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own events"
  ON calendar_events FOR DELETE
  USING (auth.uid() = user_id);
```

### 2. Event Suggestions Table

```sql
CREATE TABLE event_suggestions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Suggested event data
  suggested_event JSONB NOT NULL, -- Full event object
  source_email_id TEXT NOT NULL,

  -- AI extraction data
  confidence_score DECIMAL(3,2) NOT NULL,
  extraction_model TEXT, -- claude-3.5, gpt-4, etc.
  raw_extraction JSONB, -- Original AI response

  -- User action
  status TEXT DEFAULT 'pending', -- pending, accepted, rejected, expired
  accepted_at TIMESTAMP WITH TIME ZONE,
  rejected_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,

  -- Calendar event reference (if accepted)
  calendar_event_id UUID REFERENCES calendar_events(id) ON DELETE SET NULL,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '7 days'
);

-- Indexes
CREATE INDEX idx_event_suggestions_user_id ON event_suggestions(user_id);
CREATE INDEX idx_event_suggestions_status ON event_suggestions(status);
CREATE INDEX idx_event_suggestions_source_email_id ON event_suggestions(source_email_id);

-- RLS Policies
ALTER TABLE event_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own suggestions"
  ON event_suggestions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own suggestions"
  ON event_suggestions FOR UPDATE
  USING (auth.uid() = user_id);
```

### 3. Calendar Integrations Table

```sql
CREATE TABLE calendar_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Integration type
  provider TEXT NOT NULL, -- google, outlook, apple
  provider_calendar_id TEXT NOT NULL, -- External calendar ID
  calendar_name TEXT,

  -- Authentication
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,

  -- Sync settings
  sync_enabled BOOLEAN DEFAULT TRUE,
  sync_direction TEXT DEFAULT 'bidirectional', -- inbound, outbound, bidirectional
  last_sync_at TIMESTAMP WITH TIME ZONE,
  sync_status TEXT DEFAULT 'active', -- active, error, paused
  sync_errors JSONB,

  -- Preferences
  is_primary BOOLEAN DEFAULT FALSE,
  color TEXT,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, provider, provider_calendar_id)
);

-- Indexes
CREATE INDEX idx_calendar_integrations_user_id ON calendar_integrations(user_id);
CREATE INDEX idx_calendar_integrations_sync_enabled ON calendar_integrations(sync_enabled);

-- RLS Policies
ALTER TABLE calendar_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own integrations"
  ON calendar_integrations FOR ALL
  USING (auth.uid() = user_id);
```

### 4. Availability Preferences Table

```sql
CREATE TABLE availability_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Working hours
  working_hours JSONB, -- { monday: { start: '09:00', end: '17:00', enabled: true }, ... }
  timezone TEXT DEFAULT 'UTC',

  -- Meeting preferences
  default_meeting_duration INTEGER DEFAULT 30, -- minutes
  buffer_time_before INTEGER DEFAULT 0, -- minutes
  buffer_time_after INTEGER DEFAULT 0, -- minutes
  max_meetings_per_day INTEGER,

  -- Availability windows
  lunch_break JSONB, -- { start: '12:00', end: '13:00', enabled: true }
  focus_time JSONB[], -- [{ start: '14:00', end: '16:00', days: ['Monday', 'Wednesday'] }]

  -- Smart scheduling preferences
  prefer_morning BOOLEAN DEFAULT FALSE,
  prefer_afternoon BOOLEAN DEFAULT FALSE,
  avoid_back_to_back BOOLEAN DEFAULT TRUE,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id)
);

-- RLS Policies
ALTER TABLE availability_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own preferences"
  ON availability_preferences FOR ALL
  USING (auth.uid() = user_id);
```

---

## AI Components

### 1. Event Detection Classifier

**Purpose**: Determine if an email contains event information

**Implementation**:

```typescript
// lib/ai/event-classifier.ts
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function classifyEventEmail(
  subject: string,
  body: string
): Promise<{ isEvent: boolean; confidence: number; reasoning: string }> {
  const prompt = `Analyze this email and determine if it contains information about an event, meeting, appointment, or deadline that should be added to a calendar.

Subject: ${subject}
Body: ${body}

Respond with JSON only:
{
  "isEvent": true/false,
  "confidence": 0.0-1.0,
  "reasoning": "brief explanation"
}`;

  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 500,
    messages: [{ role: 'user', content: prompt }],
  });

  const response = JSON.parse(message.content[0].text);
  return response;
}
```

### 2. Event Details Extractor

**Purpose**: Extract structured event data from email

**Implementation**:

```typescript
// lib/ai/event-extractor.ts
export interface ExtractedEvent {
  title: string;
  description?: string;
  location?: string;
  eventType: 'meeting' | 'appointment' | 'deadline' | 'reminder' | 'other';
  dateTimeText: string; // Raw text like "next Tuesday at 2pm"
  duration?: number; // minutes
  attendees?: Array<{ email: string; name?: string }>;
  organizer?: { email: string; name?: string };
  confidence: number;
}

export async function extractEventDetails(
  subject: string,
  body: string,
  senderEmail: string,
  senderName?: string
): Promise<ExtractedEvent> {
  const prompt = `Extract event details from this email. Focus on:
- Event title (what is the event about?)
- Date and time (extract EXACT phrases like "next Tuesday at 2pm")
- Location (physical or virtual, meeting links)
- Duration or end time
- Attendees (email addresses mentioned)
- Event type (meeting, appointment, deadline, etc.)

Email:
From: ${senderName || senderEmail}
Subject: ${subject}
Body: ${body}

Respond with JSON:
{
  "title": "event title",
  "description": "additional details",
  "location": "location or meeting link",
  "eventType": "meeting|appointment|deadline|reminder|other",
  "dateTimeText": "EXACT text about date/time from email",
  "duration": number in minutes (or null),
  "attendees": [{"email": "...", "name": "..."}],
  "organizer": {"email": "...", "name": "..."},
  "confidence": 0.0-1.0
}`;

  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1000,
    messages: [{ role: 'user', content: prompt }],
  });

  return JSON.parse(message.content[0].text);
}
```

### 3. Natural Language Date Parser

**Purpose**: Convert natural language to specific dates/times

**Implementation**:

```typescript
// lib/ai/date-parser.ts
import * as chrono from 'chrono-node';

export interface ParsedDateTime {
  start: Date;
  end?: Date;
  isAllDay: boolean;
  timezone: string;
  confidence: number;
  alternativeInterpretations?: Array<{ start: Date; end?: Date }>;
}

export function parseNaturalLanguageDate(
  dateText: string,
  referenceDate: Date = new Date(),
  userTimezone: string = 'UTC'
): ParsedDateTime {
  // Use chrono-node for initial parsing
  const parsed = chrono.parse(dateText, referenceDate, {
    forwardDate: true, // Prefer future dates
  });

  if (!parsed || parsed.length === 0) {
    throw new Error('Unable to parse date');
  }

  const result = parsed[0];
  const start = result.start.date();
  const end = result.end?.date();

  // Determine if all-day event
  const isAllDay = !result.start.isCertain('hour') && !result.start.isCertain('minute');

  // Calculate confidence based on certainty
  let confidence = 0.5;
  if (result.start.isCertain('year')) confidence += 0.1;
  if (result.start.isCertain('month')) confidence += 0.1;
  if (result.start.isCertain('day')) confidence += 0.15;
  if (result.start.isCertain('hour')) confidence += 0.1;
  if (result.start.isCertain('minute')) confidence += 0.05;

  return {
    start,
    end,
    isAllDay,
    timezone: userTimezone,
    confidence: Math.min(confidence, 1.0),
    alternativeInterpretations: parsed.slice(1, 3).map(p => ({
      start: p.start.date(),
      end: p.end?.date(),
    })),
  };
}
```

### 4. Smart Scheduling Algorithm

**Purpose**: Suggest optimal meeting times

**Implementation**:

```typescript
// lib/ai/smart-scheduler.ts
export interface SchedulingSuggestion {
  suggestedTimes: Array<{
    start: Date;
    end: Date;
    score: number;
    reasoning: string;
  }>;
  conflicts: Array<{
    eventId: string;
    title: string;
    time: Date;
  }>;
}

export async function suggestMeetingTimes(
  userId: string,
  duration: number, // minutes
  preferredDateRange: { start: Date; end: Date },
  attendeeEmails?: string[]
): Promise<SchedulingSuggestion> {
  // 1. Fetch user's existing events in date range
  const existingEvents = await fetchUserEvents(userId, preferredDateRange);

  // 2. Fetch user's availability preferences
  const preferences = await fetchAvailabilityPreferences(userId);

  // 3. Generate time slots based on working hours
  const availableSlots = generateAvailableSlots(
    preferredDateRange,
    duration,
    preferences.workingHours,
    existingEvents
  );

  // 4. Score each slot based on preferences
  const scoredSlots = scoreTimeSlots(availableSlots, preferences, existingEvents);

  // 5. If attendees provided, check their availability (via calendar integrations)
  if (attendeeEmails && attendeeEmails.length > 0) {
    const attendeeAvailability = await fetchAttendeeAvailability(
      attendeeEmails,
      preferredDateRange
    );
    scoredSlots = filterByAttendeeAvailability(scoredSlots, attendeeAvailability);
  }

  // 6. Return top 5 suggestions
  return {
    suggestedTimes: scoredSlots.slice(0, 5),
    conflicts: detectConflicts(scoredSlots[0], existingEvents),
  };
}
```

---

## API Endpoints

### 1. Event Extraction

**Endpoint**: `POST /api/calendar/extract`

**Purpose**: Extract event from email

**Request**:
```json
{
  "messageId": "nylas_message_id",
  "subject": "Meeting Tomorrow",
  "body": "Let's meet tomorrow at 2pm...",
  "senderEmail": "john@example.com",
  "senderName": "John Doe"
}
```

**Response**:
```json
{
  "suggestion": {
    "id": "uuid",
    "event": {
      "title": "Meeting with John",
      "start": "2024-02-03T14:00:00Z",
      "end": "2024-02-03T15:00:00Z",
      "location": null,
      "attendees": ["john@example.com"]
    },
    "confidence": 0.85,
    "conflicts": []
  }
}
```

### 2. Create Event

**Endpoint**: `POST /api/calendar/events`

**Request**:
```json
{
  "title": "Team Meeting",
  "description": "Weekly sync",
  "startTime": "2024-02-05T10:00:00Z",
  "endTime": "2024-02-05T11:00:00Z",
  "location": "Zoom",
  "attendees": ["user@example.com"],
  "reminders": [
    { "method": "email", "minutes": 30 }
  ],
  "syncToGoogle": true,
  "syncToOutlook": false
}
```

**Response**:
```json
{
  "event": {
    "id": "uuid",
    "title": "Team Meeting",
    "startTime": "2024-02-05T10:00:00Z",
    "googleEventId": "google_event_id",
    "synced": true
  }
}
```

### 3. Get Events

**Endpoint**: `GET /api/calendar/events?start=2024-02-01&end=2024-02-29`

**Response**:
```json
{
  "events": [
    {
      "id": "uuid",
      "title": "Team Meeting",
      "startTime": "2024-02-05T10:00:00Z",
      "endTime": "2024-02-05T11:00:00Z",
      "attendees": [...],
      "source": "email",
      "extractedByAI": true
    }
  ],
  "total": 15
}
```

### 4. Smart Scheduling

**Endpoint**: `POST /api/calendar/suggest-times`

**Request**:
```json
{
  "duration": 60,
  "preferredDateRange": {
    "start": "2024-02-05T00:00:00Z",
    "end": "2024-02-09T23:59:59Z"
  },
  "attendees": ["colleague@example.com"]
}
```

**Response**:
```json
{
  "suggestions": [
    {
      "start": "2024-02-06T14:00:00Z",
      "end": "2024-02-06T15:00:00Z",
      "score": 0.95,
      "reasoning": "Afternoon slot with no conflicts, all attendees available"
    }
  ]
}
```

### 5. Calendar Sync

**Endpoint**: `POST /api/calendar/sync/google` (similar for `/outlook`)

**Request**:
```json
{
  "authCode": "google_auth_code"
}
```

**Response**:
```json
{
  "integration": {
    "id": "uuid",
    "provider": "google",
    "calendarName": "Primary Calendar",
    "syncEnabled": true,
    "lastSyncAt": "2024-02-02T12:00:00Z"
  }
}
```

---

## Frontend Components

### 1. Calendar View

**File**: `app/(app)/app/calendar/page.tsx`

**Features**:
- Month, week, day views
- Event creation modal
- Drag-and-drop rescheduling
- Color-coded events by type
- Sync status indicators

**Component Structure**:
```tsx
<CalendarView>
  <CalendarHeader>
    <ViewSelector /> {/* Month/Week/Day */}
    <DateNavigator />
    <SyncStatus />
  </CalendarHeader>

  <CalendarGrid>
    <EventCard />
    <EventCard />
    <EventSuggestionBadge /> {/* AI-extracted events */}
  </CalendarGrid>

  <Sidebar>
    <MiniCalendar />
    <UpcomingEvents />
    <EventSuggestions /> {/* Pending AI suggestions */}
  </Sidebar>
</CalendarView>
```

### 2. Event Suggestion Card

**File**: `components/calendar/event-suggestion-card.tsx`

**Features**:
- Display extracted event details
- Confidence indicator
- Accept/Reject buttons
- Edit before accepting
- Show source email

```tsx
<EventSuggestionCard>
  <Badge>AI Detected</Badge>
  <ConfidenceMeter score={0.85} />

  <EventDetails>
    <Title>Meeting with John</Title>
    <DateTime>Tomorrow at 2:00 PM</DateTime>
    <Location>Zoom</Location>
  </EventDetails>

  <ConflictWarning />

  <Actions>
    <Button onClick={handleEdit}>Edit</Button>
    <Button onClick={handleAccept}>Add to Calendar</Button>
    <Button variant="ghost" onClick={handleReject}>Dismiss</Button>
  </Actions>

  <SourceLink>From: john@example.com</SourceLink>
</EventSuggestionCard>
```

### 3. Smart Scheduler Modal

**File**: `components/calendar/smart-scheduler-modal.tsx`

**Features**:
- Duration selector
- Date range picker
- Attendee input
- AI-suggested times
- Reasoning for each suggestion

```tsx
<SmartSchedulerModal>
  <Form>
    <Input label="Event Title" />
    <DurationPicker />
    <DateRangePicker />
    <AttendeeInput />
    <Button onClick={findTimes}>Find Best Times</Button>
  </Form>

  {suggestions && (
    <SuggestionsList>
      {suggestions.map(suggestion => (
        <SuggestionCard
          time={suggestion.start}
          score={suggestion.score}
          reasoning={suggestion.reasoning}
          onSelect={handleSelect}
        />
      ))}
    </SuggestionsList>
  )}
</SmartSchedulerModal>
```

### 4. Inbox Event Banner

**File**: `components/email/event-banner.tsx`

**Purpose**: Show event suggestion banner in email view

```tsx
<EventBanner>
  <Icon.Calendar />
  <Message>
    This email contains an event: <strong>{event.title}</strong> on {event.date}
  </Message>
  <Button size="sm" onClick={addToCalendar}>
    Add to Calendar
  </Button>
</EventBanner>
```

---

## Third-Party Integrations

### 1. Google Calendar API

**Setup**:
1. Create project in Google Cloud Console
2. Enable Google Calendar API
3. Create OAuth 2.0 credentials
4. Add redirect URI: `https://yourdomain.com/api/calendar/oauth/google/callback`

**Implementation**:
```typescript
// lib/integrations/google-calendar.ts
import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export async function syncEventToGoogle(
  accessToken: string,
  event: CalendarEvent
) {
  oauth2Client.setCredentials({ access_token: accessToken });

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  const googleEvent = {
    summary: event.title,
    description: event.description,
    location: event.location,
    start: {
      dateTime: event.startTime.toISOString(),
      timeZone: event.timezone,
    },
    end: {
      dateTime: event.endTime.toISOString(),
      timeZone: event.timezone,
    },
    attendees: event.attendees?.map(a => ({ email: a.email })),
  };

  const response = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: googleEvent,
  });

  return response.data.id;
}
```

### 2. Microsoft Graph API (Outlook)

**Setup**:
1. Register app in Azure Portal
2. Add Microsoft Graph permissions: `Calendars.ReadWrite`
3. Configure redirect URI

**Implementation**:
```typescript
// lib/integrations/outlook-calendar.ts
import { Client } from '@microsoft/microsoft-graph-client';

export async function syncEventToOutlook(
  accessToken: string,
  event: CalendarEvent
) {
  const client = Client.init({
    authProvider: (done) => {
      done(null, accessToken);
    },
  });

  const outlookEvent = {
    subject: event.title,
    body: {
      contentType: 'HTML',
      content: event.description,
    },
    start: {
      dateTime: event.startTime.toISOString(),
      timeZone: event.timezone,
    },
    end: {
      dateTime: event.endTime.toISOString(),
      timeZone: event.timezone,
    },
    location: {
      displayName: event.location,
    },
    attendees: event.attendees?.map(a => ({
      emailAddress: { address: a.email, name: a.name },
      type: 'required',
    })),
  };

  const response = await client.api('/me/events').post(outlookEvent);

  return response.id;
}
```

### 3. Anthropic Claude API

**Purpose**: AI event extraction and analysis

**Cost Estimation** (Claude 3.5 Sonnet):
- Input: $3 per million tokens
- Output: $15 per million tokens
- Average email: ~500 tokens input, 200 tokens output
- Cost per extraction: ~$0.004

**Monthly cost for 1000 users**:
- Assume 50 event extractions per user per month
- 1000 users × 50 extractions = 50,000 extractions
- 50,000 × $0.004 = $200/month

### 4. Chrono-node Library

**Purpose**: Natural language date parsing

**Installation**:
```bash
npm install chrono-node
```

**No API key required** - runs locally

---

## Implementation Phases

### Phase 1: Foundation (Week 1-2)

**Deliverables**:
- [ ] Database schema migration
- [ ] Basic calendar API endpoints (CRUD)
- [ ] Simple calendar view UI (month view)
- [ ] Event creation modal

**Testing**:
- Create/read/update/delete events manually
- Verify database constraints and RLS policies

---

### Phase 2: AI Event Extraction (Week 3-4)

**Deliverables**:
- [ ] Event classifier (detect if email has events)
- [ ] Event extractor (extract details from email)
- [ ] Date parser integration (natural language → dates)
- [ ] Event suggestion API endpoints
- [ ] Event suggestion UI in inbox

**Testing**:
- Test with various email formats
- Measure accuracy of extractions
- Test confidence scoring

**Success Metrics**:
- 80%+ accuracy on event detection
- 70%+ accuracy on date parsing
- <2 second extraction time

---

### Phase 3: Calendar Integrations (Week 5-6)

**Deliverables**:
- [ ] Google Calendar OAuth flow
- [ ] Google Calendar sync (bidirectional)
- [ ] Microsoft Outlook OAuth flow
- [ ] Outlook Calendar sync (bidirectional)
- [ ] Sync status UI
- [ ] Conflict resolution flow

**Testing**:
- Test OAuth flows end-to-end
- Test sync in both directions
- Test conflict scenarios
- Test token refresh

---

### Phase 4: Smart Scheduling (Week 7-8)

**Deliverables**:
- [ ] Availability preferences UI
- [ ] Working hours configuration
- [ ] Smart scheduler algorithm
- [ ] Time suggestion API
- [ ] Smart scheduler modal UI
- [ ] Conflict detection

**Testing**:
- Test scheduling with various preferences
- Test with multiple attendees
- Verify conflict detection accuracy

---

### Phase 5: Polish & Production (Week 9-10)

**Deliverables**:
- [ ] Week/day calendar views
- [ ] Drag-and-drop rescheduling
- [ ] Recurring events support
- [ ] Event reminders
- [ ] Calendar sharing (read-only links)
- [ ] Mobile responsive design
- [ ] Performance optimization
- [ ] Comprehensive testing

**Testing**:
- Load testing (1000+ events)
- Mobile device testing
- Accessibility testing
- Security audit

---

## Security Considerations

### 1. OAuth Token Storage

- Encrypt access/refresh tokens in database using `pgcrypto`
- Rotate tokens regularly
- Use secure token exchange (PKCE for OAuth)

```sql
-- Encrypt tokens before storage
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION encrypt_token(token TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN encode(
    pgp_sym_encrypt(token, current_setting('app.encryption_key')),
    'base64'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 2. Rate Limiting

```typescript
// Limit AI API calls per user
import { Ratelimit } from "@upstash/ratelimit";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 m"), // 10 AI calls per minute
});

const { success } = await ratelimit.limit(`calendar-ai-${userId}`);
if (!success) {
  throw new Error('Rate limit exceeded');
}
```

### 3. Data Privacy

- Never send full email content to AI without user consent
- Allow users to opt-out of AI features
- Provide data deletion for all calendar data
- GDPR compliance for EU users

### 4. Calendar Permissions

- Request minimal OAuth scopes
- Allow users to revoke calendar access
- Audit calendar sync actions

---

## Testing Strategy

### 1. Unit Tests

```typescript
// __tests__/lib/ai/date-parser.test.ts
describe('parseNaturalLanguageDate', () => {
  it('should parse "tomorrow at 2pm"', () => {
    const result = parseNaturalLanguageDate('tomorrow at 2pm');
    expect(result.start.getHours()).toBe(14);
  });

  it('should parse "next Tuesday"', () => {
    const result = parseNaturalLanguageDate('next Tuesday');
    const dayOfWeek = result.start.getDay();
    expect(dayOfWeek).toBe(2); // Tuesday
  });

  it('should handle ambiguous dates with low confidence', () => {
    const result = parseNaturalLanguageDate('sometime next week');
    expect(result.confidence).toBeLessThan(0.7);
  });
});
```

### 2. Integration Tests

```typescript
// __tests__/api/calendar/extract.test.ts
describe('POST /api/calendar/extract', () => {
  it('should extract event from meeting email', async () => {
    const response = await fetch('/api/calendar/extract', {
      method: 'POST',
      headers: { Authorization: `Bearer ${testToken}` },
      body: JSON.stringify({
        subject: 'Team Meeting Tomorrow',
        body: 'Let us meet tomorrow at 2pm in the conference room',
      }),
    });

    const data = await response.json();
    expect(data.suggestion.event.title).toContain('Team Meeting');
    expect(data.suggestion.confidence).toBeGreaterThan(0.7);
  });
});
```

### 3. E2E Tests

```typescript
// __tests__/e2e/calendar-flow.test.ts
describe('Calendar E2E Flow', () => {
  it('should extract event from email and add to calendar', async () => {
    // 1. User receives email with event
    await createTestEmail('Meeting tomorrow at 2pm');

    // 2. AI extracts event
    await page.goto('/app/inbox');
    await page.click('[data-testid="email-item"]');

    // 3. User sees suggestion banner
    await expect(page.locator('[data-testid="event-banner"]')).toBeVisible();

    // 4. User adds to calendar
    await page.click('[data-testid="add-to-calendar"]');

    // 5. Event appears in calendar
    await page.goto('/app/calendar');
    await expect(page.locator('text=Meeting')).toBeVisible();
  });
});
```

---

## Success Metrics

### Key Performance Indicators (KPIs)

1. **AI Accuracy**
   - Event detection accuracy: >85%
   - Date parsing accuracy: >80%
   - User acceptance rate: >70%

2. **User Engagement**
   - % of users who enable calendar: >40%
   - Events created per user per month: >10
   - AI-extracted events accepted: >60%

3. **Performance**
   - Event extraction time: <2 seconds
   - Calendar page load: <1 second
   - Sync latency: <5 seconds

4. **Reliability**
   - Calendar sync success rate: >99%
   - API uptime: >99.9%
   - Token refresh success: >99%

---

## Cost Estimation

### Monthly Costs (1000 active users)

| Service | Usage | Cost |
|---------|-------|------|
| Anthropic Claude API | 50k extractions | $200 |
| Google Calendar API | 100k requests | Free |
| Microsoft Graph API | 50k requests | Free |
| Supabase (database) | Standard plan | $25 |
| **Total** | | **$225/month** |

**Cost per user**: $0.23/month

---

## Future Enhancements

### Phase 6 (Post-Launch)

1. **AI Meeting Prep**
   - Summarize email thread before meeting
   - Extract action items and decisions
   - Generate meeting agendas

2. **Travel Time Integration**
   - Calculate travel time for in-person meetings
   - Integrate with Google Maps / Apple Maps
   - Automatic buffer time for travel

3. **Team Calendars**
   - Shared team availability
   - Group scheduling
   - Room booking integration

4. **Voice Assistant**
   - "Schedule a meeting with John next Tuesday"
   - Voice commands for calendar management

5. **Analytics Dashboard**
   - Meeting time analytics
   - Productivity insights
   - Calendar heatmaps

---

## Conclusion

This AI-powered calendar feature will transform EaseMail into a comprehensive productivity platform. The implementation is broken down into manageable phases, with clear success metrics and testing strategies.

**Estimated Timeline**: 10 weeks

**Team Requirements**:
- 1 Backend Developer
- 1 Frontend Developer
- 1 AI/ML Engineer (part-time for AI model tuning)

**Next Steps**:
1. Review and approve this plan
2. Set up third-party API accounts (Google, Microsoft, Anthropic)
3. Create database migrations
4. Begin Phase 1 implementation

---

## Appendix

### A. Example Email Patterns for AI Training

```
Pattern 1: Formal Meeting Invitation
Subject: Meeting Request: Q1 Planning
Body: I would like to schedule a meeting with you next Tuesday, February 6th at 2:00 PM to discuss Q1 planning. The meeting will be held in Conference Room A.

Pattern 2: Informal Meeting
Subject: Coffee chat?
Body: Hey! Want to grab coffee tomorrow around 10am? We can meet at the usual spot.

Pattern 3: Event with Multiple Dates
Subject: Workshop Series
Body: Join us for our workshop series on the following dates:
- February 5th at 1pm
- February 12th at 1pm
- February 19th at 1pm

Pattern 4: Deadline
Subject: Project Deadline Reminder
Body: Just a reminder that the project deliverables are due this Friday by 5pm.
```

### B. Cron Expression for Event Suggestions Cleanup

```sql
-- Run daily to clean up expired suggestions
DELETE FROM event_suggestions
WHERE expires_at < NOW() AND status = 'pending';
```

### C. Recommended Libraries

- `chrono-node`: Natural language date parsing
- `rrule`: Recurring event rules
- `date-fns`: Date manipulation
- `@googleapis/calendar`: Google Calendar API client
- `@microsoft/microsoft-graph-client`: Microsoft Graph client
- `@anthropic-ai/sdk`: Anthropic Claude API
- `react-big-calendar`: Calendar UI component
- `react-day-picker`: Date picker component

---

**Document Version**: 1.0
**Last Updated**: February 2, 2026
**Author**: EaseMail Development Team
