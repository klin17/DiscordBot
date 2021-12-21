# DiscordBot

## Description
This bot is made for fun and not to do anything too serious. It has various simple commands mostly created to test out the Discord.js API. It also can respond to certain key phrases with hardcoded responses. 

This bot uses Node.js and is deployed on Heroku.

### Bot Add Link
https://discord.com/oauth2/authorize?client_id=821816503791124523&scope=bot&permissions=2147483647  
_You can only add bots to servers you have MANAGE_GUILD permissions for_

## Bot Editing
Please make sure to run `npm install` to install the required packages before testing. Let me know if you need to test your code so I can turn off the cloud bot.


## Ideas and things to maybe add/change:

[comment]: # (the format - [ ] denotes a tickbox for markdown in github. This may not show up properly in the VScode markdown preview)

***Keywords***
 - [ ] respond to "I'm xxxxxxx" with "Hi xxxxx"

***Commands***
 - [x] polling
 - [ ] $ban and $unban
 - [ ] $kick
 - [ ] Add (time) parameter for $revoke
 - [x] Add (time) parameter for $mute
 - [x] DM permadmins when $login succcessful
 - [x] Add embed for $help
 - [ ] $keywords, to list keywords
 - [x] Use nickname to $login notification and $whoami
 - [x] Add "Use $help (commandName) for info on a specific command" to $commands embed
 - [ ] Add (from) and (to) parameters to $prune
 - [ ] Add $customreact \<reactionName>
, where a user can create a custom reaction for the bot by reacting to message: "React to this message with your custom reactions!". Afterwards, bot will react with the same reactions in response to \<reactionName>
 - [ ] Add restricted $removereact \<reactionName> to remove a custom reaction
 - [x] $magic8 - gives a magic 8 ball response

***General***
 - [x] logging in as bot admin
 - [x] Be able to disable commands
 - [ ] Be able to disable keywords
 - [x] Move commands into separate files
 - [ ] ~~batch commands~~ (conflicts with $echo msgWithComma)
 - [ ] Extend reaction functionality
 - [ ] Reaction from command caller dismisses bot response message
 - [ ] Prevent word banning in DMs to bot
 - [ ] Prevent commands in DMs?
 - [ ] Pull out enabled/disabled handler into separate file (maybe: commandStatus.js ?)
 - [ ] Add a database for persistent storage ???? (may be too much)
 - [ ] Implement points system for each server
 - [ ] Add description comments for functions
 - [x] Pokehelp functionality

 ***Blackjack***
 - [ ] Clean the code!
    - [ ] add comments
    - [ ] organize for readability
    - [ ] 
 - [x] Add bot as dealer
 - [x] Print cards with suit emoji instead of letters
 - [ ] Track statistics (win/loss, points earned, games played) for each player (in each server)
 - [ ] Remember points across multiple games (though maybe not across bot restarts)
