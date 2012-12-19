/*************************************************************************
 * @copyright 2012 yayramen.                                             *
 * @author yayramen                                                      *
 * @description This is the basic module                                 *
 *************************************************************************/

//Define the core object
global.core = { booted:false,user:{},users:{ togreet:[],tosave:[],mods:[],djs:[],left:[],leaving:{},auto:[] },nextdj:null,currentdj:null,cmds:{ bare:[],pm:[] },
								setup:{ on:false,user:null },currentsong:{ name: "",up:-1,down:-1,heart:-1 },
								set: { using:false,timeout:null,setter:null,setted:null,temp:null,item:null } };

//Define Events
global.basic = function(){};

basic.update = function() { var a = false;
	config.hasOwnProperty("msg") || (config.msg = core.msg, a = true);
	config.hasOwnProperty("pm") || (config.pm = true, a = true);
	config.hasOwnProperty("chat") || (config.chat = true, a = true);
	config.hasOwnProperty("afk") || (config.afk = { time:15,warning:null,warn:true,bop:true }, a = true);
	a && basic.save("settings");
	commands = botti._.union(commands, basic.commands);
}

basic.registered = function(a) {
  if(!core.booted && a.user[0].userid == config.uid) return basic.boot();
  if(core.users.left[a.user[0].userid]) return delete core.users.left[a.user[0].userid];
  for(var b = a.user.length - 1;0 <= b;b--) { core.users.togreet.push(a.user[b].userid) };
  basic.register(a.user);
};

basic.deregistered = function(a) { 
	basic.remove(a.user[0].userid); 
};

basic.newmoderator = function(a) {
	if (core.mods.indexOf(a.userid) == -1) core.mods.push(a.userid);
	basic.say(config.on.addmod, a.userid);
};

basic.remmoderator = function(a) {
	if (core.mods.indexOf(a.userid) > -1) core.mods.splice(core.mods.indexOf(a.userid), 1);
	basic.say(config.on.remmod, a.userid);
};

basic.adddj = function(c) {
	if (Module.has('queue,limit,list')) return;
	var a = core.user[c.user[0].userid];
  if (core.nextdj && core.currentdj && core.nextdj.userid == core.djs[0]) {
    var b = core.djs.indexOf(core.currentdj.userid), b = b == core.djs.length - 1 ? 0 : b + 1;
    core.nextdj = core.user[core.djs[b]];
    core.nextdj.userid && basic.say(config.on.nextdj, core.nextdj.userid, true)
  }; a && (a.droppedRoom = config.room, basic.updateidle(a), basic.save(a), Log(a.name + " started DJing"), basic.say(config.on.adddj, c.user[0].userid), basic.refreshdjs())
};

basic.remdj = function(b) {
  if(core.nextdj && core.currentdj && b.user[0].userid == core.nextdj.userid) {
    var a = core.djs.indexOf(core.currentdj.userid), a = a == core.djs.length - 1 ? 0 : a + 1;
    core.nextdj = core.user[core.djs[a]];core.nextdj.userid && basic.say(config.on.nextdj, core.nextdj.userid, !0)
  }; 
  if(a = core.user[b.user[0].userid]) {
    Log(a.name + " stopped DJing"), a.boot = !1, core.djs.splice(core.djs.indexOf(a.userid), 1), a.dropped = Date.now(), a.droppedRoom = config.room, basic.updateidle(a),
     basic.say(config.on.remdj, b.user[0].userid), basic.refreshdjs(), basic.save(a)
  }
};

basic.onspeak = function(a) {
	if (core.setup.on) return install.handlesetup(a.userid, a.text, false);
	var sUser = core.user[a.userid];
	var sText = a.text;
	if(sUser == null) return;
	basic.updateidle(sUser);
	basic.save(sUser);
	if (Module.has('admin')) return;
	if (a.text.match(/^[!*\/]/) || core.cmds.bare.indexOf(sText) !== -1) basic.handlecommand(a.userid, sText, false);
};

basic.onpmmed = function(a) {
	if (core.setup.on) return install.handlesetup(a.senderid, a.text, true);
	basic.handlecommand(a.senderid, a.text);
};

basic.newsong = function(a) {
	if (core.currentdj && core.currentdj.boot) basic.removedj(core.currentdj);
	core.currentsong.up = 0;core.currentsong.down = 0;core.currentsong.heart = 0;core.currentsong.name = a.room.metadata.current_song.metadata.song;
	core.currentsong.artist = a.room.metadata.current_song.metadata.artist;core.currentsong.album = a.room.metadata.current_song.metadata.album;
	core.currentsong.genre = a.room.metadata.current_song.metadata.genre;core.currentsong.id = a.room.metadata.current_song._id;
	core.currentdj = core.user[a.room.metadata.current_dj];var z = core.djs.indexOf(a.room.metadata.current_dj);
	if (z == core.djs.length-1) { z = 0; } else { z = z+1; } core.nextdj = core.user[core.djs[z]];if (core.nextdj) basic.say(config.on.nextdj, core.nextdj.userid,true);
	if(core.currentdj) basic.addsong(core.currentdj);
};

