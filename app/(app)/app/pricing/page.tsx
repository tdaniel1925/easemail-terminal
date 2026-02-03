'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Check, X, Sparkles, Users, Building2, Crown, Loader2, Mail, Phone, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function PricingPage() {
  const router = useRouter();
  const [seats, setSeats] = useState(1);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [showEnterpriseDialog, setShowEnterpriseDialog] = useState(false);
  const [submittingLead, setSubmittingLead] = useState(false);

  const [leadForm, setLeadForm] = useState({
    companyName: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    estimatedSeats: 50,
    message: '',
  });

  const calculatePrice = (seatCount: number) => {
    if (seatCount === 1) return 30;
    if (seatCount >= 2 && seatCount <= 10) return seatCount * 25;
    if (seatCount >= 11 && seatCount <= 49) return seatCount * 20;
    return 0; // Enterprise
  };

  const monthlyPrice = calculatePrice(seats);
  const annualPrice = billingCycle === 'annual' ? monthlyPrice * 10 : monthlyPrice * 12; // 2 months free

  const handleSelectPlan = (planType: 'pro') => {
    if (seats >= 50) {
      setShowEnterpriseDialog(true);
      return;
    }
    // Navigate to signup with plan details
    router.push(`/signup?plan=${planType}&seats=${seats}&billing=${billingCycle}`);
  };

  const handleEnterpriseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!leadForm.contactEmail || !leadForm.companyName || !leadForm.contactName) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmittingLead(true);
      const response = await fetch('/api/enterprise-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadForm),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Thank you! Our team will contact you within 24 hours.');
        setShowEnterpriseDialog(false);
        setLeadForm({
          companyName: '',
          contactName: '',
          contactEmail: '',
          contactPhone: '',
          estimatedSeats: 50,
          message: '',
        });
      } else {
        toast.error(data.error || 'Failed to submit request');
      }
    } catch (error) {
      console.error('Enterprise lead submission error:', error);
      toast.error('Failed to submit request');
    } finally {
      setSubmittingLead(false);
    }
  };

  const features = {
    included: [
      'Unlimited email accounts (Gmail, Outlook, IMAP)',
      'AI-powered email composition & replies',
      'Voice-to-email dictation',
      'Smart categorization & filtering',
      'Calendar integration',
      'Microsoft Teams integration',
      'Contact management',
      'Email templates & signatures',
      'Advanced search & filters',
      '2FA security',
      'Mobile app access',
      'Priority support',
    ],
    notIncluded: [
      'White-label branding',
      'Custom domain email',
      'Advanced analytics',
      'API access',
      'Dedicated account manager',
      'Custom integrations',
    ],
  };

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
            <Link href="/features" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              Features
            </Link>
            <Link href="/app/pricing" className="text-sm font-medium text-blue-600">
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

        <div className="relative container max-w-4xl mx-auto text-center">
          <Badge className="mb-6 px-4 py-1.5 text-sm bg-white/80 backdrop-blur-sm border-blue-200 text-blue-700 hover:bg-white">
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            Simple, Transparent Pricing
          </Badge>

          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-gray-900 mb-6">
            Pricing That
            <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Scales With You
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            No hidden fees. No surprises. All AI features included in every plan.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 pb-20">

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
            Monthly
          </span>
          <button
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
            className="relative inline-flex h-6 w-11 items-center rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition shadow-md ${
                billingCycle === 'annual' ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-sm font-medium ${billingCycle === 'annual' ? 'text-gray-900' : 'text-gray-500'}`}>
            Annual
            <Badge className="ml-2 bg-green-500 hover:bg-green-600 text-white">Save 17%</Badge>
          </span>
        </div>

        {/* Seat Calculator */}
        <Card className="max-w-2xl mx-auto mb-12 border-0 shadow-2xl">
          <CardHeader className="bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              Calculate Your Cost
            </CardTitle>
            <CardDescription className="text-base">
              Adjust the number of seats to see your pricing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div>
              <Label htmlFor="seats" className="text-base text-gray-700">
                Number of Seats: <span className="font-bold text-3xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{seats}</span>
              </Label>
              <input
                id="seats"
                type="range"
                min="1"
                max="60"
                value={seats}
                onChange={(e) => setSeats(parseInt(e.target.value))}
                className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-blue-500 [&::-webkit-slider-thumb]:to-blue-600 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>1 user</span>
                <span>10 users</span>
                <span>20 users</span>
                <span>50+ users</span>
              </div>
            </div>

            {seats < 50 ? (
              <>
                <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 rounded-xl space-y-3 border border-blue-100">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-700">Price per seat/month:</span>
                    <span className="font-semibold text-gray-900">
                      ${seats === 1 ? '30.00' : seats >= 11 ? '20.00' : '25.00'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-700">Number of seats:</span>
                    <span className="font-semibold text-gray-900">{seats}</span>
                  </div>
                  <div className="border-t border-blue-200 pt-3 flex justify-between items-center">
                    <span className="font-semibold text-gray-900">Monthly Total:</span>
                    <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      ${monthlyPrice.toFixed(2)}/mo
                    </span>
                  </div>
                  {billingCycle === 'annual' && (
                    <>
                      <div className="flex justify-between items-center text-sm text-gray-600">
                        <span>Annual billing (2 months free):</span>
                        <span className="line-through">${(monthlyPrice * 12).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-green-600">You save:</span>
                        <span className="text-xl font-bold text-green-600">
                          ${(monthlyPrice * 2).toFixed(2)}/year
                        </span>
                      </div>
                      <div className="border-t border-blue-200 pt-3 flex justify-between items-center">
                        <span className="font-semibold text-gray-900">Annual Total:</span>
                        <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                          ${annualPrice.toFixed(2)}/year
                        </span>
                      </div>
                    </>
                  )}
                </div>
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl text-lg h-14"
                  onClick={() => handleSelectPlan('pro')}
                >
                  Get Started with {seats} {seats === 1 ? 'Seat' : 'Seats'}
                </Button>
              </>
            ) : (
              <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 p-6 rounded-xl border-2 border-purple-500/20">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Crown className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Enterprise Pricing</h3>
                    <p className="text-gray-600 mb-4">
                      For teams with 50+ seats, we offer custom enterprise pricing with volume discounts,
                      dedicated support, and tailored solutions.
                    </p>
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg hover:shadow-xl"
                      onClick={() => setShowEnterpriseDialog(true)}
                    >
                      Contact Sales
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pricing Tiers Explanation */}
        <div className="max-w-5xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Pricing Tiers</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="bg-gradient-to-br from-gray-50 to-gray-100">
                <Badge className="w-fit mb-3 bg-gray-200 text-gray-700">1 Seat</Badge>
                <CardTitle className="text-4xl font-bold text-gray-900">
                  $30<span className="text-lg font-normal text-gray-600">/mo</span>
                </CardTitle>
                <CardDescription className="text-base">Perfect for solo professionals</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600">
                  Get started with all features for individual use.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-2xl scale-105 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-gradient-to-l from-blue-500 to-blue-600 text-white px-3 py-1 text-xs font-semibold">
                POPULAR
              </div>
              <CardHeader className="bg-gradient-to-br from-blue-50 to-indigo-50">
                <Badge className="w-fit mb-3 bg-blue-500 hover:bg-blue-600 text-white">2-10 Seats</Badge>
                <CardTitle className="text-4xl font-bold text-gray-900">
                  $25<span className="text-lg font-normal text-gray-600">/seat/mo</span>
                </CardTitle>
                <CardDescription className="text-base">Best for small teams</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600">
                  16% savings for growing teams. $50-$250/month total.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="bg-gradient-to-br from-purple-50 to-indigo-50">
                <Badge className="w-fit mb-3 bg-purple-500 hover:bg-purple-600 text-white">11-49 Seats</Badge>
                <CardTitle className="text-4xl font-bold text-gray-900">
                  $20<span className="text-lg font-normal text-gray-600">/seat/mo</span>
                </CardTitle>
                <CardDescription className="text-base">Great for larger teams</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600">
                  33% savings for established teams. $220-$980/month total.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features Included */}
        <Card className="max-w-5xl mx-auto mb-16 border-0 shadow-2xl">
          <CardHeader className="bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardTitle className="text-3xl text-gray-900">Everything Included</CardTitle>
            <CardDescription className="text-base">All features are available in every plan. No upsells.</CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-xl mb-6 flex items-center gap-2 text-green-600">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Check className="h-5 w-5" />
                  </div>
                  Included Features
                </h3>
                <ul className="space-y-3">
                  {features.included.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm">
                      <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                        <Check className="h-3 w-3 text-green-600" />
                      </div>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-xl mb-6 flex items-center gap-2 text-purple-600">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Crown className="h-5 w-5" />
                  </div>
                  Enterprise Only
                </h3>
                <ul className="space-y-3">
                  {features.notIncluded.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm">
                      <div className="flex-shrink-0 w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center mt-0.5">
                        <Crown className="h-3 w-3 text-purple-600" />
                      </div>
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              {
                q: 'Can I change my plan later?',
                a: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we\'ll prorate the difference.',
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept credit cards, debit cards, and ACH bank transfers. Enterprise customers can also pay via invoice.',
              },
              {
                q: 'Is there a free trial?',
                a: 'Yes! All new accounts get a 14-day free trial with full access to all features. No credit card required.',
              },
              {
                q: 'What happens if I need more seats?',
                a: 'You can add seats at any time from your organization settings. Additional seats are prorated for the current billing period.',
              },
              {
                q: 'Are AI features metered separately?',
                a: 'No! All AI features (composition, replies, dictation) are included in your seat price with no usage limits.',
              },
              {
                q: 'Can I use my own OpenAI API key?',
                a: 'Yes! Organization admins can add their own OpenAI API key to avoid AI usage charges. Without your own key, AI usage is billed through our master key at included rates.',
              },
            ].map((faq, idx) => (
              <Card key={idx} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900">{faq.q}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <section className="py-20 relative overflow-hidden -mx-4 mb-20">
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
              Ready to Get Started?
            </h2>
            <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
              Join thousands of teams who've transformed their email workflow. Start your free trial today - no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/signup">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-50 shadow-xl text-lg px-8 h-14">
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 h-14">
                  Contact Sales
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-white/80 text-sm">
              14-day free trial • No credit card required • Cancel anytime
            </p>
          </div>
        </section>
      </div>

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

      {/* Enterprise Contact Dialog */}
      <Dialog open={showEnterpriseDialog} onOpenChange={setShowEnterpriseDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <form onSubmit={handleEnterpriseSubmit}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-purple-600" />
                Contact Enterprise Sales
              </DialogTitle>
              <DialogDescription>
                Fill out this form and our team will contact you within 24 hours to discuss custom pricing
                and enterprise features.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    required
                    value={leadForm.companyName}
                    onChange={(e) => setLeadForm({ ...leadForm, companyName: e.target.value })}
                    placeholder="Acme Corp"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactName">Your Name *</Label>
                  <Input
                    id="contactName"
                    required
                    value={leadForm.contactName}
                    onChange={(e) => setLeadForm({ ...leadForm, contactName: e.target.value })}
                    placeholder="John Doe"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Email *</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    required
                    value={leadForm.contactEmail}
                    onChange={(e) => setLeadForm({ ...leadForm, contactEmail: e.target.value })}
                    placeholder="john@acme.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Phone</Label>
                  <Input
                    id="contactPhone"
                    type="tel"
                    value={leadForm.contactPhone}
                    onChange={(e) => setLeadForm({ ...leadForm, contactPhone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimatedSeats">Estimated Number of Seats</Label>
                <Input
                  id="estimatedSeats"
                  type="number"
                  min="50"
                  value={leadForm.estimatedSeats}
                  onChange={(e) => setLeadForm({ ...leadForm, estimatedSeats: parseInt(e.target.value) || 50 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message (Optional)</Label>
                <Textarea
                  id="message"
                  value={leadForm.message}
                  onChange={(e) => setLeadForm({ ...leadForm, message: e.target.value })}
                  placeholder="Tell us about your needs and any specific requirements..."
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEnterpriseDialog(false)}
                disabled={submittingLead}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submittingLead}>
                {submittingLead ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Submit Request
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
