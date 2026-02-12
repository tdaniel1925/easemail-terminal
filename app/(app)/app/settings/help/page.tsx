'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Download, ExternalLink } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function HelpPage() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserRole();
  }, []);

  const fetchUserRole = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user's organization role
      const { data: orgMembership } = await supabase
        .from('organization_members')
        .select('role')
        .eq('user_id', user.id)
        .eq('status', 'ACTIVE')
        .maybeSingle() as { data: { role: string } | null };

      if (orgMembership) {
        setUserRole(orgMembership.role);
      }
    } catch (error) {
      console.error('Failed to fetch user role:', error);
    } finally {
      setLoading(false);
    }
  };

  const isOrgAdmin = userRole && ['OWNER', 'ADMIN'].includes(userRole);

  const openGuide = (guideType: 'user' | 'admin') => {
    const url = guideType === 'user'
      ? '/api/guides/user?format=html'
      : '/api/guides/admin?format=html';
    window.open(url, '_blank');
  };

  const downloadGuide = (guideType: 'user' | 'admin') => {
    const url = guideType === 'user'
      ? '/api/guides/user?format=pdf'
      : '/api/guides/admin?format=pdf';

    const link = document.createElement('a');
    link.href = url;
    link.download = guideType === 'user'
      ? 'EaseMail-User-Guide.pdf'
      : 'Organization-Admin-User-Guide.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Help & Guides</h2>
        <p className="text-muted-foreground">
          Comprehensive documentation and troubleshooting guides
        </p>
      </div>

      {/* User Guide - Available to All Users */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900">
                <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle>EaseMail User Guide</CardTitle>
                <CardDescription className="mt-2">
                  Complete guide covering all features including email management, AI tools,
                  calendar integration, contacts, and comprehensive troubleshooting
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-4 rounded-lg bg-muted">
                <h4 className="font-semibold mb-2">What's Included:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Getting Started & Setup</li>
                  <li>• Email Basics & Organization</li>
                  <li>• AI Features (Compose, Remix, Dictate)</li>
                  <li>• Calendar & MS Teams Integration</li>
                  <li>• Contacts Management</li>
                  <li>• Settings & Preferences</li>
                  <li>• Keyboard Shortcuts</li>
                  <li>• Comprehensive Troubleshooting</li>
                  <li>• FAQ (60+ Questions)</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <h4 className="font-semibold mb-2">Perfect For:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✓ New users getting started</li>
                  <li>✓ Learning advanced features</li>
                  <li>✓ Troubleshooting issues</li>
                  <li>✓ Keyboard shortcut reference</li>
                  <li>✓ AI features tutorial</li>
                  <li>✓ Calendar setup & usage</li>
                </ul>
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => openGuide('user')} className="gap-2">
                <ExternalLink className="h-4 w-4" />
                Open User Guide
              </Button>
              <Button onClick={() => downloadGuide('user')} variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Organization Admin Guide - Only for OWNER and ADMIN */}
      {isOrgAdmin && (
        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-blue-600">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle>Organization Admin User Guide</CardTitle>
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-600 text-white">
                      ADMIN ONLY
                    </span>
                  </div>
                  <CardDescription className="mt-2">
                    Comprehensive guide for organization administrators covering team management,
                    user administration, billing, and advanced settings
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-4 rounded-lg bg-muted">
                  <h4 className="font-semibold mb-2">What's Included:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Organization Setup & Management</li>
                    <li>• Team Member Management</li>
                    <li>• Add User vs Invite Member</li>
                    <li>• Role & Permission Management</li>
                    <li>• Billing & Seat Management</li>
                    <li>• Shared Email Accounts</li>
                    <li>• Audit Logs & Security</li>
                    <li>• Advanced Troubleshooting</li>
                    <li>• Best Practices & Workflows</li>
                  </ul>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <h4 className="font-semibold mb-2">Admin Features:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>✓ User management workflows</li>
                    <li>✓ Seat limit management</li>
                    <li>✓ Custom folder workflows</li>
                    <li>✓ MS Teams calendar integration</li>
                    <li>✓ Security best practices</li>
                    <li>✓ Troubleshooting admin issues</li>
                  </ul>
                </div>
              </div>
              <div className="flex gap-3">
                <Button onClick={() => openGuide('admin')} className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Open Admin Guide
                </Button>
                <Button onClick={() => downloadGuide('admin')} variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Help Resources */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Resources</CardTitle>
          <CardDescription>
            More ways to get help and learn about EaseMail
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <h4 className="font-medium">Quick Start Video</h4>
                <p className="text-sm text-muted-foreground">
                  5-minute walkthrough of EaseMail basics
                </p>
              </div>
              <Button variant="ghost" size="sm">Coming Soon</Button>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <h4 className="font-medium">Support Center</h4>
                <p className="text-sm text-muted-foreground">
                  Get help from our support team
                </p>
              </div>
              <Button variant="ghost" size="sm">Coming Soon</Button>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <h4 className="font-medium">Community Forum</h4>
                <p className="text-sm text-muted-foreground">
                  Connect with other EaseMail users
                </p>
              </div>
              <Button variant="ghost" size="sm">Coming Soon</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
