// Use module.exports to refer to command list
// Permission levels: 0 = Bot creator, 1 = Server admin(s), 2 = Standard Memeber 3 = Demerit User
module.exports = {
    "restart": {
		specification:{
            command:{
                description: (bot)=>{return `Reboots ${bot.user.username} to reload source files, clear memory, and recieve any updates. Be careful with this one, fam.`},
                channelTypes: ['text','dm','group'],
                permissionLevel: 'creator',
                functional: true
            },
            variables:[]
        },
		process: function(bot, sql, lib, cmd, message, exceptions, callback) {
            if (message.channel.type != undefined) {
                    message.channel.send("***I'll be back.***").then((msg) => {
                    process.send('restart');
					callback(exceptions);
                });
            } else {
                console.log("I'll be back.");
                process.send('restart');
				callback(exceptions);
            }
		}
    },
	"help": {
        specification: {
			command:{
                description: (bot)=>{return "Posts basic information on how to use " + bot.user.username + ". Also posts the details of how to use a specific command."},
                channelTypes: ['text','dm','group'],
                permissionLevel: 'trusted',
                functional: true
            },
            variables:[
				['command', 'A command to post detailed information on.', true, /[^\n\s]+/]
			]
		},
		process: function(bot, sql, lib, cmd, message, exceptions, callback) {
			var command = cmd['command'];
			
            if (command) {
				if (typeof module.exports[command] != 'undefined') {
					
					lib.resolveEmbedAccent(bot,message,lib.botAccent,(resolvedColour)=>{
						const commandSpec = module.exports[command].specification;
						
						var embed = {
							description: "",
							color: resolvedColour,
							type: "markdown",
							author: {
								name: "",
								icon_url: bot.user.avatarURL,
								url: `https://github.com/MrSp33dy123/${bot.user.username}`
							},
							fields: []
						};

						embed.author.name = lib.formatCommandSpec(command,commandSpec);
						embed.description += commandSpec.command.description(bot);

						commandSpec.variables.forEach((spec)=>{
							var optional = "";
							var dfult = "";
							
							if (spec[2]) {optional = " `optional`"};
							if (spec[4]) {dfult = " `default " + spec[4] + "`"};
							
							embed.fields.push({
								name: spec[0],
								value: (spec[1] + optional + dfult),
								inline: true
							});
						});

						message.channel.send('',{embed}).then(()=>{
							callback(exceptions);
						});
					});
				} else {
					console.log('Given command input is not valid command.');
					callback(exceptions.concat({severity:4,code:'errCommandNonexistent',message:`Freaking freak, \`${command}\` isn't a valid command! :grimacing:`}));
				}
			} else {
				message.channel.send(`Glad you've taken notice of me, ${message.author} :yum:`);
				message.channel.send("There are a few things to know about me. Firstly, to get my attention, you use commands. Right now, all my commands are prefaced with a `>` character. You can call a command with no parameters, but otherwise my commands are formatted in two fundamental ways: ambiguous, and defined parameters. Let me explain.\n\nCommands with **ambiguous parameters** are formatted as follows: `>command var1`, `>command(var1)`,`>command var1 | var2 | var3`, or `>command(var1 | var2 | var3)`. A lot of the time I will show my commands with brackets to enclose the parameters, however they are always optional. Sometimes, they make the command more organized.\n\nCommands with **defined parameters** are formatted similarly to above, with the exception that each variable has two parts; the _parameter name_, and the _parameter value_. `>command name1:var1` and `>command(name1:var1 | name2:var2 | name3:var3)` are just two examples. You might want to use defined parameters if a command has many optional parameters, but you want to set only a few of them. You can set only the variables you want, rather than having to go through all of them. You can mix ambiguous and defined parameters, however only with defined parameters _after_ ambiguous parameters.\n\nWith that out of the way, hit me up with `>commands()` to see what I can do for you.").then(()=>{
					callback(exceptions);
				});
			}
		}
    },
    "cull": {
        specification:{
            command:{
                description: (bot)=> {return `Deletes a given quantity of preceeding messages in the channel.`},
                channelTypes: ['text','group'],
                permissionLevel: 'owner',
                functional: false
            },
            variables:[
                ['quantity', "The amount of messages to search through to delete all that match the criteria.", false, /^\d+$/],
                ['author', 'An _@mention_ of a user to exclusively delete the messages of.', true, /^<@\d+>$|^@everyone+$|^@here+$/, '@everyone']
            ]
        },
        process: function(bot, sql, lib, cmd, message, exceptions, callback) {
			var author = cmd['author'];
			var quantity = cmd['quantity'].match(/\d+/)
            
            if (quantity < 1) {
				callback(exceptions.concat({severity:4,code:'quantityTooLow',message:"It's impossible to delete zero messages or any less thereof."}));
			} else if (quantity > 99) {
				callback(exceptions.concat({severity:4,code:'quantityTooHigh',message:"To stop people from demolishing the entire history of the universe and everything, there is a `99` message limit."}));
            } else if (author == '@here') {
				callback(exceptions.concat({severity:4,code:'hereMentionUnsupported',message:"`@here` is not currently supported. Sorry :pensive:"}));
			} else {
				if (author == '@everyone') {
					console.log('Bulk deleting messages...');
					message.channel.bulkDelete(parseInt(quantity)+1,true).then(()=> {
						message.channel.send(`_${message.author.username} removed ${quantity} messages._`);
						// This callback works...?
						callback(exceptions);
					}).catch((err)=>{
						console.log(err);
						err.severity = 5;
						// This callback works too...
						callback(exceptions.concat(err));
					});
				} else {
					if (typeof (author = message.mentions.users.get(author.match(/^<@(\d+)>$/)[1])) === 'undefined') {
						callback(exceptions.concat({severity:4,code:'unresolvedUser',message:"The author you entered couldn't be resolved."}));
					} else {
						message.channel.fetchMessages({limit:parseInt(quantity)+1}).then((messages)=>{
							var messagesFromAuthor = messages.filter(cvar => cvar.author === author);
							console.log(`Recieved ${messages.size} messages`);
							console.log(`Found ${messagesFromAuthor.length} messages from author`);

							if (messagesFromAuthor.length == 0) {
								message.reply("It appears I didn't find any messages by this person, sorry.").then(()=>{
									callback(exceptions);
								});
							} else if (messagesFromAuthor.length == 1) {
								message.channel.delete(messagesFromAuthor).then(()=> {
									message.channel.send(`_${message.author.username} removed ${messagesFromAuthor.size} of ${author.username}'s messages from the past ${quantity} messages._`);
									callback(exceptions);
								}).catch((err)=>{
									err.severity = 5;
									callback(exceptions.concat(err));
								});
							} else {
								message.channel.bulkDelete(messagesFromAuthor).then(()=> {
									message.channel.send(`_${message.author.username} removed ${messagesFromAuthor.size} of ${author.username}'s messages from the past ${quantity} messages._`);
									console.log(exceptions);
									callback(exceptions);
								}).catch((err)=>{
									err.severity = 5;
									callback(exceptions.concat(err));
								});
							}
						});
					}
				}
			} 
        }
    },
	"echo": {
        specification:{
            command:{
                description: (bot)=> {return `Repeats a given phrase into the channel it was sent.`},
                channelTypes: ['text','dm','group'],
                permissionLevel: 'admin',
                functional: true
            },
            variables:[
                ['text', "A phrase to echo back.", false, /[^\n]+/],
            ]
        },
        process: function(bot, sql, lib, cmd, message, exceptions, callback) {
			var text = cmd['text'];
			
            message.delete().then(()=>{
				message.channel.send(text).then(()=>{
					callback(exceptions);
				}).catch((err)=>{
					err.severity = 5;
					callback(exceptions.concat(err));
				});
			}).catch((err)=>{
				err.severity = 5;
				callback(exceptions.concat(err));
			});
        }
    },
	"sosig": {
		specification: {
			command: {
                description: (bot)=>{return "Returns a decisive report on the validity of any particular thing."},
                channelTypes: ['text','dm','group'],
                permissionLevel: 'trusted',
                functional: true
            },
			variables: []
		},
		process: function(bot, sql, lib, cmd, message, exceptions, callback) {
            message.channel.send('***Sosig tested, Sosig approved.***').then(()=>{
				callback(exceptions);
			}).catch((err)=>{
				err.severity = 5;
				callback(exceptions.concat(err));
			});
		}
    },
	"commands": {
		specification:{
            command:{
                description: (bot)=> {return `Posts a list of all commands that ${bot.user.username} can use, to your PM.`},
                channelTypes: ['text','dm','group'],
                permissionLevel: 'trusted',
                functional: true
            },
            variables:[]
        },
		process: function(bot, sql, lib, cmd, message, exceptions, callback) {
			var format = cmd['format'];
			
			if (format) {format = format.toLowerCase()};
			
			lib.resolveEmbedAccent(bot,message,lib.botAccent,(resolvedColour)=>{
				var embed = {
					description: "A comprehensive list of every command in " + bot.user.username + "'s vocabulary.",
					color: resolvedColour,
					author: {
						name: `${bot.user.username} Command Library`,
						icon_url: bot.user.avatarURL,
						url: `https://github.com/MrSp33dy123/${bot.user.username}`
					},
					fields: []
				};
				
				for (var command in module.exports) {
					var commandSpec = module.exports[command].specification;
					if (commandSpec.command.functional == true) {
						embed.fields.push({
							name: lib.formatCommandSpec(command,commandSpec),
							value: commandSpec.command.description(bot),
							inline: true
						});
					}
				}
				
				message.author.send('',{embed}).then(()=>{
					if (message.channel.type == 'text') {
						message.reply('a full list of commands has been PMed to you, mate. Have fun with yer new toys :yum:').then(()=>{
							callback(exceptions);
						}).catch((err)=>{
							callback(exceptions.concat(err));
						});
					} else {
						callback(exceptions);
					}
				}).catch((err)=>{
					err.severity = 5;
					callback(exceptions.concat(err));
				});
			});
		}
	},
	"horn": {
		specification:{
            command:{
                description: (bot)=> {return `Brings honk upon everyone in the voice channel.`},
                channelTypes: ['text'],
                permissionLevel: 'trusted',
                functional: true
            },
            variables:[]
        },
		process: function(bot, sql, lib, cmd, message, exceptions, callback) {
			const hornPath = ['mlg-airhorn-1.mp3','lorde-perfect-places.mp3'];
			
			if (message.member.voiceChannel) {
				const currentConn = bot.voiceConnections.find(cvar => cvar.channel.guild.id == message.guild.id);
				if (currentConn == undefined) {
					message.member.voiceChannel.join().then(connection => {
						message.channel.send('***BAAARRRRRRRRRPP!!!***').then((msg)=>{
							const dispatcher = connection.playFile(`${__dirname}/assets/${hornPath[0]}`);
							dispatcher.on('end',()=>{
								connection.disconnect();
								msg.delete().then(()=>{
									callback(exceptions);
								});
							});
							dispatcher.on('error',(error)=>{
								error.severity = 5;
								callback(exceptions.concat(error));
							});
						});
					}).catch((err)=>{
						callback(exceptions.concat({severity:4,code:'couldntJoinVoice',message:`There was an error joining the voice channel, sorry! \`${err}\``}));
					});
				} else {
					callback(exceptions.concat({severity:4,code:'botPlayingQueue',message:"I can only do one thing at a time, and right now, I'm playing music. Sorry."}));
				}
			} else {
				callback(exceptions.concat({severity:4,code:'notInVoiceChannel',message:"You need to be in a voice channel first, bruh."}));
			}
		}
	},
	"play": {
		specification:{
            command:{
                description: (bot)=> {return `Joins your voice channel and/or appends a track to the queue.`},
                channelTypes: ['text'],
                permissionLevel: 'trusted',
                functional: true
            },
            variables:[
				['query','The URL or a search term for your desired track.', false, /[^]+/]
			]
        },
		process: function(bot, sql, lib, cmd, message, exceptions, callback) {
			// /https?:\/\/[\s\S]+/
			var query = cmd['query'];
			
			if (message.member.voiceChannel) {
				if (message.member.voiceChannel != message.guild.afkChannel) {
					// This would be where code to handle the queue would go
					if (/https?:\/\/\w+.youtube./.test(query)) {
						var videoData = {};
						videoData.id = query.match(/https?:\/\/\w+.youtube.com\/watch\?v=(\w{11})/)[1];
						
						const youtube = lib.gapi.google.youtube('v3');
						youtube.videos.list({id:videoData.id,part:'snippet,contentDetails',auth:lib.googleAPIkey},(err,vidresponse)=>{
							if (err) {
								err.severity = 5;
								callback(exceptions.concat(err));
							} else {
								if (vidresponse.pageInfo.totalResults === 0) {
									callback(exceptions.concat({severity:4,code:'invalidURL',message:"That appears to be an invalid URL. Couldn't find anything."}));
								} else {
									videoData.channelID = vidresponse.items[0].snippet.channelId;
									videoData.title = vidresponse.items[0].snippet.title;
									videoData.thumbnail = vidresponse.items[0].snippet.thumbnails.default.url;
									videoData.duration = lib.convertYTduration(vidresponse.items[0].contentDetails.duration);

									youtube.channels.list({id:videoData.channelID,part:'snippet',auth:lib.googleAPIkey},(err,channelresponse)=>{
										if (err) {
											err.severity = 5;
											callback(exceptions.concat(err));
										} else {
											videoData.channelName = channelresponse.items[0].snippet.title;
											console.log(videoData);
											whenSelected(videoData);
										}
									});
								}
							};
						});
					} else if (/https?:\/\/[\s\S]+/.test(query)) {
						callback(exceptions.concat({severity:4,code:'urlNotSupported',message:"Currently only URLs directed to YouTube are supported, sorry."}));
					} else if (/[A-Z]:\\[\s\S]+/.test(query)) {
						client.on('message', message => {
							message.member.voiceChannel.join().then(connection => {
								message.reply('Playing track.');
								message.delete();

								const dispatcher = connection.playFile(query);
								
								callback(exceptions);
							}).catch((err)=>{
								err.severity = 5;
								callback(exceptions.concat(err));
							});
						});
					} else {
						var videoData = [];
						const youtube = lib.gapi.google.youtube('v3');
						
						youtube.search.list({q:query,maxResults:3,safeSeach:false,type:"video",part:'snippet',auth:lib.googleAPIkey},(err,listresponse)=>{
							if (err) {
								err.severity = 5;
								callback(exceptions.concat(err));
							} else {
								listresponse.data.items.forEach((cvar,idx)=>{
									videoData[idx] = {};
									videoData[idx].id = cvar.id.videoId;
									videoData[idx].channelID = cvar.snippet.channelId;
									videoData[idx].title = cvar.snippet.title;
									videoData[idx].thumbnail = cvar.snippet.thumbnails.default.url;
								});

								youtube.videos.list({id:videoData.map(cvar => cvar.id).join(','),part:'contentDetails',auth:lib.googleAPIkey},(err,vidresponse)=>{
									if (err) {
										err.severity = 5;
										callback(exceptions.concat(err));
									} else {
										youtube.channels.list({id:videoData.map(cvar => cvar.channelID).join(','),part:'snippet',auth:lib.googleAPIkey},(err,channelresponse)=>{
											const numEmojis = ['1⃣','2⃣','3⃣'];
											var embed = {
												/*title:"Specify Video",*/
												/*description: "A comprehensive list of every command in " + bot.user.username + "'s vocabulary.",*/
												color: 2123412,
												author: {
													name: `Specify Video By Reacting 🔎`,
													icon_url: bot.user.avatarURL,
													url: `https://github.com/MrSp33dy123/${bot.user.username}`
												},
												fields: []
											};

											vidresponse.data.items.forEach((cvar,idx)=>{
												videoData[idx].channelName = channelresponse.data.items.filter(obj => obj.id == videoData[idx].channelID)[0].snippet.title;
												videoData[idx].duration = lib.convertYTduration(cvar.contentDetails.duration);

												embed.fields.push({
													name: `${numEmojis[idx]} ${videoData[idx].title}`,
													value: `${videoData[idx].channelName} – ${lib.displayDuration(videoData[idx].duration)}`,
													inline: false
												});
											});

											console.log(videoData);

											message.channel.send('',{embed}).then((msg)=>{
												callback(exceptions);
												
												// Create a reaction collector
												const collector = msg.createReactionCollector((reaction, user) => {
													return ((numEmojis.includes(reaction.emoji.name) || reaction.emoji.name == '❌') && user.id == message.author.id);
												},{max:1});

												collector.on('collect', (reactResp) => {
													collector.stop('collected');
													whenSelected(videoData[numEmojis.indexOf(reactResp.emoji.name)]);	
												});
												
												collector.on('end',(reactResp, code)=>{
													msg.delete();
													if (code != 'collected' && code != 'timeout') {
														code.severity = 5;
														callback(exceptions.concat(code));
														console.log('Something happened: ' + code);
													}
												});
												
												setTimeout(()=>{
													collector.stop('timeout');
												},300000);

												msg.react('1⃣').then(()=>{
													msg.react('2⃣').then(()=>{
														msg.react('3⃣').then(()=>{
															msg.react('❌');
														});
													});
												});
											}).catch((err)=>{
												code.severity = 5;
												callback(exceptions.concat(err));
											});
	//										lib.ytdl.getInfo(`https://www.youtube.com/watch?v=${vidIDs[0]}`,(err,info)=>{
	//											console.log(info);
	//										});
										});
									}
								});
							}
						});
					}
				} else {
					callback(exceptions.concat({severity:4,code:'inAFK',message:"The AFK channel isn't really suitable for jamming out, mah dude."}));
				}
			} else {
				callback(exceptions.concat({severity:4,code:'notInVoiceChannel',message:"You need to be in a voice channel to listen to your sick beats, fam."}));
			}
			
			function whenSelected(video) {
				if (video !== undefined) {
					sql.query(`SELECT ID, VideoData FROM QueuedTracks WHERE ServerID = ?; INSERT INTO QueuedTracks (ServerID, VoiceID, TextID, MessageID, VideoData) VALUES (?,?,?,?,?);`, 
							  [message.guild.id, message.guild.id, message.member.voiceChannel.id, message.channel.id, message.id, JSON.stringify(video)],
					function(err, rows, fields) {
						if (err) {
							err.severity = 5;
							callback(exceptions.concat(err));
						} else {
							if (rows[0].length == 0) {
								lib.playTrack(rows[1].insertId,rows[0].length,video,message.member.voiceChannel.id,message.channel.id,message.id);
							} else {
								var queueTime = 0;
								rows[0].forEach(cvar => {
									queueTime += JSON.parse(cvar.VideoData).duration;
								});
								lib.enqueueTrack(video,message,rows[0].length,queueTime);
							}
						}
					});
				}
			}
		}
	},
	"stop": {
		specification:{
            command:{
                description: (bot)=> {return `Stops playing the current track, and clears the queue.`},
                channelTypes: ['text'],
                permissionLevel: 'trusted',
                functional: true
            },
            variables:[]
        },
		process: function(bot, sql, lib, cmd, message, exceptions, callback) {
			sql.query(`DELETE FROM QueuedTracks WHERE ?;`,{ServerID:message.guild.id},(err, rows, fields) => {
				if (err) {
					err.severity = 5;
					callback(exceptions.concat(err));
				} else {
					const currentConn = bot.voiceConnections.find(cvar => cvar.channel.guild.id == message.guild.id);
					if (currentConn != undefined) {currentConn.disconnect()};
					
					var response;
					if (rows.affectedRows == 0) {
						response = "Hm, I'm not sure what queue you speak of...";
					} else {
						response = `It's ok, I'll be quiet now. The entire queue of ${rows.affectedRows} track${lib.isPlural(rows.affectedRows)} was wiped.`;
					}
					
					message.channel.send(response).then(()=>{
						callback(exceptions);
					}).catch((err)=>{
						err.severity = 5;
						callback(exceptions.concat(err));
					});
				}
			});
		} 
	},
	"skip": {
		specification:{
            command:{
                description: (bot)=> {return `Skips (or jumps, if you prefer) over the track ${bot.user.username} is currently playing.`},
                channelTypes: ['text'],
                permissionLevel: 'trusted',
                functional: false
            },
            variables:[]
        },
		process: function(bot, sql, lib, cmd, message, exceptions, callback) {
			const currentConn = bot.voiceConnections.find(cvar => cvar.channel.guild.id == message.guild.id);
			if (currentConn != undefined) {
				currentConn.disconnect().then(()=>{
					message.channel.send(`🔀 Skipping the current track.`).then(()=>{
						callback(exceptions);
					}).catch((err)=>{
						err.severity = 5;
						callback(exceptions.concat(err));
					});
				}).catch((err)=>{
					err.severity = 5;
					callback(exceptions.concat(err));
				});
				
			} else {
				callback(exceptions.concat({severity:4,code:'noQueueFound',message:"There isn't a queue running at the moment."}));
			}
		} 
	},
	"queue": {
		specification:{
            command:{
                description: (bot)=> {return `Posts a list of all the queued tracks on the server.`},
                channelTypes: ['text'],
                permissionLevel: 'trusted',
                functional: false
            },
            variables:[]
        },
		process: function(bot, sql, lib, cmd, message, exceptions, callback) {
			sql.query(`SELECT VideoData FROM QueuedTracks WHERE ServerID = ?`, [message.guild.id], function(err, rows, fields) {
				if (err) {
					err.severity = 5;
					callback(exceptions.concat(err));
				} else {
					if (rows.length == 0) {
						callback(exceptions.concat({severity:4,code:'noQueue',message:"What are you talking about? There is no queue."}));
					} else {
						var totalLength = 0;

						var embed = {
							/*title:"Specify Video",*/
							/*description: "A comprehensive list of every command in " + bot.user.username + "'s vocabulary.",*/
							color: 15587096,
							author: {
								name: `Queued Tracks 🗃️`,
								icon_url: bot.user.avatarURL,
								url: `https://github.com/MrSp33dy123/${bot.user.username}`
							},
							footer: {},
							fields: []
						};

						rows.forEach((cvar,idx)=>{
							cvar = JSON.parse(cvar.VideoData);
							totalLength += cvar.duration;

							embed.fields.push({
								name: `\`${idx+1}\` - ${cvar.title}`,
								value: `${lib.displayDuration(cvar.duration)} – ${cvar.channelName}`,
								inline: false
							});
						});

						embed.footer.text = `${rows.length} track${lib.isPlural(rows.length)} | ${lib.displayDuration(totalLength)} duration`;

						message.channel.send('',{embed}).then(()=>{
							callback(exceptions);
						}).catch((err)=>{
							err.severity = 5;
							callback(exceptions.concat(err));
						});
					}
				}
			});
		} 
	},
	"ping": {
		specification:{
            command:{
                description: (bot)=> {return `Responds to 'ping' with 'pong'.`},
                channelTypes: ['text','dm','group'],
                permissionLevel: 'trusted',
                functional: true
            },
            variables:[]
        },
		process: function(bot, sql, lib, cmd, message, exceptions, callback) {
			message.reply('Pong!').then(()=>{
				callback(exceptions);
			}).catch((err)=>{
				err.severity = 5;
				callback(exceptions.concat(err));
			});
		} 
	},
	"roll": {
        specification: {
            command:{
                description: (bot)=> {return `Gets you a random number.`},
                channelTypes: ['text','dm','group'],
                permissionLevel: 'trusted',
                functional: true
            },
            variables:[
                ['bounds','The upper and lower limit of the random number(s), split with a comma or hyphen.', true, /\d+[-,]\d+/, '1,6'],
                ['count','The quantity of random numbers you want.', true, /\d+/, '1']
            ]
        },
        process: function(bot, sql, lib, cmd, message, exceptions, callback) {
            var count = cmd['count'].match(/\d+/);
            var bounds = /(-?\d+)[-,]?(-?\d+)/.exec(cmd['bounds']);
			
            bounds.shift();
            bounds.forEach((cvar,idx,arr) => {arr[idx] = parseInt(cvar)});
            
            if (bounds[0] > bounds[1]) {
				callback(exceptions.concat({severity:4,code:'minNums',message:'Minimum limit cannot be greater than maximum limit.'}));
            } else if (count < 1 || count > 2000) {
				callback(exceptions.concat({severity:4,code:'maxNums',message:'Random number count cannot exceed Discord\'s 2,000 character message limit.'}));
            } else if (bounds[0] < -1152921504606846976 || bounds[1] > 1152921504606846976) {
				callback(exceptions.concat({severity:4,code:'boundsLimit',message:'For arbitrary reasons, I have a base-2 cap on how large the bounds can actually be. Please choose numbers that are less insane.'}));
			} else {
				var randNums = "";
				const emojiMap = [
					[0,":zero:"],
					[1,":one:"],
					[2,":two:"],
					[3,":three:"],
					[4,":four:"],
					[5,":five:"],
					[6,":six:"],
					[7,":seven:"],
					[8,":eight:"],
					[9,":nine:"],
					[10,":keycap_ten:"]
				];
				
				if (bounds[1] > 10 || bounds[0] < 0) {
					for (var i = 0; i < count; i++) {
						randNums += "`" + lib.getRand(bounds) + '` ';
					}
				} else {
					for (var i = 0; i < count; i++) {
						randNums += emojiMap[lib.getRand(bounds)][1];
					}
				}

				if (randNums.length > 1990) {
					callback(exceptions.concat({severity:4,code:'lengthLimit',message:'The resulting output would exceed the 2,000 character limit of Discord. Please reduce the count, or quantity of digits per number.'}));
				} else {
					message.reply("_Let's roll the dice..._").then(()=>{
						message.channel.send(randNums).then(()=>{
							callback(exceptions);
						}).catch((err)=>{
							err.severity = 5;
							callback(exceptions.concat(err));
						});
					}).catch((err)=>{
						err.severity = 5;
						callback(exceptions.concat(err));
					});;
					
				}
			}
        }
    },
    "become": {
        specification:{
            command:{
                description: (bot)=> {return `Transforms ${bot.user.username} into your identity of choice`},
                channelTypes: ['text'],
                permissionLevel: 'admin',
                functional: false
            },
            variables:[
                ['identity', "The names 'Oblivion', 'Suzy', 'Ariadne', 'Luna', 'James', or an @mention of the account that you want the bot to become.", true, /(?:<@!?\d+>)|(?:^[A-Za-z]+$)/,'Suzy']
            ]
        },
		process: function(bot, sql, lib, cmd, message, exceptions, callback) {
			var identity = cmd['identity'];
			
			// Full error checking still to be implemented
            const identityProperties = {
                oblivion:['>help','_We are on the outside, as on the inside._'],
				suzy:['>help',"_I think you've still got lightning in you._"],
                james:['Coolio, yo!','_Orange you glad to see me?_'],
                luna:['Tranquility','_The Eagle has Landed_'],
                ariadne:['Time','_We have to go deeper..._'],
                mercy:['Overwatch','_Heroes never die!_']
            };
			
			const mentionRegex = /(?:<@!?(\d+)>)/;
			if (mentionRegex.test(identity)) {
                setPresenceUser(message);
            } else {
                setPresencePreset(identity.toLowerCase());
            }
            
            function setPresencePreset(name) {
				if (identityProperties[name] !== undefined) {
					bot.user.setAvatar(`bot/assets/${name}-opt.jpg`).then(()=>{
						bot.user.setActivity(identityProperties[name][0]);
						bot.guilds.array().forEach((guild) => {
							guild.member(bot.user).setNickname(name.capFL());
						});

						// Issues with final message being sent before the username has been changed.
						setTimeout(()=>{
							message.channel.send(identityProperties[name][1]).then(()=>{
								callback(exceptions);
							}).catch((err)=>{
								err.severity = 5;
								callback(exceptions.concat(err));
							});
						},150);
					}).catch(err => {
						if (err.message == 'You are changing your avatar too fast. Try again later.') {
							callback(exceptions.concat({severity:4,code:'updateLimit',message:"Discord's servers aren't really onboard with me changing disguises this rapidly. Clearly they have no appreciation of true slipperyness. Sorry."}));
						} else {
							err.severity = 5;
							callback(exceptions.concat(err));
						}
					});
				} else {
					callback(exceptions.concat({severity:4,code:'invalidPreset',message:"I don't recognize that preset, sorry."}));
				}
            }
			
			function setPresenceUser(message) {
				var target = message.mentions.members.get(identity.match(mentionRegex)[1]);
                
				// Preferrably use auto-error system, however ATM it doesn't seem to work
				bot.user.setAvatar(target.user.displayAvatarURL).then(()=>{
					bot.guilds.array().forEach((guild) => {
						guild.member(bot.user).setNickname(target.displayName);
					});
					
					// This is a slight bodge. The optimal method would use promises in the forEach
					setTimeout(()=>{
						message.channel.send("_This command never happened. They'll never know._").then(()=>{
							callback(exceptions);
						}).catch((err)=>{
							err.severity = 5;
							callback(exceptions.concat(err));
						});
					},150);
				}).catch(err => {
					if (err.code == 50035) {
						callback(exceptions.concat({severity:4,code:'updateLimit',message:"Discord's servers aren't really onboard with me changing disguises this rapidly. Clearly they have no appreciation of true slipperyness. Sorry."}));
					} else {
						err.severity = 5;
						callback(exceptions.concat(err));
					}
				});
			}
		}
    },
	"perms": {
        specification:{
            command:{
                description: (bot)=> {return `Gets and sets the invididual or role permissions for ${bot}`},
                channelTypes: ['text','group'],
                permissionLevel: 'owner',
                functional: false
            },
            variables:[
				['mode', "'Get' or 'set' - whether you want to see the current settings or assign new ones.", false, /^(get|set)$/],
				['target', "An @user or @role that you want to assign the permissions to.", false, /(?:<@[&!]?\d+>)/],
				['permission', "The level to set the target's permissions to. Either a number or code name.", true, /(?:<@!?\d+>)|(?:^[A-Za-z]+$)/]
			]
        },
		process: function(bot, sql, lib, cmd, message, exceptions, callback) {
			const permLevels = [
				'everyone',
				'trusted',
				'admin',
				'owner',
				'creator'
			];
			
			/*CREATE TABLE IF NOT EXISTS PermissionLevels (
			ID INT UNSIGNED AUTO_INCREMENT,
			RoleID BIGINT UNSIGNED,
			UserID BIGINT UNSIGNED,
			ServerID BIGINT UNSIGNED NOT NULL,
			Permissions TINYINT UNSIGNED NOT NULL,
			PRIMARY KEY (ID)*/
			
			var mode = cmd['mode'].toLowerCase();
			var target = cmd['target'];
			var permission = cmd['permission'];
			var authorPerm;
			
            if (mode == 'set') {
				var resolvedPerm;
				if (permLevels[permission] != undefined) {
					resolvedPerm = permLevels[permission];
				} else {
					resolvedPerm = permission.toLowerCase();
				}
				
				
				
				if (resolvedPerm)
				
				var id;
				if (id = target.match(/<@&(\d+)>/)[1]) {
					var role;
					if (role = message.guild.roles.get(id) != undefined) {
						
					} else {
						callback(exceptions.concat({severity:4,code:'roleNotFound',message:"I'm not sure that role exists, fam."}));
					}
				} else {
					// User
				}
			} else {
				
			}
			
			function resolvePerms(userID,response) {
				// Get the user's perm level to check for owner status
				if (userID === lib.botCreator) {
					response(5);
				} else {
					SQLconn.query(`SELECT Permissions FROM PermissionLevels WHERE UserID = ? LIMIT 1`,[userID],(err, rows, fields) => {
						if (err) {
							err.severity = 5;
							return(err);
						} else {
							response(rows[0]);
						}
						
					});
				}
			}
			
			
			
            message.channel.send(response).then(()=>{
				callback(exceptions);
			}).catch((err)=>{
				err.severity = 5;
				callback(exceptions.concat(err));
			});
		}
    },
	"patchnotes": {
        specification:{
            command:{
                description: (bot)=> {return `Posts the information of ${bot.user.username}'s latest, or a historic, patch.`},
                channelTypes: ['text','dm','group'],
                permissionLevel: 'trusted',
                functional: false
            },
            variables:[
				['patch', "A specific patch to see.", true, /[^]+/,'latest']
			]
        },
		process: function(bot, sql, lib, cmd, message, exceptions, callback) {
			// Incomplete
            callback(exceptions);
		}
    },
	"sortvoice": {
        specification:{
            command:{
                description: (bot)=> {return `Posts the information of ${bot.user.username}'s latest, or a historic, patch.`},
                channelTypes: ['text','dm','group'],
                permissionLevel: 'trusted',
                functional: false
            },
            variables:[]
        },
		process: function(bot, sql, lib, cmd, message, exceptions, callback) {
			var voiceChannels = message.guild.channels.filter((channel)=>{
				return channel.type == 'voice';
			});
			
			var voiceMembers = [];
			voiceChannels.forEach((channel)=>{
				voiceMembers = voiceMembers.concat(channel.members);
			});
			
			var voiceChannelQuantity = voiceChannels.length;
			
			if (voiceChannels.has(message.guild.afkChannel)) {voiceChannelQuantity--};
			
			console.log(typeof voiceMembers);
			
			if (voiceMembers.length <= 1) {
				var games = {};
				voiceMembers.forEach((member)=>{
					var game = member.presence.game.name;
					games[game] = (games[game] || 0)+1;
				});
			} else {
				callback(exceptions.concat({severity:4,code:'notEnoughMembers',message:`I'm not sure why you need me to sort literally ${lib.numToWord(voiceMembers.length)} member${lib.isPlural(voiceMembers.length)}. Where would you want me to put them?`}));
			}
			
			
			console.log('Numbers are as follows:');
			console.log(voiceChannelQuantity);
			console.log(games);
			
            callback(exceptions);
		}
    },
	"lenny": {
        specification:{
            command:{
                description: (bot)=> {return `Fetches the user a splendid rendition of the Lenny Face.`},
                channelTypes: ['text','dm','group'],
                permissionLevel: 'trusted',
                functional: true
            },
            variables:[]
        },
		process: function(bot, sql, lib, cmd, message, exceptions, callback) {
            message.delete().then(()=>{
				message.channel.send('( ͡° ͜ʖ ͡°)');
				callback(exceptions);
			}).catch((err)=>{
				err.severity = 5;
				callback(exceptions.concat(err));
			});
			
		}
    },
	"logging": {
        specification:{
            command:{
                description: (bot)=> {return `Calls into question the validity of trees and wildlife.`},
                channelTypes: ['text','dm','group'],
                permissionLevel: 'trusted',
                functional: true
            },
            variables:[]
        },
		process: function(bot, sql, lib, cmd, message, exceptions, callback) {
            var response;
            switch (lib.getRand([1,4])) {
                case 1:
                    response = "_Ah'm gettin sunburnt over here, we need to start makin some pollution to block out the sun!_";
                    break;
                case 2:
                    response = "_Y'all know what'd make this chat look real nice? Logging._";
                    break;
                case 3:
                    response = "_Ah think a nice new haighway would look real great runnin right thru here._";
                    break;
                case 4:
                    response = "_Y'all know what'd make debugging real easy? Logging._";
            }
			
            message.channel.send(response).then(()=>{
				callback(exceptions);
			}).catch((err)=>{
				err.severity = 5;
				callback(exceptions.concat(err));
			});
		}
    },
};

