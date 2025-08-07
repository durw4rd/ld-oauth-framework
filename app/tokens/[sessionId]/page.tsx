import TokenViewer from '../../../components/TokenViewer';

export default function TokenPage({ params }: { params: Promise<{ sessionId: string }> }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <TokenViewer sessionId={params} />
    </div>
  );
}
