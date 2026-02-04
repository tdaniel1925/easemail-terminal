'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, CheckCircle2, Loader2, XCircle, UserPlus, Mail, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

interface InviteDetails {
  valid: boolean;
  email: string;
  role: string;
  organizationName: string;
  expiresAt: string;
}

export default function AcceptInvitePage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [inviteDetails, setInviteDetails] = useState<InviteDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    validateInvite();
    checkAuth();
  }, [token]);

  const checkAuth = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        setIsAuthenticated(true);

        // Get user email
        const { data: userData } = (await supabase
          .from('users')
          .select('email')
          .eq('id', user.id)
          .single()) as { data: { email: string } | null };

        setUserEmail(userData?.email || null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
    }
  };

  const validateInvite = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/invites/accept?token=${token}`);
      const data = await response.json();

      if (response.ok && data.valid) {
        setInviteDetails(data);
      } else {
        setError(data.error || 'Invalid invitation');
      }
    } catch (error) {
      console.error('Validate invite error:', error);
      setError('Failed to validate invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!isAuthenticated) {
      // Store token in localStorage for after signup/login
      localStorage.setItem('pendingInviteToken', token);
      router.push('/login');
      return;
    }

    try {
      setAccepting(true);
      const response = await fetch('/api/invites/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (response.ok) {
        setAccepted(true);
        toast.success(data.message);

        // Redirect to organization page after 2 seconds
        setTimeout(() => {
          router.push(`/app/organization/${data.organizationId}`);
        }, 2000);
      } else {
        toast.error(data.error || 'Failed to accept invitation');
      }
    } catch (error) {
      console.error('Accept invite error:', error);
      toast.error('Failed to accept invitation');
    } finally {
      setAccepting(false);
    }
  };

  const handleSignup = () => {
    // Store token for after signup
    localStorage.setItem('pendingInviteToken', token);
    router.push(`/signup?email=${encodeURIComponent(inviteDetails?.email || '')}`);
  };

  const handleLogin = () => {
    // Store token for after login
    localStorage.setItem('pendingInviteToken', token);
    router.push('/login');
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return Shield;
      case 'MEMBER':
        return UserPlus;
      default:
        return UserPlus;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 pb-6 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !inviteDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl">Invalid Invitation</CardTitle>
            <CardDescription className="text-base mt-2">
              {error || 'This invitation link is invalid or has expired.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center pb-6">
            <Button onClick={() => router.push('/login')} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (accepted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Welcome Aboard!</CardTitle>
            <CardDescription className="text-base mt-2">
              You've successfully joined {inviteDetails.organizationName}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center pb-6">
            <p className="text-sm text-muted-foreground">
              Redirecting you to your organization...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const RoleIcon = getRoleIcon(inviteDetails.role);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl">You're Invited!</CardTitle>
          <CardDescription className="text-base mt-2">
            Join {inviteDetails.organizationName} on EaseMail
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pb-6">
          {/* Invitation Details */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-900">Email:</span>
              <span className="text-blue-700">{inviteDetails.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <RoleIcon className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-900">Role:</span>
              <span className="text-blue-700">{inviteDetails.role}</span>
            </div>
            <div className="text-xs text-blue-600 mt-2">
              Expires: {new Date(inviteDetails.expiresAt).toLocaleDateString()}
            </div>
          </div>

          {/* Features List */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">You'll get access to:</p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Shared team inbox and collaboration
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                AI-powered email features
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Unified calendar and SMS integration
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Team templates and signatures
              </li>
            </ul>
          </div>

          {/* Email Mismatch Warning */}
          {isAuthenticated && userEmail && userEmail !== inviteDetails.email && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> This invitation was sent to {inviteDetails.email}, but you're logged in as {userEmail}. Please log out and log in with the correct email to accept this invitation.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {isAuthenticated ? (
              <Button
                onClick={handleAccept}
                disabled={accepting || (userEmail !== inviteDetails.email)}
                className="w-full"
                size="lg"
              >
                {accepting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Accepting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Accept Invitation
                  </>
                )}
              </Button>
            ) : (
              <>
                <Button onClick={handleSignup} className="w-full" size="lg">
                  Sign Up to Accept
                </Button>
                <Button onClick={handleLogin} variant="outline" className="w-full" size="lg">
                  Already have an account? Log In
                </Button>
              </>
            )}
          </div>

          <p className="text-xs text-center text-muted-foreground">
            By accepting this invitation, you agree to join {inviteDetails.organizationName} and follow their policies.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
