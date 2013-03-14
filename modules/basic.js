/************************************************************************************************************************************
 ****META INFORMATION****************************************************************************************************************
 **                                                                                                                                **
 **  codef.ly basic.js                                                                                                             **
 **  (c) 2013 codef.ly, Dalton Gore                                                                                                **
 **  This is the basic file, outlining the default bot functions.                                                                  **
 **                                                                                                                                **
 ************************************************************************************************************************************
 ************************************************************************************************************************************/

global.core = { booted:false,user:{},users:{ togreet:[],tosave:[],mods:[],left:[],leaving:{},auto:[] },djs:[],nextdj:null,currentdj:null,cmds:{ bare:[],pm:[] },
	setup:{ on:false,user:null },currentsong:{ name: "",up:-1,down:-1,heart:-1 },set:{ using:false,timeout:null,setter:null,setted:null,temp:null,item:null },
  dives:["{username} is surfing the crowd!","Oops! {username} lost a shoe surfing the crowd.",
    "Wooo! {username}'s surfin' the crowd! Now to figure out where the wheelchair came from...",
    "Well, {username} is surfing the crowd, but where did they get a raft...",
    "{username} dived off the stage...too bad no one in the audience caught them.",
    "{username} tried to jump off the stage, but kicked their laptop. Ouch.",
    "{username} said they were going to do a stagedive, but they just walked off.",
    "And {username} is surfing the crowd! But why are they shirtless?",
    "{username} just traumatized us all by squashing that poor kid up front."] };

global.basic = function(){};

basic.update = function() { var a = false;
	config.hasOwnProperty("greeting") || (config.greeting = msg.greeting, a = true);
  config.hasOwnProperty("msg") || (config.msg = msg, a = true);config.hasOwnProperty("on") || (config.on = msg.on, a = true);
	config.hasOwnProperty("pm") || (config.pm = true, a = true);config.hasOwnProperty("chat") || (config.chat = true, a = true);
	config.hasOwnProperty("afk") || (config.afk = { time:15,warning:null,warn:true,bop:true }, a = true);
  config.hasOwnProperty("dives") || (config.dives = core.dives, a = true);
  config.msg.hasOwnProperty("removedaftersong") || (config.msg.removedaftersong = null, a = true);
	a && settings.save();
  bot.roomInfo(function(a){ core.maxdjs = a.room.metadata.max_djs; });
	commands = botti._.union(commands, basic.commands);
  var bcmds = basic.commands.filter(function(e){ return e.bare == true; });
  if(!bcmds) core.cmds.bare += []; else core.cmds.bare += bcmds.map(function(e){ return e.command; });
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
	if (Module.has('queue|limit|list')) return;
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
    core.nextdj = core.user[core.djs[a]];core.nextdj.userid && basic.say(config.on.nextdj, core.nextdj.userid, true)
  }; 
  if(a = core.user[b.user[0].userid]) {
    Log(a.name + " stopped DJing"), a.boot = false, core.djs.splice(core.djs.indexOf(a.userid), 1), a.dropped = Date.now(), a.droppedRoom = config.room, basic.updateidle(a),
     basic.say(config.on.remdj, b.user[0].userid), basic.refreshdjs(), basic.save(a)
  }
};

basic.onspeak = function(a) {
  // if (core.setup.on) return install.handlesetup(a.userid, a.text, false);
  var sUser = core.user[a.userid];var sText = a.text;if(sUser == null) return;basic.updateidle(sUser);basic.save(sUser);if (Module.has('admin')) return;
  if (a.text.match(/^[!*\/]/) || core.cmds.bare.indexOf(sText) !== -1) command.handle(a.userid, sText, false);
};

basic.onpmmed = function(a) {
	if (core.setup.on) return install.handlesetup(a.senderid, a.text, true);
	var sUser = core.user[a.senderid];var sText = a.text;if(sUser == null) return;basic.updateidle(sUser);basic.save(sUser);
	if (a.text.match(/^[!*\/]/) || core.cmds.bare.indexOf(sText) !== -1) command.handle(a.senderid, sText, true);
};

