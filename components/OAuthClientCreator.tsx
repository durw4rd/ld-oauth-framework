'use client';

import { useState } from 'react';
import { generateSessionId, FRAMEWORK_URL } from '../lib/config';
import Link from 'next/link';

// Updated OAuthClient interface
interface OAuthClient {
  _links: Record<string, unknown>;
  name: string;
  _accountId: string;
  _clientId: string;
  redirectUri: string;
  _creationDate: number;
  description: string | null;
  _clientSecret: string | null;
}

export default function OAuthClientCreator() {
  const [apiToken, setApiToken] = useState('');
  const [clientName, setClientName] = useState('');
  const [sessionId, setSessionId] = useState(generateSessionId());
  const [redirectUrlOption, setRedirectUrlOption] = useState<'framework' | 'custom'>('framework');
  const [customRedirectUrl, setCustomRedirectUrl] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createdClient, setCreatedClient] = useState<OAuthClient | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const generateFrameworkRedirectUrl = () => `${FRAMEWORK_URL}/api/callback/${sessionId}`;
  const generateDeveloperRedirectUrl = () => redirectUrlOption === 'framework' ? generateFrameworkRedirectUrl() : customRedirectUrl;

  const createClient = async () => {
    if (!apiToken || !clientName || !sessionId) {
      setError('Please fill in all required fields');
      return;
    }

    setIsCreating(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/oauth-clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiToken,
          name: clientName,
          redirectUri: generateDeveloperRedirectUrl(),
          sessionId
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setCreatedClient(data.client);
        setSuccess('OAuth client created successfully! Client credentials have been saved.');
        
        // Auto-save the client credentials
        await storeSessionData(data.client._clientId, data.client._clientSecret);
      } else {
        setError(data.error || 'Failed to create OAuth client');
      }
    } catch {
      setError('Failed to create OAuth client. Please try again.');
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
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

            {/* Redirect URL Configuration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Redirect URL Configuration
              </label>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <input
                    type="radio"
                    id="framework-redirect"
                    name="redirectOption"
                    value="framework"
                    checked={redirectUrlOption === 'framework'}
                    onChange={(e) => setRedirectUrlOption(e.target.value as 'framework' | 'custom')}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <label htmlFor="framework-redirect" className="block text-sm font-medium text-gray-700">
                      Use framework as callback server
                    </label>
                    <div className="text-sm text-gray-600 mt-1 space-y-1">
                      <p>✅ No need to expose localhost to internet</p>
                      <p>✅ Works immediately for development</p>
                      <p>⚠️ Need to update OAuth client redirect URL later</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <input
                    type="radio"
                    id="custom-redirect"
                    name="redirectOption"
                    value="custom"
                    checked={redirectUrlOption === 'custom'}
                    onChange={(e) => setRedirectUrlOption(e.target.value as 'framework' | 'custom')}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <label htmlFor="custom-redirect" className="block text-sm font-medium text-gray-700">
                      Provide my own redirect URL
                    </label>
                    <div className="text-sm text-gray-600 mt-1 space-y-1">
                      <p>✅ Direct control over callback handling</p>
                      <p>✅ No need to update OAuth client later</p>
                      <p>⚠️ Requires HTTPS endpoint (localhost won&apos;t work)</p>
                      <p>⚠️ Need to set up your own callback server</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Custom Redirect URL Input */}
            {redirectUrlOption === 'custom' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Redirect URL
                </label>
                <input
                  type="url"
                  value={customRedirectUrl}
                  onChange={(e) => setCustomRedirectUrl(e.target.value)}
                  placeholder="https://your-app.com/api/auth/callback"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Enter your app&apos;s callback URL. Must be HTTPS for production use.
                </p>
              </div>
            )}

            {/* Redirect URL Preview */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Redirect URL (will be used for OAuth client)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={generateDeveloperRedirectUrl()}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
                />
                <button
                  onClick={() => copyToClipboard(generateDeveloperRedirectUrl())}
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
                <li>Optionally enter your app&apos;s redirect URL</li>
                <li>Click &quot;Create OAuth Client&quot; to create it in LaunchDarkly</li>
                <li>The client credentials will be automatically saved for testing</li>
                <li>You can then test the OAuth flow and download templates</li>
              </ol>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Success Message */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-green-900 mb-2">✅ OAuth Client Created Successfully!</h2>
              <p className="text-green-800 mb-4">
                Your OAuth client is ready to use. Your credentials have been saved for testing.
              </p>
              
              <div className="text-sm text-green-700">
                <p><strong>Next steps:</strong></p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>🧪 Test the OAuth flow to make sure everything works</li>
                  <li>📥 Download code samples for your preferred language</li>
                  <li>🔧 Integrate the code into your application</li>
                  <li>🚀 Deploy your app and update the redirect URL</li>
                </ul>
              </div>
            </div>

            {/* Client Details */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Client Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Client ID:</span>
                  <span className="text-gray-900 font-mono">{createdClient._clientId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Client Secret:</span>
                  <span className="text-gray-900 font-mono">{createdClient._clientSecret}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Name:</span>
                  <span className="text-gray-900">{createdClient.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Redirect URL:</span>
                  <span className="text-gray-900 font-mono text-right">
                    {createdClient.redirectUri}
                  </span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-yellow-800 text-sm">
                  <strong>Important:</strong> Save your Client Secret - it won&apos;t be shown again!
                </p>
              </div>
            </div>

            {/* Authorization URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Authorization URL (for testing)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={`https://app.launchdarkly.com/trust/oauth/authorize?client_id=${createdClient._clientId}&redirect_uri=${encodeURIComponent(createdClient.redirectUri)}&response_type=code&scope=reader`}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
                />
                <button
                  onClick={() => copyToClipboard(`https://app.launchdarkly.com/trust/oauth/authorize?client_id=${createdClient._clientId}&redirect_uri=${encodeURIComponent(createdClient.redirectUri)}&response_type=code&scope=reader`)}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-500"
                >
                  Copy
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-center">
              <a
                href={`/test/${sessionId}`}
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Test OAuth Flow
              </a>
              <a
                href="/templates"
                className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Download Templates
              </a>
                      <Link
          href="/"
          className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Back to Home
        </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
