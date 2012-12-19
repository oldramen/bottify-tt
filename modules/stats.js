/*************************************************************************
 * @copyright 2012 yayramen.                                             *
 * @author yayramen                                                      *
 * @description This is the stats module                                 *
 *************************************************************************/

//Define Functions
global.stats = function(){};

stats.update = function(){
	commands = botti._.union(commands, stats.commands);
};

stats.endsong = function(a) { var b = core.currentsong.heart;botti.db.save("song", a.room.metadata, b); };

//Hook Events
bot.on('booted', stats.update);
bot.on('endsong', stats.endsong);

//Define Commands
stats.commands = [{
  command: 'roominfo',
  callback: function (a, b, c) { basic.say("http://bots.yayramen.com/room.php?id="+config.room, a, c); },
  mode: 2,
  level: 0,
  hint: 'provides the stats page for the room'
}, {
  command: 'my',
  callback: function(a,b,c) {
    if (!b) return basic.say(this.hint, a, c);
    var s0 = b.split(' ');
    var s1 = s0.shift();
    var s2 = s0.join(' ');
    if (s1 == "most") {
      if (!s2) return basic.say("Most what? Awesomed? Snagged? Lamed?");
      if (s2 == "awesome" || s2 == "awesomed") {
        client.query('SELECT * FROM song WHERE djid="'+a+'" ORDER BY up DESC LIMIT 1',
          function(x, y, z) {
            var w = y[0];
            if (!w) { basic.say("I got nothing, sorry."); } else {
            var phrase = config.msg.my.most.awesomed.replace('{title}', w.name).replace('{upvotes}', w.up);
            basic.say(phrase, a, c); }
          }
        );
      }
      if (s2 == "lamed" || s2 == "lames") {
        client.query('SELECT * FROM song WHERE djid="'+a+'" ORDER BY down DESC LIMIT 1',
          function(x, y, z) {
            var w = y[0];
            if (!w) { basic.say("I got nothing, sorry."); } else {
            var phrase = config.msg.my.most.lamed.replace('{title}', w.name).replace('{downvotes}', w.down);
            basic.say(phrase, a, c); }
          }
        );
      }
      if (s2 == "snagged" || s2 == "hearted") {
        client.query('SELECT * FROM song WHERE djid="'+a+'" ORDER BY hearts DESC LIMIT 1',
          function(x, y, z) {
            var w = y[0];
            if (!w) { basic.say("I got nothing, sorry."); } else {
            var phrase = config.msg.my.most.hearted.replace('{title}', w.name).replace('{heart}', w.hearts);
            basic.say(phrase, a, c); }
          }
        );
      }
    };//
    if (s1 == "past") {
      if (s2 == "day") {
      if (!s2) return basic.say("Past what? Day? Or Week?");
        client.query('SELECT count(*) AS tracks, sum(hearts) AS snagged, sum(up) AS upvotes, sum(down) AS downvotes FROM '
          + 'song WHERE time > DATE_SUB(NOW(), INTERVAL 1 DAY) AND djid LIKE \'' + a + '\'',
          function(x, y, z) {
            if (!y[0]) { basic.say("I got nothing, sorry."); } else {
            var phrase = config.msg.my.past.day.replace('{songs}', y[0]['tracks'])
              .replace('{ups}', y[0]['upvotes'])
              .replace('{downs}', y[0]['downvotes'])
              .replace('{hearts}', y[0]['snagged']);
            basic.say(phrase, a, c); }
          }
        );
      };
      if (s2 == "week") {
        client.query('SELECT count(*) AS tracks, sum(hearts) AS snagged, sum(up) AS upvotes, sum(down) AS downvotes FROM '
          + 'song WHERE time > DATE_SUB(NOW(), INTERVAL 1 WEEK) AND djid LIKE \'' + a + '\'',
          function(x, y, z) {
            if (!y[0]) { basic.say("I got nothing, sorry."); } else {
            var phrase = config.msg.my.past.week.replace('{songs}', y[0]['tracks'])
              .replace('{ups}', y[0]['upvotes'])
              .replace('{downs}', y[0]['downvotes'])
              .replace('{hearts}', y[0]['snagged']);
            basic.say(phrase, a, c); }
          }
        );
      };
    }
    if (s1 == "wallet") {
      if (!core.user[a]) return;
      if (!config.economy) return basic.say(config.msg.nowallet, a, c);
      basic.say(config.msg.my.wallet + core.user[a].wallet, a, c);
    };
    if (s1 == "stats") {
      var d = core.user[a];
      var phrase = config.msg.userinfo.replace('{heart_count}', d.hearts).replace('{given_count}', d.given).replace('{total_songs}', d.songs).replace('{heart_percentage}', Round(d.hearts / d.songs * 100, 2))
      basic.say(phrase, a, c)
    }
    if (s1 == "localgreet") {
      var d = core.user[a];
      return basic.say("Your local greeting is: "+d.rgreets[config.room], a, c)
    }
    if (s1 == "greeting") {
      var d = core.user[a];
      return basic.say("Your greeting is: "+d.greeting, a, c)
    }
  },
  level: 0,
  mode: 2,
  hint: "User stats: /my most [awesomed/lamed/snagged] && /my past [day/week] && /my wallet && /my stats"
}, {
  command: 'rooms',
  callback: function(a,b,c) {
    if (!b || config.nostats) return;
    var s0 = b.split(' ');
    var s1 = s0.shift();
    var s2 = s0.join(' ');
    if (s1 == "most") {
      if (!s2) return basic.say("Most what? Awesomed? Snagged? Lamed?");
      if (s2 == "awesome" || s2 == "awesomed") {
        client.query('SELECT * FROM song WHERE (room = \''+ config.room +'\') ORDER BY up DESC LIMIT 1',
          function(x, y, z) {
            var w = y[0];
            if (!w) { basic.say("I got nothing, sorry."); } else {
            var phrase = config.msg.rooms.most.awesomed.replace('{title}', w.name).replace('{upvotes}', w.up).replace('{djname}', w.djname);
            basic.say(phrase, a, c); }
          }
        );
      }
      if (s2 == "lamed" || s2 == "lames") {
        client.query('SELECT * FROM song WHERE (room = \''+ config.room +'\') ORDER BY down DESC LIMIT 1',
          function(x, y, z) {
            var w = y[0];
            if (!w) { basic.say("I got nothing, sorry."); } else {
            var phrase = config.msg.rooms.most.lamed.replace('{title}', w.name).replace('{downvotes}', w.down).replace('{djname}', w.djname);
            basic.say(phrase, a, c); }
          }
        );
      }
      if (s2 == "snagged" || s2 == "hearted") {
        client.query('SELECT * FROM song WHERE (room = \''+ config.room +'\') ORDER BY hearts DESC LIMIT 1',
          function(x, y, z) {
            var w = y[0];
            if (!w) { basic.say("I got nothing, sorry."); } else {
            var phrase = config.msg.rooms.most.hearted.replace('{title}', w.name).replace('{heart}', w.hearts).replace('{djname}', w.djname);
            basic.say(phrase, a, c); }
          }
        );
      }
    };
    if (s1 == "past") {
      if (s2 == "day") {
      if (!s2) return basic.say("Past what? Day? Or Week?");
        client.query('SELECT count(*) AS tracks, sum(hearts) AS snagged, sum(up) AS upvotes, sum(down) AS downvotes FROM song'
          + ' WHERE (room = \''+ config.room +'\') AND time > DATE_SUB(NOW(), INTERVAL 1 DAY)',
          function(x, y, z) {
            if (!y[0]) { basic.say("I got nothing, sorry."); } else {
            var phrase = config.msg.rooms.past.day.replace('{songs}', y[0]['tracks'])
              .replace('{ups}', y[0]['upvotes'])
              .replace('{downs}', y[0]['downvotes'])
              .replace('{hearts}', y[0]['snagged']);
            basic.say(phrase, a, c); }
          }
        );
      };
      if (s2 == "week") {
        client.query('SELECT count(*) AS tracks, sum(hearts) AS snagged, sum(up) AS upvotes, sum(down) AS downvotes FROM song'
          + ' WHERE (room = \''+ config.room +'\') AND time > DATE_SUB(NOW(), INTERVAL 1 WEEK)',
          function(x, y, z) {
            if (!y[0]) { basic.say("I got nothing, sorry."); } else {
            var phrase = config.msg.rooms.past.week.replace('{songs}', y[0]['tracks'])
              .replace('{ups}', y[0]['upvotes'])
              .replace('{downs}', y[0]['downvotes'])
              .replace('{hearts}', y[0]['snagged']);
            basic.say(phrase, a, c); }
          }
        );
      };
    }
  },
  level: 0,
  mode: 2,
  hint: "Room stats: /rooms most [awesomed/lamed/snagged] && /rooms past [day/week]"
}, {
  command: 'the',
  callback: function(a,b,c) {
    if (!b) return;
    var s0 = b.split(' ');
    var s1 = s0.shift();
    var s2 = s0.join(' ');
    if (s1 == "most") {
      if (!s2) return basic.say("Most what? Awesomed? Snagged? Lamed?");
      if (s2 == "awesome" || s2 == "awesomed") {
        client.query('SELECT * FROM song ORDER BY up DESC LIMIT 1',
          function(x, y, z) {
            var w = y[0];
            if (!w) { basic.say("I got nothing, sorry."); } else {
            var phrase = config.msg.rooms.most.awesomed.replace('{title}', w.name).replace('{upvotes}', w.up).replace('{djname}', w.djname);
            basic.say(phrase, a, c); }
          }
        );
      }
      if (s2 == "lamed" || s2 == "lames") {
        client.query('SELECT * FROM song ORDER BY down DESC LIMIT 1',
          function(x, y, z) {
            var w = y[0];
            if (!w) { basic.say("I got nothing, sorry."); } else {
            var phrase = config.msg.rooms.most.lamed.replace('{title}', w.name).replace('{downvotes}', w.down).replace('{djname}', w.djname);
            basic.say(phrase, a, c); }
          }
        );
      }
      if (s2 == "snagged" || s2 == "hearted") {
        client.query('SELECT * FROM song ORDER BY hearts DESC LIMIT 1',
          function(x, y, z) {
            var w = y[0];
            if (!w) { basic.say("I got nothing, sorry."); } else {
            var phrase = config.msg.rooms.most.hearted.replace('{title}', w.name).replace('{heart}', w.hearts).replace('{djname}', w.djname);
            basic.say(phrase, a, c); }
          }
        );
      }
    };
    if (s1 == "past") {
      if (s2 == "day") {
      if (!s2) return basic.say("Past what? Day? Or Week?");
        client.query('SELECT count(*) AS tracks, sum(hearts) AS snagged, sum(up) AS upvotes, sum(down) AS downvotes FROM '
          + 'song WHERE time > DATE_SUB(NOW(), INTERVAL 1 DAY)',
          function(x, y, z) {
            if (!y[0]) { basic.say("I got nothing, sorry."); } else {
            var phrase = config.msg.the.past.day.replace('{songs}', y[0]['tracks'])
              .replace('{ups}', y[0]['upvotes'])
              .replace('{downs}', y[0]['downvotes'])
              .replace('{hearts}', y[0]['snagged']);
            basic.say(phrase, a, c); }
          }
        );
      };
      if (s2 == "week") {
        client.query('SELECT count(*) AS tracks, sum(hearts) AS snagged, sum(up) AS upvotes, sum(down) AS downvotes FROM '
          + 'song WHERE time > DATE_SUB(NOW(), INTERVAL 1 WEEK)',
          function(x, y, z) {
            if (!y[0]) { basic.say("I got nothing, sorry."); } else {
            var phrase = config.msg.the.past.week.replace('{songs}', y[0]['tracks'])
              .replace('{ups}', y[0]['upvotes'])
              .replace('{downs}', y[0]['downvotes'])
              .replace('{hearts}', y[0]['snagged']);
            basic.say(phrase, a, c); }
          }
        );
      };
    }
  },
  level: 0,
  mode: 2,
  hint: "Network stats: /the most [awesomed/lamed/snagged] && /the past [day/week]"
}];