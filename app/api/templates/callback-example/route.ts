import { NextRequest, NextResponse } from 'next/server';
import { generateCallbackExample, TemplateData } from '../../../../lib/templates';

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

    const callbackExample = generateCallbackExample(templateData);

    // Return the callback example as a downloadable HTML file
    return new NextResponse(callbackExample, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': 'attachment; filename="launchdarkly-oauth-callback-example.html"'
      }
    });
  } catch (error) {
    console.error('Error generating callback example:', error);
    return NextResponse.json(
      { error: 'Failed to generate callback example' },
      { status: 500 }
    );
  }
}
