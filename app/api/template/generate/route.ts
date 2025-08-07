import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, accessToken, clientId } = body;

    if (!sessionId || !accessToken) {
      return NextResponse.json(
        { error: 'Session ID and access token are required' },
        { status: 400 }
      );
    }

    // Generate the HTML template with pre-configured values
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
        .token-info { background: #e8f5e8; padding: 10px; border-radius: 4px; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <h1>LaunchDarkly OAuth Template</h1>
        <p>This template demonstrates OAuth authentication with LaunchDarkly.</p>
        
        <div class="token-info">
            <h3>✅ Pre-configured with Access Token</h3>
            <p><strong>Session ID:</strong> ${sessionId}</p>
            <p><strong>Client ID:</strong> ${clientId}</p>
            <p><strong>Token Type:</strong> Bearer</p>
            <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        </div>
        
        <div id="test-section">
            <h2>Test Connection</h2>
            <p>Test your connection to LaunchDarkly API:</p>
            <button id="test-btn" class="button" onclick="testConnection()">Test Connection</button>
            <div id="test-result"></div>
        </div>
        
        <div id="logout-section">
            <h2>Clear Token</h2>
            <button id="logout-btn" class="button" onclick="logout()">Clear Token</button>
        </div>
        
        <div id="status"></div>
    </div>

    <script>
        // Pre-configured values
        const ACCESS_TOKEN = '${accessToken}';
        const SESSION_ID = '${sessionId}';
        const CLIENT_ID = '${clientId}';
        
        // Store token in localStorage for persistence
        localStorage.setItem('ld_access_token', ACCESS_TOKEN);
        localStorage.setItem('ld_session_id', SESSION_ID);
        localStorage.setItem('ld_client_id', CLIENT_ID);
        
        function testConnection() {
            const token = localStorage.getItem('ld_access_token');
            if (!token) {
                showStatus('No access token found.', 'error');
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
            localStorage.removeItem('ld_session_id');
            localStorage.removeItem('ld_client_id');
            showStatus('Token cleared successfully.', 'info');
        }
        
        function showStatus(message, type) {
            const statusDiv = document.getElementById('status');
            statusDiv.innerHTML = \`<div class="status \${type}">\${message}</div>\`;
            setTimeout(() => {
                statusDiv.innerHTML = '';
            }, 5000);
        }
        
        // Auto-test connection on page load
        window.onload = function() {
            showStatus('Template loaded with pre-configured access token. Ready to test!', 'info');
        };
    </script>
</body>
</html>`;

    return new NextResponse(templateContent, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="launchdarkly-oauth-${sessionId}.html"`
      }
    });
  } catch (error) {
    console.error('Error generating template:', error);
    return NextResponse.json(
      { error: 'Failed to generate template' },
      { status: 500 }
    );
  }
}
