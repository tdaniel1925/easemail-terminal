'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

export default function NotificationsSettingsPage() {
  const handleSave = () => {
    toast.success('Notification preferences saved');
  };

  return (
    <div className="space-y-6">
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
            <Switch id="new-emails" defaultChecked />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="important-only">Important Emails Only</Label>
              <p className="text-sm text-muted-foreground">
                Only notify for emails marked as important
              </p>
            </div>
            <Switch id="important-only" />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="digest">Daily Digest</Label>
              <p className="text-sm text-muted-foreground">
                Receive a daily summary of your emails
              </p>
            </div>
            <Switch id="digest" defaultChecked />
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
            <Switch id="event-reminders" defaultChecked />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="event-changes">Event Changes</Label>
              <p className="text-sm text-muted-foreground">
                Notify when events are updated or cancelled
              </p>
            </div>
            <Switch id="event-changes" defaultChecked />
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
            <Switch id="desktop-notifications" defaultChecked />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push-notifications">Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive push notifications on mobile devices
              </p>
            </div>
            <Switch id="push-notifications" defaultChecked />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notification-sound">Notification Sound</Label>
              <p className="text-sm text-muted-foreground">Play sound for notifications</p>
            </div>
            <Switch id="notification-sound" defaultChecked />
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
            <Switch id="team-invites" defaultChecked />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="team-updates">Team Updates</Label>
              <p className="text-sm text-muted-foreground">
                Updates about your organization
              </p>
            </div>
            <Switch id="team-updates" defaultChecked />
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
            <Switch id="quiet-hours" />
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
        <Button onClick={handleSave}>Save Preferences</Button>
      </div>
    </div>
  );
}
