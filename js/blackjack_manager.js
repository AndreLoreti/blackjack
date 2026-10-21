// Blackjack OOP

let game = null; // Stores the current instance of the game
let roundSettled = false; // Evita liquidar a mesma aposta mais do que uma vez.

function playCardSound() {
    // Reutiliza um único elemento de áudio para evitar várias cópias a tocar
    // ao mesmo tempo quando uma ação distribui várias cartas rapidamente.
    const sound = document.getElementById('new-card-sound');
    sound.pause();
    sound.currentTime = 0;
    sound.play().catch(error => console.error('Could not play card sound:', error));
}

/**
 * Function to debug and display the state of the game object.
 * @param {Object} obj - The object to be debugged.
 */
function debug(obj) {
    // Não expõe a segunda carta do dealer nem o baralho por comprar.
    const safeState = {
        dealerCards: obj.dealerCards.map((card, index) =>
            !obj.dealerTurn && !obj.state.gameEnded && index === 1 ? 'X' : card
        ),
        playerCards: obj.playerCards,
        dealerTurn: obj.dealerTurn,
        state: obj.state,
        cardsRemaining: obj.deck.length
    };
    document.getElementById('debug').textContent = JSON.stringify(safeState);
}

/**
 * Initializes the game buttons.
 */
function buttonsInitialization() {
    document.getElementById('card').disabled = false; // Enables the button to draw a card
    document.getElementById('stand').disabled = false; // Enables the button to stand
    document.getElementById('double_down').disabled = game.getPlayerCards().length !== 2;
    document.getElementById('new_game').disabled = true; // Disables the button for a new game
}

/**
 * Finalizes the buttons after the game ends.
 */
function finalizeButtons(state) {
    document.getElementById('card').disabled = true; // Disables the button to draw a card
    document.getElementById('stand').disabled = true; // Disables the button to stand
    document.getElementById('double_down').disabled = true;
    document.getElementById('new_game').disabled = false; // Enables the button for a new game
    // updateDealer e updatePlayer podem chamar esta função no mesmo fim de jogo.
    // A aposta deve ser liquidada apenas na primeira chamada.
    if (state && !roundSettled) {
        roundSettled = true;
        bettingSystem.settleRound(state);
    }
}

/**
 * Clears the page to start a new game.
 */
function clearPage() {
    document.getElementById('dealer').textContent = '';
    document.getElementById('player').textContent = '';
    document.getElementById('game_status').textContent = '';

    // Esvazia as zonas de imagens se o HTML do layout já as tiver criado.
    const dealerCards = document.getElementById('dealer-cards');
    const playerCards = document.getElementById('player-cards');
    if (dealerCards) dealerCards.replaceChildren();
    if (playerCards) playerCards.replaceChildren();
}

/**
 * Starts a new game of Blackjack.
 */
function newGame() {
    if (!bettingSystem.startRound()) return;

    // A próxima partida ainda não foi liquidada.
    roundSettled = false;

    clearPage();
    game = new Blackjack(); // Creates a new instance of the Blackjack game
    // Um único efeito sonoro representa a distribuição inicial das quatro cartas.
    playCardSound();
    game.dealerMove();
    game.playerMove();
    game.dealerMove();
    const state = game.playerMove();

    updateDealer(state);
    updatePlayer(state);
    debug(game);
    buttonsInitialization();
    if (state.gameEnded) finalizeButtons();
}

/**
 * Calculates and displays the final score of the game.
 * @param {Object} state - The current state of the game.
 */
function finalScore(state) {
    const status = document.getElementById('game_status');
    if (state.playerWon) {
        status.textContent = 'You won!';
    } else if (state.dealerWon) {
        status.textContent = 'The dealer won.';
    } else {
        status.textContent = 'The game ended in a draw.';
    }
}

function formatCard(card) {
    const value = typeof card === 'number' ? card : card.value;
    const suits = {
        1: 'paus',
        2: 'ouros',
        3: 'copas',
        4: 'espadas'
    };
    const suit = typeof card === 'number' ? '' : ` de ${suits[card.suit]}`;

    if (value === 1) {
        return `1 (Ás${suit}: 1 ou 11 pontos)`;
    }
    if (value >= 11 && value <= 13) {
        const faceCards = {
            11: 'Valete',
            12: 'Dama',
            13: 'Rei'
        };
        return `${value} (${faceCards[value]}${suit}: 10 pontos)`;
    }
    return `${value} (${value}${suit}: ${value} pontos)`;
}

