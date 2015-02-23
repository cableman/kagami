/**
 * @file
 * The main application which is basically an event bus that ensure
 * communication between front-end and plugins.
 *
 * @see http://www.slideshare.net/sergimansilla/architecting-large-nodejs-applications-14912706
 */

// Get event emitter from node core.
var EventEmitter = require('events').EventEmitter;

/**
 * Register the plugin with architect.
 */
module.exports = function (options, imports, register) {
  "use strict";

  // Get socket.
  var sio = imports.socket;

  // Get log.
  var logger = imports.logger;

  // Create the event bus.
  var emitter = new EventEmitter();

  var kagami = {
    emit: emitter.emit,
    on: emitter.on,
    once: emitter.once
  };

  // Listen to regions ready socket events and send the into the bus.
  sio.on('connection', function (socket) {
    logger.debug('Client connected: ' + socket.id);

    // Wait for ready event from the front end regions.
    socket.on('ready', function(data) {
      logger.debug('Region ready: ' + data.region_id);

      // Relay ready event as request for HTML view.
      kagami.emit('request-view', data);
    });

    // Get view (html request).
    kagami.on('response-view', function (data) {
      // Data should aways contain region id and view.
      socket.emit('region-view-' + data.region_id, data);
    });

    // Get request for data.
    kagami.on('response-content', function(data) {
      // Data should aways contain region id and content.
      socket.emit('region-content-' + data.region_id, data);
    });
  });

  register(null, {
    'kagami': kagami
  });
};
