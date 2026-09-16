const cardAssets = [
  { id: 'card1', label: 'Personagem 1', url: 'assets/personagens/1.jpg' },
  { id: 'card2', label: 'Personagem 2', url: 'assets/personagens/2.jpg' },
  { id: 'card3', label: 'Personagem 3', url: 'assets/personagens/3.jpg' },
  { id: 'card4', label: 'Personagem 4', url: 'assets/personagens/4.jpg' },
  { id: 'card5', label: 'Personagem 5', url: 'assets/personagens/5.jpg' },
  { id: 'card6', label: 'Personagem 6', url: 'assets/personagens/6.jpg' },
  { id: 'card7', label: 'Personagem 7', url: 'assets/personagens/7.jpg' },
  { id: 'card8', label: 'Personagem 8', url: 'assets/personagens/8.jpg' },
  { id: 'card9', label: 'Personagem 9', url: 'assets/personagens/9.jpg' },
  { id: 'card10', label: 'Personagem 10', url: 'assets/personagens/10.jpg' },
];

const boardElement = document.getElementById('board');
const movesElement = document.getElementById('moves');
const timerElement = document.getElementById('timer');
const resetButton = document.getElementById('reset');
const modal = document.getElementById('modal');
const finalMoves = document.getElementById('final-moves');
const finalTime = document.getElementById('final-time');
const playAgainButton = document.getElementById('play-again');

const backgroundMusic = new Audio('musica.mp3');
backgroundMusic.loop = true;
backgroundMusic.volume = 0.4;
let waitingForUserInteraction = false;

let firstCard = null;
let secondCard = null;
let lockBoard = false;
let moves = 0;
let matches = 0;
let timerInterval = null;
let elapsedSeconds = 0;

const formatTime = seconds => {
  const minutes = String(Math.floor(seconds / 60)).padStart(2, '0');
  const remaining = String(seconds % 60).padStart(2, '0');
  return `${minutes}:${remaining}`;
};

const updateTimerDisplay = () => {
  timerElement.textContent = formatTime(elapsedSeconds);
};

const startTimer = () => {
  if (timerInterval) return;
  timerInterval = setInterval(() => {
    elapsedSeconds += 1;
    updateTimerDisplay();
  }, 1000);
};

const stopTimer = () => {
  clearInterval(timerInterval);
  timerInterval = null;
};

const resetTimer = () => {
  stopTimer();
  elapsedSeconds = 0;
  updateTimerDisplay();
};

const shuffle = array => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

const createCard = ({ id, label, url }) => {
  const card = document.createElement('button');
  card.className = 'card';
  card.type = 'button';
  card.setAttribute('aria-label', label);
  card.dataset.id = id;
  card.innerHTML = `
    <span class="card__inner">
      <span class="card__face card__face--front">?</span>
      <span class="card__face card__face--back">
        <img src="${url}" alt="${label}" class="card__image" loading="lazy" />
      </span>
    </span>
  `;
  card.addEventListener('click', handleCardClick);
  return card;
};

const setupBoard = () => {
  const duplicatedDeck = [...cardAssets, ...cardAssets];
  const shuffled = shuffle(duplicatedDeck);
  boardElement.innerHTML = '';
  shuffled.forEach(card => boardElement.appendChild(createCard(card)));
};

const resetGame = () => {
  [firstCard, secondCard, lockBoard] = [null, null, false];
  moves = 0;
  matches = 0;
  movesElement.textContent = '0';
  resetTimer();
  setupBoard();
  hideModal();
};

const incrementMoves = () => {
  moves += 1;
  movesElement.textContent = moves;
};

const revealCard = card => card.classList.add('is-flipped');
const hideCards = (...cards) => cards.forEach(card => card.classList.remove('is-flipped'));
const disableCards = (...cards) =>
  cards.forEach(card => {
    card.classList.add('is-matched');
    card.disabled = true;
  });

const checkForMatch = () => {
  if (!firstCard || !secondCard) return;
  const isMatch = firstCard.dataset.id === secondCard.dataset.id;

  if (isMatch) {
    disableCards(firstCard, secondCard);
    matches += 1;
    if (matches === cardAssets.length) gameWon();
    resetTurn();
  } else {
    lockBoard = true;
    setTimeout(() => {
      hideCards(firstCard, secondCard);
      resetTurn();
    }, 900);
  }
};

const gameWon = () => {
  stopTimer();
  finalMoves.textContent = moves;
  finalTime.textContent = formatTime(elapsedSeconds);
  modal.setAttribute('aria-hidden', 'false');
};

const hideModal = () => modal.setAttribute('aria-hidden', 'true');
const resetTurn = () => ([firstCard, secondCard, lockBoard] = [null, null, false]);

const playBackgroundMusic = () => {
  if (!backgroundMusic.paused) return;

  const playAttempt = backgroundMusic.play();
  if (!playAttempt || waitingForUserInteraction) return;

  playAttempt.catch(() => {
    waitingForUserInteraction = true;

    const unlockAudio = () => {
      backgroundMusic.play().finally(() => {
        waitingForUserInteraction = false;
      });
    };

    document.addEventListener('click', unlockAudio, { once: true });
    document.addEventListener('keydown', unlockAudio, { once: true });
  });
};

function handleCardClick(event) {
  const card = event.currentTarget;
  if (lockBoard || card === firstCard || card.classList.contains('is-matched')) return;

  startTimer();
  revealCard(card);

  if (!firstCard) {
    firstCard = card;
    return;
  }

  secondCard = card;
  incrementMoves();
  checkForMatch();
}

resetButton.addEventListener('click', resetGame);
playAgainButton.addEventListener('click', resetGame);

resetGame();
playBackgroundMusic();
