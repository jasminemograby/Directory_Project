// Company Registration Step 2 - Verification Status
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../common/LoadingSpinner';
import Button from '../common/Button';
import { apiService } from '../../services/api';
import { ROUTES } from '../../utils/constants';

const CompanyRegistrationVerification = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');
  const [emailUpdate, setEmailUpdate] = useState(false);
  const [registrationId, setRegistrationId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get registration ID from localStorage
    const regId = localStorage.getItem('companyRegistrationId');
    if (!regId) {
      navigate(ROUTES.COMPANY_REGISTER_STEP1);
      return;
    }
    setRegistrationId(regId);
    checkVerificationStatus(regId);
    
    // Poll for status updates every 10 seconds
    const interval = setInterval(() => {
      checkVerificationStatus(regId);
    }, 10000);

    return () => clearInterval(interval);
  }, [navigate]);

  const checkVerificationStatus = async (regId) => {
    if (!regId) return;
    
    setLoading(true);
    try {
      const response = await apiService.verifyCompany(regId, { checkStatus: true });
      if (response.data.success) {
        const verificationStatus = response.data.data.verification_status;
        setStatus(verificationStatus);
        setLoading(false);
        // Don't auto-redirect - let user click "Continue to Setup" button
      }
    } catch (error) {
      console.error('Status check error:', error);
      setLoading(false);
      setStatus('error');
    }
  };

  const handleEmailUpdate = async () => {
    if (!registrationId) return;
    
    try {
      await apiService.verifyCompany(registrationId, { emailUpdate: true });
      setEmailUpdate(true);
    } catch (error) {
      console.error('Email update error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-primary-cyan">Step 2 of 3</span>
            <span className="text-sm text-gray-500">Verification</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-primary-cyan h-2 rounded-full" style={{ width: '66%' }} />
          </div>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 text-center">
          {loading || status === 'verifying' || status === 'pending' ? (
            <>
              <LoadingSpinner size="xl" className="mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Verification in Progress...
              </h2>
              <p className="text-gray-600 mb-6">
                We're verifying your company domain. This may take a few minutes.
              </p>
              
              <div className="mt-6">
                <label className="flex items-center justify-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailUpdate}
                    onChange={(e) => {
                      setEmailUpdate(e.target.checked);
                      if (e.target.checked) handleEmailUpdate();
                    }}
                    className="w-4 h-4 text-primary-cyan border-gray-300 rounded focus:ring-primary-cyan"
                  />
                  <span className="text-sm text-gray-600">
                    Send me an email when verification is complete
                  </span>
                </label>
              </div>
            </>
          ) : status === 'verified' ? (
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
                onClick={() => navigate(ROUTES.COMPANY_REGISTER_STEP3)}
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
              <p className="text-gray-600 mb-6">
                We couldn't verify your company domain. Please check and try again.
              </p>
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

export default CompanyRegistrationVerification;

