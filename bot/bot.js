// ROADMAP===========================
// STAGE 1: Basic Functions
// STAGE 2: Statistics, Memory, Data
// STAGE 3: Sound and Music
// STAGE 4: Escape from Oblivion
// STAGE 5: Understanding
// http://fsymbols.com/generators/carty/
// https://discordapp.com/oauth2/authorize?client_id=180907999219548160&scope=bot&permissions=2146958583
// https://discordapp.com/oauth2/authorize?client_id=480219195515207680&scope=bot
// Alice in Шøᾔḓℯяʟ@ηⅾ
// —
// (\w+):([^]+)(?=\s\w+:)
// /\|?([^\|]+)/g
// /(\w+):([^]+?)(?=\s\w+:|$)/g
// /(?:([^\|])(?!\b\w+:))+/g
const privateData = require('../private-data.json');

const lib = {
    filesystem: require('fs'),
    readline: require('readline'),
    package: require('./../package.json'),
    request: require('request'),
	ytdl: require('ytdl-core'),
	gapi: require('googleapis'),
	googleAPIkey: privateData.google.apiKey,
	botAccent: 16771153, // 52685
	botCreator: privateData.discord.creatorID
};
const Discord = require('discord.js');
const mysql = require('mysql');

const commands = require('./commands.js');
const bot = new Discord.Client();

const SQLconn = mysql.createConnection({
	host: privateData.mysql.host,
	user: privateData.mysql.user,
	password: privateData.mysql.password,
	dateStrings: true,
	multipleStatements: true,
	supportBigNumbers: true,
	bigNumberStrings: true
});
lib.rl = lib.readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Error levels:
// 0 - No error
// 1 - Notification
// 2 - Command has limited functionality
// 3 - Further response is nessecary
// 4 - Blocking error
// 5 - Programming fatal error

console.log(`\n----------------------\nInitializing Server - ${lib.package.title} v${lib.package.version}`);

SQLconn.connect((err)=>{
    if (err) {
//        console.log('SQL database offline.');    
		console.log('Error connecting to SQL database: ' + err.stack);
        return;
		process.end();
    } else {
        SQLconn.query('CREATE DATABASE IF NOT EXISTS OblivionBot');
		SQLconn.changeUser({database : 'OblivionBot'}, function(err) {if (err) throw err;});
        SQLconn.query(`CREATE TABLE IF NOT EXISTS SessionStats (
			SessionID INT UNSIGNED AUTO_INCREMENT, 
			SessionStart TIMESTAMP DEFAULT NOW(),
			SessionEnd TIMESTAMP, 
			FatalError TINYINT(1) UNSIGNED,
			ExceptionsHandled SMALLINT UNSIGNED, 
			PRIMARY KEY (SessionID)
		)`,(err)=>{
            if (err) {console.log(err)};
        });
		// Ideally binary for IDs and JSON for data would be used
        SQLconn.query(`CREATE TABLE IF NOT EXISTS CommandStats (
			CallID INT UNSIGNED AUTO_INCREMENT, 
			SessionID INT UNSIGNED,
			MessageID BIGINT UNSIGNED,
			ChannelID BIGINT UNSIGNED,
			Data TEXT,
			Initiated TIMESTAMP, 
			ExecTime MEDIUMINT UNSIGNED, 
			State TINYTEXT, 
			PRIMARY KEY (CallID)
		)`,(err)=>{
            if (err) {console.log(err)};
        });
		SQLconn.query(`CREATE TABLE IF NOT EXISTS QueuedTracks (
			ID INT UNSIGNED AUTO_INCREMENT,
			ServerID BIGINT UNSIGNED NOT NULL,
			VoiceID BIGINT UNSIGNED NOT NULL,
			TextID BIGINT UNSIGNED NOT NULL,
			MessageID BIGINT UNSIGNED NOT NULL,
			VideoData TEXT NOT NULL,
			TimeRequested DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP(),
			PRIMARY KEY (ID)
		)`,(err)=>{
            if (err) {console.log(err)};
        });
		SQLconn.query(`CREATE TABLE IF NOT EXISTS PermissionLevels (
			ID INT UNSIGNED AUTO_INCREMENT,
			RoleID BIGINT UNSIGNED,
			UserID BIGINT UNSIGNED,
			ServerID BIGINT UNSIGNED NOT NULL,
			Permissions TINYINT UNSIGNED NOT NULL,
			PRIMARY KEY (ID)
		)`,(err)=>{
            if (err) {console.log(err)};
        });
		SQLconn.query(`CREATE TABLE IF NOT EXISTS DeafenChannels (
			ID INT UNSIGNED AUTO_INCREMENT,
			UserID BIGINT UNSIGNED NOT NULL,
			ChannelID BIGINT UNSIGNED NOT NULL,
			PRIMARY KEY (ID)
		)`,(err)=>{
            if (err) {console.log(err)};
        });
        console.log('Database connection online!');
    }
	bot.login(privateData.discord.botToken);
});

