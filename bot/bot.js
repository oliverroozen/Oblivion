//Add ability to tell person when another person comes online
//Add libraries of helpful info and websites to help people code

console.log("-----------------\nInitializing Oblivion...");

var DiscordClient = require('discord.io');
var bot = new DiscordClient({
    autorun: true,
    token: "MTgwOTA4MDk5NjY4OTM0NjU2.ChhDTA.E6qWXN0DJ7QdipOwwAWf2Y9sg34"
});
var userOnlineAlerts = [];

var commands = {
    "commands": {
		usage: "",
        description: "Posts a list of all commands that the bot can use through PM.",
		process: function(user, userID, channelID, message, rawEvent, replyID, parsedVars) {
            bot.sendMessage({
                to: channelID,
                message: replyID + " a full list of commands has been PMed to you, mate. Have fun with yer new toys :yum:"
            });
            var listAsString = "";
            commands.forEach(function(currentValue, index, array) {
                listAsString = listAsString.concat(('\n`>' + index + '` | _' + array[index].description + '_'));
            });
            console.log("Listasstring:" + listAsString);
		    bot.sendMessage({
                to: userID,
                message: "https://imgflip.com/i/14mjrr\n***Full command list:***"// + listAsString
            });
		}
	},
	"ping": {
		usage: "",
        description: "Returns 'pong' with 'ping'. Originally designed to create spam with other bots.",
		process: function(user, userID, channelID, message, rawEvent, replyID, parsedVars) {
		    bot.sendMessage({
                to: channelID,
                message: "pong",
                tts:true
            });
		}
	},
    "help": {
		usage: "",
        description: "Displays a 'help' dialouge that gives information on how to use " + bot.username + ".",
		process: function(user, userID, channelID, message, rawEvent, replyID, parsedVars) {
		    bot.sendMessage({
                to: channelID,
                message: "Glad you've taken notice of me, " + replyID + " :yum:\nThe '>' character is what you use to get my attention in _most_ cases. Type it in to get a shortlist of commands.\nMany of my functions will take variables that will be parsed in it's execution, and they are formatted like `>command(var1|var2|var3)`. To get info on what inputs a function requires, simply type it in without any arguments.\nFuther information will be provided soon, stand by...",
                typing:true
            });
		}
	},
    "play": {
		usage: "",
        description: "Sets what game " + bot.username + " is playing.",
		process: function(user, userID, channelID, message, rawEvent, replyID, parsedVars) {
		    bot.setPresence({
                game: parsedVars[1]    //Optional, shows this message next to "Playing", underneath your name
            });
            bot.sendMessage({
                to: channelID,
                message: "Why do I have to play " + parsedVars[1] + " of all games? _Really " + replyID + "?_\nBefore you get all teary-eyed, just remember that as a robot, I have do do everything you say."
            });
		}
	},
    "shutdown": {
		usage: "",
        description: "Shuts down the bot, closing it's server.",
		process: function(user, userID, channelID, message, rawEvent, replyID, parsedVars) {
		    bot.sendMessage({
                to: channelID,
                message: "How could you do this " + replyID + "? :cry:\nGoodbye, cruel world..."
            });
            setTimeout(function(){
               bot.sendMessage({
                    to: channelID,
                    message: "_" + bot.username + " is now offline..._"
                });
                console.log('Shutting down bot and closing program.');
            }, 2500);
            setTimeout(function(){
               process.send('shutdown');
            }, 2800);
		}
	},
    "restart": {
		usage: "",
        description: "Restarts the bot to reload source files, clear memory, and recieve any updates.",
		process: function(user, userID, channelID, message, rawEvent, replyID, parsedVars) {
            console.log('Restarting bot and reloading code from file...')
            bot.sendMessage({
                to: channelID,
                message: "***I'll be back.***"
            });
            setTimeout(function(){
                process.send('restart'); 
            }, 1000);
		}
	},
    "calculate": {
		usage: "",
        description: "Does math. What more do you need?",
		process: function(user, userID, channelID, message, rawEvent, replyID, parsedVars) {
		    bot.sendMessage({
                to: channelID,
                message: "Never been one for math, aye " + replyID + "?\nI digress, the answer is **" + parsedVars[1] + "**."
            });
		}
	},
    "alertwhenonline": {
		usage: "",
        description: "Alerts you when the a user comes online.",
		process: function(user, userID, channelID, message, rawEvent, replyID, parsedVars) {
            parsedVars[1] = parsedVars[1].match(/<@(.+?)(?=>)/).substr(2);
		    userOnlineAlerts[parsedVars[1]] = [userID, channelID];
            console.log('User ' + userID + " will be alerted when user " + parsedVars[1] + " comes online.");
            bot.sendMessage({
                to: channelID,
                message: replyID + " you'll be alerted when that person comes back online."
            });
		}
	},
    "fakecommand": {
		usage: "",
        description: "Betcha didn't think this existed, did ya?",
		process: function(user, userID, channelID, message, rawEvent, replyID, parsedVars) {
            console.log(user + " is on to us! They're discovering things never meant for discovery!");
            bot.sendMessage({
                to: channelID,
                message: "Betcha didn't think _this_ would be a command, did you " + replyID + "? What does this command do? Well, be patient, stay vigiliant, and I guess we'll have to wait and see, won't we?"
            });
		}
	},
    "shrekislove": {
		usage: "<number of Shrek is love story>",
        description: "Shrek is life.",
		process: function(user, userID, channelID, message, rawEvent, replyID, parsedVars) {
            console.log("It's time.");
            if (parsedVars[1] == null) {parsedVars[1] = 0};
            shrekislove[parsedVars[1]].forEach(function(currentValue, index, array){
                bot.sendMessage({
                    to: channelID,
                    message: array[index],
                    tts:true
                });
            });   
		}
	}
};

