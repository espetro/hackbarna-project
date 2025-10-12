'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CalendarImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (calendarUrl: string) => Promise<void>;
  isImporting?: boolean;
}

export default function CalendarImportModal({
  isOpen,
  onClose,
  onImport,
  isImporting = false,
}: CalendarImportModalProps) {
  const [calendarUrl, setCalendarUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!calendarUrl.trim()) {
      setError('Please enter a calendar URL');
      return;
    }

    // Basic URL validation
    if (!calendarUrl.includes('calendar.google.com')) {
      setError('Please enter a valid Google Calendar URL');
      return;
    }

    try {
      setError('');
      await onImport(calendarUrl.trim());
      setCalendarUrl('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import calendar');
    }
  };

  const handleClose = () => {
    if (!isImporting) {
      setCalendarUrl('');
      setError('');
      onClose();
    }
  };

  const exampleUrl = 'https://calendar.google.com/calendar/u/0?cid=YTgzOWMyNDNhOTRiOTkyODkxODdkYzQ2ZjI0YzQzNThkZmMxZjQzY2I4YzFlNjM3YjAyZTdjZDllMWQwMTA3MUBncm91cC5jYWxlbmRhci5nb29nbGUuY29t';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Import Google Calendar
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Enter a public Google Calendar URL to import events
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  disabled={isImporting}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <form onSubmit={handleSubmit} className="p-6">
                <div className="mb-4">
                  <label htmlFor="calendar-url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Calendar URL
                  </label>
                  <textarea
                    id="calendar-url"
                    value={calendarUrl}
                    onChange={(e) => setCalendarUrl(e.target.value)}
                    disabled={isImporting}
                    placeholder="Paste your Google Calendar URL here..."
                    className="w-full h-24 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Error message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                    >
                      <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Help text */}
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                    How to get your calendar URL:
                  </h3>
                  <ol className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                    <li>1. Open Google Calendar in your browser</li>
                    <li>2. Find the calendar you want to share</li>
                    <li>3. Click the three dots next to it</li>
                    <li>4. Select &quot;Settings and sharing&quot;</li>
                    <li>5. Make the calendar public</li>
                    <li>6. Copy the calendar URL from your browser</li>
                  </ol>
                  
                  <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
                    <p className="text-xs text-blue-800 dark:text-blue-200 mb-2">Example URL:</p>
                    <button
                      type="button"
                      onClick={() => setCalendarUrl(exampleUrl)}
                      disabled={isImporting}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 underline disabled:opacity-50 disabled:cursor-not-allowed break-all text-left"
                    >
                      {exampleUrl.substring(0, 80)}...
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isImporting}
                    className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isImporting || !calendarUrl.trim()}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isImporting ? (
                      <>
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Importing...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"/>
                        </svg>
                        Import Calendar
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
