'use client';

import { useState } from 'react';
import { generateSessionId, FRAMEWORK_URL } from '../lib/config';

interface OAuthClient {
  id: string;
  name: string;
  redirectUris: string[];
  clientId: string;
  clientSecret: string;
  createdAt: string;
}

export default function OAuthClientCreator() {
  const [apiToken, setApiToken] = useState('');
  const [clientName, setClientName] = useState('');
  const [sessionId, setSessionId] = useState(generateSessionId());
  const [isCreating, setIsCreating] = useState(false);
  const [createdClient, setCreatedClient] = useState<OAuthClient | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const generateRedirectUrl = () => {
    return `${FRAMEWORK_URL}/api/callback/${sessionId}`;
  };

  const createClient = async () => {
    if (!apiToken || !clientName) {
      setError('Please fill in both API Token and Client Name');
      return;
    }

    setIsCreating(true);
    setError('');
    setSuccess('');
    setCreatedClient(null);

    try {
      const response = await fetch('/api/oauth-clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiToken,
          name: clientName,
          redirectUris: [generateRedirectUrl()]
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setCreatedClient(data.client);
        setSuccess('OAuth client created successfully! Client credentials have been saved.');
        
        // Auto-store session data with the new client credentials
        await storeSessionData(data.client.clientId, data.client.clientSecret);
      } else {
        setError(data.error || 'Failed to create OAuth client');
      }
    } catch {
      setError('Failed to create OAuth client. Please check your API token and try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const storeSessionData = async (clientId: string, clientSecret: string) => {
    try {
      const response = await fetch('/api/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          clientId,
          clientSecret,
        }),
      });

      if (!response.ok) {
        console.error('Failed to store session data');
      }
    } catch (err) {
      console.error('Error storing session data:', err);
    }
  };

  const generateNewSession = () => {
    setSessionId(generateSessionId());
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Create OAuth Client
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

        {!createdClient ? (
          <div className="space-y-6">
            {/* API Token */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                LaunchDarkly API Token
              </label>
              <input
                type="password"
                value={apiToken}
                onChange={(e) => setApiToken(e.target.value)}
                placeholder="Enter your LaunchDarkly API token"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-600 mt-1">
                This token needs Admin privileges to create OAuth clients
              </p>
            </div>

            {/* Client Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client Name
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Enter a name for your OAuth client"
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

            {/* Redirect URL Preview */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Redirect URL (will be used for OAuth client)
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
                  Copy
                </button>
              </div>
            </div>

            {/* Create Button */}
            <div>
              <button
                onClick={createClient}
                disabled={isCreating}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isCreating ? 'Creating...' : 'Create OAuth Client'}
              </button>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h3 className="text-lg font-medium text-blue-900 mb-2">How it works</h3>
              <ol className="list-decimal list-inside space-y-1 text-blue-800">
                <li>Enter your LaunchDarkly API token (requires Admin privileges)</li>
                <li>Provide a name for your OAuth client</li>
                <li>Click &quot;Create OAuth Client&quot; to create it in LaunchDarkly</li>
                <li>The client credentials will be automatically saved for testing</li>
                <li>You can then test the OAuth flow immediately</li>
              </ol>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Success Message */}
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <h3 className="text-lg font-medium text-green-900 mb-2">✅ OAuth Client Created Successfully!</h3>
              <p className="text-green-800">
                Your OAuth client has been created in LaunchDarkly and the credentials have been saved for testing.
              </p>
            </div>

            {/* Client Details */}
            <div className="bg-white border border-gray-200 rounded-md p-4">
              <h4 className="font-medium text-gray-900 mb-3">Client Details</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Client ID:</span>
                  <span className="ml-2 text-gray-900">{createdClient.clientId}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Client Secret:</span>
                  <span className="ml-2 text-gray-900">{createdClient.clientSecret}</span>
                  <span className="ml-2 text-red-600 text-xs">(Save this - it won&apos;t be shown again)</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Name:</span>
                  <span className="ml-2 text-gray-900">{createdClient.name}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Redirect URL:</span>
                  <span className="ml-2 text-gray-900">{createdClient.redirectUris[0]}</span>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <h4 className="font-medium text-yellow-900 mb-2">Next Steps</h4>
              <ol className="list-decimal list-inside space-y-1 text-yellow-800">
                <li>Your session data has been automatically saved</li>
                <li>You can now test the OAuth flow using the authorization URL below</li>
                <li>After authorization, you&apos;ll be redirected to the token viewer</li>
              </ol>
            </div>

            {/* Authorization URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Authorization URL (for testing)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={`https://app.launchdarkly.com/trust/oauth/authorize?client_id=${createdClient.clientId}&redirect_uri=${encodeURIComponent(createdClient.redirectUris[0])}&response_type=code&scope=reader`}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
                <button
                  onClick={() => copyToClipboard(`https://app.launchdarkly.com/trust/oauth/authorize?client_id=${createdClient.clientId}&redirect_uri=${encodeURIComponent(createdClient.redirectUris[0])}&response_type=code&scope=reader`)}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  Copy
                </button>
              </div>
            </div>

            {/* Test Button */}
            <div className="text-center">
              <a
                href={`https://app.launchdarkly.com/trust/oauth/authorize?client_id=${createdClient.clientId}&redirect_uri=${encodeURIComponent(createdClient.redirectUris[0])}&response_type=code&scope=reader`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Test OAuth Flow
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