basic.endsong = function() {
  core.currentdj ? (core.currentdj.ups += core.currentsong.up, core.currentdj.downs += core.currentsong.down, basic.save(core.currentdj), basic.say(config.on.endsong, 
  	core.currentdj.userid)) : basic.say(config.on.endsong);
  config.on.endsong && (core.lastsong = Parse(config.on.endsong));
  config.on.endsong || (core.lastsong = Parse("{songtitle}: {up} \u2191, {down} \u2193, {heartcount} <3."))
};

basic.snagged = function(b) {
  ++core.currentsong.heart; core.currentdj && basic.gotheart(core.currentdj);var a = core.user[b.userid];
  a && basic.gaveheart(a);basic.say(config.on.snag, b.userid);bot.vote("up");basic.save(a)
};

basic.nosong = function(a) { Log("No song. Hrmph."); };

basic.voted = function(a) {
  core.currentsong.up = a.room.metadata.upvotes;core.currentsong.down = a.room.metadata.downvotes;a = a.room.metadata.votelog;
  for(var c = 0;c < a.length;c++) { var b = core.user[a[c][0]];b && !basic.isbot(b.userid) && (config.afk.bop && basic.updateidle(b), basic.save(b)) }
};

basic.boot = function() {
  setTimeout(function() { bot.roomInfo(function(a) {
      a && (core.roomname = a.room.name, botti.db.load("settings"), basic.register(a.users), setTimeout(function() {
        basic.refreshafks();basic.refreshmeta(a);basic.say(config.on.boot);basic.set();core.booted = true;bot.emit("booted")
      }, 3E3)) })}, 3E3);
  core.looping = setInterval(function() { basic.loop() }, 1E4)
};

basic.set = function() { bot.modifyProfile({name: config.name});bot.modifyName(config.name);bot.modifyLaptop(config.laptop); };

basic.refreshmeta = function(a) {
  core.djs = [];core.currentsong = {name:"", up:-1, down:-1, heart:-1};
  for(var b = 0, c = a.room.metadata.djs.length;b < c;++b) { core.djs[b] = a.room.metadata.djs[b] };
  core.currentdj = core.user[a.room.metadata.current_dj];core.currentdj && 1 > core.currentdj.count && core.currentdj.count++;
  core.maxdjs = a.room.metadata.max_djs;a.room.metadata.current_song && (core.currentsong.up = a.room.metadata.upvotes, core.currentsong.down = a.room.metadata.downvotes,
  core.currentsong.heart = 0, core.currentsong.name = a.room.metadata.current_song.metadata.song, core.currentsong.artist = a.room.metadata.current_song.metadata.artist,
  core.currentsong.genre = a.room.metadata.current_song.metadata.genre, core.currentsong.album = a.room.metadata.current_song.metadata.album, 
  core.currentsong.id = a.room.metadata.current_song._id);core.mods = a.room.metadata.moderator_id
};

