'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Mail,
  Brain,
  FolderKanban,
  Users,
  Calendar,
  MessageSquare,
  Sparkles,
  Check,
  Zap,
  Shield,
  BarChart,
  Clock,
  Globe,
} from 'lucide-react';

export default function FeaturesPage() {
  const features = [
    {
      icon: Brain,
      title: 'AI Email Assistant',
      tagline: 'Write Smarter, Not Harder',
      description:
        'Transform your email writing with cutting-edge AI. Our assistant understands context, tone, and intent to help you craft perfect messages every time.',
      benefits: [
        'AI-powered email composition and rewriting',
        'Tone adjustment (professional, casual, friendly)',
        'Grammar and spelling correction',
        'Smart reply suggestions based on context',
        'Email summarization for long threads',
        'Multi-language support',
      ],
      color: 'from-blue-500 to-blue-600',
      iconBg: 'bg-blue-500',
    },
    {
      icon: Mail,
      title: 'Unified Inbox',
      tagline: 'All Your Email, One Place',
      description:
        'Connect unlimited email accounts from any provider. Gmail, Outlook, IMAP, Exchange - manage everything in a single, beautiful interface.',
      benefits: [
        'Support for Gmail, Outlook, Office 365, and IMAP',
        'Unlimited account connections',
        'Real-time synchronization',
        'Cross-account search',
        'Unified contact management',
        'Smart account switching',
      ],
      color: 'from-indigo-500 to-indigo-600',
      iconBg: 'bg-indigo-500',
    },
    {
      icon: FolderKanban,
      title: 'Smart Organization',
      tagline: 'Never Lose Track Again',
      description:
        'Intelligent folder management, labels, and filters that adapt to your workflow. Find any email in seconds with powerful search and smart categorization.',
      benefits: [
        'AI-powered email categorization',
        'Custom folders and labels',
        'Advanced search with filters',
        'Priority inbox for important messages',
        'Automatic spam detection',
        'Smart snoozing and reminders',
      ],
      color: 'from-purple-500 to-purple-600',
      iconBg: 'bg-purple-500',
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      tagline: 'Work Better Together',
      description:
        'Built for teams from the ground up. Share emails, assign tasks, collaborate on responses, and keep everyone in sync.',
      benefits: [
        'Shared mailboxes for teams',
        'Email assignments and delegation',
        'Internal notes and comments',
        'Team templates and signatures',
        'Role-based access control',
        'Activity tracking and analytics',
      ],
      color: 'from-pink-500 to-pink-600',
      iconBg: 'bg-pink-500',
    },
    {
      icon: Calendar,
      title: 'Built-in Calendar',
      tagline: 'Schedule Without Switching',
      description:
        'Integrated calendar and scheduling right in your inbox. Book meetings, manage events, and see your schedule alongside your emails.',
      benefits: [
        'Unified calendar view',
        'Meeting scheduling links',
        'Automatic timezone detection',
        'Calendar event creation from emails',
        'Availability sharing',
        'Google Calendar & Outlook sync',
      ],
      color: 'from-orange-500 to-orange-600',
      iconBg: 'bg-orange-500',
    },
    {
      icon: MessageSquare,
      title: 'SMS Integration',
      tagline: 'Email and SMS, Unified',
      description:
        'Send and receive SMS messages right from your inbox. Never switch apps again - all your communication in one powerful platform.',
      benefits: [
        'Send SMS from your inbox',
        'Unified conversation threads',
        'Contact synchronization',
        'Bulk SMS campaigns',
        'SMS templates',
        'Delivery tracking',
      ],
      color: 'from-green-500 to-green-600',
      iconBg: 'bg-green-500',
    },
  ];

  const additionalFeatures = [
    { icon: Zap, title: 'Lightning Fast', description: '99.9% uptime with instant sync' },
    { icon: Shield, title: 'Enterprise Security', description: 'Bank-level encryption & 2FA' },
    { icon: BarChart, title: 'Email Analytics', description: 'Track opens, clicks, and engagement' },
    { icon: Clock, title: 'Email Scheduling', description: 'Send emails at the perfect time' },
    { icon: Globe, title: 'Multi-Language', description: 'Interface in 15+ languages' },
    { icon: Sparkles, title: 'Templates', description: 'Save and reuse your best emails' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
        <div className="container max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Mail className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">EaseMail</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium text-blue-600">
              Features
            </Link>
            <Link href="/app/pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              Pricing
            </Link>
            <Link href="/contact" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              Contact
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/30">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50" />

        {/* Decorative Elements */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-40 left-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />

        <div className="relative container max-w-6xl mx-auto text-center">
          <Badge className="mb-6 px-4 py-1.5 text-sm bg-white/80 backdrop-blur-sm border-blue-200 text-blue-700 hover:bg-white">
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            Powerful Features for Modern Teams
          </Badge>

          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-gray-900 mb-6">
            Everything You Need to
            <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Master Your Inbox
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover the features that make EaseMail the most powerful email platform for teams who want to work smarter.
          </p>
        </div>
      </section>

      {/* Feature Details */}
      <section id="features" className="py-20 px-4">
        <div className="container max-w-6xl mx-auto space-y-32">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`grid md:grid-cols-2 gap-12 items-center ${
                index % 2 === 1 ? 'md:flex-row-reverse' : ''
              }`}
            >
              {/* Content */}
              <div className={index % 2 === 1 ? 'md:order-2' : ''}>
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} mb-6`}>
                  <feature.icon className="h-7 w-7 text-white" />
                </div>

                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h2>

                <p className="text-lg font-medium text-gray-500 mb-6">{feature.tagline}</p>

                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  {feature.description}
                </p>

                <div className="space-y-3 mb-8">
                  {feature.benefits.map((benefit, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-5 h-5 rounded-full ${feature.iconBg} flex items-center justify-center mt-0.5`}>
                        <Check className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>

                <Link href="/signup">
                  <Button className={`bg-gradient-to-r ${feature.color} text-white shadow-lg hover:shadow-xl transition-all`}>
                    Try This Feature
                  </Button>
                </Link>
              </div>

              {/* Visual Placeholder */}
              <div className={index % 2 === 1 ? 'md:order-1' : ''}>
                <Card className="overflow-hidden shadow-2xl border-0">
                  <CardContent className="p-0">
                    <div className={`bg-gradient-to-br ${feature.color} h-[400px] flex items-center justify-center relative overflow-hidden`}>
                      {/* Decorative Grid */}
                      <div className="absolute inset-0 opacity-10">
                        <div
                          className="absolute inset-0"
                          style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                          }}
                        />
                      </div>

                      <div className="relative z-10 text-white text-center p-8">
                        <feature.icon className="h-24 w-24 mx-auto mb-4 opacity-90" />
                        <p className="text-lg font-semibold opacity-90">{feature.title} in Action</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Additional Features Grid */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              And That's Not All
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Dozens more features designed to make your email experience seamless
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {additionalFeatures.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <feature.icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                  </div>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600" />

        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="relative container max-w-4xl mx-auto px-4 text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Experience the Difference?
          </h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Join thousands of teams who've transformed their email workflow with EaseMail. Start your free trial today - no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/signup">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-50 shadow-xl text-lg px-8 h-14">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/app/pricing">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 h-14">
                View Pricing
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-white/80 text-sm">
            14-day free trial • No credit card required • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="container max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Mail className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-xl text-white">EaseMail</span>
              </div>
              <p className="text-sm">Email that feels effortless.</p>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-3">Product</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/features" className="hover:text-white transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/app/pricing" className="hover:text-white transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/signup" className="hover:text-white transition-colors">
                    Sign Up
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-3">Company</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/contact" className="hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-3">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-800 text-center text-sm">
            <p>&copy; 2025 EaseMail. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes blob {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}
