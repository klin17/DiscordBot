
const Discord = require('discord.js');

class CardPlayer {
	constructor(name, user, isDealer=false) {
		this.name = name;
		this.hand = [];
        this.user = user;
        this.points = 100;
        this.bet = 0;
        this.isDealer = isDealer;
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

function prettyCard(cardString) {
    let suit = cardString.charAt(1);
    if(suit == "C") {
        suit = "♣️";
    } else if (suit == "D") {
        suit = "♦";
    } else if (suit == "H") {
        suit = "♥️";
    } else if (suit == "S") {
        suit = "♠️";
    } else {
        suit = "?";
    }
    let numString = cardString.charAt(0);
    if(numString == "0") {
        numString = "10"
    }
    return numString + suit;
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
        this.players.push(new CardPlayer("Dealer", undefined, true));
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

	showCards(showAll = false) {
		for(let p of this.players) {
            let res = p.hand.length > 0 ? p.hand.map(prettyCard).join(", ") : "no cards";
            if(p.isDealer && !showAll) {
                let cards = [];
                for(let i in p.hand) {
                    if(i == 1) {
                        cards.push("🃏");
                    } else {
                        cards.push(prettyCard(p.hand[i]));
                    }
                }
                res = cards.join(", ");
                this.channel.send(p.name + ": " + res +" - ??")
            } else {
                this.channel.send(p.name + ": " + res +" - " + p.sumHand().toString());
            }
		}
	}

	dealInitial() {
		this.dealOne();
        this.showCards();
        this.sayTurn();
	}

    dealSecond() {
        this.dealOne();
        this.showCards();
        const naturals = this.players.filter(p => p.sumHand() == 21);
        if(naturals.length > 0) {
            naturals.forEach(p => this.channel.send(p.name + " has a blackjack!"));
            this.handlePoints([], [], naturals.filter(p => !p.isDealer));
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
        if(!this.isBetting()) { // -1 because of dealer
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
        if(!this.tryDealer() && !this.checkWinners()) {
            this.sayTurn();
            if(this.curPlayer().sumHand() == 21 && this.curPlayer.hand.length == 2) {
                // natural blackjack
                this.channel.send(this.curPlayer().name + " had a natural blackjack, no need to hit/stay");
                this.nextPlayer();
            }
        }
    }

    stay() {
        this.nextPlayer();
    }

    handlePoints(winners, ties, blackjacks) {
        if(blackjacks.length == 1) {
            const winner = blackjacks[0];
            this.channel.send(winner.name + " who bet: " + winner.bet.toString() + " and had a blackjack");
            console.log("Only one blackjack"); 
        } else if (blackjacks.length > 1) {
            const winnersString = blackjacks.reduce((acc, e) => acc + e.name + ": bet- " + e.bet.toString(), "");
            this.channel.send("The natural blackjacks are: " + winnersString);
            console.log("Multiple blackjacks");
        }
        // State who won and their bets
        if(winners.length == 1) {
            const winner = winners[0];
            this.channel.send("The winner is: " + winner.name + " who bet: " + winner.bet.toString());
            console.log("Only one winner");
        } else if (winners.length > 1) {
            const winnersString = winners.reduce((acc, e) => acc + e.name + ": bet- " + e.bet.toString(), "");
            this.channel.send("The winners are: " + winnersString);
            console.log("Multiple winners");
        }
        // State who tied and their bets
        if(ties.length > 0) {
            const tiesString = ties.reduce((acc, e) => acc + e.name + ": bet- " + e.bet.toString(), "");
            this.channel.send("People who tied dealer: " + tiesString + ", keep their bets");
        }

        // Calculate the winnings for each winner
        this.players.forEach(p => p.points -= p.bet);
        blackjacks.forEach(b => b.points += Math.ceil(b.bet * 2.5));
        winners.forEach(w => w.points += w.bet * 2);
        ties.forEach(t => t.points += t.bet);
        // Remove players with 0 points left
        for(let i in this.players) {
            if(this.players[i].points == 0) {
                this.channel.send("Players: " + this.players[i].name + " has 0 points. Bye!");
                this.players.splice(i, 1);
            }
        }
    }

    checkWinners() {
        // check for if game over conditions
        if(this.curPlayer() === undefined || this.bust.length >= this.players.length - 1) {
            // everyone finished or only one player left unbusted
            let winners = [];
            let ties = [];
            const dealer = this.players[this.players.length - 1];
            for(let p of this.players) {
                if(this.bust.some(bp => bp.name == p.name)) {
                    continue; // this player is busted
                }
                if(p.isDealer) {
                    continue; // this is the dealer
                }
                const diff = p.sumHand() - dealer.sumHand();
                if(diff > 0) {
                    winners.push(p);
                } else if(diff == 0) {
                    ties.push(p);
                }
            }
            this.handlePoints(winners, ties, [])
            this.finished = true;
            console.log("Game finished");
            return true;
        }
        return false;
    }

    tryDealer() {
        if(this.curPlayer()?.isDealer) {
            // show curPlayer/Dealer's hand
            let res = this.curPlayer().hand.length > 0 ? this.curPlayer().hand.join(" ") : "no cards";
		    this.channel.send(this.curPlayer().name + ": " + res + " - " + this.curPlayer().sumHand());

            if(this.bust.length < this.players.length - 1) {
                const dealer = this.curPlayer();
                while(dealer.sumHand() < 17) {
                    this.channel.send("Dealer must hit");
                    this.hit();
                }
                this.channel.send(this.curPlayer().name + " must stay");
                this.stay();
            } else {
                console.log(this.bust.length);
                console.log(this.players.length);
                this.channel.send("Everyone else busted, dealer wins");
                this.channel.send(this.curPlayer().name + " stays");
                this.stay();
            }
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
        return this.numBets < this.players.length - 1;
    }

    bet(amount) {
        if(this.curPlayer().points < amount) {
            this.channel.send(`You only have: ${this.curPlayer().points} points, bet smaller`);
            return false;
        }
        this.curPlayer().bet = amount;
        this.channel.send(this.curPlayer().name + " bet: " + amount.toString());
        this.turn++; 
        this.numBets++;
        if(!this.isBetting()) { // - 1 because dealer exists
            this.turn = 0;
            this.dealSecond();
        } else {
            this.sayTurn();
        }
        return true;
    }

    showPoints() {
        this.players.forEach(p => {if(!p.isDealer){ this.channel.send(`${p.name}: ${p.points}`) }});
    }
}

let prevGame = new Blackjack(undefined, []);
let curGame = undefined;

const needsRunningGame = ["hit", "stay", "bet", "deck", "cards", "points", "turn"];
const needsActivePlayer = ["hit", "stay", "bet"];

module.exports = {
    name: "blackjack",
    usage: "blackjack (startingPoints) @<player1> @<player2> ...",
    description: "creates a game with mentioned players, or does blackjack commands. Use $blackjack help for more info",
    action: (msg, cmdArgs) => {
        let arg = cmdArgs[0].toLowerCase();
        
        if(curGame === undefined && needsRunningGame.includes(arg)) {
            msg.channel.send("No current game running");
            return;
        }
        if(needsActivePlayer.includes(arg) && msg.author.username !== curGame?.curPlayer().name) {
            msg.channel.send("Current active player is: " + curGame?.curPlayer().name);
            return;
        }
        if(arg == "rules") {
            let rulesEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle("Blackjack Rules")
                .addField("Goal", "Get a larger hand value than the dealer to win your bet")
                .addField("Hand Value", "Sum the numbers on your cards, J Q K count as 10, A counts as 1 or 11")
                .addField("Game play", "You will receive one card, a round of betting will take place, then a second card" +
                    ", afterwards you can choose to 'hit' to gain another card, or 'stay' to pass the turn to the next player")
                .addField("Dealer", "The bot/dealer must hit until they have 17 or more, upon which they must stay")
                .addField("Winnings", "You win your bet if you beat the dealer, you lose your bet if the delaer beat you, and you keep your bet if you tied")
                .addField("Blackjacks", "When you get 21 on first two cards. You get 1.5 times your bet rounded up and don't hit/stay");

            msg.channel.send(rulesEmbed);
        } else if (arg == "help") {
            let helpEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle("Blackjack Comamnds")
                .addField("help", "Send this help message")
                .addField("rules", "Send")
                .addField("hit", "hit if you are the current player")
                .addField("stay", "stay if you are the current player")
                .addField("bet <amount>", "bet <amount> if you are current player, use an integer <amount>")
                .addField("restart", "restart the current game")
                .addField("next", "continue current game with a new round")
                .addField("cards", "shows cards")
                .addField("points", "shows current points")
                .addField("turn", "shows current player");
                
            msg.channel.send(helpEmbed);
        } else if(arg == "hit") {
            if(curGame?.isBetting()) {
                msg.channel.send("All players must bet before hitting can start");
            } else {
                curGame?.hit();
            }
        } else if (arg == "stay"){
            if(curGame?.isBetting()) {
                msg.channel.send("All players must bet before game can start");
            } else {
                curGame?.stay();
            }
        } else if (arg == "bet") {
            if(!curGame?.isBetting()) {
                msg.channel.send("Current game already received bets");
                return;
            }
            let amount = parseInt(cmdArgs[1]);
            if(!amount) {
                msg.channel.send("Please bet an integer amount");
            } else if (amount < 1) {
                msg.channel.send("Please bet a positive integer amount");
            } else {
                curGame?.bet(amount);
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
        } else if (arg == "turn") {
            curGame?.sayTurn();
        } else {
            const users = msg.mentions.users.array();
            if(users.length < 1) {
                msg.channel.send("Needs at least 1 players to play blackjack");
                return;
            }
            msg.channel.send("Starting game!");
            const players = users.map(u => new CardPlayer(u.username, u));
            curGame = new Blackjack(msg.channel, players)
            curGame.shuffle();
            curGame.dealInitial();
        }

        // always update based on if curGame is finished
        if(curGame?.finished) {
            curGame.showPoints();
            prevGame.copyState(curGame);
            curGame = undefined;
        }
    }
}