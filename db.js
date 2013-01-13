/*************************************************************************
 * @copyright 2012 yayramen.                                             *
 * @author yayramen                                                      *
 * @description This is the db file, outlining all the db functions.     *
 *************************************************************************/

db = function() {};

db.strip = function(a) {
	if (!a) return;
	a = a.replace(/^'|'$/g, '');
	return a;
}

db.parse = function(a) {
	a = a.replace(/^'|'$/g, '');
	a = JSON.parse(a);
	return a;
};

db.create = function(a, b) {
	if (a == "settings") {
		client.query('CREATE TABLE settings'
			+ '(id VARCHAR(255),'
	    + ' data TEXT)',
			function (err) {if (err && err.code != 'ER_TABLE_EXISTS_ERROR') throw (err)}
		);
		Log("Created settings table");
	};
	if (a == "users") {
		client.query('CREATE TABLE users'
			+ '(id VARCHAR(255),'
	    + ' name VARCHAR(255),'
	    + ' hearts INT(5),'
	    + ' given INT(5),'
	    + ' songs INT(6),'
	    + ' wallet INT(9),'
	    + ' ups INT(9),'
	    + ' downs INT(9),'
	    + ' data TEXT,'
	    + ' UNIQUE (id))',
			function (err) {if (err && err.code != 'ER_TABLE_EXISTS_ERROR') throw (err)}
		);
		Log("Created users table");
	};
	if (a == "user") {
		var c = {};
		c.userid = b.userid;
		c.name = b.name;
		c.wallet = 0;
		c.ups = 0;
		c.downs = 0;
		c.points = b.points;
		c.fans = b.fans;
		c.su = false;
		c.laptop = b.laptop;
		c.warned = false;
		c.afk = Date.now();
		c.rgreets = {};
		c.dropped = null;
		c.removed = 0;
		c.droppedRoom = config.room;
		c.count = 0;
		c.waiting = 0;
		c.songs = 0;
		c.hearts = 0;
		c.given = 0;
		c.greeting = null;
		c.passwords = [];
		c.boot = false;
		c.su = 0 < b.acl ? true : false;
		c.joined = Date.now();
		return c;
	};
	if (a == "songs") {
		client.query('CREATE TABLE song'
			+ '(id INT(11) AUTO_INCREMENT PRIMARY KEY,'
			+ ' songid VARCHAR(255),'
	    + ' djid VARCHAR(255),'
	    + ' djname VARCHAR(255),'
	    + ' hearts INT(3),'
	    + ' up INT(3),'
	    + ' down INT(3),'
	    + ' name VARCHAR(255),'
	    + ' artist VARCHAR(255),'
	    + ' room VARCHAR(255),'
      + ' time DATETIME)',
			function (err) {if (err && err.code != 'ER_TABLE_EXISTS_ERROR') throw (err)}
		);
		client.query('CREATE TABLE thong'
			+ '(id INT(11) AUTO_INCREMENT PRIMARY KEY,'
			+ ' songid VARCHAR(255),'
	    + ' hearts INT(5),'
	    + ' up INT(5),'
	    + ' down INT(5),'
	    + ' plays INT(5),'
	    + ' name VARCHAR(255),'
	    + ' artist VARCHAR(255))',
			function (err) {if (err && err.code != 'ER_TABLE_EXISTS_ERROR') throw (err)}
		);
		Log("Created songs table");
	};
	if (a == "retired") {
		var table = config.file+'_retired';
		var tablename = table.replace('.','');
		client.query('CREATE TABLE '+tablename
		+ '(id INT(11) AUTO_INCREMENT PRIMARY KEY,'
      	+ ' name VARCHAR(255))',
			function (err) {if (err && err.code != 'ER_TABLE_EXISTS_ERROR') throw (err)}
		);
		Log("Created retired table");
	};
};