bot.on('ready', () => {
//    bot.user.setGame(`v${lib.package.version}`);
    bot.user.setActivity(`>help`);
    console.log(`Server online! | ${bot.user.username} - (${bot.user.id})`); 
    lib.rl.prompt();
	
	SQLconn.query(`INSERT INTO SessionStats VALUES ()`,(err, rows, fields) => {
		if (err) {console.log(err)};
	});
	
	SQLconn.query(`SELECT * FROM (SELECT ID, VoiceID, TextID, VideoData, MessageID, ServerID FROM QueuedTracks ORDER BY TimeRequested DESC) x GROUP BY ServerID`,(err, rows, fields) => {
		if (err) {console.log(err)};
		
		rows.forEach(cvar => {
			bot.channels.get(cvar.TextID).send("There was a little accident, but I'm back now fam. Resuming the queue.");
			lib.playTrack(cvar.ID,cvar.length,JSON.parse(cvar.VideoData),cvar.VoiceID,cvar.TextID,cvar.MessageID);
		});
	});
});

lib.rl.on('line', (input) => {
    processInput(input);
    lib.rl.prompt();
});

bot.on('message', (message) => {
//    lib.filesystem.appendFile(`log/${lib.package.version}.txt`, `\r\n${message.author.username} @ ${message.channel.name} >> ${message.content}`, (err) => {if (err) {console.error(err);}});
    processInput(message);
});

bot.on('disconnect', () => {
    console.log('Disconnected!');
	bot.login(privateData.discord.botToken);
});
bot.on('reconnecting', () => {
    console.log('Reconnecting after disconnect...');
});

bot.on('messageDelete', (message) => {
//    message.guild.defaultChannel.send(`A message written by ${message.author.username} has been deleted. _Some suspicious activity going on here, chaps..._`);
    console.log(`Message written by ${message.author.username} has been deleted.`);
    lib.filesystem.appendFile(`log/deleted.txt`, `${message.author.username} @ ${message.channel.name} >> ${message.content}\r\n`, (err) => {if (err) {console.error(err);}});
});

bot.on('guildCreate', (guild) => {
    console.log(`Added to a new server - ${guild.name}`);
	
	guild.systemChannel.send("Hey everyone! It's good to be here. I'm a bot that can help you with a ton of things. Type `>help` to find out more :blush:");
	guild.systemChannel.send("**To the admins:** For me to work properly, I need to be granted a role with *administrator permissions*. I recommend creating a general `bot` role to do it, but the reason this has to be done at all is so that you have flexibility.");
});

bot.on('voiceStateUpdate', (oldMember,newMember) => {
    if (newMember.deaf == true && newMember.voiceChannel != newMember.guild.afkChannel && newMember.voiceChannel != null) {
		newMember.setVoiceChannel(newMember.guild.afkChannel).then(()=>{
			SQLconn.query(`INSERT INTO DeafenChannels (UserID,ChannelID) VALUES (?,?)`,[oldMember.id,oldMember.voiceChannelID],(err, rows, fields) => {
				if (err) {console.log(err)} else {
					console.log(`Moved ${newMember.displayName} to AFK for deafening.`);
				}
			});
		}).catch((error)=>{
			console.log(error);
		});
	} else if (newMember.deaf == false && oldMember.mute == true && newMember.voiceChannel == newMember.guild.afkChannel) {
		SQLconn.query(`SELECT ChannelID FROM DeafenChannels WHERE UserID = ?; DELETE FROM DeafenChannels WHERE UserID = ?`,[newMember.id,newMember.id],(err, rows, fields) => {
			if (err) {console.log(err)} else {
				if (rows[0].length != 0) {
					newMember.setVoiceChannel(rows[0][0].ChannelID).then(()=>{
						console.log(`Moved ${newMember.displayName} back from AFK.`);
					}).catch((err)=>{
						console.log(err);
					});
				} else {
					console.log("Couldn't find the channel that the user was previously in...");
				}
			}
		});
	}
});

