import { NextRequest, NextResponse } from 'next/server';
import { saveFavorites, getFavorites, getOrCreateUser } from '@/lib/prisma/users';

const DEFAULT_USER_ID = 'default-user';

/**
 * GET /api/favorites
 * Get user's favorite attractions
 */
export async function GET(request: NextRequest) {
  try {
    const favorites = await getFavorites(DEFAULT_USER_ID);

    return NextResponse.json({ favorites });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json(
      { error: 'Failed to fetch favorites' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/favorites
 * Save user's favorite attractions
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { favorites } = body;

    if (!Array.isArray(favorites)) {
      return NextResponse.json(
        { error: 'Invalid favorites data' },
        { status: 400 }
      );
    }

    // Ensure user exists before saving favorites
    await getOrCreateUser(DEFAULT_USER_ID);

    await saveFavorites(DEFAULT_USER_ID, favorites);

    return NextResponse.json({
      success: true,
      count: favorites.length,
    });
  } catch (error) {
    console.error('Error saving favorites:', error);
    return NextResponse.json(
      { error: 'Failed to save favorites' },
      { status: 500 }
    );
  }
}
