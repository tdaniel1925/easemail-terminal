export function OnboardingProgress({
  currentStep,
  totalSteps,
  stepTitle,
}: {
  currentStep: number;
  totalSteps: number;
  stepTitle: string;
}) {
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-white">
        <span className="text-sm font-medium">{stepTitle}</span>
        <span className="text-sm">
          {currentStep + 1} of {totalSteps}
        </span>
      </div>
      <div className="h-2 bg-white/20 rounded-full overflow-hidden">
        <div
          className="h-full bg-white transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
