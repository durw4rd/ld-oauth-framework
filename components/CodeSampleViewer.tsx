'use client';
import { useState } from 'react';
import Link from 'next/link';

interface CodeSample {
  language: string;
  title: string;
  code: string;
  description: string;
}

interface CodeSampleViewerProps {
  clientId: string;
  clientSecret: string;
  redirectUrl: string;
}

export default function CodeSampleViewer({ clientId, clientSecret, redirectUrl }: CodeSampleViewerProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('nodejs');
  const [copied, setCopied] = useState<string | null>(null);

  const codeSamples: CodeSample[] = [
    {
      language: 'nodejs',
      title: 'Node.js',
      description: 'Complete OAuth flow implementation using Express.js',
      code: `import express from 'express';
import axios from 'axios';

const app = express();
app.use(express.json());

const CLIENT_ID = '${clientId}';
const CLIENT_SECRET = '${clientSecret}';
const REDIRECT_URI = '${redirectUrl}';

// Root route - landing page
app.get('/', (req, res) => {
  res.send(\`
    <!DOCTYPE html>
    <html>
    <head>
      <title>LaunchDarkly OAuth Client</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
        .button { display: inline-block; padding: 10px 20px; background: #0066cc; color: white; text-decoration: none; border-radius: 5px; }
        .button:hover { background: #0052a3; }
      </style>
    </head>
    <body>
      <h1>LaunchDarkly OAuth Client</h1>
      <p>This is a simple OAuth client for LaunchDarkly. Click the button below to start the OAuth flow.</p>
      <div style="background: #f0f8ff; border: 1px solid #0066cc; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <strong>📋 Important:</strong> When configuring your OAuth client, use this callback URL:
        <br><code style="background: #fff; padding: 5px; border-radius: 3px;">http://localhost:3000/callback</code>
        <br><small>✅ This server works with both direct OAuth and framework proxy - no code changes needed!</small>
      </div>
      <a href="/auth" class="button">Start OAuth Flow</a>
      <p><small>Available routes:</small></p>
      <ul>
        <li><code>/</code> - This page</li>
        <li><code>/auth</code> - Start OAuth authorization</li>
        <li><code>/callback</code> - Handle OAuth callback</li>
      </ul>
    </body>
    </html>
  \`);
});

// Step 1: Redirect user to LaunchDarkly authorization
app.get('/auth', (req, res) => {
  const authUrl = \`https://app.launchdarkly.com/trust/oauth/authorize?\${new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: 'reader'
  })}\`;
  
  res.redirect(authUrl);
});

// Step 2: Handle the callback
app.get('/callback', async (req, res) => {
  const { code, sessionId } = req.query;
  
  if (!code) {
    return res.status(400).json({ error: 'Authorization code not provided' });
  }

  try {
    // Exchange code for access token (works with both direct OAuth and framework proxy)
    const tokenResponse = await axios.post('https://app.launchdarkly.com/trust/oauth/token', {
      grant_type: 'authorization_code',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code,
      redirect_uri: REDIRECT_URI
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const { access_token } = tokenResponse.data;
    
    // Log if this came through the framework
    if (sessionId) {
      console.log('OAuth flow completed via framework proxy for session:', sessionId);
    } else {
      console.log('OAuth flow completed directly');
    }
    
    // Example 1: Get caller identity
    const userResponse = await axios.get('https://app.launchdarkly.com/api/v2/caller-identity', {
      headers: {
        'Authorization': \`Bearer \${access_token}\`
      }
    });

    // Example 2: List all projects
    const projectsResponse = await axios.get('https://app.launchdarkly.com/api/v2/projects', {
      headers: {
        'Authorization': \`Bearer \${access_token}\`
      }
    });

    // Example 3: Get flags from a specific project (using first project as example)
    let flags = [];
    if (projectsResponse.data.items && projectsResponse.data.items.length > 0) {
      const firstProject = projectsResponse.data.items[0];
      const flagsResponse = await axios.get(\`https://app.launchdarkly.com/api/v2/flags/\${firstProject.key}\`, {
        headers: {
          'Authorization': \`Bearer \${access_token}\`
        }
      });
      flags = flagsResponse.data.items || [];
    }

    res.json({
      success: true,
      user: userResponse.data,
      projects: projectsResponse.data.items,
      flags: flags.slice(0, 5), // Show first 5 flags
      access_token
    });
  } catch (error) {
    console.error('Token exchange error:', error);
    res.status(500).json({ error: 'Failed to exchange code for token' });
  }
});

app.listen(3000, () => {
  console.log('🚀 Server running on http://localhost:3000');
  console.log('📋 Callback URL: http://localhost:3000/callback');
  console.log('✅ Works with both direct OAuth and framework proxy!');
  console.log('🔍 Framework proxy forwards authorization code transparently');
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error('❌ Error: Port 3000 is already in use!');
    console.error('   Please either:');
    console.error('   1. Stop the process using port 3000');
    console.error('   2. Use a different port by changing the port number in the code');
    console.error('   3. Run: lsof -ti:3000 | xargs kill -9 (to force kill processes on port 3000)');
    console.error('');
    console.error('   You can check what\\'s using the port with: lsof -i :3000');
  } else {
    console.error('❌ Server error:', err);
  }
  process.exit(1);
});

// Example: Using the access token for API calls
// You can add these functions to your application to interact with LaunchDarkly API

async function getCallerIdentity(accessToken) {
  try {
    const response = await axios.get('https://app.launchdarkly.com/api/v2/caller-identity', {
      headers: {
        'Authorization': \`Bearer \${accessToken}\`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to get caller identity:', error.message);
    throw error;
  }
}

async function listProjects(accessToken) {
  try {
    const response = await axios.get('https://app.launchdarkly.com/api/v2/projects', {
      headers: {
        'Authorization': \`Bearer \${accessToken}\`
      }
    });
    return response.data.items;
  } catch (error) {
    console.error('Failed to list projects:', error.message);
    throw error;
  }
}

async function getFlags(accessToken, projectKey) {
  try {
    const response = await axios.get(\`https://app.launchdarkly.com/api/v2/flags/\${projectKey}\`, {
      headers: {
        'Authorization': \`Bearer \${accessToken}\`
      }
    });
    return response.data.items;
  } catch (error) {
    console.error(\`Failed to get flags for project \${projectKey}:\`, error.message);
    throw error;
  }
}

// Example usage:
// const identity = await getCallerIdentity(access_token);
// const projects = await listProjects(access_token);
// const flags = await getFlags(access_token, 'your-project-key');`
    },
    {
      language: 'python',
      title: 'Python',
      description: 'OAuth flow implementation using Flask',
      code: `from flask import Flask, request, redirect, jsonify
import requests
import urllib.parse

app = Flask(__name__)

CLIENT_ID = '${clientId}'
CLIENT_SECRET = '${clientSecret}'
REDIRECT_URI = '${redirectUrl}'

@app.route('/auth')
def auth():
    """Redirect user to LaunchDarkly authorization"""
    params = {
        'client_id': CLIENT_ID,
        'redirect_uri': REDIRECT_URI,
        'response_type': 'code',
        'scope': 'reader'
    }
    
    auth_url = f"https://app.launchdarkly.com/trust/oauth/authorize?{urllib.parse.urlencode(params)}"
    return redirect(auth_url)

@app.route('/callback')
def callback():
    """Handle the OAuth callback"""
    code = request.args.get('code')
    
    if not code:
        return jsonify({'error': 'Authorization code not provided'}), 400

    try:
        # Exchange code for access token
        token_data = {
            'grant_type': 'authorization_code',
            'client_id': CLIENT_ID,
            'client_secret': CLIENT_SECRET,
            'code': code,
            'redirect_uri': REDIRECT_URI
        }
        
        token_response = requests.post(
            'https://app.launchdarkly.com/trust/oauth/token',
            data=token_data,
            headers={'Content-Type': 'application/x-www-form-urlencoded'}
        )
        
        token_response.raise_for_status()
        token_info = token_response.json()
        access_token = token_info['access_token']
        
        # Use the access token to make API calls
        user_response = requests.get(
            'https://app.launchdarkly.com/api/v2/caller-identity',
            headers={'Authorization': f'Bearer {access_token}'}
        )
        
        # Example 1: Get caller identity
        user_data = user_response.json()
        
        # Example 2: List all projects
        projects_response = requests.get(
            'https://app.launchdarkly.com/api/v2/projects',
            headers={'Authorization': f'Bearer {access_token}'}
        )
        projects_data = projects_response.json()
        
        # Example 3: Get flags from first project (if available)
        flags_data = []
        if projects_data.get('items') and len(projects_data['items']) > 0:
            first_project = projects_data['items'][0]
            flags_response = requests.get(
                f'https://app.launchdarkly.com/api/v2/flags/{first_project["key"]}',
                headers={'Authorization': f'Bearer {access_token}'}
            )
            flags_data = flags_response.json().get('items', [])
        
        return jsonify({
            'success': True,
            'user': user_data,
            'projects': projects_data.get('items', []),
            'flags': flags_data[:5],  # Show first 5 flags
            'access_token': access_token
        })
        
    except requests.RequestException as e:
        print(f'Token exchange error: {e}')
        return jsonify({'error': 'Failed to exchange code for token'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=3000)`
    },
    {
      language: 'curl',
      title: 'cURL',
      description: 'Manual OAuth flow using cURL commands',
      code: `# Step 1: Open this URL in your browser to authorize
# https://app.launchdarkly.com/trust/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUrl)}&response_type=code&scope=reader

# Step 2: After authorization, you'll get a code. Replace YOUR_CODE_HERE with the actual code
CODE="YOUR_CODE_HERE"

# Step 3: Exchange the code for an access token
curl -X POST https://app.launchdarkly.com/trust/oauth/token \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d "grant_type=authorization_code" \\
  -d "client_id=${clientId}" \\
  -d "client_secret=${clientSecret}" \\
  -d "code=\$CODE" \\
  -d "redirect_uri=${redirectUrl}"

# Step 4: Use the access token to make API calls
# Replace YOUR_ACCESS_TOKEN with the token from the previous response
ACCESS_TOKEN="YOUR_ACCESS_TOKEN"

# Get caller identity
curl -H "Authorization: Bearer \$ACCESS_TOKEN" \\
  https://app.launchdarkly.com/api/v2/caller-identity

# List all projects
curl -H "Authorization: Bearer \$ACCESS_TOKEN" \\
  https://app.launchdarkly.com/api/v2/projects

# Get flags from a specific project (replace PROJECT_KEY with actual project key)
curl -H "Authorization: Bearer \$ACCESS_TOKEN" \\
  https://app.launchdarkly.com/api/v2/flags/PROJECT_KEY`
    },
    {
      language: 'api-examples',
      title: 'API Examples',
      description: 'Practical examples of using the access token with LaunchDarkly API',
      code: `// After completing the OAuth flow, you can use the access token to interact with LaunchDarkly API
// Here are practical examples for common use cases:

// 1. Get caller identity (who is authenticated)
async function getCallerIdentity(accessToken) {
  try {
    const response = await fetch('https://app.launchdarkly.com/api/v2/caller-identity', {
      headers: {
        'Authorization': \`Bearer \${accessToken}\`
      }
    });
    
    if (!response.ok) {
      throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to get caller identity:', error.message);
    throw error;
  }
}

// 2. List all projects in the account
async function listProjects(accessToken) {
  try {
    const response = await fetch('https://app.launchdarkly.com/api/v2/projects', {
      headers: {
        'Authorization': \`Bearer \${accessToken}\`
      }
    });
    
    if (!response.ok) {
      throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
    }
    
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Failed to list projects:', error.message);
    throw error;
  }
}

// 3. Get feature flags from a specific project
async function getFlags(accessToken, projectKey) {
  try {
    const response = await fetch(\`https://app.launchdarkly.com/api/v2/flags/\${projectKey}\`, {
      headers: {
        'Authorization': \`Bearer \${accessToken}\`
      }
    });
    
    if (!response.ok) {
      throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
    }
    
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error(\`Failed to get flags for project \${projectKey}:\`, error.message);
    throw error;
  }
}

// Example usage workflow:
async function demonstrateApiUsage(accessToken) {
  try {
    // Step 1: Get caller identity
    const identity = await getCallerIdentity(accessToken);
    console.log('Authenticated as:', identity);
    
    // Step 2: List all projects
    const projects = await listProjects(accessToken);
    console.log('Available projects:', projects);
    
    // Step 3: Get flags from the first project
    if (projects.length > 0) {
      const firstProject = projects[0];
      const flags = await getFlags(accessToken, firstProject.key);
      console.log(\`Flags in \${firstProject.name}:\`, flags);
    }
    
  } catch (error) {
    console.error('API demonstration failed:', error.message);
  }
}

// Node.js with axios:
const axios = require('axios');

async function getCallerIdentityAxios(accessToken) {
  try {
    const response = await axios.get('https://app.launchdarkly.com/api/v2/caller-identity', {
      headers: {
        'Authorization': \`Bearer \${accessToken}\`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to get caller identity:', error.message);
    throw error;
  }
}

// Python with requests:
import requests

def get_caller_identity(access_token):
    try:
        response = requests.get(
            'https://app.launchdarkly.com/api/v2/caller-identity',
            headers={'Authorization': f'Bearer {access_token}'}
        )
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        print(f'Failed to get caller identity: {e}')
        raise`
    }
  ];

  const copyToClipboard = async (text: string, language: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(language);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const selectedSample = codeSamples.find(sample => sample.language === selectedLanguage) || codeSamples[0];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Code Samples for Your OAuth App
        </h1>
        <p className="text-gray-600">
          Copy and paste these code samples into your application to implement OAuth authentication with LaunchDarkly.
        </p>
      </div>

      {/* Language Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {codeSamples.map((sample) => (
          <button
            key={sample.language}
            onClick={() => setSelectedLanguage(sample.language)}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              selectedLanguage === sample.language
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {sample.title}
          </button>
        ))}
      </div>

      {/* Code Sample */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{selectedSample.title}</h3>
              <p className="text-sm text-gray-600">{selectedSample.description}</p>
            </div>
            <button
              onClick={() => copyToClipboard(selectedSample.code, selectedLanguage)}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {copied === selectedLanguage ? 'Copied!' : 'Copy Code'}
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
            <code>{selectedSample.code}</code>
          </pre>
        </div>
      </div>

      {/* Additional Resources */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Additional Resources</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-blue-900 mb-2">📖 Documentation</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <a href="https://docs.launchdarkly.com/docs/oauth" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">LaunchDarkly OAuth Documentation</a></li>
              <li>• <a href="https://docs.launchdarkly.com/docs/api" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">LaunchDarkly API Reference</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-blue-900 mb-2">🔧 Tools</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <Link href="/test/${sessionId}" className="underline hover:text-blue-600">Test OAuth Flow</Link></li>
              <li>• <a href="/oauth-client-manager" className="underline hover:text-blue-600">Manage OAuth Client</a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
