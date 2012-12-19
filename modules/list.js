/*************************************************************************
 * @copyright 2012 yayramen.                                             *
 * @author yayramen                                                      *
 * @description This is the list module                                  *
 *************************************************************************/

//Define Functions
global.list = function(){};

list.update = function(){ var a = false;
	config.hasOwnProperty("whitelist") || (config.whitelist = false, a = true);
	config.hasOwnProperty("list") || (config.list = [], a = true);
	a && basic.save("settings");
	commands = botti._.union(commands, list.commands);
};

list.adddj = function(b) {
  var a = core.user[b.user[0].userid];
  if(a) { 
    if(config.whitelist && -1 === config.list.indexOf(a.userid)) {
      return bot.remDj(a.userid), Log(a.name + " was escorted: not on whitelist"), basic.say(msg.whitelist.notin, a.userid, !0)
    }
    a.droppedRoom = config.room;basic.updateidle(a);basic.save(a);Log(a.name + " started DJing");basic.say(config.on.adddj, b.user[0].userid);basic.refreshdjs();
    core.nextdj && core.currentdj && core.nextdj.userid == core.djs[0] && (b = core.djs.indexOf(core.currentdj.userid), b = b == core.djs.length - 1 ? 0 : b + 1, 
    	core.nextdj = core.user[core.djs[b]], core.nextdj.userid && basic.say(config.on.nextdj, core.nextdj.userid, !0))
  }
};

list.add = function(a) { -1 === config.list.indexOf(a.userid) && config.list.push(a.userid);basic.say(msg.whitelist.add, a.userid);basic.save("settings") };

//Hook Events
bot.on('booted', list.update);
bot.on('add_dj', list.adddj);

//Define Commands
list.commands = [{
  command: 'whitelist',
  callback: function(e, b, d) { if (!b) return;
	  var a = b.split(" ");b = a.shift();a = a.join(" ");"clear" == b && (config.list = []);
	  if("add" == b) { if(!a) { return } var c = basic.find(a);c && list.add(c) }
	  if("remove" == b) { if(!a) { return }
	    if((c = basic.find(a)) && -1 !== config.list.indexOf(c.userid)) {
	      return config.list.splice(config.list.indexOf(c.userid), 1), basic.say(config.msg.whitelist.remove, c.userid, d), basic.save("settings")
	    }
	    if(1 > config.list.length) return basic.say("There aren't any whitelisted users here.", x, z);
	    d = [];for(a = 0;a < config.list.length;a++) { d.push('(SELECT name FROM users WHERE id = "' + config.list[a] + '") as ab' + a) }
	    client.query("SELECT " + d.join(", "), function(a) { if(a) { return console.log(a) }
	      for(a = 0;a < config.list.length;a++) {
	        if(console.log(botti.db.strip(eval("b[0].ab" + a)), y), botti.db.strip(eval("b[0].ab" + a)) == y) {
	          config.list.splice(a, 1);var b = config.msg.whitelist.remove.replace("{username}", y);basic.say(b, x, z);basic.save("settings")
	        }
	      }
	    })
	  }
	  "add" != b && "remove" != b && basic.say("Useage: /whitelist clear to clear, /whitelist add @username, /whitelist remove @username [Mod Command] /whitelisted to list [Everyone].", e, !0)
	},
  mode: 2,level: 3,hint: '/whitelist add @user; /whitelist remove @user'
}, {
  command: 'whitelisted',
  callback: function(e, d, f) {
	  if(1 > config.list.length) return basic.say("There aren't any whitelisted users.", e, f);
	  d = [];for(var a = config.list.length - 1;0 <= a;a--) { d.push('(SELECT name FROM users WHERE id = "' + config.list[a] + '") as ab' + a) }
	  client.query("SELECT " + d.join(", "), function(b) { if(b) { return console.log(b) } var c = [];
	    b = 0;for(var a = config.list.length - 1;0 <= a;a--) { eval("b[0].ab" + a) ? c.push(botti.db.strip(eval("b[0].ab" + a))) : b++ }
	    c = "Whitelisted: " + c.join(", ");0 < b && (c = c + ", and " + b + " more.");basic.say(c, e, f)
	  })
	},
  mode: 2,level: 0,hint: 'lists whitelisted users'
}]