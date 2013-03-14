/*************************************************************************
 * @copyright 2012 yayramen.                                             *
 * @author yayramen                                                      *
 * @description This is the install module                               *
 *************************************************************************/

global.install = function(){};

install.update = function(){ var a = false;
  config.hasOwnProperty("step") || (config.step = null,a = true);
  config.hasOwnProperty("installing") || (config.installing = "empty",a = true);
  config.hasOwnProperty("installedmods") || (config.installedmods = [],a = true);
  config.hasOwnProperty("lefttoinstall") || (config.lefttoinstall = [],a = true);
  a && basic.save("settings");
  for(var a = Module.loaded.length - 1;0 <= a;a--) {
    install.hasOwnProperty(Module.loaded[a]) && 0 > config.installedmods.indexOf(Module.loaded[a]) && config.lefttoinstall.push(Module.loaded[a])
  }
  if(config.installdone && config.lefttoinstall.length) {
    return config.greeting.on = config.installdone = false, config.installing = config.lefttoinstall[0], basic.say("New modules detected, type /install to install them.")
  }
  if (config.installed) {
    for (var i = config.lefttoinstall.length - 1; i >= 0; i--) {
      if (config.installedmods.indexOf(config.lefttoinstall[i]) < 0) config.installedmods.push(config.lefttoinstall[i]);
    };
  }
};

install.check = function(a,b,c){ 
  if (config.installedmods.indexOf(c) < 0) config.installedmods.push(c);
  config.lefttoinstall.splice(config.lefttoinstall.indexOf(c),1);
  if (!config.lefttoinstall.length) return install.done(a,b);
  config.step = "step1";config.installing = config.lefttoinstall[0];
  return install.dostep("null",a,b);
};

install.done = function(a,b) {
  core.setup.on = false;core.setup.user = null;config.on.boot = "/me flickered on.";config.installdone = true;config.greeting.on = true;
  return basic.say("Okay, there's nothing left to install! I recommend you join the facebook group here: http://goo.gl/1GYL9, for faster support.",a,b);
}

install.handlesetup = function(a, d, c) {
  if(core.setup.on && core.setup.user == a) {
    if (config.installing == "empty") return install.check(a,c);
    var b = d.toLowerCase();
    return"y" == b || "yes" == b ? install.dostep(true, a, c) : "n" == b || "no" == b ? install.dostep(false, a, c) : install.dostep(d, a, c)
  }
};

install.dostep = function(c, a, b) {
  var z = eval("install."+config.installing);
  if("null" == c) return z[config.step].q(a, b);
  if(z[config.step].hasOwnProperty("c")) return z[config.step].c(a, b, c);
  if(true == c) return z[config.step].y(a, b);
  if(false == c) return z[config.step].n(a, b);
  basic.say("Sorry, I didn't catch that. Please use 'y/yes' or 'n/no'.", a, b)
};

install.queue = {
  step1: {
    q:function(a,b){ return basic.say("Would you like to enable the queue now?",a,b); },
    y:function(a,b){ config.step = 'step2';config.queue.on = true;settings.save();return install.queue.step2.q(a,b); },
    n:function(a,b){ config.step = 'step2';config.queue.on = false;settings.save();return install.queue.step2.q(a,b); }
  }, step2: {
    q:function(a,b){ return basic.say("Would you like the bot to enforce the queue by escorting users who hop up out of turn?",a,b); },
    y:function(a,b){ config.queue.enforce = true;config.step = 'step3';settings.save();return install.queue.step3.q(a,b); },
    n:function(a,b){ config.queue.enforce = false;config.step = 'step3';settings.save();return install.queue.step3.q(a,b); }
  }, step3: {
    q:function(a,b,c){ return basic.say("How long (in seconds) should a user have to claim their spot to DJ before they lose it?",a,b); },
    c:function(a,b,c){
      if (isNaN(c)) return basic.say("Please user a number. How long (in seconds) should a user have to claim their spot to DJ before they lose it?",a,b);
      config.queue.timeout = c;settings.save();return install.check(a,b,'queue');
    }
  }
};

install.limit = {
  step1: {
    q:function(a,b){ return basic.say("Would you like to enable song limits now?",a,b); },
    y:function(a,b){ config.songs.on = true;config.step = 'step2';settings.save();return install.limit.step2.q(a,b) },
    n:function(a,b){ config.songs.on = false;config.step = 'step2';settings.save();return install.limit.step2.q(a,b) }
  }, step2: {
    q:function(a,b,c){ return basic.say("What should the limit be? How many songs can a DJ play before being escorted?",a,b); },
    c:function(a,b,c){ if (isNaN(c)) return basic.say("Please use a number. What should the limit be? How many songs can a DJ play before being escorted?",a,b);
                       config.songs.max = c;config.step = 'step3';settings.save();return install.limit.step3.q(a,b); }
  }, step3: {
    q:function(a,b){ return basic.say("After being escorted, should a DJ have to wait before hopping back on deck?",a,b); },
    y:function(a,b){ config.songs.waits = true;config.step = 'step4';settings.save();return install.limit.step4.q(a,b); },
    n:function(a,b){ config.songs.waits = false;config.step = 'step5';settings.save();return install.limit.step5.q(a,b); }
  }, step4: {
    q:function(a,b,c){ return basic.say("How many songs should a DJ wait, before hopping back on deck?",a,b); },
    c:function(a,b,c){ if (isNaN(c)) return basic.say("Please use a number. How many songs should a DJ wait, before hopping back on deck?",a,b);
                       config.songs.wait = c;config.step = 'step5';settings.save();return install.limit.step5.q(a,b); }
  }, step5: {
    q:function(a,b,c){ return basic.say("How many DJs should be on deck before the song limits kick in? 4 is recommended.",a,b); },
    c:function(a,b,c){ if (isNaN(c)) return basic.say("Please use a number. How many DJs should be on deck before the song limits kick in? 4 is recommended.",a,b);
                       config.songs.mindj = c;settings.save();return install.check(a,b,'limit'); }
  }
};

install.basic = {
  step1: {
    q:function(a,b,c){ return basic.say("How long (in minutes), can a DJ be afk before being escorted? Default is 15.",a,b); },
    c:function(a,b,c){ if (isNaN(c)) return basic.say("Please use a number. How long (in minutes), can a DJ be afk before being escorted? Default is 15.",a,b); 
                       config.afk.time = c;config.step = 'step2';settings.save();return install.basic.step2.q(a,b); }
  }, step2: {
    q:function(a,b){ return basic.say("Should I warn users when they are nearing the afk limit?",a,b); },
    y:function(a,b){ config.afk.warn = true;config.step = 'step3';settings.save();return install.basic.step3.q(a,b); },
    n:function(a,b){ config.afk.warn = false;config.step = 'step3';settings.save();return install.basic.step3.q(a,b); }
  }, step3: {
    q:function(a,b){ return basic.say("Should pressing the awesome button reset the AFK timer for DJs?",a,b); },
    y:function(a,b){ config.afk.bop = true;config.step = 'step4';settings.save();return install.basic.step4.q(a,b); },
    n:function(a,b){ config.afk.bop = false;config.step = 'step4';settings.save();return install.basic.step4.q(a,b); }
  }, step4: {
    q:function(a,b){ return basic.say("Should my /bop command (makes me awesome) be restricted to mods?",a,b); },
    y:function(a,b){ config.modbop = true;config.step = 'step5';settings.save();return install.check(a,b,'basic'); },
    n:function(a,b){ config.modbop = false;config.step = 'step5';settings.save();return install.check(a,b,'basic'); }
  }
};

//Hook Events
bot.on('booted', install.update);