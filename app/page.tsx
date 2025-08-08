import LandingPage from '../components/LandingPage';
import TemplateDownload from '../components/TemplateDownload';


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
              Your OAuth authentication was successful. You can now download templates and examples to build your own OAuth application.
            </p>
            <div className="text-sm text-green-700">
              <p><strong>Next steps:</strong></p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Download the setup guide with your OAuth credentials</li>
                <li>Get working code examples for your application</li>
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

        {/* Template Download Section for OAuth Success */}
        {success === 'oauth_completed' && sessionId && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Download Templates & Examples
            </h2>
            <p className="text-gray-600 mb-6 text-center">
              Get everything you need to build your own OAuth application with LaunchDarkly.
            </p>
            <TemplateDownload
              clientId="your-client-id"
              clientSecret="your-client-secret"
              redirectUrl={`${process.env.NEXT_PUBLIC_FRAMEWORK_URL || 'http://localhost:3000'}/api/callback/${sessionId}`}
              sessionId={sessionId}
            />
          </div>
        )}
      </div>
    </div>
  );
}