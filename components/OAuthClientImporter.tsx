'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';


interface OAuthClientImporterProps {
  onSuccess?: (sessionId: string) => void;
}

export default function OAuthClientImporter({ onSuccess }: OAuthClientImporterProps) {
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [redirectUrl, setRedirectUrl] = useState('');
  const [callbackUrl, setCallbackUrl] = useState('');
  const [isStoring, setIsStoring] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showRedirectUrl, setShowRedirectUrl] = useState(false);
  const [extractedSessionId, setExtractedSessionId] = useState<string | null>(null);



  const extractSessionIdFromRedirectUrl = (url: string): string | null => {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      const sessionIdIndex = pathParts.findIndex(part => part === 'callback') + 1;
      
      if (sessionIdIndex > 0 && sessionIdIndex < pathParts.length) {
        const sessionId = pathParts[sessionIdIndex];
        // Basic validation that it looks like a session ID (UUID format)
        if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sessionId)) {
          return sessionId;
        }
      }
      return null;
    } catch {
      return null;
    }
  };

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
    if (!clientId || !clientSecret || !redirectUrl.trim()) {
      setError('Please fill in all required fields: Client ID, Client Secret, and Redirect URL');
      return;
    }

    // Extract session ID from redirect URL
    const sessionId = extractSessionIdFromRedirectUrl(redirectUrl.trim());
    if (!sessionId) {
      setError('Could not extract session ID from redirect URL. Please ensure the URL follows the format: https://ld-oauth-framework.vercel.app/api/callback/{session-id}');
      return;
    }

    setExtractedSessionId(sessionId);
    
    setIsStoring(true);
    setError('');
    setSuccess('');
    
    try {
      console.log('Storing session data:', { sessionId, clientId, clientSecret: '***', redirectUrl: redirectUrl.trim() });
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch('/api/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: sessionId,
          clientId: clientId.trim(),
          clientSecret: clientSecret.trim(),
          redirectUrl: redirectUrl.trim(),
          callbackUrl: callbackUrl.trim() || undefined,
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

  // Auto-extract session ID when redirect URL changes
  useEffect(() => {
    if (redirectUrl.trim()) {
      const sessionId = extractSessionIdFromRedirectUrl(redirectUrl.trim());
      setExtractedSessionId(sessionId);
    } else {
      setExtractedSessionId(null);
    }
  }, [redirectUrl]);

  const resetForm = () => {
    setClientId('');
    setClientSecret('');
    setRedirectUrl('');
    setCallbackUrl('');
    setError('');
    setSuccess('');
    setShowRedirectUrl(false);
    setExtractedSessionId(null);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Use Framework as Development Callback Server
        </h1>
        <p className="text-gray-600">
          Enter your OAuth client credentials and redirect URL. The session ID will be automatically extracted from the redirect URL.
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
                  href={`/test/${extractedSessionId}`}
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

                      {/* Redirect URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Redirect URL
            </label>
            <input
              type="url"
              value={redirectUrl}
              onChange={(e) => setRedirectUrl(e.target.value)}
              placeholder="https://ld-oauth-framework.vercel.app/api/callback/your-session-id"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
            />
            <p className="text-sm text-gray-600 mt-1">
              Enter the redirect URL from your OAuth client. The session ID will be automatically extracted from the URL.
            </p>
            {extractedSessionId && (
              <p className="text-sm text-green-600 mt-1">
                ✅ Extracted session ID: <code className="bg-green-100 px-1 rounded">{extractedSessionId}</code>
              </p>
            )}
          </div>

          {/* Callback URL (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Callback URL (Optional)
            </label>
            <input
              type="url"
              value={callbackUrl}
              onChange={(e) => setCallbackUrl(e.target.value)}
              placeholder="https://your-app.com/oauth/callback"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
            />
            <p className="text-sm text-gray-600 mt-1">
              After OAuth completion, redirect back to your app with the session ID. Leave empty to stay on the framework.
            </p>
            <div className="mt-2 space-y-2">
              <p className="text-xs text-gray-500">Common patterns:</p>
              <div className="text-xs space-y-1">
                <div className="flex gap-2">
                  <button
                    onClick={() => setCallbackUrl('http://localhost:3000/oauth/callback')}
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    Local Development: http://localhost:3000/oauth/callback
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCallbackUrl('https://your-app.com/oauth/callback')}
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    Production: https://your-app.com/oauth/callback
                  </button>
                </div>
              </div>
            </div>
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
      {success && extractedSessionId && (
        <div className="flex gap-3 justify-center">
          <Link
            href={`/test/${extractedSessionId}`}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Test OAuth Flow
          </Link>
          <Link
            href="/templates"
            className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Download Templates
          </Link>
        </div>
      )}
    </div>
  );
}
