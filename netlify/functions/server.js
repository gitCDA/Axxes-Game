import express, { json } from 'express';
import serverless from 'serverless-http'; // Importez serverless-http
import path from 'path';
import cors from 'cors';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import 'dotenv/config';
// Configuration Firebase Admin SDK
const serviceAccount = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
};

initializeApp({ credential: cert(serviceAccount) });

const db = getFirestore(); // Initialisation de Firestore

const app = express();
app.use(json());
app.use(cors({
  origin: 'https://axxesgame.netlify.app/',
  methods: ['GET', 'POST']
}));

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

export const handler = serverless(app);