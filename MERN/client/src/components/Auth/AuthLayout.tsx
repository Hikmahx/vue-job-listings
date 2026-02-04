import { Link } from 'react-router-dom';
import StepIndicator from './StepIndicator';

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  showDivider?: boolean;
  currentStep?: number;
  signupPage?: boolean;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const AuthLayout = ({
  title,
  subtitle,
  showDivider = true,
  signupPage = false,
  currentStep = 1,
  children,
  footer,
}: AuthLayoutProps) => {
  return (
    <div className="flex h-screen overflow-hidden bg-cyan-50">
      {/* Left Side: Form */}
      <div
        className={`w-full lg:w-1/2 flex flex-col px-8 py-12 overflow-hidden ${
          !signupPage ? 'mt-[15%] lg:mt-[10%] pb-16' : 'pb-8'
        }`}
      >
        {/* Logo */}
        <div className="flex-shrink-0">
          <Link to="/" className="flex items-center absolute top-6 left-6">
            <img src="/logo-dark.svg" alt="JobList Logo" className="h-5" />
          </Link>
        </div>
        {/* Form Container with Scroll */}
        <div className="flex-1 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-md p-8 space-y-6 min-h-fit">
            {/* Step Indicator */}
            <StepIndicator currentStep={currentStep} signupPage={signupPage} title={title} />
            {children}
          </div>
        </div>

        {/* Footer (sticky at bottom) */}
        {footer && (
          <div className="flex-shrink-0 mt-6 text-center text-grayish-cyan">{footer}</div>
        )}
      </div>

      {/* Right Side: Cyan Container (hidden on mobile/tablet) */}
      {showDivider && (
        <div className="hidden lg:flex w-1/2 bg-cyan-400 rounded-3xl m-6 flex-col justify-between p-12 relative overflow-hidden">
          {/* Decorative Circles */}
          <div className="absolute top-10 right-20 w-24 h-24 bg-white opacity-20 rounded-full"></div>
          <div className="absolute bottom-20 left-10 w-32 h-32 bg-white opacity-10 rounded-full"></div>
          <div className="absolute top-1/2 right-10 w-20 h-20 bg-white opacity-15 rounded-full"></div>

          {/* Content */}
          <div className="relative z-10 flex flex-col justify-center items-center h-full gap-8">
            {/* Mockup Box */}
            <div className="bg-white bg-opacity-20 rounded-xl p-6 w-full max-w-xs space-y-3">
              <div className="h-6 bg-white bg-opacity-40 rounded w-20"></div>
              <div className="space-y-2">
                <div className="h-3 bg-white bg-opacity-30 rounded"></div>
                <div className="h-3 bg-white bg-opacity-30 rounded w-5/6"></div>
                <div className="h-3 bg-white bg-opacity-30 rounded w-4/5"></div>
              </div>
              <div className="flex gap-2 pt-3">
                <div className="h-4 bg-white bg-opacity-30 rounded flex-1"></div>
                <div className="h-4 bg-white bg-opacity-30 rounded flex-1"></div>
              </div>
            </div>

            {/* Text */}
            <div className="text-center text-white">
              <h2 className="text-3xl font-bold mb-4">Your next opportunity starts here</h2>
              <p className="text-lg opacity-90 leading-relaxed">
                Create your profile, showcase your skills, and connect with companies that are
                actively hiring people like you.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthLayout;
