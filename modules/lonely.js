/*************************************************************************
 * @copyright 2012 yayramen.                                             *
 * @author yayramen                                                      *
 * @description This is the lonely module                                *
 *************************************************************************/

//Define Functions
global.lonely = function(){};

lonely.update = function(){ var a = false;
	config.hasOwnProperty("lonely") || (config.lonely = true,a = false);
	a && basic.save("settings");core.lonely = false;
	lonely.check();
};

lonely.check = function() {
  if((!Module.has("queue") || !config.qued.length) && config.lonely) {
    if(1 == core.djs.length && -1 == core.djs.indexOf(config.uid)) { bot.addDj(), core.lonely = !0 } else {
      if((2 < core.djs.length || 1 == core.djs.length) && -1 != core.djs.indexOf(config.uid)) { bot.remDj(), core.lonely = !1 }
    }
  }
};

lonely.parse = function(a,b) {
	if (!a || !isNaN(a)) return;
	a = a.replace('{lonely}', basic.lightswitch(config.lonely));
	return a;
};

//Hook Events
bot.on('booted', lonely.update);
bot.on('add_dj', lonely.check);
bot.on('rem_dj', lonely.check);