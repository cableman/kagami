/**
 * @file
 * Moon phase plugin for kagami.
 */

// Get required contrib modules.
var util = require('util');
var eventEmitter = require('events').EventEmitter;

// Get twitter module.
var Twit = require('twit');

/**
 * {
 *   "region_id": 6,
 *   "view": "views/stream.html",
 *   "hashtag": "#drupalcon"
 * }
 */
var TwitStream = function(conf, cache, logger) {
  this.conf = conf;
  this.cache = cache;
  this.cache = logger;

  // Set twitter auth information.
  this.twit = new Twit({
    "consumer_key": this.conf.api.key,
    "consumer_secret": this.conf.api.secret,
    "access_token": this.conf.access.token,
    "access_token_secret": this.conf.access.secret
  });

  // Set cache key.
  this.cacheKey = 'TWITTER:tweets';

  // Place holder for the current tweets.
  this.tweets = [];
};

// Extend the object with event emitter.
util.inherits(TwitStream, eventEmitter);

/**
 * The main app will call this function to get data after the
 * ready event have been fired.
 */
TwitStream.prototype.getData = function getData() {
  var self = this;
  var stream = this.twit.stream('statuses/filter', { "track": this.conf.filter })

  stream.on('tweet', function (tweet) {
    // Remove old tweets.
    self.tweets = self.tweets.slice(0, self.conf.limit - 1);

    // Add tweet to the start of the array.
    self.tweets.unshift(tweet);

    // Update cache.
    console.log('length: ' + self.tweets.length);

    // Emit event.
    self.emit('ready', self.tweets);
  });
}

TwitStream.prototype.getCache = function getCache() {

}

TwitStream.prototype.setCache = function setCache() {

}


/**
 * Load template based
 */
TwitStream.prototype.loadTemplate = function loadTemplate() {
  var self = this;
  var fs = require('fs')
  fs.readFile(__dirname + '/' + self.conf.view, 'utf8', function (err, data) {
    if (err) {
      self.logger.error('Twitter: Error reading template file.');
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
  var stream = new TwitStream(config, imports.cache, imports.logger);

  // Connect to the event bus.
  var kagami = imports.kagami;

  // Send content to kagami.
  stream.on('ready', function (data) {
    kagami.emit('response-content', {
      'region_id': config.region_id,
      'view': {
        "tweets": data
      }
    });
  });

  // Load template from configuration.
  stream.on('template', function (data) {
    // Return test data in response to view request.
    kagami.emit('response-view', data);

    // Start the plugin as template is sent.
    stream.getData();
  });

  // Listen to all request view events.
  kagami.on('request-view', function(data) {
    var region_id = data.region_id;

    if (config.region_id == region_id) {
      // Load the template from the filesystem.
      stream.loadTemplate();
    }
  });

  /**
   * Register the plugin with architect.
   */
  register(null, null);
}
