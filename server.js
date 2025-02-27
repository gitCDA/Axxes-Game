const express = require('express');
const path = require('path');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');
const serviceAccount = require('./scratch-axxes-firebase-adminsdk-fbsvc-21ad0f39dc.json');

// Initialisation de Firebase
initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore(); // Initialisation de Firestore

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
      console.log('first')
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