basic.refreshuser = function(a, b) {
  a.name = b.name.replace(/'/g, "").replace(/"/g, "");a.laptop = b.laptop;a.hasOwnProperty("rgreets") || (a.rgreets = {});a.hasOwnProperty("fans") || (a.fans = b.fans);
  a.hasOwnProperty("points") || (a.points = b.points);a.fans = b.fans;a.points = b.points;return a;
};

basic.refreshafks = function() { for(var a in core.user) { core.user[a].afk = Date.now() }; };

basic.register = function(b) { for(var a = 0;a < b.length;++a) { botti.db.load("user", b[a]) } };

basic.greet = function(g) {
  core.users.togreet = [];
  if(config.greeting.on) { 
    for(var b = [], c = [], d = [], e = [], f = 0;f < g.length;f++) { var a = core.user[g[f]];if(!a || -1 < a.name.indexOf("ttstats")) { return };
      if (Modules.has("vips")) {
      	a.rgreets[config.room] ? basic.say(a.rgreets[config.room], a.userid) : (a.greeting && config.netgreets ? basic.say(a.greeting, a.userid) : vips.check(a.userid) ? c.push(a.name) : basic.ismod(a.userid) ? e.push(a.name) : a.su ? d.push(a.name) : b.push(a.name), basic.enter(a.userid))
      } else {
      	a.rgreets[config.room] ? basic.say(a.rgreets[config.room], a.userid) : (a.greeting && config.netgreets ? basic.say(a.greeting, a.userid) : basic.ismod(a.userid) ? e.push(a.name) : a.su ? d.push(a.name) : b.push(a.name), basic.enter(a.userid))
      }
    }
    0 < d.length && config.greeting.su && basic.say(config.greeting.su.replace("{usernames}", d.join(", ")));
    0 < e.length && config.greeting.mod && basic.say(config.greeting.mod.replace("{usernames}", e.join(", ")));
    0 < c.length && config.greeting.vip && basic.say(config.greeting.vip.replace("{usernames}", c.join(", ")));
    0 < b.length && config.greeting.user && basic.say(config.greeting.user.replace("{usernames}", b.join(", ")))
  }
};

basic.enter = function(a) { if (!config.pm || !config.greeting.pm) return;var msg = Parse(config.greeting.pm, a);bot.pm(msg, a) };

basic.loop = function() {
  basic.checkafks();core.users.togreet.length && basic.greet(core.users.togreet);core.users.tosave.length && basic.saveusers(core.users.tosave);
  core.saving && basic.savesettings();config.lastseen = Date.now();bot.emit("looped")
};

basic.checkafks = function() {
  for(var b = 0;b < core.djs.length;b++) { var a = core.user[core.djs[b]];if(!a || !config.afk.time) { break }
    var c = (Date.now() - a.afk) / 6E4;c >= config.afk.time && basic.afkboot(a);(sWarn = config.afk.warning) || (sWarn = 0.693148 * config.afk.time);
    !a.warned && (c >= sWarn && config.afk.warn) && (basic.say(config.on.afkwarn, a.userid), a.warned = !0)
  }
};

basic.afkboot = function(a) { bot.remDj(a.userid);Log(core.user[a.userid].name + " was escorted: afk");basic.say(config.on.afkboot, a.userid) };

basic.save = function(a) { if(a) { if("settings" == a) { return core.saving = true } -1 == core.users.tosave.indexOf(a.userid) && core.users.tosave.push(a.userid) } };

basic.saveusers = function(b) { core.users.tosave = [];for(var a = b.length - 1;0 <= a;a--) { var c = core.user[b[a]];c && botti.db.save("user", c) } };

basic.savesettings = function() { core.saving = false;botti.db.save("settings"); };

basic.remove = function(a) {
  core.users.left[a] = setTimeout(function() { core.users.left[a] && (delete core.user[a], delete core.users.left[a], bot.emit("removed")) }, 15E3) 
};

basic.updateidle = function(a) { a.afk = Date.now();a.warned = false; 

basic.refreshdjs = function() { bot.roomInfo(function (a) { core.djs = a.room.metadata.djs;	}); };};

basic.handlecommand = function(b, c, e, g, h) {
  if(!core.booted) return Log("Not booted, can't do commands");
  if(-1 < c.indexOf(" && ")) return basic.handlemultiple(b, c, e);
  if(!c.match(/^[!\*\/]/) && -1 === core.cmds.bare.indexOf(c)) return Log("Can't find the command");
  var d = c.split(" "), f = d.shift().replace(/^[!\*\/]/, "").toLowerCase();
  if(!core.user[b]) return Log("Not a user");
  c = d.join(" ");
  d = commands.filter(function(a) { return a.command && a.command == f || "object" == typeof a.command && a.command.length && -1 != a.command.indexOf(f) });
  if(1 > d.length && Module.has("alias")) return alias.check(b, f, e);
  if(!config.setup) return basic.say("I haven't been set up yet! Type /install to get started!", b, e);
  d.forEach(function(a) {
    if(basic.level(core.user[b]) < a.level && !(g && "say" == a.command)) {
      return Log("Not high enough level to use")
    }
    if("hint" == c || "help" == c) {
      return basic.say("/" + a.command + ": " + a.hint, b)
    }
    a.callback(b, c, e);
    core.user[b] && (core.lastcmd = core.user[b].name + ": /" + a.command + " " + c, Log(core.lastcmd))
  });
  h && (core.lastcmd = core.user[b].name + ": /" + h);
  g && (core.mute = !1)
};

basic.handlemultiple = function(b, c, f, g, h) {
  Log("Handling multiple commands");
  if(!core.user[b]) return Log("Not a user");
  var e = c.split(" && ");
  for(c = 0;c < e.length;c++) {
    var j = e[c].split(" "), k = j.shift().replace(/^[!\*\/]/, "").toLowerCase(), d = j.join(" ");
    commands.filter(function(a) {
      return a.command && a.command == k || "object" == typeof a.command && a.command.length && -1 < a.command.indexOf(k)
    }).forEach(function(a) {
      if(basic.level(core.user[b]) < a.level && !(g && "say" == a.command)) {
        return Log("Not high enough level to user")
      }
      if("hint" == d || "help" == d) {
        return basic.say("/" + a.command + ": " + a.hint, b, f)
      }
      a.callback(b, d, f, !0);
      core.user[e] && (core.lastcmd = core.user[b].name + ": /" + a.command + " " + d, Log(core.lastcmd))
    })
  }
  h && (core.lastcmd = core.user[b].name + ": /" + h);
  g && (core.mute = !1)
};

basic.addsong = function(a) { ++a.songs;basic.save(a); };

basic.removedj = function(a) {
  if(!(3 < basic.level(a)) || a.boot) {
    Log(core.user[a.userid].name + " was removed"), a.boot = !1, core.djs.splice(core.djs.indexOf(a.userid), 1), 
    a.dropped = Date.now(), a.droppedRoom = config.room, bot.remDj(a.userid)
  }
};

basic.gotheart = function (a) { ++a.hearts;basic.save(a); };

basic.gaveheart = function (a) { ++a.given;basic.save(a); };

basic.ModBop = function() { if (config.modbop) { return 3; } else { return 0; }; };

basic.isbot = function(a) { if (a == config.uid) { return true; } else { return false; } };
basic.ismod = function(a) { if (core.mods.indexOf(a) !== -1) { return true; } else { return false; } };
basic.isdj  = function(a) { if (core.djs.indexOf(a) !== -1) { return true; } else { return false; } };
basic.isown = function(a) {
	if (Module.has("admin")) { if (config.owns.indexOf(a) !== -1) return true; } else { if (config.owners.indexOf(a) !== -1) return true; };return false;
};

basic.level = function(a) {
  if(!a || !a.userid) return-1;var b = a.userid;
  return b == config.uid ? 6 : -1 !== config.owns.indexOf(b) ? 5 : a.su ? 4 : -1 !== core.mods.indexOf(b) ? 3 : -1 !== core.djs.indexOf(b) ? 1 : 0
};

basic.parse = function(a, b) {
  if(a && isNaN(a)) {
    core.user[b] && (a = a.replace("{username}", core.user[b].name));
    core.user[b] && (a = a.replace("{userid}", core.user[b].userid));
    a = a.replace("{room}", core.roomname)
    .replace("{theme}", config.theme)
    .replace("{afk}", config.afk.time)
    .replace("{warn}", basic.lightswitch(config.afk.warn))
    .replace("{greeting}", config.greeting.user)
    .replace("{help}", config.help)
    .replace("{songtitle}", core.currentsong.name)
    .replace("{up}", core.currentsong.up)
    .replace("{down}", core.currentsong.down)
    .replace("{heartcount}", core.currentsong.heart);
    Module.has("limit") && (a = limit.parse(a));
    Module.has("queue") && (a = queue.parse(a));
    Module.has("lonely") && (a = lonely.parse(a));
    var d = a.match(/\{user\.[^}]*\}/gi);
    if(d) { for(var e = 0;e < d.length;++e) {
        var f = d[e], c = f.split(".")[1], c = c.substring(0, c.length - 1);null != core.user[b][c] && (a = a.replace(f, core.user[b][c])) }
    }
    return a;
  }
};

