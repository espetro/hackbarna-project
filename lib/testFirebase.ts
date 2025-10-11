// Quick test to verify Firebase connection
import { getSuggestedActivities } from './firebase/db';

export async function testFirebaseConnection() {
  try {
    console.log('🧪 Testing Firebase connection...');
    const activities = await getSuggestedActivities();
    console.log('✅ Firebase test successful!');
    console.log(`📊 Found ${activities.length} suggested activities`);
    console.log('📋 Sample activity:', activities[0]);
    return { success: true, count: activities.length, sample: activities[0] };
  } catch (error) {
    console.error('❌ Firebase test failed:', error);
    return { success: false, error: error.message };
  }
}

// Call this function from browser console to test: window.testFirebase()
if (typeof window !== 'undefined') {
  (window as any).testFirebase = testFirebaseConnection;
}
