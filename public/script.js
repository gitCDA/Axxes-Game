let username = localStorage.getItem('username') || null;
let scratchedCount = 0;
const maxScratches = 3;
let gameActive = false;
let hasWon = false;

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift());
}

// Stockage du pseudo dans localStorage
function login() {
  const input = document.getElementById('username');
  if (!input.value.trim()) return;
  
  username = input.value.trim();
  document.cookie = `username=${encodeURIComponent(username)}; expires=${new Date(Date.now() + 7 * 86400e3).toUTCString()}; path=/`;
  localStorage.setItem('username', username);
  
  input.disabled = true;
  document.querySelector('.user-form').style.display = 'none';
  document.querySelector('.game-container').style.display = 'block';
  userForm = document.querySelector('.user-form').style.display
  animatedImage = document.querySelector('.animated-image')
  if (userForm === 'none' && animatedImage) {
    animatedImage.remove();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const savedUsername = localStorage.getItem('username');
  if (savedUsername) {
    username = savedUsername;
    document.querySelector('.user-form').style.display = 'none';
    document.querySelector('.game-container').style.display = 'block';
  }
});

document.addEventListener('DOMContentLoaded', () => {
  if (username) {
    document.querySelector('.user-form').style.display = 'none';
    document.querySelector('.game-container').style.display = 'block';
  }
});

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
  userForm = document.querySelector('.user-form').style.display
  animatedImage = document.querySelector('.animated-image')
  if (userForm === 'none' && animatedImage) {
    animatedImage.remove();
  }

  for (let i = 0; i < 9; i++) {
    const card = document.createElement('div');
    card.className = 'scratch-card';
    
    card.innerHTML = `
    <div class="inner">
      <div class="front">
      </div>
      <div class="back">
      <img class="card-image" src="./images/carte martinique.png">
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

  const randomNumber = Math.floor(Math.random() * 2) + 1;
  frontImg.src = `./images/${randomNumber}.jpg`;

  frontDiv.appendChild(frontImg);
  backDiv.innerHTML = '';
  this.classList.add('flipped');
  
  scratchedCount++;

  if (scratchedCount === maxScratches) {
    gameActive = false;
    setTimeout(() => {
      finishedGames();
    }, 1500);
  }
}

async function displayHistory() {
  const historyDiv = document.getElementById('history');
  historyDiv.innerHTML = '<h3>Dernières participations :</h3>';

  const storedGames = localStorage.getItem('games');
  if (storedGames) {
    const games = JSON.parse(storedGames);
    
    // Trie les jeux par date décroissante
    games.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    games.slice(0, 3).forEach(game => {
      const date = new Date(game.date); // Convertit en objet Date
      const formattedDate = date.toLocaleString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      historyDiv.innerHTML += `
        <div class="participation">
          <span>${game.pseudo}</span>
          <span>${game.result ? 'Gagné' : 'Perdu'}</span>
          <span class="game-date">${formattedDate}</span>
        </div>
      `;
    });
  }
}

async function finishedGames() {
  const flippedCards = document.querySelectorAll('.flipped');

  // Vérifier si les 3 images sont identiques
  const images = [];
  flippedCards.forEach(card => {
    const img = card.querySelector('.front img');
    if (img) images.push(img.src.split('/').pop()); // Récupère le nom du fichier image
  });

  const uniqueImages = [...new Set(images)];
  hasWon = uniqueImages.length === 1 && images.length === 3;

  // Création de la popup
  const popup = document.createElement('div');
  popup.className = 'result-popup';
  popup.innerHTML = `
    <div class="popup-content">
      <h2>${hasWon ? '🎉 Félicitations, ' + username + ' !' : '😢 Dommage, ' + username + '...'}</h2>
      <br>
      <p>${hasWon ? 'Tu as empoché le gros lot !' : 'C\'est perdu.'}</p>
      <button onclick="this.parentElement.parentElement.remove(); generateCards();">
      Réessayer</button>
    </div>
  `;

  document.body.appendChild(popup);

// Stockage dans localStorage
const gameData = {
  pseudo: username,
  result: hasWon,
  date: new Date().toLocaleString()
};

const storedGames = localStorage.getItem('games');
if (storedGames) {
  const games = JSON.parse(storedGames);
  games.push(gameData);
  localStorage.setItem('games', JSON.stringify(games));
} else {
  localStorage.setItem('games', JSON.stringify([gameData]));
}
}

// Initialisation
document.addEventListener('DOMContentLoaded', generateCards);