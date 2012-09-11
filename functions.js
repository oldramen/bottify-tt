/*************************************************************************
 * @copyright 2012 yayramen.                                             *
 * @author yayramen                                                      *
 * @description This is the functions file, outlying the stuff that      *
 * makes the bot work, and function as an application.                   *
 *************************************************************************/

global.OnRegistered = function(a) {
	if (!core.booted && a.user[0].userid == config.uid) return Boot();
	if (a.user[0].userid == config.uid && core.moving) {
		Log("Successfully registerd in room");
		clearTimeout(core.moving);core.moving = null;
		return Boot(true);
	};
	if (core.users.left[a.user[0].userid]) return delete core.users.left[a.user[0].userid];
	Register(a.user);
	for (var i = a.user.length - 1; i >= 0; i--) {
		var b = a.user[i];
		core.users.togreet.push(b.userid);
	};
};

global.OnDeregistered = function(a) {
	Remove(a.user[0].userid);   
};

global.OnNewModerator = function(a) {
	if (core.mods.indexOf(a.userid) == -1) core.mods.push(a.userid);
	Say(config.on.addmod, a.userid);
};

global.OnRemModerator = function(a) {
	if (core.mods.indexOf(a.userid) > -1) core.mods.splice(core.mods.indexOf(a.userid), 1);
	Say(config.on.remmod, a.userid);
};

global.OnAddDJ = function(a) {
	var sUser = core.user[a.user[0].userid];
	if (!sUser) return;
	if (config.queue.on && !GuaranteeQueue(sUser)) return;
	if (Waited(sUser)) sUser.waiting = sUser.count = 0;
	if (config.songs.waits && sUser.waiting > 0) {
		bot.remDj(sUser.userid);
		Log(sUser.name+" was escorted: song wait");
		return Say(msg.waitlimit, sUser.userid, true);
	}
	if (config.whitelist && config.list.indexOf(sUser.userid) === -1) {
		bot.remDj(sUser.userid);
		Log(sUser.name+" was escorted: not on whitelist");
		return Say(msg.whitelist.notin, sUser.userid, true)
	}
	sUser.droppedRoom = config.room;
	UpdateIdle(sUser);
	Save(sUser);
	Log(sUser.name+" started DJing");
	Say(config.on.adddj, a.user[0].userid);
	RefreshDJs();
};

global.OnRemDJ = function(a) {
	AdvanceQueue();
	var sUser = core.user[a.user[0].userid];
	if (!sUser) return;
	Log(sUser.name+" stopped DJing");
	sUser.boot = false;
	core.djs.splice(core.djs.indexOf(sUser.userid), 1);
	sUser.dropped = Date.now();
	sUser.droppedRoom = config.room;
	UpdateIdle(sUser);
	Say(config.on.remdj, a.user[0].userid);
	RefreshDJs();
	Save(sUser);
};

global.OnSpeak = function(a) {
	var sUser = core.user[a.userid];
	var sText = a.text;
	if(sUser == null) return;
	if (a.text.match(/^[!*\/]/) || core.cmds.bare.indexOf(sText) !== -1) HandleCommand(a.userid, sText, false);
	UpdateIdle(sUser);
	Save(sUser);
};

global.OnPmmed = function(a) {
	HandlePM(a.senderid, a.text);
};

global.OnNewSong = function(a) {
	for(var b in core.user) {
		var c = core.user[b];
		if(c.waiting > 0) --c.waiting;
		if(!Is('dj', c.userid) && c.waiting <= 0) {
			c.waiting = 0;
			c.count = 0;
		}
	}
	if(core.currentdj && !Is("vip", core.currentdj.userid) && core.djs.length >= config.songs.mindj) {
		if(config.songs.on && core.currentdj.count >= config.songs.max) OverMaxSongs(core.currentdj);
	}
	if (core.currentdj && core.currentdj.boot) RemoveDJ(core.currentdj);
	core.currentsong.up = 0;
	core.currentsong.down = 0;
	core.currentsong.heart = 0;
	core.currentsong.name = a.room.metadata.current_song.metadata.song;
	core.currentsong.artist = a.room.metadata.current_song.metadata.artist;
	core.currentsong.album = a.room.metadata.current_song.metadata.album;
	core.currentsong.genre = a.room.metadata.current_song.metadata.genre;
	core.currentsong.id = a.room.metadata.current_song._id;
	core.currentdj = core.user[a.room.metadata.current_dj];
	if(core.currentdj) AddSong(core.currentdj);
};

