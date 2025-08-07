// LaunchDarkly API integration for OAuth client management

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

export interface CreateOAuthClientRequest {
  name: string;
  redirectUri: string;
  description?: string;
}

export interface CreateOAuthClientResponse {
  _links: Record<string, unknown>;
  name: string;
  _accountId: string;
  _clientId: string;
  redirectUri: string;
  _creationDate: number;
  description: string | null;
  _clientSecret: string | null;
}

export const createOAuthClient = async (apiToken: string, clientData: CreateOAuthClientRequest): Promise<CreateOAuthClientResponse> => {
  try {
    const response = await fetch('https://app.launchdarkly.com/api/v2/oauth/clients', {
      method: 'POST',
      headers: {
        'Authorization': apiToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(clientData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to create OAuth client:', response.status, errorText);
      throw new Error(`Failed to create OAuth client: ${response.status} - ${errorText}`);
    }

    const client = await response.json();
    return client;
  } catch (error) {
    console.error('Error creating OAuth client:', error);
    throw error;
  }
};

export const listOAuthClients = async (apiToken: string): Promise<OAuthClient[]> => {
  try {
    const response = await fetch('https://app.launchdarkly.com/api/v2/oauth/clients', {
      headers: {
        'Authorization': apiToken,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to list OAuth clients:', response.status, errorText);
      throw new Error(`Failed to list OAuth clients: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Error listing OAuth clients:', error);
    throw error;
  }
};

export const deleteOAuthClient = async (apiToken: string, clientId: string): Promise<void> => {
  try {
    const response = await fetch(`https://app.launchdarkly.com/api/v2/oauth/clients/${clientId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': apiToken,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to delete OAuth client:', response.status, errorText);
      throw new Error(`Failed to delete OAuth client: ${response.status} - ${errorText}`);
    }
  } catch (error) {
    console.error('Error deleting OAuth client:', error);
    throw error;
  }
};
