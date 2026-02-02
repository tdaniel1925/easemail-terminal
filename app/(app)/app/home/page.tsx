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

        <div className="relative container max-w-6xl mx-auto px-4 pt-20 pb-32">
          <div className="text-center text-white">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 drop-shadow-lg">
              {getGreeting()}, {userName}
            </h1>
            <p className="text-xl md:text-2xl opacity-90 drop-shadow-md">
              {formatDate(new Date())}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-6xl mx-auto px-4 -mt-20 relative z-10 pb-12">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Card
                key={action.title}
                className="group cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
                onClick={() => router.push(action.href)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`${action.color} p-3 rounded-lg text-white`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    {action.count !== undefined && (
                      <Badge variant="secondary" className="text-lg font-bold">
                        {action.count}
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-semibold text-lg">{action.title}</h3>
                  <div className="mt-2 flex items-center text-sm text-muted-foreground group-hover:text-primary transition-colors">
                    Open
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Today's Summary */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Mail className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold">Today's Summary</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <div className="text-sm text-muted-foreground">Emails Received</div>
                    <div className="text-2xl font-bold">{stats.today}</div>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <div className="text-sm text-muted-foreground">Avg. Response Time</div>
                    <div className="text-2xl font-bold">{stats.avgResponseTime}</div>
                  </div>
                  <Clock className="h-8 w-8 text-blue-500" />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <div className="text-sm text-muted-foreground">Top Sender</div>
                    <div className="font-medium truncate">{stats.topSender}</div>
                  </div>
                  <BarChart3 className="h-8 w-8 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Focus Time Recommendations */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold">Best Time to Focus</h2>
              </div>

              <div className="space-y-3">
                {focusTimeRecommendations.map((rec, index) => {
                  const Icon = rec.icon;
                  return (
                    <div
                      key={index}
                      className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold">{rec.time}</div>
                          <div className="text-sm text-muted-foreground">{rec.reason}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <Button className="w-full mt-4" variant="outline">
                  View Full Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Insights */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary text-primary-foreground">
                <Sparkles className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-2">AI Insight</h3>
                <p className="text-muted-foreground mb-4">
                  You've been most productive between 9 AM - 11 AM this week. Consider scheduling
                  important tasks during this time for maximum efficiency.
                </p>
                <div className="flex gap-2">
                  <Button variant="default" size="sm">
                    Schedule Focus Time
                  </Button>
                  <Button variant="outline" size="sm">
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
