'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

// Validation schema for notification preferences
const notificationSchema = z.object({
  // Email notifications
  newEmails: z.boolean(),
  importantOnly: z.boolean(),
  dailyDigest: z.boolean(),
  // Calendar notifications
  eventReminders: z.boolean(),
  eventChanges: z.boolean(),
  // Device notifications
  desktopNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  notificationSound: z.boolean(),
  // Team notifications
  teamInvites: z.boolean(),
  teamUpdates: z.boolean(),
  // Quiet hours
  quietHours: z.boolean(),
});

type NotificationFormData = z.infer<typeof notificationSchema>;

export default function NotificationsSettingsPage() {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
    reset,
  } = useForm<NotificationFormData>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      newEmails: true,
      importantOnly: false,
      dailyDigest: true,
      eventReminders: true,
      eventChanges: true,
      desktopNotifications: true,
      pushNotifications: true,
      notificationSound: true,
      teamInvites: true,
      teamUpdates: true,
      quietHours: false,
    },
  });

  useEffect(() => {
    // Fetch user's notification preferences
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/user/preferences');
      const data = await response.json();

      if (data.preferences?.notifications) {
        reset(data.preferences.notifications);
      }
    } catch (error) {
      console.error('Failed to fetch preferences:', error);
    }
  };

  const onSubmit = async (data: NotificationFormData) => {
    try {
      const response = await fetch('/api/user/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notifications: data }),
      });

      if (response.ok) {
        toast.success('Notification preferences saved');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to save preferences');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save preferences');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
          <CardDescription>Choose what email notifications you receive</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="new-emails">New Emails</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when you receive new emails
              </p>
            </div>
            <Controller
              name="newEmails"
              control={control}
              render={({ field }) => (
                <Switch
                  id="new-emails"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="important-only">Important Emails Only</Label>
              <p className="text-sm text-muted-foreground">
                Only notify for emails marked as important
              </p>
            </div>
            <Controller
              name="importantOnly"
              control={control}
              render={({ field }) => (
                <Switch
                  id="important-only"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="digest">Daily Digest</Label>
              <p className="text-sm text-muted-foreground">
                Receive a daily summary of your emails
              </p>
            </div>
            <Controller
              name="dailyDigest"
              control={control}
              render={({ field }) => (
                <Switch
                  id="digest"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Calendar Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Calendar Notifications</CardTitle>
          <CardDescription>Manage calendar and event reminders</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="event-reminders">Event Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Get notified before events start
              </p>
            </div>
            <Controller
              name="eventReminders"
              control={control}
              render={({ field }) => (
                <Switch
                  id="event-reminders"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="event-changes">Event Changes</Label>
              <p className="text-sm text-muted-foreground">
                Notify when events are updated or cancelled
              </p>
            </div>
            <Controller
              name="eventChanges"
              control={control}
              render={({ field }) => (
                <Switch
                  id="event-changes"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="reminder-time">Reminder Time</Label>
              <p className="text-sm text-muted-foreground">
                How long before events to send reminders
              </p>
            </div>
            <Button variant="outline" size="sm">
              15 minutes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Desktop & Mobile */}
      <Card>
        <CardHeader>
          <CardTitle>Device Notifications</CardTitle>
          <CardDescription>Control how notifications appear on your devices</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="desktop-notifications">Desktop Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Show notifications on your desktop
              </p>
            </div>
            <Controller
              name="desktopNotifications"
              control={control}
              render={({ field }) => (
                <Switch
                  id="desktop-notifications"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push-notifications">Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive push notifications on mobile devices
              </p>
            </div>
            <Controller
              name="pushNotifications"
              control={control}
              render={({ field }) => (
                <Switch
                  id="push-notifications"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notification-sound">Notification Sound</Label>
              <p className="text-sm text-muted-foreground">Play sound for notifications</p>
            </div>
            <Controller
              name="notificationSound"
              control={control}
              render={({ field }) => (
                <Switch
                  id="notification-sound"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Team & Organization */}
      <Card>
        <CardHeader>
          <CardTitle>Team & Organization</CardTitle>
          <CardDescription>Notifications for team activities</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="team-invites">Team Invitations</Label>
              <p className="text-sm text-muted-foreground">
                Notify when you're invited to a team
              </p>
            </div>
            <Controller
              name="teamInvites"
              control={control}
              render={({ field }) => (
                <Switch
                  id="team-invites"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="team-updates">Team Updates</Label>
              <p className="text-sm text-muted-foreground">
                Updates about your organization
              </p>
            </div>
            <Controller
              name="teamUpdates"
              control={control}
              render={({ field }) => (
                <Switch
                  id="team-updates"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card>
        <CardHeader>
          <CardTitle>Quiet Hours</CardTitle>
          <CardDescription>Mute notifications during specific times</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="quiet-hours">Enable Quiet Hours</Label>
              <p className="text-sm text-muted-foreground">
                Silence notifications during set hours
              </p>
            </div>
            <Controller
              name="quietHours"
              control={control}
              render={({ field }) => (
                <Switch
                  id="quiet-hours"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Quiet Hours Schedule</Label>
              <p className="text-sm text-muted-foreground">When to mute notifications</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                10:00 PM
              </Button>
              <span className="text-muted-foreground">to</span>
              <Button variant="outline" size="sm">
                7:00 AM
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Preferences'
          )}
        </Button>
      </div>
    </form>
  );
}
