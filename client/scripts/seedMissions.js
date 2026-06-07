/**
 * Seed Missions to Firestore ("Clean Slate" deployment)
 * 
 * Usage: node scripts/seedMissions.js <path-to-csv>
 * Example: node scripts/seedMissions.js src/data/mission_ingest.csv
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, setDoc, writeBatch } = require('firebase/firestore');
const fs = require('fs');
const path = require('path');

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyB22klRRTDZuQosIIBMbrRrzBg24L-YRbs",
  authDomain: "subterfuge-536c2.firebaseapp.com",
  projectId: "subterfuge-536c2",
  storageBucket: "subterfuge-536c2.firebasestorage.app",
  messagingSenderId: "843931591114",
  appId: "1:843931591114:web:d913e203d41c4fdad3af33",
  measurementId: "G-J481H9TTE9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const PACKS_MAPPING = {
  basic_training: { display_name: "Basic Training", is_premium: false },
  party: { display_name: "Party Pack", is_premium: true },
  ice_breaker: { display_name: "Ice Breaker", is_premium: true },
  far_away: { display_name: "Far Away Friends", is_premium: true }
};

async function seedMissions(csvPath) {
  console.log(`Reading CSV from: ${csvPath}`);
  
  // 1. Initialize packs collection
  console.log('\nStep 1: Initializing packs collection...');
  for (const [packId, data] of Object.entries(PACKS_MAPPING)) {
    await setDoc(doc(db, 'packs', packId), data);
    console.log(`  Set pack: ${packId}`);
  }

  // 2. Wipe existing missions
  console.log('\nStep 2: Wiping existing missions...');
  const missionsRef = collection(db, 'missions');
  const snapshot = await getDocs(missionsRef);
  
  if (snapshot.size === 0) {
    console.log('  No existing missions found.');
  } else {
    console.log(`  Deleting ${snapshot.size} existing missions...`);
    const batchSize = 400;
    let batch = writeBatch(db);
    let count = 0;
    
    for (const docSnapshot of snapshot.docs) {
      batch.delete(docSnapshot.ref);
      count++;
      if (count % batchSize === 0) {
        await batch.commit();
        batch = writeBatch(db);
        console.log(`  Deleted ${count} documents...`);
      }
    }
    if (count % batchSize !== 0) {
      await batch.commit();
    }
    console.log('  All existing missions deleted.');
  }

  // 3. Read and Parse CSV
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.trim().split('\n');
  const dataLines = lines.slice(1); // Skip header
  
  console.log(`\nStep 3: Processing ${dataLines.length} missions from CSV...`);
  
  const stats = {};
  // Helper to handle CSV line parsing
  const parseLine = (line) => {
    // Basic split by comma
    const parts = line.split(',');
    if (parts.length < 5) return null;

    const pack_id = parts[0].trim();
    const mission_id = parts[1].trim();
    const mission_name = parts[2].trim();
    const difficulty = parseInt(parts[3].trim(), 10);
    
    // Directive is the rest, handle potential quotes
    let directive = parts.slice(4).join(',').trim();
    
    // Remove surrounding quotes if present
    if (directive.startsWith('"') && directive.endsWith('"')) {
      directive = directive.slice(1, -1);
      // Unescape double quotes "" -> "
      directive = directive.replace(/""/g, '"');
    }

    return { pack_id, mission_id, mission_name, difficulty, directive };
  };

  let processedCount = 0;
  let batch = writeBatch(db);
  let batchCount = 0;

  for (const line of dataLines) {
    if (!line.trim()) continue;
    
    const mission = parseLine(line);
    if (!mission) {
        console.warn('Skipping invalid line:', line);
        continue;
    }

    const { pack_id, mission_id, mission_name, difficulty, directive } = mission;

    // Track stats
    if (!stats[pack_id]) stats[pack_id] = 0;
    stats[pack_id]++;

    // Add to batch
    const missionRef = doc(db, 'missions', mission_id);
    batch.set(missionRef, {
      pack_id,
      mission_name,
      difficulty,
      directive
    });
    
    batchCount++;
    processedCount++;

    if (batchCount >= 400) {
        await batch.commit();
        batch = writeBatch(db);
        batchCount = 0;
        process.stdout.write('.');
    }
  }

  if (batchCount > 0) {
    await batch.commit();
    process.stdout.write('.');
  }
  
  console.log('\n\nDeployment Complete!');
  console.log('--------------------------------');
  for (const [packId, count] of Object.entries(stats)) {
      console.log(`${packId}: ${count} missions uploaded`);
  }
}

// Main
const csvPath = process.argv[2];
if (!csvPath) {
  console.error('Usage: node scripts/seedMissions.js <path-to-csv>');
  console.error('Example: node scripts/seedMissions.js src/data/mission_ingest.csv');
  process.exit(1);
}

const resolvedPath = path.resolve(csvPath);
if (!fs.existsSync(resolvedPath)) {
  console.error(`File not found: ${resolvedPath}`);
  process.exit(1);
}

seedMissions(resolvedPath)
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error seeding missions:', err);
    process.exit(1);
  });
