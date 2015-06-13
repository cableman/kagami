/**
 * @file
 * Defines the Angular JS application the run the kagami frontend.
 */

// Define the angular application.
var kagamiApp = angular.module('kagamiApp', []);

/**
 * Service to handled socket.io communication with the server.
 */
kagamiApp.service('socket', ['$rootScope', '$q', function ($rootScope, $q) {
  "use strict";

  var socket;
  var self = this;

  /**
   * Connect to the web-socket.
   *
   * @param string token
   *   JWT authentication token from the activation request.
   */
  function getSocket(deferred) {
    // Get connected to the server.
    socket = io.connect('http://localhost:3000', {
      'force new connection': true,
      'max reconnection attempts': Infinity,
      'forceNew': true,
      'reconnection': true,
      'reconnectionDelay': 1000,
      'reconnectionDelayMax' : 5000,
      'reconnectionAttempts': Infinity
    });

    // Handle error events.
    socket.on('error', function (reason) {
      deferred.reject(reason);
    });

    socket.on('connect', function (data) {
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
  this.connect = function connect() {
    var deferred = $q.defer();

    // Try to connect to the server if not already connected.
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
   * Handled events from the socket connection.
   *
   * @param eventName
   *   Name of the event.
   * @param callback
   *   The callback to call when the event is fired.
   */
  this.on = function on(eventName, callback) {
    socket.on(eventName, function() {
      var args = arguments;
      $rootScope.$apply(function() {
        callback.apply(socket, args);
      });
    });
  };

  /**
   * Emit event into the socket connection.
   *
   * @param eventName
   *   The event to emit.
   * @param data
   *   The data to send with the event.
   * @param callback
   *   The callback to call when the event have been sent.
   */
  this.emit = function emit(eventName, data, callback) {
    socket.emit(eventName, data, function () {
      var args = arguments;
      $rootScope.$apply(function () {
        if(callback) {
          callback.apply(socket, args);
        }
      });
    });
  };
}]);

/**
 * Controller used by the Kagami logo.
 */
kagamiApp.controller('kagamiController', function ($scope, socket) {
  "use strict";

  // Default message.
  $scope.message = 'Connecting to server...';

  // Get socket connection.
  socket.connect().then(function (message) {
    // Display message from promise.
    $scope.message = message;
    socket.on('ready', function (data) {
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
kagamiApp.directive('region', ['socket', '$compile', function (socket, $compile) {
  "use strict";

  return {
    restrict: 'E',
    scope: {
      id: '@'
    },
    link: function (scope, element, attrs) {
      // Connect to the socket.
      socket.connect().then(function (result) {
        // Send region ready event into the socket.
        socket.emit('ready', { "region_id": scope.id });

        // Listen to region-view event and append the view (template) into the
        // region..
        socket.on('region-view-' + scope.id, function (data) {
          // Compile the HTML view/template.
          var el = angular.element('<span/>');
          el.append(data.view);
          $compile(el)(scope);
          element.append(el);

          // Listen for data.
          socket.on('region-content-' + scope.id, function (data) {
            scope.data = data.view;
          });
        });
      });
    }
  };
}]);

/**
 * Time ago directive that keeps updating the time ago.
 */
kagamiApp.directive('ago', ['$timeout', function ($timeout) {
  "use strict";

  return {
    restrict: 'E',
    scope: {
      time: '@',
      interval: '@'
    },
    link: function (scope, element, attrs) {
      var intervalLength = Number(scope.interval) * 1000;
      var timeoutId;

      function updateTime() {
        element.text(moment(Number(scope.time)).fromNow());
      }

      function updateLater() {
        timeoutId = $timeout (function () {
          updateTime();
          updateLater();
        }, intervalLength);
      }

      element.bind('$destroy', function () {
        $timeout.cancel(timeoutId);
      });

      updateTime();
      updateLater();
    }
  };
}]);

/**
 * Create filter that pads a number with zero's.
 */
kagamiApp.filter('numberFixedLen', function () {
  "use strict";

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

/**
 * Create filter that pads a number with zero's.
 */
kagamiApp.filter('highlight', function ($sce) {
  "use strict";

  return function (text, type) {
    if (type === 'hashtag') {
      text = text.replace(/\B#(\w+)/g, '<span class="highlight">#$1</span>');
    }

    return $sce.trustAsHtml(text);
  };
});
