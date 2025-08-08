'use client';
import { useState, useEffect, useCallback } from 'react';
import LoadingSkeleton from './LoadingSkeleton';

interface OAuthClient {
  _clientId: string;
  name: string;
  redirectUri: string;
  _creationDate: number;
  description?: string;
}

interface OAuthClientManagerProps {
  onClientUpdated?: (clientId: string) => void;
}

export default function OAuthClientManager({ onClientUpdated }: OAuthClientManagerProps) {
  const [apiToken, setApiToken] = useState('');
  const [clients, setClients] = useState<OAuthClient[]>([]);
  const [selectedClient, setSelectedClient] = useState<OAuthClient | null>(null);
  const [newRedirectUrl, setNewRedirectUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchClients = useCallback(async () => {
    if (!apiToken) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/oauth-clients?apiToken=${encodeURIComponent(apiToken)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setClients(data.clients || []);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch OAuth clients');
      }
    } catch {
      setError('Failed to fetch OAuth clients. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [apiToken]);

  const updateRedirectUrl = async () => {
    if (!selectedClient || !newRedirectUrl || !apiToken) {
      setError('Please select a client and enter a new redirect URL');
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
          clientId: selectedClient._clientId,
          newRedirectUrl
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Redirect URL updated successfully!');
        setNewRedirectUrl('');
        onClientUpdated?.(selectedClient._clientId);
        
        // Refresh the clients list
        await fetchClients();
      } else {
        setError(data.error || 'Failed to update redirect URL');
      }
    } catch {
      setError('Failed to update redirect URL. Please try again.');
    } finally {
      setIsUpdating(false);
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

  useEffect(() => {
    if (apiToken) {
      fetchClients();
    }
  }, [fetchClients, apiToken]);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          OAuth Client Manager
        </h1>
        <p className="text-gray-600">
          Manage your OAuth clients and update redirect URLs for production deployment.
        </p>
      </div>

      {/* API Token Input */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Authentication</h2>
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
              This token needs Admin privileges to manage OAuth clients
            </p>
          </div>
          <button
            onClick={fetchClients}
            disabled={!apiToken || isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Loading...' : 'Load OAuth Clients'}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-red-900 mb-2">❌ Error</h2>
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-green-900 mb-2">✅ Success</h2>
          <p className="text-green-800">{success}</p>
        </div>
      )}

      {/* OAuth Clients List */}
      {isLoading ? (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Your OAuth Clients</h2>
          <LoadingSkeleton type="list" rows={3} />
        </div>
      ) : clients.length > 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Your OAuth Clients</h2>
          <div className="space-y-4">
            {clients.map((client) => (
              <div
                key={client._clientId}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedClient?._clientId === client._clientId
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedClient(client)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{client.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Client ID: <span className="font-mono">{client._clientId}</span>
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Redirect URL: <span className="font-mono break-all">{client.redirectUri}</span>
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Created: {new Date(client._creationDate).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(client._clientId, `copy-${client._clientId}`);
                    }}
                    id={`copy-${client._clientId}`}
                    className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Copy ID
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Update Redirect URL */}
      {selectedClient && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Update Redirect URL for: {selectedClient.name}
          </h2>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">🔄 When to Update Redirect URL</h3>
            <div className="text-sm text-blue-800 space-y-1">
              <p>• <strong>Development:</strong> Use framework callback URL for testing</p>
              <p>• <strong>Production:</strong> Update to your app&apos;s callback URL</p>
              <p>• <strong>HTTPS Required:</strong> Production URLs must use HTTPS</p>
              <p>• <strong>Localhost:</strong> Allowed for development only</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Redirect URL
              </label>
              <div className="bg-gray-50 border border-gray-300 rounded p-3">
                <code className="text-sm text-gray-900 break-all">
                  {selectedClient.redirectUri}
                </code>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Redirect URL
              </label>
              <input
                type="url"
                value={newRedirectUrl}
                onChange={(e) => setNewRedirectUrl(e.target.value)}
                placeholder="https://your-production-app.com/callback"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 ${
                  newRedirectUrl && !newRedirectUrl.startsWith('https://') && !newRedirectUrl.startsWith('http://localhost')
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              {newRedirectUrl && !newRedirectUrl.startsWith('https://') && !newRedirectUrl.startsWith('http://localhost') && (
                <p className="text-sm text-red-600 mt-1">
                  ⚠️ Production URLs must use HTTPS. Only localhost can use HTTP.
                </p>
              )}
              <p className="text-sm text-gray-600 mt-1">
                Enter the new redirect URL for production deployment
              </p>
              <div className="mt-2 space-y-2">
                <p className="text-xs text-gray-500">Common patterns:</p>
                <div className="text-xs space-y-1">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setNewRedirectUrl('https://your-app.com/api/auth/callback')}
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      Production: https://your-app.com/api/auth/callback
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setNewRedirectUrl('https://your-app.com/oauth/callback')}
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      Alternative: https://your-app.com/oauth/callback
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={updateRedirectUrl}
                disabled={!newRedirectUrl || isUpdating}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? 'Updating...' : 'Update Redirect URL'}
              </button>
              <button
                onClick={() => {
                  setSelectedClient(null);
                  setNewRedirectUrl('');
                }}
                className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
            </div>
            
            {/* Success/Error Messages */}
            {success && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 text-sm">{success}</p>
              </div>
            )}
            
            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* No Clients Message */}
      {apiToken && !isLoading && clients.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-yellow-900 mb-2">No OAuth Clients Found</h3>
          <p className="text-yellow-800 mb-4">
            No OAuth clients were found for your account. Make sure your API token has the correct permissions.
          </p>
          <a
            href="/create"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Create New OAuth Client
          </a>
        </div>
      )}
    </div>
  );
}
