/**
 * @file
 * The main application which is basically an event bus that ensure communication between front-end and plugins.
 *
 * @see http://www.slideshare.net/sergimansilla/architecting-large-nodejs-applications-14912706
 */

 var EventEmitter = require('events').EventEmitter;

 module.exports = function (optionsm, imports, register) {
  var emitter = new EventEmitter();

  register(null, {
    'bus': {
      emit: emitter.emit,
      on: emitter.on
    }
  });
 }