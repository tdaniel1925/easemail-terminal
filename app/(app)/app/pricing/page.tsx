'use client';

import { useState } from 'react';
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
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4" variant="secondary">
            <Sparkles className="h-3 w-3 mr-1" />
            Simple, Transparent Pricing
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            No hidden fees. No surprises. All AI features included in every plan.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-foreground' : 'text-muted-foreground'}`}>
            Monthly
          </span>
          <button
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
            className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                billingCycle === 'annual' ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-sm font-medium ${billingCycle === 'annual' ? 'text-foreground' : 'text-muted-foreground'}`}>
            Annual
            <Badge className="ml-2" variant="default">Save 17%</Badge>
          </span>
        </div>

        {/* Seat Calculator */}
        <Card className="max-w-2xl mx-auto mb-12 border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Calculate Your Cost
            </CardTitle>
            <CardDescription>
              Adjust the number of seats to see your pricing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="seats" className="text-base">
                Number of Seats: <span className="font-bold text-2xl text-primary">{seats}</span>
              </Label>
              <input
                id="seats"
                type="range"
                min="1"
                max="60"
                value={seats}
                onChange={(e) => setSeats(parseInt(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer mt-4"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>1 user</span>
                <span>10 users</span>
                <span>20 users</span>
                <span>50+ users</span>
              </div>
            </div>

            {seats < 50 ? (
              <>
                <div className="bg-muted/50 p-6 rounded-lg space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Price per seat/month:</span>
                    <span className="font-semibold">
                      ${seats === 1 ? '30.00' : seats >= 11 ? '20.00' : '25.00'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Number of seats:</span>
                    <span className="font-semibold">{seats}</span>
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between items-center">
                    <span className="font-semibold">Monthly Total:</span>
                    <span className="text-2xl font-bold text-primary">
                      ${monthlyPrice.toFixed(2)}/mo
                    </span>
                  </div>
                  {billingCycle === 'annual' && (
                    <>
                      <div className="flex justify-between items-center text-sm text-muted-foreground">
                        <span>Annual billing (2 months free):</span>
                        <span className="line-through">${(monthlyPrice * 12).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-green-600">You save:</span>
                        <span className="text-xl font-bold text-green-600">
                          ${(monthlyPrice * 2).toFixed(2)}/year
                        </span>
                      </div>
                      <div className="border-t border-border pt-3 flex justify-between items-center">
                        <span className="font-semibold">Annual Total:</span>
                        <span className="text-2xl font-bold text-primary">
                          ${annualPrice.toFixed(2)}/year
                        </span>
                      </div>
                    </>
                  )}
                </div>
                <Button
                  size="lg"
                  className="w-full"
                  onClick={() => handleSelectPlan('pro')}
                >
                  Get Started with {seats} {seats === 1 ? 'Seat' : 'Seats'}
                </Button>
              </>
            ) : (
              <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 p-6 rounded-lg border-2 border-purple-500/20">
                <div className="flex items-start gap-4">
                  <Crown className="h-8 w-8 text-purple-600 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-bold mb-2">Enterprise Pricing</h3>
                    <p className="text-muted-foreground mb-4">
                      For teams with 50+ seats, we offer custom enterprise pricing with volume discounts,
                      dedicated support, and tailored solutions.
                    </p>
                    <Button
                      size="lg"
                      variant="default"
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
        <div className="max-w-4xl mx-auto mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">Pricing Tiers</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <Badge className="w-fit mb-2" variant="secondary">1 Seat</Badge>
                <CardTitle className="text-3xl font-bold">$30<span className="text-base font-normal text-muted-foreground">/mo</span></CardTitle>
                <CardDescription>Perfect for solo professionals</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Get started with all features for individual use.
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary border-2">
              <CardHeader>
                <Badge className="w-fit mb-2">2-10 Seats</Badge>
                <CardTitle className="text-3xl font-bold">$25<span className="text-base font-normal text-muted-foreground">/seat/mo</span></CardTitle>
                <CardDescription>Best for small teams</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  16% savings for growing teams. $50-$250/month total.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Badge className="w-fit mb-2" variant="default">11-49 Seats</Badge>
                <CardTitle className="text-3xl font-bold">$20<span className="text-base font-normal text-muted-foreground">/seat/mo</span></CardTitle>
                <CardDescription>Great for larger teams</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  33% savings for established teams. $220-$980/month total.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features Included */}
        <Card className="max-w-4xl mx-auto mb-12">
          <CardHeader>
            <CardTitle className="text-2xl">Everything Included</CardTitle>
            <CardDescription>All features are available in every plan. No upsells.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-green-600">
                  <Check className="h-5 w-5" />
                  Included Features
                </h3>
                <ul className="space-y-2">
                  {features.included.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-muted-foreground">
                  <X className="h-5 w-5" />
                  Enterprise Only
                </h3>
                <ul className="space-y-2">
                  {features.notIncluded.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Crown className="h-4 w-4 text-purple-600 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
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
              <Card key={idx}>
                <CardHeader>
                  <CardTitle className="text-base">{faq.q}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

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