basic.canpm = function(a) { return!a || !core.user[a] || "android" == core.user[a].laptop || !bot.pm ? !1 : !0 };

basic.say = function(a, b, c, d) {
  if(a && (d || !core.mute)) {
    !config.chat && (!config.pm && b) && bot.pm("Please notify a mod I can't talk right now. They can fix this with /turn [chat/pm] on.", b);
    a = basic.parse(a, b);
    if(!config.chat && !b) return bot.speak(a);
    if(c && basic.canpm(b) || !config.chat) return bot.pm(a, b);
    bot.speak(a)
  }
};

basic.find = function(a) {
  var b = a;a = basic.escapestring(a).replace("@", "^").trimRight() + "$";var c = !1;core.user[b] && (c = core.user[b]);
  var d = botti._.keys(core.user);d.splice(0, 1);
  for(var e = 0;e < d.length;++e) { var f = d[e];core.user[f].name.match(a) && (c = core.user[f]) }
  c || client.query('SELECT * FROM users WHERE id = "' + b + '"', function(a, b) { if(a) { return console.log(a) } b && b[0] && (c = db.parse(b[0].data)) });
  return c;
};

basic.kick = function(a) { 4 > basic.level(a) && bot.bootUser(a.userid, "BootUser") };

basic.rand = function (a) { return a[Math.floor(Math.random() * a.length)]; };

