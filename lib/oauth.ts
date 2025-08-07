export interface OAuthConfig {
  clientId: string;
  redirectUri: string;
  scope: string;
}

export const LAUNCHDARKLY_OAUTH_CONFIG = {
  authUrl: 'https://app.launchdarkly.com/trust/oauth/authorize',
  tokenUrl: 'https://app.launchdarkly.com/trust/oauth/token',
  scope: 'reader',
  callerIdentityUrl: 'https://app.launchdarkly.com/api/v2/caller-identity'
};

export const buildAuthUrl = (clientId: string, redirectUri: string): string => {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: LAUNCHDARKLY_OAUTH_CONFIG.scope
  });
  
  return `${LAUNCHDARKLY_OAUTH_CONFIG.authUrl}?${params.toString()}`;
};

export const testConnection = async (accessToken: string): Promise<Record<string, unknown>> => {
  try {
    const response = await fetch(LAUNCHDARKLY_OAUTH_CONFIG.callerIdentityUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    throw new Error(`Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}; 

// In-memory session storage (for development - in production, use a proper database)
const sessions = new Map<string, { clientId: string; clientSecret: string; localhostPort: string }>();

export const storeSession = (sessionId: string, clientId: string, clientSecret: string, localhostPort: string) => {
  sessions.set(sessionId, { clientId, clientSecret, localhostPort });
};

export const getSession = (sessionId: string) => {
  return sessions.get(sessionId);
};

export const clearSession = (sessionId: string) => {
  sessions.delete(sessionId);
};

export const exchangeCodeForToken = async (code: string, clientId: string, clientSecret: string, redirectUri: string) => {
  try {
    const response = await fetch('https://app.launchdarkly.com/trust/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Token exchange failed:', response.status, errorText);
      throw new Error(`Token exchange failed: ${response.status} - ${errorText}`);
    }

    const tokenData = await response.json();
    return tokenData;
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    throw error;
  }
}; 