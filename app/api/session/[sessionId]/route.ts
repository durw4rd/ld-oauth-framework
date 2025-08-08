import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '../../../../lib/oauth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    
    console.log(`Fetching session data for: ${sessionId}`);
    
    const sessionData = await getSession(sessionId);
    
    if (!sessionData) {
      return NextResponse.json(
        { error: 'Session not found or expired' },
        { status: 404 }
      );
    }
    
    // Return session data without sensitive information
    return NextResponse.json({
      session: {
        clientId: sessionData.clientId,
        clientSecret: sessionData.clientSecret,
        localhostPort: sessionData.localhostPort,
        customCallbackUrl: sessionData.customCallbackUrl,
        createdAt: sessionData.createdAt,
        expiresAt: sessionData.expiresAt
      }
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session data' },
      { status: 500 }
    );
  }
}