global.OnEndSong = function(a) {
	var b = core.currentsong.heart;
	if (core.currentdj) {
		core.currentdj.ups = core.currentdj.ups + core.currentsong.up;
		core.currentdj.downs = core.currentdj.downs + core.currentsong.down;
		Save(core.currentdj);
		Say(config.on.endsong, core.currentdj.userid);
	}	else { Say(config.on.endsong); }
	if (config.on.endsong) core.lastsong = Parse(config.on.endsong);
	if (!config.on.endsong) core.lastsong = Parse("{songtitle}: {up} ↑, {down} ↓, {heartcount} <3.");
	botti.db.save("song", a.room.metadata, b);
};

global.OnSnagged = function(a) {
	++core.currentsong.heart;
	if(core.currentdj) GotHeart(core.currentdj)
	var sUser = core.user[a.userid];
	if(sUser) GaveHeart(sUser);
	Say(config.on.snag, a.userid);
	bot.vote('up');
	Save(sUser);
};

global.OnNoSong = function(a) {
	Log("No song. Hrmph.")
};

global.OnVote = function(a) {
	core.currentsong.up = a.room.metadata.upvotes;
	core.currentsong.down = a.room.metadata.downvotes;
	var sVote = a.room.metadata.votelog;
	for(var i=0;i<sVote.length;i++) {
		var sVotes = sVote[i];
		var sUserId = sVotes[0];
		var sUser = core.user[sUserId];
		if(sUser && !Is("bot", sUser.userid)) {
			if (config.afk.bop) UpdateIdle(sUser);
			Save(sUser);
		}
	}
};

global.Boot = function(z){
	if (z) core.user = {};
	Update();
	bot.roomInfo(function (a) {
		core.roomname = a.room.name;
		if (!z) botti.db.load("settings");
		Register(a.users);
		setTimeout(function () {
			RefreshAfks();
			CheckQueue();
			RefreshMeta(a);
			Say(config.on.boot);
			core.booted = true;
		}, 3000);
	});
	core.looping = setInterval(function () {
		Loop();
	}, 10000);
};

global.Update = function() {
	bot.modifyProfile({name: config.name});
	bot.modifyName(config.name);
	bot.modifyLaptop(config.laptop);
};

global.RefreshMeta = function(a) {
	core.djs = [];
	core.currentsong = {name: "",up: -1,down: -1,heart: -1};
	for(var i = 0, len = a.room.metadata.djs.length; i < len; ++i) {
		core.djs[i] = a.room.metadata.djs[i];
	};
	core.currentdj = core.user[a.room.metadata.current_dj];
	if(core.currentdj && core.currentdj.count < 1) core.currentdj.count++;
	core.maxdjs = a.room.metadata.max_djs;
	if(a.room.metadata.current_song) {
		core.currentsong.up = a.room.metadata.upvotes;
		core.currentsong.down = a.room.metadata.downvotes;
		core.currentsong.heart = 0;
		core.currentsong.name = a.room.metadata.current_song.metadata.song;
		core.currentsong.artist = a.room.metadata.current_song.metadata.artist;
		core.currentsong.genre = a.room.metadata.current_song.metadata.genre;
		core.currentsong.album = a.room.metadata.current_song.metadata.album;
		core.currentsong.id = a.room.metadata.current_song._id;
	};
	core.mods = a.room.metadata.moderator_id;
	Lonely();
};