bot.on('error', () => {
    console.log('Some kind of error was encountered by the client...');
	bot.login(privateData.discord.botToken);
});

function processInput(message) {
    if (typeof message == 'object') {
        if (message.author.id != bot.user.id) {
            if (message.content.charAt(0) == ">") {
				var requestState = "incomplete";
                var execTime = new Date().getTime();
				
				console.log('Starting to type...');
				message.channel.startTyping();
				
				establishTargetCommand(message,(commandInfo,exceptions)=>{
					if (exceptions.length > 0) {
						var errMessage;
						
						exceptions.sort((a,b)=>{
							return (a.severity < b.severity) ? 1 : ((b.severity > a.severity) ? -1 : 0);
						});
						
						var maxSeverity = exceptions[0].severity;
						
						if (maxSeverity <= 3) {
							var exceptionMessages = exceptions.map((cvar)=>{
								if (cvar.severity <= 3) {return cvar.message};
							});
							errMessage = exceptionMessages.join(' ');
							requestState = 'successNotif';
						} else if (maxSeverity == 4) {
							requestState = exceptions[0].code;
							errMessage = exceptions[0].message;
							console.log('Detected a custom error.');
						} else if (maxSeverity == 5) {
							// Checking for missing permissions, if so, handle
							if (exceptions[0].code == 50013) {
								requestState = exceptions[0].message;
								errMessage = `It seems I don't have the correct permissions to complete this command. Please make the admins have given me a role with the *administrator* permission :sweat_smile:`
							} else {
								console.log('||||||IMPORTANT|||||| A fatal programming error was encountered while executing the command.');
								console.log(exceptions[0]);
								requestState = exceptions[0].message.replace(/(\r\n|\n|\r)/gm,"");
								errMessage = "Damn, some sort of error was encountered while trying to execute the command: `" + requestState + "`";
								if (!commands[commandInfo['cmd']].specification.command.functional) {
									errMessage += "\nThis command is in beta. Issues are to be expected, unfortunately.";
								}
							}
						} else {
							console.log(`The program has produced an unexpected error severity: ${maxSeverity}`);
						}
						
						console.log("Exception while executing " + commandInfo['cmd'].toUpperCase() + ": " + errMessage);
						message.reply(errMessage);
					} else {
						console.log('Command completed successfully! Coolio, yo!');
						requestState = 'success';
					}
					
					setTimeout(()=>{
						message.channel.stopTyping();
					},500);
					
					execTime = new Date().getTime() - execTime;
					if (execTime > 16777215) {
						execTime = 16777215;
						console.log(`Response time: ${execTime}ms. Had to be cut to fit in database.`);
					} else {
						console.log(`Response time: ${execTime}ms`);
					};
					
					SQLconn.query(`INSERT INTO CommandStats (MessageID, ChannelID, Data, Initiated, ExecTime, State) VALUES (?,?,?,NOW(),?,?)`,
						  [message.id, message.channel.id, JSON.stringify(commandInfo), execTime, requestState],
					function(err, rows, fields) {
						if (err) {throw err};
					});
				});
            } else {
                wordPrompt(message);
            }
        }
    } else {
        commandlinePrompt(message);
    }
}

function establishTargetCommand(message,callback) {
	console.log(`Recieved ${message.content} from ${message.author.username}`);
    var commandInfo = {msg:message.cleanContent};
	var exceptions = [];
    
	var inputSplit = />([^\s]+)\(?([^\n\r\)]*)/gm.exec(message.content);
    commandInfo['cmd'] = inputSplit[1].trim().toLowerCase();
	 
    if (typeof commands[commandInfo['cmd']] === 'undefined') {
        console.log('Searching for simmilar command...');
		// If unique suggestion found, and the difference is less than 40% of the total length
        var sim;
        if ((sim = findSimmilarCommand(commandInfo['cmd'])) !== false && sim[0] < commandInfo['cmd'].length / 2.5) {
            if (sim[0] == 1) {
				commandInfo['cmd'] = sim[1];
				exceptions.push({severity:1,code:'autoCorrect',message:'Your command was auto-corrected.'});
				
				collateCommandVariables(message,commandInfo,exceptions,inputSplit,callback);
            } else {
				callback(commandInfo,exceptions.concat({severity:3,code:'unsureCommand',message:`Sorry, I couldn't find that command. Were you looking for \`>${sim[1]}\`?`}));
				// Use a async function for clicking of emoji reactions to continue
            }
        } else {
			callback(commandInfo,exceptions.concat({severity:4,code:'noResult',message:"Sorry, I couldn't find that command. Consider checking the `>commands` list to find what you're looking for."}));
        }
    } else {
		collateCommandVariables(message,commandInfo,exceptions,inputSplit,callback);
	}
}

