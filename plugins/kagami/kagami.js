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
  // Get socket.
  var sio = imports.socket;

  // Get log.
  var logger = imports.logger;

  // Create the event bus.
  var emitter = new EventEmitter();

  // Listen to regions ready socket events and send the into the bus.
  sio.on('connection', function (socket) {
    logger.debug('Client connected: ' + socket.id);

    // Wait for ready event from the front end regions.
    socket.on('ready', function(data) {
      logger.debug('Region ready: ' + data.region);
    });
  });

  register(null, {
    'kagami': {
      emit: emitter.emit,
      on: emitter.on
    }
  });
};