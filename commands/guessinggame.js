
let randnum = Math.floor((Math.random() * 100) + 1);

module.exports = {
    name: "guessinggame",
    usage: "guessinggame (<guess>)",
    description: "starts a guessing game, or guesses with <guess>",
    action: (msg, cmdArgs) => {
        if(cmdArgs.length < 1) {
            // starting new game
            randnum = Math.floor((Math.random() * 100) + 1);
            msg.channel.send("Starting new guessing game");
        } else {
            const guess = cmdArgs[0];
            if(guess == randnum) {
                msg.channel.send("You did it, good job homie!");
                randnum = Math.floor((Math.random() * 100) + 1);
            } else if (guess > randnum) {
                msg.channel.send("Lower");
            } else {
                msg.channel.send("Higher");
            }
        }
    }
}