/*
    "": {
        usage: "",
        description: (bot)=> {return ``},
        functional: false,
		process: function(bot, SQLconn, cmd, message) {
            
		}
    },
*/
/*
    "": {
		specification: [],
        description: (bot)=> {return `Forwards to Help.`},
        functional: false,
		process: function(bot, sql, lib, cmd, message) {
            message.reply('Welcome to Oblivion. Type `>help` to find out more...');
		}
	},
    "ping": {
		specification: [['let it begin', 'The words that will activate an infinite loop of pure hell (and spam).', true]],
        description: (bot)=> {return "Answers the command with 'pong'. Yes, the bot can hear you."},
        functional: false,
		process: function(bot, sql, lib, cmd, message) {
            if (cmd[1] == 'let it begin') {
                for (var count; count < 50; count++) {
                    if (count % 2 == 0) {
                        message.reply('ping').then(function() {
                            
                        });
                    } else {
                        message.reply('pong');
                    }
                }
            } else {
                message.reply('pong');
            }
            
		}
	},
    "shutdown": {
		specification: [],
        description: (bot)=> {return "Shuts down the bot, closing its server."},
        functional: true,
		process: function(bot, sql, lib, cmd, message) {
            console.log('Shutting down bot and closing program.');
            //SQLconn.end();
            if (message.channel.type != undefined) {
                message.channel.send(`How could you do this ${message.author}?! :cry:\nGoodbye, cruel world...`);
                message.channel.send(`\n_${bot.user.username} is now offline..._`).then((msg) => {
                    process.send('shutdown');
                    sql.end();
                });
            } else {
                process.send('shutdown');
                sql.end();
            }
		}
	},
    "help": {
        specification: [['command', 'A command that you want detailed information on.', true, 'string']],
        description: (bot)=> {return "Posts basic information on how to use " + bot.user.username + ". Can also post the details of how to use a specific command."},
        functional: true,
		process: function(bot, sql, lib, cmd, message) {
            if (cmd[1]) {
//                message.reply(`\`>${cmd[1]}\` ${module.exports[cmd[1]].description(bot).lowercaseFL()}`);
                
                var embed = {
//                    title: `[Donate to keep Googlebot alive](https://patreon.com/guscaplan)`, //`\`${module.exports[cmd[1]].usage}\``  `(>${cmd[1]})[https://www.google.co.nz]`
                    description: "\`>" + cmd[1],
                    color: 52685,
                    type: "markdown",
                    author: {
                        name: `>${cmd[1]}`,
                        icon_url: bot.user.avatarURL,
                        url: `https://github.com/MrSp33dy123/${bot.user.username}`
                    },
                    fields: []
                };
                
                for (let count = 0; count <= module.exports[cmd[1]].specification.length - 1; count++) {                
                    switch (module.exports[cmd[1]].specification.length) {
                        case (count + 1):
                            if (count == 0) {
                                embed.description += "(" + module.exports[cmd[1]].specification[count][0] + ")";
                            } else {
                                embed.description += module.exports[cmd[1]].specification[count][0] + ")";
                            }
                            break;
                        default:
                            if (count == 0) {
                                embed.description += "(" + module.exports[cmd[1]].specification[count][0];
                            } else {
                                embed.description += " | " + module.exports[cmd[1]].specification[count][0];
                            }
                    }
                };
                embed.description += "\`\n" + module.exports[cmd[1]].description(bot);
                            
                module.exports[cmd[1]].specification.forEach((spec)=>{
                    var optional = "";
                    console.log("Spec:" + spec[2]);
                    if (spec[2] == true) {optional == " Optional."};
                    embed.fields.push({
                        name: spec[0],
                        value: (spec[1] + optional),
                        inline: true
                    });
                });
                
                message.channel.send('',{embed});
            } else {
                message.channel.send(`Glad you've taken notice of me, ${message.author} :yum:\n\nThe '>' character is what you use to get my attention in _most_ cases. Type it in to get a shortlist of commands.\nMany of my functions will take variables that will be parsed in it's execution, and they are formatted like \`>command(var1|var2|var3)\`. To find out what inputs a function requires, simply type \`>help(command)\`.`);
            }
		}
    },
    "commands": {
		specification: [['format',"'Full' if you want a complete list of every avaiable command. Leave blank for a shorter summary.", true]],
        description: (bot)=> {return 'Posts a list of all commands that ' + bot.user.username + ' can use through PM.'},
        functional: true,
		process: function(bot, sql, lib, cmd, message) {
            if (cmd[1]) {cmd[1] = cmd[1].toLowerCase()};
            if (cmd[1] == "full" || cmd[1] == "all" || cmd[1] == "large") {
                var embed = {
//                    thumbnail: {
//                        url: "https://lh3.googleusercontent.com/-4YMcPk0eBpI/WEjALPgp79I/AAAAAAAACXk/pl8HnDpUslYLFCClp7URdgMD7pPEh2FJgCL0B/w530-d-h298-p-rw/gargantua-3.jpg"
//                    },
                    description: "A comprehensive list of every command in " + bot.user.username + "'s vocabulary.",
                    color: 52685,
                    author: {
                        name: `Complete ${bot.user.username} Command Library`,
                        icon_url: bot.user.avatarURL,
                        url: `https://github.com/MrSp33dy123/${bot.user.username}`
                    },
                    fields: []
                };
                for (var command in module.exports) {
                    if (module.exports[command].functional == true) {
                        embed.fields.push({
                            name: ">" + command,
                            value: module.exports[command].description(bot),
                            inline: true
                        });
                    }
                }
                message.author.send('',{embed});
                if (message.channel.type == 'text') {
                    message.reply('a full list of commands has been PMed to you, mate. Have fun with yer new toys :yum:');
                }
            } else {
                const topCmds = ['restart','logging','sosig','become','help','commands'];
                var embed = {
                    thumbnail: {
                        url: "https://lh3.googleusercontent.com/-4YMcPk0eBpI/WEjALPgp79I/AAAAAAAACXk/pl8HnDpUslYLFCClp7URdgMD7pPEh2FJgCL0B/w530-d-h298-p-rw/gargantua-3.jpg"
                    },
                    description: "The central, essential commands that begin to unlock the bot's abilities.",
                    color: 52685,
                    author: {
                        name: `${bot.user.username} Command Overview`,
                        icon_url: bot.user.avatarURL,
                        url: `https://github.com/MrSp33dy123/${bot.user.username}`
                    },
                    fields: []
                };
                topCmds.forEach(function(command){
                    embed.fields.push({
                        name: ">" + command,
                        value: module.exports[command].description(bot),
                        inline: true
                    });
                });
                message.channel.send('',{embed});
            }
		}
	},
    "sosig": {
		specification: [],
        description: (bot)=> {return "Returns a decisive report on the validity of any particular thing."},
        functional: true,
		process: function(bot, SQLconn, lib, cmd, message) {
            message.channel.send('***Sosig tested, Sosig approved.***');
		}
    },
    "shrekislove": {
		specification: [['story', 'The number of the ShrekisLove story that you want to see (1 to 3). The greater the number, the more gruesome the story.', true]],
        description: (bot)=> {return "Tells the tale of a 9-year-old's encounter with Shrek."},
        functional: false,
		process: function(bot, SQLconn, lib, cmd, message) {
            if (message.author.id == "175670558040653825") {
                message.reply("Fuck off, Nikolai. You've done enough.");
            } else {
                console.log("It's time.");
                var shrekStories = [
                    "Be 14\nBring Shrek 1 & 2 to class\nTell teacher we must watch Shrek\nTeacher makes class vote for what movie to watch\nShrek 2 has majority vote\n>feelsgoodman.jpg\nThen, Francias pulls out Despicable Me and hands it to teacher\nEveryone in class votes for it and laughs at me\nTeacher throws my Shreks back at me and puts Despicable Me in DVD player.\nAs the disc loads, I hear loud footsteps from outside. The rumbling shakes the desks and chairs.\nThe smell of onions filled the room.\nSuddenly, naked Shrek bursts through the wall and looks at the DVD menu of Despicable Me in anger\n>“Ogre m'aye dead bodeh”\nShrek throws two onionades at the TV and kills the teacher and the deaf girl\n>“Dohble Keel”\nShrek punches through a kid's chest, pulls out his heart and replaces it with an onionade\nKid explodes\n>“Treeple Kehl!”\nShrek graps Francis as he tries to escape and _bends him over_\nHe pulls out Francis' intestines through his butthole and ties an onion to it\nShrek then tosses the onion out the window and Francis is dragged out with it\nFrancis falls 8 stories to his death\n>“OGREKEEEEEL!”\nShrek turns around to rest of the class.\nHe quietly whispers, >“Thees is the pahrt whehre you run away”\nEntire class jumps out the windows to their death.\n>“SHREKSTERMINATION”\n_Shrek turns to me._\nHe looks me in the eye and smiles.\n>“Bet yeh weren't shrekspecting thAt”\n“I-is it... ogre?” I ask\n>“It's ogre when Aye say it's ogre.”\nI fall to my knees at his majesty\nI was ready to please Shrek.\nHe pulled out his massive ogresized eshrekt cock and lodged it in my throat.\nMy eyes filled with tears.\nMFW they were happy tears.\n\n>Shrek is love\n>Shrek is life",
                    "I was only 9 years old\nI loved Shrek so much, I had all the merchandise and movies\nI pray to Shrek every night before bed, thanking him for the life I’ve been given\n“Shrek is love” I say; “Shrek is life”\nMy dad hears me and calls me a faggot\nI know he was just jealous of my devotion for Shrek\nI called him a cunt\nHe slaps me and sends me to go to sleep\nI’m crying now, and my face hurts\nI lay in bed and it’s really cold\nSuddenly, a warmth is moving towards me\nIt’s Shrek\nI am so happy\nHe whispers into my ear “This is my swamp.”\nHe grabs me with his powerful ogre hands and puts me down onto my hands and knees\nI’m ready\nI spread my ass-cheeks for Shrek\nHe penetrates my butt-hole\nIt hurts so much but I do it for Shrek\nI can feel my butt tearing as my eyes start to water\nI push against his force\nI want to please Shrek\nHe roars in a mighty roar as he fills my butt with his love\nMy dad walks in\nShrek looks him straight in the eyes and says “It’s all ogre now.”\nShrek leaves through my window\nShrek is love. Shrek is life.",
                    "Be 18\nHave girlfriend\nHave sex on regular basis\nShe asks for a movie night, something erotic\nThink of two things we both love\n>Shrek and sex\nGo out of my way to find a shrek porno; search everywhere\nFound one finally\nSurprise her with a Shrek 1 porno\nShe laughs and says that's fucking retarded and no sex for week\nOne night shes over and we're cuddling\nWe start kissing and I reach down into her pants\nShe stops me and says  n o\nI say >“Why?”\n>“Because of that porno. It really weirded me out. I think we need a break.”\nWTF it was a stupid mistake\nHear a bang at the window\nI go to check it out\nSmell of onions suddenly becomes unbearable\nWindow smashes open and a naked, fully aroused Shrek appears.\nHis cock must of been 24 inches long with girth of 12 inches\nThis pulsating veiny cock aroused my girlfriend and I\nBecame unbearably horny\nHe shouts>“AH WE GON HAF A WEE TAH HAV A FOON TEIM LADS.”\nI insert my cock into girlfriend's vagina\nBegan fucking hard\nShrek jumps in front of her and shoves his cock into her mouth and began to thrust hard\nMoans in pure ecstasy and we all climax\nShrek and I switch sides\nGirlfriend speads her ass checks and yells “OH GOD PLEASE PUT IT IN MY ASS”\n>“AH NEVAH OOSE A OOSED OLD MAH LASS” he yells.\nRepeat another ten minutes of hardcore fucking and sucking\nShe passes out from peasure and has a great orgasm\n_>Shrek stares at me_\n>“EETS UR TURN LAD”\nI bend over with complete obedience\n>“LEETS BEEGUN”\nShrek penetrates my tender asshole and stretches my anus to the width of his girth.\nHe climaxes and fills me whole\nHe then receedes into the bushes and I got to my girlfriend and cuddle with her for the night\n\n_Shrek is love_\n_Shrek is life_"
                ];
                if (isNaN(cmd[1])) {cmd[1] = 0;message.reply('You must supply a number from 1 to 3. Defaulting to 1.');} else {cmd[1]++};
                message.channel.send(shrekStories[cmd[1]], {tts:true,split:{maxLength:180}});
            }
        }
    },
    "thethingis": {
		specification: [],
        description: (bot)=> {return "Hides deep within the bowells of obscure reference and hidden commands."},
        functional: false,
		process: function(bot, SQLconn, lib, cmd, message) {
            console.log(message.author.username + " is on to us! They're discovering things never meant for discovery!");
            message.channel.send(`Becha didn't think _this_ would be a command, did you ${message.author}? What does this command do? Well, be patient, stay vigilant, and I guess we'll just have to wait and see now won't we?`);
		}
	},
    "become": {
        specification:{
            command:{
                channelTypes: ['text'],
                permissionLevel: 2
            },
            variables:[
                ['identity', "The names 'Oblivion', 'Ariadne', 'Luna', 'James', or an @mention of the account that you want the bot to become.", false, /(?:<@\d+>)|(?:[^\d\W]+)/, 'Oblivion']
            ]
        },
        usage: "become(<Oblivion/Ariadne/James/Luna>)",
        description: (bot)=> {return `Instructs ${bot.user.username} to shapeshift into any given person.`},
		process: function(bot, SQLconn, lib, cmd, message) {
            var identityProperties = {
                oblivion:['','_We are on the outside, as on the inside._'],
                james:['Coolio, yo!','_Orange you glad to see me?_'],
                luna:['Tranquility','_The Eagle has Landed_'],
                ariadne:['Time','_We have to go deeper..._'],
                mercy:['Overwatch','_Heroes never die!_']
            };
            function setPresenceCustom(name) {
                bot.user.setAvatar(`bot/assets/${name}-opt.jpg`);
                bot.user.setGame(identityProperties[name][0]);
                bot.guilds.array().forEach((guild) => {
                    guild.member(bot.user).setNickname(name.capFL());
                });
                message.channel.send(identityProperties[name][1]);
            }
            if (/(?:<@\d+>)/.test(cmd['identity'])) {
                var target = message.mentions.users.get('id', cmd[1].substr(4,18));
                
                console.log("User: " + cmd[1].substr(4,18));
                console.log("User object: " + JSON.stringify(message.mentions.users));
                
                bot.user.setAvatar(target.avatarURL);
                bot.guilds.array().forEach((guild) => {
                    guild.member(bot.user).setNickname(guild.member(target).nickname);
                });     
            } else {
                setPresenceCustom(cmd['identity'].toLowerCase());
            }
		}
    },
    "debug": {
        specification: [['variables', 'Any selection of variables to test.', true]],
        description: (bot)=> {return `Tests the operation of ${bot.user.username}'s command processing functions. For admin use.`},
        functional: false,
		process: function(bot, SQLconn, lib, cmd, message) {
            console.log(`Full content: ${message.content}\nCommand info: ${cmd.join(', ')}`);
		}
    },
    "wizdom": {
        specification: [],
        description: (bot)=> {return ``},
        functional: false,
		process: function(bot, SQLconn, lib, cmd, message) {
            
		}
    },
    "somesay": {
        specification: [],
        description: (bot)=> {return ``},
        functional: false,
		process: function(bot, SQLconn, lib, cmd, message) {
            
		}
    },
    "say": {
        specification: [],
        description: (bot)=> {return ``},
        functional: false,
		process: function(bot, SQLconn, lib, cmd, message) {
            bot.guilds.find('name', cmd[1]).defaultChannel.send(cmd[2]);
		}
    },
    "killallmen": {
        specification: [],
        description: (bot)=> {return `Keep up with the latest goss' surrounding your fav' Twit hash'.`},
        functional: true,
        process: function(bot, SQLconn, lib, cmd, message) {
            message.reply("https://twitter.com/hashtag/killallmen");
        }
    },
    "logging": {
        specification: [],
        description: (bot)=> {return `Calls into question the validity of trees and wildlife.`},
        functional: true,
        process: function(bot, SQLconn, lib, cmd, message) {
            var response;
            switch (lib.getRand([1,4])) {
                case 1:
                    response = "_Ah'm gettin sunburnt over here, we need to start makin some pollution to block out the sun!_";
                    break;
                case 2:
                    response = "_Y'all know what'd make this chat look real nice? Logging._";
                    break;
                case 3:
                    response = "_Ah think a nice new haighway would look real great runnin right thru here._";
                    break;
                case 4:
                    response = "_Y'all know what'd make debugging real easy? Logging._";
            }
            message.channel.send(response);
        }
    },
    "nein": {
        specification: [],
        description: (bot)=> {return `No.`},
        functional: true,
        process: function(bot, SQLconn, lib, cmd, message) {
            message.channel.sendFile("bot/assets/nein.gif");
        }
    },
    "random": {
        specification:{
            command:{
                channelTypes: ['dm','group','text'],
                permissionLevel: 2
            },
            variables:[
                ['type','The type of random item you want.',false],
                ['quantity','The amount of the random items you want.',true],
                ['other','Other specifications for the random item(s)',true]
            ]
        },
        description: (bot)=> {return `Finds a random thing fitting the specifications. ${bot.user.username} currently only supports cats.`},
        process: function(bot, SQLconn, lib, cmd, message) {
            if (cmd[1] == 'cat') {
                bot.request({uri:'http://random.cat/meow'}, function(error, response, body) {
                    if (error) {
                        throw error;
                    } else {
                        message.channel.send(JSON.parse(body).file);
                    }
                });
            } else if (cmd[1] == 'dog') {
                message.channel.send('http://www.randomdoggiegenerator.com/randomdoggie.php');
                
                bot.request({uri:'http://random.cat/meow'}, function(error, response, body) {
                    if (error) {
                        throw error;
                    } else {
                        message.channel.send(JSON.parse(body).file);
                    }
                });
            } else {
                message.reply(`Sorry, I can't find any ${cmd[1]}s right now. Try looking for something else.`);
            }
        }
    },
    "roll": {
        specification: {
            command:{
                channelTypes: ['dm','group','text'],
                permissionLevel: 2
            },
            variables:[
                ['bounds','The upper and lower limits of the random number(s), split with a comma or hyphen.', true, /\d+[-,]\d+/, '1,6'],
                ['count','The quantity of random numbers you want.', true, /\d+/, '1']
            ]
        },
        description: (bot)=> {return `Gets you a random number.`},
        process: function(bot, SQLconn, lib, cmd, message) {
            cmd['count'] = cmd['count'].match(/\d+/);
            cmd['bounds'] = /(-?\d+)[-,]?(-?\d+)/.exec(cmd['bounds']);
            cmd['bounds'].shift();
            cmd['bounds'].forEach((cvar, idx, arr) => {
                arr[idx] = parseInt(cvar);
            });
            
            if (cmd['bounds'][0] > cmd['bounds'][1]) {
                throw new Error('Minimum limit cannot be greater than maximum limit.');
            }
            if (cmd['count'] < 1 || cmd['count'] > 2000) {
                throw new Error('Random number count cannot exceed Discord\'s 2,000 character message limit.');
            }
            if (cmd['bounds'][0] < -1152921504606846976 || cmd['bounds'][1] > 1152921504606846976) {
                throw new Error('For arbitrary reasons, I have a base-2 cap on how large the bounds can actually be. Please choose numbers that are less insane.');
            }
                    
            const emojiMap = [
                [0,":zero:"],
                [1,":one:"],
                [2,":two:"],
                [3,":three:"],
                [4,":four:"],
                [5,":five:"],
                [6,":six:"],
                [7,":seven:"],
                [8,":eight:"],
                [9,":nine:"],
                [10,":keycap_ten:"]
            ];
            
            var randNums = "";
            if (cmd['bounds'][1] > 10 || cmd['bounds'][0] < 0) {
                for (var count = 0; count < cmd['count']; count++) {
                    randNums += "`" + lib.getRand(cmd['bounds']) + '` ';
                }
            } else {
                for (var count = 0; count < cmd['count']; count++) {
                    randNums += emojiMap[lib.getRand(cmd['bounds'])][1];
                }
            }
            
            if (randNums.length > 2000) {
                throw new Error('The resulting output would exceed the 2,000 character limit of Discord. Please reduce the count, or quantity of digits per number.');
            }
            
            message.reply("_Let's roll the dice..._");
            message.channel.send(randNums)
        }
    },
    "stats": {
        specification: [],
        description: (bot)=> {return `Posts a panel displaying information on ${bot.user.username}'s status.`},
        functional: false,
        process: function(bot, SQLconn, lib, cmd, message) {
            if (message.channel.type == 'dm') {
                const embed = {
                    title: 'Keksas',
                    description: 'The home of the meme',
                    url: `https://www.google.co.nz`
                }
                message.channel.send('', {embed});
            } else {
                message.reply('I think we need to talk somewhere a bit more _private_.');
            }
        }
    },
	"edits": {
		specification: {
			command: {
                description: (bot)=>{return "Lists the complete edit history of a message."},
                channelTypes: ['text','dm','group'],
                permissionLevel: 3,
                functional: true
            },
			variables: [
				['message', "An edited message (snowflake ID).", false, /\d{18}/],
			]
		},
		process: function(bot, SQLconn, lib, cmd, message) {
			console.log(cmd['message']);
            message.channel.fetchMessage(cmd['message']).then((msg)=>{
				console.log(msg.edits.length);
				if (msg.edits.length <= 1) {
					new lib.ObvErr('errcustom',["That message doesn't have any edits. :unamused:"]);
				} else {

				}
			}).catch((err)=>{
				new lib.ObvErr('errcustom',["I couldn't find that message. Note that it must be from this channel. To get a snowflake ID, enable developer mode in user settings, and right-click a message."]);
			});
		}
    },
*/