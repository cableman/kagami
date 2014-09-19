/**
 * @file
 *
 */

// Load required modules.
var util = require('util');
var eventEmitter = require('events').EventEmitter;
var SunCalc = require('suncalc');

// Define translation table for weather icons from wwo id to css icons.
var weatherIcons = {
  "113": {
    "day": 'wi-day-sunny',
    "night": 'wi-night-clear',
  },
  "116": {
    "day": 'wi-day-cloudy',
    "night": 'wi-night-cloudy',
  },
  "119": {
    "day": "wi-cloudy",
    "night": "wi-cloudy"
  },
  "122": {
    "day": "wi-cloudy",
    "night": "wi-cloudy"
  },
  "143": {
    "day": "wi-day-fog",
    "night": "wi-night-fog"
  },
  "176": {
    "day": "wi-day-sprinkle",
    'night': "wi-night-alt-sprinkle"
  },
  "179": {
    "day": "wi-day-rain-mix",
    "night": "wi-night-alt-rain-mix"
  },
  "182": {
    "day": "wi-day-rain-mix",
    "night": "wi-night-alt-rain-mix"
  },
  "185": {
    "day": "wi-day-rain-mix",
    "night": "wi-night-alt-rain-mix"
  },
  "200": {
    "day": "wi-day-lightning",
    "night": "wi-night-alt-lightning"
  },
  "227": {
    "day": "wi-day-snow",
    "night": "wi-night-alt-snow"
  },
  "230": {
    "day": "wi-day-snow",
    "night": "wi-night-alt-snow"
  },
  "248": {
    "day": "wi-day-fog",
    "night": "wi-night-fog"
  },
  "260": {
    "day": "wi-day-fog",
    "night": "wi-night-fog"
  },
  "263": {
    "day": "wi-day-rain",
    "night": "wi-night-alt-rain"
  },
  "266": {
    "day": "wi-rain",
    "night": "wi-rain"
  },
  "281": {
    "day": "wi-rain-mix",
    "night": "wi-rain-mix"
  },
  "284": {
    "day": "wi-rain-mix",
    "night": "wi-rain-mix"
  },
  "293": {
    "day": "wi-rain",
    "night": "wi-rain"
  },
  "296": {
    "day": "wi-rain",
    "night": "wi-rain"
  },
  "299": {
    "day": "wi-day-rain",
    "night": "wi-night-alt-rain"
  },
  "302": {
    "day": "wi-rain",
    "night": "wi-rain"
  },
  "305": {
    "day": "wi-day-rain",
    "night": "wi-night-alt-rain"
  },
  "308": {
    "day": "wi-rain",
    "night": "wi-rain"
  },
  "311": {
    "day": "wi-rain-mix",
    "night": "wi-rain-mix"
  },
  "314": {
    "day": "wi-rain-mix",
    "night": "wi-rain-mix"
  },
  "317": {
    "day": "wi-rain-mix",
    "night": "wi-rain-mix"
  },
  "320": {
    "day": "wi-snow",
    "night": "wi-snow"
  },
  "323": {
    "day": "wi-day-snow",
    "night": "wi-night-alt-snow"
  },
  "326": {
    "day": "wi-day-snow",
    "night": "wi-night-alt-snow"
  },
  "329": {
    "day": "wi-snow",
    "night": "wi-snow"
  },
  "332": {
    "day": "wi-snow",
    "night": "wi-snow"
  },
  "335": {
    "day": "wi-day-snow",
    "night": "wi-night-alt-snow"
  },
  "338": {
    "day": "wi-snow",
    "night": "wi-snow"
  },
  "350": {
    "day": "wi-hail",
    "night": "wi-hail"
  },
  "353": {
    "day": "wi-day-rain",
    "night": "wi-night-alt-rain"
  },
  "356": {
    "day": "wi-day-rain",
    "night": "wi-night-alt-rain"
  },
  "359": {
    "day": "wi-rain",
    "night": "wi-rain"
  },
  "362": {
    "day": "wi-day-rain-mix",
    "night": "wi-night-alt-rain-mix"
  },
  "365": {
    "day": "wi-day-rain-mix",
    "night": "wi-night-alt-rain-mix"
  },
  "368": {
    "day": "wi-day-snow",
    "night": "wi-night-alt-snow"
  },
  "371": {
    "day": "wi-snow",
    "night": "wi-snow"
  },
  "374": {
    "day": "wi-day-rain-mix",
    "night": "wi-night-alt-rain-mix"
  },
  "377": {
    "day": "wi-rain-mix",
    "night": "wi-rain-mix"
  },
  "386": {
    "day": "wi-day-thunderstorm",
    "night": "wi-night-thunderstorm"
  },
  "389": {
    "day": "wi-lightning",
    "night": "wi-lightning"
  },
  "392": {
    "day": "wi-day-lightning",
    "night": "wi-night-alt-lightning"
  },
  "395": {
    "day": "wi-day-snow",
    "night": "wi-night-alt-snow"
  }
}

