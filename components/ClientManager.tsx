'use client';
import { useState } from 'react';
import { generateSessionId, FRAMEWORK_URL, validateSessionId } from '../lib/config';
import TemplateDownload from './TemplateDownload';

type SetupMode = 'manual' | 'auto';

export default function ClientManager() {
  const [setupMode, setSetupMode] = useState<SetupMode | null>(null);
  const [sessionId, setSessionId] = useState(generateSessionId());
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [isStoring, setIsStoring] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [debugInfo, setDebugInfo] = useState('');

  const generateFrameworkRedirectUrl = () => `${FRAMEWORK_URL}/api/callback/${sessionId}`;

  const generateNewSession = () => {
    setSessionId(generateSessionId());
  };

  const copyToClipboard = async (text: string, buttonId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Update only the specific button
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
    if (!clientId || !clientSecret) {
      setError('Please fill in both Client ID and Client Secret');
      return;
    }
    
    if (!sessionId.trim()) {
      setError('Please enter a Session ID');
      return;
    }
    
    if (!validateSessionId(sessionId.trim())) {
      setError('Please enter a valid Session ID (UUID format)');
      return;
    }
    
    setIsStoring(true);
    setError('');
    setSuccess('');
    setDebugInfo('');
    
    try {
      console.log('Storing session data:', { sessionId, clientId, clientSecret: '***' });
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch('/api/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: sessionId.trim(),
          clientId: clientId.trim(),
          clientSecret: clientSecret.trim(),
        }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Session stored successfully:', data);
        setSuccess(`OAuth credentials stored successfully! You can now test the OAuth flow and download templates.`);
        setTimeout(() => {
          checkSession();
        }, 500);
      } else {
        const data = await response.json();
        console.error('Failed to store session:', data);
        setError(data.error || 'Failed to store session data');
      }
    } catch (error) {
      console.error('Error storing session:', error);
      setError('Failed to store session data. Please try again.');
    } finally {
      console.log('Setting isStoring to false');
      setIsStoring(false);
    }
  };

  const checkSession = async () => {
    if (!sessionId.trim()) {
      setDebugInfo('Please enter a session ID first');
      return;
    }
    
    if (!validateSessionId(sessionId.trim())) {
      setDebugInfo('Invalid session ID format (should be a UUID)');
      return;
    }
    
    try {
      const response = await fetch(`/api/session/debug?sessionId=${sessionId.trim()}`);
      const data = await response.json();
      if (data.exists) {
        setDebugInfo(`✅ Session active - Expires in ${data.timeRemaining} minutes`);
      } else {
        setDebugInfo('❌ Session not found or expired');
      }
    } catch {
      setDebugInfo('❌ Error checking session');
    }
  };

  const resetForm = () => {
    setSetupMode(null);
    setClientId('');
    setClientSecret('');
    setError('');
    setSuccess('');
    setDebugInfo('');
  };

  if (!setupMode) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            LaunchDarkly OAuth Framework
          </h1>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">What is this framework?</h2>
            <p className="text-blue-800 mb-3">
              This framework helps you set up OAuth authentication for your LaunchDarkly applications. 
              It provides OAuth credentials, testing tools, and templates to build your own OAuth apps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Manual Setup Option */}
            <div className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors cursor-pointer" onClick={() => setSetupMode('manual')}>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">I have an OAuth client</h2>
              <p className="text-gray-600 mb-4">
                You already have OAuth client credentials from LaunchDarkly. Use this to test the OAuth flow and get templates.
              </p>
              <div className="text-sm text-gray-500">
                <p>✅ Test OAuth flow</p>
                <p>✅ Download templates</p>
                <p>✅ Update redirect URL later</p>
              </div>
            </div>
            
            {/* Auto Setup Option */}
            <div className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors cursor-pointer" onClick={() => setSetupMode('auto')}>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">I need a new OAuth client</h2>
              <p className="text-gray-600 mb-4">
                Create a new OAuth client automatically using your LaunchDarkly API token.
              </p>
              <div className="text-sm text-gray-500">
                <p>✅ Create OAuth client</p>
                <p>✅ Get credentials</p>
                <p>✅ Test immediately</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (setupMode === 'auto') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Create OAuth Client</h1>
            <button
              onClick={resetForm}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              ← Back to options
            </button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">Next Steps</h2>
            <ol className="list-decimal list-inside space-y-1 text-blue-800">
              <li>Enter your LaunchDarkly API token (requires Admin privileges)</li>
              <li>Provide a name for your OAuth client</li>
              <li>Create the OAuth client in LaunchDarkly</li>
              <li>Test the OAuth flow and download templates</li>
              <li>Update redirect URL when ready for production</li>
            </ol>
          </div>

          <div className="text-center">
            <a
              href="/create"
              className="inline-block px-8 py-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors text-lg"
            >
              Go to OAuth Client Creator →
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Configure OAuth Client</h1>
          <button
            onClick={resetForm}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            ← Back to options
          </button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">How to use your OAuth client</h2>
          <ol className="list-decimal list-inside space-y-1 text-blue-800">
            <li>Enter your OAuth client credentials below</li>
            <li>Your OAuth client already has a redirect URL configured</li>
            <li>You&apos;ll need to implement a callback endpoint at that URL</li>
            <li>Test the OAuth flow to verify your credentials work</li>
            <li>Download templates to build your own app</li>
            <li>Update redirect URL when ready for production</li>
          </ol>
        </div>

        <div className="space-y-6">
          {/* Client ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Client ID *
            </label>
            <input
              type="text"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="Enter your LaunchDarkly OAuth client ID"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 text-gray-900"
            />
          </div>

          {/* Client Secret */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Client Secret *
            </label>
            <input
              type="password"
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
              placeholder="Enter your LaunchDarkly OAuth client secret"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 text-gray-900"
            />
          </div>

          {/* Session ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session ID (for testing)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                placeholder="Enter your session ID or generate a new one"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 text-gray-900"
              />
              <button
                onClick={generateNewSession}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Generate New
              </button>
              <button
                onClick={checkSession}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Check Session
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Enter an existing session ID to continue with a previous session, or generate a new one. This session ID is used in the OAuth redirect URL.
              <br />
              <span className="text-blue-600">
                💡 Tip: You can find your session ID in the OAuth redirect URL: <code className="bg-gray-100 px-1 rounded">https://ld-oauth-framework.vercel.app/api/callback/YOUR_SESSION_ID</code>
              </span>
            </p>
          </div>

          {/* Store Session Button */}
          <button
            onClick={storeSessionData}
            disabled={isStoring}
            className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isStoring ? 'Storing...' : 'Store Credentials & Continue'}
          </button>

          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <p className="text-green-800">{success}</p>
            </div>
          )}

          {debugInfo && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <p className="text-blue-800">{debugInfo}</p>
            </div>
          )}

          {/* Redirect URL Information */}
          {success && (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">OAuth Configuration</h3>
              
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <h4 className="font-medium text-yellow-900 mb-2">Important Note</h4>
                  <p className="text-yellow-800 text-sm">
                    Your OAuth client already has a redirect URL configured. To test the OAuth flow, you need to:
                  </p>
                  <ol className="list-decimal list-inside mt-2 text-yellow-800 text-sm">
                    <li>Implement a callback endpoint at your OAuth client&apos;s redirect URL</li>
                    <li>Use the authorization URL below to test the flow</li>
                    <li>Or use the framework&apos;s OAuth Client Manager to update the redirect URL</li>
                  </ol>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Authorization URL (for testing)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={`https://app.launchdarkly.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent('YOUR_REDIRECT_URL')}&response_type=code&scope=read`}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                    />
                    <button
                      id="copy-auth-url"
                      onClick={() => copyToClipboard(`https://app.launchdarkly.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent('YOUR_REDIRECT_URL')}&response_type=code&scope=read`, 'copy-auth-url')}
                      className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Replace YOUR_REDIRECT_URL with your OAuth client&apos;s actual redirect URL.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Framework Redirect URL (alternative)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={generateFrameworkRedirectUrl()}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                    />
                    <button
                      id="copy-framework-url"
                      onClick={() => copyToClipboard(generateFrameworkRedirectUrl(), 'copy-framework-url')}
                      className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Use this URL if you want to update your OAuth client&apos;s redirect URL to use the framework for testing.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Template Download Section */}
          {success && (
            <TemplateDownload
              clientId={clientId}
              clientSecret={clientSecret}
              redirectUrl={generateFrameworkRedirectUrl()}
              sessionId={sessionId}
            />
          )}


        </div>
      </div>
    </div>
  );
} 