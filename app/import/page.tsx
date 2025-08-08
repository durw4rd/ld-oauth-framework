import OAuthClientImporter from '../../components/OAuthClientImporter';

export default function ImportPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto p-6">
        <OAuthClientImporter />
      </div>
    </div>
  );
}
