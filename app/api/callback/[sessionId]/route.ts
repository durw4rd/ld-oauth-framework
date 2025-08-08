import { NextRequest, NextResponse } from 'next/server';
import { validateSessionId, FRAMEWORK_URL } from '../../../../lib/config';
import { getSession, exchangeCodeForToken, storeToken } from '../../../../lib/oauth';

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
  const session = await getSession(sessionId);
  if (!session) {
    console.error('Session not found:', sessionId);
    return NextResponse.redirect(new URL('/?error=session_not_found', request.url));
  }

  // Handle OAuth callback
  if (code) {
    try {
      console.log(`Processing OAuth callback for session: ${sessionId}`);
      
      // Check if there's a custom callback URL to forward to (ngrok-like proxy behavior)
      if (session.customCallbackUrl) {
        console.log(`Forwarding authorization code to: ${session.customCallbackUrl}`);
        // Forward the original authorization code to the local server
        const callbackUrl = new URL(session.customCallbackUrl);
        callbackUrl.searchParams.set('code', code);
        // Also include sessionId for framework-specific features
        callbackUrl.searchParams.set('sessionId', sessionId);
        return NextResponse.redirect(callbackUrl);
      }
      
      // If no custom callback URL, do token exchange in framework (original behavior)
      console.log('No custom callback URL, performing token exchange in framework');
      const redirectUri = `${FRAMEWORK_URL}/api/callback/${sessionId}`;
      const tokenData = await exchangeCodeForToken(code, session.clientId, session.clientSecret, redirectUri);
      
      console.log('Token exchange successful, storing token');
      
      // Store the token in the framework
      storeToken(sessionId, {
        access_token: tokenData.access_token,
        token_type: tokenData.token_type,
        expires_in: tokenData.expires_in
      });
      
      // Fallback: Redirect to framework homepage with success message
      return NextResponse.redirect(new URL(`/?success=oauth_completed&sessionId=${sessionId}`, request.url));
    } catch (error) {
      console.error('Failed to process OAuth callback:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return NextResponse.redirect(new URL(`/?error=token_exchange_failed&message=${encodeURIComponent(errorMessage)}`, request.url));
    }
  }

  // No code provided
  return NextResponse.redirect(new URL('/?error=no_code', request.url));
} 