/************************************************************************************************************************************
 ****META INFORMATION****************************************************************************************************************
 **                                                                                                                                **
 **  codef.ly core.js                                                                                                              **
 **  (c) 2013 codef.ly, Dalton Gore                                                                                                **
 **  This is the core file, which preps the rest of the files to work                                                              **
 **                                                                                                                                **
 ************************************************************************************************************************************
 ************************************************************************************************************************************/

global.deBug = false;
global.Log = function(a) { if (deBug) console.log(config.name,">>>",a+".") };global.Logg = function(a) { console.log(config.name,">>>",a,".") };
global.Emit = function(a,b,c) { Log(a);basic.say(a,b,c); }

global.settings = function(){};settings.save = function(){ return core.saving = true; };

global.Module = function(){};Module.loaded = [];
Module.load = function(a) { require("./modules/"+a+".js");Module.loaded.push(a); };
Module.has = function(d) { 
  if (d.indexOf("&") > 0) {
    for (var c=d.split("&"),b=c.length-1;0<=b;b--) { if (1>Module.loaded.indexOf(c[b])) { return false; } if (0==b) { return true; } }
  } else if (d.indexOf("|") > 0) {
    for (var c=d.split("|"),b=c.length-1;0<=b;b--) { if (1<Module.loaded.indexOf(c[b])) { return true; } if (0==b) { return false; } }
  } else { return 0 < Module.loaded.indexOf(d) ? true : false }
};

String.prototype.isAny = function(a) {
	if (a.indexOf("|") > 0) { for (var c=a.split("|"),b=c.length-1;0<=b;b--) { if (this == c[b]) { return true; } if (0==b) { return false; }  }  }
};

global.botti = {
	ttapi: require("ttapi"), util: require("util"), _: require("underscore"), mysql: require("mysql"), twit: require("twit"), 
	lastfm: require("lastfm").LastFmNode, sys: require('sys'), exec: require('child_process').exec, http: require('http'), usedb: true
};

global.Tiers = [
	['basic','stats','dj','reco'],['bans','econ'],['queue','limit','dynamic'],['admin','lonely','notify'],
	['vips','list','retire'],['alias','twit','last','lyrics']
];

global.command = function(){};global.commands = [];
command.handle = function(a,b,c,d,e) {
  if(!core.booted) return Log("Not booted, can't do commands");
  if(!core.user[a]) return Log("Not a user");
  if(!b.match(/^[!\*\/]/) && -1 === core.cmds.bare.indexOf(b)) return Log("Can't find the command");
  if(!config.installdone && b.replace(" ","") != "/install") return basic.say("Something hasn't been installed! Type /install to get started!", a, c);
  if(a == config.uid) return Log("Silly Rabbit, commans are for kids");
  if(-1 < b.indexOf(" && ")) { var h = b.split(" && ");return command.process(a,b,c,d,e,-1,h.length -1,h); } 
  else { return command.execute(a,b,c,d,e); };
};
command.process = function(a,b,c,d,e,f,g,h) {
	setTimeout(function(){ f++;command.execute(a,h[f],c,d,e,true);if (f < g) { command.process(a,b,c,d,e,f,g,h); } else { d && (core.mute = false); } }, 150);
}
command.execute = function(a,b,c,d,e,f) {
	var z = b.split(" "), y = z.shift().replace(/^[!\*\/]/, "").toLowerCase();b = z.join(" ");
	z = commands.filter(function(m){ return m.command && m.command == y || "object" == typeof m.command && m.command.length && -1 != m.command.indexOf(y) });
	if (1 > z.length && Module.has("alias")) return alias.check(a,y,c);
	z.forEach(function(m) {
		if (Module.has("admin") && config.pmonly.indexOf(m.command) > -1) c = true;
		if (basic.level(core.user[a]) < m.level && !(d && "say" == m.command)) return Log("Not high enough level to use");
		if (b.isAny("hint|help")) return basic.say("Hint: /"+m.command+": "+m.hint,a,c);
		m.callback(a,b,c,f);core.user[a] && (core.lastcmd = core.user[a].name+": /"+m.command+" "+b,Log(core.lastcmd));
	}); e && (core.lastcmd = core.user[a].name+": /"+e);
};

Logg("Connecting to TT");global.bot = new botti.ttapi(config.auth, config.uid, config.room);Logg("Connected");

botti.install = require("./modules/install.js");botti.db = require("./modules/db.js").db;

for (var i=0;i<=Tier;i++) { for (var x=0;x<Tiers[i].length;x++) { Module.load(Tiers[i][x]); }; };
for (var x in Modules) { if (Modules[x] == 1) Module.load(x); };Logg("Loaded "+Module.loaded.length+" Modules");

process.on('uncaughtException', function(err) { console.log(err.stack); });
process.on('SIGINT', function() { process.exit(); });
process.on('SIGTERM', function() { process.exit(); });