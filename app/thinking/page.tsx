'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppContext } from '@/lib/context/AppContext';
import { useAuth } from '@/lib/context/AuthContext';
import ThinkingScreen from '@/components/ThinkingScreen';
import { sendWebhookRequest, parseWebhookResponse, generateSessionId } from '@/lib/webhookService';
import { saveWebhookActivities } from '@/lib/firebase/db';

function ThinkingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { setRecommendations, favoriteAttractions, setCurrentSessionId } = useAppContext();
  const [webhookComplete, setWebhookComplete] = useState(false);

  // Get query from URL params
  const query = searchParams.get('query') || '';

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!query) {
        console.error('❌ No query provided');
        router.push('/inspiration');
        return;
      }

      try {
        const webhookUrl = process.env.NEXT_PUBLIC_WEBHOOK;

        if (!webhookUrl || typeof webhookUrl !== 'string' || webhookUrl.trim() === '') {
          console.error('❌ No webhook configured');
          router.push('/inspiration');
          return;
        }

        // Generate session ID for tracking
        const sessionId = generateSessionId();
        setCurrentSessionId(sessionId);

        // Format favorite movies for the request
        const favoriteMovieNames = favoriteAttractions.map(attr => attr.alt);
        console.log('📽️ User favorite movies:', favoriteMovieNames);

        // Clear existing recommendations before webhook call
        console.log('🗑️ Clearing existing recommendations');
        setRecommendations([]);

        // Make webhook request
        console.log('📞 Calling webhook with session:', sessionId);
        console.log('📽️ Including favorite movies:', favoriteMovieNames);
        const webhookResponse = await sendWebhookRequest(query, favoriteMovieNames);

        // Parse response and set recommendations
        console.log('📋 Parsing webhook response...');
        const recommendations = parseWebhookResponse(webhookResponse, sessionId);

        if (recommendations.length === 0) {
          throw new Error('No valid activities received from webhook');
        }

        setRecommendations(recommendations);
        setCurrentSessionId(sessionId);
        console.log('✅ Set', recommendations.length, 'recommendations in context with session ID:', sessionId);

        // Save to Firebase (don't block on this - recommendations are already in context)
        if (user) {
          console.log('💾 Saving activities to Firebase (async)...');
          saveWebhookActivities(recommendations, user.uid, sessionId)
            .then(() => console.log('✅ Activities saved to Firebase'))
            .catch((err) => console.error('⚠️ Firebase save failed (non-blocking):', err));
        } else {
          console.log('⚠️ User not authenticated, skipping Firebase save');
        }

        console.log('✅ Webhook integration successful - recommendations in context');
        setWebhookComplete(true);

      } catch (error) {
        console.error('❌ Webhook failed:', error);
        // On error, go back to inspiration
        router.push('/inspiration');
      }
    };

    fetchRecommendations();
  }, [query, router, setRecommendations, setCurrentSessionId, favoriteAttractions, user]);

  const handleThinkingComplete = () => {
    console.log('🎬 Thinking screen complete, navigating to recommendations...');
    router.push('/recommendations');
  };

  return <ThinkingScreen onComplete={handleThinkingComplete} duration={30000} />;
}

export default function ThinkingPage() {
  return (
    <Suspense fallback={<ThinkingScreen onComplete={() => {}} duration={30000} />}>
      <ThinkingPageContent />
    </Suspense>
  );
}
