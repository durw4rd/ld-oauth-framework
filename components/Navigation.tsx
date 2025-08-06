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
              Client Manager
            </Link>
            <Link 
              href="/template"
              className={`text-sm font-medium ${
                pathname === '/template' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Template Download
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