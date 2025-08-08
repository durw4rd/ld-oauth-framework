import OAuthTester from '../../../components/OAuthTester';

interface TestPageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function TestPage({ params }: TestPageProps) {
  const { sessionId } = await params;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto p-6">
        <OAuthTester sessionId={sessionId} />
      </div>
    </div>
  );
}
