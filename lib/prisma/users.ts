import { prisma } from './client';
import type { User, Favorite } from '@prisma/client';
import type { Attraction } from '../context/AppContext';

/**
 * Get or create a user (for demo purposes, creates a default user)
 * In production, you'd get the user from authentication
 */
export async function getOrCreateUser(userId?: string): Promise<User> {
  const id = userId || 'default-user';

  let user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        id,
        name: 'Demo User',
      },
    });
  }

  return user;
}

/**
 * Update user preferences
 */
export async function updateUserPreferences(
  userId: string,
  preferences: any
): Promise<User> {
  return prisma.user.update({
    where: { id: userId },
    data: {
      preferences: preferences as any,
      updatedAt: new Date(),
    },
  });
}

/**
 * Get user with all relations
 */
export async function getUserWithData(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      favorites: true,
      itinerary: {
        orderBy: {
          startTime: 'asc',
        },
      },
    },
  });
}

/**
 * Save favorite attractions
 */
export async function saveFavorites(
  userId: string,
  attractions: Attraction[]
): Promise<void> {
  // Delete existing favorites
  await prisma.favorite.deleteMany({
    where: { userId },
  });

  // Create new favorites
  if (attractions.length > 0) {
    await prisma.favorite.createMany({
      data: attractions.map((attr) => ({
        userId,
        attractionId: attr.id,
        src: attr.src,
        alt: attr.alt,
      })),
    });
  }
}

/**
 * Get user favorites
 */
export async function getFavorites(userId: string): Promise<Attraction[]> {
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
  });

  return favorites.map((fav) => ({
    id: fav.attractionId,
    src: fav.src,
    alt: fav.alt,
  }));
}
