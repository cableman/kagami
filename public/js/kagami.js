/**
 * @file
 * Defines the Angular JS application the run the kagami frontend.
 */

// Define the angular application.
var kagamiApp = angular.module('kagamiApp', []);

/**
 * Service to handled socket.io communication with the server.
 */
kagamiApp.service('socket', ['$rootScope', '$q', function($rootScope, $q) {
  var socket;
  var self = this;

  /**
   * Get GET-paramter @name from the url.
   *
   * @param string name
   *
   * @returns {string}
   */
  function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
      results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
  }

  /**
   * Connect to the web-socket.
   *
   * @param string token
   *   JWT authentication token from the activation request.
   */
  function getSocket(deferred) {
    // Get connected to the server.
    socket = io.connect('http://localhost:3000');

    // Handle error events.
    socket.on('error', function (reason) {
      deferred.reject(reason);
    });

    socket.on('connect', function(data) {
      self.connected = true;
      deferred.resolve('Connected to the server.');
    });

    // Handle disconnect event (fires when disconnected or connection fails).
    socket.on('disconnect', function (reason) {
      if (reason == 'booted') {
        // Reload application.
        location.reload(true);
      }
    });
  }

  /**
   * Create the connection to the server with promise.
   */
  this.connect = function() {
    var deferred = $q.defer();

    // Try to connect to the server if not allready connected.
    if (socket === undefined) {
      // Create the connection by authenticate this mirror.
      getSocket(deferred);
    }
    else {
      deferred.resolve('Connected to the server.');
    }

    return deferred.promise;
  };

  /**
   * Set public functions.
   */
  this.on = function(eventName, callback) {
    socket.on(eventName, function() {
      var args = arguments;
      $rootScope.$apply(function() {
        callback.apply(socket, args);
      });
    });
  };

  this.emit = function(eventName, data, callback) {
    socket.emit(eventName, data, function() {
      var args = arguments;
      $rootScope.$apply(function() {
        if(callback) {
          callback.apply(socket, args);
        }
      });
    });
  };
}]);

/**
 * Controler used by the kagami logo.
 */
kagamiApp.controller('kagamiController', function($scope, socket) {
  // Default message.
  $scope.message = 'Connecting to server...';

  // Get socket connection.
  socket.connect().then(function(message) {
    // Display message from promise.
    $scope.message = message;
    socket.on('ready', function(data) {
      // Display message from server.
      $scope.message = data.message;
    });

    // Send ready message to server.
    socket.emit('ready', { "region_id": 'kagami' });
  });
});

/**
 * Directive to get content for a given region.
 */
kagamiApp.directive('region', ['socket', '$compile', function(socket, $compile) {
  return {
    restrict: 'E',
    scope: {
      id: '@',
    },
    link: function(scope, element, attrs) {
      socket.connect().then(function(result) {
        socket.emit('ready', { "region_id": scope.id });

        socket.on('region-view-' + scope.id, function(data) {
          // Compile the HTML view/template.
          var el = angular.element('<span/>');
          el.append(data.view);
          $compile(el)(scope);
          element.append(el);

          // Listen for data.
          socket.on('region-content-' + scope.id, function(data) {
            scope.data = data.view;
          });
        });
      });
    }
  }
}]);

/**
 * Create filter that pads a number with zero's.
 */
kagamiApp.filter('numberFixedLen', function () {
  return function (n, len) {
    var num = parseInt(n, 10);
    len = parseInt(len, 10);

    // Check that input was numbers.
    if (isNaN(num) || isNaN(len)) {
        return n;
    }

    // Add needed zero's.
    num = '' + num;
    while (num.length < len) {
        num = '0' + num;
    }

    return num;
  };
});