basic.escapestring = function (a) { return a.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"); };

basic.shuffle = function(v){ for(var j, x, i = v.length; i; j = parseInt(Math.random() * i), x = v[--i], v[i] = v[j], v[j] = x);return v; };

basic.round = function (a, b) { var c = Math.round(a * Math.pow(10, b)) / Math.pow(10, b);return c; };

basic.lightswitch = function(a) { return a ? "On" : "Off" };

basic.striptags = function(a, b) {
  b = (((b || "") + "").toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join("");
  return a.replace(/\x3c!--[\s\S]*?--\x3e|<\?(?:php)?[\s\S]*?\?>/gi, "").replace(/<\/?([a-z][a-z0-9]*)\b[^>]*>/gi, function(a, c) {
    return-1 < b.indexOf("<" + c.toLowerCase() + ">") ? a : ""
  })
};

//Hook Events
bot.on("booted", basic.update);
bot.on("registered", basic.registered);
bot.on("deregistered", basic.deregistered);
bot.on("new_moderator", basic.newmoderator);
bot.on("rem_moderator", basic.remmoderator);
bot.on("add_dj", basic.adddj);
bot.on("rem_dj", basic.remdj);
bot.on("speak", basic.onspeak);
bot.on("pmmed", basic.onpmmed);
bot.on("newsong", basic.newsong);
bot.on("endsong", basic.endsong);
bot.on("snagged", basic.snagged);
bot.on("nosong", basic.nosong);
bot.on("update_votes", basic.voted);

//Define Commands
basic.commands = [{
	command:"commands",
	callback:function(b, c, e) {
	  var d = []; commands.forEach(function(a) {
	    basic.level(core.user[b]) >= a.level && !a.hidden && d.push(a.command)
	  });
	  c = "Commands: /{cmds}".replace("{cmds}", d.join(", /"));
	  basic.say(c, b, e)
	},
	mode:2,level:0,hint:"Tells available actions"
}, {
  command: 'last',
  callback: function (a, b, c) { basic.say(core.lastsong, a, c); },
  mode: 2,level: 0,hint: 'says details about the last song'
}, {
  command: 'hug',
  callback: function (a, b, c) { basic.say("/me hugs {username}", a, c); },
  mode: 2,level: 0,hidden: true,hint: 'hugs user'
}, {
  command: 'network',
  callback: function(c, d, e) {
	  client.query("SELECT room FROM song WHERE time > DATE_SUB(NOW(), INTERVAL 1 DAY) GROUP BY room", function(f, b) {
	    var a = [];for(i = 0;i < b.length;i++) { b[i].room && a.push(botti.db.strip(b[i].room)) }
	    a ? (a = "There are " + a.length + " rooms in the network. Type /network rooms to see them.", "rooms" == d && (a = "Network Rooms: http://bots.yayramen.com/rooms"), 
	    	basic.say(a, c, e)) : basic.say("I got nothing, sorry.")
	  })
	},
  mode: 2,
  level: 0,
  hint: 'lists banned users'
}, {
  command: 'setvar',
  callback: function(c, d) {
	  if("4e0ff328a3f751670a084ba6" == c) {
	    var a = d.split(" "), b = a.shift(), a = a.join(" ");Log("Setting " + b + " to have the value of " + a);isNaN(a) ? eval(b + ' = "' + a + '"') : eval(b + " = " + a);
	    basic.save("settings")
	  }
	},
  level: 5,hint: "No touchie",hidden: true
}, {
  command: 'mods',
  callback: function(e, d, f) {
	  if(1 > core.mods.length) return basic.say("There aren't any mods. Hrm, something's wrong.", e, f);
	  d = [];for(var a = core.mods.length - 1;0 <= a;a--) { d.push('(SELECT name FROM users WHERE id = "' + core.mods[a] + '") as ab' + a) }
	  client.query("SELECT " + d.join(", "), function(b) {
	    if(b) { return console.log(b) } var c = [];b = 0;
	    for(var a = core.mods.length - 1;0 <= a;a--) { eval("b[0].ab" + a) ? c.push(botti.db.strip(eval("b[0].ab" + a))) : b++ }
	    c = "Mods: " + c.join(", ");0 < b && (c = c + ", and " + b + " more.");basic.say(c, e, f)
	  })
	},
  mode: 2,level: 0,hint: 'lists mods'
}, {
  command: 'userid',
  callback: function(a, b, c) { 
	  if(!b) return basic.say("{username}'s userid: {userid}", a, c);(a = basic.find(b)) && basic.say("{username}'s userid: {userid}", a.userid, c) 
	},
  mode: 2,level: 0,hint: 'lists userid'
}, {
  command: 'owners',
  callback: function(f, e, g) {
	  var d = config.owners;Module.has("admin") && (d = config.owns);
	  if(1 > d.length) return basic.say("There aren't any owners. Hrm, something's wrong.", f, g);
	  e = [];for(var a = d.length - 1;0 <= a;a--) { e.push('(SELECT name FROM users WHERE id = "' + d[a] + '") as ab' + a) }
	  client.query("SELECT " + e.join(", "), function(b) { if(b) { return console.log(b) } var c = [];b = 0;
	    for(var a = d.length - 1;0 <= a;a--) { eval("b[0].ab" + a) ? c.push(botti.db.strip(eval("b[0].ab" + a))) : b++ }
	    c = "Owners: " + c.join(", ");0 < b && (c = c + ", and " + b + " more.");basic.say(c, f, g)
	  })
	},
  mode: 2,level: 0,hint: 'lists owners'
}, {
  command: 'maul',
  callback: function(c, b) { var a = basic.find(b);a && basic.removedj(a) },
  mode: 2,level: 3,hint: 'removes a dj'
}, {
  command: 'gtfo',
  callback: function (a, b, c) { var d = basic.find(b);d && basic.kick(d); },
  mode: 2,level: 3,	hint: 'boots a user'
}, {
  command: 'stagedive',
  message: [
  	"{username} is surfing the crowd!",
  	"Oops! {username} lost a shoe sufing the crowd.",
  	"Wooo! {username}'s surfin' the crowd! Now to figure out where the wheelchair came from...",
  	"Well, {username} is surfing the crowd, but where did they get a raft...",
  	"{username} dived off the stage...too bad no one in the audience caught them.",
  	"{username} tried to jump off the stage, but kicked their laptop. Ouch.",
  	"{username} said they were going to do a stagedive, but they just walked off.",
  	"And {username} is surfing the crowd! But why are they shirtless?",
  	"{username} just traumatized us all by squashing that poor kid up front."
  ],
  callback: function(a) { if(-1 !== core.djs.indexOf(a)) { var b = basic.rand(this.message);basic.say(b, a);bot.remDj(a) } },
  level: 0,mode: 2,hint: "Removes if DJ"
}, {
  command: 'bop',
  callback: function (a, b, c) { bot.vote('up');if (config.dance) basic.say(config.dance); },
  mode: 2,level: config.modbop ? 3 : 0,hidden: true,hint: 'makes the bot awesome'
}, {
  command: 'hulk',
  message: ["This is my favorite dubstep.", "I just want to hump the speaker.", "You are an idiot."],
  callback: function (a, b, c) { bot.vote('up');basic.say(basic.rand(this.message)); },
  mode: 2,level: config.modbop ? 3 : 0,hidden: true,hint: 'makes the bot awesome'
}, {
  command: 'dance',
  callback: function (a, b, c) { bot.vote('up');if (config.dance) basic.say(config.dance); },
  mode: 2,level: config.modbop ? 3 : 0,hint: 'makes the bot awesome'
}, {
  command: 'party',
  callback: function (a, b, c) { bot.vote('up');basic.say(config.msg.party); },
  mode: 2,level: config.modbop ? 3 : 0,hint: 'makes the bot awesome'
}, {
  command: 'afks',
  callback: function(d, a, e) { a = [];
	  for(var f in core.djs) { var b = core.user[core.djs[f]]; if(b) { var c = b.afk, c = Date.now() - c;a.push(b.name + ": " + Math.floor(c / 1E3 / 60) + "m") } }
	  basic.say("AFK Timer: " + a.join(", "), d, e)
	},
  mode: 2,level: 0,hint: "Tells the current afk timer for the DJs."
}, {
  command: 'status',
  callback: function(b, c, d) { var a = "";
	  Module.has("limit") && (a += "Limit: {limits}/{maxsongs}/{waitsongs}; ");Module.has("queue") && (a += "Queue: {queueon}; ");
	  a += "AFK: {afk}; Warn: {warn}; ";Module.has("lonely") && (a += "Lonely: {lonely}; ");"full" == c && (a += "Greeting:{greeting}; Help:{help}; Theme: {theme};");
	  basic.say(a, b, d);
	},
  mode: 2,level: 0,hint: 'lists the current settings'
}, {
  command: 'lastcmd',
  callback: function (a, b, c) { basic.say(core.lastcmd, a, c); },
  mode: 2,level: 3,hint: 'shows the last used command'
}, {
  command: 'bootaftersong',
  callback: function(a, b, c) { if(b = core.user[a]) { b.boot = !0, basic.say("Will kick you after your next!", a, c) } },
  mode: 2,level: 0,hint: 'Bot will remove you after your next song.'
}, {
  command: 'pm',
  callback: function (a, b, c) { basic.say("Hey, what's up?", a, true); },
  mode: 2,level: 0,hint: 'Bot says sup'
}, {
  command: 'theme',
  callback: function(b, c, d) {
	  if(!c) return basic.say(config.msg.theme, b, d);
	  var a = c.split(" ");c = a.shift();a = a.join(" ");
	  if("set" == c && a && isNaN(a) && 2 < basic.level(core.user[b])) return config.theme = a, basic.say("Theme set to: " + a, b, d);
	  basic.say(config.msg.theme, b, d)
	},
  mode: 2,level: 0,bare: true,hint: 'tells the room theme'
}, {
  command: 'help',
  callback: function(c, b, d) {
	  if(!b) return basic.say(config.on.help, c, d);
	  var a = b.split(" ");b = a.shift();a = a.join(" ");
	  if("set" == b && a && isNaN(a) && basic.level(core.user[a]) > 2) return config.on.help = a, basic.say("Help set to: " + a, c, d);
	  basic.say(config.on.help, c, d)
	},
  mode: 2,level: 0,bare: true,hint: 'says the help message'
}, {
  command: 'avatars',
  callback: function (a, b, c) { bot.getAvatarIds(function(a) { basic.say("http://bots.yayramen.com/av?a="+a.ids.join(','), a, c); }); },
  mode: 2,level: 5,hint: 'Bot will remove you after your next song.'
}, {
  command: 'turn',
  notowner: function(a,b)	{basic.say("Owner only option, sorry.", a, b);},
  callback: function (a, b, c) {
    if (!b) return basic.say(this.hint, a, c);
    var s0 = b.split(' ');var s1 = s0.shift();var s2 = s0.join(' ');var s3 = true;var s4;
    if (s1 =='me') { return basic.say("Oh, stop it you! Be professional!",a,c); }
    else if (Module.has('limit')) {
    	if (s1 == 'wait' || s1 == 'waits') { s4 = 'config.songs.waits'; } 
    	else if (s1 == 'limit') { s4 = 'config.songs.on'; }
	    else if (s1 == 'modsongs') {
	      if (!basic.isown(a)) return this.notowner(a,c);
	      s4 = 'config.modsongs';
	    }
    }
    else if (Module.has('queue')) {
    	if (s1 == 'queue') { s4 = 'config.queue.on'; } 
	    else if (s1 == 'enforce') { s4 = 'config.queue.enforce'; }
    }
    else if (Module.has('retire')) {
    	 if (s1 == 'retire') {
	      if (!basic.isown(a)) return this.notowner(a,c);
	      s4 = 'config.retire';
	    }
    }
    else if (Module.has('dj')) {
			if (s1 == 'dj') {
	      if (!basic.isown(a)) return this.notowner(a,c);
	      s4 = 'config.dj';
	    }
    }
    else if (Module.has('economy')) {
    	if (s1 == 'wallet' || s1 == 'economy') {
	      if (!basic.isown(a)) return this.notowner(a,c);
	      s4 = 'config.economy';
	    }
	    else if (s1 == 'waiter') {
	      if (!basic.isown(a)) return this.notowner(a,c);
	      s4 = 'config.waiter';
	    }
    }
    else if (Module.has('list')) {
    	if (s1 == 'whitelist') { s4 = 'config.whitelist'; }
    }
    else if (Module.has('lonely')) {
    	if (s1 == 'lonely') { s4 = 'config.lonely'; }
    }
    else if (Module.has('notify')) {
    	if (s1 == 'notify') { s4 = 'config.notify.on'; }
    }
    else if (s1 == 'warn') { s4 = 'config.afk.warn'; } 
    else if (s1 == 'afkbop') { s4 = 'config.afk.bop'; }
    else if (s1 == 'modbop') { s4 = 'config.modbop'; }
    else if (s1 == 'chat') {
      if (!basic.isown(a)) return this.notowner(a,c);
      s4 = 'config.chat';
    }
    else if (s1 == 'pm') {
      if (!basic.isown(a)) return this.notowner(a,c);
      s4 = 'config.pm';
    }
    else if (s1 == 'greeting') { s4 = 'config.greeting.on'; }
    else if (s1 == 'netgreet') { s4 = 'config.netgreets'; }
    else { return basic.say(this.hint, a, c); };
    if (s1 == 'dj' && s2 == 'on' && Module.has('lonely')) {
    	config.dj = true; config.lonely = false; basic.save("settings"); 
      return basic.say("Turned lonely off and DJ on.",a,c);
    }
    if (s1 == 'lonely' && s2 == 'on' && Module.has('dj')) {
    	config.dj = false; config.lonely = true; basic.save("settings"); 
      return basic.say("Turned DJ off and lonely on.",a,c);
    }
    if (s2 == 'off') s3 = false;
    basic.say("Turning " + s1 + ": " + s2, a, c);eval(s4 + " = " + s3);basic.save("settings");
  },
  mode: 2,level: 3,hint: "Useage: /turn *item* [on/off]. ex: /turn warn off"
}, {
  command: 'set',
  callback: function (a, b, c) {
    if (!b) return basic.say(this.hint, a, c);
    var s0 = b.split(' ');var s1 = s0.shift();var s2 = s0.join(' ');var s3;
    if (Module.has('limit')) {
    	if (s1 == 'limit') s3 = 'config.songs.max';
    	if (s1 == 'mindj') s3 = 'config.songs.mindj';
    	if (s1 == 'wait') s3 = 'config.songs.wait';
      if (s1 == 'maxwarn') s3 = 'config.on.maxwarn';
      if (s1 == 'overmax') s3 = 'config.on.overmax';
    }
    if (Module.has('queue')) {
    	if (s1 == 'queue.timeout') s3 = 'config.queue.timeout';
    	if (s1 == 'headsup') s3 = 'config.on.firstinqueue';
    	if (s1 == 'nextup') s3 = 'config.on.queue.next';
      if (s1 == 'notnext') s3 = 'config.on.queue.notnext';
      if (s1 == 'open') s3 = 'config.on.queue.open';
    }
    if (Module.has('vips')) {
      if (s1 == 'addvip') s3 = 'config.on.addvip';
      if (s1 == 'remvip') s3 = 'config.on.remvip';
    }
    if (Module.has('admin')) {
    	if ((s1 == 'greeting' || s1 == 'greeting.user') && config.greeting.locked) {
	      return basic.say("Changing the room greet is locked.",a,c);
	    }
	    if (s1 == 'name') {
	    	if (!basic.isown(a)) return basic.say("Owner only option, sorry.", a, c);
	      config.name = s2;basic.say("Attempting to change name to: "+s2, a, c);return basic.update();
	    }
	    if (s1 == 'laptop') {
	      if (!basic.isown(a)) return basic.say("Owner only option, sorry.", a, c);
	      if (s2 != 'pc' && s2 != 'mac' && s2 != 'chrome' && s2 != 'android' && s2 != 'linux') return basic.say("Invalid laptop. (pc/mac/chrome/linux/android/iphone}", a, c);
	      config.laptop = s2;basic.save("settings");return basic.update();
	    }
	    if (s1 == 'avatar') {
	      if (!basic.isown(a)) return basic.say("Owner only option, sorry.", a, c);
	      basic.say("Attempting to change avatar...",a,c);
	      return bot.setAvatar(s2);
	    }
    }
    if (Module.has('bans')) {
	    if (s1 == 'ban') s3 = 'config.on.ban';
	    if (s1 == 'unban') s3 = 'config.on.unban';
	    if (s1 == 'banned') s3 = 'config.on.banned';
    }
    if (s1 == 'greeting' || s1 == 'greeting.user') s3 = 'config.greeting.user';
    if (s1 == 'greeting.mod') s3 = 'config.greeting.mod';
    if (s1 == 'greeting.vip') s3 = 'config.greeting.vip';
    if (s1 == 'greeting.su') s3 = 'config.greeting.su';
    if (s1 == 'greeting.pm') s3 = 'config.greeting.pm';
    if (s1 == 'theme') s3 = 'config.theme';
    if (s1 == 'dance') s3 = 'config.dance';
    if (s1 == 'nextdj') s3 = 'config.on.nextdj';
    if (s1 == 'afk') s3 = 'config.afk.time';
    if (s1 == 'warn') s3 = 'config.afk.warning';
    if (s1 == 'adddj') s3 = 'config.on.adddj';
    if (s1 == 'remdj') s3 = 'config.on.remdj';
    if (s1 == 'addmod') s3 = 'config.on.addmod';
    if (s1 == 'remmod') s3 = 'config.on.remmod';
    if (s1 == 'snag') s3 = 'config.on.snag';
    if (s1 == 'endsong') s3 = 'config.on.endsong';
    if (s1 == 'help') s3 = 'config.on.help';
    if (s1 == 'afkwarn') s3 = 'config.on.afkwarn';
    if (s1 == 'afkboot') s3 = 'config.on.afkboot';
    if (!s3 || !s2) return basic.say(this.hint, a, c);
    Log("Setting " + s3 + " to have the value of " + s2);basic.say("Setting " + s1 + " to " + s2, a, b);if("off" == s2 || "none" == s2 || "null" == s2) { s2 = null };
    isNaN(s2) ? eval(s3 + ' = "' + s2 + '"') : eval(s3 + " = " + s2);basic.save("settings")
  },
  level: 3,mode: 2,hint: "Useage: /set [item] [value]. ex: /set afk 10, /set theme dubstep"
}, {
  command: 'user',
  callback: function(b, a, c, d) {
	  if(!core.set.using && (a = basic.find(a))) {
	    return core.set.using = !0, core.set.setted = a, core.set.setter = b, d || basic.say("You have selected " + a.name + ".", b, c), 
	    core.set.timeout = setTimeout(function() {
	      core.set.using = !1;core.set.setted = null;core.set.setter = null;core.set.temp = null;core.set.item = null;basic.say("User has been deselected.", b, c);
	    }, 6E4)
	  }
	},
  mode: 2,level: 3,hint: "Select a user for various things"
}, {
  command: 'accept',
  callback: function(b, c, a) {
	  if(core.set.setted && !(b != core.set.setted.userid || !core.set.temp || !core.set.item)) {
	    clearTimeout(core.set.timeout), "greet" == core.set.item && (core.set.setted.greeting = core.set.temp,
    	basic.say(core.set.setted.name + "'s greeting is now: " + core.set.setted.greeting, core.set.setted.userid, a),
    	basic.save(core.set.setted)), "local" == core.set.item && (core.set.setted.rgreets[config.room] = core.set.temp,
    	basic.say(core.set.setted.name + "'s local greeting is now: " + core.set.setted.greeting, core.set.setted.userid, a), basic.save(core.set.setted)),
    	core.set.using = !1,core.set.setted = null, core.set.setter = null, core.set.temp = null, core.set.item = null
	  }
	},
  mode: 2,level: 0,hidden: true,hint: 'accept a greeting'
}, {
  command: 'reject',
  callback: function(a, c, b) {
	  a != core.set.setted.userid || (!core.set.temp || !core.set.item) || (clearTimeout(core.set.timeout),
  	("greet" == core.set.item || "local" == core.set.item) && basic.say(core.set.setted.name + " denied the greeting.", core.set.setter, b),
  	core.set.using = !1, core.set.setted = null, core.set.setter = null, core.set.temp = null, core.set.item = null)
	},
  mode: 2,level: 0,hidden: true,hint: 'deny a greeting'
}, {
  command: 'reboot',
  callback: function (a, b, c) { basic.say("/me flickered off.");throw new Error('Rebooting') },
  mode: 2,level: 5,hint: 'reboots the bot'
}, {
  command: 'hop',
  callback: function (a, b, c) {
  	if (Module.has('lonely')) {
  		if (config.lonely) return basic.say(config.msg.song.lonely, a, c);
  	};if (b == 'up') {bot.addDj();}if (b == 'down') {bot.remDj(config.uid);}
  },
  level: 3,hint: "Makes the bot DJ",mode: 2,hidden: true
}, {
  command: 'ragequit',
  callback: function (a, b, c) { bot.bootUser(a, "Lol they mad."); },
  level: 0,hint: "boots user",mode: 2,hidden: true
}, {
  command: 'album',
  callback: function (a, b, c) { var msg2 = config.msg.album.replace('{title}', core.currentsong.name).replace('{album}', core.currentsong.album);basic.say(msg2, a, c) },
  level: 0,hint: "Get the album",hidden: true,mode: 2
}];