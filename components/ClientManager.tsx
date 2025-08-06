'use client';

import { useState } from 'react';
import { generateSessionId, getLocalhostPort, FRAMEWORK_URL } from '../lib/config';

export default function ClientManager() {
  const [sessionId, setSessionId] = useState(generateSessionId());
  const [clientName, setClientName] = useState('');
  const [localhostPort, setLocalhostPort] = useState(getLocalhostPort().toString());
  const [copied, setCopied] = useState(false);

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
        
        <div className="space-y-6">
          {/* Client Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Client Name
            </label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Enter your OAuth client name"
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

          {/* Localhost Port */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Localhost Port
            </label>
            <input
              type="number"
              value={localhostPort}
              onChange={(e) => setLocalhostPort(e.target.value)}
              placeholder="3000"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h3 className="text-lg font-medium text-blue-900 mb-2">Instructions</h3>
            <ol className="list-decimal list-inside space-y-1 text-blue-800">
              <li>Enter your OAuth client name</li>
              <li>Copy the Redirect URL and use it in your LaunchDarkly OAuth client registration</li>
              <li>Set your localhost port (default: 3000)</li>
              <li>Ensure your local app is running and listening for OAuth callbacks</li>
              <li>Test the flow using the Authorization URL</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
} 