import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getMessaging } from 'firebase/messaging';
import { getFunctions } from 'firebase/functions';
import { getDatabase } from 'firebase/database';
import { environment } from '../environments/environment';

// Initialize Firebase
export const firebaseApp = initializeApp(environment.firebase);

// Initialize Firebase services
export const auth = getAuth(firebaseApp);
export const firestore = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);
export const messaging = getMessaging(firebaseApp);
export const functions = getFunctions(firebaseApp);
export const database = getDatabase(firebaseApp);

// Development logging and connection test
console.log('🔥 Firebase: App initialized successfully');
console.log('🔥 Firebase config:', environment.firebase);
console.log('🔥 Firebase services:', {
  auth: auth ? 'Ready' : 'Failed',
  firestore: firestore ? 'Ready' : 'Failed',
  messaging: messaging ? 'Ready' : 'Failed',
  authDomain: environment.firebase.authDomain,
  projectId: environment.firebase.projectId
});

// Test Firestore connection
try {
  console.log('🔥 Testing Firestore connection...');
  console.log('🔥 Firestore app:', firestore.app.name);
  console.log('🔥 Firestore app project:', firestore.app.options.projectId);
} catch (error) {
  console.error('🔥 Firestore connection test failed:', error);
}

if (!environment.production) {
  // Test auth instance
  setTimeout(() => {
    console.log('🔥 Testing Firebase auth connection...');
    console.log('🔥 Auth app:', auth.app.name);
    console.log('🔥 Auth config:', auth.config);
    console.log('🔥 Current user:', auth.currentUser);
  }, 1000);
}

// Export the services for backwards compatibility
export { getAuth, getFirestore, getStorage, getMessaging, getFunctions, getDatabase };
