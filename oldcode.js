const Discord = require('discord.js');
const mysql = require('mysql');
const commands = require('./commands.js');

const bot = new Discord.Client();
bot.loginWithToken("MTgwOTA4MDk5NjY4OTM0NjU2.Cq01mQ.RkyvY-nzG0xBOX42JINab4gJqC8");

var SQLconn = 0;
//var SQLconn = mysql.createConnection({
//    host:'127.0.0.1',
//    user:'root',
//    password:'',
//    multipleStatements: true
//});
//SQLconn.connect();
//SQLconn.query("CREATE DATABASE IF NOT EXISTS OblivionData", function(err) {
//    SQLconn.changeUser({database:"OblivionData"});
//    SQLconn.query("CREATE TABLE IF NOT EXISTS aliases (ID int(10) UNSIGNED AUTO_INCREMENT PRIMARY KEY, ALIAS varchar(255) NOT NULL, COMMAND varchar(255) UNSIGNED, USAGESCOPE varchar(255))", function() {
//        SQLconn.query("SELECT * FROM `aliases`", function (error, results, fields) {
//            if (results == undefined) {
//                console.log('Loading default aliases into `aliases` table...');
//                var qry = "";
//                for(var cmd in commands) {
//                    qry += ("INSERT INTO aliases SET `ALIAS` = '" + cmd + "', `COMMAND` = '" + cmd + "', `USAGESCOPE` = 'ALL'; ");
//                }
//                SQLconn.query(qry);
//            }
//        });
//    });
//});
var userOnlineAlerts = [];

bot.on('ready', function() {
    console.log("Server online! | " + bot.user.username + " - (" + bot.user.id + ") [V2]");
//        
});

bot.on('message', function(message) {
    if (message.author.id != bot.user.id) {
        var replyID = "<@" + message.author.id + ">";
        var commandInfo = [];
        
        if (message.content.charAt(0) == ">") {
            console.log("Command recieved: " + message.content);
            message.delete();
            if (message.content.indexOf('(') == -1) {
                commandInfo.push(message.content.substr(1));
            } else {
                //Match anything preceeded by >, (, or |, and succeeded by ), |, or (.
                commandInfo = message.match(/(?:>|\(|\|)(.+?)(?=\(|\||\))/g);
                commandInfo.forEach(function(currentValue, index, array) {
                    array[index] = currentValue.substr(1);
                });
            }
            console.info('Command "' + commandInfo[0] + '" requested; Parsed variables: ' + commandInfo + "\nRequesting command...");
            try {
                var execute = commands[commandInfo[0].toLowerCase()].execute(bot, SQLconn, commandInfo, message, replyID);
                console.log("Command completed!");
            } catch(error) {
                if (typeof commands[commandInfo[0]] == 'undefined') {
                    console.log("Command '" + commandInfo[0] + "' not found!");
                    bot.sendMessage(message.channel, replyID + " bruh, I think you typed the command name in wrong; I can't seem to find >`" + commandInfo[0] + "` anywhere. And trust me, I've tried. I searched high, and I searched low, I even found Warwick Davis on my travels! But alas, thy labour hath been fruitless. To get a list of commands (and thus educate thyself), type `>commands`.\n\nPerhaps you assumed I had this command, or you think I _should_ have this command. If so, then you can submit a sugguestion to _The Creator_ through the command `>suggest(<suggestion>)`.");
                } else {
                    console.log("Error while executing " + commandInfo[0].toUpperCase() + ": " + error);
                    
                    var err = "Sorry m8, some sort of error was encountered while trying to execute the command... `" + error + "`\n";
                    if (commands[commandInfo[0].toLowerCase()].functional) {
                        err += "Please contact my Creator to make them aware of this issue.";
                    } else {
                        err += "Please keep in mind that this command is marked as `non-functional`, and does not appear in any command lists. My Creator will be aware of this issue :neutral_face:";
                    }
                    bot.reply(message, err);
                }
            }
        } else if (message.content.includes(bot.user.username) || message.content.includes(bot.user.id)) {
            console.log("Recieved mention from user...");
            message.channel.sendMessage("I know you are, but what am I?");
        }
    } 
});

//bot.on("presence", function(user, userID, status, gameName, rawEvent) {
//    console.log(user + " is now " + status);
//    /*for (var key in bot.servers) {
//        for (var key2 in bot.servers[key].channels) {
//            bot.sendMessage({
//                to: bot.servers[key].channels[key2].id,
//                message: "_" + user + " is now " + status + "_"
//            });
//        }
//    };*/
//    if ((userID in userOnlineAlerts) && status == "online") {
//        userOnlineAlerts[userID].forEach(function(){
//            console.log("Alerting " + userOnlineAlerts[userID][0] + " that " + user + " has come online...");
//            bot.sendMessage({
//                    to: userOnlineAlerts[userID][1],
//                    message: "_<@" + userOnlineAlerts[userID][0] + ">, " + user + " is now " + status + "_"
//            });
//        });
//        userOnlineAlerts.splice(userID, 1);
//    }
//});

bot.on('messageDelete', (message) => {
    var date = new Date();
    console.log("Message deleted!");
    message.channel.sendMessage("_[Message written by " + message.author.username + " at " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + "]_");
});

//var fixedMentions = message.content.replace(bot.user.username, '<@' + bot.user.id + '>');
//            
//console.log("Fixed mentions: " + fixedMentions);
//bot.updateMessage(message, fixedMentions);

//bot.on('presenceUpdate', (oldUser, newUser) => {
//    console.log("User " + newUser.username + " roles: "/* + newUser.status*/);
//});

bot.on('error', (error) => {
  console.log('Failed to connect; retrying. This is most likely an error with the bot\'s token or an internet connection problem.');
});

process.on('uncaughtException', function (err) {
    console.log('CAUGHT EXCEPTION:\n' + err);
    process.send('restart');
});

//  https://discordapp.com/oauth2/authorize?client_id=180907999219548160&scope=bot&permissions=536083519
//  bot.servers[serverID].members[userId].roles.forEach()