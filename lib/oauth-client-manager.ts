export interface OAuthClient {
  _links: Record<string, unknown>;
  name: string;
  _accountId: string;
  _clientId: string;
  redirectUri: string;
  _creationDate: number;
  description: string | null;
  _clientSecret: string | null;
}

export interface PatchOperation {
  op: 'replace';
  path: string;
  value: string;
}

export class OAuthClientManager {
  private apiToken: string;

  constructor(apiToken: string) {
    this.apiToken = apiToken;
  }

  /**
   * Patch an OAuth client to update its redirect URL
   * @param clientId The OAuth client ID
   * @param newRedirectUrl The new redirect URL
   * @returns Updated OAuth client
   */
  async patchRedirectUrl(clientId: string, newRedirectUrl: string): Promise<OAuthClient> {
    const patchOperations: PatchOperation[] = [
      {
        op: 'replace',
        path: '/redirectUri',
        value: newRedirectUrl
      }
    ];

    const response = await fetch(`https://app.launchdarkly.com/api/v2/oauth/clients/${clientId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': this.apiToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(patchOperations)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Failed to patch OAuth client: ${response.status} ${response.statusText} - ${errorData.message || 'Unknown error'}`);
    }

    return await response.json();
  }

  /**
   * Get OAuth client details
   * @param clientId The OAuth client ID
   * @returns OAuth client details
   */
  async getClient(clientId: string): Promise<OAuthClient> {
    const response = await fetch(`https://app.launchdarkly.com/api/v2/oauth/clients/${clientId}`, {
      method: 'GET',
      headers: {
        'Authorization': this.apiToken,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Failed to get OAuth client: ${response.status} ${response.statusText} - ${errorData.message || 'Unknown error'}`);
    }

    return await response.json();
  }

  /**
   * Validate redirect URL format
   * @param redirectUrl The redirect URL to validate
   * @returns Validation result
   */
  validateRedirectUrl(redirectUrl: string): { isValid: boolean; error?: string } {
    try {
      const url = new URL(redirectUrl);
      
      // Check if it's HTTPS (LaunchDarkly requirement)
      if (url.protocol !== 'https:' && url.hostname !== 'localhost') {
        return {
          isValid: false,
          error: 'Redirect URL must use HTTPS (except for localhost)'
        };
      }

      // Check if it's a valid URL
      if (!url.hostname) {
        return {
          isValid: false,
          error: 'Invalid redirect URL format'
        };
      }

      return { isValid: true };
    } catch {
      return {
        isValid: false,
        error: 'Invalid URL format'
      };
    }
  }
}