bot.on('ready', function() {
    if (debugMode = true) {console.log("Entering debug mode!")};
    console.log("Server online! | " + bot.username + " - (" + bot.id + ")");
    
        for (var key in bot.servers) {
            for (var key2 in bot.servers[key].channels) {
                bot.sendMessage({
                    to: bot.servers[key].channels[key2].id,
                    message: "***" + bot.username + " is back, bitches.***\nI hope you @wankers are ready for some >hardc0re banter, because that's all you're going to be getting."
                });
            }
        }
});

bot.on('message', function(user, userID, channelID, message, rawEvent) {
    if (userID != bot.id) {
        var replyID = "<@" + userID + ">";
        var commandInfo = [];
        
        if (message.charAt(0) === ">") {
            if (message.indexOf('(') == -1) {
                commandInfo.push(message.substr(1));
            } else {
                //Match anything preceeded by >, (, or |, and succeeded by ), |, or (.
                commandInfo = message.match(/(?:>|\(|\|)(.+?)(?=\(|\||\))/g);
                commandInfo.forEach(function(currentValue, index, array) {
                    array[index] = currentValue.substr(1);
                })
                /*var match;
                while (match = /(?:>|\(|\|)(.+?)(?=\(|\||\))/g.exec(message) !== null) {
                    commandInfo.push(match[0]);
                }*/
            }
            console.info('Command ' + commandInfo[0] + ' requested; Parsed variables: ' + commandInfo + "\nRequesting command...");
            try {
                var execute = commands[commandInfo[0].toLowerCase()].process(user, userID, channelID, message, rawEvent, replyID, commandInfo);
            } catch(error) {
                if (typeof commands[commandInfo[0]] == 'undefined') {
                    console.log("Command '" + commandInfo[0] + "' not found!");
                    bot.sendMessage({
                        to: channelID,
                        message: replyID + " bruh, I think you typed the command name in wrong; I can't seem to find it anywhere. And trust me, I've tried. I searched high, and I searched low, I even found Warwick Davis on my travels! But alas, thy labour hath been fruitless. To get a list of commands (and thus educate thyself), type `>commands`.\n\nPerhaps you thought I had this command, or you think I _should_ have this command. If so, then you can submit a sugguestion to _The Creator_ through the command `>sugguest(<sugguestion>)`."
                    });
                }
            }
            console.log('Command complete.');
        }
    }
});
    
  /* 
    switch(true) {
        case message == "pong":
            bot.sendMessage({
                to: channelID,
                message: "ping"
            });
            break;
        case message == ">updatePresence":
            bot.setPresence({
                idle_since: null,  //Optional, sets your presence to idle, null to go online
                game: "ROBLOX"    //Optional, shows this message next to "Playing", underneath your name
            });
            bot.sendMessage({
                to: channelID,
                message: bot.username + "'s presence updated."
            });
            break;
        case message == ">updateInfo":
            bot.editUserInfo({
                //avatar: require('fs').readFileSync('/path/to/image.jpg', 'base64'), //Optional
                email: 'mrbondusa5@gmail.com', //Optional
                new_password: 'Murph3sL0re', //Optional
                password: 'Murph3sL0re', //Required
                //username: 'Luna' //Optional
            });
            bot.sendMessage({
                to: channelID,
                message: bot.username + "'s user info updated."
            });
            break;
        case message == ">help":
            bot.sendMessage({
                to: channelID,
                message: "Glad you've taken notice of me, " + replyID + " :yum:\nThe '>' character is what you use to get my attention in _most_ cases. Type it in to get a shortlist of commands.\nTo get info on what inputs a function requires, simply type it in without any arguments.\nFuther information will be provided soon, stand by..." 
            });
            break;
        case message == ">commands":
            bot.sendMessage({
                to: channelID,
                message: "This bot has many a command, " + replyID + ". _My creator_ labours both day and night to expand my ability and perspicacity. A full list of commands are as follows:\n"
            });
            break;
        case message == ">shutdown":
            bot.sendMessage({
                to: channelID,
                message: "How could you do this " + replyID + "?\nGoodbye, cruel world..."
            });
            bot.disconnect();
            process.exit();
            break;
        case (message.toLowerCase().indexOf(bot.username.toLowerCase()) > -1 || message.indexOf(bot.id) > -1):
            bot.sendMessage({
                to: channelID,
                message: replyID + " YOU CALLED ME LADDIE?"
            });
            break;
        case message.substring(0, 1) == ">":
            bot.sendMessage({
                to: channelID,
                message: replyID + " Command shortlist:\n`>` Shows short command list\n`>help` Provides info on bot usage"
            });
            
        }
            */

bot.on("presence", function(user, userID, status, gameName, rawEvent) {
    console.log(user + " is now " + status);
    /*for (var key in bot.servers) {
        for (var key2 in bot.servers[key].channels) {
            bot.sendMessage({
                to: bot.servers[key].channels[key2].id,
                message: "_" + user + " is now " + status + "_"
            });
        }
    };*/
    if ((userID in userOnlineAlerts) && status == "online") {
        userOnlineAlerts[userID].forEach(function(){
            console.log("Alerting " + userOnlineAlerts[userID][0] + " that " + user + " has come online...");
            bot.sendMessage({
                    to: userOnlineAlerts[userID][1],
                    message: "_<@" + userOnlineAlerts[userID][0] + ">, " + user + " is now " + status + "_"
            });
        });
        userOnlineAlerts.splice(userID, 1);
    }
});
bot.on("disconnected", function() {
    console.log(bot.username + " disconnected! Reconnecting...");
    bot.connect(); //Auto reconnect
});

process.on('uncaughtException', function (err) {
  console.log('Caught exception: ' + err);
});

function rand(min,max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

var shrekislove = [
    [
        "I was only 9 years old\nI loved Shrek so much, I had all the merchandise and movies\nI pray to Shrek every night before bed, thanking him for the life I’ve been given",
        "“Shrek is love” I say; “Shrek is life”\nMy dad hears me and calls me a faggot\nI know he was just jealous of my devotion for Shrek\nI called him a cunt",
        "He slaps me and sends me to go to sleep\nI’m crying now, and my face hurts\nI lay in bed and it’s really cold\nSuddenly, a warmth is moving towards me",
        "It’s Shrek\nI am so happy\nHe whispers into my ear “This is my swamp.”\nHe grabs me with his powerful ogre hands and puts me down onto my hands and knees",
        "I’m ready\nI spread my ass-cheeks for Shrek\nHe penetrates my butt-hole\nIt hurts so much but I do it for Shrek",
        "I can feel my butt tearing as my eyes start to water\nI push against his force\nI want to please Shrek\nHe roars in a mighty roar as he fills my butt with his love",
        "My dad walks in\nShrek looks him straight in the eyes and says “It’s all ogre now.”\nShrek leaves through my window\nShrek is love. Shrek is life."
    ]
];





//  https://discordapp.com/oauth2/authorize?client_id=180907999219548160&scope=bot&permissions=536083519
//  7ba126ed94470757a5442f6ba4a1d013
//  node files/oblivion/OblivionA1.js
//  bot.servers[serverID].members[userId].roles.forEach()
/*
set path=%path%;C:\Users\Ollie\Google Drive\nodejs\node.exe
reg.exe ADD "HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Session Manager\Environment" /v Path /t REG_EXPAND_SZ /d %path% /f
*/
//setx path "%path%;C:\Users\Ollie\Google Drive\nodejs\node.exe"