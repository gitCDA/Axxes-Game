const express = require('express');
const path = require('path');
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');
const serviceAccount = require('./scratch-axxes-firebase-adminsdk-fbsvc-21ad0f39dc.json');

// Initialisation de Firebase
initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore(); // Initialisation de Firestore

const app = express();
const port = 3000;

app.use(express.static(__dirname));
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/index.html'));
});

app.post('/scratch', async (req, res) => {
  const { pseudo, index } = req.body;

  // Ajoute une nouvelle participation dans Firestore
  const newGame = {
    pseudo,
    gain,
    date: Timestamp.now(), // Utilise le timestamp de Firestore
    index
  };

  try {
    // Ajoute la participation à la collection "games"
    const docRef = await db.collection('games').add(newGame);

    const lastGames = [];
    snapshot.forEach(doc => {
      const game = doc.data();
      lastGames.push({
        pseudo: game.pseudo,
        result: game.gain ? 'Gagné' : 'Perdu',
        date: game.date.toDate().toLocaleString() // Convertit le timestamp en date lisible
      });
    });

    // Réponse JSON
    res.json({
      revealed: true,
      gain,
      gameOver: clickedCases.length === 3,
      lastGames
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la participation :', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

app.listen(port, () => {
  console.log(`Serveur en écoute sur le port ${port}`);
});