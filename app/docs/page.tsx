export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Documentation
          </h1>
          <p className="text-lg sm:text-xl text-gray-600">
            Complete guide to using the LaunchDarkly OAuth Framework
          </p>
        </div>

        {/* Table of Contents */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">📚 Table of Contents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Getting Started</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• <a href="#overview" className="text-blue-600 hover:text-blue-800">Overview</a></li>
                <li>• <a href="#quick-start" className="text-blue-600 hover:text-blue-800">Quick Start</a></li>
                <li>• <a href="#prerequisites" className="text-blue-600 hover:text-blue-800">Prerequisites</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Features</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• <a href="#oauth-creation" className="text-blue-600 hover:text-blue-800">OAuth Client Creation</a></li>
                <li>• <a href="#testing" className="text-blue-600 hover:text-blue-800">Testing OAuth Flows</a></li>
                <li>• <a href="#code-samples" className="text-blue-600 hover:text-blue-800">Code Samples</a></li>
                <li>• <a href="#management" className="text-blue-600 hover:text-blue-800">Client Management</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Overview */}
        <div id="overview" className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">🎯 Overview</h2>
          <div className="prose max-w-none">
            <p className="text-gray-700 mb-4">
              The LaunchDarkly OAuth Framework is designed to simplify the process of building applications 
              that integrate with LaunchDarkly&apos;s OAuth authentication system. It provides:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
              <li><strong>Easy OAuth Client Creation:</strong> Web interface for creating OAuth clients without API calls</li>
              <li><strong>Development Callback Server:</strong> Built-in callback handling for development and testing</li>
              <li><strong>Code Samples:</strong> Ready-to-use code examples in multiple languages</li>
              <li><strong>Client Management:</strong> Tools for updating redirect URLs and managing OAuth clients</li>
              <li><strong>Testing Tools:</strong> Integrated testing interface for OAuth flows</li>
            </ul>
          </div>
        </div>

        {/* Quick Start */}
        <div id="quick-start" className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">⚡ Quick Start</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">1. Create a New OAuth Client</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Navigate to the <a href="/create" className="text-blue-600 hover:text-blue-800">Create Client</a> page</li>
                <li>Enter your LaunchDarkly API token (requires Admin privileges)</li>
                <li>Provide a name for your OAuth client</li>
                <li>Choose redirect URL configuration (framework or custom)</li>
                <li>Click &quot;Create OAuth Client&quot;</li>
              </ol>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">2. Test the OAuth Flow</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>After creation, click &quot;Test OAuth Flow&quot;</li>
                <li>You&apos;ll be redirected to LaunchDarkly&apos;s authorization page</li>
                <li>Complete the authorization process</li>
                <li>Verify the callback handling works correctly</li>
              </ol>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Get Code Samples</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Visit the <a href="/templates" className="text-blue-600 hover:text-blue-800">Templates</a> page</li>
                <li>Choose your preferred programming language</li>
                <li>Copy the code sample with your credentials pre-filled</li>
                <li>Integrate into your application</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Prerequisites */}
        <div id="prerequisites" className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">📋 Prerequisites</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">LaunchDarkly Account</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Active LaunchDarkly account with Admin privileges</li>
                <li>API token with Admin permissions for OAuth client management</li>
                <li>Understanding of OAuth 2.0 flow concepts</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Development Environment</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Modern web browser with JavaScript enabled</li>
                <li>For custom redirect URLs: HTTPS endpoint (localhost won&apos;t work)</li>
                <li>For production: Deployed application with HTTPS callback endpoint</li>
              </ul>
            </div>
          </div>
        </div>

        {/* OAuth Creation */}
        <div id="oauth-creation" className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">🔧 OAuth Client Creation</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Redirect URL Configuration</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-blue-900 mb-2">Option 1: Use Framework as Callback Server</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>✅ No need to expose localhost to internet</li>
                  <li>✅ Works immediately for development</li>
                  <li>⚠️ Need to update OAuth client redirect URL later</li>
                </ul>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2">Option 2: Provide Custom Redirect URL</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>✅ Direct control over callback handling</li>
                  <li>✅ No need to update OAuth client later</li>
                  <li>⚠️ Requires HTTPS endpoint (localhost won&apos;t work)</li>
                  <li>⚠️ Need to set up your own callback server</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Testing */}
        <div id="testing" className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">🧪 Testing OAuth Flows</h2>
          <div className="space-y-4">
            <p className="text-gray-700">
              The framework provides comprehensive testing tools to verify your OAuth implementation:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li><strong>Session Management:</strong> Automatic storage and retrieval of OAuth credentials</li>
              <li><strong>Authorization URL Generation:</strong> Properly formatted URLs for OAuth initiation</li>
              <li><strong>Callback Handling:</strong> Built-in callback processing and token exchange</li>
              <li><strong>Token Storage:</strong> Secure storage of access tokens for testing</li>
              <li><strong>Error Handling:</strong> Comprehensive error reporting and debugging</li>
            </ul>
          </div>
        </div>

        {/* Code Samples */}
        <div id="code-samples" className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">📝 Code Samples</h2>
          <div className="space-y-4">
            <p className="text-gray-700">
              The framework provides ready-to-use code samples in multiple programming languages:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Node.js</h4>
                <p className="text-sm text-gray-600">Express.js implementation with axios for HTTP requests</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Python</h4>
                <p className="text-sm text-gray-600">Flask implementation with requests library</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">cURL</h4>
                <p className="text-sm text-gray-600">Manual OAuth flow using command-line tools</p>
              </div>
            </div>
          </div>
        </div>

        {/* Management */}
        <div id="management" className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">⚙️ Client Management</h2>
          <div className="space-y-4">
            <p className="text-gray-700">
              Advanced tools for managing your OAuth clients:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li><strong>Client Listing:</strong> View all your OAuth clients with details</li>
              <li><strong>Redirect URL Updates:</strong> Update redirect URLs for production deployment</li>
              <li><strong>Client Information:</strong> View client IDs, creation dates, and current settings</li>
              <li><strong>Copy Functions:</strong> Easy copying of client IDs and URLs</li>
            </ul>
          </div>
        </div>

        {/* Best Practices */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">💡 Best Practices</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Security</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Always use HTTPS in production environments</li>
                <li>Store client secrets securely and never expose them in client-side code</li>
                <li>Implement proper token storage and refresh mechanisms</li>
                <li>Use state parameters to prevent CSRF attacks</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Development Workflow</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Start with framework callback server for development</li>
                <li>Test OAuth flows thoroughly before production deployment</li>
                <li>Update redirect URLs when moving to production</li>
                <li>Monitor OAuth client usage and rotate secrets regularly</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Support */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-blue-900 mb-4">🆘 Need Help?</h2>
          <div className="space-y-4">
            <p className="text-blue-800">
              If you encounter issues or need assistance:
            </p>
            <ul className="list-disc list-inside space-y-2 text-blue-800">
              <li>Check the <a href="https://docs.launchdarkly.com/docs/oauth" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">LaunchDarkly OAuth Documentation</a></li>
              <li>Review the <a href="https://docs.launchdarkly.com/docs/api" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">LaunchDarkly API Reference</a></li>
              <li>Use the debug tools in the framework for troubleshooting</li>
              <li>Contact LaunchDarkly support for account-specific issues</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
