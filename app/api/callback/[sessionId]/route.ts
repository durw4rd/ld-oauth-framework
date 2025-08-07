import { NextRequest, NextResponse } from 'next/server';
import { getLocalhostPort, validateSessionId, FRAMEWORK_URL } from '../../../../lib/config';
import { getSession, exchangeCodeForToken } from '../../../../lib/oauth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
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

  // Get session data
  const session = getSession(sessionId);
  if (!session) {
    console.error('Session not found:', sessionId);
    return NextResponse.redirect(new URL('/?error=session_not_found', request.url));
  }

  // Handle OAuth callback
  if (code) {
    try {
      console.log(`Processing OAuth callback for session: ${sessionId}`);
      
      // Exchange code for token
      const redirectUri = `${FRAMEWORK_URL}/api/callback/${sessionId}`;
      const tokenData = await exchangeCodeForToken(code, session.clientId, session.clientSecret, redirectUri);
      
      console.log('Token exchange successful, forwarding to localhost');
      
      // Forward to localhost with access token
      const localhostPort = session.localhostPort || getLocalhostPort();
      
      // Use custom callback URL if provided, otherwise use localhost
      let targetUrl: string;
      if (session.customCallbackUrl) {
        // Extract base URL from custom callback URL
        const url = new URL(session.customCallbackUrl);
        targetUrl = `${url.protocol}//${url.host}`;
      } else {
        // Use ngrok URL if available, otherwise fall back to localhost
        targetUrl = process.env.NGROK_URL || `http://localhost:${localhostPort}`;
      }
      
      const localhostUrl = `${targetUrl}/oauth/callback`;
      
      console.log(`Forwarding token to: ${localhostUrl}`);
      
      const response = await fetch(localhostUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_token: tokenData.access_token,
          token_type: tokenData.token_type,
          expires_in: tokenData.expires_in,
          sessionId: sessionId
        }),
      });

      if (response.ok) {
        console.log('Successfully forwarded token to localhost');
        // Redirect to localhost
        return NextResponse.redirect(`http://localhost:${localhostPort}`);
      } else {
        const errorText = await response.text();
        console.error('Localhost responded with error:', response.status, errorText);
        return NextResponse.redirect(new URL(`/?error=localhost_error&status=${response.status}&message=${encodeURIComponent(errorText)}`, request.url));
      }
    } catch (error) {
      console.error('Failed to process OAuth callback:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return NextResponse.redirect(new URL(`/?error=token_exchange_failed&message=${encodeURIComponent(errorMessage)}`, request.url));
    }
  }

  // No code provided
  return NextResponse.redirect(new URL('/?error=no_code', request.url));
} 