'use client';

import { useSearchParams } from 'next/navigation';
import { OnboardingWizard } from './onboarding-wizard';

/**
 * Wrapper component that handles search params for the onboarding wizard
 * This allows the wizard to be prerendered while still handling OAuth returns
 */
export function OnboardingWrapper() {
  const searchParams = useSearchParams();
  const emailConnected = searchParams.get('email_connected') === 'true';

  return <OnboardingWizard emailConnected={emailConnected} />;
}