/**
 * Updates the dealer's state in the game.
 * @param {Object} state - The current state of the game.
 */
function updateDealer(state = game.getGameState()) {
    const cards = game.getDealerCards();
    const cardsElement = document.getElementById('dealer-cards');

    // Se existir a zona visual, desenha cada carta como imagem.
    if (cardsElement) {
        cardsElement.replaceChildren();
        cards.forEach((card, index) => {
            const hidden = !game.dealerTurn && !state.gameEnded && index === 1;
            printCard(cardsElement, hidden ? 'hidden' : card);
        });
    }

    // A pontuação fica escondida até o dealer começar a jogar.
    const dealerPoints = !game.dealerTurn && !state.gameEnded
        ? '?'
        : game.getCardsValue(cards);
    document.getElementById('dealer').textContent = `Dealer: ${dealerPoints}`;

    if (state.gameEnded) {
        finalScore(state);
        finalizeButtons(state);
    }
}

/**
 * Updates the player's state in the game.
 * @param {Object} state - The current state of the game.
 */
function updatePlayer(state = game.getGameState()) {
    const cards = game.getPlayerCards();
    const cardsElement = document.getElementById('player-cards');

    // Desenha todas as cartas do jogador, que estão sempre visíveis.
    if (cardsElement) {
        cardsElement.replaceChildren();
        cards.forEach(card => printCard(cardsElement, card));
    }

    document.getElementById('player').textContent =
        `Hand: ${game.getCardsValue(cards)}`;

    if (state.gameEnded) {
        finalScore(state);
        finalizeButtons(state);
    }
}

/**
 * Causes the dealer to draw a new card.
 * @returns {Object} - The game state after the dealer's move.
 */
function dealerNewCard() {
    playCardSound();
    const state = game.dealerMove();
    updateDealer(state);
    debug(game);
    return state;
}

/**
 * Causes the player to draw a new card.
 * @returns {Object} - The game state after the player's move.
 */
function playerNewCard() {
    document.getElementById('double_down').disabled = true;
    playCardSound();
    const state = game.playerMove();
    updatePlayer(state);
    if (state.gameEnded) updateDealer(state); // Revela as cartas do dealer no fim.
    debug(game);
    return state;
}

/**
 * Draws exactly one card for the player, then finishes the player's turn.
 */
function doubleDown() {
    if (!game || game.getGameState().gameEnded || game.getPlayerCards().length !== 2) return;
    if (!bettingSystem.doubleBet()) return;

    document.getElementById('double_down').disabled = true;
    playCardSound();
    const state = game.playerMove();
    updatePlayer(state);
    updateDealer(state);
    debug(game);

    if (!state.gameEnded) dealerFinish();
}

/**
 * Finishes the dealer's turn.
 */
function dealerFinish() {
    if (!game) return;

    document.getElementById('double_down').disabled = true;
    game.setDealerTurn(true);
    let state = game.getGameState();

    while (!state.gameEnded) {
        updateDealer(state);
        state = dealerNewCard();
    }

    updateDealer(state);
    updatePlayer(state);
    debug(game);
}

/**
 * Prints the card in the graphical interface.
 * @param {HTMLElement} element - The element where the card will be displayed.
 * @param {Card} card - The card to be displayed.
 * @param {boolean} [replace=false] - Indicates whether to replace the existing image.
 */
function printCard(element, card, replace = false) {
    // Quando replace é true, substitui as imagens anteriores deste contentor.
    if (replace) element.replaceChildren();

    const image = document.createElement('img');
    image.className = 'playing-card';

    // A carta virada para baixo usa o verso do baralho e não revela o valor.
    if (card === 'hidden') {
        image.src = 'img/png/card_back.png';
        image.alt = 'Carta virada para baixo';
    } else {
        const value = typeof card === 'number' ? card : card.value;
        const suit = typeof card === 'number' ? null : card.suit;

        // Os nomes têm de coincidir com os nomes dos PNGs em img/png.
        const rankNames = { 1: 'ace', 11: 'jack', 12: 'queen', 13: 'king' };
        const suitNames = { 1: 'clubs', 2: 'diamonds', 3: 'hearts', 4: 'spades' };
        const rank = rankNames[value] || String(value);

        image.src = `img/png/${rank}_of_${suitNames[suit]}.png`;
        image.alt = formatCard(card);
    }

    // Adiciona a imagem ao contentor de cartas do dealer ou do jogador.
    element.appendChild(image);
}
