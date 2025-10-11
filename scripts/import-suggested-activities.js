// Script to import suggested activities from CSV to Firebase
// Run with: node scripts/import-suggested-activities.js

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin SDK
// You'll need to download your service account key from Firebase Console
// and place it in the project root as 'firebase-admin-key.json'
try {
  const serviceAccount = require('../firebase-admin-key.json');
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // Replace with your Firebase project ID
    databaseURL: `https://your-project-id-default-rtdb.firebaseio.com/`
  });
} catch (error) {
  console.error('❌ Firebase Admin initialization failed. Make sure you have firebase-admin-key.json in your project root.');
  console.error('Get your service account key from: Firebase Console > Project Settings > Service Accounts');
  process.exit(1);
}

const db = admin.firestore();

// Parse CSV data
function parseCSV(csvContent) {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.replace(/"/g, ''));
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < lines[i].length; j++) {
      const char = lines[i][j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    
    if (values.length === headers.length) {
      const row = {};
      headers.forEach((header, index) => {
        let value = values[index].replace(/"/g, '');
        // Convert numeric fields
        if (header === 'id' || header === 'locationLat' || header === 'locationLng') {
          value = parseFloat(value);
        }
        row[header] = value;
      });
      data.push(row);
    }
  }
  
  return data;
}

async function importSuggestedActivities() {
  try {
    console.log('📖 Reading CSV file...');
    const csvPath = path.join(__dirname, '../suggested-activities-sample.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    
    console.log('📊 Parsing CSV data...');
    const activities = parseCSV(csvContent);
    console.log('Found', activities.length, 'activities to import');
    
    console.log('🔥 Importing to Firebase...');
    const batch = db.batch();
    const collectionRef = db.collection('suggestedactivities');
    
    activities.forEach((activity) => {
      const docRef = collectionRef.doc(activity.id.toString());
      batch.set(docRef, {
        id: activity.id,
        title: activity.title,
        description: activity.description,
        image: activity.image,
        locationLat: activity.locationLat,
        locationLng: activity.locationLng,
        duration: activity.duration,
        price: activity.price,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });
    
    await batch.commit();
    
    console.log('✅ Successfully imported', activities.length, 'suggested activities to Firebase');
    console.log('Collection: suggestedactivities');
    console.log('Documents created with IDs:', activities.map(a => a.id).join(', '));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  }
}

// Run the import
importSuggestedActivities();
