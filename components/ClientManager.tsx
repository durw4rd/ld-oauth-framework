'use client';

import { useState } from 'react';
import { generateSessionId, FRAMEWORK_URL } from '../lib/config';

export default function ClientManager() {
  const [sessionId, setSessionId] = useState(generateSessionId());
  const [clientName, setClientName] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [copied, setCopied] = useState(false);
  const [isStoring, setIsStoring] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [debugInfo, setDebugInfo] = useState('');

  const generateRedirectUrl = () => {
    return `${FRAMEWORK_URL}/api/callback/${sessionId}`;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const generateNewSession = () => {
    setSessionId(generateSessionId());
  };

  const checkSession = async () => {
    try {
      const response = await fetch(`/api/session/debug?sessionId=${sessionId}`);
      const data = await response.json();
      
      if (data.exists) {
        const timeRemaining = data.timeRemaining || 0;
        const hours = Math.floor(timeRemaining / 60);
        const minutes = timeRemaining % 60;
        
        setDebugInfo(`✅ Session verified! Client ID: ${data.hasClientId ? 'Set' : 'Missing'}, Client Secret: ${data.hasClientSecret ? 'Set' : 'Missing'}, Port: ${data.localhostPort}. Expires in: ${hours}h ${minutes}m`);
      } else if (data.expired) {
        setDebugInfo('❌ Session expired. Please store session data again.');
      } else {
        setDebugInfo('❌ Session not found. Please store session data first.');
      }
    } catch (err) {
      setDebugInfo(`❌ Error checking session: ${err}`);
    }
  };

  const storeSessionData = async () => {
    if (!clientName || !clientSecret) {
      setError('Please fill in both Client ID and Client Secret');
      return;
    }

    setIsStoring(true);
    setError('');
    setSuccess('');
    setDebugInfo('');

    try {
      const response = await fetch('/api/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          clientId: clientName,
          clientSecret,
        }),
      });

      if (response.ok) {
        setSuccess(`Session data stored successfully! You can now test the OAuth flow. After authorization, you'll be redirected to the token viewer.`);
        // Auto-check the session after storing
        setTimeout(checkSession, 500);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to store session data');
      }
    } catch {
      setError('Failed to store session data. Please try again.');
    } finally {
      setIsStoring(false);
    }
  };

  const buildAuthUrl = () => {
    const redirectUrl = generateRedirectUrl();
    const params = new URLSearchParams({
      client_id: clientName || 'your-client-id',
      redirect_uri: redirectUrl,
      response_type: 'code',
      scope: 'reader'
    });
    
    return `https://app.launchdarkly.com/trust/oauth/authorize?${params.toString()}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          LaunchDarkly OAuth Framework
        </h1>
        
        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
            <p className="text-green-800">{success}</p>
          </div>
        )}
        
        {debugInfo && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
            <p className="text-yellow-800">{debugInfo}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Client Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Client ID
            </label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Enter your OAuth client ID"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Client Secret */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Client Secret
            </label>
            <input
              type="password"
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
              placeholder="Enter your OAuth client secret"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Session ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session ID
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={generateNewSession}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Generate New
              </button>
            </div>
          </div>

          {/* Store Session Button */}
          <div>
            <button
              onClick={storeSessionData}
              disabled={isStoring}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isStoring ? 'Storing...' : 'Store Session Data'}
            </button>
          </div>

          {/* Redirect URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Redirect URL (for OAuth client registration)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={generateRedirectUrl()}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
              <button
                onClick={() => copyToClipboard(generateRedirectUrl())}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Auth URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Authorization URL (for testing)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={buildAuthUrl()}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
              <button
                onClick={() => copyToClipboard(buildAuthUrl())}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Copy
              </button>
            </div>
          </div>

          {/* Debug Session Button */}
          <div>
            <button
              onClick={checkSession}
              className="w-full px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              Debug Session
            </button>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h3 className="text-lg font-medium text-blue-900 mb-2">Instructions</h3>
            <ol className="list-decimal list-inside space-y-1 text-blue-800">
              <li>Enter your OAuth client ID and client secret</li>
              <li>Click &quot;Store Session Data&quot; to save your credentials</li>
              <li>Copy the Redirect URL and use it in your LaunchDarkly OAuth client registration</li>
              <li>Test the OAuth flow using the Authorization URL</li>
              <li>You&apos;ll be redirected to a token viewer where you can test and download templates</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
} 