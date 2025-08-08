'use client';
import { useState } from 'react';

interface OAuthClientManagerProps {
  clientId: string;
  currentRedirectUrl: string;
}

export default function OAuthClientManager({ clientId, currentRedirectUrl }: OAuthClientManagerProps) {
  const [apiToken, setApiToken] = useState('');
  const [newRedirectUrl, setNewRedirectUrl] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleUpdateRedirectUrl = async () => {
    if (!apiToken || !newRedirectUrl) {
      setError('Please fill in both API token and new redirect URL');
      return;
    }

    setIsUpdating(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/oauth-clients/patch', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiToken,
          clientId,
          newRedirectUrl
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Redirect URL updated successfully! Your OAuth client now points to your production endpoint.');
        setNewRedirectUrl('');
      } else {
        setError(data.error || 'Failed to update redirect URL');
      }
    } catch {
      setError('Failed to update redirect URL. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const isFrameworkUrl = currentRedirectUrl.includes('ld-oauth-framework');

  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-white">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Update OAuth Client Redirect URL</h2>
      
      <div className="space-y-4">
        {/* Current Status */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <h3 className="text-lg font-medium text-blue-900 mb-2">Current Status</h3>
          <div className="space-y-2 text-blue-800">
            <div>
              <strong>Client ID:</strong> {clientId}
            </div>
            <div>
              <strong>Current Redirect URL:</strong> {currentRedirectUrl}
            </div>
            <div>
              <strong>Status:</strong> 
              {isFrameworkUrl ? (
                <span className="text-yellow-600"> Using framework URL (development mode)</span>
              ) : (
                <span className="text-green-600"> Using production URL</span>
              )}
            </div>
          </div>
        </div>

        {/* Update Form */}
        <div className="space-y-4">
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
              This token needs Admin privileges to update OAuth clients
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Redirect URL
            </label>
            <input
              type="url"
              value={newRedirectUrl}
              onChange={(e) => setNewRedirectUrl(e.target.value)}
              placeholder="https://your-app.com/api/auth/callback"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
            />
            <p className="text-sm text-gray-600 mt-1">
              Must use HTTPS (except for localhost)
            </p>
          </div>

          <button
            onClick={handleUpdateRedirectUrl}
            disabled={isUpdating}
            className="w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
          >
            {isUpdating ? 'Updating...' : 'Update Redirect URL'}
          </button>
        </div>

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

        {/* Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <h3 className="text-lg font-semibold text-yellow-900 mb-2">When to Update Redirect URL</h3>
          <div className="space-y-2 text-sm text-yellow-800">
            <div><strong>Development Phase:</strong> Keep using framework URL while building your app</div>
            <div><strong>Production Ready:</strong> Update to your HTTPS endpoint once deployed</div>
            <div><strong>Testing:</strong> You can switch back to framework URL for testing</div>
            <div><strong>Security:</strong> Always use HTTPS in production (except localhost)</div>
          </div>
        </div>

        {/* Workflow Guide */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <h3 className="text-lg font-medium text-blue-900 mb-2">Development Workflow</h3>
          <ol className="list-decimal list-inside space-y-1 text-blue-800 text-sm">
            <li>Start with framework URL for development and testing</li>
            <li>Build your callback endpoint locally</li>
            <li>Deploy your app with HTTPS endpoint</li>
            <li>Use this tool to update OAuth client redirect URL</li>
            <li>Test OAuth flow with your production endpoint</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
