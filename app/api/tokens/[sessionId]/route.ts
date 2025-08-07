import { NextRequest, NextResponse } from 'next/server';
import { getToken } from '../../../../lib/oauth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const token = getToken(sessionId);
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(token);
  } catch (error) {
    console.error('Error retrieving token:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve token' },
      { status: 500 }
    );
  }
}
