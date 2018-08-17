//Add ability to tell person when another person comes online
//Add libraries of helpful info and websites to help people code
// ROADMAP===========================
// STAGE 1: Basic Functions
// STAGE 2: Statistics, Memory, Data
// STAGE 3: Sound and Music
// STAGE 4: Escape from Oblivion
// STAGE 5: Understanding
// http://fsymbols.com/generators/carty/
// https://discordapp.com/oauth2/authorize?client_id=180907999219548160&scope=bot&permissions=2146958583
// Alice in Шøᾔḓℯяʟ@ηⅾ
// —
// (\w+):([^]+)(?=\s\w+:)
// /\|?([^\|]+)/g
// /(\w+):([^]+?)(?=\s\w+:|$)/g
// /(?:([^\|])(?!\b\w+:))+/g
const botToken = 'MTgwOTA4MDk5NjY4OTM0NjU2.Cq01mQ.RkyvY-nzG0xBOX42JINab4gJqC8';
const creatorDiscordID = '175537821593894912';

const lib = {
    filesystem: require('fs'),
    readline: require('readline'),
    package: require('./../package.json'),
    request: require('request'),
	ytdl: require('ytdl-core'),
	gapi: require('googleapis'),
	googleAPIkey:'AIzaSyDJeMYoRNXfJ5RBcHt_ZvM3SxhGqYGHeUM'
};
const Discord = require('discord.js');
const mysql = require('mysql');

const commands = require('./commands.js');
const bot = new Discord.Client();

const SQLconn = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: 'admin',
	dateStrings: true,
	multipleStatements: true,
	supportBigNumbers: true,
	bigNumberStrings: true
});
lib.rl = lib.readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

lib.ObvErr = class ObvErr {
	constructor(type, data) {
		switch (type) {
			case 'autocorrect':
				this.code = 'autocorrect';
				this.message = "Autocorrecting command.";
				this.severity = 3;
				break;
			case 'suggest':
				this.code = 'suggest';
				this.message = `Sorry, I couldn't find that command. Were you looking for \`>${data[0]}\`?`;
				this.severity = 1;
				break;
			case 'noresult':
				this.code = 'noresult';
				this.message = "Sorry, I couldn't find that command. Consider checking the `>commands` list to find what you're looking for.";
				this.severity = 0;
				break;
			case 'limitedchannel':
				this.code = 'limitedchannel';
				this.message = 'Please note that the command will have limited functionality in this channel type.';
				this.severity = 2;
				break;
			case 'channelincompatible':
				this.code = 'channelincompatible';
				this.message = `Regretfully I must inform you that \`>${data[0]}\` isn't available in this channel type.`;
				this.severity = 0;
				break;
			case 'limitedperms':
				this.code = 'limitedperms';
				this.message = 'Due to your permission level, the capabilities of the command have been limited.';
				this.severity = 2;
				break;
			case 'forbidden':
				this.code = 'forbidden';
				this.message = "Sorry, you don't have permission to use this command.";
				this.severity = 0;
				break;
			case 'nameinvalid':
				this.code = 'nameinvalid';
				this.message = `Your variable \`${data[0]}\` doesn't correspond with the command's specification.`;
				this.severity = 3;
				break;
			case 'indexinvalid':
				this.code = 'indexinvalid';
				this.message = `Please note that your ${data[0]} non-literal variable didn't correspond any variables for the command.`;
				this.severity = 3;
				break;
			case 'typeorder':
				this.code = 'typeorder';
				this.message = `Please note that any non-literal variable declarations listed after literal declarations will be ignored.`;
				this.severity = 3;
				break;
			case 'invalidvar':
				this.code = 'invalidvar';
				this.message = `Sorry, \`${data[0]}\` must be ${data[1]}`;
				this.severity = 0;
				break;
			case 'missingvar':
				this.code = 'missingvar';
				this.message = `The variable \`${data[0]}\` is not optional, and must be ${data[1]}`;
				this.severity = 0;
				break;
			case 'errcustom':
				this.code = 'errcustom';
				this.message = data[0];
				this.severity = 0;
		}

		if (this.severity < 2) {
			console.log('Error too severe to proceed: ' + this.message);
			throw this;
		}
	}
}

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
			SessionEnd TIMESTAMP DEFAULT NOW(), 
			FatalError TINYINT(1) UNSIGNED, 
			CommandsCalled SMALLINT UNSIGNED, 
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
			ExecTime SMALLINT UNSIGNED, 
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
        console.log('Database connection online!');
    }
	bot.login(botToken);
});