// Translate wwo wind directions into css icons.
var windIcons = {
  'N': 'wi-wind-north',
  'NNE': 'wi-wind-north',
  'NE': 'wi-wind-north-east',
  'ENE': 'wi-wind-north-east',
  'E': 'wi-wind-east',
  'ESE': 'wi-wind-east',
  'SE': 'wi-wind-south-east',
  'SSE': 'wi-wind-south-east',
  'S': 'wi-wind-south',
  'SSW': 'wi-wind-south',
  'SW': 'wi-wind-south-west',
  'WSW': 'wi-wind-south-west',
  'W': 'wi-wind-west',
  'WNW': 'wi-wind-west',
  'NW': 'wi-wind-north-west',
  'NNW': 'wi-wind-north-west'
}

/**
 * Define the WorldWeatherOnline object.
 *
 * @param object conf
 *   The configuration should contain the information described below.
 * @param object cache
 *   Ref. to the cache object.
 * @param object logger
 *   Ref. to the logger object.
 *
 * {
 *   "region_id": 1,
 *   "view": "views/full.html",
 *   "format": "full",
 *   "refresh": 15,
 *   "city": "Aalborg",
 *   "days": 5,
 *   "url": "http://api.worldweatheronline.com/free/v1/weather.ashx",
 *   "key": "xxxx",
 *   "latitude": 57.0235186,
 *   "longitude": 9.8870106
 * }
 */
var WorldWeatherOnline = function (conf, cache, logger) {
  // Set basic configuration.
  this.conf = conf;
  this.cache = cache;
  this.logger = logger;

  // Variables to hold fetached weather data.
  this.xml = undefined;
  this.data = undefined;

  // Build service url base on configuration.
  this.url = conf.get('url') + '?q=' + conf.get('city') + '&format=json&num_of_days=' + conf.get('days') + '&key=' + conf.get('key');

  // Create id based on url.
  var crypto = require('crypto');
  this.id = crypto.createHash('md5').update(this.url).digest('hex');

  // Set cache key.
  this.cacheKey = 'WWO:' + this.id;
}

// Extend the object with event emitter.
util.inherits(WorldWeatherOnline, eventEmitter);

/**
 * A very fast way to clone data.
 */
WorldWeatherOnline.prototype.clone = function clone(a) {
  return JSON.parse(JSON.stringify(a));
}

/**
 * The main app will call the init function to start up the
 * extension.
 *
 * The refresh will set a interval with which the data will be
 * updated and an ready event emmitted.
 */
WorldWeatherOnline.prototype.init = function init() {
  var self = this;

  // Set the timer with a +5 sek to ensure that redis have
  // expired, so it's not a cache fetch.
  setInterval(function() {
    self._refresh();
  }, (self.conf.get('refresh') * 60 * 1000) + 5000);
  self._refresh();
}

/**
 * The main app will call this function to get data after the
 * ready event have been fired.
 */
WorldWeatherOnline.prototype.getData = function getData() {
  var self = this;

  // Load moment library.
  var moment = require('moment');

  // Check if it's day or night.
  var iconType = 'day';
  if (moment().isAfter(self.data.sun.set)) {
    iconType = 'night';
  }

  // The default return value.
  var content = [];

  // Switch over the different formats.
  switch (self.conf.get('format')) {
    case 'current':
      content = self.clone(self.data.current_condition[0]);

      // Defines with type of weather icon to display.
      content.weatherIconType = iconType;

      // Set sunrise and sunset.
      content.sun = self.data.sun;
      break;

    case 'full':
      content = self.clone(self.data);

      // Define weather icon type for current weather.
      content.current_condition[0].weatherIconType = iconType;

      // Remove the extra array layer.
      content.current_condition = content.current_condition[0];

      // Define weather icon type for forcast.
      for (var i = 0; i < content.weather.length; i++) {
        content.weather[i].weatherIconType = 'day';
      }
      break;
  }

  return content;
}

/**
 * If cache have expire an new version is fected else cached
 * version is used.
 *
 * @privte
 */