basic.newsong = function(a) {
	if (core.currentdj && core.currentdj.boot) { basic.removedj(core.currentdj);basic.say(config.msg.removedaftersong, core.currentdj.userid); };
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
  config.on.endsong && (core.lastsong = basic.parse(config.on.endsong));
  config.on.endsong || (core.lastsong = basic.parse("{songtitle}: {up} :point_up:, {down} :point_down:, {heartcount} <3."))
};

basic.snagged = function(b) {
  ++core.currentsong.heart; core.currentdj && basic.gotheart(core.currentdj);var a = core.user[b.userid];
  a && basic.gaveheart(a);basic.say(config.on.snag, b.userid);bot.vote("up");basic.save(a)
};

basic.nosong = function(a) { Log("No song. Hrmph."); };

basic.voted = function(a) {
  if (!config.installdone) return;
  core.currentsong.up = a.room.metadata.upvotes;core.currentsong.down = a.room.metadata.downvotes;a = a.room.metadata.votelog;
  for(var c = 0;c < a.length;c++) { var b = core.user[a[c][0]];b && !basic.isbot(b.userid) && (config.afk.bop && basic.updateidle(b), basic.save(b)) }
};

basic.boot = function() {
  setTimeout(function() { bot.roomInfo(function(a) {
      a && (core.roomname = a.room.name, botti.db.load("settings"), basic.register(a.users, true), setTimeout(function() {
        basic.refreshafks();basic.refreshmeta(a);basic.say(config.on.boot);basic.set();core.booted = true;bot.emit("booted")
      }, 3E3)) })}, 3E3);
  core.looping = setInterval(function() { basic.loop() }, 1E4)
};

basic.set = function() { bot.modifyLaptop(config.laptop); };

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
  a.hasOwnProperty("points") || (a.points = b.points);a.hasOwnProperty("passwords") || (a.passwords = []);a.fans = b.fans;a.points = b.points;return a;
};

basic.refreshafks = function() { for(var a in core.user) { core.user[a].afk = Date.now() }; };

basic.register = function(b, c) { 
  if (c) { for(var a = 0;a < b.length;++a) { botti.db.load("user", b[a], c) }; Logg("Loaded "+b.length+" users") }
  else { for(var a = 0;a < b.length;++a) { botti.db.load("user", b[a]) } }
};

