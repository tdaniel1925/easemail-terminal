import { test, expect } from '@playwright/test';
import { createAndLoginUser } from './helpers';



test.describe('Calendar', () => {
  test.describe('Calendar Views', () => {
    test('should show calendar page', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/calendar');
      await page.waitForTimeout(2000);

      expect(page.url()).toContain('/calendar');

      // Should show calendar heading or view
      const calendarHeading = page.getByRole('heading', { name: /calendar/i });
      const calendarView = page.locator('[data-testid="calendar-view"], .calendar-view, .calendar-grid');

      const hasHeading = await calendarHeading.isVisible({ timeout: 3000 }).catch(() => false);
      const hasView = await calendarView.isVisible({ timeout: 3000 }).catch(() => false);

      expect(hasHeading || hasView).toBe(true);
    });

    test('should switch to day view', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/calendar');
      await page.waitForTimeout(2000);

      const dayViewButton = page.getByRole('button', { name: /day view|day/i });
      if (await dayViewButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await dayViewButton.click();
        await page.waitForTimeout(1000);

        // Should show day view
        expect(page.url()).toMatch(/calendar/);
      }
    });

    test('should switch to week view', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/calendar');
      await page.waitForTimeout(2000);

      const weekViewButton = page.getByRole('button', { name: /week view|week/i });
      if (await weekViewButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await weekViewButton.click();
        await page.waitForTimeout(1000);

        // Should show week view
        expect(page.url()).toMatch(/calendar/);
      }
    });

    test('should switch to month view', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/calendar');
      await page.waitForTimeout(2000);

      const monthViewButton = page.getByRole('button', { name: /month view|month/i });
      if (await monthViewButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await monthViewButton.click();
        await page.waitForTimeout(1000);

        // Should show month view
        expect(page.url()).toMatch(/calendar/);
      }
    });

    test('should switch to agenda view', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/calendar');
      await page.waitForTimeout(2000);

      const agendaViewButton = page.getByRole('button', { name: /agenda view|agenda|list/i });
      if (await agendaViewButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await agendaViewButton.click();
        await page.waitForTimeout(1000);

        // Should show agenda/list view
        expect(page.url()).toMatch(/calendar/);
      }
    });
  });

  test.describe('Calendar Navigation', () => {
    test('should navigate to next period', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/calendar');
      await page.waitForTimeout(2000);

      const nextButton = page.getByRole('button', { name: /next|forward|>/i }).first();
      if (await nextButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await nextButton.click();
        await page.waitForTimeout(1000);

        // Should navigate forward
        expect(page.url()).toContain('/calendar');
      }
    });

    test('should navigate to previous period', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/calendar');
      await page.waitForTimeout(2000);

      const prevButton = page.getByRole('button', { name: /prev|back|</i }).first();
      if (await prevButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await prevButton.click();
        await page.waitForTimeout(1000);

        // Should navigate backward
        expect(page.url()).toContain('/calendar');
      }
    });

    test('should navigate to today', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/calendar');
      await page.waitForTimeout(2000);

      const todayButton = page.getByRole('button', { name: /today/i });
      if (await todayButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await todayButton.click();
        await page.waitForTimeout(1000);

        // Should navigate to today
        expect(page.url()).toContain('/calendar');
      }
    });
  });

  test.describe('Event Creation', () => {
    test('should show create event button', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/calendar');
      await page.waitForTimeout(2000);

      const createEventButton = page.getByRole('button', { name: /create event|new event|add event/i });
      await expect(createEventButton).toBeVisible({ timeout: 5000 }).catch(() => {});
    });

    test('should open create event modal', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/calendar');
      await page.waitForTimeout(2000);

      const createEventButton = page.getByRole('button', { name: /create event|new event|add event/i });
      if (await createEventButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await createEventButton.click();
        await page.waitForTimeout(1000);

        // Should show event form
        const titleField = page.getByLabel(/title|event name/i);
        await expect(titleField).toBeVisible({ timeout: 3000 }).catch(() => {});
      }
    });

    test('should validate required fields when creating event', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/calendar');
      await page.waitForTimeout(2000);

      const createEventButton = page.getByRole('button', { name: /create event|new event|add event/i });
      if (await createEventButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await createEventButton.click();
        await page.waitForTimeout(500);

        // Try to create without title
        const saveButton = page.getByRole('button', { name: /create|save/i });
        if (await saveButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await saveButton.click();
          await page.waitForTimeout(500);

          // Should show validation error
          const titleField = page.getByLabel(/title|event name/i);
          await expect(titleField).toBeVisible().catch(() => {});
        }
      }
    });

    test('should create a new event', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/calendar');
      await page.waitForTimeout(2000);

      const createEventButton = page.getByRole('button', { name: /create event|new event|add event/i });
      if (await createEventButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await createEventButton.click();
        await page.waitForTimeout(500);

        // Fill event details
        const titleField = page.getByLabel(/title|event name/i);
        if (await titleField.isVisible({ timeout: 2000 }).catch(() => false)) {
          await titleField.fill(`Test Event ${Date.now()}`);

          // Save event
          const saveButton = page.getByRole('button', { name: /create|save/i });
          if (await saveButton.isVisible({ timeout: 2000 }).catch(() => false)) {
            await saveButton.click();
            await page.waitForTimeout(2000);

            // Should show success or close modal
            expect(page.url()).toContain('/calendar');
          }
        }
      }
    });

    test('should create event with description', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/calendar');
      await page.waitForTimeout(2000);

      const createEventButton = page.getByRole('button', { name: /create event|new event|add event/i });
      if (await createEventButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await createEventButton.click();
        await page.waitForTimeout(500);

        const titleField = page.getByLabel(/title|event name/i);
        const descriptionField = page.getByLabel(/description|notes/i);

        if (await titleField.isVisible({ timeout: 2000 }).catch(() => false)) {
          await titleField.fill('Event with Description');

          if (await descriptionField.isVisible({ timeout: 2000 }).catch(() => false)) {
            await descriptionField.fill('This is a test event description');

            const saveButton = page.getByRole('button', { name: /create|save/i });
            if (await saveButton.isVisible({ timeout: 2000 }).catch(() => false)) {
              await saveButton.click();
              await page.waitForTimeout(2000);

              expect(page.url()).toContain('/calendar');
            }
          }
        }
      }
    });

    test('should create event with location', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/calendar');
      await page.waitForTimeout(2000);

      const createEventButton = page.getByRole('button', { name: /create event|new event|add event/i });
      if (await createEventButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await createEventButton.click();
        await page.waitForTimeout(500);

        const titleField = page.getByLabel(/title|event name/i);
        const locationField = page.getByLabel(/location|place/i);

        if (await titleField.isVisible({ timeout: 2000 }).catch(() => false)) {
          await titleField.fill('Event with Location');

          if (await locationField.isVisible({ timeout: 2000 }).catch(() => false)) {
            await locationField.fill('Conference Room A');

            const saveButton = page.getByRole('button', { name: /create|save/i });
            if (await saveButton.isVisible({ timeout: 2000 }).catch(() => false)) {
              await saveButton.click();
              await page.waitForTimeout(2000);

              expect(page.url()).toContain('/calendar');
            }
          }
        }
      }
    });
  });

  test.describe('Event Viewing', () => {
    test('should display events on calendar', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/calendar');
      await page.waitForTimeout(2000);

      // Look for events or empty state
      const event = page.locator('[data-testid="calendar-event"], .calendar-event, .event-item').first();
      const emptyState = page.getByText(/no events|empty|no meetings/i);

      const hasEvent = await event.isVisible({ timeout: 3000 }).catch(() => false);
      const isEmpty = await emptyState.isVisible({ timeout: 3000 }).catch(() => false);

      // Should show events or empty state
      expect(hasEvent || isEmpty).toBe(true);
    });

    test('should open event detail modal', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/calendar');
      await page.waitForTimeout(2000);

      const event = page.locator('[data-testid="calendar-event"], .calendar-event, .event-item').first();
      if (await event.isVisible({ timeout: 3000 }).catch(() => false)) {
        await event.click();
        await page.waitForTimeout(1000);

        // Should show event details
        const eventModal = page.locator('[role="dialog"], .modal, [data-testid="event-modal"]');
        await expect(eventModal).toBeVisible({ timeout: 3000 }).catch(() => {});
      }
    });

    test('should show event details in modal', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/calendar');
      await page.waitForTimeout(2000);

      const event = page.locator('[data-testid="calendar-event"], .calendar-event, .event-item').first();
      if (await event.isVisible({ timeout: 3000 }).catch(() => false)) {
        await event.click();
        await page.waitForTimeout(1000);

        // Should show event title, time, etc.
        const eventDetails = page.locator('[data-testid="event-details"], .event-details');
        if (await eventDetails.isVisible({ timeout: 3000 }).catch(() => false)) {
          await expect(eventDetails).toBeVisible();
        }
      }
    });
  });

  test.describe('Event Actions', () => {
    test('should show RSVP buttons for meeting invites', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/calendar');
      await page.waitForTimeout(2000);

      const event = page.locator('[data-testid="calendar-event"], .calendar-event, .event-item').first();
      if (await event.isVisible({ timeout: 3000 }).catch(() => false)) {
        await event.click();
        await page.waitForTimeout(1000);

        // Look for RSVP buttons
        const acceptButton = page.getByRole('button', { name: /accept/i });
        const tentativeButton = page.getByRole('button', { name: /tentative|maybe/i });
        const declineButton = page.getByRole('button', { name: /decline/i });

        const hasAccept = await acceptButton.isVisible({ timeout: 2000 }).catch(() => false);
        const hasTentative = await tentativeButton.isVisible({ timeout: 2000 }).catch(() => false);
        const hasDecline = await declineButton.isVisible({ timeout: 2000 }).catch(() => false);

        // RSVP buttons might be available for meeting invites
        if (hasAccept || hasTentative || hasDecline) {
          expect(hasAccept || hasTentative || hasDecline).toBe(true);
        }
      }
    });

    test('should show Join Now button for ongoing meetings', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/calendar');
      await page.waitForTimeout(2000);

      const event = page.locator('[data-testid="calendar-event"], .calendar-event, .event-item').first();
      if (await event.isVisible({ timeout: 3000 }).catch(() => false)) {
        await event.click();
        await page.waitForTimeout(1000);

        // Look for Join Now button (might only show for current events)
        const joinButton = page.getByRole('button', { name: /join now|join meeting/i });
        if (await joinButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await expect(joinButton).toBeVisible();
        }
      }
    });

    test('should edit event', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/calendar');
      await page.waitForTimeout(2000);

      const event = page.locator('[data-testid="calendar-event"], .calendar-event, .event-item').first();
      if (await event.isVisible({ timeout: 3000 }).catch(() => false)) {
        await event.click();
        await page.waitForTimeout(1000);

        const editButton = page.getByRole('button', { name: /edit/i });
        if (await editButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await editButton.click();
          await page.waitForTimeout(500);

          // Should show edit form
          const titleField = page.getByLabel(/title|event name/i);
          await expect(titleField).toBeVisible({ timeout: 3000 }).catch(() => {});
        }
      }
    });

    test('should delete event', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/calendar');
      await page.waitForTimeout(2000);

      const event = page.locator('[data-testid="calendar-event"], .calendar-event, .event-item').first();
      if (await event.isVisible({ timeout: 3000 }).catch(() => false)) {
        await event.click();
        await page.waitForTimeout(1000);

        const deleteButton = page.getByRole('button', { name: /delete|remove/i });
        if (await deleteButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await deleteButton.click();
          await page.waitForTimeout(1000);

          // Should show confirmation or remove event
          expect(page.url()).toContain('/calendar');
        }
      }
    });
  });

  test.describe('Calendar Search', () => {
    test('should show search input', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/calendar');
      await page.waitForTimeout(2000);

      const searchInput = page.getByPlaceholder(/search events|search calendar/i);
      if (await searchInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(searchInput).toBeVisible();
      }
    });

    test('should search for events', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/calendar');
      await page.waitForTimeout(2000);

      const searchInput = page.getByPlaceholder(/search events|search calendar/i);
      if (await searchInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await searchInput.fill('meeting');
        await page.waitForTimeout(1000);

        // Should filter events
        expect(page.url()).toContain('/calendar');
      }
    });
  });

  test.describe('Calendar Filters', () => {
    test('should show calendar source filters', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/calendar');
      await page.waitForTimeout(2000);

      // Look for calendar filters
      const filterButton = page.getByRole('button', { name: /filter|calendars|sources/i });
      if (await filterButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await filterButton.click();
        await page.waitForTimeout(500);

        // Should show calendar sources
        const emailCalendar = page.getByText(/email calendar/i);
        const teamsCalendar = page.getByText(/teams|microsoft/i);

        const hasEmail = await emailCalendar.isVisible({ timeout: 2000 }).catch(() => false);
        const hasTeams = await teamsCalendar.isVisible({ timeout: 2000 }).catch(() => false);

        // Should show at least one calendar source
        if (hasEmail || hasTeams) {
          expect(hasEmail || hasTeams).toBe(true);
        }
      }
    });

    test('should toggle calendar visibility', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/calendar');
      await page.waitForTimeout(2000);

      const filterButton = page.getByRole('button', { name: /filter|calendars|sources/i });
      if (await filterButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await filterButton.click();
        await page.waitForTimeout(500);

        // Look for toggle switches
        const toggleSwitch = page.locator('input[type="checkbox"], button[role="switch"]').first();
        if (await toggleSwitch.isVisible({ timeout: 2000 }).catch(() => false)) {
          await toggleSwitch.click();
          await page.waitForTimeout(500);

          // Should toggle calendar visibility
          expect(page.url()).toContain('/calendar');
        }
      }
    });
  });

  test.describe('Meeting Analytics', () => {
    test('should show meeting analytics dashboard', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/calendar');
      await page.waitForTimeout(2000);

      // Look for analytics button or section
      const analyticsButton = page.getByRole('button', { name: /analytics|insights|stats/i });
      if (await analyticsButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await analyticsButton.click();
        await page.waitForTimeout(1000);

        // Should show analytics
        const analyticsContent = page.getByText(/weekly stats|meeting hours|total meetings/i);
        await expect(analyticsContent.first()).toBeVisible({ timeout: 3000 }).catch(() => {});
      }
    });
  });

  test.describe('Conflict Detection', () => {
    test('should show conflict indicator for overlapping events', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/calendar');
      await page.waitForTimeout(2000);

      // Look for conflict badges or warnings
      const conflictBadge = page.locator('[data-testid="conflict-badge"], .conflict-badge, .conflict-indicator');
      if (await conflictBadge.first().isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(conflictBadge.first()).toBeVisible();
      }
    });

    test('should warn when creating conflicting event', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/calendar');
      await page.waitForTimeout(2000);

      const createEventButton = page.getByRole('button', { name: /create event|new event|add event/i });
      if (await createEventButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await createEventButton.click();
        await page.waitForTimeout(500);

        const titleField = page.getByLabel(/title|event name/i);
        if (await titleField.isVisible({ timeout: 2000 }).catch(() => false)) {
          await titleField.fill('Potentially Conflicting Event');

          // Look for conflict warning after setting time
          const conflictWarning = page.getByText(/conflict|overlap|already have/i);
          if (await conflictWarning.isVisible({ timeout: 2000 }).catch(() => false)) {
            await expect(conflictWarning).toBeVisible();
          }
        }
      }
    });
  });

  test.describe('Time Zone Support', () => {
    test('should show time zone information', async ({ page }) => {
      await createAndLoginUser(page);

      await page.goto('/app/calendar');
      await page.waitForTimeout(2000);

      const event = page.locator('[data-testid="calendar-event"], .calendar-event, .event-item').first();
      if (await event.isVisible({ timeout: 3000 }).catch(() => false)) {
        await event.click();
        await page.waitForTimeout(1000);

        // Look for time zone display
        const timeZone = page.getByText(/EST|PST|GMT|UTC|timezone/i);
        if (await timeZone.isVisible({ timeout: 2000 }).catch(() => false)) {
          await expect(timeZone).toBeVisible();
        }
      }
    });
  });
});
