import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy API route for fetching iCal files from Google Calendar
 * This bypasses CORS restrictions by fetching server-side
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const icsUrl = searchParams.get('url');

    if (!icsUrl) {
      return NextResponse.json(
        { error: 'Missing url parameter' },
        { status: 400 }
      );
    }

    // Validate that the URL is from Google Calendar (security check)
    if (!icsUrl.includes('calendar.google.com')) {
      return NextResponse.json(
        { error: 'Only Google Calendar URLs are allowed' },
        { status: 403 }
      );
    }

    console.log('📅 Proxying iCal fetch from:', icsUrl);

    // Fetch the iCal file server-side (no CORS restrictions here)
    const response = await fetch(icsUrl, {
      method: 'GET',
      headers: {
        'Accept': 'text/calendar',
        'User-Agent': 'TetrisTravel/1.0',
      },
    });

    if (!response.ok) {
      console.error('❌ Failed to fetch iCal:', response.status, response.statusText);
      return NextResponse.json(
        { error: `Failed to fetch iCal: ${response.statusText}` },
        { status: response.status }
      );
    }

    const icsData = await response.text();
    console.log('✅ Successfully fetched iCal data:', icsData.length, 'bytes');

    // Return the iCal data with proper content type
    return new NextResponse(icsData, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar',
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
      },
    });
  } catch (error) {
    console.error('❌ Error in proxy-ical route:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