basic.greet = function(g) {
  core.users.togreet = [];
  if(config.greeting.on) { 
    for(var b = [], c = [], d = [], e = [], f = 0;f < g.length;f++) { var a = core.user[g[f]];if(!a || -1 < a.name.indexOf("ttstats")) { return };
      if (Module.has("vips")) {
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

basic.enter = function(a) { if (!config.pm || !config.greeting.pm) return;var msg = basic.parse(config.greeting.pm, a);bot.pm(msg, a) };

basic.loop = function() {
  basic.checkafks();core.users.togreet.length && basic.greet(core.users.togreet);core.users.tosave.length && basic.saveusers(core.users.tosave);
  core.saving && basic.savesettings();config.lastseen = Date.now();bot.emit("looped")
};

basic.checkafks = function() {
  for(var b = 0;b < core.djs.length;b++) { var a = core.user[core.djs[b]];if(!a || !config.afk.time) { break }
    var c = (Date.now() - a.afk) / 6E4;c >= config.afk.time && !basic.isbot(core.djs[b]) && !basic.afkvip(a) && basic.afkboot(a);(sWarn = config.afk.warning) || (sWarn = 0.693148 * config.afk.time);
    !a.warned && !basic.isbot(core.djs[b]) && (c >= sWarn && config.afk.warn) && (basic.say(config.on.afkwarn, a.userid), a.warned = true)
  }
};

basic.afkvip = function(a) {
  if (!Module.has('vips')) return false;
  if (!config.vip.afk) return false;
  if (!vips.check(a.userid)) return false;
  return true;
}

basic.afkboot = function(a) { bot.remDj(a.userid);Log(core.user[a.userid].name + " was escorted: afk");basic.say(config.on.afkboot, a.userid) };

basic.save = function(a) { if(a) { if("settings" == a) { return core.saving = true } -1 == core.users.tosave.indexOf(a.userid) && core.users.tosave.push(a.userid) } };

basic.saveusers = function(b) { core.users.tosave = [];for(var a = b.length - 1;0 <= a;a--) { var c = core.user[b[a]];c && botti.db.save("user", c) } };

basic.savesettings = function() { core.saving = false;botti.db.save("settings"); };

basic.remove = function(a) {
  core.users.left[a] = setTimeout(function() { core.users.left[a] && (delete core.user[a], delete core.users.left[a], bot.emit("removed")) }, 15E3) 
};

basic.updateidle = function(a) { a.afk = Date.now();a.warned = false; };

basic.refreshdjs = function() { 
  bot.roomInfo(function (a) { 
    core.djs = a.room.metadata.djs;	
    if (Module.has('lonely')) lonely.check();
  }); 
};

basic.addsong = function(a) { ++a.songs;basic.save(a); };

basic.removedj = function(a) {
  if(!(3 < basic.level(a)) || a.boot) {
    Log(core.user[a.userid].name + " was removed"), a.boot = false, core.djs.splice(core.djs.indexOf(a.userid), 1), 
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

basic.level = function(b) {
  if(!b || !b.userid) { return-1 };var a = b.userid;
  return a == config.uid ? 6 : -1 !== config.owners.indexOf(a) || Module.has("admin") && -1 !== config.owns.indexOf(a) ? 5 : b.su ? 4 : -1 !== core.mods.indexOf(a) ? 3 : Module.has("vips") && -1 !== config.vips.indexOf(a) ? 2 : -1 !== core.djs.indexOf(a) ? 1 : 0
}

basic.parse = function(a, b) {
  if(a && isNaN(a) && config.installdone) {
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
    if (core.currentdj) { a = a.replace("{thedj}", core.currentdj.name); }
    else { a = a.replace("{thedj}", "unknown"); }
    Module.has("limit") && (a = limit.parse(a));
    Module.has("queue") && (a = queue.parse(a));
    Module.has("dynamic") && (a = dynamic.parse(a));
    Module.has("lonely") && (a = lonely.parse(a));
    var d = a.match(/\{user\.[^}]*\}/gi);
    if(d) { for(var e = 0;e < d.length;++e) {
        var f = d[e], c = f.split(".")[1], c = c.substring(0, c.length - 1);null != core.user[b][c] && (a = a.replace(f, core.user[b][c])) }
    }
    return a;
  }
  return a;
};

basic.say = function(a, b, c, d) {
  if(a && (d || !core.mute)) {
    a = basic.parse(a, b);
    if(c && b) { bot.pm(a, b) } else { if (!c) bot.speak(a); }
  }
};

basic.find = function(a) {
  var b = a;a = basic.escapestring(a).replace("@", "^").trimRight() + "$";var c = false;core.user[b] && (c = core.user[b]);
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
basic.commands = [,{
  command: 'install',
  callback:function(a) {
    config.installdone || (core.setup.on = true, core.setup.user = a, basic.say("Looks like you have some installing to do! You ready?", a, true))
  },
  mode: 2,level: 5,hidden: true,hint: 'config for the bot'
}, {
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
	    settings.save();
	  }
	},
  level: 5,hint: "No touchie",hidden: true
}, {
  command: 'mods',
  callback: function(e, d, f) {
	  if(1 > core.mods.length) return basic.say("There aren't any mods. Hrm, something's wrong.", e, f);
	  d = [];for(var a = core.mods.length - 1;0 <= a;a--) { d.push('(SELECT name FROM users WHERE id = "' + core.mods[a] + '") as ab' + a) }
    
    client.query("SELECT " + d.join(", "), function(a, b, c) { if (a) return console.log(a);var t = [];var s = 0;
      for (var i = core.mods.length - 1; i >= 0; i--) {if (eval('b[0].ab'+i)) { t.push(botti.db.strip(eval('b[0].ab'+i))); }
      else { s++ }; };var phrase = "Mods: " + t.join(", ");if (s > 0) phrase = phrase + ", and "+s+" more.";basic.say(phrase, e, f);
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
	  client.query("SELECT " + e.join(", "), function(a, b, c) { if (a) return console.log(a);var t = [];var s = 0;
      for (var i = d.length - 1; i >= 0; i--) {if (eval('b[0].ab'+i)) { t.push(botti.db.strip(eval('b[0].ab'+i))); }
      else { s++ }; };var phrase = "Owners: " + t.join(", ");if (s > 0) phrase = phrase + ", and "+s+" more.";basic.say(phrase, f, g);
    })
	},
  mode: 2,level: 0,hint: 'lists owners'
}, {
  command: 'maul',
  callback: function(c, b) { var a = basic.find(b);a && basic.removedj(a) },
  mode: 2,level: 3,hint: 'removes a dj'
}, {
  command: 'gtfo',
  callback: function (a, b, c) { if (!b) { return; } var d = basic.find(b);d && basic.kick(d); },
  mode: 2,level: 3,	hint: 'boots a user'
}, {
  command: 'stagedive',
  callback: function(a) { 
    if(-1 !== core.djs.indexOf(a)) { var b = basic.rand(config.dives);basic.say(b, a);bot.remDj(a) }
  },
  level: 0,mode: 2,hint: "Removes if DJ"
}, {
  command: 'dive',
  callback: function (a, f, c) { 
    var b = f.split(" "), g = b.shift(), b = b.join(" ");
    if (g == 'add') {
      console.log(b);
      if (b.indexOf('{username}') < 0) return basic.say("Dive must contain { username }!",a,c);
      config.dives.push(b);settings.save();return basic.say("Added "+b+" to the dives!",a,c);
    };
    if (g == 'clear') { config.dives = core.dives;settings.save();return basic.say("Custom Dives Cleared!",a,c); }
  },
  mode: 2,level: 5,hidden: true,hint: 'moderates the dive list'
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
  callback: function(d, b, e) { var a = [];
    for(var f in core.djs) { var b = core.user[core.djs[f]];
      if(b) { var c = b.afk, c = Date.now() - c;a.push(b.name + ": " + Math.floor(c / 1E3 / 60) + "m") }
    } basic.say("AFK Timer: " + a.join(", "), d, e)
  },
  mode: 2,level: 0,hint: "Tells the current afk timer for the DJs."
}, {
  command: 'status',
  callback: function(b, c, d) { var a = "";
	  Module.has("limit") && (a += "Limit: {limits}/{maxsongs}/{waitsongs}; Reup:{reup}; ");Module.has("queue") && (a += "Queue: {queueon}; ");Module.has("dynamic") && (a += "Dynamic: {dynamic}; ");
	  a += "AFK: {afk}; Warn: {warn}; ";Module.has("lonely") && (a += "Lonely: {lonely}; ");"full" == c && (a += "Greeting:{greeting}; Help:{help}; Theme: {theme};");
	  basic.say(a, b, d);
	},
  mode: 2,level: 0,hint: 'lists the current settings'
}, {
  command: 'lastcmd',
  callback: function (a, b, c) { basic.say(core.lastcmd, a, c); },
  mode: 2,level: 3,hint: 'shows the last used command'
}, {
  command: 'removeaftersong',
  callback: function(a, b, c) { if(b = core.user[a]) { if (!b.boot) { b.boot = true; basic.say("Will kick you after your next!", a, c) } } },
  mode: 2,level: 0,hint: 'Bot will remove you after your next song.'
}, {
  command: 'stayaftersong',
  callback: function(a, b, c) { if(b = core.user[a]) { if (b.boot) { b.boot = false; basic.say("No longer kicking you after your next!", a, c) } } },
  mode: 2,level: 0,hint: 'Bot will remove you after your next song.'
}, {
  command: 'pm',
  callback: function (a, b, c) { basic.say("Hey, what's up?", a, true); },
  mode: 2,level: 0,hint: 'Bot says sup'
}, {
  command: 'modules',
  callback: function (a, b, c) { basic.say("Modules: " + Module.loaded.join(", "), a, true); },
  mode: 2,level: 0,hint: 'Lists installed modules'
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
  callback: function (a, b, c) { bot.getAvatarIds(function(x) { basic.say("http://bots.yayramen.com/av?a="+x.ids.join(','), a, c); }); },
  mode: 2,level: 5,hint: 'Bot will remove you after your next song.'
}, {
  command: 'turn',
  notowner: function(a,b)	{basic.say("Owner only option, sorry.", a, b);},
  callback: function (a, b, c) {
    if (!b) return basic.say(this.hint, a, c);
    if (Module.has('admin') && config.locked.bot && !basic.isown(a)) return basic.say("Room settings are locked.",a,c);
    var s0 = b.split(' ');var s1 = s0.shift();var s2 = s0.join(' ');var s3 = true;var s4;
    if (s1 == 'me') { return basic.say("Oh, stop it you! Be professional!",a,c); }
    else if (s1.isAny('wait|waits|limit|modsongs|smallcount|reup')) {
      if (!Module.has('limit')) return;
      if (s1.isAny('wait|waits')) s4 = 'config.songs.waits';
      if (s1 == 'limit') s4 = 'config.songs.on';
      if (s1 == 'smallcount') s4 = 'config.songs.small';
      if (s1 == 'reup') s4 = 'config.reup';
      if (s1 == 'modsongs') {
        if (!basic.isown(a)) return this.notowner(a,c);
        s4 = 'config.modsongs';
      }
    }
    else if (s1.isAny('vipqueue|afkvip')) {
      if (!Module.has('vips')) return;
      if (s1 == 'vipqueue') s4 = 'config.vip.queue';
      if (s1 == 'afkvip') s4 = 'config.vip.afk';
    }
    else if (s1.isAny('queue|enforce')) {
      if (!Module.has('queue')) return;
      if (s1 == 'queue') s4 = 'config.queue.on';
      if (s1 == 'enforce') s4 = 'config.queue.enforce';
    }
    else if (s1 == 'dynamic') {
      if (Module.has('dynamic')) s4 = 'config.dynamic';
    }
    else if (s1.isAny('retire|retireremove')) {
      if (!Module.has('retire')) return;
      if (!basic.isown(a)) return this.notowner(a,c);
      if (s1 == 'retire') s4 = 'config.retired';
      if (s1 == 'retireremove') s4 = 'config.retiredremove';
    }
    else if (s1 == 'dj') {
      if (!Module.has('dj')) return;
      if (!basic.isown(a)) return this.notowner(a,c);
      s4 = 'config.dj';
    }
    else if (s1.isAny('wallet|economy|waiter')) {
      if (!Module.has('econ')) return;
      if (!basic.isown(a)) return this.notowner(a,c);
      if (s1 == 'wallet' || s1 == 'economy') s4 = 'config.economy';
      if (s1 == 'waiter') s4 == 'config.waiter';
    }
    else if (s1.isAny('whitelist|password')) {
      if (Module.has('list')) s4 = 'config.whitelist';
      if (s1 == 'password' && !basic.isown(a)) return this.notowner(a,c);
      if (s1 == 'password') s4 = 'config.pass.on';
    }
    else if (s1 == 'lonely') {
      if (Module.has('lonely')) s4 = 'config.lonely';
    }
    else if (s1 == 'notify') {
      if (Module.has('notify')) s4 = 'config.notify.on';
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
    	config.dj = true; config.lonely = false; settings.save(); 
      return basic.say("Turned lonely off and DJ on.",a,c);
    }
    if (s1 == 'lonely' && s2 == 'on' && Module.has('dj')) {
    	config.dj = false; config.lonely = true; settings.save();lonely.check();
      return basic.say("Turned DJ off and lonely on.",a,c);
    }
    if (s2 == 'off') s3 = false;
    basic.say("Turning " + s1 + ": " + s2, a, c);eval(s4 + " = " + s3);settings.save();
  },
  mode: 2,level: 3,hint: "Useage: /turn *item* [on/off]. ex: /turn warn off"
}, {
  command: 'set',
  notowner: function(a,b) {basic.say("Owner only option, sorry.", a, b);},
  callback: function (a, b, c) {
    if (!b) return basic.say(this.hint, a, c);
    if (Module.has('admin') && config.locked.bot && !basic.isown(a)) return basic.say("Room settings are locked.",a,c);
    var s0 = b.split(' ');var s1 = s0.shift();var s2 = s0.join(' ');var s3;
    if (s1.isAny('limit|mindj|wait|maxwarn|overmax|songremove|reup')) {
      if (!Module.has('limit')) return;
      if (s1 == 'limit') s3 = 'config.songs.max';
      if (s1 == 'mindj') s3 = 'config.songs.mindj';
      if (s1 == 'wait') s3 = 'config.songs.wait';
      if (s1 == 'maxwarn') s3 = 'config.on.maxwarn';
      if (s1 == 'overmax') s3 = 'config.on.overmax';
      if (s1 == 'songremove') s3 = 'config.songs.rmv';
      if (s1 == 'reup') s3 = 'config.msg.reup';
    } else if (s1.isAny('queue.list|queue.timeout|headsup|nextup|notnext|open|queueoff')) {
      if (!Module.has('queue')) return;
      if (s1 = 'queue.list') s3 = 'config.msg.queue.users';
      if (s1 == 'queue.timeout') s3 = 'config.queue.timeout';
      if (s1 == 'headsup') s3 = 'config.on.firstinqueue';
      if (s1 == 'nextup') s3 = 'config.on.queue.next';
      if (s1 == 'notnext') s3 = 'config.on.queue.notnext';
      if (s1 == 'open') s3 = 'config.on.queue.open';
      if (s1 == 'queueoff') s3 = 'config.msg.queue.off';
    } else if (s1.isAny('addvip|remvip')) {
      if (!Module.has('vips')) return;
      if (s1 == 'addvip') s3 = 'config.on.addvip';
      if (s1 == 'remvip') s3 = 'config.on.remvip';
    } else if (s1.isAny('name|laptop|avatar')) {
      if (!Module.has('admin')) return;
      if (!basic.isown(a)) return this.notowner(a,c);
      if (s1 == 'name') { config.name = s2;basic.say("Attempting to change name to: "+s2, a, c);return basic.update(); }
      if (s1 == 'laptop') { if (s2 != 'pc' && s2 != 'mac' && s2 != 'chrome' && s2 != 'android' && s2 != 'linux') return basic.say("Invalid laptop. (pc/mac/chrome/linux/android/iphone}", a, c);config.laptop = s2;settings.save();return basic.update(); }
      if (s1 == 'avatar') { basic.say("Attempting to change avatar...",a,c);return bot.setAvatar(s2); }
    } else if (s1.isAny('ban|unban|banned')) {
      if (!Module.has('bans')) return;
      if (s1 == 'ban') s3 = 'config.on.ban';
      if (s1 == 'unban') s3 = 'config.on.unban';
      if (s1 == 'banned') s3 = 'config.on.banned';
    } else if (s1 == 'lonelydj') {
      if (!Module.has('lonely')) return;
      if (s1 == 'lonelydj') s3 = 'config.lonelydj';
    } else if (s1.isAny('greeting|greeting.user|greeting.mod|greeting.vip|greeting.su|greeting.pm')) {
      if (Module.has('admin') && config.locked.greeting) return basic.say("Changing the room greet is locked.",a,c);
      if (s1 == 'greeting' || s1 == 'greeting.user') s3 = 'config.greeting.user';
      if (s1 == 'greeting.mod') s3 = 'config.greeting.mod';
      if (s1 == 'greeting.vip') s3 = 'config.greeting.vip';
      if (s1 == 'greeting.su') s3 = 'config.greeting.su';
      if (s1 == 'greeting.pm') s3 = 'config.greeting.pm';
    } else if (s1.isAny('password|passwordmsg')) {
      if (!Module.has('list')) return;
      if (s1.isAny('passwordmsg|password') && !basic.isown(a)) return this.notowner(a,c);
      if (s1 == 'password') s3 = 'config.pass.word';
      if (s1 == 'passwordmsg') s3 = 'config.pass.msg';      
    } else {
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
      if (s1 == 'removed') s3 = 'config.msg.removedaftersong';  
    }    
    if (!s3 || !s2) return basic.say(this.hint, a, c);
    Log("Setting " + s3 + " to have the value of " + s2);basic.say("Setting " + s1 + " to " + s2, a, c);if("off" == s2 || "none" == s2 || "null" == s2) { s2 = null };
    isNaN(s2) ? eval(s3 + ' = "' + s2 + '"') : eval(s3 + " = " + s2);settings.save();
  },
  level: 3,mode: 2,hint: "Useage: /set [item] [value]. ex: /set afk 10, /set theme dubstep"
}, {
  command: 'user',
  callback: function(b, a, c, d) {
	  if(!core.set.using && (a = basic.find(a))) {
	    return core.set.using = true, core.set.setted = a, core.set.setter = b, d || basic.say("You have selected " + a.name + ".", b, c), 
	    core.set.timeout = setTimeout(function() {
	      core.set.using = false;core.set.setted = null;core.set.setter = null;core.set.temp = null;core.set.item = null;basic.say("User has been deselected.", b, c);
	    }, 6E4)
	  } else if (core.set.setted && core.set.using) {
      if (a == 'greeting') {
        basic.say(core.set.setted.name+"'s greeting is: "+core.set.setted.greeting,core.set.setted.userid,c);
      }
    }
	},
  mode: 2,level: 3,hint: "Select a user for various things"
}, {
  command: 'confirm',
  callback: function(b, c, a) {
	  if(core.set.setted && !(b != core.set.setted.userid || !core.set.temp || !core.set.item)) {
	    clearTimeout(core.set.timeout),"greet" == core.set.item && (core.set.setted.greeting = core.set.temp,
    	basic.say(core.set.setted.name + "'s greeting is now: " + core.set.setted.greeting, core.set.setted.userid, a),
    	basic.save(core.set.setted)), "local" == core.set.item && (core.set.setted.rgreets[config.room] = core.set.temp,
    	basic.say(core.set.setted.name + "'s local greeting is now: " + core.set.temp, core.set.setted.userid, a), basic.save(core.set.setted)),
    	core.set.using = false,core.set.setted = null, core.set.setter = null, core.set.temp = null, core.set.item = null
	  };
    if("playlist" == core.set.item && Module.has("dj") && b == core.set.setter) {
      return clearTimeout(core.set.timeout), core.set.using = !1, core.set.setted = null, core.set.setter = null, core.set.temp = null, 
      core.set.item = null, dj.clearplaylist()
    };
	},
  mode: 2,level: 0,hidden: true,hint: 'confirm something'
}, {
  command: 'deny',
  callback: function(a, c, b) {
	  a != core.set.setted.userid || (!core.set.temp || !core.set.item) || (clearTimeout(core.set.timeout),
  	("greet" == core.set.item || "local" == core.set.item) && basic.say(core.set.setted.name + " denied the greeting.", core.set.setter, b),
  	core.set.using = false, core.set.setted = null, core.set.setter = null, core.set.temp = null, core.set.item = null);
    if("playlist" == core.set.item && Module.has("dj") && b == core.set.setter) {
      return clearTimeout(core.set.timeout), core.set.using = !1, core.set.setted = null, core.set.setter = null, core.set.temp = null, 
      core.set.item = null,basic.say("Okay, my queue is safe!",a,b)
    };
	},
  mode: 2,level: 0,hidden: true,hint: 'deny something'
}, {
  command: 'reboot',
  callback: function (a, b, c) { 
    basic.say("/me flickered off.");
    Log('Rebooting');
    if (b) return bot.pm('50076a1baaa5cd28ef000088','/reboot ' + b); 
    bot.pm('50076a1baaa5cd28ef000088','/reboot ' + config.file); 
  },
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
}, {
  command: 'test',
  callback: function(a,b,c){ var d="hello";console.log(d.isAny("hellos|goodbye|things"))},
  level: 0,hint: "Testing",hidden: true,mode: 2
}];