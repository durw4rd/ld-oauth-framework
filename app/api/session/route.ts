import { NextRequest, NextResponse } from 'next/server';
import { storeSession } from '../../../lib/oauth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, clientId, clientSecret } = body;

    console.log('Received session storage request:', { sessionId, clientId, clientSecret: '***' });

    if (!sessionId || !clientId || !clientSecret) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId, clientId, clientSecret' },
        { status: 400 }
      );
    }

    // Store session data
    await storeSession(sessionId, clientId, clientSecret, '3000');

    console.log(`Session stored successfully for: ${sessionId}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error storing session:', error);
    return NextResponse.json(
      { error: 'Failed to store session' },
      { status: 500 }
    );
  }
}
