// Blackjack object

/**
 * Class that represents the Blackjack game.
 */
class Blackjack {
    // Constant that defines the maximum points to avoid busting in Blackjack
    static MAX_POINTS = 25;
    // Constant that defines the point threshold at which the dealer must stand
    static DEALER_MAX_TURN_POINTS = 21;

    /**
     * Creates an instance of Blackjack and initializes the deck.
     */
    constructor() {
        this.dealerCards = []; // Array to hold the dealer's cards
        this.playerCards = []; // Array to hold the player's cards
        this.dealerTurn = false; // Flag to indicate if it's the dealer's turn to play

        // State of the game with information about the outcome
        this.state = {
            gameEnded: false, // Indicates whether the game has ended
            playerWon: false, // Indicates if the player has won
            dealerWon: false, // Indicates if the dealer has won
            playerBusted: false, // Indicates if the player has exceeded MAX_POINTS
            dealerBusted: false // Indicates if the dealer has exceeded MAX_POINTS
        };

        // Initialize the deck of cards
        this.deck = this.shuffle(this.newDeck()); // Create and shuffle a new deck
    }

    /**
     * Creates a new deck of cards.
     * @returns {Card[]} - An array of cards.
     */

    newDeck() {
        const deck = [];
        for (let suit = 1; suit <= 4; suit++) {
            for (let value = 1; value <= 13; value++) {
                deck.push({ suit, value });
            }
        }
        return deck;
    }

    /**
     * Shuffles the deck of cards.
     * @param {Card[]} deck - The deck of cards to be shuffled.
     * @returns {Card[]} - The shuffled deck.
     */
    shuffle(deck) {
        // O enunciado pede índices de 1 a 52. Guardamos esses índices
        // separadamente e subtraímos 1 ao aceder ao array (indexado desde 0).
        let indices = [];
        for (let i = 1; i <= deck.length; i++) {
            indices.push(i);
        }
        
        const shuffledDeck = [];

        // Ciclo para retirar aleatoriamente cartas do baralho original usando os índices
        for (let i = 0; i < deck.length; i++) {
            // Sorteia um índice aleatório dentro do array de índices disponíveis
            const randomIndex = Math.floor(Math.random() * indices.length);
            const originalIndex = indices[randomIndex]; // índice de 1 a 52

            // Vai buscar a carta correspondente ao índice sorteado e insere no novo baralho
            shuffledDeck.push(deck[originalIndex - 1]);

            // Remove o índice usado do array de índices para não ser sorteado novamente
            indices.splice(randomIndex, 1);
        }

        return shuffledDeck;
    }

    /**
     * Returns the dealer's cards.
     * @returns {Card[]} - An array containing the dealer's cards.
     */
    getDealerCards() {
        return this.dealerCards.slice(); // Return a copy of the dealer's cards
    }

    /**
     * Returns the player's cards.
     * @returns {Card[]} - An array containing the player's cards.
     */
    getPlayerCards() {
        return this.playerCards.slice(); // Return a copy of the player's cards
    }

    /**
     * Sets whether it is the dealer's turn to play.
     * @param {boolean} val - Value indicating if it's the dealer's turn.
     */
    setDealerTurn(val) {
        this.dealerTurn = val; // Update the dealer's turn status
    }

    /**
     * Calculates the total value of the provided cards.
     * @param {Card[]} cards - Array of cards to be evaluated.
     * @returns {number} - The total value of the cards.
     */
    getCardsValue(cards) {
        let totalPoints = 0;
        let acesCount = 0;

        // Itera sobre cada carta no array
        for (let card of cards) {
            const value = typeof card === 'number' ? card : card.value;
            if (value === 1) {
                // Ás: inicialmente contabilizamos como 11 e guardamos a contagem de Ázes
                acesCount++;
                totalPoints += 11;
            } else if (value >= 11 && value <= 13) {
                // Figuras (Valete, Dama, Rei) valem 10 pontos
                totalPoints += 10;
            } else {
                // Cartas numéricas de 2 a 10 valem o seu próprio valor
                totalPoints += value;
            }
        }

        // Ajuste automático do Ás: se ultrapassarmos o limite (25) e tivermos Ázes contados como 11,
        // convertemos o valor do Ás de 11 para 1 (subtraindo 10) até baixar a pontuação ou esgotar os Ázes.
        while (totalPoints > Blackjack.MAX_POINTS && acesCount > 0) {
            totalPoints -= 10;
            acesCount--;
        }

        return totalPoints;
    }

    /**
     * Executes the dealer's move by adding a card to the dealer's array.
     * @returns {Object} - The game state after the dealer's move.
     */
    dealerMove() {
        // Retira a próxima carta do topo do baralho e adiciona às cartas do dealer
        if (this.deck.length > 0) {
            const card = this.deck.pop();
            this.dealerCards.push(card);
        }
        // Atualiza e retorna o estado atual do jogo após a jogada
        return this.getGameState();
    }

    /**
     * Executes the player's move by adding a card to the player's array.
     * @returns {Object} - The game state after the player's move.
     */
    playerMove() {
        // Retira a próxima carta do topo do baralho e adiciona às cartas do player
        if (this.deck.length > 0) {
            const card = this.deck.pop();
            this.playerCards.push(card);
        }
        // Atualiza e retorna o estado atual do jogo após a jogada
        return this.getGameState();
    }

    /**
     * Checks the game state based on the dealer's and player's cards.
     * @returns {Object} - The updated game state.
     */
    getGameState() {
        const playerPoints = this.getCardsValue(this.playerCards);
        const dealerPoints = this.getCardsValue(this.dealerCards);

        let playerBusted = false;
        let dealerBusted = false;
        let playerWon = false;
        let dealerWon = false;
        let gameEnded = false;

        // 1. Verificar se o jogador rebentou (> 25)
        if (playerPoints > Blackjack.MAX_POINTS) {
            playerBusted = true;
            dealerWon = true;
            gameEnded = true;
        }
        // 2. Verificar se o jogador fez exatamente 25 pontos (vitória imediata)
        else if (playerPoints === Blackjack.MAX_POINTS) {
            playerWon = true;
            gameEnded = true;
        }
        // 3. Se for a vez do dealer ou se o jogador já tiver passado a vez
        else if (this.dealerTurn) {
            // Verificar se o dealer rebentou (> 25)
            if (dealerPoints > Blackjack.MAX_POINTS) {
                dealerBusted = true;
                playerWon = true;
                gameEnded = true;
            } 
            // O dealer para ao atingir 21, igualar o jogador ou chegar a 25.
            else if (dealerPoints >= Blackjack.DEALER_MAX_TURN_POINTS ||
                     dealerPoints === playerPoints ||
                     dealerPoints === Blackjack.MAX_POINTS) {
                gameEnded = true;
                if (dealerPoints > playerPoints) {
                    dealerWon = true;
                } else if (dealerPoints < playerPoints) {
                    playerWon = true;
                } // Igualdade resulta num empate: ambas as flags de vitória ficam false.
            }
        }

        // Atualiza o objeto state da classe
        this.state = {
            gameEnded: gameEnded,
            playerWon: playerWon,
            dealerWon: dealerWon,
            playerBusted: playerBusted,
            dealerBusted: dealerBusted
        };

        return this.state;
    }
}
