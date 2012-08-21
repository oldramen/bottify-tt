/*************************************************************************
 * @copyright 2012 yayramen.                                             *
 * @author yayramen                                                      *
 * @description This is the config file, which contains the setup values.*
 *************************************************************************/

require("./phrases.js");

global.config = {
	file: 'default',

	auth: "authid",
	uid: "userid",
	room: "roomid",

	name: "name",
	laptop: "chrome",
	theme: "EDM",

	owners: ['4e0ff328a3f751670a084ba6'],
	owns: ['4e0ff328a3f751670a084ba6'],
	modsongs: false,

	songs: {
		max: 3,
		wait: 1,
		waits: true,
		on: false,
		mindj: 3
	},

	queue: {
		on: false,
		enforce: true,
		timeout: 15
	},

	afk: {
		time: 500,
		warn: true,
		bop: true
	},

	modbop: false,
	dj: false,
	chat: true,
	pm: true,
	whitelist: false,
	lonely: false,

	greeting: {
		on: false,
		user: "Hey {usernames}! Welcome to {room}! Type /help if you're lost.",
		mod: "We've got a moderator in the room!  Welcome @{usernames}!",
		vip: "Welcome @{usernames}, we have a VIP in the room!",
		su: "Hold the music! There's a SU in the house! Welcome, @{usernames}!",
		pm: "Hey! I'm a bot. Keep this box open so you can give me /commands!"
	},

	on: {
		adddj: null,
		remdj: null,
		addmod: null,
		remmod: null,
		snag: null,

		endsong: "{songtitle}: {up} :point_up:, {down} :point_down:, {heartcount} :heartbeat:.",

		overmax: "Hey, @{username}, you're over your max songs!  You've got to wait {waitsongs} song(s) to get back up.",
		maxwarn: "Hey, @{username}, you've played your limit. Let someone else have a go.",

		help: "Hey, {username}, the theme is {theme}, the song limit is {limits}, The queue is currently {queue}, and {afk} minutes for afk.",

		afkwarn: "Hey, @{username}, no falling asleep on deck!",
		afkboot: "/tableflip {username}, you've been afk for too long.",

		queue: {
			next: "Hey @{username}, it's your time to shine!  Please take your spot before {queuetimeout} seconds have passed.",
			notnext: "Sorry, {username}, you have to wait your turn.  It's currently {nextinqueue}'s turn to get on deck.",
			open: "Sorry, {username}, there's already an open spot.  Feel free to just hop up."
		},

		addvip: "{username} is now a VIP.",
		remvip: "{username} is no longer a VIP.",

		ban: "{username} is now banned.",
		unban: "{username} is now unbanned.",
		banned: "You're banned.  Gtfo.",
	},

	bans: [],
	vips: [],
	list: [],
	qued: [],

	lastseen: null
};


require("./core.js");