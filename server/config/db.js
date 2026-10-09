import mongoose from 'mongoose';

/**
 * Tracks the current connection state.
 * Possible values:
 * - 'not_configured'
 * - 'connecting'
 * - 'connected'
 * - 'disconnected'
 */
let connectionState = 'disconnected';
let listenersRegistered = false;

/**
 * Register mongoose connection event listeners once.
 */
function registerEventListeners() {
  if (listenersRegistered) return;
  listenersRegistered = true;

  mongoose.connection.on('connected', () => {
    connectionState = 'connected';
    console.log('  [MongoDB] Connected successfully');
  });

  mongoose.connection.on('error', (err) => {
    connectionState = 'disconnected';
    console.error(`  [MongoDB] Connection error: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    // Only update if not explicitly connecting
    if (connectionState !== 'connecting') {
      connectionState = 'disconnected';
    }
    console.log('  [MongoDB] Disconnected');
  });
}

/**
 * Connect to MongoDB using Mongoose.
 * - Handles missing MONGODB_URI gracefully (sets 'not_configured')
 * - Prevents multiple simultaneous connection attempts
 * - Uses modern Mongoose connection options (e.g. serverSelectionTimeoutMS)
 * - Never prints raw connection string credentials
 */
export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri || !uri.trim()) {
    connectionState = 'not_configured';
    console.log('  [MongoDB] MONGODB_URI is not configured. Running in offline/development mode.');
    return {
      success: false,
      state: connectionState,
      message: 'MONGODB_URI is not configured',
    };
  }

  // If already connected or connecting
  if (mongoose.connection.readyState === 1) {
    connectionState = 'connected';
    return {
      success: true,
      state: connectionState,
      message: 'Already connected to MongoDB',
    };
  }

  if (mongoose.connection.readyState === 2 || connectionState === 'connecting') {
    return {
      success: false,
      state: 'connecting',
      message: 'MongoDB connection attempt already in progress',
    };
  }

  registerEventListeners();

  connectionState = 'connecting';
  console.log('  [MongoDB] Connecting to database...');

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    connectionState = 'connected';
    return {
      success: true,
      state: connectionState,
      message: 'Connected to MongoDB',
    };
  } catch (err) {
    connectionState = 'disconnected';
    console.error(`  [MongoDB] Failed to connect: ${err.message}`);
    return {
      success: false,
      state: connectionState,
      error: err.message,
    };
  }
}

/**
 * Returns current database connection status object.
 * Does not expose credentials or connection URIs.
 */
export function getDBStatus() {
  const configured = Boolean(process.env.MONGODB_URI && process.env.MONGODB_URI.trim());

  if (!configured) {
    return {
      configured: false,
      state: 'not_configured',
    };
  }

  let state = connectionState;
  const readyState = mongoose.connection.readyState;

  if (readyState === 1) {
    state = 'connected';
  } else if (readyState === 2) {
    state = 'connecting';
  } else if (readyState === 0) {
    state = 'disconnected';
  }

  return {
    configured: true,
    state,
  };
}

/**
 * Disconnect database connection cleanly (useful for scripts & shutdowns).
 */
export async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  connectionState = process.env.MONGODB_URI ? 'disconnected' : 'not_configured';
}
