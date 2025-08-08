import { NextRequest, NextResponse } from 'next/server';
import { OAuthClientManager } from '../../../../lib/oauth-client-manager';

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiToken, clientId, newRedirectUrl } = body;

    if (!apiToken || !clientId || !newRedirectUrl) {
      return NextResponse.json(
        { error: 'Missing required parameters: apiToken, clientId, newRedirectUrl' },
        { status: 400 }
      );
    }

    // Validate the new redirect URL
    const manager = new OAuthClientManager(apiToken);
    const validation = manager.validateRedirectUrl(newRedirectUrl);
    
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Patch the OAuth client
    const updatedClient = await manager.patchRedirectUrl(clientId, newRedirectUrl);

    return NextResponse.json({
      success: true,
      message: 'OAuth client redirect URL updated successfully',
      client: updatedClient
    });

  } catch (error) {
    console.error('Error patching OAuth client:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { error: `Failed to patch OAuth client: ${errorMessage}` },
      { status: 500 }
    );
  }
}