bot.on('ready', () => {
//    bot.user.setGame(`v${lib.package.version}`);
    bot.user.setActivity(`>help`);
    console.log(`Server online! | ${bot.user.username} - (${bot.user.id})`); 
    lib.rl.prompt();
	
	SQLconn.query(`SELECT * FROM (SELECT ID, VoiceID, TextID, VideoData, MessageID, ServerID FROM QueuedTracks ORDER BY TimeRequested DESC) x GROUP BY ServerID`,(err, rows, fields) => {
		if (err) {console.log(err)};
		
		rows.forEach(cvar => {
			bot.channels.get(cvar.TextID).send("There was a little accident, but I'm back now fam. Resuming the queue.");
			lib.playTrack(cvar.ID,cvar.length,JSON.parse(cvar.VideoData),cvar.VoiceID,cvar.TextID,cvar.MessageID);
		})
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
});
bot.on('reconnecting', () => {
    console.log('Reconnecting after disconnect...');
});

bot.on('messageDelete', (message) => {
//    message.guild.defaultChannel.send(`A message written by ${message.author.username} has been deleted. _Some suspicious activity going on here, chaps..._`);
    console.log(`Message written by ${message.author.username} has been deleted.`);
    lib.filesystem.appendFile(`log/deleted.txt`, `${message.author.username} @ ${message.channel.name} >> ${message.content}\r\n`, (err) => {if (err) {console.error(err);}});
});

function processInput(message) {
    if (typeof message == 'object') {
        if (message.author.id != bot.user.id) {
            if (message.content.charAt(0) == ">") {
				var requestState = "incomplete";
                var execTime = new Date().getTime();
				try {
					var commandData = processCommand(message);
					requestState = 'success';
				} catch (error) {
					requestState = error.code;
					var err;
					if (typeof error.severity == 'number') {
						err = error.message;
						console.log('Detected a custom error.');
					} else {
						err = "Damn, some sort of error was encountered while trying to execute the command: `" + error.message + "`";
						if (!commands[commandData['cmd']].specification.command.functional) {
							err += "\nThis command is in beta. Issues are to be expected, unfortunately.";
						}
					}
					console.log(`Error: ${error.message}`);
					message.reply(err);
				}
                execTime = new Date().getTime() - execTime;
                console.log(`Response time: ${execTime}ms`);
//				console.log('Message id base 2: ' + parseInt(message.id).toString(2));	
				
				SQLconn.query(`INSERT INTO CommandStats (MessageID, ChannelID, Data, Initiated, ExecTime, State) VALUES (?,?,?,NOW(),?,?)`,
					  [message.id, message.channel.id, JSON.stringify(commandData), execTime, requestState],
			  	function(err, rows, fields) {
                    if (err) {throw err};
                });
            } else {
                wordPrompt(message);
            }
        }
    } else {
        commandlinePrompt(message);
    }
}

function processCommand(message) {
	console.log(`Recieved ${message.content} from ${message.author.username}`);
    var commandInfo = {msg:message.cleanContent};
	var warnList = [];
    
	var inputSplit = />(\w+)\(?([^\n\r\)]*)/gm.exec(message.content);
    commandInfo['cmd'] = inputSplit[1].trim().toLowerCase();
	 
    if (typeof commands[commandInfo['cmd']] === 'undefined') {
        console.log('Searching for simmilar command...');
		// If unique suggestion found, and the difference is less than 40% of the total length
        var sim;
        if ((sim = findSimmilarCommand(commandInfo['cmd'])) !== false && sim[0] < commandInfo['cmd'].length / 2.5) {
            if (sim[0] == 1) {
				commandInfo['cmd'] = sim[1];
                warnList.push(new lib.ObvErr('autocorrect'));
            } else {
				warnList.push(new lib.ObvErr('suggest',[sim[1]]));
            }
        } else {
            warnList.push(new lib.ObvErr('noresult'));
        }
    }
    
	if (!commands[commandInfo['cmd']].specification.command.channelTypes.includes(message.channel.type)) {
		warnList.push(new lib.ObvErr('channelincompatible',[commandInfo['cmd']]));
	}

	if (inputSplit[2].indexOf('|') != -1 || inputSplit[2].indexOf(':') != -1 ) {
		var tmpMatch = inputSplit[2].match(/(?:([^\|])(?!\b\w+:))+/g);
		var regex = /(.+):(.+)/;
		var previous;

		tmpMatch.forEach((cvar,idx,arr)=>{
			if (cvar.indexOf(':') != -1 && !/https?:/.test(cvar)) {
				var tmpObj = regex.exec(cvar);
				var varName = tmpObj[1].trim();
				var found = false;

				commands[commandInfo['cmd']].specification.variables.forEach((cvar) => {
					if (cvar[0] == varName) {
//						commandInfo[varName] = tmpObj[2].trim();
						found = true;
					}
				});

				if (found) {
					console.log(`${varName} found in specification.`);
					commandInfo[varName] = tmpObj[2].trim();
				} else {
					warnList.push(new lib.ObvErr('nameinvalid',[varName]));
				}

				previous = true;
			} else {
				if (idx != 0 && previous) {
					warnList.push(new lib.ObvErr('typeorder'));
				} else {
					try {
						commandInfo[commands[commandInfo['cmd']].specification.variables[idx][0]] = cvar.trim();
					} catch (err) {
						warnList.push(new lib.ObvErr('indexinvalid',[getOrdinal(idx+1)]));
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
			warnList.push(new lib.ObvErr('indexinvalid',[getOrdinal(1)]));
		}
	}

	console.log(`Intermediate output: ${JSON.stringify(commandInfo)}`);

	commands[commandInfo['cmd']].specification.variables.forEach((cvar,idx,arr)=>{
		if (typeof commandInfo[cvar[0]] !== 'undefined') {
			if (!cvar[3].test(commandInfo[cvar[0]])) {
				warnList.push(new lib.ObvErr('invalidvar',[cvar[0],cvar[1].lowercaseFL()]));
			}
		} else {
			if (cvar[2]) {
				commandInfo[cvar[0]] = cvar[4];
			} else {
				warnList.push(new lib.ObvErr('missingvar',[cvar[0],cvar[1].lowercaseFL()]));
			}
		}
	});

	if (warnList.length > 0) {
		warnList = warnList.map((cvar)=>{
			return cvar.message;
		});
		message.reply(warnList.join(' '));
	}

	console.log("Final output: " + JSON.stringify(commandInfo));

	try {
		commands[commandInfo['cmd']].process(bot, SQLconn, lib, commandInfo, message);
		console.log("Command completed successfully! Coolio, yo!");
		return commandInfo;
	} catch (error) {
		console.log("Error while executing " + commandInfo['cmd'].toUpperCase() + ": " + error.message);
		throw error;
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
    } else if (message.author == "175670558040653825") {
        message.reply(":100::100:hOHoHOHHHHMYFUCckking GOFD :joy::joy::joy: DUDE :ok_hand:i AM :point_right:LITERALLY:point_left: iN :joy:TEARS:joy: RIGHT NOW BRo :point_up_2::point_down::point_right::point_left: hHAHAHAHAHAHAHA :v:️:ok_hand::thumbsup: TAHT WA SO FUCKIN G FUNNY DUd :droplet::droplet::sweat_smile::joy::sweat_drops::droplet:I cAN NOT FUKING BELIEV how :100:FUNny :ok_hand::thumbsup::100:thta shit wa s :eyes::thumbsup::laughing::joy::joy::sweat_smile: I :boy: CAN NOT :x: bRATHE :nose::lips::nose::lips::x::x: / HELP :exclamation:️I NEEd :point_right::point_right: AN a m b u l a n c e:ambulance::ambulance: SSSooOOoo00000oOOOOOøøøØØØØØ fKING FUNY :heavy_check_mark:️:ballot_box_with_check:️:100::100:1️⃣0️⃣0️⃣:laughing::laughing::joy::joy::sweat_smile: shit man :grey_exclamation::100::100::fire::point_up:️:ok_hand:damn");
    }/* else if (message.content.includes(bot.user.username) || message.content.includes(bot.user.id)) {
        console.log("Recieved mention...");
        message.channel.send('_Do you expect me to talk?_');
    }*/
     
}

function commandlinePrompt(input) {
    var commandInfo = [];
    
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
        commands[commandInfo[0]].process(bot, SQLconn, lib, commandInfo, message);
        console.log(`Command ${commandInfo[0]} completed successfully.`);
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
                sorted.push([levDist(command,key),key]);
            }
        }
    }
	
	console.log(sorted);
	
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
function levDist(str1, str2) {
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

lib.isPlural = function isPlural(quantity) {
	if (quantity == 0 || quantity > 1) {
		return 's';
	} else {
		return '';
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
				url: video.thumbnail
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
	if (queueLength > 1) {
		var footerText = `Up next: ${nextTrack.title}`;
	}
	
	bot.channels.get(textID).fetchMessage(messageID).then(message => {
		message.guild.fetchMember(message.author).then((guildmember) => {
			var embed = {
				description: `**${video.title}**\n_${video.channelName}_\n_${lib.displayDuration(video.duration)}_\n\`Added by ${guildmember.displayName}\``,
				color: 7919944,
				author: {
					name: `Now Playing 🎶`,
					icon_url: bot.user.avatarURL,
					url: `https://github.com/MrSp33dy123/${bot.user.username}`
				},
				thumbnail: {
					url: video.thumbnail
				},
				footer: {
					text: footerText,
					icon_url: video.thumbnail
				}
			};

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