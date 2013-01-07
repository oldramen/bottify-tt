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
  var bcmds = bans.commands.filter(function(e){ return e.bare == true; });
  if(!bcmds) core.cmds.bare += []; else core.cmds.bare += bcmds.map(function(e){ return e.command; });
};

bans.check = function(c) {
  for(var a = 0;a < c.length;++a) { var b = c[a].userid;
    -1 < config.bans.indexOf(b) && (bot.bootUser(b, "You're banned from this room."), core.users.togreet.splice(core.users.togreet.indexOf(b), 1))
  };
};

bans.registered = function(a) { if (core.booted) bans.check(a.user); };

bans.add = function(a) {
  2 < basic.level(a) || (-1 === config.bans.indexOf(a.userid) && config.bans.push(a.userid), bot.bootUser(a.userid, config.on.banned), 
  	basic.say(config.on.ban, a.userid), Log(a.name + " was banned"), settings.save())
};

//Hook Events
bot.on('booted', bans.update);
bot.on('registered', bans.registered);

//Define Commands
bans.commands = [{
  command: 'ban',
  callback: function(c, a) { 
  	if(a) { 
  		console.log(a);
  		var b = basic.find(a);
  		console.log(b);
  		if (b) {
  			bans.add(b);
  		}
  	} 
  },
  mode: 2,level: 3,hint: 'ban a user from the room'
}, {
  command: 'bans',
  callback: function(e, d, f) {
	  if(1 > config.bans.length) return basic.say("There aren't any banned users here.", e, f);
	  d = [];for(var a = config.bans.length - 1;0 <= a;a--) { d.push('(SELECT name FROM users WHERE id = "' + config.bans[a] + '") as ab' + a) }

	client.query("SELECT " + d.join(", "), function(a, b, c) { if (a) return console.log(a);var t = [];var s = 0;
	  for (var i = config.bans.length - 1; i >= 0; i--) {if (eval('b[0].ab'+i)) { t.push(botti.db.strip(eval('b[0].ab'+i))); }
	  else { s++ }; };var phrase = "banned: " + t.join(", ");if (s > 0) phrase = phrase + ", and "+s+" more.";basic.say(phrase, e, f);
	})
  },
  mode: 2,level: 3,hint: 'lists banned users'
}, {
  command: 'unban',
  callback: function (x, y, z) {
    if (!y) return;
    if (y == "all" && !basic.isown(x)) return basic.say("Owner option only, sorry.",x,z);
    if (y == "all" && basic.isown(x)) return config.bans = [], settings.save(), basic.say("Unbanned all",x,z);
    if (config.bans.length < 1) return basic.say("There aren't any banned users here.", x, z);
    if (config.bans.indexOf(y) != -1) { var phrase = config.on.unban;
      config.bans.splice(config.bans.indexOf(y), 1);if (phrase) phrase = phrase.replace('{username}', y);
      basic.say(phrase, x, z);return settings.save();
    } var w = [];var v = 0;
    for (var i=0;i<config.bans.length;i++) { w.push('(SELECT name FROM users WHERE id = "'+config.bans[i]+'") as ab'+i); };
    client.query('SELECT '+w.join(", "), 
      function(a, b, c) { if (a) { return console.log(a); } var t = [];var s = 0;
        for (var i=0;i<config.bans.length;i++) { console.log(eval('b[0].ab'+i), y);
          if (botti.db.strip(eval('b[0].ab'+i)) == y) { config.bans.splice(i, 1);var phrase = config.on.unban;
            if (phrase) phrase = phrase.replace('{username}', y);basic.say(phrase, x, z);settings.save();
          }
        };
      }
    );
  },  mode: 2,  level: 3,  hint: 'unbans a user'
}];