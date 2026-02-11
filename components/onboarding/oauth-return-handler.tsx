'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

/**
 * Client component that checks if user just returned from OAuth during onboarding
 * and redirects them back to the onboarding flow
 */
export function OAuthReturnHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if we just returned from OAuth and should check onboarding status
    const checkOnboarding = searchParams.get('check_onboarding');
    const connected = searchParams.get('connected');

    if (checkOnboarding === 'true' && connected === 'true') {
      // Check if onboarding was in progress
      const onboardingInProgress = sessionStorage.getItem('onboarding_in_progress');

      if (onboardingInProgress === 'true') {
        // Clear the flags and redirect back to onboarding
        sessionStorage.removeItem('onboarding_in_progress');
        sessionStorage.removeItem('onboarding_return_step');

        // Redirect to onboarding with success message
        router.push('/app/onboarding?email_connected=true');
      }
    }
  }, [searchParams, router]);

  return null;
}
