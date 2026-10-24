class BettingBalance {
    constructor(startingBalance = 1000, minimumBet = 10) {
        this.balance = startingBalance;
        this.minimumBet = minimumBet;
        this.currentBet = 0;
        this.roundActive = false;
        this.roundSettled = false;
    }

    initialize() {
        document.getElementById('card').disabled = true;
        document.getElementById('stand').disabled = true;
        document.getElementById('double_down').disabled = true;
        document.getElementById('new_game').disabled = false;
        document.getElementById('bet-amount').disabled = false;
        this.updateDisplay();
    }

    startRound() {
        if (this.roundActive) return false;

        const betInput = document.getElementById('bet-amount');
        const bet = Number(betInput.value);
        if (!Number.isSafeInteger(bet) || bet < this.minimumBet) {
            document.getElementById('game_status').textContent =
                `Enter a whole-number bet of at least ${this.minimumBet}€.`;
            return false;
        }
        if (bet > this.balance) {
            document.getElementById('game_status').textContent =
                'Your bet cannot be greater than your balance.';
            return false;
        }

        this.balance -= bet;
        this.currentBet = bet;
        this.roundActive = true;
        this.roundSettled = false;
        betInput.disabled = true;
        this.updateDisplay();
        return true;
    }

    doubleBet() {
        if (!this.roundActive || this.roundSettled) return false;

        if (this.currentBet > this.balance) {
            document.getElementById('game_status').textContent =
                'You do not have enough balance to double your bet.';
            return false;
        }

        this.balance -= this.currentBet;
        this.currentBet *= 2;
        this.updateDisplay();
        return true;
    }

    settleRound(state) {
        if (!this.roundActive || this.roundSettled || !state.gameEnded) return;

        if (state.playerWon) {
            this.balance += this.currentBet * 2;
        } else if (!state.dealerWon) {
            this.balance += this.currentBet;
        }

        this.roundSettled = true;
        this.roundActive = false;
        document.getElementById('bet-amount').disabled = false;
        this.updateDisplay();
    }

    updateDisplay() {
        const formatMoney = amount => new Intl.NumberFormat('pt-PT', {
            style: 'currency',
            currency: 'EUR',
            maximumFractionDigits: 0
        }).format(amount);
        const betInput = document.getElementById('bet-amount');
        const selectedBet = Number(betInput.value);
        const displayedBet = this.roundActive
            ? this.currentBet
            : (Number.isSafeInteger(selectedBet) && selectedBet >= 0 ? selectedBet : 0);

        document.getElementById('bet-display').textContent = formatMoney(displayedBet);
        document.getElementById('balance-display').textContent = formatMoney(this.balance);
    }
}

const bettingSystem = new BettingBalance();
