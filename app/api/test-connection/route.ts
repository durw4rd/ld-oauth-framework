import { NextRequest, NextResponse } from 'next/server';
import { testConnection } from '../../../lib/oauth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accessToken } = body;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Access token is required' },
        { status: 400 }
      );
    }

    // Test the connection using the access token
    const data = await testConnection(accessToken);
    
    return NextResponse.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Connection test failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Connection test failed' },
      { status: 500 }
    );
  }
}
