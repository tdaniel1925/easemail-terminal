import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Mail } from 'lucide-react';

export default function VerifyEmailPage() {
  return (
    <Card>
      <CardHeader className="space-y-1">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <CardTitle className="text-2xl text-center">Check your email</CardTitle>
        <CardDescription className="text-center">
          We've sent you a verification link
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-center text-muted-foreground">
          Click the link in the email we sent you to verify your account and get started with EaseMail.
        </p>
        <p className="text-sm text-center text-muted-foreground">
          Didn't receive the email? Check your spam folder or contact support.
        </p>
        <div className="flex justify-center pt-4">
          <Link href="/login">
            <Button variant="outline">
              Back to Login
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
