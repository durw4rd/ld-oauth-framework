'use client';

import { useState, useEffect } from 'react';

interface TokenViewerProps {
  sessionId: Promise<{ sessionId: string }>;
}

interface TokenData {
  access_token: string;
  token_type: string;
  expires_in: number;
  sessionId: string;
  receivedAt: number;
}

interface SessionData {
  clientId: string;
  clientSecret: string;
  localhostPort: string;
  customCallbackUrl?: string;
  createdAt: number;
  expiresAt: number;
}

interface TestResult {
  success?: boolean;
  data?: {
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
  error?: string;
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

export default function TokenViewer({ sessionId }: TokenViewerProps) {
  const [sessionIdValue, setSessionIdValue] = useState<string>('');
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [ldData, setLdData] = useState<LaunchDarklyData | null>(null);
  const [isLoadingLdData, setIsLoadingLdData] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const { sessionId: sid } = await sessionId;
      setSessionIdValue(sid);
      
      try {
        // Load token data
        const tokenResponse = await fetch(`/api/tokens/${sid}`);
        if (tokenResponse.ok) {
          const token = await tokenResponse.json();
          setTokenData(token);
        }
        
        // Load session data
        const sessionResponse = await fetch(`/api/session/${sid}`);
        if (sessionResponse.ok) {
          const session = await sessionResponse.json();
          setSessionData(session.session);
        }
      } catch {
        console.error('Error loading data');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [sessionId]);

  const testConnection = async () => {
    if (!tokenData?.access_token) {
      setTestResult({ error: 'No access token available' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken: tokenData.access_token,
          sessionId: sessionIdValue
        }),
      });

      const result = await response.json();
      setTestResult(result);
    } catch {
      setTestResult({ error: 'Failed to test connection' });
    } finally {
      setIsTesting(false);
    }
  };

  const downloadTemplate = async () => {
    if (!tokenData?.access_token || !sessionData) {
      alert('Token or session data not available');
      return;
    }

    try {
      const response = await fetch('/api/template/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: sessionIdValue,
          accessToken: tokenData.access_token,
          clientId: sessionData?.clientId || 'your-client-id'
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `launchdarkly-oauth-${sessionIdValue}.html`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Failed to generate template');
      }
    } catch {
      alert('Error generating template');
    }
  };

