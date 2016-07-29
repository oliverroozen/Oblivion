// Use module.exports to refer to command list
module.exports = {
    "commands": {
		usage: "",
        description: function(bot){return 'Posts a list of all commands that ' + bot.username + ' can use through PM.'},
        functional: true,
		process: function(bot, SQLconn, user, userID, channelID, message, rawEvent, replyID, parsedVars) {
            console.log('Commands loading...');
            var commandListString = "";
            for (var cmd in module.exports) {
                var desc = module.exports[cmd].description(bot);
                if (module.exports[cmd].functional != false) {
                    commandListString += ('\n`>' + cmd + '` | _' + desc + '_');
                }
            }
		    bot.sendMessage({
                to: userID,
                message: '***Full command list:***\n---------------------------------------------' + commandListString + '\n---------------------------------------------\nhttps://imgflip.com/i/14mjrr'
            });
            bot.sendMessage({
                to: channelID,
                message: replyID + ' a full list of commands has been PMed to you, mate. Have fun with yer new toys :yum:'
            });
		}
	},
	"ping": {
		usage: "",
        description: function(bot){return "Answers with 'pong'. This command was originally designed to create infinite spam when combined with another bot."},
        functional:true,
		process: function(bot, SQLconn, user, userID, channelID, message, rawEvent, replyID, parsedVars) {
		    bot.sendMessage({
                to: channelID,
                message: "pong",
                tts:true
            });
		}
	},
    "help": {
		usage: "",
        description: function(bot){return "Displays a 'help' dialouge that gives information on how to use " + bot.username + "."},
        functional:true,
		process: function(bot, SQLconn, user, userID, channelID, message, rawEvent, replyID, parsedVars) {
		    bot.sendMessage({
                to: channelID,
                message: "Glad you've taken notice of me, " + replyID + " :yum:\nThe '>' character is what you use to get my attention in _most_ cases. Type it in to get a shortlist of commands.\nMany of my functions will take variables that will be parsed in it's execution, and they are formatted like `>command(var1|var2|var3)`. To get info on what inputs a function requires, simply type it in without any arguments.\nCurrently the `>suggest()` command is disfunctional, so if you wish to make sugguestions or submit bug reports, go to https://github.com/MrSp33dy123/Oblivion/issues"
            });
		}
	},
    "play": {
		usage: "",
        description: function(bot){return "Sets what game " + bot.username + " is playing."},
        functional:true,
		process: function(bot, SQLconn, user, userID, channelID, message, rawEvent, replyID, parsedVars) {
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
        description: function(bot){return "Shuts down the bot, closing its server."},
        functional:true,
		process: function(bot, SQLconn, user, userID, channelID, message, rawEvent, replyID, parsedVars) {
            console.log('Shutting down bot and closing program.');
            SQLconn.end();
		    bot.sendMessage({
                to: channelID,
                message: "How could you do this " + replyID + "? :cry:\nGoodbye, cruel world...\n\n_" + bot.username + " is now offline..._"
            });
            setTimeout(function(){
               process.send('shutdown');
            }, 1000);
		}
	},
    "restart": {
		usage: "",
        description: function(bot){return "Restarts the bot to reload source files, clear memory, and recieve any updates."},
        functional:true,
		process: function(bot, SQLconn, user, userID, channelID, message, rawEvent, replyID, parsedVars) {
            console.log('Restarting bot and reloading code from file...');
            SQLconn.end();
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
        description: function(bot){return "Does math. What more do you need?"},
        functional:false,
		process: function(bot, SQLconn, user, userID, channelID, message, rawEvent, replyID, parsedVars) {
		    bot.sendMessage({
                to: channelID,
                message: "Never been one for math, aye " + replyID + "?\nI digress, the answer is **" + parsedVars[1] + "**."
            });
		}
	},
    "alertwhenonline": {
		usage: "",
        description: function(bot){return "Alerts you when the a user comes online."},
        functional:false,
		process: function(bot, SQLconn, user, userID, channelID, message, rawEvent, replyID, parsedVars) {
            parsedVars[1] = parsedVars[1].match(/<@(.+?)(?=>)/).substr(2);
		    userOnlineAlerts[parsedVars[1]] = [userID, channelID];
            console.log('User ' + userID + " will be alerted when user " + parsedVars[1] + " comes online.");
            bot.sendMessage({
                to: channelID,
                message: replyID + " you'll be alerted when that person comes back online."
            });
		}
	},
    "externalip": {
		usage: "",
        description: function(bot){return "Sends the bot's external IP in the chat."},
        functional:false,
		process: function(bot, SQLconn, user, userID, channelID, message, rawEvent, replyID, parsedVars) {
            console.log('Sending IP to user...');
            bot.sendMessage({
                to: userID,
                message: replyID + " my current external IP is `" + getIP(function(err, ip){if(err){throw err;}return ip;console.log(ip);}) + "`"
            });
		}
	},
    "thethingis": {
		usage: "",
        description: function(bot){return "Betcha didn't think this existed, did ya?"},
        functional:false,
		process: function(bot, SQLconn, user, userID, channelID, message, rawEvent, replyID, parsedVars) {
            console.log(user + " is on to us! They're discovering things never meant for discovery!");
            bot.sendMessage({
                to: channelID,
                message: "Betcha didn't think _this_ would be a command, did you " + replyID + "? What does this command do? Well, be patient, stay vigiliant, and I guess we'll have to wait and see, won't we?"
            });
		}
	},
    "latestpatchnotes": {
		usage: "",
        description: function(bot){return "Posts a shortlist of the latest updates and changes to" + bot.username + "."},
        functional:false,
		process: function(bot, SQLconn, user, userID, channelID, message, rawEvent, replyID, parsedVars) {
            
		}
	},
    "shrekislove": {
		usage: "<number of Shrek is love story>",
        description: function(bot){return "Shrek is life."},
        functional:false,
		process: function(user, userID, channelID, message, rawEvent, replyID, parsedVars) {
            console.log("It's time.");
            if (parsedVars[1] === null) {parsedVars[1] = 0}
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