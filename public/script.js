let username = null;
let scratchedCount = 0;
const maxScratches = 3;
let gameActive = false;
let hasWon = false;

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift());
}

function login() {
  const input = document.getElementById('username');
  const gameContainer = document.querySelector('.game-container');
  
  if (!input.value.trim()) return;
  
  username = input.value.trim();
  document.cookie = `username=${encodeURIComponent(username)}; expires=${new Date(Date.now() + 7 * 86400e3).toUTCString()}; path=/`;
  
  input.disabled = true;
  document.querySelector('.user-form').style.display = 'none';
  gameContainer.style.display = 'block';
  userForm = document.querySelector('.user-form').style.display
  animatedImage = document.querySelector('.animated-image')
  if (userForm === 'none' && animatedImage) {
    animatedImage.remove();
  }
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

  try {
    const response = await fetch('/.netlify/functions/server/get-history');
    console.log(response)
    const result = await response.json();
    console.log(result)
    if (result.success) {
      result.lastGames.forEach(game => {

        historyDiv.innerHTML += `
          <div class="participation">
            <span>${game.pseudo}</span>
            <span>${game.result}</span>
            <span class="game-date">${game.date}</span>
          </div>
        `;
      });
    } else {
      console.error('Erreur :', result.error);
    }
  } catch (error) {
    console.error('Erreur :', error);
  }

  const dateSpans = document.querySelectorAll('.game-date');
  dateSpans.forEach(span => {
    const dateText = span.textContent;
    const formattedDate = dateText.slice(0, -3);
    span.textContent = formattedDate;
  });
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

  // Enregistrement dans Firebase via l'API backend
  try {
    const response = await fetch('/.netlify/functions/server/add-game', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pseudo: username,
        result: hasWon,
      })
    });
    
    const result = await response.json();

    if (result.success) {
      console.log('Partie enregistrée avec succès !', result);
    } else {
      console.error('Erreur lors de l\'enregistrement :', result.error);
    }

  } catch (error) {
    console.error('Erreur :', error);
  }

}

// Initialisation
document.addEventListener('DOMContentLoaded', generateCards);