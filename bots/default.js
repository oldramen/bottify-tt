/*************************************************************************
 * @copyright 2012 yayramen.                                             *
 * @author yayramen                                                      *
 * @description This is the config file, which contains the setup values.*
 *************************************************************************/

global.Tier = 2;

global.Modules = {
 	stats:  0,
 	bans:   0,
 	econ:   0,
 	queue:  0,
 	limit:  0,
 	admin:  0,
 	lonely: 0,
 	alias:  0,
 	vips:   0,
 	list:   0,
 	twit:   0,
 	last:   0,
 	retire: 0,
 	notify: 0,
 	dj:     0
 };

global.config = {
	file: 'default',

	auth: "auth",
	uid: "userid",
	room: "roomid",

	name: "name",
	laptop: "chrome",
	theme: "EDM",

	owners: ['4e0ff328a3f751670a084ba6']
};

require("../phrases.js");
require("../core.js");