import { NextRequest, NextResponse } from 'next/server';
import { createOAuthClient, listOAuthClients } from '../../../lib/launchdarkly';

export async function POST(request: NextRequest) {
  console.log('POST /api/oauth-clients called');
  
  try {
    const body = await request.json();
    const { apiToken, name, redirectUri } = body;

    console.log('Request body:', { name, redirectUri, hasApiToken: !!apiToken });

    if (!apiToken || !name || !redirectUri) {
      return NextResponse.json(
        { error: 'Missing required fields: apiToken, name, redirectUri' },
        { status: 400 }
      );
    }

    console.log('Calling LaunchDarkly API to create OAuth client...');
    
    // Create OAuth client with correct field names
    const client = await createOAuthClient(apiToken, {
      name,
      redirectUri,
      description: `OAuth client created via framework for session ${body.sessionId || 'unknown'}`
    });

    console.log(`OAuth client created: ${client.name} (${client._clientId})`);

    return NextResponse.json({
      success: true,
      client
    });
  } catch (error) {
    console.error('Error creating OAuth client:', error);
    
    // Check if this is a 404 error from LaunchDarkly (API not available)
    if (error instanceof Error && error.message.includes('404')) {
      return NextResponse.json(
        { 
          error: 'OAuth client creation via API is not available in LaunchDarkly. Please create the OAuth client manually in the LaunchDarkly web interface and use the Manual Setup option.',
          details: 'The LaunchDarkly API does not support OAuth client creation. You can create OAuth clients through the LaunchDarkly web interface at https://app.launchdarkly.com/settings/oauth-clients'
        },
        { status: 501 } // Not Implemented
      );
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create OAuth client' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const apiToken = searchParams.get('apiToken');

    if (!apiToken) {
      return NextResponse.json(
        { error: 'API token is required' },
        { status: 400 }
      );
    }

    // List OAuth clients
    const clients = await listOAuthClients(apiToken);

    return NextResponse.json({
      success: true,
      clients
    });
  } catch (error) {
    console.error('Error listing OAuth clients:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to list OAuth clients' },
      { status: 500 }
    );
  }
}