function collateCommandVariables(message,commandInfo,exceptions,inputSplit,callback) {
	if (!commands[commandInfo['cmd']].specification.command.channelTypes.includes(message.channel.type)) {
		callback(commandInfo,exceptions.concat({severity:4,code:'channelIncompatible',message:`Regretfully I must inform you that \`>${commandInfo['cmd']}\` isn't available in this channel type.`}));
	} else {
		if (inputSplit[2].indexOf('|') != -1 || inputSplit[2].indexOf(':') != -1 ) {
			var tmpMatch = inputSplit[2].match(/(?:([^\|])(?!\b\w+:))+/g);
			var regex = /(.+):(.+)?/;
			var previous;

			tmpMatch.forEach((cvar,idx,arr)=>{
				if (cvar.indexOf(':') != -1 && !/https?:/.test(cvar)) {
					var tmpObj = regex.exec(cvar);
					var varName = tmpObj[1].trim();
					var found = false;

					commands[commandInfo['cmd']].specification.variables.forEach((cvar) => {
						if (cvar[0] == varName) {
							found = true;
						}
					});

					if (found) {
						console.log(`${varName} found in specification.`);
						commandInfo[varName] = ((tmpObj[2] === undefined) ? "" : tmpObj[2]).trim();
					} else {
						exceptions.push({severity:1,code:'nameInvalid',message:`Please note that your variable \`${varName}\` doesn't correspond with the command's specification.`});
					}

					previous = true;
				} else {
					if (idx != 0 && previous) {
						exceptions.push({severity:1,code:'typeOrder',message:`Please note that any non-literal variable declarations listed after literal declarations will be ignored.`});
					} else {
						if (!(commandInfo[commands[commandInfo['cmd']].specification.variables[idx][0]] = cvar.trim())) {
							exceptions.push({severity:1,code:'indexInvalid',message:`Please note that your ${data[0]} non-literal variable didn't correspond any variables for the command.`});
						}
						previous = false;
					}
				}
			});
		} else if (inputSplit[2] != '') {
			var props = commands[commandInfo['cmd']].specification.variables;
			if (props.length > 0) {
				commandInfo[props[0][0]] = inputSplit[2].trim();
			} else {
				exceptions.push({severity:1,code:'indexInvalid',message:`Please note that your ${data[0]} non-literal variable didn't correspond any variables for the command.`});
			}
		}
		
		console.log(`Intermediate output: ${JSON.stringify(commandInfo)}`);
		
		commands[commandInfo['cmd']].specification.variables.forEach((cvar,idx,arr)=>{
			if (typeof commandInfo[cvar[0]] !== 'undefined') {
				if (!cvar[3].test(commandInfo[cvar[0]].toLowerCase())) {
					exceptions.push({severity:4,code:'invalidVar',message:`Sorry, \`${cvar[0]}\` must be ${cvar[1].lowercaseFL()}`});
				}
			} else {
				if (cvar[2]) {
					commandInfo[cvar[0]] = cvar[4];
				} else {
					exceptions.push({severity:4,code:'indexInvalid',message:`The variable \`${cvar[0]}\` is not optional, and must be ${cvar[1].lowercaseFL()}`});
				}
			}
		});
		
		if (Math.max(exceptions.map((cvar)=>{return cvar.severity})) >= 4) {
			callback(commandInfo,exceptions);
		} else {
			console.log("Final output: " + JSON.stringify(commandInfo));
			
			try {
				commands[commandInfo['cmd']].process(bot,SQLconn,lib,commandInfo,message,exceptions,(error)=>{
					callback(commandInfo,error);
				});
			} catch (error) {
				error.severity = 5;
				callback(commandInfo,exceptions.concat(error));
			}
		}
	}
}

