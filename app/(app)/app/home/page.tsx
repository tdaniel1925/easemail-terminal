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
  BarChart3
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

const focusTimeRecommendations = [
  {
    time: '9:00 AM - 11:00 AM',
    reason: 'Least emails received',
    icon: Clock,
  },
  {
    time: '2:00 PM - 4:00 PM',
    reason: 'Low activity period',
    icon: TrendingUp,
  },
];

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
  const [currentGradient] = useState(() =>
    gradientBackgrounds[Math.floor(Math.random() * gradientBackgrounds.length)]
  );

  useEffect(() => {
    fetchUserData();
    fetchStats();

    // Auto-refresh dashboard every 30 seconds (only when page is visible)
    const refreshInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchStats(); // Refresh stats silently
      }
    }, 30000);

    // Refetch when page becomes visible after being hidden
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchStats();
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
        setUserName(data.user.user_metadata?.name || 'there');
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
      title: 'Starred',
      icon: Star,
      count: stats.starred,
      href: '/app/inbox?filter=starred',
      color: 'bg-yellow-500',
    },
    {
      title: 'Calendar',
      icon: Calendar,
      href: '/app/calendar',
      color: 'bg-purple-500',
    },
    {
      title: 'Sent',
      icon: Send,
      count: stats.sent,
      href: '/app/inbox?folder=sent',
      color: 'bg-green-500',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section with Gradient */}
      <div className={`${currentGradient} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

        <div className="relative container max-w-7xl mx-auto px-8 pt-24 pb-36">
          <div className="text-center text-white">
            <h1 className="text-6xl md:text-7xl font-bold mb-6 drop-shadow-lg">
              {getGreeting()}, {userName}
            </h1>
            <p className="text-2xl md:text-3xl opacity-90 drop-shadow-md font-medium">
              {formatDate(new Date())}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-7xl mx-auto px-8 -mt-24 relative z-10 pb-16 space-y-8">
        {/* Quick Stats - Large Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Card
                key={action.title}
                className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 bg-gradient-to-br from-card to-card/50"
                onClick={() => router.push(action.href)}
              >
                <CardContent className="p-8">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`${action.color} p-4 rounded-xl text-white shadow-lg`}>
                      <Icon className="h-8 w-8" />
                    </div>
                    {action.count !== undefined && (
                      <div className="text-right">
                        <div className="text-4xl font-bold">{action.count}</div>
                      </div>
                    )}
                  </div>
                  <h3 className="font-semibold text-xl mb-2">{action.title}</h3>
                  <div className="flex items-center text-sm text-muted-foreground group-hover:text-primary transition-colors">
                    View details
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Today's Summary */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold">Today's Summary</h2>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between p-5 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">Emails Received</div>
                    <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">{stats.today}</div>
                  </div>
                  <div className="p-3 bg-blue-500 rounded-xl">
                    <TrendingUp className="h-10 w-10 text-white" />
                  </div>
                </div>

                <div className="flex items-center justify-between p-5 rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">Avg. Response Time</div>
                    <div className="text-4xl font-bold text-green-600 dark:text-green-400">{stats.avgResponseTime}</div>
                  </div>
                  <div className="p-3 bg-green-500 rounded-xl">
                    <Clock className="h-10 w-10 text-white" />
                  </div>
                </div>

                <div className="flex items-center justify-between p-5 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-muted-foreground mb-1">Top Sender</div>
                    <div className="text-lg font-semibold text-purple-900 dark:text-purple-100 truncate">{stats.topSender}</div>
                  </div>
                  <div className="p-3 bg-purple-500 rounded-xl">
                    <BarChart3 className="h-10 w-10 text-white" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Focus Time Recommendations */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h2 className="text-2xl font-bold">Best Time to Focus</h2>
              </div>

              <div className="space-y-4">
                {focusTimeRecommendations.map((rec, index) => {
                  const Icon = rec.icon;
                  return (
                    <div
                      key={index}
                      className="p-5 rounded-xl border-2 border-border bg-gradient-to-r from-muted/50 to-transparent hover:border-primary/50 transition-all"
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900">
                          <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-lg mb-1">{rec.time}</div>
                          <div className="text-sm text-muted-foreground">{rec.reason}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <Button className="w-full mt-6" variant="outline" size="lg">
                  View Full Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Insights */}
        <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50">
          <CardContent className="p-8">
            <div className="flex items-start gap-6">
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg">
                <Sparkles className="h-8 w-8" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-2xl mb-3">AI Insight</h3>
                <p className="text-base text-muted-foreground mb-6 leading-relaxed">
                  You've been most productive between 9 AM - 11 AM this week. Consider scheduling
                  important tasks during this time for maximum efficiency.
                </p>
                <div className="flex gap-3">
                  <Button size="lg">
                    Schedule Focus Time
                  </Button>
                  <Button variant="outline" size="lg">
                    View More Insights
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
