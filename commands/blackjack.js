
class CardPlayer {
	constructor(name, user) {
		this.name = name;
		this.hand = [];
        this.user = user;
        this.points = 100;
        this.bet = 0;
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

    sumHand() {
        const high = this.hand.reduce((acc, e) => acc + cardValue(e, true), 0);
        const low = this.hand.reduce((acc, e) => acc + cardValue(e, false), 0);
        if(high > 21) {
            return low;
        }
        return high;
    }
}

function cardValue(cardString, high=true) {
    const n = parseInt(cardString.charAt(0));
    if(isNaN(n) || n < 1) {
        switch (cardString.charAt(0)) {
            case 'A':
                return high ? 11 : 1;
            default:
                return 10;
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
        players.forEach(p => p.hand = []);
		this.players = players;
		this.deck = [...initialDeck];
		this.discard = [];
        this.turn = 0;
        this.bust = [];
        this.finished = false;
        this.numBets = 0;
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
			this.channel.send(p.name + ": " + res +" - " + p.sumHand().toString());
		}
	}

	dealInitial() {
		this.dealOne(); this.dealOne();
        const naturals = this.players.filter(p => p.sumHand() == 21);
        this.showCards();
        if(naturals.length > 0) {
            naturals.forEach(p => this.channel.send(p.name + " has a blackjack!"));
            this.finished = true;
        } else {
            this.sayTurn();
        }
	}

    curPlayer() {
        return this.players[this.turn];
        // if undefined then all players played their turn
    }

    sayTurn() {
        if(this.numBets == this.players.length) {
            this.channel.send("It's " + this.curPlayer().name + "'s turn to hit/stay");
        } else {
            this.channel.send("It's " + this.curPlayer().name + "'s turn to bet");
        }
    }

    hit() {
        this.curPlayer().receiveCard(this.topCard());
        let res = this.curPlayer().hand.length > 0 ? this.curPlayer().hand.join(" ") : "no cards";
		this.channel.send(this.curPlayer().name + ": " + res + " - " + this.curPlayer().sumHand());

        // check if over
        if(this.curPlayer().sumHand() > 21) {
            this.channel.send("You went over!");
            this.bust.push(this.curPlayer());
            this.nextPlayer();
        }
    }

    nextPlayer() {
        this.turn++;
        if(this.checkWinners()){
            return;
        }
        
        this.sayTurn();
        // // if curplayer is bust, go to next player
        // if(this.bust.some(p => p.name == this.curPlayer().name)) {
        //     this.nextPlayer();
        // } else {
        //     this.sayTurn();
        // }
    }

    stay() {
        this.nextPlayer();
    }

    handlePoints(winners) {
        const numNonwinners = this.players.reduce((acc, p) => winners.includes(p) ? acc : acc + 1, 0);
        const winningsString = winners.reduce((acc, w) => acc + w.name + " won: " + (w.bet * (numNonwinners + 1)).toString() + " ", "");
        this.players.forEach(p => p.points -= p.bet);
        winners.forEach(w => w.points += w.bet * (numNonwinners + 1));

        for(let i in this.players) {
            if(this.players[i].points == 0) {
                this.channel.send("Players: " + this.players[i].name + " has 0 points. Bye!");
                this.players.splice(i, 1); 
            }
        }

        this.channel.send(winningsString);
    }

    checkWinners() {
        //// check if one player left unbusted
        if(this.bust.length >= this.players.length - 1) {
            console.log("there is no next player");
            const winner = this.players.find(p => !this.bust.some(bp => bp.name == p.name));
            this.channel.send("Winner is: " + winner.name + " who bet: " + winner.bet.toString());
            this.handlePoints([winner]);
            this.finished = true;
            console.log("finished from busting");
            return true;
        }

        //check for everyone having finished
        if(this.curPlayer() === undefined) {
            // everyone is done playing
            let winners = [];
            let maxscore = 0;
            for(let p of this.players) {
                if(this.bust.some(bp => bp.name == p.name)) {
                    continue; // this player is busted
                }
                if(p.sumHand() > maxscore) {
                    maxscore = p.sumHand();
                    winners = [p];
                } else if(p.sumHand() == maxscore) {
                    winners.push(p);
                }
            }
            if(winners.length < 1) {
                console.error("This should not happen ??");
            }
            if(winners.length == 1) {
                const winner = winners[0];
                this.channel.send("The winner is: " + winner.name + " who bet: " + winner.bet.toString());
                console.log("Only one winner");
            } else {
                const winnersString = winners.reduce((acc, e) => acc + e.name + ": bet- " + e.bet.toString(), "");
                this.channel.send("We have a tie! Winners: " + winnersString);
                console.log("Tied winners");
            }
            this.handlePoints(winners)
            this.finished = true;
            console.log("finished from everyone playing");
            return true;
        }
        return false;
    }

    newRound() {
        let oldCards = [];
        for(let p of this.players) {
            oldCards = oldCards.concat(p.hand);
            p.hand = [];
        }
        this.discard = this.discard.concat(oldCards);
        this.turn = 0;
        this.finished = false;
        this.bust = [];
        this.numBets = 0;
    }

    copyState(otherGame) {
        this.channel = otherGame.channel;
		this.players = [...otherGame.players];
		this.deck = [...otherGame.deck]
		this.discard = [...otherGame.discard];
        this.turn = otherGame.turn;
        this.bust = [...otherGame.bust];
        this.finished = otherGame.finished;
        this.numBets = otherGame.numBets;
    }

    isBetting() {
        return this.numBets < this.players.length;
    }

    bet(amount) {
        if(this.curPlayer().points < amount) {
            this.channel.send(`You only have: ${this.curPlayer().points} points, bet smaller`);
            return false;
        }
        this.curPlayer().bet = amount;
        this.channel.send(this.curPlayer().name + " bet: " + amount.toString());
        this.turn++; // I think this can be deleted?
        this.numBets++;
        if(this.numBets == this.players.length) {
            this.turn = 0;
        }
        this.sayTurn();
        return true;
    }

    showPoints() {
        this.players.forEach(p => this.channel.send(`${p.name}: ${p.points}`));
    }
}

let prevGame = new Blackjack(undefined, []);
let curGame = new Blackjack(undefined, []);

module.exports = {
    name: "blackjack",
    usage: "blackjack (startingPoints) @<player1> @<player2> ... | hit | stay | restart | next",
    description: "starts blackjack game with mentioned players",
    action: (msg, cmdArgs) => {
        let arg = cmdArgs[0].toLowerCase();
        
        if(arg == "hit") {
            if(curGame === undefined) {
                msg.channel.send("No current game running");
                return;
            }
            if(msg.author.username == curGame?.curPlayer().name) {
                if(curGame?.isBetting()) {
                    msg.channel.send("All players must bet before hitting can start");
                } else {
                    curGame?.hit();
                }
            } else {
                msg.channel.send("Current active player is: " + curGame?.curPlayer().name);
            }
        } else if (arg == "stay"){
            if(curGame === undefined) {
                msg.channel.send("No current game running");
                return;
            }
            if(msg.author.username == curGame?.curPlayer().name) {
                if(curGame?.isBetting()) {
                    msg.channel.send("All players must bet before game can start");
                } else {
                    curGame?.stay();
                }
            } else {
                msg.channel.send("Current active player is: " + curGame?.curPlayer().name);
            }
        } else if (arg == "bet") {
            if(!curGame?.isBetting()) {
                msg.channel.send("Current game already received bets");
                return;
            }
            if(msg.author.username !== curGame?.curPlayer().name) {
                msg.channel.send("Active player is: " + curGame?.curPlayer().name);
                return;
            }
            let amount = parseInt(cmdArgs[1]);
            if(!amount) {
                msg.channel.send("Please bet an integer amount");
            } else if (amount < 1) {
                msg.channel.send("Please bet a positive integer amount");
            } else {
                curGame.bet(amount);
            }
        } else if (arg == "restart") {
            curGame = new Blackjack(msg.channel, prevGame.players);
            curGame.shuffle();
            curGame.dealInitial();
        } else if (arg == "next") {
            if(curGame === undefined && prevGame.finished) {
                console.log("going to next round");
                curGame = new Blackjack(undefined, []);
                curGame.copyState(prevGame);
                curGame.newRound();
                curGame.dealInitial();
                console.log("curgame is now: ");
                console.log(curGame);
                console.log(curGame === undefined);
            } else {
                if(prevGame === undefined) {
                    msg.channel.send("Start a game first");
                } else {
                    msg.channel.send("Current game is not finished");
                }
            }
        } else if (arg == "deck") {
            msg.channel.send("Game has " + curGame?.deck.length.toString() + " cards in deck");
        } else if (arg == "cards") {
            curGame?.showCards();
        } else if (arg == "points") {
            curGame?.showPoints();
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
        }
        if(curGame?.finished) {
            curGame.showPoints();
            prevGame.copyState(curGame);
            curGame = undefined;
        }
    }
}