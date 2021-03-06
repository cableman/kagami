#!/usr/bin/env node

var path = require('path');
var architect = require("architect");

// Configure the plugins.
var config = [
  {
    "packagePath": "./plugins/logger",
    "filename": path.join(__dirname, 'debug.log'),
    "debug": true
  },
  {
    "packagePath": "./plugins/cache",
    "config": {
      "port": "6379",
      "host": "localhost",
      "auth": null,
      "db": 0
    }
  },
  {
    "packagePath": "./plugins/server",
    "port": "3000",
    "path": path.join(__dirname, 'public')
  },
  {
    "packagePath": "./plugins/socket"
  },
  {
    "packagePath": "./plugins/kagami"
  },
  {
    "packagePath": "./plugins/weather"
  },
  {
    "packagePath": "./plugins/moon"
  },
  {
    "packagePath": "./plugins/image"
  }
];

// User the configuration to start the application.
config = architect.resolveConfig(config, __dirname);
architect.createApp(config, function (err, app) {
  if (err) {
    throw err;
  }
});
