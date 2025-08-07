'use client';

import { useState } from 'react';

export default function TemplateDownload() {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateTemplate = async () => {
    setIsGenerating(true);

    try {
      // Create the template HTML content
      const templateContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LaunchDarkly OAuth Template</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .button { background: #0066cc; color: white; padding: 12px 24px; border: none; border-radius: 4px; cursor: pointer; margin: 10px 5px; }
        .button:hover { background: #0052a3; }
        .button:disabled { background: #ccc; cursor: not-allowed; }
        .status { padding: 10px; margin: 10px 0; border-radius: 4px; }
        .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        .info { background: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb; }
        .hidden { display: none; }
        pre { background: #f8f9fa; padding: 15px; border-radius: 4px; overflow-x: auto; }
    </style>
</head>
<body>
    <div class="container">
        <h1>LaunchDarkly OAuth Template</h1>
        <p>This template demonstrates OAuth authentication with LaunchDarkly.</p>
        
        <div id="login-section">
            <h2>Step 1: Authenticate</h2>
            <p>Click the button below to authenticate with LaunchDarkly:</p>
            <button id="login-btn" class="button" onclick="login()">Login with LaunchDarkly</button>
        </div>
        
        <div id="test-section" class="hidden">
            <h2>Step 2: Test Connection</h2>
            <p>Test your connection to LaunchDarkly API:</p>
            <button id="test-btn" class="button" onclick="testConnection()">Test Connection</button>
            <div id="test-result"></div>
        </div>
        
        <div id="logout-section" class="hidden">
            <h2>Step 3: Logout</h2>
            <button id="logout-btn" class="button" onclick="logout()">Logout</button>
        </div>
        
        <div id="status"></div>
    </div>

    <script>
        // Configuration - Update these values
        const CLIENT_ID = 'your-client-id-here';
        const REDIRECT_URI = 'https://ld-oauth-framework.vercel.app/api/callback/your-session-id';
        const SESSION_ID = 'your-session-id-here';
        
        // Check if we have a token on page load
        window.onload = function() {
            const token = localStorage.getItem('ld_access_token');
            if (token) {
                showAuthenticatedState();
            }
        };
        
        function login() {
            const params = new URLSearchParams({
                client_id: CLIENT_ID,
                redirect_uri: REDIRECT_URI,
                response_type: 'code',
                scope: 'reader'
            });
            
            const authUrl = \`https://app.launchdarkly.com/trust/oauth/authorize?\${params.toString()}\`;
            window.location.href = authUrl;
        }
        
        function testConnection() {
            const token = localStorage.getItem('ld_access_token');
            if (!token) {
                showStatus('No access token found. Please login first.', 'error');
                return;
            }
            
            document.getElementById('test-btn').disabled = true;
            document.getElementById('test-btn').textContent = 'Testing...';
            
            fetch('https://app.launchdarkly.com/api/v2/caller-identity', {
                headers: {
                    'Authorization': \`Bearer \${token}\`,
                    'Content-Type': 'application/json'
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
                }
                return response.json();
            })
            .then(data => {
                const resultDiv = document.getElementById('test-result');
                resultDiv.innerHTML = \`
                    <div class="status success">
                        <h3>✅ Connection Successful!</h3>
                        <p><strong>Account:</strong> \${data.accountId || 'N/A'}</p>
                        <p><strong>Project:</strong> \${data.projectName || 'N/A'}</p>
                        <p><strong>Environment:</strong> \${data.environmentName || 'N/A'}</p>
                        <p><strong>Token Type:</strong> \${data.tokenKind || 'N/A'}</p>
                    </div>
                    <pre>\${JSON.stringify(data, null, 2)}\</pre>
                \`;
                showStatus('Connection test completed successfully!', 'success');
            })
            .catch(error => {
                const resultDiv = document.getElementById('test-result');
                resultDiv.innerHTML = \`
                    <div class="status error">
                        <h3>❌ Connection Failed</h3>
                        <p>\${error.message}</p>
                    </div>
                \`;
                showStatus('Connection test failed. Please check your token.', 'error');
            })
            .finally(() => {
                document.getElementById('test-btn').disabled = false;
                document.getElementById('test-btn').textContent = 'Test Connection';
            });
        }
        
        function logout() {
            localStorage.removeItem('ld_access_token');
            showUnauthenticatedState();
            showStatus('Logged out successfully.', 'info');
        }
        
        function showAuthenticatedState() {
            document.getElementById('login-section').classList.add('hidden');
            document.getElementById('test-section').classList.remove('hidden');
            document.getElementById('logout-section').classList.remove('hidden');
        }
        
        function showUnauthenticatedState() {
            document.getElementById('login-section').classList.remove('hidden');
            document.getElementById('test-section').classList.add('hidden');
            document.getElementById('logout-section').classList.add('hidden');
            document.getElementById('test-result').innerHTML = '';
        }
        
        function showStatus(message, type) {
            const statusDiv = document.getElementById('status');
            statusDiv.innerHTML = \`<div class="status \${type}">\${message}</div>\`;
            setTimeout(() => {
                statusDiv.innerHTML = '';
            }, 5000);
        }
        
        // Handle OAuth callback
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        if (code) {
            // In a real implementation, you would exchange the code for a token
            // For this template, we'll simulate a successful token exchange
            const mockToken = 'mock-access-token-' + Date.now();
            localStorage.setItem('ld_access_token', mockToken);
            showAuthenticatedState();
            showStatus('Authentication successful! You can now test the connection.', 'success');
            
            // Clean up the URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    </script>
</body>
</html>`;

      // Create a blob and download it
      const blob = new Blob([templateContent], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'launchdarkly-oauth-template.html';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (error) {
      console.error('Failed to generate template:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Static Site Template
        </h1>

        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h3 className="text-lg font-medium text-blue-900 mb-2">About the Template</h3>
            <p className="text-blue-800">
              This template provides a complete OAuth integration with LaunchDarkly. It includes:
            </p>
            <ul className="list-disc list-inside mt-2 text-blue-800 space-y-1">
              <li>OAuth authentication flow</li>
              <li>Connection testing using the LaunchDarkly API</li>
              <li>Token storage in localStorage</li>
              <li>Simple UI for testing and verification</li>
            </ul>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <h3 className="text-lg font-medium text-yellow-900 mb-2">Before Using</h3>
            <p className="text-yellow-800">
              After downloading, you&apos;ll need to update these values in the template:
            </p>
            <ul className="list-disc list-inside mt-2 text-yellow-800 space-y-1">
              <li><code>CLIENT_ID</code> - Your LaunchDarkly OAuth client ID</li>
              <li><code>REDIRECT_URI</code> - The callback URL from the framework</li>
              <li><code>SESSION_ID</code> - Your unique session ID</li>
            </ul>
          </div>

          <div className="text-center">
            <button
              onClick={generateTemplate}
              disabled={isGenerating}
              className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isGenerating ? 'Generating...' : 'Download Template'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 