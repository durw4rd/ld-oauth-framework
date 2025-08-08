'use client';
import { useState } from 'react';


interface OAuthClientImporterProps {
  onSuccess?: (sessionId: string) => void;
}

export default function OAuthClientImporter({ onSuccess }: OAuthClientImporterProps) {
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [redirectUrl, setRedirectUrl] = useState('');
  const [isStoring, setIsStoring] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showRedirectUrl, setShowRedirectUrl] = useState(false);



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
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const storeSessionData = async () => {
    if (!clientId || !clientSecret || !sessionId.trim() || !redirectUrl.trim()) {
      setError('Please fill in all required fields: Client ID, Client Secret, Session ID, and Redirect URL');
      return;
    }
    
    setIsStoring(true);
    setError('');
    setSuccess('');
    
    try {
      console.log('Storing session data:', { sessionId, clientId, clientSecret: '***', redirectUrl });
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch('/api/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: sessionId.trim(),
          clientId: clientId.trim(),
          clientSecret: clientSecret.trim(),
          redirectUrl: redirectUrl.trim(),
        }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Session stored successfully:', data);
        setSuccess('OAuth credentials saved successfully! You can now test the OAuth flow.');
        setShowRedirectUrl(true);
        onSuccess?.(sessionId);
      } else {
        const data = await response.json();
        console.error('Failed to store session:', data);
        setError(data.error || 'Failed to store session data');
      }
    } catch (error) {
      console.error('Error storing session:', error);
      setError('Failed to store session data. Please try again.');
    } finally {
      setIsStoring(false);
    }
  };

  const resetForm = () => {
    setClientId('');
    setClientSecret('');
    setSessionId('');
    setRedirectUrl('');
    setError('');
    setSuccess('');
    setShowRedirectUrl(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Use Framework as Development Callback Server
        </h1>
        <p className="text-gray-600">
          Configure your existing OAuth client to use this framework as a development callback server for testing.
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-green-900 mb-2">✅ Credentials Saved Successfully!</h2>
          <p className="text-green-800 mb-4">
            Your OAuth client credentials have been stored. You can now test the OAuth flow using this framework as your callback server.
          </p>
          
          {showRedirectUrl && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h3 className="text-md font-semibold text-blue-900 mb-2">🧪 Test OAuth Flow</h3>
              <p className="text-blue-800 mb-3">
                Use this authorization URL to test your OAuth flow:
              </p>
              <div className="bg-white border border-blue-300 rounded p-3 mb-3">
                <code className="text-sm text-blue-900 break-all">
                  {`https://app.launchdarkly.com/trust/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUrl)}&response_type=code&scope=reader`}
                </code>
              </div>
              <div className="flex gap-2">
                <button
                  id="copy-auth-url"
                  onClick={() => copyToClipboard(`https://app.launchdarkly.com/trust/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUrl)}&response_type=code&scope=reader`, 'copy-auth-url')}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Copy URL
                </button>
                <a
                  href={`/test/${sessionId}`}
                  className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  Test OAuth Flow
                </a>
              </div>
            </div>
          )}

          <div className="text-sm text-green-700">
            <p><strong>Next steps:</strong></p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>🧪 Test the OAuth flow using the authorization URL above</li>
              <li>📥 Download code samples for your preferred language</li>
              <li>🔧 Integrate the code into your application</li>
                              <li>🚀 When ready for production, update your OAuth client&apos;s redirect URL</li>
            </ul>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-red-900 mb-2">❌ Error</h2>
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Main Form */}
      {!success && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="space-y-6">
            {/* Client Credentials */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client ID
              </label>
              <input
                type="text"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="Enter your OAuth client ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client Secret
              </label>
              <input
                type="password"
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
                placeholder="Enter your OAuth client secret"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
              />
            </div>

            {/* Session ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session ID
              </label>
              <input
                type="text"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                placeholder="Enter your existing session ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
              />
              <p className="text-sm text-gray-600 mt-1">
                Enter the session ID that corresponds to your OAuth client configuration.
              </p>
            </div>

            {/* Redirect URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Redirect URL
              </label>
              <input
                type="url"
                value={redirectUrl}
                onChange={(e) => setRedirectUrl(e.target.value)}
                placeholder="https://your-oauth-client.com/callback"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
              />
              <p className="text-sm text-gray-600 mt-1">
                Enter the redirect URL currently configured in your OAuth client.
              </p>
            </div>



            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={storeSessionData}
                disabled={isStoring}
                className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isStoring ? 'Saving...' : 'Save & Test OAuth Flow'}
              </button>
              <button
                onClick={resetForm}
                className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Actions */}
      {success && (
        <div className="flex gap-3 justify-center">
          <a
            href={`/tokens/${sessionId}`}
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
        </div>
      )}
    </div>
  );
}
