import CodeSampleViewer from '../../components/CodeSampleViewer';

export default function TemplatesPage() {
  // For now, we'll use placeholder values. In a real implementation,
  // these would come from the session or URL parameters
  const placeholderValues = {
    clientId: 'your-client-id',
    clientSecret: 'your-client-secret',
    redirectUrl: 'https://ld-oauth-framework.vercel.app/api/callback/your-session-id',
    sessionId: 'your-session-id'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto p-6">
        <CodeSampleViewer {...placeholderValues} />
      </div>
    </div>
  );
}
