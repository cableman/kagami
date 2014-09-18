/**
 * @file
 * Plugin to load configuration files.
 */

// Object to hold the different files loaded.
var files = { };

/**
 * Load configutation file from disk.
 *
 * @private
 */
function load(file) {
  // Required modules.
  var nconf = require('nconf');

  // Override file with commandline arguments and enviroment varibles.
  nconf.argv()
       .env()
       .file({ "file": file, "search": true });

  files[file] = nconf;
}

/**
 * Define the Configuration object (constructor).
 */
var Configuration = function(file) {
  this.file = file;

  // Ensure that the configutation is loaded.
  load(file);
};

/**
 * Get configuration value.
 *
 * @param property
 *   Get configutation with the name given.
 *
 * @return
 *   The value of the configuration option.
 */
Configuration.prototype.get = function get(property) {
  return files[this.file].get(property);
};

module.exports = function (options, imports, register) {
  register(null, {
    "configuration": Configuration
  });
};
