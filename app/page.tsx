import ClientManager from '../components/ClientManager';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            LaunchDarkly OAuth Framework
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Manual Setup Option */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Manual Setup</h2>
              <p className="text-gray-600 mb-4">
                If you already have an OAuth client, use this option to configure it for testing.
              </p>
              <ClientManager />
            </div>
            
            {/* Auto Setup Option */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Auto Setup</h2>
              <p className="text-gray-600 mb-4">
                Create a new OAuth client automatically using your LaunchDarkly API token.
              </p>
              <Link
                href="/create"
                className="inline-block w-full px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-center"
              >
                Create OAuth Client
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}