global.RefreshUser = function(a, b) {
	a.name = b.name;
	a.laptop = b.laptop;
	if (!core.baduser) {
		a.afkTime = Date.now();
		a.afkWarned = false;
	};
	return a;
};

global.RefreshAfks = function() {
	for(var b in core.user) {
		var c = core.user[b];
		c.afk = Date.now();
	}
};

global.Register = function(x, y) {
	for(var i = 0; i < x.length; ++i) {
		var sUser = x[i];var sId = sUser.userid;
		if(config.bans.indexOf(sId) > -1) {
			bot.bootUser(sId, "You're banned from this room.");
			core.users.togreet.splice(core.users.togreet.indexOf(sId), 1);
		} else {
			botti.db.load("user", sUser);
		};
	};
};

global.CheckQueue = function () {
	for (var i = 0; i < config.qued.length; i++) {
		if (!core.user[config.qued[i]]) config.qued.splice(i, 1);
	};
};

global.Greet = function(a) {
	core.users.togreet = [];
	if (!config.greeting.on) return;
	var sD = [];var sV = [];var sS = [];var sM = [];
	for (var i=0;i<a.length;i++){
		var sUser = core.user[a[i]];
		if (!sUser || sUser.name.indexOf('ttdashboard') > -1) return;
		else if (sUser.greeting && config.netgreets) { Say(sUser.greeting, sUser.userid);Enter(sUser.userid); }
		else if(Is("vip", sUser.userid)) { sV.push(sUser.name);Enter(sUser.userid); }
		else if(Is("mod", sUser.userid)) { sM.push(sUser.name);Enter(sUser.userid); }
		else if(sUser.su) { sS.push(sUser.name);Enter(sUser.userid); }
		else { sD.push(sUser.name);Enter(sUser.userid) };
	};	
	if (sS.length > 0 && config.greeting.su) Say(config.greeting.su.replace('{usernames}', sS.join(', ')));
	if (sM.length > 0 && config.greeting.mod) Say(config.greeting.mod.replace('{usernames}', sM.join(', ')));
	if (sV.length > 0 && config.greeting.vip) Say(config.greeting.vip.replace('{usernames}', sV.join(', ')));
	if (sD.length > 0 && config.greeting.user) Say(config.greeting.user.replace('{usernames}', sD.join(', ')));
};

global.Enter = function(a) {
	if (!config.pm || !config.greeting.pm) return;
	var msg = Parse(config.greeting.pm, a);
	bot.pm(msg, a)
};

global.Loop = function() {
	CheckAFKs();
	CheckAutos();
	if(core.users.togreet.length) Greet(core.users.togreet);
	if(core.users.tosave.length) SaveUsers(core.users.tosave);
	if(core.saving) SaveSettings();
	config.lastseen = Date.now();
};

global.CheckAFKs = function() {
	for (var i=0;i<core.djs.length;i++){
		var sUser=core.user[core.djs[i]];
		if (!sUser || !config.afk.time || Is("bot", core.djs[i]) || Is("vip", core.djs[i])) return;
		var sAge = Date.now() - sUser.afk;
		var sAge_Minutes = sAge / 60000;
		if(sAge_Minutes >= config.afk.time) AfkBoot(sUser);
		if(!sUser.warned && sAge_Minutes >= (config.afk.time * (0.693148)) && config.afk.warn) {
			Say(config.on.afkwarn, sUser.userid);
			sUser.warned = true;
		}
	}
};

global.CheckAutos = function() {
	for (var i=0;i<core.users.auto.length;i++) {
		var sUser = core.user[core.users.auto[i]];
		if (!sUser) return;
		if (sUser.removed > 0) sUser.removed = 0;
	};
	core.users.auto = [];
};

global.AfkBoot = function(a) {
	bot.remDj(a.userid);
	Log(core.user[a.userid].name+" was escorted: afk")
	Say(config.on.afkboot, a.userid);
};

global.Save = function(x) {
	if (!x) return;
	if (x == "settings") return core.saving = true;
	if (core.users.tosave.indexOf(x.userid) == -1) core.users.tosave.push(x.userid);
};

