/*************************************************************************
 * @copyright 2012 yayramen.                                             *
 * @author yayramen                                                      *
 * @description This is the core file, which contains the inner workings.*
 *************************************************************************/

global.Log = function(a) { console.log(config.name, ">>>", a + "."); };function puts(error, stdout, stderr) { sys.puts(stdout) };global.Module = {};Module.loaded = [];
Module.load = function(a) { require("./modules/"+a+".js");Module.loaded.push(a);Log("Loaded Module: "+a); }; 
global.settings = function(){}; settings.save = function(){  return core.saving = true; };
Module.has = function(d) { 
  if (d.indexOf("&") > 0) {
    for (var c=d.split("&"),b=c.length-1;0<=b;b--) { if (1>Module.loaded.indexOf(c[b])) { return false; } if (0==b) { return true; } }
  } else if (d.indexOf("|") > 0) {
    for (var c=d.split("|"),b=c.length-1;0<=b;b--) { if (1<Module.loaded.indexOf(c[b])) { return true; } if (0==b) { return false; } }
  } else { return 0 < Module.loaded.indexOf(d) ? true : false }
};

//Prototyping? WHY NOT. 
String.prototype.isAny = function(a) {
	if (a.indexOf("|") > 0) { for (var c=a.split("|"),b=c.length-1;0<=b;b--) { if (this == c[b]) { return true; } if (0==b) { return false; }  }  }
}

//Load Plugins/vars
global.botti = {
	ttapi: require("ttapi"), util: require("util"), _: require("underscore"), mysql: require("mysql"), twit: require("twit"), 
	lastfm: require("lastfm").LastFmNode, sys: require('sys'), exec: require('child_process').exec, usedb: true
};

//Define Tiers
global.Tiers = [
	['basic','stats','dj'],           //Tier 0
	['bans','econ'],             //Tier 1
	['queue','limit','dynamic'],      //Tier 2
	['admin','lonely','notify'], //Tier 3
	['vips','list','retire'],    //Tier 4
	['alias','twit','last']      //Tier 4
];

//Define Commands
global.commands = [];

//Connect to TT
Log("Connecting to TT");
global.bot = new botti.ttapi(config.auth, config.uid, config.room);
Log("Connected");

//Load Tiers
for (var i=0;i<=Tier;i++) { for (var x=0;x<Tiers[i].length;x++) { Module.load(Tiers[i][x]); }; };

//Load Modules
for (var x in Modules) { if (Modules[x] == 1) Module.load(x); };

//Load Files
botti.install = require("./install.js");botti.db = require("./db.js").db;

//Stuff and Stuff
process.on('uncaughtException', function(err) { console.log(err.stack); });
process.on('SIGINT', function() { process.exit(); });
process.on('SIGTERM', function() { process.exit(); });