interface FormNavigationProps {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  isLoading?: boolean;
  backLabel?: string;
  nextLabel?: string;
  submitLabel?: string;
}

const FormNavigation = ({
  currentStep,
  totalSteps,
  onBack,
  isLoading = false,
  backLabel = 'Back',
  nextLabel = 'Next Step',
  submitLabel = 'Complete',
}: FormNavigationProps) => {
  const isLastStep = currentStep === totalSteps;
  const buttonLabel = isLastStep ? submitLabel : nextLabel;

  return (
    <div className="flex gap-3 pt-4">
      {currentStep > 1 && (
        <button
          type="button"
          onClick={onBack}
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-cyan-900 font-semibold py-3 rounded-lg transition"
        >
          {backLabel}
        </button>
      )}
      <button
        type="submit"
        disabled={isLoading}
        className={`flex-1 bg-cyan-900 hover:bg-opacity-90 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 ${
          currentStep === 1 ? 'w-full' : ''
        }`}
      >
        {isLoading ? 'Completing...' : buttonLabel}
      </button>
    </div>
  );
};

export default FormNavigation;