global.SaveUsers = function(x) {
	core.users.tosave = [];
	for (var i=x.length-1;i>=0;i--){
		var y = core.user[x[i]];
		if (y) botti.db.save("user", y)
	};
};

global.SaveSettings = function(x,y) {
	core.saving = false;
	botti.db.save("settings");
};

global.Remove = function(a) {
	core.users.left[a] = setTimeout(function () {
		if(!core.users.left[a]) return;
		if (config.qued.indexOf(a) !== -1) config.qued.splice(config.qued.indexOf(a), 1);
		delete core.user[a];
		delete core.users.left[a];
	}, 1000 * 15);
};

global.Waited = function(a) {
	if (!a) return;
	if (!a.droppedRoom) return true;
	if (a.droppedRoom != config.room) return true;
	var s1 = Date.now() - a.dropped;
	var s2 = s1 / 60000;
	if(s2 >= (config.songs.wait * 3)) return true;
	return false;
};

global.UpdateIdle = function(a) {
	a.afk = Date.now();
	a.warned = false;
};

global.RefreshDJs = function() {
	bot.roomInfo(function (a) {
		core.djs = a.room.metadata.djs;
		setTimeout(function(){
			Lonely();
		}, 1000);		
	});
};

global.Lonely = function () {
	if (!config.lonely || config.qued.length) return;
	if(core.djs.length == 1 && core.djs.indexOf(config.uid) == -1) {
		bot.addDj();
		core.lonely = true;
	} else if((core.djs.length > 2 || core.djs.length == 1) && core.djs.indexOf(config.uid) != -1) {
		bot.remDj(); 
		core.lonely = false;
	}
};

global.GuaranteeQueue = function(a) {
	if (config.qued.length < 1) return true;
	if (config.qued.indexOf(a.userid) === -1 || config.qued[0] != a.userid) {
		var msg = config.on.queue.notnext.replace('{nextinqueue}', core.user[config.qued[0]].name);
		if (core.users.auto.indexOf(a.userid) == -1) Say(msg,a.userid);
		if (config.queue.enforce) {
			Log(core.user[a.userid].name+" was escorted: not next in queue");
			bot.remDj(a.userid);
			a.removed++;
			core.users.auto.push(a.userid);
			if (a.removed > 4 && a.userid != config.uid) {
				bot.bootUser(a.userid, "Suspected Auto DJ");
				Log(core.user[a.userid].name+" was booted: suspected auto dj");
			}
		}
		return false;
	}
	if (config.qued[0] == a.userid) {
		clearTimeout(core.qtimeout);
		core.qtimeout = null;
		config.qued.shift();
		return true;
	}
};

global.AdvanceQueue = function() {
	if (config.queue.on && config.qued.length > 0 && !core.qtimeout) {
		var msg = config.on.queue.next.replace('{queuetimeout}', config.queue.timeout);
		Say(msg, config.qued[0]);
		core.qtimeout = setTimeout(function(){
			config.qued.shift();
			core.qtimeout = null;
			AdvanceQueue();
		}, config.queue.timeout * 1000)
	}
};

global.HandlePM = function(a, b) {
	if (b == "/come") return Follow(a);
	HandleCommand(a, b, true);
};

global.HandleCommand = function (d, c, f, z) {
	if(!core.booted) return Log("Not booted, can't do commands");
	var sMatch = c.match(/^[!\*\/]/);
	if(!sMatch && core.cmds.bare.indexOf(c) === -1) return Log("Can't find the command");
	var sSplit = c.split(' ');
	var sCommand = sSplit.shift().replace(/^[!\*\/]/, "").toLowerCase();   
	if (!core.user[d]) return Log("Not a user");
	c = sSplit.join(' ');
	var sCommands = commands.filter(function (b) {
		return(b.command && b.command == sCommand) || (typeof (b.command) == "object" && b.command.length && b.command.indexOf(sCommand) != -1);
	});
	if (sCommands.length < 1) HandleAlias(d, sCommand, f);
	if(!config.setup) return Say("I haven't been set up yet! Type /install to get started!", d, f);
	sCommands.forEach(function (b) {
		if (GetLevel(core.user[d]) < b.level && !(z && b.command == 'say')) return Log("Not high enough level to use")
		if(c == 'hint' || c == 'help') return Say("/"+b.command+": "+b.hint, d);
		b.callback(d, c, f);
		if (core.user[d]) {
			core.lastcmd = core.user[d].name+": /"+b.command+" "+c;
			Log(core.lastcmd);
		}
	});
};

