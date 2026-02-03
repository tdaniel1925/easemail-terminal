'use client';

import { Button } from '@/components/ui/button';
import { Loader2, Mail, Shield, Zap, ArrowRight } from 'lucide-react';
import { useState } from 'react';

const EMAIL_PROVIDERS = [
  {
    id: 'google',
    name: 'Google',
    fullName: 'Gmail & Google Workspace',
    description: 'Connect your Gmail or Google Workspace account',
    logo: (
      <svg className="h-8 w-8" viewBox="0 0 48 48">
        <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"/>
        <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"/>
        <path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z"/>
        <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"/>
      </svg>
    ),
    bgColor: 'bg-white hover:bg-gray-50',
    borderColor: 'border-gray-200',
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    fullName: 'Outlook & Office 365',
    description: 'Connect your Outlook or Office 365 account',
    logo: (
      <svg className="h-8 w-8" viewBox="0 0 48 48">
        <path fill="#0078D4" d="M44 24c0 11.05-8.95 20-20 20S4 35.05 4 24 12.95 4 24 4s20 8.95 20 20z"/>
        <path fill="#FFF" d="M24 11.5c-6.9 0-12.5 5.6-12.5 12.5s5.6 12.5 12.5 12.5 12.5-5.6 12.5-12.5-5.6-12.5-12.5-12.5zm0 21.25c-4.83 0-8.75-3.92-8.75-8.75s3.92-8.75 8.75-8.75 8.75 3.92 8.75 8.75-3.92 8.75-8.75 8.75z"/>
        <path fill="#0078D4" d="M24 18.5c-3.04 0-5.5 2.46-5.5 5.5s2.46 5.5 5.5 5.5 5.5-2.46 5.5-5.5-2.46-5.5-5.5-5.5z"/>
      </svg>
    ),
    bgColor: 'bg-white hover:bg-blue-50',
    borderColor: 'border-blue-200',
  },
  {
    id: 'imap',
    name: 'IMAP',
    fullName: 'Other Email Providers',
    description: 'Connect via IMAP (iCloud, Yahoo, custom servers)',
    logo: (
      <div className="h-8 w-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
        <Mail className="h-5 w-5 text-white" />
      </div>
    ),
    bgColor: 'bg-white hover:bg-purple-50',
    borderColor: 'border-purple-200',
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-2">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Connect Your Email</h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Choose your email provider to get started with EaseMail
          </p>
        </div>

        {/* Provider Cards */}
        <div className="space-y-3">
          {EMAIL_PROVIDERS.map((provider) => (
            <button
              key={provider.id}
              onClick={() => handleConnect(provider.id)}
              disabled={connecting !== null}
              className={`w-full text-left p-6 rounded-xl border-2 transition-all ${provider.bgColor} ${provider.borderColor} hover:border-primary hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed group`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Logo */}
                  <div className="shrink-0">
                    {provider.logo}
                  </div>

                  {/* Content */}
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{provider.fullName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {provider.description}
                    </p>
                  </div>
                </div>

                {/* Action */}
                <div className="shrink-0 ml-4">
                  {connecting === provider.id ? (
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  ) : (
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-green-100 rounded-full">
              <Shield className="h-5 w-5 text-green-600" />
            </div>
            <h4 className="font-medium text-sm">Secure OAuth</h4>
            <p className="text-xs text-muted-foreground">
              We never see your password
            </p>
          </div>
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
              <Zap className="h-5 w-5 text-blue-600" />
            </div>
            <h4 className="font-medium text-sm">Instant Sync</h4>
            <p className="text-xs text-muted-foreground">
              Access emails immediately
            </p>
          </div>
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-purple-100 rounded-full">
              <Mail className="h-5 w-5 text-purple-600" />
            </div>
            <h4 className="font-medium text-sm">Multi-Account</h4>
            <p className="text-xs text-muted-foreground">
              Connect multiple emails
            </p>
          </div>
        </div>

        {/* Security Note */}
        <div className="text-center text-xs text-muted-foreground pt-2">
          Your data is encrypted and secure. You can disconnect at any time from settings.
        </div>
      </div>
    </div>
  );
}
