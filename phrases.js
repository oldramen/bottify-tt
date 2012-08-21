/*************************************************************************
 * @copyright 2012 yayramen.                                             *
 * @author yayramen                                                      *
 * @description This is the phrases file, where the speaking variables   *
 * are stored. These can be changed in the config files for more control *
 * over what the bot says.																							 *
 *************************************************************************/

global.msg = {
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
	}
};