import { NextRequest, NextResponse } from 'next/server';
import { storeSession } from '../../../lib/oauth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, clientId, clientSecret, localhostPort, customCallbackUrl } = body;

    if (!sessionId || !clientId || !clientSecret) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId, clientId, clientSecret' },
        { status: 400 }
      );
    }

    // Store session data
    storeSession(sessionId, clientId, clientSecret, localhostPort || '3000', customCallbackUrl);

    console.log(`Session stored for: ${sessionId}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error storing session:', error);
    return NextResponse.json(
      { error: 'Failed to store session' },
      { status: 500 }
    );
  }
}
