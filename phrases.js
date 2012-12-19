/*************************************************************************
 * @copyright 2012 yayramen.                                             *
 * @author yayramen                                                      *
 * @description This is the phrases file, where the speaking variables   *
 * are stored. These can be changed in the config files for more control *
 * over what the bot says.																							 *
 *************************************************************************/

config.msg = global.msg = {
	booted: "/me flickered on.",
	dance: "Bust a move!",
	party: "Gimme a shot and clear the dance floor!!",	
	commands: "The list of commands are as follows: /{commands}",
	theme: "The current theme is {theme}.",
	djs: "The current song count is: {djsandsongcount}",
	afks: "The current afk timer is: {djsandafkcount}",
	notdj: "I'm sorry {username}, but you're not a dj.",
	theiruid: "{username}'s userid is: {user.userid}",
	youruid: "Your userid is: {user.userid}",
	willboot: "Alright, I'll boot you off the deck at the end of your song.",
	notmod: "I'm not a mod, so I can't boot anyone.",
	album: "{title} is on {album}",
	userinfo: "{username}'s Hearts: {heart_count}, Hearts Given: {given_count}, Total Songs: {total_songs}, Heart Percentage: {heart_percentage}%",
	waitlimit: "I'm sorry but you have to wait {user.waiting} song(s) to get back up.",
	nowallet: "This room doesn't use the economy, sorry,",
	retired: "@{username}, this song is on the retired list, please skip!",

	tmp: {
		ban: "{username} has been temporarily banned.",
		banreason: "You've been temporarily banned."
	},
	reset: {
		all: "Reset all DJs to 0.",
		dj: "Reset {username} to 0."
	},

	queue: {
		off: "I'm sorry but the queue is currently off.",
		status: "There is currently {queueamount} people standing in line to get on deck.",
		empty: "The queue is currently empty!",
		users: "The queue is currently: {queueusers}, in that order.",
		add: "Alright, {username}, you've been added to the queue!",
		remove: "You've been removed from the queue.",
		modadd: "Pushed {username} to the front of the queue.",
		modremove: "Pulled {username} from the queue.",
		notin: "You're not in the queue.",
		alreadyin: "Sorry, {username}, but you're already in the queue.",
		dj: "I'm sorry, {username}, but you're already a DJ.",
		clear: "Queue Cleared"
	},

	viplist: "VIPs: {vip_list}",

	whitelist: {
		notin: "I'm sorry, but you're not on the whitelist.",
		add: "{username} has been added to the whitelist.",
		remove: "{username} has been removed from the whitelist.",
		list: "Whitelisted: {whitelisted}"
	},

	owner: {
		add: "{username} has been promoted to owner.",
		remove: "{username} has been demoted from owner.",
		list: "Owners: {ownerlist}"
	},

	song: {
		lonely: "Sorry, I can't DJ with LonelyDJ enabled D:",
		nodj: "Sorry, I don't know how to DJ",
		skip: "Skipped '{skippedsong}'. Next Song: '{nextsong}' Type /song requeue to undo.",
		requeue: "Moved {bottomsong} to the top of the queue.",
		shuffle: "Shuffled Queue.",
		add: "Added {currentsong} to queue!",
		remove: "Removing {lastsong}",
		noremove: "You can only remove a song when I'm playing a song.",
		next: "Next song: {next} by {artist}",
		total: "Total Songs In My Queue: {songtotal}",
	},

	my: {
		wallet: "Your wallet contains: $",
		past: {
			day: "You've played {songs} songs in the past day, with {ups} awesomes, {downs} lames, and {hearts} snags.",
			week: "You've played {songs} songs in the past week, with {ups} awesomes, {downs} lames, and {hearts} snags."
		},
		most: {
			awesomed: "{title} with {upvotes} awesomes.",
			lamed: "{title} with {downvotes} lames.",
			hearted: "{title} with {heart} hearts.",
		},
	},

	user: {
		past: {
			day: "{username} has played {songs} songs in the past day, with {ups} awesomes, {downs} lames, and {hearts} snags.",
			week: "{username} has played {songs} songs in the past week, with {ups} awesomes, {downs} lames, and {hearts} snags."
		},
		most: {
			awesomed: "{title} with {upvotes} awesomes.",
			lamed: "{title} with {downvotes} lames.",
			hearted: "{title} with {heart} hearts.",
		},
	},

	rooms: {
		past: {
			day: "{room} has heard {songs} songs in the past day, giving {ups} awesomes, {downs} lames, and {hearts} snags.",
			week: "{room} has heard {songs} songs in the past week, giving {ups} awesomes, {downs} lames, and {hearts} snags."
		},
		most: {
			awesomed: "{title} with {upvotes} awesomes, played by {djname}.",
			lamed: "{title} with {downvotes} lames, played by {djname}.",
			hearted: "{title} with {heart} hearts, played by {djname}.",
		},
	},

	the: {
		past: {
			day: "The Ramen Network has heard {songs} songs in the past day, giving {ups} awesomes, {downs} lames, and {hearts} snags.",
			week: "The Ramen Network has heard {songs} songs in the past week, giving {ups} awesomes, {downs} lames, and {hearts} snags."
		}
	},

	twitter: {
		def: "{currentdj} is playing {song} right now!",
		confirm: "Tweet sent!",
		limit: "Your tweet is {charlimit} characters over the limit!",
		spam: "Don't spam! You can only tweet once every {twitime} minutes! Wait for a bit :P"
	},

	lastfm: {
		noton: "You need to enable lastfm to use this feature!",
		noinfo: "This stuff is too underground for me to find any information!",
		noargs: "Sorry, what am I looking up? Genre or Artist?",
		genre: "This song is {lastfmgenre}."
	}
};

config.greeting = {
	on: true,
	locked: false,
	user: "Hey {usernames}! Welcome to {room}! Type /help if you're lost.",
	mod: "We've got a moderator in the room!  Welcome @{usernames}!",
	vip: "Welcome @{usernames}, we have a VIP in the room!",
	su: "Hold the music! There's a SU in the house! Welcome, @{usernames}!",
	pm: "Hey! I'm a bot. Keep this box open so you can give me /commands!"
};

config.dance = "Bust a move!";

config.on = {
	boot: "Hi! I'm a bot! Type /install to get started!",
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
};