/*************************************************************************
 * @copyright 2012 yayramen.                                             *
 * @author yayramen                                                      *
 * @description This is the core file, which contains the inner workings.*
 *************************************************************************/

global.Log = function(a) { console.log(config.name, ">>>", a + "."); };function puts(error, stdout, stderr) { sys.puts(stdout) };global.Module = {};Module.loaded = [];
Module.load = function(a) { require("./modules/"+a+".js");Module.loaded.push(a); } Module.has = function(a) { return-1 < Module.loaded.indexOf(a) ? true : false };

//Load Prereqs
global.botti = {
	install: require("./install.js"), ttapi: require("ttapi"), util: require("util"), _: require("underscore"), mysql: require("mysql"), twit: require("twit"), 
	lastfm: require("lastfm").LastFmNode, db: require("./db.js").db, sys: require('sys'), exec: require('child_process').exec
};

//Define Tiers
global.Tiers = [
	['basic','stats'],           //Tier 0
	['bans','econ'],             //Tier 1
	['queue','limit','dj'],      //Tier 2
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
for (var i=Tier;i>=0;i--) { for (var x=Tiers[i].length-1;x>=0;x--) { Module.load(Tiers[i][x]); }; };

//Load Modules
for (x in Modules) { if (x == 1) Module.load(x); };

//Compatibility