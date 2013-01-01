/*************************************************************************
 * @copyright 2012 yayramen.                                             *
 * @author yayramen                                                      *
 * @description This is the config file, which contains the setup values.*
 *************************************************************************/

global.Tier = 0;

global.Modules = {
 	bans:   0, //paid
 	econ:   0, //paid
 	queue:  0, //paid
 	limit:  0, //paid
 	admin:  0, //paid
 	lonely: 0, //free
 	alias:  0, //paid
 	vips:   0, //paid
 	list:   0, //paid
 	twit:   0, //paid
 	last:   0, //paid
 	retire: 0, //paid
 	notify: 0, //paid
 	dj:     0, //free
 	dynamic:0  //free/paid, idk
 };

global.config = {
	file: 'default',

	auth: "auth",
	uid: "userid",
	room: "roomid",

	name: "name",
	laptop: "chrome",
	theme: "None",

	owners: ['4e0ff328a3f751670a084ba6'],

	installdone: false
};

require("../phrases.js");
require("../core.js");