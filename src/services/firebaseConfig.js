/**
 * Firebase configuration.
 *
 * IMPORTANT: Replace these placeholder values with your actual Firebase
 * project config. Get them from:
 * Firebase Console → Project Settings → Your apps → Web app → Config
 *
 * For production, consider using environment variables via Vite:
 *   apiKey: import.meta.env.VITE_FIREBASE_API_KEY
 */
export const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID',
};

/**
 * Check if Firebase is configured with real credentials.
 * @returns {boolean}
 */
export function isFirebaseConfigured() {
  return firebaseConfig.apiKey !== 'YOUR_API_KEY';
}
