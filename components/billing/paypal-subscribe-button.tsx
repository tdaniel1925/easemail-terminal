'use client';

/**
 * PayPal Subscribe Button Component
 *
 * Renders PayPal subscription button using PayPal JavaScript SDK
 * Handles both individual and organization subscriptions
 */

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface PayPalSubscribeButtonProps {
  planId: string;
  type: 'individual' | 'organization';
  organizationId?: string;
  seats?: number;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

declare global {
  interface Window {
    paypal?: any;
  }
}

export function PayPalSubscribeButton({
  planId,
  type,
  organizationId,
  seats,
  onSuccess,
  onError,
}: PayPalSubscribeButtonProps) {
  const router = useRouter();
  const buttonContainerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Load PayPal SDK
  useEffect(() => {
    if (scriptLoaded) return;

    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&vault=true&intent=subscription`;
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => {
      toast.error('Failed to load PayPal SDK');
      setScriptLoaded(false);
    };

    document.body.appendChild(script);

    return () => {
      // Cleanup if needed
    };
  }, [scriptLoaded]);

  // Render PayPal button once SDK is loaded
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!scriptLoaded || !buttonContainerRef.current || !window.paypal) return;

    // Clear previous button
    buttonContainerRef.current.innerHTML = '';

    window.paypal
      .Buttons({
        style: {
          shape: 'rect',
          color: 'gold',
          layout: 'vertical',
          label: 'subscribe',
        },
        createSubscription: async function (data: any, actions: any) {
          setIsLoading(true);

          try {
            // Call our API to create the subscription
            const endpoint =
              type === 'individual'
                ? '/api/billing/individual/create'
                : '/api/billing/organization/create';

            const body =
              type === 'individual'
                ? {}
                : { organizationId, seats };

            const response = await fetch(endpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(body),
            });

            const result = await response.json();

            if (!response.ok) {
              throw new Error(result.error || 'Failed to create subscription');
            }

            return result.subscriptionId;
          } catch (error: any) {
            console.error('Error creating subscription:', error);
            toast.error(error.message || 'Failed to create subscription');
            setIsLoading(false);
            if (onError) onError(error);
            throw error;
          }
        },
        onApprove: async function (data: any) {
          try {
            // Call our API to approve the subscription
            const endpoint =
              type === 'individual'
                ? '/api/billing/individual/approve'
                : '/api/billing/organization/approve';

            const response = await fetch(endpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                subscriptionId: data.subscriptionID,
                subscriberId: data.subscriberID || data.facilitatorAccessToken,
              }),
            });

            const result = await response.json();

            if (!response.ok) {
              throw new Error(result.error || 'Failed to approve subscription');
            }

            toast.success('Subscription activated successfully!');
            setIsLoading(false);

            if (onSuccess) onSuccess();

            // Redirect to appropriate page
            if (type === 'individual') {
              router.push('/app/settings/billing?success=true');
            } else {
              router.push('/app/settings/organization/billing?success=true');
            }
          } catch (error: any) {
            console.error('Error approving subscription:', error);
            toast.error(error.message || 'Failed to activate subscription');
            setIsLoading(false);
            if (onError) onError(error);
          }
        },
        onCancel: function () {
          toast.info('Subscription cancelled');
          setIsLoading(false);
        },
        onError: function (err: any) {
          console.error('PayPal error:', err);
          toast.error('An error occurred with PayPal');
          setIsLoading(false);
          if (onError) onError(new Error(err?.message || 'PayPal error'));
        },
      })
      .render(buttonContainerRef.current);
  }, [scriptLoaded, type, organizationId, seats, router, onSuccess, onError]);

  if (!scriptLoaded) {
    return (
      <Button disabled className="w-full">
        Loading PayPal...
      </Button>
    );
  }

  return (
    <div className="space-y-2">
      <div ref={buttonContainerRef} className="w-full" />
      {isLoading && (
        <p className="text-sm text-muted-foreground text-center">
          Processing subscription...
        </p>
      )}
    </div>
  );
}
