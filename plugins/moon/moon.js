/**
 * @file
 * Moon phase plugin for kagami.
 */

// Get required contrib modules.
var util = require('util');
var eventEmitter = require('events').EventEmitter;
var SunCalc = require('suncalc');

var moonIcons = {
  "0.5": 'wi-moon-full',
  "": 'wi-moon-waxing-gibbous',
  "": 'wi-moon-waxing-quarter',
  "": 'wi-moon-waxing-crescent',
  "": 'wi-moon-young',
  "0": 'wi-moon-new',
  "": 'wi-moon-old',
  "": 'wi-moon-waning-crescent',
  "": 'wi-moon-waning-quarter',
  "": 'wi-moon-waning-gibbous'
}

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
    self.getData();
  }, self.conf.get('refresh') * 60 * 1000);
  self.getData();
}

/**
 * The main app will call this function to get data after the
 * ready event have been fired.
 */
MoonPhase.prototype.getData = function getData() {
  var self = this;

  // Load moment library.
  var moment = require('moment');

  // The default return value.
  var content = [];

  // Get sun times.
  var pos = SunCalc.getMoonPosition(new Date(), self.conf.get('latitude') , self.conf.get('longitude'))
  var illumination = SunCalc.getMoonIllumination(new Date());
  console.log(pos.distance);

  console.log(illumination.phase);

  // Phase   Name
  // 0     New Moon
  //       Waxing Crescent
  // 0.25  First Quarter
  //       Waxing Gibbous
  // 0.5   Full Moon
  //       Waning Gibbous
  // 0.75  Last Quarter
  //       Waning Crescent

  return content;
}

/**
 * Load template based
 */
MoonPhase.prototype.loadTemplate = function loadTemplate() {
  var self = this;
  var fs = require('fs')
  fs.readFile(__dirname + '/' + self.conf.get('view'), 'utf8', function (err, data) {
    if (err) {
      self.logger.error('Moon: Error reading template file.');
    }

    self.emit('template', {
      'region_id': self.conf.get('region_id'),
      'view': data
    });
  });
}

/**
 * Register the plugin with architect.
 */
module.exports = function (options, imports, register) {
  // Load configuration file.
  var configuration = imports.configuration;
  var conf = new imports.configuration(__dirname + '/config.json');

  // Get connected to the weather service.
  var moon = new MoonPhase(conf, imports.logger);

  // Connect to the event bus.
  var kagami = imports.kagami;

  moon.getData();
  // // Send content to kagami.
  // weather.on('ready', function (data) {
  //   kagami.emit('response-content', {
  //     'region_id': conf.get('region_id'),
  //     'view': weather.getData()
  //   });
  // });

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

    if (conf.get('region_id') == region_id) {
      // Load the template from the filesystem.
      moon.loadTemplate();
    }
  });

  /**
   * Register the plugin with architect.
   */
  register(null, null);
}