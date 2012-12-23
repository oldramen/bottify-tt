/*************************************************************************
 * @copyright 2012 yayramen.                                             *
 * @author yayramen                                                      *
 * @description This is the lonely module                                *
 *************************************************************************/

//Define Functions
global.lonely = function(){};

lonely.update = function(){ var a = false;
	config.hasOwnProperty("lonely") || (config.lonely = true,a = false);
	a && settings.save();core.lonely = false;
	lonely.check();
};

lonely.check = function() {
  if((!Module.has("queue") || !config.qued.length) && config.lonely) {
    if(1 == core.djs.length && -1 == core.djs.indexOf(config.uid)) { bot.addDj(), core.lonely = true } else {
      if((2 < core.djs.length || 1 == core.djs.length) && -1 != core.djs.indexOf(config.uid)) { bot.remDj(), core.lonely = false }
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