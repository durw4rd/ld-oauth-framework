'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { FRAMEWORK_URL } from '../lib/config';

interface OAuthTesterProps {
  sessionId: string;
}

interface SessionData {
  clientId: string;
  clientSecret: string;
  localhostPort: string;
  customCallbackUrl?: string;
  createdAt: number;
  expiresAt: number;
}

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

export default function OAuthTester({ sessionId }: OAuthTesterProps) {
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [authUrl, setAuthUrl] = useState('');
  const [ldData, setLdData] = useState<LaunchDarklyData | null>(null);
  const [isLoadingLdData, setIsLoadingLdData] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  const loadSessionData = useCallback(async () => {
    try {
      const response = await fetch(`/api/session/${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        setSessionData(data.session);
        
        // Generate auth URL inline
        const redirectUri = `${FRAMEWORK_URL}/api/callback/${sessionId}`;
        const params = new URLSearchParams({
          client_id: data.session.clientId,
          redirect_uri: redirectUri,
          response_type: 'code',
          scope: 'reader'
        });
        
        const authUrl = `https://app.launchdarkly.com/trust/oauth/authorize?${params.toString()}`;
        setAuthUrl(authUrl);
        
        // Check if we have a token for this session
        try {
          const tokenResponse = await fetch(`/api/tokens/${sessionId}`);
          if (tokenResponse.ok) {
            const tokenData = await tokenResponse.json();
            if (tokenData.access_token) {
              setHasToken(true);
            }
          }
        } catch {
          // Token check failed, but that's okay
        }
      } else {
        setError('Session not found or expired');
      }
    } catch {
      setError('Failed to load session data');
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    loadSessionData();
  }, [loadSessionData]);

  const copyToClipboard = async (text: string, buttonId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      const button = document.getElementById(buttonId);
      if (button) {
        button.textContent = 'Copied!';
        setTimeout(() => {
          button.textContent = 'Copy';
        }, 2000);
      }
    } catch {
      console.error('Failed to copy:');
    }
  };

  const startOAuthFlow = () => {
    // Directly redirect to the authorization URL
    window.location.href = authUrl;
  };

  const loadLaunchDarklyData = async () => {
    setIsLoadingLdData(true);
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
      setIsLoadingLdData(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading session data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-900 mb-2">❌ Error</h2>
          <p className="text-red-800 mb-4">{error}</p>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!sessionData) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-yellow-900 mb-2">⚠️ Session Not Found</h2>
          <p className="text-yellow-800 mb-4">
            The session data could not be found. Please make sure you have saved your OAuth credentials first.
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Test OAuth Flow
        </h1>
        <p className="text-gray-600">
          Test your OAuth client configuration and verify the authentication flow works correctly.
        </p>
      </div>

      {/* Session Info */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Session Information</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="font-medium text-gray-700">Session ID:</span>
            <span className="text-gray-900 font-mono">{sessionId}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-700">Client ID:</span>
            <span className="text-gray-900 font-mono">{sessionData.clientId}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-700">Redirect URL:</span>
            <span className="text-gray-900 font-mono text-right">
              {`${FRAMEWORK_URL}/api/callback/${sessionId}`}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-700">Created:</span>
            <span className="text-gray-900">
              {new Date(sessionData.createdAt).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {hasToken && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-green-900 mb-3">✅ OAuth Flow Completed!</h3>
          <div className="space-y-3 text-green-800">
            <p>
              Your OAuth flow has been completed successfully! You now have an access token and can test your connection.
            </p>
            <p className="text-sm">
              <strong>Next:</strong> Use the &quot;Load LaunchDarkly Data&quot; button below to test your connection.
            </p>
          </div>
        </div>
      )}

      {/* Test Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">🧪 How to Test</h3>
        <div className="space-y-3 text-blue-800">
          <p>
            This will initiate the OAuth flow with LaunchDarkly. You&apos;ll be redirected to:
          </p>
          <ol className="list-decimal list-inside space-y-2 ml-4">
            <li>LaunchDarkly&apos;s authorization page</li>
            <li>Your callback URL (this framework)</li>
            <li>Success page with your access token</li>
          </ol>
          <p className="text-sm mt-4">
            <strong>Note:</strong> Make sure your OAuth client&apos;s redirect URL matches the one shown above.
          </p>
        </div>
      </div>

      {/* Auth URL Preview */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Authorization URL</h3>
        <div className="space-y-3">
          <div className="bg-white border border-gray-300 rounded p-3">
            <code className="text-sm text-gray-900 break-all">
              {authUrl}
            </code>
          </div>
          <div className="flex gap-2">
            <button
              id="copy-auth-url"
              onClick={() => copyToClipboard(authUrl, 'copy-auth-url')}
              className="px-4 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Copy URL
            </button>
            <a
              href={authUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Open in New Tab
            </a>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-center">
        <button
          onClick={startOAuthFlow}
          className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          Start OAuth Flow
        </button>
        <Link
          href="/"
          className="px-8 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Back to Home
        </Link>
      </div>

      {/* LaunchDarkly Data Section */}
      <div className="mt-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">🧪 Test Your Connection</h3>
          <p className="text-blue-800 mb-4">
            After completing the OAuth flow, you can test your connection by loading data from your LaunchDarkly account.
          </p>
          
          <div className="flex gap-3">
            <button
              onClick={loadLaunchDarklyData}
              disabled={isLoadingLdData}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoadingLdData ? 'Loading...' : 'Load LaunchDarkly Data'}
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
        </div>
      </div>

      {/* Additional Actions */}
      <div className="mt-8 text-center">
        <p className="text-gray-600 mb-4">Need help with your OAuth setup?</p>
        <div className="flex gap-3 justify-center">
          <a
            href="/templates"
            className="px-6 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Download Templates
          </a>
          <a
            href="/oauth-client-manager"
            className="px-6 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Manage OAuth Client
          </a>
        </div>
      </div>
    </div>
  );
}
