/*************************************************************************
 * @copyright 2012 yayramen.                                             *
 * @author yayramen                                                      *
 * @description This is the vips module                                  *
 *************************************************************************/

//Define Functions
global.vips = function(){};

vips.update = function(){ var a = false;
	config.hasOwnProperty("vips") || (config.vips = [], a = true);
	config.hasOwnProperty("vip") || (config.vip = { afk:false,queue:false }, a = true);
	a && settings.save();
	commands = botti._.union(commands, vips.commands);
};

vips.endsong = function(a) {
	if(core.currentdj && !vips.check(core.currentdj.userid) && core.djs.length >= config.songs.mindj) {
		if(config.songs.on && core.currentdj.count >= config.songs.max) limit.over(core.currentdj);
	}
};

vips.check = function(a) { if (config.vips.indexOf(a) !== -1) { return true; } else { return false; } };

vips.add = function(a, b) {
  -1 === config.vips.indexOf(a.userid) && config.vips.push(a.userid);
  basic.say(config.on.addvip, a.userid, b);settings.save();
};

//Hook Events
bot.on('booted', vips.update);
bot.on('endsong', vips.endsong);

//Define Commands
vips.commands = [{
  command: 'vip',
  callback: function(d, f, e) { if (!f) return;
	  var b = f.split(" "), g = b.shift(), b = b.join(" ");
	  if("add" == g) { if(!b) { return } var c = basic.find(b);c && vips.add(c, e) }
	  if("remove" == g) { if(!b) { return } 
	    if("all" == b && !basic.isown(d)) return basic.say("Owner option only, sorry.", d, e);
	    if("all" == b && basic.isown(d)) return config.vips = [], settings.save(), basic.say("Unvip'd errbody.", d, e);
	    if((c = basic.find(b)) && -1 !== config.vips.indexOf(c.userid)) {
	      return config.vips.splice(config.vips.indexOf(c.userid), 1), basic.say(config.on.remvip, c.userid, e), settings.save();
	    }
	    if(1 > config.vips.length) return basic.say("There aren't any VIP users here.", d, e);
	    b = [];for(c = 0;c < config.vips.length;c++) { b.push('(SELECT name FROM users WHERE id = "' + config.vips[c] + '") as ab' + c) }
	    client.query("SELECT " + b.join(", "), function(b) {
	      if(b) { return console.log(b) } for(b = 0;b < config.vips.length;b++) {
	        if(console.log(botti.db.strip(eval("b[0].ab" + b)), f), botti.db.strip(eval("b[0].ab" + b)) == f) {
	          config.vips.splice(b, 1);var c = config.on.remvip.replace("{username}", f);basic.say(c, d, e);settings.save();
	        }
	      }
	    })
	  }
	  "add" != g && "remove" != g && basic.say("Useage: /vip add @username, /vip remove @username [Owner Command] /vips to list [Everyone].", a, true)
	},
  mode: 2,level: 5,hint: '/vip add @user; /vip remove @user'
}, {
  command: 'vips',
  callback: function(e, d, f) {
	  if(1 > config.vips.length) return basic.say("There aren't any VIPs in here.", e, f);
	  d = [];for(var a = config.vips.length - 1;0 <= a;a--) { d.push('(SELECT name FROM users WHERE id = "' + config.vips[a] + '") as ab' + a) }
	  client.query("SELECT " + d.join(", "), function(a, b, c) { if (a) return console.log(a);var t = [];var s = 0;
	    for (var i = config.vips.length - 1; i >= 0; i--) {if (eval('b[0].ab'+i)) { t.push(botti.db.strip(eval('b[0].ab'+i))); }
	    else { s++ }; };var phrase = "VIPs: " + t.join(", ");if (s > 0) phrase = phrase + ", and "+s+" more.";basic.say(phrase, e, f);
	  })
	},
  mode: 2,level: 0,hint: 'lists vips'
}];