global.Follow = function(a) {
	if (config.owns.indexOf(a) == -1) return;
	bot.stalk( a , function(b) {
		bot.roomRegister(b.roomId);
	});
	Log("Used /come to register in "+b.roomId);
};

global.AddSong = function(a) {
	++a.count;
	++a.songs;
	Save(a);
	Log(a.name + "'s song count: " + a.count + " total of: " + a.songs);
};

global.OverMaxSongs = function (a) {
	Say(config.on.maxwarn, a.userid);
	Log(core.user[a.userid].name+" hit song limit");
	setTimeout(function (){
		a.dropped = Date.now();
		a.droppedRoom = config.room;
		if (config.songs.waits) a.waiting = config.songs.wait;
		if(!Is("dj", a.userid)) return;
		bot.remDj(a.userid);
		Say(config.on.overmax, a.userid);
		Log(core.user[a.userid].name+" was escorted: over song limit")
	}, 60000);            
};

global.RemoveDJ = function(a) {
	if (GetLevel(a) > 3 && !a.boot) return;
	Log(core.user[a.userid].name+" was removed");
	a.boot = false;
	core.djs.splice(core.djs.indexOf(a.userid), 1);
	a.dropped = Date.now();
	a.droppedRoom = config.room;
	bot.remDj(a.userid);
};

global.Ban = function(a) {
	if (GetLevel(a) > 2) return;
	if (config.bans.indexOf(a.userid) === -1) config.bans.push(a.userid);
	bot.bootUser(a.userid, config.on.banned);
	Say(config.on.ban, a.userid);
	Log(core.user[a.userid].name+" was banned")
	Save("settings");
};

global.Vip = function(a) {
	if (config.vips.indexOf(a.userid) === -1) config.vips.push(a.userid);
	Say(config.on.addvip, a.userid);
	Save("settings");
};

global.Whitelist = function(a) {
	if (config.list.indexOf(a.userid) === -1) config.list.push(a.userid);
	Say(msg.whitelist.add, a.userid);
	Save("settings");
};

global.Promote = function(a) {
	if (config.owns.indexOf(a.userid) === -1) config.owns.push(a.userid);
	Say(msg.owner.add, a.userid);
	Save("settings");
};

global.Homeward = function () {
	return bot.roomRegister(config.room);
};

global.GotHeart = function (a) {
	++a.hearts;
	Save(a);
	Log(a.name + "'s heart count: " + a.hearts);
};

global.GaveHeart = function (a) {
	++a.given;
	Save(a);
	Log(a.name + "'s hearts given count: " + a.given);
};

global.Is = function(a, b) {
	if (a == 'bot' && b == config.uid) return true;
	if (a == 'vip' && config.vips.indexOf(b) !== -1) return true;
	if (a == 'own' && config.owns.indexOf(b) !== -1) return true;
	if (a == 'mod' && core.mods.indexOf(b) !== -1) return true;
	if (a == 'dj' && core.djs.indexOf(b) !== -1) return true;
	return false;
};

global.GetLevel = function(b) {
	if (!b || !b.userid) return -1;
	var c = b.userid;
	if (c == config.uid) return 6;
	if (config.owns.indexOf(c) !== -1) return 5;
	if (b.su) return 4;
	if (core.mods.indexOf(c) !== -1) return 3;
	if (config.vips.indexOf(c) !== -1) return 2;
	if (core.djs.indexOf(c) !== -1) return 1;
	return 0;
};

