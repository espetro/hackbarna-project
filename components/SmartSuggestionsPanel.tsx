'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SmartSuggestion, ItineraryEvent } from '@/lib/types';
import SmartSuggestionCard from './SmartSuggestionCard';
import { findEmptySlots, formatSlotDuration } from '@/lib/smartSuggestions';

interface SmartSuggestionsPanelProps {
  smartSuggestions: SmartSuggestion[];
  itineraryEvents: ItineraryEvent[];
  onAddSuggestion: (suggestion: SmartSuggestion) => void;
  onExpandSuggestion: (suggestion: SmartSuggestion) => void;
}

export default function SmartSuggestionsPanel({
  smartSuggestions,
  itineraryEvents,
  onAddSuggestion,
  onExpandSuggestion,
}: SmartSuggestionsPanelProps) {
  const [expandedSlots, setExpandedSlots] = useState<Set<string>>(new Set());

  // Group suggestions by slot
  const suggestionsBySlot = React.useMemo(() => {
    const slots = findEmptySlots(itineraryEvents);
    const grouped: Record<string, { slot: any, suggestions: SmartSuggestion[] }> = {};

    slots.forEach((slot, index) => {
      const slotKey = `slot-${index}`;
      const slotSuggestions = smartSuggestions.filter(s =>
        // Filter out suggestions with undefined activities (safety check)
        s.activity &&
        s.slot.startTime.getTime() === slot.startTime.getTime() &&
        s.slot.endTime.getTime() === slot.endTime.getTime()
      );

      if (slotSuggestions.length > 0) {
        grouped[slotKey] = {
          slot,
          suggestions: slotSuggestions.slice(0, 3), // Limit to top 3 per slot
        };
      }
    });

    return grouped;
  }, [smartSuggestions, itineraryEvents]);

  const toggleSlot = (slotKey: string) => {
    setExpandedSlots(prev => {
      const newSet = new Set(prev);
      if (newSet.has(slotKey)) {
        newSet.delete(slotKey);
      } else {
        newSet.add(slotKey);
      }
      return newSet;
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (Object.keys(suggestionsBySlot).length === 0) {
    return null; // No suggestions to show
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-4">
        <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Smart Suggestions
        </h3>
        <div className="ml-auto text-sm text-gray-500 dark:text-gray-400">
          {Object.keys(suggestionsBySlot).length} slot{Object.keys(suggestionsBySlot).length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="space-y-3">
        {Object.entries(suggestionsBySlot).map(([slotKey, { slot, suggestions }]) => {
          const isExpanded = expandedSlots.has(slotKey);
          const previousActivity = slot.previousActivity?.title || 'Start';
          const nextActivity = slot.nextActivity?.title || 'End';

          return (
            <div key={slotKey} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              {/* Slot Header */}
              <button
                onClick={() => toggleSlot(slotKey)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      Between &quot;{previousActivity}&quot; and &quot;{nextActivity}&quot;
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formatTime(slot.startTime)} - {formatTime(slot.endTime)} 
                      <span className="ml-2">({formatSlotDuration(slot.availableMinutes)} available)</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs font-medium">
                      {suggestions.length} suggestion{suggestions.length !== 1 ? 's' : ''}
                    </div>
                    <svg
                      className={`w-4 h-4 text-gray-400 transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </button>

              {/* Suggestions List */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 space-y-3 bg-white dark:bg-gray-900">
                      {suggestions.map((suggestion, index) => (
                        <SmartSuggestionCard
                          key={`${suggestion.activity.id}-${index}`}
                          suggestion={suggestion}
                          onAdd={onAddSuggestion}
                          onExpand={onExpandSuggestion}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Info Footer */}
      <div className="px-4 py-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="flex items-start gap-2">
          <svg className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-xs text-blue-700 dark:text-blue-300">
            <div className="font-medium mb-1">Smart suggestions automatically:</div>
            <ul className="space-y-0.5 text-blue-600 dark:text-blue-400">
              <li>• Find activities that fit perfectly in your schedule</li>
              <li>• Choose the closest ones to minimize travel time</li>
              <li>• Update when you add or remove activities</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
