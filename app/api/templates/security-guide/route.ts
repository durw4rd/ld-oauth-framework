import { NextResponse } from 'next/server';
import { generateSecurityGuide } from '../../../../lib/templates';

export async function GET() {
  try {
    const securityGuide = generateSecurityGuide();

    // Return the security guide as a downloadable markdown file
    return new NextResponse(securityGuide, {
      headers: {
        'Content-Type': 'text/markdown',
        'Content-Disposition': 'attachment; filename="launchdarkly-oauth-security-guide.md"'
      }
    });
  } catch (error) {
    console.error('Error generating security guide:', error);
    return NextResponse.json(
      { error: 'Failed to generate security guide' },
      { status: 500 }
    );
  }
}
