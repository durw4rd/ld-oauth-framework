import { NextRequest, NextResponse } from 'next/server';
import { generateSetupGuide, TemplateData } from '../../../../lib/templates';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientId, clientSecret, redirectUrl, sessionId } = body;

    if (!clientId || !clientSecret || !redirectUrl || !sessionId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const templateData: TemplateData = {
      clientId,
      clientSecret,
      redirectUrl,
      sessionId
    };

    const setupGuide = generateSetupGuide(templateData);

    // Return the setup guide as a downloadable markdown file
    return new NextResponse(setupGuide, {
      headers: {
        'Content-Type': 'text/markdown',
        'Content-Disposition': 'attachment; filename="launchdarkly-oauth-setup-guide.md"'
      }
    });
  } catch (error) {
    console.error('Error generating setup guide:', error);
    return NextResponse.json(
      { error: 'Failed to generate setup guide' },
      { status: 500 }
    );
  }
}
