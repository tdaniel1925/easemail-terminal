import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Sparkles, Calendar, Mic, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export function WelcomeStep({ onNext }: any) {
  const [userName, setUserName] = useState('');
  const supabase = createClient();

  useEffect(() => {
    loadUserName();
  }, []);

  const loadUserName = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userData } = await supabase
        .from('users')
        .select('name')
        .eq('id', user.id)
        .single() as { data: { name: string } | null };

      if (userData?.name) {
        const firstName = userData.name.split(' ')[0];
        setUserName(firstName);
      }
    } catch (error) {
      console.error('Error loading user name:', error);
    }
  };

  const features = [
    {
      icon: Sparkles,
      title: 'AI-Powered Email',
      description: 'Remix and dictate emails with AI assistance',
    },
    {
      icon: Mail,
      title: 'Unified Inbox',
      description: 'Manage all your email accounts in one place',
    },
    {
      icon: Calendar,
      title: 'Smart Calendar',
      description: 'Integrated calendar with meeting management',
    },
    {
      icon: Mic,
      title: 'Voice Messages',
      description: 'Add personality with audio attachments',
    },
  ];

  const onboardingSteps = [
    'Add a profile picture',
    'Connect your email account',
    'Set up your email signature',
  ];

  return (
    <Card className="border-0 shadow-2xl">
      <CardContent className="p-8 space-y-6">
        {/* Header */}
        <div className="space-y-3 text-center">
          <h1 className="text-4xl font-bold">
            Welcome to EaseMail{userName && `, ${userName}`}!
          </h1>
          <p className="text-lg text-muted-foreground">
            Your intelligent email platform for modern communication
          </p>
        </div>

        {/* Beta Notice */}
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-900 dark:text-blue-100 text-center">
            <span className="font-semibold">Beta Access:</span> You have full access to all features at no charge during the beta period. Welcome aboard!
          </p>
        </div>

        {/* Key Features */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">What You Can Do:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900"
                >
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg flex-shrink-0">
                    <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{feature.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {feature.description}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Onboarding Steps */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Quick Setup (3 Steps):</h3>
          <div className="space-y-2">
            {onboardingSteps.map((step, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-sm font-semibold">
                  {index + 1}
                </div>
                <span className="text-sm">{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <Button
          className="w-full"
          size="lg"
          onClick={() => onNext({})}
        >
          Get Started
        </Button>
      </CardContent>
    </Card>
  );
}
