/*************************************************************************
 * @copyright 2012 yayramen.                                             *
 * @author yayramen                                                      *
 * @description This is the config file, which contains the setup values.*
 *************************************************************************/

global.Tier = 0;

global.Modules = {
 	admin:  0, //paid
 	alias:  0, //paid
 	dj:     0, //free
 	bans:   0, //paid
 	dynamic:0,  //free
 	econ:   0, //paid
 	lonely: 0, //free
 	lyrics: 0, //paid
 	notify: 0, //paid
 	queue:  0, //paid
 	retire: 0, //paid
 	limit:  0, //paid
 	vips:   0, //paid
 	list:   0, //paid
 	twit:   0, //paid
 	last:   0 //paid
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

require("../modules/phrases.js");
require("../core.js");