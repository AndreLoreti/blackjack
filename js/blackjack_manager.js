// Blackjack OOP

let game = null; // Stores the current instance of the game

/**
 * Function to debug and display the state of the game object.
 * @param {Object} obj - The object to be debugged.
 */
function debug(obj) {
    // Não expõe a segunda carta do dealer nem o baralho por comprar.
    const safeState = {
        dealerCards: obj.dealerCards.map((card, index) =>
            !obj.state.gameEnded && index === 1 ? 'X' : card
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
    document.getElementById('new_game').disabled = true; // Disables the button for a new game
}

/**
 * Finalizes the buttons after the game ends.
 */
function finalizeButtons() {
    document.getElementById('card').disabled = true; // Disables the button to draw a card
    document.getElementById('stand').disabled = true; // Disables the button to stand
    document.getElementById('new_game').disabled = false; // Enables the button for a new game
}

/**
 * Clears the page to start a new game.
 */
function clearPage() {
    document.getElementById('dealer').textContent = '';
    document.getElementById('player').textContent = '';
    document.getElementById('game_status').textContent = '';
}

/**
 * Starts a new game of Blackjack.
 */
function newGame() {
    clearPage();
    game = new Blackjack(); // Creates a new instance of the Blackjack game
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
    const visibleCards = cards.map((card, index) =>
        !state.gameEnded && index === 1 ? 'Carta' : formatCard(card)
    );
    let dealerText = visibleCards.join(' ');

    if (state.gameEnded) {
        if (state.dealerWon) {
            dealerText += ' - Dealer won.';
        } else if (state.playerWon) {
            dealerText += ' - Dealer lost.';
        } else {
            dealerText += ' - Draw.';
        }
    }

    document.getElementById('dealer').textContent = dealerText;

    if (state.gameEnded) {
        finalScore(state);
        finalizeButtons();
    }
}

/**
 * Updates the player's state in the game.
 * @param {Object} state - The current state of the game.
 */
function updatePlayer(state = game.getGameState()) {
    const cards = game.getPlayerCards();
    let playerText = cards.map(formatCard).join(' ');

    if (state.gameEnded) {
        if (state.playerWon) {
            playerText += ' - You won!';
        } else if (state.dealerWon) {
            playerText += ' - You lost.';
        } else {
            playerText += ' - Draw.';
        }
    }

    document.getElementById('player').textContent = playerText;

    if (state.gameEnded) {
        finalScore(state);
        finalizeButtons();
    }
}

/**
 * Causes the dealer to draw a new card.
 * @returns {Object} - The game state after the dealer's move.
 */
function dealerNewCard() {
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
    const state = game.playerMove();
    updatePlayer(state);
    if (state.gameEnded) updateDealer(state); // Revela as cartas do dealer no fim.
    debug(game);
    return state;
}

/**
 * Finishes the dealer's turn.
 */
function dealerFinish() {
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

//TODO: Implement this method.
/**
 * Prints the card in the graphical interface.
 * @param {HTMLElement} element - The element where the card will be displayed.
 * @param {Card} card - The card to be displayed.
 * @param {boolean} [replace=false] - Indicates whether to replace the existing image.
 */
function printCard(element, card, replace = false) {

}
