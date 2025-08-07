import { NextRequest, NextResponse } from 'next/server';
import { getSessionInfo, getAllSessions, clearExpiredSessions } from '../../../../lib/oauth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const action = searchParams.get('action');

    // Clear expired sessions if requested
    if (action === 'clear-expired') {
      const clearedCount = clearExpiredSessions();
      return NextResponse.json({
        message: `Cleared ${clearedCount} expired sessions`,
        clearedCount
      });
    }

    if (sessionId) {
      // Get specific session info
      const sessionInfo = getSessionInfo(sessionId);
      return NextResponse.json(sessionInfo);
    } else {
      // List all active sessions (without sensitive data)
      const activeSessions = getAllSessions();
      return NextResponse.json({
        message: 'Active sessions',
        sessions: activeSessions,
        totalActive: activeSessions.length
      });
    }
  } catch (error) {
    console.error('Error checking session:', error);
    return NextResponse.json(
      { error: 'Failed to check session' },
      { status: 500 }
    );
  }
}
