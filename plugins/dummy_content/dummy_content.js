/**
 * @file
 * Generate dummy content for all front-end regions.
 */

/**
 * Register the plugin with architect.
 */
module.exports = function (options, imports, register) {
  "use strict";

  // Connect to the event bus.
  var kagami = imports.kagami;

  // Listen to all request view events.
  kagami.on('request-view', function(data) {
    // Return test data in response to view request.
    kagami.emit('response-view', {
      'region_id': data.region_id,
      'view': '<h3>Region <em>' + data.region_id + '</em></h3>'
    });
  });

  /**
   * Register the plugin with architect.
   */
  register(null, null);
};
