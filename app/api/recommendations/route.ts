import { NextRequest, NextResponse } from 'next/server';
import { mockRecommendations } from '@/lib/mockData';

/**
 * Mock API endpoint for recommendations
 * This simulates a backend service that returns recommendations based on user query
 *
 * In production, this would:
 * 1. Parse the user's query (NLP)
 * 2. Match with available experiences in a database
 * 3. Filter by location, time, preferences
 * 4. Return personalized recommendations
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query } = body;

    // Validate input
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required and must be a string' },
        { status: 400 }
      );
    }

    // Simulate processing delay (to mimic real API)
    await new Promise(resolve => setTimeout(resolve, 500));

    // TODO: In production, this would call a real backend service
    // For now, return mock data
    // You could implement basic filtering based on keywords in the query

    // Example: Filter recommendations based on query keywords
    const queryLower = query.toLowerCase();
    let filteredRecommendations = mockRecommendations;

    // Simple keyword-based filtering (can be enhanced)
    if (queryLower.includes('food') || queryLower.includes('eat') || queryLower.includes('culinary')) {
      filteredRecommendations = mockRecommendations.filter(r =>
        r.title.toLowerCase().includes('food') ||
        r.description.toLowerCase().includes('food')
      );
    } else if (queryLower.includes('art') || queryLower.includes('culture')) {
      filteredRecommendations = mockRecommendations.filter(r =>
        r.title.toLowerCase().includes('art') ||
        r.title.toLowerCase().includes('artisan')
      );
    } else if (queryLower.includes('wine') || queryLower.includes('drink')) {
      filteredRecommendations = mockRecommendations.filter(r =>
        r.title.toLowerCase().includes('wine') ||
        r.title.toLowerCase().includes('jazz')
      );
    }

    // If no matches found, return all recommendations
    if (filteredRecommendations.length === 0) {
      filteredRecommendations = mockRecommendations;
    }

    return NextResponse.json(filteredRecommendations);
  } catch (error) {
    console.error('Error processing recommendations request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint for health check or fetching all recommendations
export async function GET() {
  return NextResponse.json({
    message: 'Recommendations API is running',
    totalExperiences: mockRecommendations.length,
  });
}
