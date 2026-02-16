import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Home, Search, HelpCircle, Mail, Inbox } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Card className="max-w-2xl w-full shadow-2xl">
        <CardHeader className="text-center space-y-4">
          {/* Animated 404 */}
          <div className="flex items-center justify-center">
            <h1 className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 animate-pulse">
              404
            </h1>
          </div>

          <CardTitle className="text-3xl">Page Not Found</CardTitle>
          <CardDescription className="text-lg">
            Oops! The page you're looking for doesn't exist or has been moved.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Helpful links */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">
              Here are some helpful links instead:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link href="/app/home" className="group">
                <div className="p-4 border rounded-lg hover:border-primary hover:bg-accent transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                      <Home className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Dashboard</p>
                      <p className="text-xs text-muted-foreground">Go to home</p>
                    </div>
                  </div>
                </div>
              </Link>

              <Link href="/app/inbox" className="group">
                <div className="p-4 border rounded-lg hover:border-primary hover:bg-accent transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                      <Inbox className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-medium">Inbox</p>
                      <p className="text-xs text-muted-foreground">Check emails</p>
                    </div>
                  </div>
                </div>
              </Link>

              <Link href="/app/help" className="group">
                <div className="p-4 border rounded-lg hover:border-primary hover:bg-accent transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition-colors">
                      <HelpCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="font-medium">Help Center</p>
                      <p className="text-xs text-muted-foreground">Get support</p>
                    </div>
                  </div>
                </div>
              </Link>

              <a href="mailto:support@easemail.app" className="group">
                <div className="p-4 border rounded-lg hover:border-primary hover:bg-accent transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors">
                      <Mail className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="font-medium">Contact Support</p>
                      <p className="text-xs text-muted-foreground">Email us</p>
                    </div>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-2 justify-center">
          <Link href="/app/home">
            <Button className="gap-2 w-full sm:w-auto">
              <Home className="h-4 w-4" />
              Go to Dashboard
            </Button>
          </Link>
          <Link href="/app/inbox">
            <Button variant="outline" className="gap-2 w-full sm:w-auto">
              <Inbox className="h-4 w-4" />
              Go to Inbox
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

// SEO metadata
export const metadata = {
  title: 'Page Not Found | EaseMail',
  description: 'The page you are looking for could not be found.',
  robots: {
    index: false,
    follow: false,
  },
};
