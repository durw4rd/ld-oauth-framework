import { NextRequest, NextResponse } from 'next/server';
import { getSessionInfo, getAllSessions, clearExpiredSessions } from '../../../../lib/oauth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const action = searchParams.get('action');

    if (action === 'clear-expired') {
      const clearedCount = clearExpiredSessions();
      return NextResponse.json({ message: `Cleared ${clearedCount} expired sessions`, clearedCount });
    }

    if (sessionId) {
      const sessionInfo = getSessionInfo(sessionId);
      return NextResponse.json(sessionInfo);
    } else {
      const activeSessions = getAllSessions();
      return NextResponse.json({ 
        message: 'Active sessions', 
        sessions: activeSessions, 
        totalActive: activeSessions.length,
        debug: {
          totalSessionsInMemory: activeSessions.length,
          sessionKeys: activeSessions.map(s => s.sessionId)
        }
      });
    }
  } catch (error) {
    console.error('Error checking session:', error);
    return NextResponse.json({ error: 'Failed to check session' }, { status: 500 });
  }
}
