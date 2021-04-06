
class CardPlayer {
	constructor(name, user) {
		this.name = name;
		this.hand = [];
        this.user = user;
        this.points = 0;
	}

	receiveCard(card) {
		this.hand.push(card);
	}

	removeCard(card) {
		if(this.hand.includes(card)) {
			let index = this.hand.indexOf(card);
			this.hand.splice(index, 1);
			return card;
		} else {
			return false;
		}
	}

	removeAll() {
		let result = [...this.hand];
		this.hand = [];
		return result;
	}

    sumHand(high) {
        return this.hand.reduce((acc, e) => acc + cardValue(e, high), 0);
    }
}

function cardValue(cardString, high=true) {
    const n = parseInt(cardString.charAt(0));
    if(isNaN(n) || n < 1) {
        switch (cardString.charAt(0)) {
            case 'A':
                return high ? 11 : 1;
            case 'J':
                return 11;
            case 'Q':
                return 12;
            case 'K':
                return 13;
            default:
                console.warn("unknown cardstring value");
                return undefined;
        }
    }
    return n;
}

const initialDeck = [
    "0S", "AS", "2S", "3S", "4S", "5S", "6S", "7S", "8S", "9S", "JS", "QS", "KS",
    "0H", "AH", "2H", "3H", "4H", "5H", "6H", "7H", "8H", "9H", "JH", "QH", "KH",
    "0D", "AD", "2D", "3D", "4D", "5D", "6D", "7D", "8D", "9D", "JD", "QD", "KD",
    "0C", "AC", "2C", "3C", "4C", "5C", "6C", "7C", "8C", "9C", "JC", "QC", "KC",
];

class Blackjack {
	constructor(channel, players) {
        this.channel = channel;
		this.players = players;
		this.deck = [...initialDeck];
		this.discard = [];
        this.turn = 0;
        this.bust = [];
        this.finished = false;
	}

	shuffle() {
		for(let i = this.deck.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
    		[this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
		}
		return this.deck;
	}

	topCard() {
		if (this.deck.length >= 1 ){
			return this.deck.pop();
		} else {
			// shuffle the discard
			for(let i = this.discard.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				[this.discard[i], this.discard[j]] = [this.discard[j], this.discard[i]];
			}
			// set deck to discard
			this.deck = [...this.discard];
			this.discard = [];
			return this.deck.pop();
		}
	}

	dealOne() {
		for(let p of this.players) {
			p.receiveCard(this.topCard());
		}
	}

	showCards() {
		for(let p of this.players) {
            let res = p.hand.length > 0 ? p.hand.join(" ") : "no cards";
			this.channel.send(p.name + ": " + res);
		}
	}

	dealInitial() {
		this.dealOne(); this.dealOne();
        this.showCards();
	}

    curPlayer() {
        return this.players[this.turn];
    }

    sayTurn() {
        this.channel.send("It's " + curGame.curPlayer().name + "'s turn");
    }

    hit() {
        this.curPlayer().receiveCard(this.topCard());
        let res = this.curPlayer().hand.length > 0 ? this.curPlayer().hand.join(" ") : "no cards";
		this.channel.send(this.curPlayer().name + ": " + res);

        // check if over
        const highVal = this.curPlayer().sumHand(true);
        if(highVal > 21) {
            const lowVal = this.curPlayer().sumHand(false);
            if(lowVal > 21) {
                this.channel.send("You went over!");
                this.bust.push(this.curPlayer());
                this.nextPlayer();
            }
        }
    }

    nextPlayer() {
        if(this.bust.length >= this.players.length - 1) {
            console.log("there is no next player");
            const winner = this.players.find(p => !this.bust.some(bp => bp.name == p.name));
            this.channel.send("Winner is: " + winner.name);
            this.finished = true;
            return;
        }
        this.turn++;
        if(this.bust.some(p => p.name == this.curPlayer().name)) {
            this.nextPlayer();
        } else {
            this.sayTurn();
        }
    }

    stay() {
        this.nextPlayer();
    }
}

let prevGame = undefined;
let curGame = undefined;

module.exports = {
    name: "blackjack",
    usage: "blackjack (startingPoints) @<player1> @<player2> ... | hit | stay | restart",
    description: "starts blackjack game with mentioned players",
    action: (msg, cmdArgs) => {
        let arg = cmdArgs[0];
        
        if(arg == "hit") {
            if(!curGame && msg.mentions.users.array().length < 1) {
                msg.channel.send("No current game running");
                return;
            }
            if(msg.author.username == curGame?.curPlayer().name) {
                curGame?.hit();
            } else {
                msg.channel.send("Current active player is: " + curGame?.curPlayer().name);
            }
        } else if (arg == "stay"){
            if(!curGame && msg.mentions.users.array().length < 1) {
                msg.channel.send("No current game running");
                return;
            }
            if(msg.author.username == curGame?.curPlayer().name) {
                curGame?.stay();
            } else {
                msg.channel.send("Current active player is: " + curGame?.curPlayer().name);
            }
        } else if (arg == "restart") {
            curGame = new Blackjack(msg.channel, prevGame.players);
            curGame.shuffle();
            curGame.dealInitial();
            curGame.sayTurn();
        } else {
            const users = msg.mentions.users.array();
            if(users.length < 2) {
                msg.channel.send("Needs at least 2 players to play blackjack");
                return;
            }
            msg.channel.send("Starting game!");
            const players = users.map(u => new CardPlayer(u.username, u));
            curGame = new Blackjack(msg.channel, players)
            curGame.shuffle();
            curGame.dealInitial();
            curGame.sayTurn();
        }
        if(curGame?.finished) {
            prevGame = curGame;
            curGame = undefined;
        }
    }
}