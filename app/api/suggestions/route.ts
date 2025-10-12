import { NextRequest, NextResponse } from 'next/server';
import { PreferenceSchema } from '@/src/contracts/user';
import { RankedActivitySchema, RankedActivity } from '@/src/contracts/activity';
import { z } from 'zod';

/**
 * POST /api/suggestions
 * Get AI-ranked activity suggestions based on user preferences
 * TODO: Implement actual AI ranking logic
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate preferences
    const preferences = PreferenceSchema.parse(body.preferences);
    const location = z.string().parse(body.location);

    // TODO: Implement AI-powered ranking
    // This would:
    // 1. Fetch available activities from database/API
    // 2. Use AI to score each activity based on preferences
    // 3. Add reasoning for why each activity matches
    // 4. Sort by score

    // For now, return mock ranked activities
    const mockRankedActivities: RankedActivity[] = [
      {
        id: '1',
        title: 'La Sagrada Familia Tour',
        description: 'Skip-the-line guided tour of Gaudí\'s masterpiece',
        location: {
          name: 'Sagrada Familia',
          lat: 41.4036,
          lng: 2.1744,
        },
        duration: '2 hours',
        durationMinutes: 120,
        price: '€35',
        priceAmount: 35,
        image: '/assets/sagrada-familia.jpg',
        category: 'cultural',
        tags: ['architecture', 'unesco', 'gaudi'],
        score: 95,
        reasoning: 'Matches your cultural travel style and architectural interests',
        matchedPreferences: ['cultural', 'architecture'],
      },
      {
        id: '2',
        title: 'Tapas Cooking Class',
        description: 'Learn to make authentic Spanish tapas with a local chef',
        location: {
          name: 'Barcelona Cooking School',
          lat: 41.3874,
          lng: 2.1686,
        },
        duration: '3 hours',
        durationMinutes: 180,
        price: '€75',
        priceAmount: 75,
        image: '/assets/tapas.jpg',
        category: 'foodie',
        tags: ['cooking', 'tapas', 'local experience'],
        score: 88,
        reasoning: 'Perfect for foodie travelers who want hands-on experiences',
        matchedPreferences: ['foodie', 'cultural'],
      },
      {
        id: '3',
        title: 'Park Güell Sunrise Walk',
        description: 'Early morning guided walk through Gaudí\'s colorful park',
        location: {
          name: 'Park Güell',
          lat: 41.4145,
          lng: 2.1527,
        },
        duration: '2 hours',
        durationMinutes: 120,
        price: '€25',
        priceAmount: 25,
        image: '/assets/park-guell.jpg',
        category: 'cultural',
        tags: ['architecture', 'nature', 'photography'],
        score: 82,
        reasoning: 'Combines cultural and relaxation elements with stunning views',
        matchedPreferences: ['cultural', 'relaxation'],
      },
    ];

    // Filter and rank based on preferences
    const filtered = mockRankedActivities
      .filter(activity => {
        // Match travel style
        if (activity.category && preferences.travelStyle.includes(activity.category as any)) {
          return true;
        }
        // Match tags with interests
        if (preferences.interests?.some(interest =>
          activity.tags.includes(interest.toLowerCase())
        )) {
          return true;
        }
        return false;
      })
      .sort((a, b) => b.score - a.score);

    // Validate all activities
    const validated = z.array(RankedActivitySchema).parse(
      filtered.length > 0 ? filtered : mockRankedActivities
    );

    return NextResponse.json({
      activities: validated,
      count: validated.length,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to load suggestions' },
      { status: 500 }
    );
  }
}