  const loadLaunchDarklyData = async () => {
    if (!tokenData?.access_token) {
      alert('No access token available');
      return;
    }

    setIsLoadingLdData(true);
    setLdData(null);

    try {
      const response = await fetch('/api/ld-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken: tokenData.access_token,
          sessionId: sessionIdValue
        }),
      });

      const result = await response.json();
      if (result.success) {
        setLdData(result.data);
      } else {
        alert('Failed to load LaunchDarkly data: ' + result.error);
      }
    } catch {
      alert('Error loading LaunchDarkly data');
    } finally {
      setIsLoadingLdData(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading token data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          OAuth Token Viewer
        </h1>
        
        <div className="space-y-6">
          {/* Session Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h3 className="text-lg font-medium text-blue-900 mb-2">Session Information</h3>
            <p className="text-blue-800">Session ID: {sessionIdValue}</p>
            {sessionData && (
              <p className="text-blue-800">Status: Active</p>
            )}
          </div>

          {/* Token Status */}
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <h3 className="text-lg font-medium text-green-900 mb-2">Token Status</h3>
            {tokenData ? (
              <div className="space-y-2">
                <p className="text-green-800">✅ Access token received</p>
                <p className="text-green-800">Type: {tokenData.token_type}</p>
                <p className="text-green-800">Expires in: {tokenData.expires_in} seconds</p>
                <p className="text-green-800">Received: {new Date(tokenData.receivedAt).toLocaleString()}</p>
              </div>
            ) : (
              <p className="text-green-800">❌ No access token available</p>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <div className="flex gap-4">
              <button
                onClick={testConnection}
                disabled={!tokenData?.access_token || isTesting}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isTesting ? 'Testing...' : 'Test Connection'}
              </button>
              
              <button
                onClick={downloadTemplate}
                disabled={!tokenData?.access_token}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Download Template
              </button>
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={loadLaunchDarklyData}
                disabled={!tokenData?.access_token || isLoadingLdData}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoadingLdData ? 'Loading...' : 'Load Account Data'}
              </button>
            </div>
          </div>

          {/* Test Results */}
          {testResult && (
            <div className={`border rounded-md p-4 ${
              testResult.error ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
            }`}>
              <h3 className="text-lg font-medium mb-2">
                {testResult.error ? '❌ Test Failed' : '✅ LaunchDarkly Connection Successful'}
              </h3>
              {testResult.error ? (
                <p className="text-red-800">{testResult.error}</p>
              ) : (
                <div className="space-y-4">
                  <p className="text-green-800 font-medium">Your OAuth token is working correctly!</p>
                  
                  {testResult.data && (
                    <div className="bg-white border border-green-200 rounded-md p-4">
                      <h4 className="font-medium text-gray-900 mb-3">Account Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        {testResult.data.accountId && (
                          <div>
                            <span className="font-medium text-gray-700">Account ID:</span>
                            <span className="ml-2 text-gray-900">{testResult.data.accountId}</span>
                          </div>
                        )}
                        {testResult.data.projectName && (
                          <div>
                            <span className="font-medium text-gray-700">Project:</span>
                            <span className="ml-2 text-gray-900">{testResult.data.projectName}</span>
                          </div>
                        )}
                        {testResult.data.environmentName && (
                          <div>
                            <span className="font-medium text-gray-700">Environment:</span>
                            <span className="ml-2 text-gray-900">{testResult.data.environmentName}</span>
                          </div>
                        )}
                        {testResult.data.authKind && (
                          <div>
                            <span className="font-medium text-gray-700">Auth Type:</span>
                            <span className="ml-2 text-gray-900">{testResult.data.authKind}</span>
                          </div>
                        )}
                        {testResult.data.tokenKind && (
                          <div>
                            <span className="font-medium text-gray-700">Token Type:</span>
                            <span className="ml-2 text-gray-900">{testResult.data.tokenKind}</span>
                          </div>
                        )}
                        {testResult.data.clientId && (
                          <div>
                            <span className="font-medium text-gray-700">Client ID:</span>
                            <span className="ml-2 text-gray-900">{testResult.data.clientId}</span>
                          </div>
                        )}
                        {testResult.data.memberId && (
                          <div>
                            <span className="font-medium text-gray-700">Member ID:</span>
                            <span className="ml-2 text-gray-900">{testResult.data.memberId}</span>
                          </div>
                        )}
                        {testResult.data.serviceToken !== undefined && (
                          <div>
                            <span className="font-medium text-gray-700">Service Token:</span>
                            <span className="ml-2 text-gray-900">{testResult.data.serviceToken ? 'Yes' : 'No'}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                    <p className="text-blue-800 text-sm">
                      <strong>What this means:</strong> Your OAuth token has successfully authenticated with LaunchDarkly 
                      and can access the account information above. This proves your OAuth integration is working correctly!
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* LaunchDarkly Account Data */}
          {ldData && (
            <div className="bg-purple-50 border border-purple-200 rounded-md p-4">
              <h3 className="text-lg font-medium text-purple-900 mb-3">LaunchDarkly Account Data</h3>
              
              {/* Summary */}
              <div className="bg-white border border-purple-200 rounded-md p-3 mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Account Summary</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Projects:</span>
                    <span className="ml-2 text-gray-900">{ldData.summary.totalProjects}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Feature Flags:</span>
                    <span className="ml-2 text-gray-900">{ldData.summary.totalFlags}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Current Project:</span>
                    <span className="ml-2 text-gray-900">{ldData.summary.currentProject || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Environment:</span>
                    <span className="ml-2 text-gray-900">{ldData.summary.currentEnvironment || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Projects */}
              {ldData.projects && ldData.projects.length > 0 && (
                <div className="bg-white border border-purple-200 rounded-md p-3 mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Projects</h4>
                  <div className="space-y-2">
                    {ldData.projects.map((project, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="font-medium">{project.name}</span>
                        <span className="text-sm text-gray-600">{project.key}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Feature Flags */}
              {ldData.flags && ldData.flags.length > 0 && (
                <div className="bg-white border border-purple-200 rounded-md p-3">
                  <h4 className="font-medium text-gray-900 mb-2">Feature Flags</h4>
                  <div className="space-y-2">
                    {ldData.flags.map((flag, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="font-medium">{flag.name}</span>
                        <span className={`text-sm px-2 py-1 rounded ${
                          flag.archived ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {flag.archived ? 'Archived' : 'Active'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mt-4">
                <p className="text-blue-800 text-sm">
                  <strong>Demonstration:</strong> This data shows that your OAuth token has full read access to your 
                  LaunchDarkly account, including projects and feature flags. This proves your OAuth integration is working perfectly!
                </p>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <h3 className="text-lg font-medium text-yellow-900 mb-2">Next Steps</h3>
            <ol className="list-decimal list-inside space-y-1 text-yellow-800">
              <li>Test the connection to verify your token works</li>
              <li>Download the pre-configured HTML template</li>
              <li>Open the template in your browser to see it in action</li>
              <li>Use the template as a starting point for your application</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