function wordPrompt(message) {
    if (message.content.includes('Oblivion come from?')) {
        message.reply("I'm from Canadia, dontchaknow.");
    } else if (message.author == '119265563359969280') {
        message.reply('_**Orange** you glad to see me, James?_');
    }/* else if (message.content.toLowerCase().includes("james") && message.content.toLowerCase().includes("ban")) {
        message.channel.send(`${message.author.username}, for that, I'm banning you.`);
		setTimeout(()=>{
			//'119265563359969280'
			message.guild.fetchMember(message.author.id).then((guildmember) => {
				guildmember.kick('Constructive criticism is not welcome on this server. CHINA#1');
			});
		},5000);
    }*/ else if (message.content.toLowerCase().includes("mmm")) {
        message.reply("Heresy! Heresy I say!");
        message.delete();
    }else if (message.content.includes("( ͡° ͜ʖ ͡°)")) {
        message.channel.send("(lenny face)");
        message.delete();
    }/* else if (message.author == "175670558040653825") {
        message.reply(":100::100:hOHoHOHHHHMYFUCckking GOFD :joy::joy::joy: DUDE :ok_hand:i AM :point_right:LITERALLY:point_left: iN :joy:TEARS:joy: RIGHT NOW BRo :point_up_2::point_down::point_right::point_left: hHAHAHAHAHAHAHA :v:️:ok_hand::thumbsup: TAHT WA SO FUCKIN G FUNNY DUd :droplet::droplet::sweat_smile::joy::sweat_drops::droplet:I cAN NOT FUKING BELIEV how :100:FUNny :ok_hand::thumbsup::100:thta shit wa s :eyes::thumbsup::laughing::joy::joy::sweat_smile: I :boy: CAN NOT :x: bRATHE :nose::lips::nose::lips::x::x: / HELP :exclamation:️I NEEd :point_right::point_right: AN a m b u l a n c e:ambulance::ambulance: SSSooOOoo00000oOOOOOøøøØØØØØ fKING FUNY :heavy_check_mark:️:ballot_box_with_check:️:100::100:1️⃣0️⃣0️⃣:laughing::laughing::joy::joy::sweat_smile: shit man :grey_exclamation::100::100::fire::point_up:️:ok_hand:damn");
    } else if (message.content.test(/[\w\W]* alexa play ([\w\W]*)/)) {
        var search = /[\w\W]* alexa play ([\w\W]*)/.exec(message.content);
//		commands['play'].process(bot,SQLconn,lib,commandInfo,message,exceptions);
		message.reply('This is so sad.');
    } else if (message.content.includes(bot.user.username) || message.content.includes(bot.user.id)) {
        console.log("Recieved mention...");
        message.channel.send('_Do you expect me to talk?_');
    }*/
}

