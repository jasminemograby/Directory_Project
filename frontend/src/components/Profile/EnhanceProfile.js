// Enhance Profile Component - LinkedIn & GitHub OAuth Integration
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { apiService } from '../../services/api';
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

  // Check if GitHub is connected (required) - LinkedIn is optional
  const hasCalledComplete = useRef(false);
  useEffect(() => {
    // GitHub is required, LinkedIn is optional
    if (githubStatus === 'connected' && !hasCalledComplete.current) {
      hasCalledComplete.current = true;
      if (onEnrichmentComplete) {
        onEnrichmentComplete();
      }
    }
    // Reset if GitHub disconnected
    if (githubStatus !== 'connected') {
      hasCalledComplete.current = false;
    }
  }, [githubStatus, onEnrichmentComplete]);


  const handleLinkedInConnect = async () => {
    try {
      setLoading(true);
      setError(null);
      setLinkedInStatus('connecting');

      // Get authorization URL
      const response = await apiService.initiateLinkedInAuth(employeeId);
      
      if (response.data && response.data.data && response.data.data.authorization_url) {
        // Redirect to LinkedIn OAuth
        window.location.href = response.data.data.authorization_url;
      } else {
        throw new Error('Failed to get LinkedIn authorization URL');
      }
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

      // Get authorization URL
      const response = await apiService.initiateGitHubAuth(employeeId);
      
      if (response.data && response.data.data && response.data.data.authorization_url) {
        // Redirect to GitHub OAuth
        window.location.href = response.data.data.authorization_url;
      } else {
        throw new Error('Failed to get GitHub authorization URL');
      }
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

  const handleFetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Collect all external data
      const response = await apiService.collectAllExternalData(employeeId);
      
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

        // Show success message and trigger enrichment callback
        if ((linkedin && !linkedin.error) || (github && !github.error)) {
          setSuccessMessage('Profile enriched successfully! Your LinkedIn and GitHub data has been imported.');
          setTimeout(() => setSuccessMessage(null), 5000);
          
          // Trigger enrichment complete callback if both are connected
          if (linkedInStatus === 'connected' && githubStatus === 'connected' && onEnrichmentComplete) {
            onEnrichmentComplete();
          }
        }
      }
    } catch (error) {
      console.error('Error fetching external data:', error);
      setError('Failed to fetch profile data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  // Check URL params for OAuth callback success
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const linkedInParam = urlParams.get('linkedin');
    const githubParam = urlParams.get('github');
    const errorParam = urlParams.get('error');

    if (errorParam) {
      setError(decodeURIComponent(errorParam));
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (linkedInParam === 'connected') {
      setLinkedInStatus('connected');
      setSuccessMessage('LinkedIn connected successfully!');
      // Fetch data
      handleFetchData();
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (githubParam === 'connected') {
      setGithubStatus('connected');
      setSuccessMessage('GitHub connected successfully!');
      // Fetch data
      handleFetchData();
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
        Connect your GitHub account (required) and optionally LinkedIn to enrich your profile with your professional data, 
        skills, and projects. This information will be used to enhance your profile and skill analysis.
      </p>

      <div className="space-y-4">
        {/* LinkedIn Connection (Optional) */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white font-bold">in</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">LinkedIn <span className="text-xs text-gray-500">(Optional)</span></h3>
                <p className="text-sm text-gray-500">
                  {linkedInStatus === 'connected' ? 'Connected' : 'Not connected'}
                </p>
                {linkedInStatus === 'disconnected' && (
                  <p className="text-xs text-orange-600 mt-1">
                    Note: LinkedIn requires a Company Page. If unavailable, you can continue with GitHub only.
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {linkedInStatus === 'connected' ? (
                <>
                  <span className="text-green-600 font-medium mr-2">Connected ✓</span>
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
                >
                  {linkedInStatus === 'connecting' ? 'Connecting...' : 'Connect'}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* GitHub Connection (Required) */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-800 rounded flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.197 22 16.425 22 12.017 22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">GitHub <span className="text-xs text-red-600">(Required)</span></h3>
                <p className="text-sm text-gray-500">
                  {githubStatus === 'connected' ? 'Connected' : 'Not connected'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {githubStatus === 'connected' ? (
                <>
                  <span className="text-green-600 font-medium mr-2">Connected ✓</span>
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
                  disabled={loading || githubStatus === 'connecting'}
                >
                  {githubStatus === 'connecting' ? 'Connecting...' : 'Connect'}
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

