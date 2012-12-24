/*************************************************************************
 * @copyright 2012 yayramen.                                             *
 * @author yayramen                                                      *
 * @description This is the bans module                                  *
 *************************************************************************/

//Define Functions
global.bans = function(){};

bans.update = function(){ var a = false;
	config.hasOwnProperty("bans") || (config.bans = [], a = true);
	a && settings.save();
	bot.roomInfo(function(a){ bans.check(a.users); });
	commands = botti._.union(commands, bans.commands);
};

bans.check = function(c) {
  for(var a = 0;a < c.length;++a) { var b = c[a].userid;
    -1 < config.bans.indexOf(b) && (bot.bootUser(b, "You're banned from this room."), core.users.togreet.splice(core.users.togreet.indexOf(b), 1))
  };
};

bans.registered = function(a) { if (core.booted) bans.check(a.user); };

bans.add = function(a) {
  2 < basic.level(a) || (-1 === config.bans.indexOf(a.userid) && config.bans.push(a.userid), bot.bootUser(a.userid, config.on.banned), 
  	basic.say(config.on.ban, a.userid), Log(core.user[a.userid].name + " was banned"), settings.save())
};

//Hook Events
bot.on('booted', bans.update);
bot.on('registered', bans.registered);

//Define Commands
bans.commands = [{
  command: 'ban',
  callback: function(c, a) { if(a) { var b = basic.find(a);return b ? bans.add(b, true) : bans.add(a) } },
  mode: 2,level: 3,hint: 'ban a user from the room'
}, {
  command: 'bans',
  callback: function(e, d, f) {
	  if(1 > config.bans.length) return basic.say("There aren't any banned users here.", e, f);d = [];
	  for(var a = config.bans.length - 1;0 <= a;a--) { d.push('(SELECT name FROM users WHERE id = "' + config.bans[a] + '") as ab' + a) }
	  client.query("SELECT " + d.join(", "), function(b) {
	    if(b) { return console.log(b) } var c = [];b = 0;
	    for(var a = config.bans.length - 1;0 <= a;a--) { eval("b[0].ab" + a) ? c.push(botti.db.strip(eval("b[0].ab" + a))) : b++ }
	    c = "Banned: " + c.join(", ");0 < b && (c = c + ", and " + b + " more.");basic.say(c, e, f)
	  })
	},
  mode: 2,level: 3,hint: 'lists banned users'
}, {
  command: 'unban',
  callback: function(d, b, e) {
	  if(b) {
	    if("all" == b && !basic.isown(d)) return basic.say("Owner option only, sorry.", d, e);
	    if("all" == b && basic.isown(d)) return config.bans = [], settings.save(), basic.say("Unbanned all", d, e);
	    if(1 > config.bans.length) return basic.say("There aren't any banned users here.", d, e);
	    if(-1 != config.bans.indexOf(b)) {
	      config.bans.splice(config.bans.indexOf(b), 1);var a = config.on.unban;a && (a = a.replace("{username}", b));basic.say(a, d, e);return settings.save();
	    }
	    for(var a = [], f = 0;f < config.bans.length;f++) { a.push('(SELECT name FROM users WHERE id = "' + config.bans[f] + '") as ab' + f) }
	    client.query("SELECT " + a.join(", "), function(c) {
	      if(c) return console.log(c);
	      for(c = 0;c < config.bans.length;c++) {
	        if(console.log(eval("b[0].ab" + c), b), botti.db.strip(eval("b[0].ab" + c)) == b) {
	          config.bans.splice(c, 1);var a = config.on.unban;a && (a = a.replace("{username}", b));basic.say(a, d, e);settings.save();
	        }
	      }
	    })
	  }
	},
  mode: 2,
  level: 3,
  hint: 'unbans a user'
}];