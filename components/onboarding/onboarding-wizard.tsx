'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { WelcomeStep } from './steps/welcome';
import { ProfilePictureStep } from './steps/profile-picture';
import { EmailConnectionStep } from './steps/email-connection';
import { SignatureSetupStep } from './steps/signature-setup';
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
  profile_picture_uploaded?: boolean;
  profile_picture_url?: string;
  email_accounts_connected?: number;
  signatures_created?: number;
};

export function OnboardingWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    ai_features_enabled: true,
    auto_categorize: true,
  });
  const [saving, setSaving] = useState(false);

  // Check if user just returned from OAuth and show success message
  useEffect(() => {
    const emailConnected = searchParams.get('email_connected');
    if (emailConnected === 'true') {
      toast.success('Email account connected successfully!');

      // Set current step to email connection step (index 2) if not already there
      const emailStepIndex = 2; // EmailConnectionStep is at index 2
      if (currentStep !== emailStepIndex) {
        setCurrentStep(emailStepIndex);
      }

      // Clean up URL
      const url = new URL(window.location.href);
      url.searchParams.delete('email_connected');
      window.history.replaceState({}, '', url);
    }
  }, [searchParams, currentStep]);

  const steps = [
    { component: WelcomeStep, title: 'Welcome' },
    { component: ProfilePictureStep, title: 'Profile Picture' },
    { component: EmailConnectionStep, title: 'Connect Email' },
    { component: SignatureSetupStep, title: 'Email Signatures' },
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
