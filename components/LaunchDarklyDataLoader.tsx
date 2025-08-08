'use client';
import { useState } from 'react';

interface LaunchDarklyData {
  identity: {
    accountId?: string;
    projectId?: string;
    projectName?: string;
    environmentId?: string;
    environmentName?: string;
    authKind?: string;
    tokenKind?: string;
    clientId?: string;
    memberId?: string;
    serviceToken?: boolean;
  };
  flags: Array<{
    name: string;
    key: string;
    archived: boolean;
  }>;
  projects: Array<{
    name: string;
    key: string;
  }>;
  summary: {
    totalFlags: number;
    totalProjects: number;
    currentProject?: string;
    currentEnvironment?: string;
  };
}

interface LaunchDarklyDataLoaderProps {
  sessionId: string;
}

export default function LaunchDarklyDataLoader({ sessionId }: LaunchDarklyDataLoaderProps) {
  const [ldData, setLdData] = useState<LaunchDarklyData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const loadLaunchDarklyData = async () => {
    setIsLoading(true);
    setError('');

    try {
      // First check if we have a token for this session
      const tokenResponse = await fetch(`/api/tokens/${sessionId}`);
      if (!tokenResponse.ok) {
        setError('No access token found. Please complete the OAuth flow first.');
        return;
      }

      const tokenData = await tokenResponse.json();
      if (!tokenData.access_token) {
        setError('No access token found. Please complete the OAuth flow first.');
        return;
      }

      // Load LaunchDarkly data
      const response = await fetch('/api/ld-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken: tokenData.access_token,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setLdData(result.data);
      } else {
        setError(result.error || 'Failed to load LaunchDarkly data');
      }
    } catch {
      setError('Failed to load LaunchDarkly data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-blue-900 mb-4">🧪 Test Your Connection</h3>
      <p className="text-blue-800 mb-4">
        Verify that your OAuth connection is working by loading data from your LaunchDarkly account.
      </p>
      
      <div className="flex gap-3">
        <button
          onClick={loadLaunchDarklyData}
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Loading...' : 'Load LaunchDarkly Data'}
        </button>
      </div>

      {/* Display LaunchDarkly Data */}
      {ldData && (
        <div className="mt-6 space-y-4">
          <div className="bg-white border border-blue-300 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-3">✅ Connection Successful!</h4>
            
            {/* Identity Info */}
            <div className="mb-4">
              <h5 className="font-medium text-gray-900 mb-2">Account Information</h5>
              <div className="text-sm space-y-1">
                <div><span className="font-medium">Account ID:</span> {ldData.identity.accountId}</div>
                <div><span className="font-medium">Project:</span> {ldData.identity.projectName || 'N/A'}</div>
                <div><span className="font-medium">Environment:</span> {ldData.identity.environmentName || 'N/A'}</div>
                <div><span className="font-medium">Auth Type:</span> {ldData.identity.authKind || 'N/A'}</div>
              </div>
            </div>

            {/* Summary */}
            <div className="mb-4">
              <h5 className="font-medium text-gray-900 mb-2">Account Summary</h5>
              <div className="text-sm space-y-1">
                <div><span className="font-medium">Total Projects:</span> {ldData.summary.totalProjects}</div>
                <div><span className="font-medium">Total Flags:</span> {ldData.summary.totalFlags}</div>
              </div>
            </div>

            {/* Recent Flags */}
            {ldData.flags.length > 0 && (
              <div className="mb-4">
                <h5 className="font-medium text-gray-900 mb-2">Recent Feature Flags</h5>
                <div className="text-sm space-y-1">
                  {ldData.flags.slice(0, 3).map((flag, index) => (
                    <div key={index} className="flex justify-between">
                      <span>{flag.name}</span>
                      <span className="text-gray-500">({flag.key})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Projects */}
            {ldData.projects.length > 0 && (
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Available Projects</h5>
                <div className="text-sm space-y-1">
                  {ldData.projects.slice(0, 3).map((project, index) => (
                    <div key={index} className="flex justify-between">
                      <span>{project.name}</span>
                      <span className="text-gray-500">({project.key})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}
