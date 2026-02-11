import { Suspense } from 'react';
import { OnboardingWrapper } from '@/components/onboarding/onboarding-wrapper';
import { OnboardingWizard } from '@/components/onboarding/onboarding-wizard';

export default function OnboardingPage() {
  return (
    <Suspense fallback={<OnboardingWizard />}>
      <OnboardingWrapper />
    </Suspense>
  );
}
