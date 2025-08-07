import { NextRequest, NextResponse } from 'next/server';
import { createOAuthClient, listOAuthClients } from '../../../lib/launchdarkly';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiToken, name, redirectUris } = body;

    if (!apiToken || !name || !redirectUris) {
      return NextResponse.json(
        { error: 'Missing required fields: apiToken, name, redirectUris' },
        { status: 400 }
      );
    }

    // Create OAuth client
    const client = await createOAuthClient(apiToken, {
      name,
      redirectUris: Array.isArray(redirectUris) ? redirectUris : [redirectUris]
    });

    console.log(`OAuth client created: ${client.name} (${client.clientId})`);

    return NextResponse.json({
      success: true,
      client
    });
  } catch (error) {
    console.error('Error creating OAuth client:', error);
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
