'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { WelcomeStep } from './steps/welcome';
import { CompleteStep } from './steps/complete';
import { OnboardingProgress } from './onboarding-progress';
import { toast } from 'sonner';

export type OnboardingData = {
  use_case?: 'work' | 'personal' | 'both';
  ai_features_enabled?: boolean;
  auto_categorize?: boolean;
  notification_schedule?: {
    morning?: { enabled: boolean; time: string };
    afternoon?: { enabled: boolean; time: string };
    evening?: { enabled: boolean; time: string };
  };
};

export function OnboardingWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    ai_features_enabled: true,
    auto_categorize: true,
  });
  const [saving, setSaving] = useState(false);

  const steps = [
    { component: WelcomeStep, title: 'Welcome' },
    { component: CompleteStep, title: 'Complete' },
  ];

  const CurrentStepComponent = steps[currentStep].component;

  const handleNext = (stepData: Partial<OnboardingData>) => {
    const newData = { ...data, ...stepData };
    setData(newData);

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete(newData);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async (finalData: OnboardingData) => {
    try {
      setSaving(true);
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalData),
      });

      if (response.ok) {
        toast.success('Welcome to EaseMail!');

        // Check for pending organization invite
        const { checkAndAcceptPendingInvite } = await import('@/lib/invites/client');
        const inviteResult = await checkAndAcceptPendingInvite();

        if (inviteResult.accepted && inviteResult.organizationId) {
          toast.success(`You've been added to ${inviteResult.organizationName}!`);
          // Redirect to organization page
          router.push(`/app/organization/${inviteResult.organizationId}`);
        } else {
          // Normal flow - redirect to home
          router.push('/app/home');
        }

        router.refresh();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to complete onboarding');
      }
    } catch (error) {
      console.error('Onboarding error:', error);
      toast.error('Failed to complete onboarding');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-onboarding flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <OnboardingProgress
          currentStep={currentStep}
          totalSteps={steps.length}
          stepTitle={steps[currentStep].title}
        />

        <div className="mt-8">
          <CurrentStepComponent
            data={data}
            onNext={handleNext}
            onBack={currentStep > 0 ? handleBack : undefined}
            saving={saving}
          />
        </div>
      </div>
    </div>
  );
}
