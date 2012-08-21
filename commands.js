/*************************************************************************
 * @copyright 2012 yayramen.                                             *
 * @author yayramen                                                      *
 * @description This is the commands file, which outlines the available  *
 * commands that a user can use to ineteract with the bot                *
 *************************************************************************/

global.commands = [{
  command: 'commands',
  callback: function (a, b, c) {
    var sCmds = [];
    commands.forEach(function (d) {
      if (GetLevel(core.user[a]) >= d.level && !d.hidden) sCmds.push(d.command);
    });
    var e = "Commands: /{cmds}";
    var e = e.replace('{cmds}', sCmds.join(', /'))
    Say(e, a, c)
  },
  mode: 2,
  level: 0,
  hint: 'Tells available actions'
},{
  command: 'q+',
  callback: function (a, b, c) {
    if (!config.queue.on) return Say(msg.queue.off, a, c);
    if (config.qued.indexOf(a) !== -1) return Say(msg.queue.alreadyin, a, c);
    if (core.djs.indexOf(a) !== -1) return Say(msg.queue.dj, a, c);
    if (core.djs.length < core.maxdjs && !config.qued.length) return Say(config.queue.open, a, c);
    config.qued.push(a);
    Save("settings");
    Say(msg.queue.add, a, c)
  },
  mode: 2,
  level: 0,
  bare: true,
  hint: 'Adds user to the queue'
}, {
  command: 'q-',
  callback: function (a, b, c) {
    if (!config.queue.on) return Say(msg.queue.off, a, c);
    if (config.qued.indexOf(a) == -1) return Say(msg.queue.notin, a, c);
    config.qued.splice(config.qued.indexOf(a), 1);
    Save("settings");
    Say(msg.queue.remove, a, c);
  },
  mode: 2,
  level: 0,
  bare: true,
  hint: 'Removes user from the queue'
}, {
  command: 'q',
  callback: function (a, b, c) {
    if (!config.queue.on) return Say(msg.queue.off, a, c);
    if (config.qued.length < 1) return Say(msg.queue.empty, a, c);
    var sList = [];var s = 0;
    for (var i = 0; i < config.qued.length; i++) {
      if (core.user[config.qued[i]]) { sList.push(core.user[config.qued[i]].name); }
      else { s++ };
    }
    var msg2 = msg.queue.users.replace('{queueusers}', sList.join(', '));
    if (s > 0) msg2 = msg2 + ", and "+s+" more.";
    Say(msg2, a, c);
  },
  mode: 2,
  level: 0,
  bare: true,
  hint: 'lists the people in the queue'
}, {
  command: 'push',
  callback: function (a, b, c) {
    var d = Find(b); 
    if (d) {
      if (config.qued.indexOf(d.userid) !== -1) config.qued.splice(config.qued.indexOf(d.userid), 1);
      config.qued.unshift(d.userid);
      Save("settings");
      Say(msg.queue.modadd, d.userid, false);
    }
    config.qued.unshift()
  },
  mode: 2,
  level: 3,
  hint: 'pushes user to the front of the queue'

}, {
  command: 'pull',
  callback: function (a, b, c) {
    if (b == 'all') {
      config.qued = [];
      return Say("Cleared the queue");
    }
    var d = Find(b);
    if (d) {
      if (config.qued.indexOf(d.userid) == -1) return;
      config.qued.splice(config.qued.indexOf(d.userid), 1);
      Save("settings");
      Say(msg.queue.modremove, d.userid, false);
    }
    config.qued.unshift()
  },
  mode: 2,
  level: 3,
  hint: 'pushes user to the front of the queue'

}, {
  command: 'last',
  callback: function (a, b, c) {
    Say(core.lastsong, a, c);
  },
  mode: 2,
  level: 0,
  hint: 'says details about the last song'
}, {
  command: 'hug',
  callback: function (a, b, c) {
    Say("/me hugs {username}", a, c);
  },
  mode: 2,
  level: 0,
  hidden: true,
  hint: 'hugs user'
}, {
  command: 'resetall',
  callback: function (a, b, c) {
    for (var i = 0; i < core.djs.length; i++) {
      if (core.djs[i] != config.uid) {
        var sUser = core.user[core.djs[i]];
        sUser.count = 0;
      }
    }
    Say(msg.reset.all, null, c);
  },
  mode: 2,
  level: config.modsongs ? 3 : 5,
  hint: 'resets all song counts to 0'
}, {
  command: 'reset',
  callback: function (a, b, c) {
    var d = Find(b);
    if (d) {
      console.log('found');
      d.count = 0;
      d.waiting = 0;
      Say(msg.reset.dj, d.userid, c);
    } else { console.log('nope') }
  },
  mode: 2,
  level: config.modsongs ? 3 : 5,
  hint: 'resets song count for dj'
}, {
  command: 'ban',
  callback: function (a, b, c) {
    if (!b) return;
    var d = Find(b);
    if (d) Ban(d);
  },
  mode: 2,
  level: 3,
  hint: 'ban a user from the room'
}, {
  command: 'bans',
  callback: function (x, y, z) {
    if (config.bans.length < 1) return Say("There aren't any banned users here.", x, z);
    var w = [];var v = 0;
    for (var i = config.bans.length - 1; i >= 0; i--) {
      w.push('(SELECT name FROM users WHERE id = "'+config.bans[i]+'") as ab'+i);
    };
    client.query('SELECT '+w.join(", "), 
      function(a, b, c) {
        if (a) return console.log(a);
        var t = [];var s = 0;
        for (var i = config.bans.length - 1; i >= 0; i--) {
          if (eval('b[0].ab'+i)) { t.push(botti.db.strip(eval('b[0].ab'+i))); }
          else { s++ };
        };
        var phrase = "Banned: " + t.join(", ");
        if (s > 0) phrase = phrase + ", and "+s+" more.";
        Say(phrase, x, z);
      }
    );
  },
  mode: 2,
  level: 3,
  hint: 'lists banned users'
}, {
  command: 'unban',
  callback: function (x, y, z) {
    if (!y) return;
    if (config.bans.length < 1) return Say("There aren't any banned users here.", x, z);
    var w = [];var v = 0;
    for (var i=0;i<config.bans.length;i++) {
      w.push('(SELECT name FROM users WHERE id = "'+config.bans[i]+'") as ab'+i);
    };
    client.query('SELECT '+w.join(", "), 
      function(a, b, c) {
        if (a) return console.log(a);
        var t = [];var s = 0;
        for (var i=0;i<config.bans.length;i++) {
          console.log(eval('b[0].ab'+i), y);
          if (botti.db.strip(eval('b[0].ab'+i)) == y) {
            config.bans.splice(i, 1);
            var phrase = config.on.unban.replace('{username}', y);
            Say(phrase, x, z);
            Save("settings");
          }
        };
      }
    );
  },
  mode: 2,
  level: 3,
  hint: 'unbans a user'
}, {
  command: 'mods',
  callback: function (x, y, z) {
    if (core.mods.length < 1) return Say("There aren't any mods. Hrm, something's wrong.", x, z);
    var w = [];var v = 0;
    for (var i = core.mods.length - 1; i >= 0; i--) {
      w.push('(SELECT name FROM users WHERE id = "'+core.mods[i]+'") as ab'+i);
    };
    client.query('SELECT '+w.join(", "), 
      function(a, b, c) {
        if (a) return console.log(a);
        var t = [];var s = 0;
        for (var i = core.mods.length - 1; i >= 0; i--) {
          if (eval('b[0].ab'+i)) { t.push(botti.db.strip(eval('b[0].ab'+i))); }
          else { s++ };
        };
        var phrase = "Mods: " + t.join(", ");
        if (s > 0) phrase = phrase + ", and "+s+" more.";
        Say(phrase, x, z);
      }
    );
  },
  mode: 2,
  level: 0,
  hint: 'lists mods'
}, {
  command: 'vip',
  callback: function (a, b, c) {
    if (!b) return;
    var s0 = b.split(' ');
    var s1 = s0.shift();
    var s2 = s0.join(' ');
    if (s1 == "add") {
      if (!s2) return;
      var d = Find(s2);
      if (d) Vip(d);
    };
    if (s1 == "remove") {
      if (!s2) return;
      var d = Find(s2);
      if (d) {
        if (config.vips.indexOf(d.userid) !== -1) {
          config.vips.splice(config.vips.indexOf(d.userid), 1);
          Say(config.on.remvip, d.userid, c);
          return Save("settings");
        }
      }
      if (config.vips.length < 1) return Say("There aren't any VIP users here.", x, z);
      var w = [];var v = 0;
      for (var i=0;i<config.vips.length;i++) {
        w.push('(SELECT name FROM users WHERE id = "'+config.vips[i]+'") as ab'+i);
      };
      client.query('SELECT '+w.join(", "), 
        function(a, b, c) {
          if (a) return console.log(a);
          var t = [];var s = 0;
          for (var i=0;i<config.vips.length;i++) {
            console.log(botti.db.strip(eval('b[0].ab'+i)), y);
            if (botti.db.strip(eval('b[0].ab'+i)) == y) {
              config.vips.splice(i, 1);
              var phrase = config.on.remvip.replace('{username}', y);
              Say(phrase, x, z);
              Save("settings");
            }
          };
        }
      );
    };
    if (s1 != 'add' && s1 != 'remove') Say("Useage: /vip add @username, /vip remove @username [Owner Command] /vips to list [Everyone].", a, true);
  },
  mode: 2,
  level: 5,
  hint: '/vip add @user; /vip remove @user'
}, {
  command: 'vips',
  callback: function (x, y, z) {
    if (config.vips.length < 1) return Say("There aren't any VIPs in here.", x, z);
    var w = [];var v = 0;
    for (var i = config.vips.length - 1; i >= 0; i--) {
      w.push('(SELECT name FROM users WHERE id = "'+config.vips[i]+'") as ab'+i);
    };
    client.query('SELECT '+w.join(", "), 
      function(a, b, c) {
        if (a) return console.log(a);
        var t = [];var s = 0;
        for (var i = config.vips.length - 1; i >= 0; i--) {
          if (eval('b[0].ab'+i)) { t.push(botti.db.strip(eval('b[0].ab'+i))); }
          else { s++ };
        };
        var phrase = "VIPs: " + t.join(", ");
        if (s > 0) phrase = phrase + ", and "+s+" more.";
        Say(phrase, x, z);
      }
    );
  },
  mode: 2,
  level: 0,
  hint: 'lists vips'
}, {
  command: 'userid',
  callback: function (x, y, z) {
    if (!y) Say("{username}'s userid: {userid}", x, z);
    var a = Find(y);
    if (a) Say("{username}'s userid: {userid}", a.userid, z);

  },
  mode: 2,
  level: 0,
  hint: 'lists userid'
}, {
  command: 'whitelist',
  callback: function (a, b, c) {
    if (!b) return;
    var s0 = b.split(' ');
    var s1 = s0.shift();
    var s2 = s0.join(' ');
    if (s1 == "clear") {
      config.list= [];
    };
    if (s1 == "add") {
      if (!s2) return;
      var d = Find(s2);
      if (d) Whitelist(d);
    };
    if (s1 == "remove") {
      if (!s2) return;
      var d = Find(s2);
      if (d) {
        if (config.list.indexOf(d.userid) !== -1) {
          config.list.splice(config.list.indexOf(d.userid), 1);
          Say(msg.whitelist.remove, d.userid, c);
          return Save("settings");
        }
      }
      if (config.list.length < 1) return Say("There aren't any whitelisted users here.", x, z);
      var w = [];var v = 0;
      for (var i=0;i<config.list.length;i++) {
        w.push('(SELECT name FROM users WHERE id = "'+config.list[i]+'") as ab'+i);
      };
      client.query('SELECT '+w.join(", "), 
        function(a, b, c) {
          if (a) return console.log(a);
          var t = [];var s = 0;
          for (var i=0;i<config.list.length;i++) {
            console.log(botti.db.strip(eval('b[0].ab'+i)), y);
            if (botti.db.strip(eval('b[0].ab'+i)) == y) {
              config.list.splice(i, 1);
              var phrase = msg.whitelist.remove.replace('{username}', y);
              Say(phrase, x, z);
              Save("settings");
            }
          };
        }
      );
    };
    if (s1 != 'add' && s1 != 'remove') Say("Useage: /whitelist clear to clear, /whitelist add @username, /whitelist remove @username [Mod Command] /whitelisted to list [Everyone].", a, true)
  },
  mode: 2,
  level: 3,
  hint: '/whitelist add @user; /whitelist remove @user'
}, {
  command: 'whitelisted',
  callback: function (x, y, z) {
    if (config.list.length < 1) return Say("There aren't any whitelisted users.", x, z);
    var w = [];var v = 0;
    for (var i = config.list.length - 1; i >= 0; i--) {
      w.push('(SELECT name FROM users WHERE id = "'+config.list[i]+'") as ab'+i);
    };
    client.query('SELECT '+w.join(", "), 
      function(a, b, c) {
        if (a) return console.log(a);
        var t = [];var s = 0;
        for (var i = config.list.length - 1; i >= 0; i--) {
          if (eval('b[0].ab'+i)) { t.push(botti.db.strip(eval('b[0].ab'+i))); }
          else { s++ };
        };
        var phrase = "Whitelisted: " + t.join(", ");
        if (s > 0) phrase = phrase + ", and "+s+" more.";
        Say(phrase, x, z);
      }
    );
  },
  mode: 2,
  level: 5,
  hint: 'lists whitelisted users'
}, {
  command: 'promote',
  callback: function (a, b, c) {
    if (!b) return;
    if (config.owners.indexOf(a) === -1) return Say("You can't promote people, sorry.", a, c);
    var d = Find(b);
    if (d) Promote(d);
  },
  mode: 2,
  level: 5,
  hidden: true,
  hint: 'Promote a user to owner'
}, {
  command: 'owners',
  callback: function (x, y, z) {
    if (config.owns.length < 1) return Say("There aren't any owners. Hrm, something's wrong.", x, z);
    var w = [];var v = 0;
    for (var i = config.owns.length - 1; i >= 0; i--) {
      w.push('(SELECT name FROM users WHERE id = "'+config.owns[i]+'") as ab'+i);
    };
    client.query('SELECT '+w.join(", "), 
      function(a, b, c) {
        if (a) return console.log(a);
        var t = [];var s = 0;
        for (var i = config.owns.length - 1; i >= 0; i--) {
          if (eval('b[0].ab'+i)) { t.push(botti.db.strip(eval('b[0].ab'+i))); }
          else { s++ };
        };
        var phrase = "Owners: " + t.join(", ");
        if (s > 0) phrase = phrase + ", and "+s+" more.";
        Say(phrase, x, z);
      }
    );
  },
  mode: 2,
  level: 0,
  hint: 'lists owners'
}, {
  command: 'demote',
  callback: function (x, y, z) {
    if (config.owners.indexOf(x) === -1) return Say("You can't demote people, sorry.", a, c);
    var d = Find(y);
    if (d) {
      if (config.owns.indexOf(d.userid) !== -1) {
        config.owns.splice(config.owns.indexOf(d.userid), 1);
        Say(msg.owner.remove, d.userid, z);
        return Save("settings");
      }    
    };
    if (config.owns.length < 1) return Say("There aren't any owners here.", x, z);
    var w = [];var v = 0;
    for (var i=0;i<config.owns.length;i++) {
      w.push('(SELECT name FROM users WHERE id = "'+config.owns[i]+'") as ab'+i);
    };
    client.query('SELECT '+w.join(", "), 
      function(a, b, c) {
        if (a) return console.log(a);
        var t = [];var s = 0;
        for (var i=0;i<config.owns.length;i++) {
          console.log(botti.db.strip(eval('b[0].ab'+i)), y);
          if (botti.db.strip(eval('b[0].ab'+i)) == y) {
            config.owns.splice(i, 1);
            var phrase = msg.owner.remove.replace('{username}', y);
            Say(phrase, x, z);
            Save("settings");
          }
        };
      }
    );
  },
  mode: 2,
  level: 5,
  hidden: true,
  hint: 'demotes a user'
}, {
  command: 'mylevel',
  callback: function (a, b, c) {
    Say("" + GetLevel(core.user[a]) + "");
  },
  mode: 2,
  level: 0,
  hidden: true,
  hint: 'says level'
}, {
  command: 'maul',
  callback: function (a, b, c) {
    var d = Find(b);
    if (d) RemoveDJ(d);
  },
  mode: 2,
  level: 3,
  hint: 'removes a dj'
}, {
  command: 'gtfo',
  callback: function (a, b, c) {
    var d = Find(b);
    if (d) Kick(d);
  },
  mode: 2,
  level: 3,
  hint: 'boots a user'
}, {
  command: 'go',
  callback: function (a, b, c) {
    if (!b) return Say('You must provide a room id.', a, c);
    if (b == 'home') return bot.roomRegister(config.room);
    core.moving = setTimeout(Homeward, 15000);
    Log('Registering in room ' + b);
    return bot.roomRegister(b);
  },
  level: 5,
  mode: 2,
  hint: "Moves the bot from room to room"
}, {
  command: 'djs',
  callback: function (a, b, c) {
    if (!b) {
      var sDJSongCount = [];
      for (var i = 0; i < core.djs.length; i++) {
        if (core.djs[i] != config.uid) {
          var sUser = core.user[core.djs[i]];
          if (sUser) sDJSongCount.push(sUser.name + ": " + sUser.count);
        }
      }
      var msg2 = msg.djs.replace('{djsandsongcount}', sDJSongCount.join(', '));
      if (sDJSongCount.length < 1) msg2 = "Sorry, I don't see any DJs";
      return Say(msg2, a, c);
    };
  },
  mode: 2,
  level: 0,
  hint: "Song count for the DJs."
}, {
  command: 'waiting',
  callback: function (a, b, c) {
    var d = [];
    var sUserIDs = botti._.keys(core.user);
    sUserIDs.splice(0, 1);
    for (var i = 0; i < sUserIDs.length; ++i) {
      var sUserID = sUserIDs[i];
      var sUser = core.user[sUserID];
      if (sUser.waiting > 0) {
        d.push(sUser.name + ": " + sUser.waiting);
      }
    };
    if (d.length < 1) return Say("No one's waiting.", a, c);
    var msg = "Waiting: " + d.join(", ");
    Say(msg, a, c);
  },
  mode: 2,
  level: 0,
  hint: "Tells how long djs have to wait to play again."
}, {
  command: 'stagedive',
  message: ["{username} is surfing the crowd!", "Oops! {username} lost a shoe sufing the crowd.", "Wooo! {username}'s surfin' the crowd! Now to figure out where the wheelchair came from...", "Well, {username} is surfing the crowd, but where did they get a raft...", "{username} dived off the stage...too bad no one in the audience caught them.", "{username} tried to jump off the stage, but kicked their laptop. Ouch.", "{username} said they were going to do a stagedive, but they just walked off.", "And {username} is surfing the crowd! But why are they shirtless?", "{username} just traumatized us all by squashing that poor kid up front."],
  callback: function (a, b) {
    if (core.djs.indexOf(a) === -1) return;
    var sMessage = Random(this.message);
    Say(sMessage, a);
    bot.remDj(a);
  },
  level: 0,
  mode: 2,
  hint: "Removes if DJ"
}, {
  command: 'vote',
  callback: function (a, b, c, d) {
    if (!d) return;
    if (b == 'up') bot.vote('up');
    if (b == 'down') bot.vote('down');
  },
  mode: 2,
  level: config.modbop ? 3 : 0,
  hidden: true,
  hint: 'makes the bot awesome'
}, {
  command: 'bop',
  callback: function (a, b, c) {
    bot.vote('up');
    Say(config.dance);
  },
  mode: 2,
  level: config.modbop ? 3 : 0,
  hidden: true,
  hint: 'makes the bot awesome'
}, {
  command: 'hulk',
  message: ["This is my favorite dubstep.", "I just want to hump the speaker.", "You are an idiot."],
  callback: function (a, b, c) {
    bot.vote('up');
    Say(Random(this.message));
  },
  mode: 2,
  level: config.modbop ? 3 : 0,
  hidden: true,
  hint: 'makes the bot awesome'
}, {
  command: 'dance',
  callback: function (a, b, c) {
    bot.vote('up');
    Say(config.dance);
  },
  mode: 2,
  level: config.modbop ? 3 : 0,
  hint: 'makes the bot awesome'
}, {
  command: 'party',
  callback: function (a, b, c) {
    bot.vote('up');
    Say(msg.party);
  },
  mode: 2,
  level: config.modbop ? 3 : 0,
  hint: 'makes the bot awesome'
}, {
  command: 'afks',
  callback: function (a, b, c) {
    var sDJAfkCount = [];
    for (var sDJ in core.djs) {
      var sUser = core.user[core.djs[sDJ]];
      if (sUser) {
        var sAfkTime = sUser.afk;
        var sAge = Date.now() - sAfkTime;
        var sAge_Minutes = Math.floor(sAge / 1000 / 60);
        sDJAfkCount.push(sUser.name + ": " + sAge_Minutes + 'm');
      }
    }
    Say("AFK Timer: " + sDJAfkCount.join(', '), a, c);
  },
  mode: 2,
  level: 0,
  hint: "Tells the current afk timer for the DJs."
}, {
  command: 'status',
  callback: function (a, b, c) {
    var msg2 = "Limit: {limits}/{maxsongs}/{waitsongs}, Queue: {queueon}, AFK: {afk}, Warn: {warn}, Lonely: {lonely}";
    if (b == 'full') msg2 = msg2 + ", Greeting:{greeting}, Help:{help}, Theme: {theme}, "
    Say(msg2, a, c);
  },
  mode: 2,
  level: 0,
  hint: 'lists the current settings'
}, {
  command: 'lastcmd',
  callback: function (a, b, c) {
    Say(core.lastcmd, a, c);
  },
  mode: 2,
  level: 3,
  hint: 'shows the last used command'
}, {
  command: 'bootaftersong',
  callback: function (a, b, c) {
    var d = core.user[a];
    if (!d) return;
    d.boot = true;
    Say("Will kick you after your next!", a, c);
  },
  mode: 2,
  level: 0,
  hint: 'Bot will remove you after your next song.'
}, {
  command: 'theme',
  callback: function (a, b, c) {
    Say(msg.theme, a, c);
  },
  mode: 2,
  level: 0,
  bare: true,
  hint: 'tells the room theme'
}, {
  command: 'weather',
  callback: function (a, b, c) {
    if (b) b = escape(b);
    if (!b) Say("http://lmgtfy.com/?q=the+weather", a, c);
    if (b) Say("http://lmgtfy.com/?q=the+weather+in+"+b, a, c);
  },
  mode: 2,
  level: 0,
  hidden: true,
  hint: 'tells the weather'
}, {
  command: 'help',
  callback: function (a, b, c) {
    Say(config.on.help, a, c);
  },
  mode: 2,
  level: 0,
  bare: true,
  hint: 'says the help message'
}, {
  command: 'user',
  callback: function (a, b ,c, q) {
    if (!core.set.using) {
      var d = Find(b);
      if (d) {
        core.set.using = true;
        core.set.setted = d;
        core.set.setter = a;
        if (!q) Say("You have selected "+d.name+".", a, c);
        return core.set.timeout = setTimeout(function () {
          core.set.using = false;
          core.set.setted = null;
          core.set.setter = null;
          core.set.temp = null;
          Say("User has been deselected.", a, c);
        }, 60000)
      }
    };
    if (!b) return;
    var s0 = b.split(' ');
    var s1 = s0.shift();
    var s2 = s0.join(' ');
    if (s1 == "most") {
      if (!s2) return Say("Most what? Awesomed? Snagged? Lamed?");
      if (s2 == "awesome" || s2 == "awesomed") {
        client.query('SELECT * FROM songs WHERE djid="'+core.set.setted.userid+'" ORDER BY up DESC LIMIT 1',
          function(x, y, z) {
            var w = y[0];
            if (!w) { Say("I got nothing, sorry."); } else {
            var phrase = msg.user.most.awesomed.replace('{title}', w.name).replace('{upvotes}', w.up);
            Say(phrase, core.set.setted.userid, c);
            clearTimeout(core.set.timeout);
            core.set.using = false;
            core.set.setted = null;
            core.set.setter = null; }
          }
        );
      }
      if (s2 == "lamed" || s2 == "lames") {
        client.query('SELECT * FROM songs WHERE djid="'+core.set.setted.userid+'" ORDER BY down DESC LIMIT 1',
          function(x, y, z) {
            var w = y[0];
            if (!w) { Say("I got nothing, sorry."); } else {
            var phrase = msg.user.most.lamed.replace('{title}', w.name).replace('{downvotes}', w.down);
            Say(phrase, core.set.setted.userid, c);
            clearTimeout(core.set.timeout);
            core.set.using = false;
            core.set.setted = null;
            core.set.setter = null; }
          }
        );
      }
      if (s2 == "snagged" || s2 == "hearted") {
        client.query('SELECT * FROM songs WHERE djid="'+core.set.setted.userid+'" ORDER BY hearts DESC LIMIT 1',
          function(x, y, z) {
            var w = y[0];
            if (!w) { Say("I got nothing, sorry."); } else {
            var phrase = msg.user.most.hearted.replace('{title}', w.name).replace('{heart}', w.hearts);
            Say(phrase, core.set.setted.userid, c);
            clearTimeout(core.set.timeout);
            core.set.using = false;
            core.set.setted = null;
            core.set.setter = null; }
          }
        );
      }
    };//
    if (s1 == "past") {
      if (!s2) return Say("Past what? Day? Or Week?");
      if (s2 == "day") {
        client.query('SELECT count(*) AS tracks, sum(hearts) AS snagged, sum(up) AS upvotes, sum(down) AS downvotes FROM '
          + 'songs WHERE time > DATE_SUB(NOW(), INTERVAL 1 DAY) AND djid LIKE \'' + core.set.setted.userid + '\'',
          function(x, y, z) {
            if (!y[0]) { Say("I got nothing, sorry."); } else {
            var phrase = msg.user.past.day.replace('{songs}', y[0]['tracks'])
              .replace('{ups}', y[0]['upvotes'])
              .replace('{downs}', y[0]['downvotes'])
              .replace('{hearts}', y[0]['snagged']);
            Say(phrase, core.set.setted.userid, c);
            clearTimeout(core.set.timeout);
            core.set.using = false;
            core.set.setted = null;
            core.set.setter = null; }
          }
        );
      };
      if (s2 == "week") {
        client.query('SELECT count(*) AS tracks, sum(hearts) AS snagged, sum(up) AS upvotes, sum(down) AS downvotes FROM '
          + 'songs WHERE time > DATE_SUB(NOW(), INTERVAL 1 WEEK) AND djid LIKE \'' + core.set.setted.userid + '\'',
          function(x, y, z) {
            if (!y[0]) { Say("I got nothing, sorry."); } else {
            var phrase = msg.user.past.day.replace('{songs}', y[0]['tracks'])
              .replace('{ups}', y[0]['upvotes'])
              .replace('{downs}', y[0]['downvotes'])
              .replace('{hearts}', y[0]['snagged']);
            Say(phrase, core.set.setted.userid, c);
            clearTimeout(core.set.timeout);
            core.set.using = false;
            core.set.setted = null;
            core.set.setter = null; }
          }
        );
      };
    }
  },
  mode: 2,
  level: 3,
  hint: "Select a user for various things"
}, {
  command: 'greet',
  callback: function (a, b, c) {
    if (core.set.using && a == core.set.setter) {
      if (b.indexOf('{username}') < 0 && GetLevel(core.user[core.set.setter]) < 5) return Say("Greeting must contain '{username}'.");
      core.set.temp = b;core.set.temp2 = "greet";
      Say(core.set.setted.name + ", your new greeting is: " + core.set.temp +". Type /setgreet to accept, or /badgreet to deny.", core.set.setted, c);
    };
  },
  mode: 2,
  level: 3,
  hint: "Sets a greeting for a user, use /greet @username to start"
}, {
  command: 'setgreet',
  callback: function(a,b,c) {
    if (a != core.set.setted.userid || !core.set.temp || core.set.temp2 != "greet") return;
    clearTimeout(core.set.timeout);
    core.set.setted.greeting = core.set.temp;
    Say(core.set.setted.name + "'s greeting is now: " + core.set.setted.greeting, core.set.setted.userid, c);
    Save(core.set.setted);
    core.set.using = false;
    core.set.setted = null;
    core.set.setter = null;
    core.set.temp = null;core.set.temp2 = null;
  },
  mode: 2,
  level: 0,
  hidden: true,
  hint: 'accept a greeting'
}, {
  command: 'badgreet',
  callback: function(a,b,c) {
    if (a != core.set.setted.userid || !core.set.temp || !core.set.temp2) return;
    clearTimeout(core.set.timeout);
    Say(core.set.setted.name + " denied the greeting.", core.set.setter, c);
    core.set.using = false;
    core.set.setted = null;
    core.set.setter = null;
    core.set.temp = null;core.set.temp2 = null;
  },
  mode: 2,
  level: 0,
  hidden: true,
  hint: 'deny a greeting'
}, {
  command: 'setsongs',
  callback: function (a, b, c) {
    if (core.set.using && a == core.set.setter) {
      clearTimeout(core.set.timeout);
      core.set.timeout = null;
      if (isNaN(b)) {
        core.set.using = false;
        core.set.setted = null;
        core.set.setter = null;
        return Say("Use your numbers, foo.");
      }
      if (b > 500) b = 500;
      core.set.setted.count = b;
      Say("Set " + core.set.setted.name + " to " + b + " songs.", a, c);
      Save(core.set.setted);
      core.set.using = false;
      core.set.setted = null;
      core.set.setter = null;
    };
  },
  mode: 2,
  level: 5,
  hint: "Sets songs for a user"
}, {
  command: 'hop',
  callback: function (a, b, c) {
    if (config.lonely) return Say(msg.song.lonely, a, c);
    if (!config.dj) return Say(msg.song.nodj, a, c);
    if (b == 'up') bot.addDj();
    if (b == 'down') bot.remDj(config.uid);
  },
  level: 3,
  hint: "Makes the bot DJ",
  mode: 2,
  hidden: true
}, {
  command: 'ragequit',
  callback: function (a, b, c) {
    bot.bootUser(a, "Lol they mad.");
  },
  level: 0,
  hint: "boots user",
  mode: 2,
  hidden: true
}, {
  command: 'song',
  callback: function (a, b, c) {
    if (!b) return Say(this.hint, a, c);
    if (b == 'skip' && core.currentdj.userid == config.uid) return bot.stopSong();
    if (!config.dj) return Say(msg.song.nodj, a, c);
    if (b == 'skip' && core.currentdj.userid != config.uid) {
      bot.playlistAll(function (z) {
        if (z.list.length == 0) return;
        var i = z.list.length - 1;
        var msg2 = msg.song.skip.replace('{skippedsong}', z.list[0].metadata.song).replace('{nextsong}', z.list[1].metadata.song);
        Say(msg2, a, c)
        return bot.playlistReorder(0, i);
      });
    };
    if (b == 'requeue') {
      bot.playlistAll(function (z) {
        if (z.list.length == 0) return;
        var i = z.list.length - 1;
        bot.playlistReorder(i, 0);
        var msg2 = msg.song.requeue.replace('{bottomsong}', z.list[i].metadata.song);
        return Say(msg2, a, c)
      });
    };
    if (b == 'shuffle') {
      return Say("Hrm, I seem to have forgotten how to shuffle.", a, c);
      var sTotal = [];
      bot.playlistAll(function (z) {
        for (var i = 0; i < z.list.length; ++i) {
          sTotal[i] = i;
        }
        var sRand = Shuffle(sTotal);
        for (var i = 0; i < z.list.length; ++i) {
          bot.playlistReorder(i, sRand[i]);
        }
        return Say(msg.song.shuffle, a, c);
      });
    };
    if (b == 'add') {
      bot.playlistAll(function (z) {
        bot.playlistAdd(core.currentsong.id, z.list.length);
        var msg2 = msg.song.add.replace('{currentsong}', core.currentsong.name);
        return Say(msg2, a, c);
      });
    };
    if (b == 'remove') {
      if (core.currentdj.userid != config.uid) return Say(msg.song.noremove, a, c);
      bot.playlistAll(function (z) {
        if (z.list.length == 0) return;
        var i = z.list.length - 1;
        bot.stopSong();
        var msg2 = msg.song.remove.replace('{lastsong}', z.list[i].metadata.song);
        Say(msg2, a, c);
        return bot.playlistRemove(i);
      });
    };
    if (b == 'next') {
      bot.playlistAll(function (z) {
        if (z.list.length == 0) return;
        var msg2 = msg.song.next.replace('{next}', z.list[0].metadata.song).replace('{artist}', z.list[0].metadata.artist);
        return Say(msg2, a, c)
      });
    };
    if (b == 'total') {
      bot.playlistAll(function (z) {
        if (z.list.length == 0) return;
        var msg2 = msg.song.total.replace('{songtotal}', z.list.length);
        return Say(msg2, a, c);
      });
    };
  },
  level: 3,
  hint: "song skip (skips song), song add (adds current song to queue), song remove (removes last played song from queue), song next (lists next song), song total (total songs in queue).",
  mode: 2,
  hidden: true
}, {
  command: 'album',
  callback: function (a, b, c) {
    var msg2 = msg.album.replace('{title}', core.currentsong.name).replace('{album}', core.currentsong.album);
    Say(msg2, a, c)
  },
  level: 0,
  hint: "Get the album",
  hidden: true,
  mode: 2
}, {
  command: 'say',
  callback: function (a, b, c, z) {
    Say(b, a, false, z);
  },
  level: 5,
  hidden: true,
  mode: 1
}, {
  command: 'my',
  callback: function(a,b,c) {
    if (!b) return Say(this.hint, a, c);
    var s0 = b.split(' ');
    var s1 = s0.shift();
    var s2 = s0.join(' ');
    if (s1 == "most") {
      if (!s2) return Say("Most what? Awesomed? Snagged? Lamed?");
      if (s2 == "awesome" || s2 == "awesomed") {
        client.query('SELECT * FROM songs WHERE djid="'+a+'" ORDER BY up DESC LIMIT 1',
          function(x, y, z) {
            var w = y[0];
            if (!w) { Say("I got nothing, sorry."); } else {
            var phrase = msg.my.most.awesomed.replace('{title}', w.name).replace('{upvotes}', w.up);
            Say(phrase, a, c); }
          }
        );
      }
      if (s2 == "lamed" || s2 == "lames") {
        client.query('SELECT * FROM songs WHERE djid="'+a+'" ORDER BY down DESC LIMIT 1',
          function(x, y, z) {
            var w = y[0];
            if (!w) { Say("I got nothing, sorry."); } else {
            var phrase = msg.my.most.lamed.replace('{title}', w.name).replace('{downvotes}', w.down);
            Say(phrase, a, c); }
          }
        );
      }
      if (s2 == "snagged" || s2 == "hearted") {
        client.query('SELECT * FROM songs WHERE djid="'+a+'" ORDER BY hearts DESC LIMIT 1',
          function(x, y, z) {
            var w = y[0];
            if (!w) { Say("I got nothing, sorry."); } else {
            var phrase = msg.my.most.hearted.replace('{title}', w.name).replace('{heart}', w.hearts);
            Say(phrase, a, c); }
          }
        );
      }
    };//
    if (s1 == "past") {
      if (s2 == "day") {
      if (!s2) return Say("Past what? Day? Or Week?");
        client.query('SELECT count(*) AS tracks, sum(hearts) AS snagged, sum(up) AS upvotes, sum(down) AS downvotes FROM '
          + 'songs WHERE time > DATE_SUB(NOW(), INTERVAL 1 DAY) AND djid LIKE \'' + a + '\'',
          function(x, y, z) {
            if (!y[0]) { Say("I got nothing, sorry."); } else {
            var phrase = msg.my.past.day.replace('{songs}', y[0]['tracks'])
              .replace('{ups}', y[0]['upvotes'])
              .replace('{downs}', y[0]['downvotes'])
              .replace('{hearts}', y[0]['snagged']);
            Say(phrase, a, c); }
          }
        );
      };
      if (s2 == "week") {
        client.query('SELECT count(*) AS tracks, sum(hearts) AS snagged, sum(up) AS upvotes, sum(down) AS downvotes FROM '
          + 'songs WHERE time > DATE_SUB(NOW(), INTERVAL 1 WEEK) AND djid LIKE \'' + a + '\'',
          function(x, y, z) {
            if (!y[0]) { Say("I got nothing, sorry."); } else {
            var phrase = msg.my.past.week.replace('{songs}', y[0]['tracks'])
              .replace('{ups}', y[0]['upvotes'])
              .replace('{downs}', y[0]['downvotes'])
              .replace('{hearts}', y[0]['snagged']);
            Say(phrase, a, c); }
          }
        );
      };
    }
    if (s1 == "stats") {
      var d = core.user[a];
      var phrase = msg.userinfo.replace('{heart_count}', d.hearts).replace('{given_count}', d.given).replace('{total_songs}', d.songs).replace('{heart_percentage}', Round(d.hearts / d.songs * 100, 2))
      Say(phrase, a, c)
    }
    if (s1 == "greeting") {
      var d = core.user[a];
      return Say("Your greeting is: "+d.greeting, a, c)
    }
  },
  level: 0,
  mode: 2,
  hint: "User stats: /my most [awesomed/lamed/snagged] && /my past [day/week] && /my stats"
}, {
  command: 'rooms',
  callback: function(a,b,c) {
    if (!b) return;
    var s0 = b.split(' ');
    var s1 = s0.shift();
    var s2 = s0.join(' ');
    if (s1 == "most") {
      if (!s2) return Say("Most what? Awesomed? Snagged? Lamed?");
      if (s2 == "awesome" || s2 == "awesomed") {
        client.query('SELECT * FROM '+config.file+' ORDER BY up DESC LIMIT 1',
          function(x, y, z) {
            var w = y[0];
            if (!w) { Say("I got nothing, sorry."); } else {
            var phrase = msg.rooms.most.awesomed.replace('{title}', w.name).replace('{upvotes}', w.up).replace('{djname}', w.djname);
            Say(phrase, a, c); }
          }
        );
      }
      if (s2 == "lamed" || s2 == "lames") {
        client.query('SELECT * FROM '+config.file+' ORDER BY down DESC LIMIT 1',
          function(x, y, z) {
            var w = y[0];
            if (!w) { Say("I got nothing, sorry."); } else {
            var phrase = msg.rooms.most.lamed.replace('{title}', w.name).replace('{downvotes}', w.down).replace('{djname}', w.djname);
            Say(phrase, a, c); }
          }
        );
      }
      if (s2 == "snagged" || s2 == "hearted") {
        client.query('SELECT * FROM '+config.file+' ORDER BY hearts DESC LIMIT 1',
          function(x, y, z) {
            var w = y[0];
            if (!w) { Say("I got nothing, sorry."); } else {
            var phrase = msg.rooms.most.hearted.replace('{title}', w.name).replace('{heart}', w.hearts).replace('{djname}', w.djname);
            Say(phrase, a, c); }
          }
        );
      }
    };
    if (s1 == "past") {
      if (s2 == "day") {
      if (!s2) return Say("Past what? Day? Or Week?");
        client.query('SELECT count(*) AS tracks, sum(hearts) AS snagged, sum(up) AS upvotes, sum(down) AS downvotes FROM '
          + config.file +' WHERE time > DATE_SUB(NOW(), INTERVAL 1 DAY)',
          function(x, y, z) {
            if (!y[0]) { Say("I got nothing, sorry."); } else {
            var phrase = msg.rooms.past.day.replace('{songs}', y[0]['tracks'])
              .replace('{ups}', y[0]['upvotes'])
              .replace('{downs}', y[0]['downvotes'])
              .replace('{hearts}', y[0]['snagged']);
            Say(phrase, a, c); }
          }
        );
      };
      if (s2 == "week") {
        client.query('SELECT count(*) AS tracks, sum(hearts) AS snagged, sum(up) AS upvotes, sum(down) AS downvotes FROM '
          + config.file +' WHERE time > DATE_SUB(NOW(), INTERVAL 1 WEEK)',
          function(x, y, z) {
            if (!y[0]) { Say("I got nothing, sorry."); } else {
            var phrase = msg.rooms.past.week.replace('{songs}', y[0]['tracks'])
              .replace('{ups}', y[0]['upvotes'])
              .replace('{downs}', y[0]['downvotes'])
              .replace('{hearts}', y[0]['snagged']);
            Say(phrase, a, c); }
          }
        );
      };
    }
  },
  level: 0,
  mode: 2,
  hint: "Room stats: /rooms most [awesomed/lamed/snagged] && /rooms past [day/week]"
}]