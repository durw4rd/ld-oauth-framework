import Link from 'next/link';

export default function TemplatePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Template Download
          </h1>
          <p className="text-gray-600 mb-6 text-center">
            This page is for demonstration purposes. Please use the main application to download templates with your actual OAuth credentials.
          </p>
          <div className="text-center">
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Main Application
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 