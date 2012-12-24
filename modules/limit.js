/*************************************************************************
 * @copyright 2012 yayramen.                                             *
 * @author yayramen                                                      *
 * @description This is the limit module                                 *
 *************************************************************************/

//Define Functions
global.limit = function(){};

limit.update = function(){ var a = false;
	config.hasOwnProperty("songs") || (config.songs = { max:3,wait:1,waits:true,on:false,mindj:3,dynamic:false }, a = true);
	a && settings.save();
	commands = botti._.union(commands, limit.commands);
};

limit.adddj = function(b) {
  var a = core.user[b.user[0].userid];limit.waited(a) && (a.waiting = a.count = 0);
  if(config.songs.waits && 0 < a.waiting) return bot.remDj(a.userid), Log(a.name + " was escorted: song wait"), basic.say(msg.waitlimit, a.userid, true);
  a && !Module.has("list") && (a.droppedRoom = config.room, basic.updateidle(a), basic.save(a), Log(a.name + " started DJing"), basic.say(config.on.adddj, 
  	b.user[0].userid), basic.refreshdjs(), core.nextdj && core.currentdj && core.nextdj.userid == core.djs[0] && (b = core.djs.indexOf(core.currentdj.userid), 
  	b = b == core.djs.length - 1 ? 0 : b + 1, core.nextdj = core.user[core.djs[b]], core.nextdj.userid && basic.say(config.on.nextdj, core.nextdj.userid, true)))
};

limit.endsong = function() {
  for(var b in core.user) { var a = core.user[b];0 < a.waiting && --a.waiting;!basic.isdj(a.userid) && 0 >= a.waiting && (a.waiting = 0, a.count = 0) }
  Module.has("vips") || core.currentdj && core.djs.length >= config.songs.mindj && config.songs.on && core.currentdj.count >= config.songs.max && limit.over(core.currentdj)
};

limit.waited = function(a) { if(a) { return!a.droppedRoom || a.droppedRoom != config.room || (Date.now() - a.dropped) / 6E4 >= 3 * config.songs.wait ? true : false } };

limit.addsong = function() { ++core.currentdj.count;basic.save(core.currentdj); };

limit.over = function(a) {
  basic.say(config.on.maxwarn, a.userid);
  Log(core.user[a.userid].name + " hit song limit");
  setTimeout(function() {
    a.dropped = Date.now();a.droppedRoom = config.room;config.songs.waits && (a.waiting = config.songs.wait);
    basic.isdj(a.userid) && (bot.remDj(a.userid), basic.say(config.on.overmax, a.userid), Log(core.user[a.userid].name + " was escorted: over song limit"))
  }, 6E4)
};

limit.parse = function(a,b) {
	if (!a || !isNaN(a) || config.installedmods.indexOf('limit') < 0) return a;
	a = a.replace('{limits}', basic.lightswitch(config.songs.on))
	.replace('{limit}', basic.lightswitch(config.songs.on))
	.replace('{songlimit}', basic.lightswitch(config.songs.on))
	.replace('{maxsongs}', config.songs.max)
	.replace('{waitsongs}', config.songs.wait)
	.replace('{songwait}', config.songs.wait);
	return a;
};

//Hook Events
bot.on('booted', limit.update);
bot.on('add_dj', limit.adddj);
bot.on('newsong', limit.addsong);
bot.on('endsong', limit.endsong);

//Define Commands
limit.commands = [{
  command: 'resetall',
  callback: function(a, c, b) {
	  for(a = 0;a < core.djs.length;a++) { core.djs[a] != config.uid && (core.user[core.djs[a]].count = 0) };basic.say(config.msg.reset.all, null, b)
	},
  mode: 2,level: config.modsongs ? 3 : 5,hint: 'resets all song counts to 0'
}, {
  command: 'reset',
  callback: function(a, b, c) {
	  (a = basic.find(b)) ? (console.log("found"), a.count = 0, a.waiting = 0, basic.say(config.msg.reset.dj, a.userid, c)) : console.log("nope")
	},
  mode: 2,
  level: config.modsongs ? 3 : 5,
  hint: 'resets song count for dj'
}, {
  command: 'djs',
  callback: function(d, b, e) {
	  if(!b) { b = [];
	    for(var a = 0;a < core.djs.length;a++) { if(core.djs[a] != config.uid) { var c = core.user[core.djs[a]];c && b.push(c.name + ": " + c.count) } }
	    a = config.msg.djs.replace("{djsandsongcount}", b.join(", "));1 > b.length && (a = "Sorry, I don't see any DJs");return basic.say(a, d, e)
	  }
	},
  mode: 2,level: 0,hint: "Song count for the DJs."
}, {
  command: 'waiting',
  callback: function(e, a, f) {
	  a = [];var b = botti._.keys(core.user);b.splice(0, 1);
	  for(var c = 0;c < b.length;++c) { var d = core.user[b[c]];0 < d.waiting && a.push(d.name + ": " + d.waiting) }
	  if(1 > a.length) { return basic.say("No one's waiting.", e, f) } a = "Waiting: " + a.join(", ");basic.say(a, e, f)
	},
  mode: 2,level: 0,hint: "Tells how long djs have to wait to play again."
}, {
  command: 'setsongs',
  callback: function(b, a, c) {
  if(core.set.using && b == core.set.setter) {
    clearTimeout(core.set.timeout);core.set.timeout = null;if(isNaN(a)) { 
      return core.set.using = false, core.set.setted = null, core.set.setter = null, basic.say("Use your numbers, foo.")
    }
    500 < a && (a = 500);core.set.setted.count = a;basic.say("Set " + core.set.setted.name + " to " + a + " songs.", b, c);
    basic.save(core.set.setted);core.set.using = false;core.set.setted = null;core.set.setter = null
  }
},
  mode: 2,level: 5,hint: "Sets songs for a user"
}];