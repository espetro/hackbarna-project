import { z } from 'zod';

/**
 * Location Schema
 * Geographic coordinates for activities
 */
export const LocationSchema = z.object({
  name: z.string(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  address: z.string().optional(),
});

export type Location = z.infer<typeof LocationSchema>;

/**
 * Activity Schema
 * Base activity/recommendation structure
 */
export const ActivitySchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string(),
  location: LocationSchema,
  duration: z.string().optional(), // e.g., "2 hours", "3-4 hours"
  durationMinutes: z.number().int().positive().optional(), // parsed duration in minutes
  price: z.string().optional(), // e.g., "€25", "Free", "€€€"
  priceAmount: z.number().optional(), // numeric price for sorting
  image: z.string().url().optional(),
  category: z.enum(['cultural', 'adventure', 'relaxation', 'foodie', 'nightlife', 'family', 'other']).optional(),
  tags: z.string().array().default([]),
});

export type Activity = z.infer<typeof ActivitySchema>;

/**
 * Ranked Activity Schema
 * Activity with AI-powered ranking score based on user preferences
 */
export const RankedActivitySchema = ActivitySchema.extend({
  score: z.number().min(0).max(100), // 0-100 ranking score
  reasoning: z.string().optional(), // Why this was ranked high/low
  matchedPreferences: z.string().array().optional(), // Which preferences it matches
});

export type RankedActivity = z.infer<typeof RankedActivitySchema>;