function commandlinePrompt(input) {
    var commandInfo = [];
	var exceptions = [];
    
    if (input.indexOf('(') == -1) {
        commandInfo.push(input);
    } else {
        //Match anything preceeded by (, or |, and succeeded by ), |, or (.
        commandInfo = input.match(/(?!\(|\|)(.+?)(?=\(|\||\))/g);
    }
    commandInfo[0] = commandInfo[0].toLowerCase();
    if (commandInfo[0] == 's') {commandInfo[0] = 'say'};
    
    var message = {
        "channel": {
            "send": function(msg) {
                console.log(msg);
            }
        }
    };
    
    try {
        commands[commandInfo[0]].process(bot, SQLconn, lib, commandInfo, message, exceptions, (error)=>{
			if (error.length == 0) {
				console.log(`Command ${commandInfo[0]} completed successfully.`);
			} else {
				console.log(`Error while executing command: ${JSON.stringify(error)}`);
			}
		});
    } catch (error) {
        if (typeof commands[commandInfo[0]] == 'undefined') {
            console.log(`Command ${commandInfo[0]} not found!`);
        } else {
            console.log(`Error while executing command: ${error}`);
        }
    }
}

function interpretPrompt(message) {
    //Incomplete
}

function findSimmilarCommand(command) {
    var sorted = [];
    for (var key in commands) {
        if (commands.hasOwnProperty(key)) {
            if (commands[key].specification.command.functional) {
                sorted.push([lib.levDist(command,key),key]);
            }
        }
    }
	
    sorted.sort((a, b) => {
        if (a[0] === b[0]) {
            return 0;
        }
        else {
            return (a[0] < b[0]) ? -1 : 1;
        }
    });
    if (sorted[0][0] == sorted[1][0]) {
        return false;
    } else {
		console.log(sorted[0]);
        return sorted[0];
    }
}

function convertBool(input) {
    input = JSON.stringify(input);
    input = !!input;
    return input;
}

String.prototype.lowercaseFL = function() {
    return this.charAt(0).toLowerCase() + this.slice(1);
}
String.prototype.capFL = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}
lib.getRand = function(bounds) {
    return Math.round(Math.random() * (bounds[1] - bounds[0])) + bounds[0];
}
lib.levDist = function levDist(str1, str2) {
    const l1 = str1.length;
    const l2 = str2.length;
    
    var distance = createArray(l1+1,l2+1);
    
    for (let count = 0; count <= l1; count++) {
        distance[count][0] = count;
    }
    for (let count = 0; count <= l2; count++) {
        distance[0][count] = count;
    }
    
    for (var str2Count = 1; str2Count <= l2; str2Count++) {
        for (let str1Count = 1; str1Count <= l1; str1Count++) {
            var substitutionCost;
            if (str1.charAt(str1Count-1) == str2.charAt(str2Count-1)) {
                substitutionCost = 0;
            } else {
                substitutionCost = 1;
            }
            distance[str1Count][str2Count] = Math.min(
                distance[str1Count-1][str2Count] + 1,                 // deletion
                distance[str1Count][str2Count-1] + 1,                 // insertion
                distance[str1Count-1][str2Count-1] + substitutionCost // substitution
            );
        }
    }
    return distance[l1][l2];
}
function createArray(length) {
    var arr = new Array(length || 0).fill(0),
        i = length;

    if (arguments.length > 1) {
        var args = Array.prototype.slice.call(arguments, 1);
        while(i--) arr[length-1 - i] = createArray.apply(this, args);
    }

    return arr;
}
function countProperties(obj) {
    return Object.keys(obj).length;
}
function limitString(str,limit) {
    if (str.length > limit) {
        return str.substring(0,limit) + "...";
    } else {
        return str;
    }
}
function getOrdinal(num) {
    var s = ["th","st","nd","rd"],
    v = num % 100;
    return num + (s[(v - 20) % 10] || s[v] || s[0]);
}

function getPermLevel(message, callback) { // Needs reworking, and reimplementation
	var permLevel;
	if (message.author.id == creatorDiscordID) {
		permLevel = 0;
		if (callback) {callback(permLevel)};
	} else {
		message.guild.fetchMember(message.author).then((guildmember)=>{
			if (guildmember.permissions.has('ADMINISTRATOR')) {
				permLevel = 1;
			} else if (guildmember.highestRole.equals(message.guild.roles.first())) {
				permLevel = 2;
			}
			if (callback) {callback(permLevel)};
		});
	}
}

lib.formatCommandSpec = function formatCommandSpec(name,spec) {
	var output = `>${name}(`;
	for (let count = 0; count < spec.variables.length; count++) {
		switch (spec.variables.length) {
			case (count + 1):
				if (count == 0) {
					output += spec.variables[count][0];
				} else {
					output += "|" + spec.variables[count][0];
				}
				break;
			default:
				if (count == 0) {
					output += spec.variables[count][0];
				} else {
					output += "|" + spec.variables[count][0];
				}
		}
	};
	output += ")";
	return output;
}

lib.convertYTduration = function convertYTduration(duration) {
	var split = duration.match(/PT(\d*(?=H))?H?(\d*(?=M))?M?(\d*(?=S))?S?/);
	split = split.map(cvar => {return cvar || 0});

	return (parseInt(split[1]) * 3600) + (parseInt(split[2]) * 60) + parseInt(split[3]);
}

lib.displayDuration = function displayDuration(duration) {
	var time = [];
	time[0] = duration / 3600; // Slightly above actual hours, floating point
	time[1] = (duration % 3600) / 60; // Slightly above actual minutes, floating point
	time[2] = (duration % 3600) % 60; // Exact remainder seconds

	console.log(time);
	
	time = time.map(Math.floor).reverse();
	
	console.log(time);

	var output = "";
	for (var count = 0; count < time.length; count++) {
		var key = ['S','M ','H '];
		if (time[count] > 0) {
			output = (time[count] + key[count]) + output;
		}
	}
	return output.toLowerCase();
}

