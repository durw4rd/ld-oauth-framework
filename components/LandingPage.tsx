'use client';
import { useState } from 'react';
import Link from 'next/link';

type UserPath = 'create-new' | 'use-existing' | null;

export default function LandingPage() {
  const [selectedPath, setSelectedPath] = useState<UserPath>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            LaunchDarkly OAuth Framework
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            Build OAuth-enabled applications with LaunchDarkly&apos;s authentication flow. 
            Get everything you need to create and test OAuth clients with ease.
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
              🚀 What would you like to do today?
            </h2>
            <p className="text-gray-600 px-4">
              Choose the path that best fits your development needs
            </p>
          </div>

          {/* Path Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {/* Create New OAuth Client */}
            <div 
              className={`relative p-4 sm:p-6 rounded-lg border-2 cursor-pointer transition-all duration-200 min-h-[200px] sm:min-h-[220px] ${
                selectedPath === 'create-new'
                  ? 'border-blue-500 bg-blue-50 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
              }`}
              onClick={() => setSelectedPath('create-new')}
            >
              <div className="text-center h-full flex flex-col justify-center">
                <div className="text-3xl mb-3 sm:mb-4">🆕</div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
                  Create New OAuth Client
                </h3>
                <ul className="text-sm text-gray-600 space-y-1 text-left max-w-xs mx-auto">
                  <li>• Generate new OAuth client</li>
                  <li>• Get callback server</li>
                  <li>• Download code samples</li>
                  <li>• Build your app</li>
                </ul>
              </div>
            </div>

            {/* Use Existing OAuth Client */}
            <div 
              className={`relative p-4 sm:p-6 rounded-lg border-2 cursor-pointer transition-all duration-200 min-h-[200px] sm:min-h-[220px] ${
                selectedPath === 'use-existing'
                  ? 'border-blue-500 bg-blue-50 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
              }`}
              onClick={() => setSelectedPath('use-existing')}
            >
              <div className="text-center h-full flex flex-col justify-center">
                <div className="text-3xl mb-3 sm:mb-4">🔧</div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
                  Use Framework as Dev Server
                </h3>
                <ul className="text-sm text-gray-600 space-y-1 text-left max-w-xs mx-auto">
                  <li>• Enter existing credentials</li>
                  <li>• Use framework as callback</li>
                  <li>• Test OAuth flow</li>
                  <li>• Get code samples</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Continue Button */}
          {selectedPath && (
            <div className="text-center mb-6">
              <Link
                href={selectedPath === 'create-new' ? '/create' : '/import'}
                className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 text-base sm:text-lg"
              >
                Continue with {selectedPath === 'create-new' ? 'New Client' : 'Existing Client'}
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          )}

          {/* Info Section */}
          <div className="mt-8 sm:mt-12 bg-white rounded-lg p-4 sm:p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              💡 How it works
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">For New OAuth Clients</h4>
                <p className="text-sm text-gray-600">
                  Create a new OAuth client in LaunchDarkly and use this framework as your development callback server. 
                  Perfect for building new applications from scratch.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">For Existing OAuth Clients</h4>
                <p className="text-sm text-gray-600">
                  Use your existing OAuth client with this framework as a development callback server. 
                  Perfect for testing OAuth flows without exposing localhost.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions for Power Users */}
          <div className="mt-6 sm:mt-8 bg-gray-50 rounded-lg p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              ⚡ Quick Actions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                href="/templates"
                className="flex items-center justify-center px-4 py-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all duration-200 text-sm font-medium text-gray-700"
              >
                📥 View Templates
              </Link>
              <Link
                href="/oauth-client-manager"
                className="flex items-center justify-center px-4 py-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all duration-200 text-sm font-medium text-gray-700"
              >
                🔧 Manage Clients
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
