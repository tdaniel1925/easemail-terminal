'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  Mic,
  Calendar,
  Mail,
  Zap,
  Users,
  Check,
  ArrowRight,
  Brain,
  Lock,
  Globe,
  MessageSquare,
  PhoneCall,
  BarChart3,
} from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'AI Email Assistant',
    description: 'Write better emails faster. AI helps you compose, rewrite, and polish your messages with perfect tone and grammar.',
    color: 'text-blue-500',
  },
  {
    icon: Mail,
    title: 'Unified Inbox',
    description: 'All your email accounts in one beautiful interface. Gmail, Outlook, IMAP - managed effortlessly.',
    color: 'text-indigo-500',
  },
  {
    icon: Zap,
    title: 'Smart Organization',
    description: 'AI categorizes, labels, and organizes your emails automatically. Never miss what matters.',
    color: 'text-purple-500',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Shared inboxes, team analytics, and collaboration tools for modern teams.',
    color: 'text-pink-500',
  },
  {
    icon: Calendar,
    title: 'Built-in Calendar',
    description: 'Schedule meetings, manage events, and integrate with Teams - all in one place.',
    color: 'text-orange-500',
  },
  {
    icon: MessageSquare,
    title: 'SMS Integration',
    description: 'Send and receive SMS directly from EaseMail. Stay connected across all channels.',
    color: 'text-green-500',
  },
];

const stats = [
  { value: '10,000+', label: 'Active Users' },
  { value: '1M+', label: 'Emails Sent' },
  { value: '99.9%', label: 'Uptime' },
  { value: '4.9/5', label: 'User Rating' },
];

export default function HomePage() {
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
            <Link href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
              Features
            </Link>
            <Link href="/app/pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
              Pricing
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-gray-900 transition-colors">
              Contact
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-gray-700">
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
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50" />

        {/* Decorative Elements */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-40 left-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />

        <div className="relative container max-w-7xl mx-auto">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <Badge className="px-4 py-1.5 text-sm bg-white/80 backdrop-blur-sm border-blue-200 text-blue-700 hover:bg-white">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              AI-Powered Email Management
            </Badge>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900">
              Email That Feels
              <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Effortless
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              AI-powered email management for modern teams. Write faster, stay organized,
              and never miss what matters with the smartest inbox you've ever used.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Link href="/signup">
                <Button size="lg" className="text-lg px-8 h-14 bg-blue-500 hover:bg-blue-600 shadow-xl shadow-blue-500/30 group">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline" className="text-lg px-8 h-14 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50">
                  Explore Features
                </Button>
              </Link>
            </div>

            <p className="text-sm text-gray-500 flex items-center justify-center gap-4 flex-wrap">
              <span className="flex items-center gap-1">
                <Check className="h-4 w-4 text-green-500" />
                14-day free trial
              </span>
              <span className="flex items-center gap-1">
                <Check className="h-4 w-4 text-green-500" />
                No credit card required
              </span>
              <span className="flex items-center gap-1">
                <Check className="h-4 w-4 text-green-500" />
                Cancel anytime
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-y border-gray-200">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-br from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gradient-to-br from-gray-50 to-white">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <Badge className="px-4 py-1.5 text-sm bg-blue-100 text-blue-700 border-blue-200">
              Powerful Features
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              Everything You Need to Master Email
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built for productivity, designed for simplicity, powered by AI
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group bg-white rounded-2xl p-8 shadow-sm border border-gray-200 hover:shadow-xl hover:border-blue-200 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <Icon className={`h-7 w-7 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <Link href="/features">
              <Button size="lg" variant="outline" className="border-2 border-gray-300 hover:border-blue-500 hover:text-blue-600">
                View All Features
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-24 bg-white">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              Trusted by Teams Worldwide
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join thousands of professionals who have transformed their email workflow
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                quote: "EaseMail's AI has completely transformed how I write emails. What used to take 10 minutes now takes 30 seconds.",
                author: "Sarah Chen",
                role: "VP of Product",
                company: "TechCorp",
                avatar: "SC",
              },
              {
                quote: "The unified inbox is brilliant. Managing 5 email accounts has never been easier. It's like having a personal email assistant.",
                author: "Michael Rodriguez",
                role: "Sales Director",
                company: "Growth Inc",
                avatar: "MR",
              },
              {
                quote: "Finally, an email client that actually understands modern workflows. The team collaboration features are game-changing.",
                author: "Emily Thompson",
                role: "CEO & Founder",
                company: "StartupXYZ",
                avatar: "ET",
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed italic">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.author}</div>
                    <div className="text-sm text-gray-600">
                      {testimonial.role} at {testimonial.company}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600" />

        {/* Pattern Overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative container max-w-4xl mx-auto px-4 text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Email Workflow?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Join thousands of professionals using EaseMail to save time and communicate better.
            Start your free 14-day trial today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="text-lg px-8 h-14 bg-white text-blue-600 hover:bg-gray-50 shadow-2xl group">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="text-lg px-8 h-14 border-2 border-white text-white hover:bg-white/10">
                Schedule Demo
              </Button>
            </Link>
          </div>
          <p className="text-sm text-blue-100 mt-6">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300">
        <div className="container max-w-7xl mx-auto px-4 py-16">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Mail className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-xl text-white">EaseMail</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-sm">
                AI-powered email management for modern teams. Work smarter, not harder.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/app/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/features" className="hover:text-white transition-colors">Enterprise</Link></li>
                <li><Link href="/app/connect" className="hover:text-white transition-colors">Integrations</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms</Link></li>
                <li><Link href="/security" className="hover:text-white transition-colors">Security</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              © 2026 EaseMail. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Globe className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <MessageSquare className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <PhoneCall className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
