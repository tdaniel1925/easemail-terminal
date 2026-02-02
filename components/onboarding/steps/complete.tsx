import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Loader2 } from 'lucide-react';

export function CompleteStep({ onNext, saving }: any) {
  return (
    <Card className="border-0 shadow-2xl">
      <CardContent className="p-8 space-y-6 text-center">
        <div className="w-20 h-20 mx-auto bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold">You're all set!</h1>
          <p className="text-muted-foreground">
            Let's start making email easier for you
          </p>
        </div>

        <Button
          className="w-full"
          size="lg"
          onClick={() => onNext({})}
          disabled={saving}
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Setting up...
            </>
          ) : (
            'Go to Dashboard'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
