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
  exists: boolean;
  hasClientId?: boolean;
  hasClientSecret?: boolean;
  localhostPort?: string;
  createdAt?: string;
  expiresAt?: string;
  timeRemaining?: number;
}

interface TestResult {
  success?: boolean;
  data?: Record<string, unknown>;
  error?: string;
}

export default function TokenViewer({ sessionId }: TokenViewerProps) {
  const [sessionIdValue, setSessionIdValue] = useState<string>('');
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isTesting, setIsTesting] = useState(false);

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
        const sessionResponse = await fetch(`/api/session/debug?sessionId=${sid}`);
        if (sessionResponse.ok) {
          const session = await sessionResponse.json();
          setSessionData(session);
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
          clientId: sessionData.hasClientId ? 'your-client-id' : 'your-client-id'
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
              <p className="text-blue-800">Status: {sessionData.exists ? 'Active' : 'Not Found'}</p>
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
          </div>

          {/* Test Results */}
          {testResult && (
            <div className={`border rounded-md p-4 ${
              testResult.error ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
            }`}>
              <h3 className="text-lg font-medium mb-2">
                {testResult.error ? '❌ Test Failed' : '✅ Test Successful'}
              </h3>
              {testResult.error ? (
                <p className="text-red-800">{testResult.error}</p>
              ) : (
                <div className="space-y-2">
                  <p className="text-green-800">Connection to LaunchDarkly API successful!</p>
                  {testResult.data && (
                    <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">
                      {JSON.stringify(testResult.data, null, 2)}
                    </pre>
                  )}
                </div>
              )}
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
