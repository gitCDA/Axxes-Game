const express = require('express');
const path = require('path');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');
require('dotenv').config();
const serviceAccount = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
  universe_domain: process.env.UNIVERSE_DOMAIN
};
console.log(serviceAccount)

// Initialisation de Firebase
initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
  }),
});

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};
console.log(firebaseConfig)
console.log(firebaseApp)
console.log(db)
// import.meta
// Initialisation Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// const db = getFirestore(); // Initialisation de Firestore

const app = express();
const port = 3000;

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Route pour la page d'accueil
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route GET pour récupérer l'historique des parties
app.get('/get-history', async (req, res) => {
    try {
      // Récupère les 3 dernières parties
      const snapshot = await db.collection('games')
        .orderBy('date', 'desc')
        .limit(3)
        .get();
  
      const lastGames = [];
      snapshot.forEach(doc => {
        const game = doc.data();
        lastGames.push({
          pseudo: game.pseudo,
          result: game.result ? 'Gagné' : 'Perdu',
          date: game.date.toDate().toLocaleString() // Convertit le timestamp en date lisible
        });
      });
  
      // Réponse JSON
      res.json({
        success: true,
        lastGames // Les 3 dernières parties
      });
  
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique :', error);
      res.status(500).json({ success: false, error: 'Erreur interne du serveur' });
    }
});

// Route POST pour ajouter une nouvelle partie
app.post('/add-game', async (req, res) => {
  const { pseudo, result } = req.body;

  // Création d'un nouvel objet de jeu
  const newGame = {
    pseudo,
    result,
    date: Timestamp.now()
  };

  try {
    // Ajoute la participation à la collection "games"
    const docRef = await db.collection('games').add(newGame);
    
    // Réponse JSON
    res.json({
      success: true,
      gameId: docRef.id // ID du document créé
    });

  } catch (error) {
    console.error('Erreur lors de l\'ajout de la participation :', error);
    res.status(500).json({ success: false, error: 'Erreur interne du serveur' });
  }
});

// Démarrer le serveur
app.listen(port, () => {
  console.log(`Serveur en écoute sur le port ${port}`);
});