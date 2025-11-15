// Enhance Profile Component - LinkedIn & GitHub OAuth Integration
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { apiService } from '../../services/api';
import { API_BASE_URL } from '../../utils/constants';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';

const EnhanceProfile = ({ employeeId, onEnrichmentComplete }) => {
  const [linkedInStatus, setLinkedInStatus] = useState('disconnected'); // disconnected, connecting, connected
  const [githubStatus, setGithubStatus] = useState('disconnected');
  const [linkedInData, setLinkedInData] = useState(null);
  const [githubData, setGithubData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const checkConnectionStatus = useCallback(async () => {
    try {
      setLoading(true);
      
      // Check connection status (without fetching data)
      const statusResult = await apiService.getConnectionStatus(employeeId);
      
      if (statusResult.data && statusResult.data.data) {
        const status = statusResult.data.data;
        
        // Set connection status
        setLinkedInStatus(status.linkedin ? 'connected' : 'disconnected');
        setGithubStatus(status.github ? 'connected' : 'disconnected');
        
        // If connected, try to fetch data for display
        if (status.linkedin) {
          try {
            const linkedInDataResult = await apiService.fetchLinkedInData(employeeId);
            if (linkedInDataResult.data && linkedInDataResult.data.data) {
              setLinkedInData(linkedInDataResult.data.data);
            }
          } catch (err) {
            console.warn('Could not fetch LinkedIn data:', err);
            // Keep status as connected even if data fetch fails
          }
        }
        
        if (status.github) {
          try {
            const githubDataResult = await apiService.fetchGitHubData(employeeId);
            if (githubDataResult.data && githubDataResult.data.data) {
              setGithubData(githubDataResult.data.data);
            }
          } catch (err) {
            console.warn('Could not fetch GitHub data:', err);
            // Keep status as connected even if data fetch fails
          }
        }
      } else {
        setLinkedInStatus('disconnected');
        setGithubStatus('disconnected');
      }
    } catch (error) {
      console.error('Error checking connection status:', error);
      setLinkedInStatus('disconnected');
      setGithubStatus('disconnected');
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  // Check connection status on mount
  useEffect(() => {
    checkConnectionStatus();
  }, [checkConnectionStatus]);

  // Prevent multiple simultaneous calls to handleFetchData
  const isFetchingData = useRef(false);
  const enrichmentTriggered = useRef(false);

  const handleFetchData = useCallback(async () => {
    // Prevent multiple simultaneous calls
    if (isFetchingData.current) {
      console.log('[EnhanceProfile] Already fetching data, skipping...');
      return;
    }

    // Prevent multiple enrichment triggers
    if (enrichmentTriggered.current) {
      console.log('[EnhanceProfile] Enrichment already triggered, skipping...');
      return;
    }

    try {
      isFetchingData.current = true;
      setLoading(true);
      setError(null);
      console.log('[EnhanceProfile] Starting data collection for employee:', employeeId);

      // Collect all external data (this also triggers Gemini enrichment)
      const response = await apiService.collectAllExternalData(employeeId);
      console.log('[EnhanceProfile] Collect response:', {
        success: response.data?.success,
        hasLinkedIn: !!response.data?.data?.linkedin,
        hasGitHub: !!response.data?.data?.github,
        enrichment: response.data?.enrichment ? {
          hasBio: !!response.data.enrichment.bio,
          projectsCount: response.data.enrichment.projects?.length || 0,
          error: response.data.enrichment.error
        } : null
      });
      
      if (response.data && response.data.data) {
        const { linkedin, github } = response.data.data;

        if (linkedin && !linkedin.error) {
          setLinkedInStatus('connected');
          setLinkedInData(linkedin);
        }

        if (github && !github.error) {
          setGithubStatus('connected');
          setGithubData(github);
        }

        // Check enrichment result - AUTOMATIC ENRICHMENT AFTER CONNECTION
        const enrichment = response.data.enrichment;
        if (enrichment) {
          if (enrichment.error) {
            console.error('[EnhanceProfile] Enrichment error:', enrichment.error);
            setError(`Enrichment failed: ${enrichment.error}. Please try again.`);
          } else {
            console.log('[EnhanceProfile] ✅ Automatic enrichment successful:', {
              hasBio: !!enrichment.bio,
              projectsCount: enrichment.projects?.length || 0,
              skillsCount: enrichment.skills?.length || 0
            });
            setSuccessMessage('✅ Profile enriched and approved automatically! Redirecting to your complete profile...');
            
            // Mark enrichment as triggered to prevent multiple calls
            enrichmentTriggered.current = true;
            
            // Trigger enrichment complete callback - profile is now enriched and approved
            if (linkedInStatus === 'connected' && githubStatus === 'connected' && onEnrichmentComplete) {
              // Wait a bit for processed data to be available and profile status to update
              setTimeout(() => {
                if (onEnrichmentComplete) {
                  console.log('[EnhanceProfile] Triggering enrichment complete callback - profile is now enriched and approved');
                  onEnrichmentComplete();
                }
              }, 3000); // Increased delay to ensure backend processing is complete
            }
          }
        } else {
          // If no enrichment result but both are connected, still trigger callback (only once)
          if (linkedInStatus === 'connected' && githubStatus === 'connected' && !enrichmentTriggered.current && onEnrichmentComplete) {
            enrichmentTriggered.current = true;
            console.log('[EnhanceProfile] Both connected but enrichment not yet complete, waiting...');
            // Wait longer for enrichment to complete
            setTimeout(() => {
              if (onEnrichmentComplete) {
                console.log('[EnhanceProfile] Triggering callback after delay');
                onEnrichmentComplete();
              }
            }, 5000);
          }
        }
      }
    } catch (error) {
      console.error('[EnhanceProfile] Error fetching external data:', error);
      setError('Failed to fetch profile data. Please try again.');
      // Reset on error to allow retry
      isFetchingData.current = false;
    } finally {
      setLoading(false);
      isFetchingData.current = false;
    }
  }, [employeeId, linkedInStatus, githubStatus, onEnrichmentComplete]);

  // Check if both LinkedIn and GitHub are connected (both required)
  const hasCalledComplete = useRef(false);
  useEffect(() => {
    // Both LinkedIn and GitHub are required
    if (linkedInStatus === 'connected' && githubStatus === 'connected' && !hasCalledComplete.current && !enrichmentTriggered.current) {
      hasCalledComplete.current = true;
      // Automatically trigger enrichment after both are connected
      // Note: handleFetchData will call onEnrichmentComplete, so we don't need to call it here
      handleFetchData();
    }
    // Reset if either disconnected
    if (linkedInStatus !== 'connected' || githubStatus !== 'connected') {
      hasCalledComplete.current = false;
      enrichmentTriggered.current = false;
    }
  }, [linkedInStatus, githubStatus, handleFetchData]);


  const handleLinkedInConnect = async () => {
    try {
      setLoading(true);
      setError(null);
      setLinkedInStatus('connecting');
      
      if (!API_BASE_URL) {
        throw new Error('API base URL not configured');
      }
      
      // If already connected, disconnect first to force fresh OAuth
      if (linkedInStatus === 'connected') {
        try {
          await apiService.disconnectProvider(employeeId, 'linkedin');
          console.log('[EnhanceProfile] Disconnected LinkedIn for reconnect');
        } catch (disconnectError) {
          console.warn('[EnhanceProfile] Failed to disconnect LinkedIn (non-critical):', disconnectError.message);
          // Continue anyway - will try to reconnect
        }
      }
      
      // Direct redirect to LinkedIn OAuth (same pattern as GitHub)
      const authorizeEndpoint = `${API_BASE_URL}/external/linkedin/authorize/${employeeId}?mode=redirect`;
      window.location.href = authorizeEndpoint;
    } catch (error) {
      console.error('Error initiating LinkedIn auth:', error);
      setError('Failed to connect LinkedIn. Please try again.');
      setLinkedInStatus('disconnected');
      setLoading(false);
    }
  };

  const handleGitHubConnect = async () => {
    try {
      setLoading(true);
      setError(null);
      setGithubStatus('connecting');
      
      if (!API_BASE_URL) {
        throw new Error('API base URL not configured');
      }
      
      // If already connected, disconnect first to force fresh OAuth
      if (githubStatus === 'connected') {
        try {
          await apiService.disconnectProvider(employeeId, 'github');
          console.log('[EnhanceProfile] Disconnected GitHub for reconnect');
        } catch (disconnectError) {
          console.warn('[EnhanceProfile] Failed to disconnect GitHub (non-critical):', disconnectError.message);
          // Continue anyway - will try to reconnect
        }
      }
      
      const authorizeEndpoint = `${API_BASE_URL}/external/github/authorize/${employeeId}?mode=redirect`;
      window.location.href = authorizeEndpoint;
    } catch (error) {
      console.error('Error initiating GitHub auth:', error);
      setError('Failed to connect GitHub. Please try again.');
      setGithubStatus('disconnected');
      setLoading(false);
    }
  };

  const handleDisconnect = async (provider) => {
    if (!window.confirm(`Are you sure you want to disconnect ${provider}? You will need to reconnect to use this service again.`)) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await apiService.disconnectProvider(employeeId, provider);
      
      // Update status
      if (provider === 'linkedin') {
        setLinkedInStatus('disconnected');
        setLinkedInData(null);
      } else if (provider === 'github') {
        setGithubStatus('disconnected');
        setGithubData(null);
      }
      
      setSuccessMessage(`${provider} disconnected successfully`);
      
      // Refresh connection status
      await checkConnectionStatus();
    } catch (error) {
      console.error(`Error disconnecting ${provider}:`, error);
      setError(`Failed to disconnect ${provider}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };


  // Check URL params for OAuth callback success
  const urlParamsProcessed = useRef(false);
  useEffect(() => {
    // Only process URL params once
    if (urlParamsProcessed.current) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const linkedInParam = urlParams.get('linkedin');
    const githubParam = urlParams.get('github');
    const errorParam = urlParams.get('error');

    if (errorParam) {
      setError(decodeURIComponent(errorParam));
      urlParamsProcessed.current = true;
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (linkedInParam === 'connected') {
      setLinkedInStatus('connected');
      setSuccessMessage('LinkedIn connected successfully!');
      urlParamsProcessed.current = true;
      // Only fetch data if not already fetching and enrichment not triggered
      if (!isFetchingData.current && !enrichmentTriggered.current) {
        handleFetchData();
      }
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (githubParam === 'connected') {
      setGithubStatus('connected');
      setSuccessMessage('GitHub connected successfully!');
      urlParamsProcessed.current = true;
      // Only fetch data if not already fetching and enrichment not triggered
      if (!isFetchingData.current && !enrichmentTriggered.current) {
        handleFetchData();
      }
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [handleFetchData]);

  const isBothConnected = linkedInStatus === 'connected' && githubStatus === 'connected';

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Enhance My Profile</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-700">
          {successMessage}
        </div>
      )}

      <p className="text-gray-600 mb-6">
        <strong className="text-red-600">Required:</strong> Connect both LinkedIn and GitHub accounts to enrich your profile with your professional data, 
        work experience, projects, and skills. This information will be automatically processed and used to enhance your profile.
      </p>

      <div className="space-y-4">
        {/* LinkedIn Connection (Required - Step 1) */}
        <div className={`border-2 rounded-lg p-4 ${
          linkedInStatus === 'connected' 
            ? 'border-green-500 bg-green-50' 
            : linkedInStatus === 'connecting'
            ? 'border-blue-500 bg-blue-50'
            : 'border-red-500 bg-red-50'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white font-bold">in</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">
                  LinkedIn <span className="text-xs text-red-600 font-bold">(Required - Step 1)</span>
                </h3>
                <p className="text-sm text-gray-500">
                  {linkedInStatus === 'connected' ? '✅ Connected' : linkedInStatus === 'connecting' ? '⏳ Connecting...' : '❌ Not connected'}
                </p>
                {linkedInStatus === 'disconnected' && (
                  <p className="text-xs text-red-600 mt-1 font-semibold">
                    ⚠️ You must connect LinkedIn first before connecting GitHub
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {linkedInStatus === 'connected' ? (
                <>
                  <span className="text-green-600 font-medium mr-2">Connected ✓</span>
                  <Button
                    onClick={handleLinkedInConnect}
                    disabled={loading || linkedInStatus === 'connecting'}
                    variant="primary"
                    className="mr-2"
                  >
                    {linkedInStatus === 'connecting' ? 'Reconnecting...' : 'Reconnect LinkedIn'}
                  </Button>
                  <Button
                    onClick={() => handleDisconnect('linkedin')}
                    disabled={loading}
                    variant="secondary"
                    className="bg-red-500 hover:bg-red-600 text-white"
                  >
                    Disconnect
                  </Button>
                </>
              ) : (
                <Button
                  onClick={handleLinkedInConnect}
                  disabled={loading || linkedInStatus === 'connecting'}
                  variant="primary"
                >
                  {linkedInStatus === 'connecting' ? 'Connecting...' : 'Connect LinkedIn'}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* GitHub Connection (Required - Step 2) */}
        <div className={`border-2 rounded-lg p-4 ${
          githubStatus === 'connected' 
            ? 'border-green-500 bg-green-50' 
            : githubStatus === 'connecting'
            ? 'border-blue-500 bg-blue-50'
            : linkedInStatus === 'connected'
            ? 'border-yellow-500 bg-yellow-50'
            : 'border-gray-300 bg-gray-100'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-800 rounded flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.197 22 16.425 22 12.017 22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">
                  GitHub <span className="text-xs text-red-600 font-bold">(Required - Step 2)</span>
                </h3>
                <p className="text-sm text-gray-500">
                  {githubStatus === 'connected' ? '✅ Connected' : githubStatus === 'connecting' ? '⏳ Connecting...' : linkedInStatus === 'connected' ? '⏸️ Waiting for connection' : '🔒 Locked - Connect LinkedIn first'}
                </p>
                {linkedInStatus !== 'connected' && (
                  <p className="text-xs text-red-600 mt-1 font-semibold">
                    ⚠️ You must connect LinkedIn first
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {githubStatus === 'connected' ? (
                <>
                  <span className="text-green-600 font-medium mr-2">Connected ✓</span>
                  <Button
                    onClick={handleGitHubConnect}
                    disabled={loading || githubStatus === 'connecting'}
                    variant="primary"
                    className="mr-2"
                  >
                    {githubStatus === 'connecting' ? 'Reconnecting...' : 'Reconnect GitHub'}
                  </Button>
                  <Button
                    onClick={() => handleDisconnect('github')}
                    disabled={loading}
                    variant="secondary"
                    className="bg-red-500 hover:bg-red-600 text-white"
                  >
                    Disconnect
                  </Button>
                </>
              ) : (
                <Button
                  onClick={handleGitHubConnect}
                  disabled={loading || githubStatus === 'connecting' || linkedInStatus !== 'connected'}
                  variant="primary"
                >
                  {githubStatus === 'connecting' ? 'Connecting...' : linkedInStatus !== 'connected' ? 'Connect LinkedIn First' : 'Connect GitHub'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Data Preview */}
      {(linkedInData || githubData) && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-3">Imported Data Preview</h3>
          
          {linkedInData && linkedInData.profile && (
            <div className="mb-3">
              <p className="text-sm font-medium text-gray-700">LinkedIn:</p>
              <p className="text-sm text-gray-600">
                {linkedInData.profile.localizedFirstName} {linkedInData.profile.localizedLastName}
              </p>
            </div>
          )}

          {githubData && githubData.profile && (
            <div className="mb-3">
              <p className="text-sm font-medium text-gray-700">GitHub:</p>
              <p className="text-sm text-gray-600">
                {githubData.profile.name || githubData.profile.login}
                {githubData.repositories && ` • ${githubData.repositories.length} repositories`}
              </p>
            </div>
          )}

          <p className="text-xs text-gray-500 mt-3">
            Your data is used securely within the system to enhance your profile and skill analysis.
          </p>
        </div>
      )}

      {loading && (
        <div className="mt-4 flex justify-center">
          <LoadingSpinner />
        </div>
      )}

      {isBothConnected && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700 font-medium">
            ✓ Profile Enriched Successfully — your LinkedIn and GitHub data has been imported.
          </p>
        </div>
      )}
    </div>
  );
};

export default EnhanceProfile;

