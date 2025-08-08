import LandingPage from '../components/LandingPage';
import LaunchDarklyDataLoader from '../components/LaunchDarklyDataLoader';


export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const success = params.success;
  const sessionId = params.sessionId as string;
  const error = params.error;
  const errorMessage = params.message;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto p-6">
        
        {/* Success Message */}
        {success === 'oauth_completed' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold text-green-900 mb-2">✅ OAuth Flow Completed Successfully!</h2>
            <p className="text-green-800 mb-3">
              Your OAuth authentication was successful! You can now test your connection and access templates through the navigation.
            </p>
            <div className="text-sm text-green-700">
              <p><strong>Next steps:</strong></p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Test your OAuth connection with LaunchDarkly data</li>
                <li>Access templates and examples through the navigation</li>
                <li>Review security best practices</li>
                <li>Build your own OAuth-enabled app</li>
              </ul>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold text-red-900 mb-2">❌ OAuth Error</h2>
            <p className="text-red-800">
              {errorMessage || 'An error occurred during the OAuth process. Please try again.'}
            </p>
          </div>
        )}

        {/* Main Content */}
        <LandingPage />

        {/* LaunchDarkly Data Loader for OAuth Success */}
        {success === 'oauth_completed' && sessionId && (
          <div className="mt-8">
            <LaunchDarklyDataLoader sessionId={sessionId} />
          </div>
        )}

      </div>
    </div>
  );
}