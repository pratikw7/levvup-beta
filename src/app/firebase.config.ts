import { initializeApp } from 'firebase/app';
import { environment } from '../environments/environment';

// Initialize Firebase
export const firebaseApp = initializeApp(environment.firebase);

// Export Firebase services
export { getAuth } from 'firebase/auth';
export { getFirestore } from 'firebase/firestore';
export { getStorage } from 'firebase/storage';
export { getMessaging } from 'firebase/messaging';
export { getFunctions } from 'firebase/functions';
export { getDatabase } from 'firebase/database';
