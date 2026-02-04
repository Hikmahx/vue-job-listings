interface StepIndicatorProps {
  currentStep: number;
  signupPage: boolean;
  title: string;
}

const StepIndicator = ({ currentStep, signupPage, title }: StepIndicatorProps) => {
  const getStepLabel = (step: number) => {
    if (step === 1) return 'Sign Up';
    if (step === 2) return 'Account Type';
    if (step === 3) return 'Profile Details';
    return '';
  };

  const getStepTitle = () => {
    if (currentStep === 1) return 'Create Account';
    if (currentStep === 2) return 'Choose an Account';
    if (currentStep === 3) return 'Complete Registration';
    return title;
  };

  const isStepCompleted = (step: number) => {
    if (step === 1) return currentStep > 0;
    if (step === 2) return currentStep > 1;
    if (step === 3) return currentStep > 2;
    return false;
  };

  return (
    <div className="space-y-8">
      {signupPage && (
        <div className="flex items-center justify-start gap-4 border-b pb-5 pt-8">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-7 h-7 rounded-md flex items-center justify-center text-xs transition-all ${
                  currentStep === step || currentStep > step
                    ? 'bg-cyan-400 text-white font-semibold'
                    : 'bg-gray-300 text-grayish-cyan font-thin'
                }`}
              >
                {step}
              </div>
              <div
                className={`ml-2 text-xs ${
                  isStepCompleted(step) ? 'text-cyan-900' : 'text-grayish-cyan'
                }`}
              >
                {getStepLabel(step)}
              </div>
            </div>
          ))}
        </div>
      )}
      {signupPage && (
        <div>
          <p className="text-xs text-grayish-cyan mb-3">Step {currentStep}/3</p>
          <h1 className="text-4xl font-semibold text-cyan-900 mb-9">{getStepTitle()}</h1>
        </div>
      )}
      {!signupPage && (
        <div>
          <h1 className="text-4xl font-semibold text-cyan-900 mb-9">{title}</h1>
        </div>
      )}
    </div>
  );
};

export default StepIndicator;
