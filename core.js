/*************************************************************************
 * @copyright 2012 yayramen.                                             *
 * @author yayramen                                                      *
 * @description This is the core file, which contains the inner workings.*
 *************************************************************************/

global.botti = {
	func: require("./functions.js"),
	cmd: require("./commands.js"),
	ttapi: require("ttapi"),
	util: require("util"),
	_: require("underscore"),
	mysql: require("mysql"),
	db: require("./db.js").db,
	menu: require("./menu.js")
};

global.Log = function(a) {
  console.log(config.name, ">>>", a + ".");
};

global.core = {
	currentdj: null,
	currentsong: {
		name: "",
		up: -1,
		down: -1,
		heart: -1
	},
	cmds: {
		bare: [],
		pm: []
	},
	mods: [],
	djs: [],
	maxdjs: 5,
	booted: false,
	lastsong: "Psh, like I pay attention.",
	lastcmd: "Psh, like I pay attention.",
	set: {
		using: false,
		timeout: null,
		setter: null,
		setted: null,
		temp: null,
		temp2: null
	},
	user: {},
	users: {
		togreet: [],
		tosave: [],
		mods: [],
		djs: [],
		left: [],
		leaving: {},
		auto: []
	},
	qtimeout: null,
	looping: null,
	moving: null,
	roomname: null,
	saving: false,
	lonely: false,
	crashed: false,
	baduser: false,
	notify: 0,
	seen: 0
};

Log("Connecting to TT");
global.bot = new botti.ttapi(config.auth, config.uid, config.room);
Log("Connected");

core.cmds.bare = commands.filter(function(e){ return e.bare == true; });
if(!core.cmds.bare) core.cmds.bare = []; else core.cmds.bare = core.cmds.bare.map(function(e){ return e.command; });;

core.cmds.pm = commands.filter(function(e){ return e.mode > 0; });
if(!core.cmds.pm) core.cmds.pm = []; else core.cmds.pm = core.cmds.pm.map(function(e){ return e.command; });;

Log("Connecting to DB");
global.client = botti.mysql.createConnection({user: "user", password: "passwords", database: "bots", host: "localhost", insecureAuth: true});
botti.db.create("settings");botti.db.create("users");botti.db.create("room");
Log("Connected");

Log("Hooking Events");
bot.on("registered", OnRegistered);
bot.on("deregistered", OnDeregistered);
bot.on("new_moderator", OnNewModerator);
bot.on("rem_moderator", OnRemModerator);
bot.on("add_dj", OnAddDJ);
bot.on("rem_dj", OnRemDJ);
bot.on("speak", OnSpeak);
bot.on("pmmed", OnPmmed);
bot.on("newsong", OnNewSong);
bot.on("endsong", OnEndSong);
bot.on("snagged", OnSnagged);
bot.on("nosong", OnNoSong);
bot.on("update_votes", OnVote);
Log("Events Hooked");
