/*************************************************************************
 * @copyright 2012 yayramen.                                             *
 * @author yayramen                                                      *
 * @description This is the core file, which contains the inner workings.*
 *************************************************************************/

global.Log = function(a) { console.log(config.name, ">>>", a + "."); };function puts(error, stdout, stderr) { sys.puts(stdout) };global.Module = {};Module.loaded = [];
Module.load = function(a) { require("./modules/"+a+".js");Module.loaded.push(a);Log("Loaded Module: "+a); }; 
global.settings = function(){}; settings.save = function(){  return core.saving = true; };
Module.has = function(a) { var b = a.split(",");for (var i = b.length - 1; i >= 0; i--) { return-1 < Module.loaded.indexOf(b[i]) ? true : false }; };


//Load Plugins
global.botti = {
	ttapi: require("ttapi"), util: require("util"), _: require("underscore"), mysql: require("mysql"), twit: require("twit"), 
	lastfm: require("lastfm").LastFmNode, sys: require('sys'), exec: require('child_process').exec
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
process.on('uncaughtException', function(err) { console.log(err); });
process.on('SIGINT', function(err) { process.exit(); });
process.on('SIGTERM', function(err) { process.exit(); });