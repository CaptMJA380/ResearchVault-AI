import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from server/.env if available
dotenv.config({ path: path.resolve(__dirname, '../.env') });

console.log('\n--- Checking Live MongoDB Connection ---\n');

const uri = process.env.MONGODB_URI;

if (!uri || !uri.trim()) {
  console.error('  ✗ MONGODB_URI is not set in environment or server/.env file.');
  console.error('    Please configure MONGODB_URI in server/.env to enable live database connectivity.');
  console.error('    Example: MONGODB_URI=mongodb://127.0.0.1:27017/researchvault_ai\n');
  process.exit(1);
}

// Ensure credentials are never logged
console.log('  [MongoDB] Attempting connection (credentials hidden)...');

try {
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
  });

  console.log('  ✓ Successfully connected to MongoDB!');
  console.log(`  ✓ Connection readyState: ${mongoose.connection.readyState} (connected)`);

  await mongoose.disconnect();
  console.log('  ✓ Cleanly disconnected from MongoDB.\n');
  process.exit(0);
} catch (err) {
  console.error(`  ✗ Failed to connect to MongoDB: ${err.message}\n`);
  process.exit(1);
}
