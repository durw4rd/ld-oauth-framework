'use client';
import { useState } from 'react';

interface TemplateDownloadProps {
  clientId: string;
  clientSecret: string;
  redirectUrl: string;
  sessionId: string;
}

export default function TemplateDownload({ clientId, clientSecret, redirectUrl, sessionId }: TemplateDownloadProps) {
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [error, setError] = useState('');

  const downloadTemplate = async (templateType: string) => {
    setIsDownloading(templateType);
    setError('');

    try {
      let response;
      
      if (templateType === 'setup-guide') {
        response = await fetch('/api/templates/setup-guide', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            clientId,
            clientSecret,
            redirectUrl,
            sessionId
          }),
        });
      } else if (templateType === 'callback-example') {
        response = await fetch('/api/templates/callback-example', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            clientId,
            clientSecret,
            redirectUrl,
            sessionId
          }),
        });
      } else if (templateType === 'security-guide') {
        response = await fetch('/api/templates/security-guide', {
          method: 'GET',
        });
      } else {
        throw new Error('Unknown template type');
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Download failed');
      }

      // Get the filename from the response headers
      const contentDisposition = response.headers.get('content-disposition');
      const filename = contentDisposition?.split('filename=')[1]?.replace(/"/g, '') || `${templateType}.md`;

      // Create a blob and download it
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (error) {
      console.error('Download error:', error);
      setError(`Failed to download ${templateType}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDownloading(null);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-white">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Download Templates & Guides</h2>
      
      <div className="space-y-4">
        {/* Setup Guide */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-2">📖 Setup Guide</h3>
          <p className="text-gray-600 mb-3">
            Comprehensive guide with your OAuth credentials, step-by-step instructions, and code examples.
          </p>
          <button
            onClick={() => downloadTemplate('setup-guide')}
            disabled={isDownloading === 'setup-guide'}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isDownloading === 'setup-guide' ? 'Downloading...' : 'Download Setup Guide'}
          </button>
        </div>

        {/* Callback Example */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-2">🔧 Callback Example</h3>
          <p className="text-gray-600 mb-3">
            Working HTML example with your OAuth credentials that demonstrates the complete OAuth flow.
          </p>
          <button
            onClick={() => downloadTemplate('callback-example')}
            disabled={isDownloading === 'callback-example'}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
          >
            {isDownloading === 'callback-example' ? 'Downloading...' : 'Download Callback Example'}
          </button>
        </div>

        {/* Security Guide */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-2">🔒 Security Guide</h3>
          <p className="text-gray-600 mb-3">
            Essential security best practices for implementing OAuth in your applications.
          </p>
          <button
            onClick={() => downloadTemplate('security-guide')}
            disabled={isDownloading === 'security-guide'}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
          >
            {isDownloading === 'security-guide' ? 'Downloading...' : 'Download Security Guide'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
                        <h3 className="text-lg font-medium text-blue-900 mb-2">What you&apos;ll get:</h3>
        <ul className="list-disc list-inside space-y-1 text-blue-800">
          <li><strong>Setup Guide:</strong> Complete instructions with your OAuth credentials</li>
          <li><strong>Callback Example:</strong> Working code example you can run immediately</li>
          <li><strong>Security Guide:</strong> Best practices for secure OAuth implementation</li>
        </ul>
      </div>
    </div>
  );
} 