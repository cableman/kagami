/**
 * @file
 * Moon phase plugin for kagami.
 */

// Get required contrib modules.
var util = require('util');
var eventEmitter = require('events').EventEmitter;
var SunCalc = require('suncalc');

// : 'wi-moon-young',
// : 'wi-moon-old',
var moonIcons = {
  "0": 'wi-moon-new',
  "0.125": 'wi-moon-waxing-crescent',
  "0.250": 'wi-moon-waxing-quarter',
  "0.375": 'wi-moon-waxing-gibbous',
  "0.500": 'wi-moon-full',
  "0.625": 'wi-moon-waning-crescent',
  "0.750": 'wi-moon-waning-quarter',
  "0.875": 'wi-moon-waning-gibbous',
  "1": 'wi-moon-new'
};

/**
 * Define the Yr object.
 *
 * @param object conf
 *   The configuration should contain the information described below.
 * @param object logger
 *   Ref. to the logger object.
 *
 * {
 *   "region_id": 6,
 *   "view": "views/moon.html",
 *   "refresh": 1440,
 *   "latitude": 57.00000,
 *   "longitude": 9.00000
 * }
 */
var MoonPhase = function(conf, logger) {
  this.conf = conf;
  this.cache = logger;

  this.data = undefined;
}

// Extend the object with event emitter.
util.inherits(MoonPhase, eventEmitter);

/**
 * The main app will call the init function to start up the
 * extension.
 *
 * The refresh will set a interval with which the data will be
 * updated and an ready event emmitted.
 */
MoonPhase.prototype.init = function init() {
  var self = this;

  setInterval(function() {
    self.emit('ready');
  }, self.conf.refresh * 60 * 1000);
  self.emit('ready');
}

/**
 * The main app will call this function to get data after the
 * ready event have been fired.
 */
MoonPhase.prototype.getData = function getData() {
  var self = this;

  // Load moment library.
  var moment = require('moment');

  // Get moon information.
  var pos = SunCalc.getMoonPosition(new Date(), self.conf.latitude, self.conf.longitude)
  var illumination = SunCalc.getMoonIllumination(new Date());

  // Calculate the nearste 0.125 (1/0.125 = 8).
  var iconIndex = (Math.round(illumination.phase * 8) / 8).toFixed(3);

  return {
    "icon": moonIcons[iconIndex],
    "distance": pos.distance
  };
}

/**
 * Load template based
 */
MoonPhase.prototype.loadTemplate = function loadTemplate() {
  var self = this;
  var fs = require('fs')
  fs.readFile(__dirname + '/' + self.conf.view, 'utf8', function (err, data) {
    if (err) {
      self.logger.error('Moon: Error reading template file.');
    }

    self.emit('template', {
      'region_id': self.conf.region_id,
      'view': data
    });
  });
}

/**
 * Register the plugin with architect.
 */
module.exports = function (options, imports, register) {
  // Load config file.
  var config = require(__dirname + '/config.json');

  // Get connected to the weather service.
  var moon = new MoonPhase(config, imports.logger);

  // Connect to the event bus.
  var kagami = imports.kagami;

  // Send content to kagami.
  moon.on('ready', function (data) {
    kagami.emit('response-content', {
      'region_id': config.region_id,
      'view': moon.getData()
    });
  });

  // Load template from configuration.
  moon.on('template', function (data) {
    // Return test data in response to view request.
    kagami.emit('response-view', data);

    // Start the moon plugin as template is sent.
    moon.init();
  });

  // Listen to all request view events.
  kagami.on('request-view', function(data) {
    var region_id = data.region_id;

    if (config.region_id == region_id) {
      // Load the template from the filesystem.
      moon.loadTemplate();
    }
  });

  /**
   * Register the plugin with architect.
   */
  register(null, null);
}