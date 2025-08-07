import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accessToken } = body;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Access token is required' },
        { status: 400 }
      );
    }

    // First get caller identity to get project/environment context
    const identityResponse = await fetch('https://app.launchdarkly.com/api/v2/caller-identity', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!identityResponse.ok) {
      throw new Error(`Failed to get caller identity: ${identityResponse.status}`);
    }

    const identity = await identityResponse.json();
    
    // Try to fetch feature flags if we have project context
    let flags = [];
    if (identity.projectId) {
      try {
        const flagsResponse = await fetch(`https://app.launchdarkly.com/api/v2/flags/${identity.projectId}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (flagsResponse.ok) {
          const flagsData = await flagsResponse.json();
          flags = flagsData.items || [];
        }
      } catch (error) {
        console.log('Could not fetch feature flags:', error);
      }
    }

    // Try to fetch projects
    let projects = [];
    try {
      const projectsResponse = await fetch('https://app.launchdarkly.com/api/v2/projects', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json();
        projects = projectsData.items || [];
      }
    } catch (error) {
      console.log('Could not fetch projects:', error);
    }

    return NextResponse.json({
      success: true,
      data: {
        identity,
        flags: flags.slice(0, 5), // Limit to first 5 flags
        projects: projects.slice(0, 3), // Limit to first 3 projects
        summary: {
          totalFlags: flags.length,
          totalProjects: projects.length,
          currentProject: identity.projectName,
          currentEnvironment: identity.environmentName
        }
      }
    });
  } catch (error) {
    console.error('Error fetching LaunchDarkly data:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch LaunchDarkly data' },
      { status: 500 }
    );
  }
}
