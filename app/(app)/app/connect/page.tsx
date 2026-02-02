'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Loader2 } from 'lucide-react';
import { useState } from 'react';

const EMAIL_PROVIDERS = [
  {
    id: 'google',
    name: 'Google / Gmail',
    description: 'Connect your Gmail or Google Workspace account',
    icon: '📧',
    color: 'from-red-500 to-yellow-500',
  },
  {
    id: 'microsoft',
    name: 'Microsoft / Outlook',
    description: 'Connect your Outlook or Office 365 account',
    icon: '📨',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'imap',
    name: 'IMAP / Other',
    description: 'Connect via IMAP (iCloud, Yahoo, custom servers)',
    icon: '✉️',
    color: 'from-purple-500 to-pink-500',
  },
];

export default function ConnectEmailPage() {
  const [connecting, setConnecting] = useState<string | null>(null);

  const handleConnect = async (provider: string) => {
    setConnecting(provider);

    try {
      // Call API to initiate Nylas OAuth
      const response = await fetch('/api/nylas/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      });

      const data = await response.json();

      if (data.url) {
        // Redirect to Nylas OAuth URL
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Failed to connect:', error);
      setConnecting(null);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Connect Your Email</h1>
          <p className="text-muted-foreground">
            Choose your email provider to get started with EaseMail
          </p>
        </div>

        {/* Provider Cards */}
        <div className="grid gap-4">
          {EMAIL_PROVIDERS.map((provider) => (
            <Card key={provider.id} className="overflow-hidden">
              <div className="flex items-center">
                {/* Icon Section */}
                <div className={`w-24 h-full bg-gradient-to-br ${provider.color} flex items-center justify-center text-4xl`}>
                  {provider.icon}
                </div>

                {/* Content Section */}
                <div className="flex-1 p-6">
                  <CardHeader className="p-0 pb-2">
                    <CardTitle>{provider.name}</CardTitle>
                    <CardDescription>{provider.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0 pt-4">
                    <Button
                      onClick={() => handleConnect(provider.id)}
                      disabled={connecting !== null}
                      className="w-full sm:w-auto"
                    >
                      {connecting === provider.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <Mail className="mr-2 h-4 w-4" />
                          Connect {provider.name}
                        </>
                      )}
                    </Button>
                  </CardContent>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Info Card */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2">🔒 Your data is secure</h3>
            <p className="text-sm text-muted-foreground">
              EaseMail uses industry-standard OAuth authentication. We never see or store your email password.
              You can disconnect your account at any time from settings.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
