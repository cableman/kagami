/**
 * @file
 * Generate dummy content for all front-end regions.
 */

/**
 * Register the plugin with architect.
 */
module.exports = function (options, imports, register) {
  var kagami = imports.kagami;

  kagami.on('request-view', function(data) {
    kagami.emit('response-view', {
      'region_id': data.region_id,
      'view': '<h3>Region <em>' + data.region_id + '</em></h3>'
    });
  });

  register(null, null);
}