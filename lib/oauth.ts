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

export const testConnection = async (accessToken: string): Promise<any> => {
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