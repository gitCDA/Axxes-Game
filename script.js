let username = null;
let scratchedCount = 0;
const maxScratches = 3;
let gameActive = false;
let hasWon = false;

function login() {
  const input = document.getElementById('username');
  const gameContainer = document.querySelector('.game-container');
  
  if (!input.value.trim()) return;
  
  username = input.value.trim();
  document.cookie = `username=${encodeURIComponent(username)}; expires=${new Date(Date.now() + 7 * 86400e3).toUTCString()}; path=/`;
  
  input.disabled = true;
  document.querySelector('.user-form').style.display = 'none';
  gameContainer.style.display = 'block';
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift());
}

document.addEventListener('DOMContentLoaded', () => {
  const savedUsername = getCookie('username');
  if (savedUsername) {
    username = savedUsername;
    document.querySelector('.user-form').style.display = 'none';
    document.querySelector('.game-container').style.display = 'block';
  }
});

function generateCards() {
  scratchedCount = 0;
  gameActive = true;
  const game = document.querySelector('.scratch-game');
  game.innerHTML = '';

  for (let i = 0; i < 9; i++) {
    const card = document.createElement('div');
    card.className = 'scratch-card';
    
    card.innerHTML = `
    <div class="inner">
      <div class="front">
      </div>
      <div class="back">
      <img class="card-image" src="/public/carte martinique.png">
      </div>
    </div>
    `;
    
    card.addEventListener('click', flipCard);
    game.appendChild(card);
  };
  
  displayHistory();
}

function flipCard() {
  if (!gameActive || scratchedCount >= maxScratches || this.classList.contains('flipped')) return;

  const frontDiv = this.querySelector('.front');
  const backDiv = this.querySelector('.back');
  const frontImg = document.createElement('img');
  frontImg.className = 'card-image';

  const randomNumber = Math.floor(Math.random() * 3) + 1;
  frontImg.src = `/public/${randomNumber}.jpg`;

  frontDiv.appendChild(frontImg);
  backDiv.innerHTML = '';
  this.classList.add('flipped');
  
  scratchedCount++;

  if (scratchedCount === maxScratches) {
    gameActive = false;
    finishedGames();
    displayHistory();
  }
}

function displayHistory() {
  const historyDiv = document.getElementById('history');
  historyDiv.innerHTML = '<h3>Dernières participations :</h3>';
  
  const participations = JSON.parse(localStorage.getItem('participations') || '[]')
  .slice(-3)
  .reverse();
  
  participations.forEach(p => {
    historyDiv.innerHTML += `
    <div class="participation">
    <span>${p.pseudo}</span>
    <span>${p.result}</span>
    <span>${p.date}</span>
    </div>
    `;
  });
}

async function finishedGames() {
  // Récupérer les cartes grattées
  const flippedCards = document.querySelectorAll('.flipped');

  // Vérifier si les 3 images sont identiques
  const images = [];
  flippedCards.forEach(card => {
    const img = card.querySelector('.front img');
    if (img) images.push(img.src.split('/').pop()); // Récupère le nom du fichier image
  });

  // Vérification de la victoire
  const uniqueImages = [...new Set(images)];
  hasWon = uniqueImages.length === 1 && images.length === 3;

  // Création de la popup
  const popup = document.createElement('div');
  popup.className = 'result-popup';
  popup.innerHTML = `
    <div class="popup-content">
      <h2>${hasWon ? '🎉 Félicitations !' : '😢 Dommage...'}</h2>
      <p>${hasWon ? 'Vous avez gagné !' : 'C\'est perdu.'}</p>
      <button onclick="this.parentElement.parentElement.remove(); generateCards(); displayHistory()">Réessayer</button>
    </div>
  `;

  document.body.appendChild(popup);

  // Enregistrement dans Firebase
  try {
    const response = await fetch('/scratch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pseudo: username,
        index: scratchedCount,
        result: hasWon,
        images: images
      })
    });

    const result = await response.json();
    console.log('Réponse Firebase:', result);

  } catch (error) {
    console.error('Erreur Firebase:', error);
  }

}

// Initialisation
document.addEventListener('DOMContentLoaded', generateCards);