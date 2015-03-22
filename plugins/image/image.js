/**
 * @file
 * Image plugin for kagami that uses 500px.com.
 */

// Get required contribute modules.
var util = require('util');
var eventEmitter = require('events').EventEmitter;

/**
 * Define the Yr object.
 *
 * @param object conf
 *   The configuration should contain the information described below.
 * @param object logger
 *   Ref. to the logger object.
 *
 * {
 *   "region_id": 4,
 *   "view": "views/image.html",
 *   "key": "XXXXXX",
 *   "refresh": 1,
 *   "images": 15
 * }
 */
var Image = function(conf, logger) {
  "use strict";

  this.conf = conf;
  this.logger = logger;

  this.data = {};
  this.current = this.conf.images - 1;
};

// Extend the object with event emitter.
util.inherits(Image, eventEmitter);

/**
 * The main app will call the init function to start up the
 * extension.
 *
 * The refresh will set a interval with which the data will be
 * updated and an ready event emmitted.
 */
Image.prototype.init = function init() {
  "use strict";

  var self = this;

  var API500px = require('500px');
  self.api500px = new API500px(this.conf.key);

  // Set the timer with a +5 sek to ensure that redis have
  // expired, so it's not a cache fetch.
  setInterval(function() {
    self._refresh();
  }, (self.conf.refresh * 60 * 1000) + 5000);
  self._refresh();
};

/**
 * Fetch new image form the server.
 *
 * @private
 */
Image.prototype._refresh = function _refresh() {
  "use strict";

  var self = this;

  // Check if image loop should be refreshed.
  if (self.conf.images - 1 <= self.current) {
    // Get images from 500px.com
    self.api500px.photos.getPopular({'sort': 'created_at', 'rpp': self.conf.images, 'image_size': 4},  function(error, results) {
      if (error) {
        // Error!
        return;
      }

      // Store data in local data.
      self.data = results.photos;

      // Reset current counter.
      self.current = 0;

      // Get photo to the front-end.
      self.getPhoto();
    });
  }
  else {
    // Get photo to the front-end.
    self.getPhoto();
  }
};

/**
 * Get images from local cache and sends ready event to front-end.
 */
Image.prototype.getPhoto = function getPhoto() {
  "use strict";

  var self = this;

  // Get next photo.
  var photo = self.data[self.current];
  self.emit('ready', {
    "name": photo.name,
    "url": photo.image_url
  });

  // Increment current image counter.
  self.current++;
};

/**
 * Load template based
 */
Image.prototype.loadTemplate = function loadTemplate() {
  "use strict";

  var self = this;
  var fs = require('fs');
  fs.readFile(__dirname + '/' + self.conf.view, 'utf8', function (err, data) {
    if (err) {
      self.logger.error('Image: Error reading template file.');
    }

    self.emit('template', {
      'region_id': self.conf.region_id,
      'view': data
    });
  });
};

/**
 * Register the plugin with architect.
 */
module.exports = function (options, imports, register) {
  "use strict";

  // Load config file.
  var config = require(__dirname + '/config.json');

  var image = new Image(config, imports.logger);

  // Connect to the event bus.
  var kagami = imports.kagami;

  // Send content to kagami.
  image.on('ready', function (data) {
    kagami.emit('response-content', {
      'region_id': config.region_id,
      'view': data
    });
  });

  // Load template from configuration.
  image.on('template', function (data) {
    // Return test data in response to view request.
    kagami.emit('response-view', data);

    // Start the image plugin as template is sent.
    image.init();
  });

  // Listen to all request view events.
  kagami.on('request-view', function(data) {
    var region_id = data.region_id;

    if (config.region_id == region_id) {
      // Load the template from the filesystem.
      image.loadTemplate();
    }
  });

  /**
   * Register the plugin with architect.
   */
  register(null, null);
};