lib.numToWord = function numToWord(num) {
	switch (num) {
		case 0:
			return 'zero';
			break;
		case 1:
			return 'one';
			break;
		default:
			return 'NaN';
	}
		
}
lib.isPlural = function isPlural(quantity) {
	if (quantity == 0 || quantity > 1) {
		return 's';
	} else {
		return '';
	}
}

lib.resolveEmbedAccent = function resolveEmbedAccent(bot,message, botAccent, callback) {
	if (message.guild) {
		message.guild.fetchMember(bot.user).then((guildMember)=>{
			callback(guildMember.displayColor);
		});
	} else {
		callback(botAccent);
	}
}

lib.enqueueTrack = function enqueueTrack(video,message,queueLength,queueTime) {
	message.guild.fetchMember(message.author).then((guildmember) => {
		var embed = {
//			title: "Track Enqueued",
			description: `**${video.title}**`,
			color: 1017004,
			author: {
				name: `Track Enqueued`,
				icon_url: message.author.avatarURL,
				url: `https://github.com/MrSp33dy123/${bot.user.username}`
			},
			thumbnail: {
				url: video.thumbnail.url,
				width: video.thumbnail.width,
				height: video.thumbnail.height,
			},
			footer: {
				text: `Added by ${guildmember.displayName}`
			},
			fields:[
				{name: 'Channel',value: video.channelName,inline:true},
				{name: 'Duration',value: lib.displayDuration(video.duration),inline:true},
				{name: 'Queue Position',value: queueLength+1,inline:true},
				{name: 'E.T.A',value: lib.displayDuration(queueTime),inline:true}
			]
		};
		
		message.channel.send('',{embed});
	});
}

lib.playTrack = function playTrack(key,queueLength,video,voiceID,textID,messageID,nextTrack) {
	var embed = {
		color: 7919944,
		author: {
			name: `Now Playing 🎶`,
			icon_url: bot.user.avatarURL,
			url: `https://github.com/MrSp33dy123/${bot.user.username}`
		},
		thumbnail: {
			url: video.thumbnail.url,
			width: video.thumbnail.width,
			height: video.thumbnail.height,
		},
		footer: {}
	};
	
	if (queueLength > 1) {
		embed.footer.text = `Up next: ${nextTrack.title}`;
		embed.footer.icon_url = nextTrack.thumbnail;
	}
	
	bot.channels.get(textID).fetchMessage(messageID).then(message => {
		message.guild.fetchMember(message.author).then((guildmember) => {
			embed.description = `**${video.title}**\n_${video.channelName}_\n_${lib.displayDuration(video.duration)}_\n\`Added by ${guildmember.displayName}\``;
			message.channel.send('',{embed});
		});

		bot.channels.get(voiceID).join().then(connection => {
			// Use the VC ID to resolve the connection object, to stop rejoining
			const crntVoiceChnl = bot.channels.get(voiceID);
			crntVoiceChnl.join().then(connection => {
				const ytStream = lib.ytdl('https://www.youtube.com/watch?v=' + video.id,{filter:'audioonly'});
				const dispatcher = connection.playStream(ytStream,{seek:0,bitrate:'auto'});
				
				dispatcher.on('end',()=>{
					SQLconn.query(`DELETE FROM QueuedTracks WHERE ?; SELECT ID, VoiceID, TextID, VideoData, MessageID FROM QueuedTracks WHERE ? ORDER BY TimeRequested`,[{ID:key},{ServerID:parseInt(crntVoiceChnl.guild.id)}],(err, rows, fields) => {
						if (err) {throw err};

						if (rows[1].length) {
							const newTrack = rows[1][0];
							if (rows[1].length >= 2) {
								lib.playTrack(newTrack.ID,rows[1].length,JSON.parse(newTrack.VideoData),newTrack.VoiceID,newTrack.TextID,newTrack.MessageID,JSON.parse(rows[1][1].VideoData));
							} else {
								lib.playTrack(newTrack.ID,rows[1].length,JSON.parse(newTrack.VideoData),newTrack.VoiceID,newTrack.TextID,newTrack.MessageID);
							}
						} else {
							connection.disconnect();
							message.channel.send('The queue has concluded. Behold, the sound of silence.');
						}
					});
				});
				dispatcher.on('error',(error)=>{
					console.log(error);
				});
			});
		});
	});
}