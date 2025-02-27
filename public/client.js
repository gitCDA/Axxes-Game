import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Chargement de la configuration depuis .env
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialisation Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

const myCollectionRef = collection(db, "<your-collection>");

    // Récupère les 3 dernières participations
    const snapshot = await db.collection('games')
      .orderBy('date', 'desc')
      .limit(3)
      .get();

const newElement = {
  
};

addDoc(myCollectionRef, newElement)
  .then((docRef) => {
    console.log("Document written with ID: ", docRef.id);
  })
  .catch((error) => {
    console.error("Error adding document: ", error);
  });
