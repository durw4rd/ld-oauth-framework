'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link 
              href="/"
              className={`text-sm font-medium ${
                pathname === '/' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Home
            </Link>
            <Link 
              href="/create"
              className={`text-sm font-medium ${
                pathname === '/create' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Create Client
            </Link>
            <Link 
              href="/import"
              className={`text-sm font-medium ${
                pathname === '/import' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Dev Server
            </Link>
            <Link 
              href="/templates"
              className={`text-sm font-medium ${
                pathname === '/templates' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Templates
            </Link>
            <Link 
              href="/oauth-client-manager"
              className={`text-sm font-medium ${
                pathname === '/oauth-client-manager' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Manage
            </Link>
            <Link 
              href="/docs"
              className={`text-sm font-medium ${
                pathname === '/docs' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Docs
            </Link>
          </div>
          <div className="text-sm text-gray-500">
            LaunchDarkly OAuth Framework
          </div>
        </div>
      </div>
    </nav>
  );
} 