global.Parse = function(a,b) {
	if (core.user[b]) a = a.replace("{username}", core.user[b].name);
	if (core.user[b]) a = a.replace("{userid}", core.user[b].userid);
	a = a.replace("{room}", core.roomname)
	.replace("{theme}", config.theme)
	.replace('{limits}', LightSwitch(config.songs.on))
	.replace('{limit}', LightSwitch(config.songs.on))
	.replace('{songlimit}', LightSwitch(config.songs.on))
	.replace('{maxsongs}', config.songs.max)
	.replace('{waitsongs}', config.songs.wait)
	.replace('{songwait}', config.songs.wait)
	.replace('{queueon}', LightSwitch(config.queue.on))
	.replace('{lonely}', LightSwitch(config.lonely))
	.replace('{queue}', LightSwitch(config.queue.on))
	.replace('{afk}', config.afk.time)
	.replace('{warn}', LightSwitch(config.afk.warn))
	.replace('{greeting}', config.greeting.user)
	.replace('{help}', config.help)
	.replace('{songtitle}', core.currentsong.name)
	.replace('{up}', core.currentsong.up)
	.replace('{down}', core.currentsong.down)
	.replace('{heartcount}', core.currentsong.heart);
	var c = a.match(/\{user\.[^}]*\}/gi);
	if(c) for(var i = 0; i < c.length; ++i) {
		var sVar = c[i];
		var sUserVar = sVar.split('.')[1];
		sUserVar = sUserVar.substring(0, sUserVar.length - 1);
		if(core.user[b][sUserVar] != null) a = a.replace(sVar, core.user[b][sUserVar]);
	}
	return a;
};

global.CanPM = function(a) {
	if (!a || !core.user[a]) return false;
	var lap = core.user[a].laptop;
	if (lap == "android" || !bot.pm) return false;
	return true;
};

global.Say = function(a, b, c, d) {
	if (!a) return;
	if (!config.chat && !config.pm && b) bot.pm("Please notify a mod I can't talk right now. They can fix this with /turn [chat/pm] on.", b);
	a = Parse(a, b);
	if (!config.chat && !b) return bot.speak(a);
	if ((c && CanPM(b)) || !config.chat) return bot.pm(a, b);
	bot.speak(a);
};

global.Find = function(a) {
	var y = a;
	a = EscapeString(a).replace("@", "^").trimRight() + "$";
	var z = false;
	var sUserIDs = botti._.keys(core.user);
	sUserIDs.splice(0, 1);
	for(var i = 0; i < sUserIDs.length; ++i) {
		var sUserID = sUserIDs[i];
		if(core.user[sUserID].name.match(a)) {
			z = core.user[sUserID];
		}
	}
	if (!z) return BadUser(y);
	return z;
};

global.BadUser = function(z) {
	core.baduser = true;
	Say("Couldn't find: "+z+", Please Try Again.");
	core.user = {};
	bot.roomInfo(function (a) {
		Register(a.users);
		setTimeout(function () {
			core.baduser = false;
		}, 3000);
	});
};

global.Kick = function(a) {
	if (GetLevel(a) < 4) bot.bootUser(a.userid, "BootUser");
};

global.Random = function (a) {
	return a[Math.floor(Math.random() * a.length)];
};

global.EscapeString = function (text) {
	return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

global.Shuffle = function(v){
	for(var j, x, i = v.length; i; j = parseInt(Math.random() * i), x = v[--i], v[i] = v[j], v[j] = x);
	return v;
};

global.Round = function (num, dec) {
	var result = Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
	return result;
};

global.LightSwitch = function(a) {
	var b;
	if(a){ b = 'On'; }
	else { b = 'Off'; }
	return b;
};

global.StripTags = function (input, allowed) {
	allowed = (((allowed || "") + "").toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join(''); // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
	var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
	  commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
	return input.replace(commentsAndPhpTags, '').replace(tags, function ($0, $1) {
	  return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
	});
};