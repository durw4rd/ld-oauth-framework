import { NextRequest, NextResponse } from 'next/server';
import { getLocalhostPort, validateSessionId } from '../../../../lib/config';

type Props = {
  params: { sessionId: string };
};

export async function GET(
  request: NextRequest,
  { params }: Props
) {
  const { sessionId } = await params;
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  // Validate session ID
  if (!validateSessionId(sessionId)) {
    console.error('Invalid session ID:', sessionId);
    return NextResponse.redirect(new URL('/?error=invalid_session', request.url));
  }

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error);
    return NextResponse.redirect(new URL(`/?error=oauth_error&message=${encodeURIComponent(error)}`, request.url));
  }

  // Forward to localhost
  if (code) {
    const localhostPort = getLocalhostPort();
    const localhostUrl = `http://localhost:${localhostPort}/oauth/callback?code=${code}&sessionId=${sessionId}`;
    
    try {
      console.log(`Forwarding OAuth callback to: ${localhostUrl}`);
      
      // Attempt to forward the callback
      const response = await fetch(localhostUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Successfully forwarded, redirect to localhost
        return NextResponse.redirect(`http://localhost:${localhostPort}`);
      } else {
        console.error('Localhost responded with error:', response.status);
        return NextResponse.redirect(new URL(`/?error=localhost_error&status=${response.status}`, request.url));
      }
    } catch (error) {
      console.error('Failed to forward callback:', error);
      return NextResponse.redirect(new URL('/?error=connection_failed', request.url));
    }
  }

  // No code provided
  return NextResponse.redirect(new URL('/?error=no_code', request.url));
} 