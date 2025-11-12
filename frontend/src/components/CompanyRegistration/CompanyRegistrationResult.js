// Company Registration Step 3 - Verification Result
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '../common/Button';
import { ROUTES } from '../../utils/constants';

const CompanyRegistrationResult = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const status = location.state?.status || 'success';

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-primary-cyan">Step 3 of 4</span>
            <span className="text-sm text-gray-500">Verification Result</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-primary-cyan h-2 rounded-full" style={{ width: '75%' }} />
          </div>
        </div>

        {/* Result Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 text-center">
          {status === 'success' ? (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Verification Successful!
              </h2>
              <p className="text-gray-600 mb-6">
                Your company domain has been verified. You can now proceed with the full company setup.
              </p>
              <Button
                variant="primary"
                onClick={() => navigate(ROUTES.COMPANY_REGISTER_STEP4)}
              >
                Continue to Setup
              </Button>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Verification Failed
              </h2>
              <p className="text-gray-600 mb-4">
                We couldn't verify your company domain. Common reasons include:
              </p>
              <ul className="text-left text-gray-600 mb-6 max-w-md mx-auto space-y-2">
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  <span>Domain doesn't exist or is invalid</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  <span>No email service configured for the domain</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  <span>Domain verification records not found</span>
                </li>
              </ul>
              <div className="flex gap-4 justify-center">
                <Button
                  variant="primary"
                  onClick={() => navigate(ROUTES.COMPANY_REGISTER_STEP1)}
                >
                  Try Again
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => navigate(ROUTES.HR_LANDING)}
                >
                  Contact Support
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyRegistrationResult;

