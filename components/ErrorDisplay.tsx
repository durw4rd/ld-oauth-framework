'use client';
import Link from 'next/link';

interface ErrorDisplayProps {
  title: string;
  message: string;
  details?: string;
  suggestions?: string[];
  onRetry?: () => void;
  onBack?: () => void;
}

export default function ErrorDisplay({ 
  title, 
  message, 
  details, 
  suggestions = [], 
  onRetry, 
  onBack 
}: ErrorDisplayProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              {title}
            </h3>
            <p className="text-red-800 mb-4">
              {message}
            </p>
            
            {details && (
              <div className="bg-red-100 border border-red-300 rounded p-3 mb-4">
                <p className="text-red-800 text-sm font-mono">
                  {details}
                </p>
              </div>
            )}
            
            {suggestions.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-red-900 mb-2">Possible solutions:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-red-800">
                  {suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="flex gap-3">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Try Again
                </button>
              )}
              {onBack && (
                <button
                  onClick={onBack}
                  className="px-4 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Go Back
                </button>
              )}
              <Link
                href="/"
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