db.load = function(a, z) {
	if (a == "settings") {
		client.query('SELECT data FROM settings WHERE (id = \''+ config.room +'\')',
			function(a, b, c) {
				if (a) return console.log(a);
				if (!b[0]) return db.save("settings");
				config = db.parse(b[0].data);
				Log("Loaded Settings");
			}
		);
	};
	if (a == "user") {
  	client.query('SELECT data FROM users WHERE (id = \''+ z.userid +'\')',
  		function(a, b, c) {
				if (!b[0]) { core.user[z.userid] = db.create("user", z)}
				else {
					core.user[z.userid] = basic.refreshuser(db.parse(b[0].data), z);
				};
				Log("Loaded "+z.name);
			}
		);
	};
};

db.save = function(a, y, z) {
	if (a == "settings") {
		client.query('SELECT data FROM settings WHERE (id = \''+ config.room +'\')',
			function(a, b, c) {
				if (!b[0]) {
					client.query('INSERT INTO settings (id, data, name) VALUES (?, ?, ?)', [config.room, JSON.stringify(config), core.roomname],
      			function (a) { if (a) throw a;Log("Saved settings"); }
    			);
				} else {
					client.query('UPDATE settings SET data="?" WHERE id="'+config.room+'"',[JSON.stringify(config)],
			      function (a) { if (a) throw a;Log("Saved settings"); }
			    );
				}
			}
		);
	};
	if (a == "user") {
		client.query('SELECT data FROM users WHERE (id = \''+ y.userid +'\')',
			function(a, b, c) {
				if (!b[0]) {
					client.query('INSERT INTO users (id, name, hearts, given, songs, wallet, data, points, fans) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', 
						[y.userid, y.name, y.hearts, y.given, y.songs, y.wallet, JSON.stringify(y), y.points, y.fans],
      			function (a) { if (a) throw a;Log("Saved "+y.name); }
    			);
				} else {
					client.query('UPDATE users SET name="?", hearts="?", given="?", songs="?", wallet="?", data="?", points="?", fans="?"  WHERE id="'+y.userid+'"',
						[y.name, y.hearts, y.given, y.songs, y.wallet, JSON.stringify(y), y.points, y.fans],
			      function (a) { if (a) throw a;Log("Saved "+y.name); }
			    );
				}
			}
		);
	};
	if (a == "song") {
		if (!y.current_song || config.nostats) return;
		client.query('INSERT INTO song (songid, djid, djname, hearts, up, down, name, artist, room, time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())', 
			[y.current_song._id, y.current_song.djid, y.current_song.djname, z, 
			y.upvotes, y.downvotes, y.current_song.metadata.song, y.current_song.metadata.artist, config.room],
			function (a) { if (a) throw a; }
		);
		client.query('SELECT data FROM thong WHERE (songid = \''+ y.current_song._id +'\')',
			function(a, b, c) {
				if (!b || !b[0]) {
					client.query('INSERT INTO thong (songid, name, artist, hearts, up, down, plays) VALUES (?, ?, ?, ?, ?, ?, ?)', 
						[y.current_song._id, y.current_song.metadata.song, y.current_song.metadata.artist, z, y.upvotes, y.downvotes, 1],
      			function (a) { if (a) throw a;
						Log("Song Saved") }
    			);
				} else {
	        client.query('SELECT * FROM thong WHERE (songid = \''+ y.current_song._id +'\')',
	          function(g, h, i) {
	            if (!h[0]) { Say("I got nothing, sorry."); } else {
	            	client.query('UPDATE thong SET hearts="?", up="?", down="?", plays="?" WHERE id="'+y.current_song._id+'"',
									[h[0]['hearts'] + z, h[0]['up'] + y.upvotes, h[0]['down'] + y.downvotes, h[0]['plays'] + 1],
						      function (a) { if (a) throw a;
									Log("Song Saved") }
						    );
	            }
	          }
	        );
				}
			}
		);
	};
};

exports.db = db; 

//Connect
Log("Connecting to DB");
global.client = botti.mysql.createConnection({user: "root", password: "", database: "bots", host: "localhost", insecureAuth: true});
db.create("settings");db.create("users");db.create("songs");db.create("retired");
Log("Connected");