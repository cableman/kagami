/**
 * @file
 *
 */

var kagamiApp = angular.module('kagamiApp', []);


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
   * Check if a valied token exists.
   *
   * If a token is found and connection to the backend is attampted
   * else alter is displayed.
   */
  function authenticate(auth_hash, deferred) {
    // Build ajax post request.
    var request = new XMLHttpRequest();
    request.open('POST', '//localhost:3000/auth', true);
    request.setRequestHeader('Content-Type', 'application/json');

    request.onload = function(resp) {
      if (request.readyState === 4 && request.status === 200) {
        // Success.
        resp = JSON.parse(request.responseText);

        // Try to get connection to the proxy.
        getSocket(resp.token, deferred);
      }
      else {
        // We reached our target server, but it returned an error
        deferred.reject('Authentication could not be performed.');
      }
    };

    request.onerror = function(exception) {
      // There was a connection error of some sort
      deferred.reject('Authentication request failed.');
    };

    // Send the request.
    request.send(JSON.stringify({ "api_key": auth_hash }));
  }

  /**
   * Connect to the web-socket.
   *
   * @param string token
   *   JWT authentication token from the activation request.
   */
  function getSocket(token, deferred) {
    // Get connected to the server.
    socket = io.connect('http://localhost:3000', { query: 'token=' + token });

    // Handle error events.
    socket.socket.on('error', function (reason) {
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
      authenticate("2842955b38e4afa1c6d2222b7e39d256", deferred);
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
 * Controler used by the
 */
kagamiApp.controller('kagamiController', function($scope, socket) {
  // Default message.
  $scope.message = 'Connecting to server...';

  // Get socket connection.
  socket.connect().then(function(result) {
    // Display message from promise.
    $scope.message = result;
    socket.on('ready', function(data) {
      // Display message from server.
      $scope.message = data.message;
    });

    // Send ready message to server.
    socket.emit('ready', { region: 'kagami' });
  });
});

kagamiApp.controller('region1Controller', function($scope, socket) {
  socket.connect().then(function(result) {
    socket.emit('ready', { region: 1 });

    socket.on('dataRegion1', function(data) {
      $scope.data = data;
    });
  });
});

kagamiApp.controller('region2Controller', function($scope, socket) {
  socket.connect().then(function(result) {
    socket.emit('ready', { region: 2 });

    socket.on('dataRegion2', function(data) {
      $scope.data = data;
    });
  });
});

kagamiApp.controller('region3Controller', function($scope, socket) {
  socket.connect().then(function(result) {
    socket.emit('ready', { region: 3 });

    socket.on('dataRegion3', function(data) {
      $scope.data = data;
    });
  });
});

kagamiApp.controller('region4Controller', function($scope, socket) {
  socket.connect().then(function(result) {
    socket.emit('ready', { region: 4 });

    socket.on('dataRegion4', function(data) {
      $scope.data = data;
    });
  });
});

kagamiApp.controller('region5Controller', function($scope, socket) {
  socket.connect().then(function(result) {
    socket.emit('ready', { region: 5 });

    socket.on('dataRegion5', function(data) {
      $scope.data = data;
    });
  });
});

kagamiApp.controller('region6Controller', function($scope, socket) {
  socket.connect().then(function(result) {
    socket.emit('ready', { region: 6 });

    socket.on('dataRegion6', function(data) {
      $scope.data = data;
    });
  });
});

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