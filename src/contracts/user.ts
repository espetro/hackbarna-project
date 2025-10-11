import { z } from 'zod';

/**
 * User Preferences Schema
 * Captures travel style, mobility, budget constraints
 */
export const PreferenceSchema = z.object({
  travelStyle: z.enum(['cultural', 'adventure', 'relaxation', 'foodie', 'nightlife', 'family']).array().min(1),
  mobility: z.enum(['high', 'medium', 'low']).default('medium'),
  budget: z.enum(['low', 'medium', 'high', 'luxury']).default('medium'),
  interests: z.string().array().optional(),
  dietaryRestrictions: z.string().array().optional(),
});

export type Preference = z.infer<typeof PreferenceSchema>;

/**
 * User Schema
 * Root entity for user data
 */
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email().optional(),
  name: z.string().optional(),
  preferences: PreferenceSchema.optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export type User = z.infer<typeof UserSchema>;
