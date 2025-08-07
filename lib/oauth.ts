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

// In-memory session storage with expiration
interface SessionData {
  clientId: string;
  clientSecret: string;
  localhostPort: string;
  customCallbackUrl?: string;
  createdAt: number;
  expiresAt: number;
}

const sessions = new Map<string, SessionData>();

// Session expiration time (24 hours)
const SESSION_EXPIRY_HOURS = 24;

export const storeSession = (sessionId: string, clientId: string, clientSecret: string, localhostPort: string, customCallbackUrl?: string) => {
  const now = Date.now();
  const expiresAt = now + (SESSION_EXPIRY_HOURS * 60 * 60 * 1000);
  
  sessions.set(sessionId, { 
    clientId, 
    clientSecret, 
    localhostPort, 
    customCallbackUrl,
    createdAt: now,
    expiresAt 
  });
  
  console.log(`Session stored for: ${sessionId}, expires at: ${new Date(expiresAt).toISOString()}`);
};

export const getSession = (sessionId: string) => {
  const session = sessions.get(sessionId);
  
  if (!session) {
    return null;
  }
  
  // Check if session has expired
  if (Date.now() > session.expiresAt) {
    console.log(`Session expired: ${sessionId}`);
    sessions.delete(sessionId);
    return null;
  }
  
  return session;
};

export const clearSession = (sessionId: string) => {
  sessions.delete(sessionId);
};

export const clearExpiredSessions = () => {
  const now = Date.now();
  let clearedCount = 0;
  
  for (const [sessionId, session] of sessions.entries()) {
    if (now > session.expiresAt) {
      sessions.delete(sessionId);
      clearedCount++;
    }
  }
  
  if (clearedCount > 0) {
    console.log(`Cleared ${clearedCount} expired sessions`);
  }
  
  return clearedCount;
};

export const getSessionInfo = (sessionId: string) => {
  const session = sessions.get(sessionId);
  
  if (!session) {
    return { exists: false };
  }
  
  const now = Date.now();
  const isExpired = now > session.expiresAt;
  
  if (isExpired) {
    sessions.delete(sessionId);
    return { exists: false, expired: true };
  }
  
  return {
    exists: true,
    hasClientId: !!session.clientId,
    hasClientSecret: !!session.clientSecret,
    localhostPort: session.localhostPort,
    createdAt: new Date(session.createdAt).toISOString(),
    expiresAt: new Date(session.expiresAt).toISOString(),
    timeRemaining: Math.floor((session.expiresAt - now) / 1000 / 60) // minutes
  };
};

export const getAllSessions = () => {
  const now = Date.now();
  const activeSessions = [];
  
  for (const [sessionId, session] of sessions.entries()) {
    if (now <= session.expiresAt) {
      activeSessions.push({
        sessionId,
        hasClientId: !!session.clientId,
        hasClientSecret: !!session.clientSecret,
        localhostPort: session.localhostPort,
        createdAt: new Date(session.createdAt).toISOString(),
        expiresAt: new Date(session.expiresAt).toISOString(),
        timeRemaining: Math.floor((session.expiresAt - now) / 1000 / 60)
      });
    }
  }
  
  return activeSessions;
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