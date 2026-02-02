import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  Mic,
  VoicemailIcon,
  Calendar,
  Mail,
  Lock,
  Zap,
  Users,
  Check,
  Crown,
  ArrowRight,
} from 'lucide-react';

const features = [
  {
    icon: Sparkles,
    title: 'AI Remix',
    description:
      'Transform messy thoughts into polished, professional emails instantly. Choose from 4 tone styles.',
    gradient: 'from-blue-500 to-purple-500',
  },
  {
    icon: Mic,
    title: 'AI Dictate',
    description:
      'Speak naturally and get a perfectly formatted email. AI transcribes and polishes automatically.',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: VoicemailIcon,
    title: 'Voice Messages',
    description:
      'Add personality with audio attachments. Like WhatsApp for email. Stand out from the crowd.',
    gradient: 'from-pink-500 to-orange-500',
  },
  {
    icon: Calendar,
    title: 'Smart Calendar',
    description:
      'Create events from natural language. "Meet John Tuesday at 2pm" becomes a calendar event.',
    gradient: 'from-orange-500 to-yellow-500',
  },
  {
    icon: Mail,
    title: 'Unified Inbox',
    description:
      'Gmail, Outlook, IMAP - all in one beautiful interface. Smart categorization and filters.',
    gradient: 'from-green-500 to-teal-500',
  },
  {
    icon: Lock,
    title: 'Privacy First',
    description:
      'End-to-end encryption, 2FA, and complete data control. Your emails, your privacy.',
    gradient: 'from-teal-500 to-blue-500',
  },
];

const plans = [
  {
    name: 'Free',
    price: '$0',
    description: 'Perfect for trying out EaseMail',
    features: [
      '1 email account',
      'Basic email features',
      'Limited AI (10/month)',
      '1GB storage',
      'Community support',
    ],
    cta: 'Get Started',
    href: '/signup',
    popular: false,
  },
  {
    name: 'Pro',
    price: '$12',
    description: 'Best for individuals',
    features: [
      'Unlimited email accounts',
      'All email features',
      'Unlimited AI features',
      '50GB storage',
      'Priority support',
      'Calendar integration',
    ],
    cta: 'Start Free Trial',
    href: '/signup?plan=pro',
    popular: true,
  },
  {
    name: 'Business',
    price: '$25',
    description: 'For teams and organizations',
    features: [
      'Everything in Pro',
      '5 team seats (starting)',
      'Admin panel',
      'Team analytics',
      '500GB shared storage',
      'SMS integration',
      'Advanced security',
    ],
    cta: 'Start Free Trial',
    href: '/signup?plan=business',
    popular: false,
  },
];

const testimonials = [
  {
    quote: 'EaseMail\'s AI Remix saves me hours every week. I can now write emails in seconds.',
    author: 'Sarah Chen',
    role: 'Product Manager',
    company: 'TechCorp',
  },
  {
    quote: 'The voice message feature is a game-changer. My clients love the personal touch.',
    author: 'Michael Rodriguez',
    role: 'Sales Director',
    company: 'SalesCo',
  },
  {
    quote: 'Finally, an email client that understands how I work. Beautiful design, powerful features.',
    author: 'Emily Thompson',
    role: 'CEO',
    company: 'StartupXYZ',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">EaseMail</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950 dark:via-purple-950 dark:to-pink-950">
        <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-900 [mask-image:linear-gradient(0deg,transparent,black)] dark:[mask-image:linear-gradient(0deg,black,transparent)]" />

        <div className="relative container max-w-7xl mx-auto px-4 py-24 md:py-32">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <Badge className="px-4 py-1 text-sm">
              <Sparkles className="mr-1 h-3 w-3" />
              AI-Powered Email Client
            </Badge>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              Email That
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                {' '}Understands You
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Transform your email workflow with AI superpowers. Write faster, sound better, and
              stay organized with the smartest email client ever built.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/signup">
                <Button size="lg" className="text-lg px-8 group">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  See Features
                </Button>
              </Link>
            </div>

            <p className="text-sm text-muted-foreground">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-background">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Features That Set You Apart
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to master your inbox and communicate like a pro
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <div
                      className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4`}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-muted/50">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that fits your needs. Upgrade or downgrade anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <Card
                key={index}
                className={`relative ${
                  plan.popular
                    ? 'border-primary shadow-xl scale-105'
                    : 'border-2'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="gap-1 px-4 py-1">
                      <Crown className="h-3 w-3" />
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="pb-8 pt-6">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-5xl font-bold">{plan.price}</span>
                    {plan.price !== '$0' && (
                      <span className="text-muted-foreground">/month</span>
                    )}
                  </div>
                  <CardDescription className="mt-2">{plan.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link href={plan.href} className="block">
                    <Button
                      className="w-full"
                      variant={plan.popular ? 'default' : 'outline'}
                      size="lg"
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-background">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Loved by Thousands
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See what our users have to say about EaseMail
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <p className="text-lg mb-6 italic">"{testimonial.quote}"</p>
                  <div>
                    <div className="font-semibold">{testimonial.author}</div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.role} at {testimonial.company}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Email?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of professionals already using EaseMail to save time and communicate
            better.
          </p>
          <Link href="/signup">
            <Button size="lg" className="text-lg px-8 group">
              Start Your Free Trial
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground mt-4">
            14-day free trial • No credit card required
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/50">
        <div className="container max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#features">Features</Link></li>
                <li><Link href="#pricing">Pricing</Link></li>
                <li><Link href="/login">Sign In</Link></li>
                <li><Link href="/signup">Get Started</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#">About</Link></li>
                <li><Link href="#">Blog</Link></li>
                <li><Link href="#">Careers</Link></li>
                <li><Link href="#">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#">Documentation</Link></li>
                <li><Link href="#">Help Center</Link></li>
                <li><Link href="#">API</Link></li>
                <li><Link href="#">Status</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#">Privacy</Link></li>
                <li><Link href="#">Terms</Link></li>
                <li><Link href="#">Security</Link></li>
                <li><Link href="#">Compliance</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-12 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2026 EaseMail. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
