'use client';

import { useTheme } from 'next-themes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Sun, Moon, Monitor, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const themes = [
  {
    name: 'Light',
    value: 'light',
    icon: Sun,
    description: 'Clean and bright interface',
  },
  {
    name: 'Dark',
    value: 'dark',
    icon: Moon,
    description: 'Easy on the eyes in low light',
  },
  {
    name: 'OLED',
    value: 'oled',
    icon: Smartphone,
    description: 'Pure black for OLED screens',
  },
  {
    name: 'System',
    value: 'system',
    icon: Monitor,
    description: 'Match your system preference',
  },
];

export default function AppearanceSettingsPage() {
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    toast.success(`Theme changed to ${newTheme}`);
  };

  return (
    <div className="space-y-6">
      {/* Theme Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Theme</CardTitle>
          <CardDescription>Choose how EaseMail looks on your device</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {themes.map((t) => {
              const Icon = t.icon;
              const isActive = theme === t.value;

              return (
                <button
                  key={t.value}
                  onClick={() => handleThemeChange(t.value)}
                  className={cn(
                    'flex flex-col items-center gap-3 p-6 rounded-lg border-2 transition-all',
                    isActive
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  )}
                >
                  <div
                    className={cn(
                      'p-3 rounded-full',
                      isActive ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    )}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="text-center">
                    <h4 className="font-semibold">{t.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{t.description}</p>
                  </div>
                  {isActive && (
                    <div className="mt-2 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                      Active
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Font Size */}
      <Card>
        <CardHeader>
          <CardTitle>Font Size</CardTitle>
          <CardDescription>Adjust the text size throughout the app</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label>Text Size</Label>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Small
              </Button>
              <Button variant="default" size="sm">
                Medium
              </Button>
              <Button variant="outline" size="sm">
                Large
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Density */}
      <Card>
        <CardHeader>
          <CardTitle>Density</CardTitle>
          <CardDescription>Control spacing and information density</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label>Interface Density</Label>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Compact
              </Button>
              <Button variant="default" size="sm">
                Comfortable
              </Button>
              <Button variant="outline" size="sm">
                Spacious
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>See how your settings look</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary" />
              <div>
                <div className="font-semibold">Sample Email</div>
                <div className="text-sm text-muted-foreground">
                  This is how your inbox will look
                </div>
              </div>
            </div>
            <div className="text-sm">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua.
            </div>
            <div className="flex gap-2">
              <Button size="sm">Reply</Button>
              <Button size="sm" variant="outline">
                Archive
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