WorldWeatherOnline.prototype._refresh = function _refresh() {
  var self = this;
  // Try to load weather information from cache.
  self.once('getCache', function(res) {
    if (res.code === 204) {
      // Not found in cache, so try and fetch it.
      self.once('fetched', function() {
        // Cache the data.
        self.once('cached', function() {
          // Send ready as data have been fetched and parsed.
          self.emit('ready');
        })
        self.setCache();
      });
      self.fetch();
    }
    else {
      // Data have been fetched from cache.
      self.emit('ready');
    }
  });
  self.getCache();
}

/**
 * Fetches the weather information form the url given in the
 * object creation.
 */
WorldWeatherOnline.prototype.fetch = function fetch() {
  var self = this;
  var request = require('request');
  request(self.url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var windSpeedValue = 0.44704;

      // Parse response.
      var json = JSON.parse(body);
      json = json.data;

      // Set weather icon classes.
      json.current_condition[0].weatherIcons = weatherIcons[json.current_condition[0].weatherCode];

      // Get wind speed in m/s.
      json.current_condition[0].windspeedMs = json.current_condition[0].windspeedMiles * windSpeedValue;

      // Set wind directions icon.
      json.current_condition[0].winddirIcon = windIcons[json.current_condition[0].winddir16Point];

      // Fixed the forcast with speed and icons.
      var forcast = json.weather;
      for (var i = 0; i < forcast.length; i++) {
        var day = forcast[i];

        // Set weather icon classes.
        day.weatherIcons = weatherIcons[day.weatherCode];

        // Get wind speed in m/s.
        day.windspeedMs = day.windspeedMiles * windSpeedValue;

        // Set wind directions icon.
        day.winddirIcon = windIcons[day.winddir16Point];

        // Store the updated information.
        json.weather[i] = day;
      }

      // Get sun times.
      var times = SunCalc.getTimes(new Date(), self.conf.get('latitude') , self.conf.get('longitude'));
      json.sun = {
        'rise': times.sunrise,
        'set': times.sunset
      };

      // Store data.
      self.data = json;

      // Send event that data have been fetched.
      self.emit('fetched');
    }
    else {
      self.logger.error('WWO: Unable to fetch weather information.');
    }
  });
}

/**
 * Get weather date from the cache.
 *
 * @events
 *   If found code "200" else code "204" no content.
 */
WorldWeatherOnline.prototype.getCache = function getCache() {
  var self = this;
  self.cache.get(self.cacheKey, function(err, res) {
    if (!err) {
      if (res !== null) {
        self.data = JSON.parse(res);

        // Data found.
        self.emit('getCache', { code: 200 })
      }
      else {
        // No data found in cache (no content).
        self.emit('getCache', { code: 204 })
      }
    }
    else {
      self.logger.error('WWO: Cache encounted an error in get.');
    }
  });
}

/**
 * Store the weather data in the redis cache.
 */
WorldWeatherOnline.prototype.setCache = function setCache() {
  var self = this;
  var refresh = Number(self.conf.get('refresh'));
  if (refresh !== undefined) {
    self.cache.setExpire(self.cacheKey, JSON.stringify(self.data), refresh * 60, function(error, res) {
      if (!error) {
         self.emit('cached', { code: 200 });
      }
      else {
        self.logger.error('WWO: Cache encounted an error in set expire.');
      }
    });
  }
  else {
    self.cache.set(self.cacheKey, JSON.stringify(self.data), function(error, res) {
      if (!error) {
         self.emit('cached', { code: 200 });
      }
      else {
        self.logger.error('WWO: Cache encounted an error in set.');
      }
    });
  }
}

/**
 * Load template based
 */
WorldWeatherOnline.prototype.loadTemplate = function loadTemplate() {
  var self = this;
  var fs = require('fs')
  fs.readFile(__dirname + '/' + self.conf.get('view'), 'utf8', function (err, data) {
    if (err) {
      self.logger.error('WWO: Error reading template file.');
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
  var weather = new WorldWeatherOnline(conf, imports.cache, imports.logger);

  // Connect to the event bus.
  var kagami = imports.kagami;

  // Send content to kagami.
  weather.on('ready', function (data) {
    kagami.emit('response-content', {
      'region_id': conf.get('region_id'),
      'view': weather.getData()
    });
  });

  // Load template from configuration.
  weather.on('template', function (data) {
    // Return test data in response to view request.
    kagami.emit('response-view', data);

    // Start the weather plugin as template is sent.
    weather.init();
  });

  // Listen to all request view events.
  kagami.on('request-view', function(data) {
    var region_id = data.region_id;

    if (conf.get('region_id') == region_id) {
      // Load the template from the filesystem.
      weather.loadTemplate();
    }
  });

  /**
   * Register the plugin with architect.
   */
  register(null, null);
}
