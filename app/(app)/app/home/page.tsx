'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Mail,
  Calendar,
  Star,
  Send,
  Inbox,
  Clock,
  TrendingUp,
  Sparkles,
  ArrowRight,
  BarChart3,
  Video,
  Users
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface Stats {
  unread: number;
  today: number;
  starred: number;
  sent: number;
  avgResponseTime: string;
  topSender: string;
}

const gradientBackgrounds = [
  'bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500',
  'bg-gradient-to-br from-green-400 via-blue-500 to-purple-600',
  'bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600',
  'bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600',
  'bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600',
];

// Focus time recommendations are now fetched dynamically from API

export default function HomePage() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [stats, setStats] = useState<Stats>({
    unread: 0,
    today: 0,
    starred: 0,
    sent: 0,
    avgResponseTime: '2h',
    topSender: 'team@company.com',
  });
  const [todayEvents, setTodayEvents] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [focusTimeRecommendations, setFocusTimeRecommendations] = useState<any[]>([]);
  const [currentGradient] = useState(() =>
    gradientBackgrounds[Math.floor(Math.random() * gradientBackgrounds.length)]
  );

  useEffect(() => {
    fetchUserData();
    fetchStats();
    fetchTodayEvents();
    fetchFocusTime();

    // Auto-refresh dashboard every 30 seconds (only when page is visible)
    const refreshInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchStats(); // Refresh stats silently
        fetchTodayEvents(); // Refresh events silently
      }
    }, 30000);

    // Refetch when page becomes visible after being hidden
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchStats();
        fetchTodayEvents();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(refreshInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user');
      const data = await response.json();
      if (data.user) {
        // Get name from user metadata or user table
        const name = data.user.user_metadata?.name || data.user.name || '';
        setUserName(name);
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats');
      const data = await response.json();
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchTodayEvents = async () => {
    try {
      setLoadingEvents(true);
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

      const response = await fetch(`/api/calendar?start=${startOfDay}&end=${endOfDay}`);
      const data = await response.json();
      if (data.events) {
        // Sort by start time and take top 3
        const sortedEvents = data.events.sort((a: any, b: any) =>
          new Date(a.when.start_time).getTime() - new Date(b.when.start_time).getTime()
        );
        setTodayEvents(sortedEvents);
      }
    } catch (error) {
      console.error('Failed to fetch today events:', error);
      setTodayEvents([]);
    } finally {
      setLoadingEvents(false);
    }
  };

  const fetchFocusTime = async () => {
    try {
      const response = await fetch('/api/focus-time');
      const data = await response.json();
      if (data.recommendations) {
        setFocusTimeRecommendations(data.recommendations);
      }
    } catch (error) {
      console.error('Failed to fetch focus time:', error);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const quickActions = [
    {
      title: 'Inbox',
      icon: Inbox,
      count: stats.unread,
      href: '/app/inbox',
      color: 'bg-blue-500',
    },
    {
      title: 'Calendar',
      icon: Calendar,
      href: '/app/calendar',
      color: 'bg-purple-500',
    },
    {
      title: 'MS Teams',
      icon: Video,
      href: '/app/teams',
      color: 'bg-indigo-500',
    },
    {
      title: 'Contacts',
      icon: Users,
      href: '/app/contacts',
      color: 'bg-green-500',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section with Background Image */}
      <div className="relative overflow-hidden bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url(/images/dashboard-bg.jpg)' }}>
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />

        <div className="relative container max-w-7xl mx-auto px-8 pt-24 pb-36">
          <div className="text-center text-white">
            <h1 className="text-6xl md:text-7xl font-bold mb-6 drop-shadow-2xl">
              {getGreeting()}{userName ? `, ${userName}` : ''}
            </h1>
            <p className="text-2xl md:text-3xl opacity-95 drop-shadow-xl font-medium">
              {formatDate(new Date())}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-7xl mx-auto px-4 -mt-16 relative z-10 pb-8 space-y-4">
        {/* Quick Stats - Large Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Card
                key={action.title}
                className="group cursor-pointer hover:shadow-lg transition-all duration-200 border-0 bg-gradient-to-br from-card to-card/50"
                onClick={() => router.push(action.href)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className={`${action.color} p-2 rounded-lg text-white`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    {action.count !== undefined && (
                      <div className="text-right">
                        <div className="text-2xl font-bold">{action.count}</div>
                      </div>
                    )}
                  </div>
                  <h3 className="font-semibold text-base mb-1">{action.title}</h3>
                  <div className="flex items-center text-xs text-muted-foreground group-hover:text-primary transition-colors">
                    Go there
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Today's Summary */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-base font-bold">Today's Summary</h2>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-0.5">Emails Received</div>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.today}</div>
                  </div>
                  <div className="p-2 bg-blue-500 rounded-xl">
                    <TrendingUp className="h-10 w-10 text-white" />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-0.5">Avg. Response Time</div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.avgResponseTime}</div>
                  </div>
                  <div className="p-2 bg-green-500 rounded-xl">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
                  <div className="flex-1">
                    <div className="text-xs font-medium text-muted-foreground mb-0.5">Top Sender</div>
                    <div className="text-sm font-semibold text-purple-900 dark:text-purple-100 truncate">{stats.topSender}</div>
                  </div>
                  <div className="p-2 bg-purple-500 rounded-xl">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Today's Events */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h2 className="text-base font-bold">Today's Events</h2>
                </div>
              </div>

              {loadingEvents ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : todayEvents.length > 0 ? (
                <div className="space-y-3">
                  {todayEvents.slice(0, 3).map((event, index) => {
                    const startTime = new Date(event.when.start_time);
                    return (
                      <div
                        key={index}
                        className="p-4 rounded-xl border-2 border-border bg-gradient-to-r from-muted/50 to-transparent hover:border-primary/50 transition-all cursor-pointer"
                        onClick={() => router.push('/app/calendar')}
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900">
                            <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm mb-1 truncate">{event.title}</div>
                            <div className="text-xs text-muted-foreground">
                              {startTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {todayEvents.length > 3 && (
                    <Button
                      variant="ghost"
                      className="w-full mt-2"
                      onClick={() => router.push('/app/calendar')}
                    >
                      More ({todayEvents.length - 3} more events)
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground">No events scheduled for today</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => router.push('/app/calendar')}
                  >
                    View Calendar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* AI Insights */}
        <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-base mb-1.5">AI Insight</h3>
                <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                  {focusTimeRecommendations.length > 0
                    ? `Based on your email patterns, ${focusTimeRecommendations[0].time} has the ${focusTimeRecommendations[0].activityLevel?.toLowerCase()}. This is an ideal time for focused work.`
                    : 'Analyzing your email patterns to find the best focus times...'}
                </p>
                {focusTimeRecommendations.length > 0 && (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => router.push('/app/calendar')}>
                      Schedule Focus Time
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => router.push('/app/calendar')}>
                      View Calendar
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
