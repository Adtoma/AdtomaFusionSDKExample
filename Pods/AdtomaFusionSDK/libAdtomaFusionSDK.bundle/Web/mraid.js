(function (exports) {
  if (exports.Fusion === undefined || exports.Fusion === null) {
    exports.Fusion = {};
  }
  if (exports.Fusion.SDK === undefined || exports.Fusion.SDK === null) {
    exports.Fusion.SDK = {};
  }
  var consts = exports.Fusion.SDK.consts = {};

  // possible states of the ad
  consts.state = {
    LOADING: 'loading',
    DEFAULT: 'default',
    EXPANDED: 'expanded',
    RESIZED: 'resized',
    HIDDEN: 'hidden'
  };

  // posible placement types of the ad
  consts.placementType = {
    INLINE: 'inline',
    INTERSTITIAL: 'interstitial'
  };

  // evens
  consts.eventType = {
    READY: 'ready',
    ERROR: 'error',
    STATECHANGE: 'stateChange',
    VIEWABLECHANGE: 'viewableChange',
    SIZECHANGE: 'sizeChange',
    LOCATIONCHANGE: 'locationChange'
  };

  // possible features
  consts.feature = {
    SMS: 'sms',
    TEL: 'tel',
    CALENDAR: 'calendar',
    STOREPICTURE: 'storePicture',
    INLINEVIDEO: 'inlineVideo'
  };

  // possible orientations
  consts.orientation = {
    PORTRAIT: 'portrait',
    LANDSCAPE: 'landscape',
    NONE: 'none'
  };

  // where the close button can be placed
  consts.closePosition = {
    TOPLEFT: 'top-left',
    TOPRIGHT: 'top-right',
    BOTTOMLEFT: 'bottom-left',
    BOTTOMRIGHT: 'bottom-right',
    CENTER: 'center',
    TOPCENTER: 'top-center',
    BOTTOMCENTER: 'bottom-center',
    DEFAULT: 'top-right'
  };

  consts.MRAIDVersion = '2.0';
})(typeof exports === 'undefined' ? this : exports);

(function (exports) {

  function createEventBus(eventTypes) {
    // the event listeners grouped by event type
    var listeners = {};
    // create array of listeners for each of allowed event types
    for (var e in eventTypes) {
      if (eventTypes.hasOwnProperty(e)) {
        listeners[eventTypes[e]] = [];
      }
    }

    // check if object is defined and not null
    var isNotNull = function (obj) {
      return (obj !== undefined && obj !== null);
    };

    // check if the event is allowed
    var isEventAllowed = function (e) {
      return isNotNull(listeners[e]);
    };

    // adds an event listener bound to specific type
    var add = function (e, listener) {
      if (!isEventAllowed(e)) {
        return false;
      } // event undefined, null, or not allowed
      if (!isNotNull(listener)) {
        return false;
      } // listener undefined or null
      if (!has(e, listener)) {
        listeners[e].push(listener);
        return true; // true indicates the listener was added to the list
      }
      return false; // listener was not added, already there
    };

    // removes event listener from event; if no listener specified, all
    // listeners for an event are removed
    var del = function (e, listener) {
      if (has(e)) {
        if (!isNotNull(listener)) {
          // listener null, remove all listeners from event
          listeners[e].length = 0;
          return true;
        } else {
          // remove only single listener
          var idx = listeners[e].indexOf(listener);
          if (idx >= 0) {
            // listener was found, remove it from the array
            listeners[e].splice(idx, 1);
            return true;
          }
        }
      }
      return false;
    };

    // checks if there's a listener defined for event e
    // if passed listener is null, returns true if there are any listeners defined for event
    var has = function (e, listener) {
      if (isEventAllowed(e)) {
        if (isNotNull(listener)) {
          return (listeners[e].indexOf(listener) >= 0);
        }
        // listener null, are there any for that event?
        return listeners[e].length > 0;
      }
      return false;
    };

    // fires the event to all listening listeners
    var dispatch = function (e) {
      if (!isEventAllowed(e)) {
        return false; // no such event
      }
      var args;
      if (arguments.length > 1) {
        // arguments passed
        args = [];
        for (var argIdx = 1; argIdx < arguments.length; argIdx++) {
          args.push(arguments[argIdx]);
        }
      }
      // dispatch events
      if (listeners[e].length > 0) {
        for (var lstIdx = 0; lstIdx < listeners[e].length; lstIdx++) {
          if (isNotNull(args)) {
            listeners[e][lstIdx].apply(undefined, args);
          } else {
            listeners[e][lstIdx].apply();
          }
        }
        return true; // listeners were called
      }
      return false; // listeners were not called
    };

    return {
      'addListener': add,
      'removeListener': del,
      'dispatchEvent': dispatch
    };
  }

  exports.Fusion.SDK.eventBus = createEventBus(exports.Fusion.SDK.consts.eventType);

})(typeof exports === 'undefined' ? this : exports);

(function (exports) {
  if (exports.Fusion.SDK.device) {
    return; //already defined
  }

  if (exports.Fusion === undefined || exports.Fusion === null) {
    exports.Fusion = {};
  }
  if (exports.Fusion.SDK === undefined || exports.Fusion.SDK === null) {
    exports.Fusion.SDK = {};
  }

  var ProtocolScheme = 'fusion';
  var QueueHasMessage = '__fusion_message__';

  var messagingIframe;
  var uniqueId = 1;
  var responseCallbacks = {};
  var sendMessageQueue = [];
  var messageHandlers = {};

  var createQueueReadyIframe = function (doc) {
    doc.removeEventListener('DOMContentLoaded');
    messagingIframe = doc.createElement('iframe');
    messagingIframe.style.display = 'none';
    doc.documentElement.appendChild(messagingIframe);
    messagingIframe.src = ProtocolScheme + '://' + QueueHasMessage;
  };

  var prepareQueueReadyIframe = function (doc) {
    if (doc.readyState === 'complete') {
      // doc is ready, create iframe
      createQueueReadyIframe(doc);
    } else {
      // not yet ready, wait for content loaded event
      doc.addEventListener('DOMContentLoaded', function () {
        createQueueReadyIframe(doc);
      });
    }
  };

  var notifyDevice = function () {
    if (messagingIframe) {
      messagingIframe.src = ProtocolScheme + '://' + QueueHasMessage;
    }
  };

  var doSend = function (message, responseCallback) {
    if (responseCallback) {
      var cbId = 'fus_cb_' + (uniqueId++) + '_' + new Date().getTime();
      responseCallbacks[cbId] = responseCallback;
      message['__callbackId'] = cbId;
    }
    sendMessageQueue.push(message);
    notifyDevice();
  };

  var registerHandler = function (handlerName, handler) {
    messageHandlers[handlerName] = handler;
  };

  var callHandler = function (handlerName, data, responseCallback) {
    doSend({
      handlerName: handlerName,
      data: data
    }, responseCallback);
  };

  var getQueuedMessages = function () {
    var queueString = JSON.stringify(sendMessageQueue);
    sendMessageQueue = [];
    return queueString;
  };

  var handleResponseFromDevice = function (data, responseId) {
    var responseCallback = responseCallbacks[responseId];
    if (!responseCallback) {
      return;
    }
    responseCallback(data);
    delete responseCallbacks[responseId];
  };

  var handleCallFromDevice = function (message) {
    var responseCallback;
    if (message.__callbackId) {
      var cbResponseId = message.__callbackId;
      responseCallback = function (responseData) {
        doSend({
          '__responseId': cbResponseId,
          'responseData': responseData
        });
      };
    }
    var handler = messageHandlers[message.handlerName];
    try {
      handler(message.data, responseCallback);
    } catch (exception) {
      if (typeof console !== 'undefined') {
        console.log('Javascript bridge threw exception: ' + exception);
      }
    }
  };

  var dispatchMessageFromDevice = function (messageJSON) {
    setTimeout(function () {
      var message = JSON.parse(messageJSON);
      if (message.__responseId) {
        handleResponseFromDevice(message.responseData, message.__responseId);
      } else {
        handleCallFromDevice(message);
      }
    });
    return 'ok';
  };

  // send info to the device
  var sendInfo = function (infoMessage) {
    callHandler('info', {
      'message': infoMessage
    });
  };

  // send error to the device
  var sendError = function (errorMessage) {
    callHandler('error', {
      'message': errorMessage
    });
  };

  var open = function (url, callback) {
    callHandler('open', {
      'url': url
    }, callback);
  };

  var expand = function (params, callback) {
    callHandler('expand', params, callback);
  };

  var setOrientationProperties = function (orientationProperties) {
    callHandler('setorientationproperties', orientationProperties);
  };

  var close = function (callback) {
    callHandler('close', null, callback);
  };

  var resize = function (resizeProperties, callback) {
    callHandler('resize', resizeProperties, callback);
  };

  var playVideo = function (url, callback) {
    callHandler('playvideo', {
      'url': url
    }, callback);
  };

  var storePicture = function (url, callback) {
    callHandler('storepicture', {
      'url': url
    }, callback);
  };

  var createCalendarEvent = function (params, callback) {
    callHandler('createcalendarevent', params, callback);
  };

  var sendSDKJSReady = function (callback) {
    callHandler('sdkjsready', null, callback);
  };

  var useCustomClose = function (isUseCustomClose) {
    callHandler('usecustomclose', {
      'useCustomClose': isUseCustomClose
    });
  };

  var adWillLoad = function () {
    callHandler('adwillload');
  };

  var adDidLoad = function (adId) {
    callHandler('addidload', {
      'adId': adId
    });
  };

  var noAdReceived = function (spaceName) {
    callHandler('noadreceived', {
      'spaceName': spaceName
    });
  };

  var adError = function (message) {
    callHandler('error', {
      'message': message
    });
  };

  var setCloseEventRegionPresent = function (isCloseEventRegionPresent) {
    callHandler('setCloseEventRegionPresent', {
      'isCloseEventRegionPresent': isCloseEventRegionPresent
    });
  };

  var setCloseIndicatorVisible = function (isCloseIndicatorVisible) {
    callHandler('setCloseIndicatorVisible', {
      'isCloseIndicatorVisible': isCloseIndicatorVisible
    });
  };

  var getOS = function () {
    return 'ios';
  };

  var inlineMediaWillStart = function (url) {
    callHandler('inlineMediaWillStart', {
      'url': url
    });
  };

  var inlineMediaDidStop = function (url) {
    callHandler('inlineMediaDidStop', {
      'url': url
    });
  };

  // create iframe for communication after doc is loaded
  prepareQueueReadyIframe(exports.document);

  // sdk.device definition
  exports.Fusion.SDK.device = {
    'sendSDKJSReady': sendSDKJSReady,
    'sendInfo': sendInfo,
    'sendError': sendError,
    'useCustomClose': useCustomClose,
    'open': open,
    'close': close,
    'expand': expand,
    'setOrientationProperties': setOrientationProperties,
    'resize': resize,
    'playVideo': playVideo,
    'storePicture': storePicture,
    'createCalendarEvent': createCalendarEvent,
    'adWillLoad': adWillLoad,
    'adDidLoad': adDidLoad,
    'noAdReceived': noAdReceived,
    'adError': adError,
    'setCloseEventRegionPresent': setCloseEventRegionPresent,
    'setCloseIndicatorVisible': setCloseIndicatorVisible,
    'registerHandler': registerHandler,
    'fetchQueueMessages': getQueuedMessages,
    'handleMessageFromDevice': dispatchMessageFromDevice,
    'getOS': getOS,
    'inlineMediaWillStart': inlineMediaWillStart,
    'inlineMediaDidStop': inlineMediaDidStop
  };

})(typeof exports === 'undefined' ? this : exports);

(function (exports) {
  function createAdContainer() {
    // event bus
    var eventBus = exports.Fusion.SDK.eventBus;
    // device bridge
    var device = exports.Fusion.SDK.device;
    // constants
    var consts = exports.Fusion.SDK.consts;
/*
			initial values of the internal state of the ad container
		*/

    // the current state - loading at first
    var state = consts.state.LOADING;

    // the initla placement type (inline), can be changed via AdView property (in the device code)
    var placementType = consts.placementType.INLINE;

    // flag indicating whether the container is viewable
    var isAdViewable = false;

    var expandPropertiesSet = false;
    // inital expand properties of the ad
    var expandProperties = {
      width: -1,
      height: -1,
      useCustomClose: false,
      isModal: true
    };

    // initial orientation properties of the ad
    var orientationProperties = {
      allowOrientationChange: true,
      forceOrientation: consts.orientation.NONE
    };

    // initial resize properties of the ad
    var resizeProperties = {
      width: 0,
      height: 0,
      offsetX: 0,
      offsetY: 0,
      customClosePosition: consts.closePosition.TOPRIGHT,
      allowOffscreen: true
    };

    // flag indicating whether resize properties are set
    // before resize properties are set, resize() throws an error
    var isResizePropertiesSet = false;

    // current position of the ad container
    var currentPosition = {
      x: 0,
      y: 0,
      width: 0,
      height: 0
    };

    // max size of the ad container
    var maxSize = {
      width: 0,
      height: 0
    };

    // default position of the ad container
    var defaultPosition = {
      x: 0,
      y: 0,
      width: 0,
      height: 0
    };

    // device screen size
    var screenSize = {
      width: 0,
      height: 0
    };

    // map of supported features, e.g. 'sms': true
    var supportedFeatures = {};

    // last known location
    var currentLocation = {
      lat: 0,
      lon: 0,
      acc: 0,
      isValid: false
    };

    /////////////////////////////////////////////////////////////
    var validateConst = function (constName, value) {
      for (var allowedValue in consts[constName]) {
        if (consts[constName][allowedValue] === value) {
          return true;
        }
      }
      return false;
    };

    var addEventListener = function (e, listener) {
      device.sendInfo('addEventListener called');
      var added = eventBus.addListener(e, listener);
      if (!added) {
        broadcastError('Failed to add event listener to event ' + e, 'addEventListener');
      }
    };

    var removeEventListener = function (e, listener) {
      device.sendInfo('removeEventListener called');
      var removed = eventBus.removeListener(e, listener);
      if (!removed) {
        broadcastError('Failed to remove event listener for event ' + e, 'removeEventListener');
      }
    };

    var getState = function () {
      device.sendInfo('getState called');
      return state;
    };

    var updateState = function (newState) {
      device.sendInfo('updateState called with state ' + newState);

      if (!validateConst('state', newState)) {
        broadcastError('Tried to set state to ' + newState + ', which is not one of allowed states.', 'updateState');
        return;
      }

      // check if new state is different than old state
      var diff = state !== newState;
      var oldState = state;
      // change state
      state = newState;
      // dispatch state change event
      if (diff || state === consts.state.RESIZED) {
        eventBus.dispatchEvent(consts.eventType.STATECHANGE, state);
        device.sendInfo('State changed from ' + oldState + ' to ' + state);
      }
    };

    var getPlacementType = function () {
      return placementType;
    };

    var isViewable = function () {
      return isAdViewable;
    };

    var updateViewable = function (viewable) {
      if (viewable !== isAdViewable) {
        isAdViewable = viewable;
        eventBus.dispatchEvent(consts.eventType.VIEWABLECHANGE, viewable);
      }
    };

    var open = function (url) {
      if (!url) {
        broadcastError('Valid URL is required', 'open', 'Tried to call open() with invalid url: ' + url);
        return;
      }
      device.open(url, function (response) {
        if (response.status !== "ok") {
          broadcastError('Failed to open url ' + url + ', device message: ' + response.message, 'open');
        }
      });
    };

    // checks if ad can expand
    var canExpand = function () {
      switch (state) {
      case consts.state.LOADING:
      case consts.state.EXPANDED:
      case consts.state.HIDDEN:
        broadcastError('expand() has no effect when ad is in ' + state + ' state', 'expand', 'Tried to expand when ad is in ' + state + ' state');
        return false;
      case consts.state.DEFAULT:
        if (placementType === consts.placementType.INTERSTITIAL) {
          broadcastError('expand() has no effect when placement type is interstitial', 'expand', 'Tried to expand an interstitial ad');
          return false;
        }
        return true;
      case consts.state.RESIZED:
        return true;
      }
    };

    var expand = function (url) {
      // check if can expand (depends on state and placement type)
      if (!canExpand()) {
        return;
      }

      var expandParams = getExpandProperties();
      expandParams.url = url;

      device.expand(expandParams, function (response) {
        if (response.status === 'ok') {
          updatePosition({
            x: 0,
            y: 0,
            width: expandProperties.width,
            height: expandProperties.height
          });
          updateState(consts.state.EXPANDED); // this will fire a stateChange event
          eventBus.dispatchEvent(consts.eventType.SIZECHANGE, expandProperties.width, expandProperties.height);
        } else {
          broadcastError('Expand failed with message: ' + response.message, 'expand');
        }
      });
    };

    var getExpandProperties = function () {
      return {
        width: expandPropertiesSet ? expandProperties.width : screenSize.width,
        height: expandPropertiesSet ? expandProperties.height : screenSize.height,
        useCustomClose: expandProperties.useCustomClose,
        isModal: expandProperties.isModal
      };
    };

    var setExpandProperties = function (newExpandProperties) {
      var newWidth = expandProperties.width,
          newHeight = expandProperties.height,
          newUseCustomClose = expandProperties.useCustomClose;
      if (newExpandProperties.hasOwnProperty('width')) {
        var w = newExpandProperties.width;
        if (isNaN(w) || w < 0 || w > screenSize.width) {
          broadcastError('Incorrect width (NaN or < 0 or > screen width) passed', 'setExpandProperties', 'setExpandProperties() - incorrect width (< 0 or NaN or > screen width)');
          return;
        }
        // all ok
        newWidth = w;
      } else {
        // width set to screen width
        newWidth = screenSize.width;
      }
      if (newExpandProperties.hasOwnProperty('height')) {
        var h = newExpandProperties.height;
        if (isNaN(h) || h < 0 || h > screenSize.height) {
          broadcastError('Incorrect height (NaN or < 0 or > screen height) passed', 'setExpandProperties', 'setExpandProperties() - incorrect height (< 0 or NaN or > screen width)');
          return;
        }
        // all ok
        newHeight = h;
      } else {
        // height set to screen height
        newHeight = screenSize.height;
      }
      if (newExpandProperties.hasOwnProperty('useCustomClose')) {
        var c = newExpandProperties.useCustomClose;
        if (typeof c !== 'boolean') {
          broadcastError('Incorrect useCustomClose value passed', 'setExpandProperties', 'setExpandProperties() - incorrect useCustomClose value (not boolean)');
          return;
        }
        // all ok
        newUseCustomClose = c;
      } else {
        // no custom close by default
        newUseCustomClose = false;
      }
      expandProperties.width = newWidth;
      expandProperties.height = newHeight;
      expandProperties.useCustomClose = newUseCustomClose;
      expandPropertiesSet = true;
    };

    var getOrientationProperties = function () {
      return {
        allowOrientationChange: orientationProperties.allowOrientationChange,
        forceOrientation: orientationProperties.forceOrientation
      };
    };

    var setOrientationProperties = function (newOrientationProperties) {
      var newAllowOrientationChange = orientationProperties.allowOrientationChange,
          newForceOrientation = orientationProperties.forceOrientation;
      if (newOrientationProperties.hasOwnProperty('allowOrientationChange')) {
        var o = newOrientationProperties.allowOrientationChange;
        if (typeof o !== 'boolean') {
          broadcastError('Incorrect allowOrientationChange value passed', 'setOrientationProperties', 'setOrientationProperties() - incorrect allowOrientationChange value');
          return;
        }
        newAllowOrientationChange = o;
      }
      if (newOrientationProperties.hasOwnProperty('forceOrientation')) {
        var f = newOrientationProperties.forceOrientation;
        if (f !== consts.orientation.PORTRAIT && f !== consts.orientation.LANDSCAPE && f !== consts.orientation.NONE) {
          broadcastError('Incorrect forceOrientation value passed (' + f + ')', 'setOrientationProperties', 'setOrientationProperties() - incorrect forceOrientation value passed: ' + f);
          return;
        }
        newForceOrientation = f;
      }
      orientationProperties.allowOrientationChange = newAllowOrientationChange;
      orientationProperties.forceOrientation = newForceOrientation;
      device.setOrientationProperties(orientationProperties);
    };

    var canClose = function () {
      switch (state) {
      case consts.state.LOADING:
      case consts.state.HIDDEN:
        broadcastError('close() has no effect when ad is in ' + state + ' state', 'close');
        return false;
      case consts.state.DEFAULT:
      case consts.state.EXPANDED:
      case consts.state.RESIZED:
        return true;
      }
    };

    var close = function (deviceInitiated) {
      if (!canClose()) {
        return;
      }
      var position;
      if (state === consts.state.DEFAULT) {
        state = consts.state.HIDDEN;
        position = {
          x: 0,
          y: 0,
          width: 0,
          height: 0
        };
      } else if (state === consts.state.EXPANDED || state === consts.state.RESIZED) {
        state = consts.state.DEFAULT;
        var defaultPosition = getDefaultPosition();
        position = {
          x: defaultPosition.x,
          y: defaultPosition.y,
          width: defaultPosition.width,
          height: defaultPosition.height
        };
      }

      function updateStateAndPosition(state, newPosition) {
        updateState(state);
        var currentPos = getCurrentPosition();
        updatePosition(newPosition);
        if (newPosition.width !== currentPos.width || newPosition.height !== currentPos.height) {
          eventBus.dispatchEvent(consts.eventType.SIZECHANGE, newPosition.width, newPosition.height);
        }
      }

      if (deviceInitiated !== true) {
        device.close(function (response) {
          if (response.status !== 'ok') {
            broadcastError('Failed to close ad container: ' + response.message);
          } else {
            updateStateAndPosition(state, position);
          }
        });
      } else {
        updateStateAndPosition(state, position);
      }
    };

    var useCustomClose = function (isUseCustomClose) {
      if (typeof isUseCustomClose !== 'boolean') {
        broadcastError('Invalid parameter value passed: ' + isUseCustomClose, 'useCustomClose', 'useCustomClose() called with invalid parameter: ' + isUseCustomClose);
        return;
      }
      expandProperties.useCustomClose = isUseCustomClose;
      device.useCustomClose(isUseCustomClose);
    };

    var getResizeProperties = function () {
      return {
        width: resizeProperties.width,
        height: resizeProperties.height,
        offsetX: resizeProperties.offsetX,
        offsetY: resizeProperties.offsetY,
        customClosePosition: resizeProperties.customClosePosition,
        allowOffscreen: resizeProperties.allowOffscreen
      };
    };

    var setResizeProperties = function (newResizeProps) {
      var w = resizeProperties.width,
          h = resizeProperties.height,
          ox = resizeProperties.offsetX,
          oy = resizeProperties.offsetY,
          ccp = resizeProperties.customClosePosition,
          ao = resizeProperties.allowOffscreen;
      if (newResizeProps.hasOwnProperty('width')) {
        if (isNaN(newResizeProps.width) || newResizeProps.width < 0) {
          broadcastError('Invalid width in resize properties: ' + newResizeProps.width, 'setResizeProperties', 'setResizeProperties() called with invalid width: ' + newResizeProps.width);
          return;
        }
        w = newResizeProps.width;
      }
      if (newResizeProps.hasOwnProperty('height')) {
        if (isNaN(newResizeProps.height) || newResizeProps.height < 0) {
          broadcastError('Invalid height in resize properties: ' + newResizeProps.height, 'setResizeProperties', 'setResizeProperties() called with invalid height: ' + newResizeProps.height);
          return;
        }
        h = newResizeProps.height;
      }
      if (newResizeProps.hasOwnProperty('offsetX')) {
        if (isNaN(newResizeProps.offsetX)) {
          broadcastError('Invalid offsetX in resize properties: ' + newResizeProps.offsetX, 'setResizeProperties', 'setResizeProperties() called with invalid offsetX: ' + newResizeProps.offsetX);
          return;
        }
        ox = newResizeProps.offsetX;
      }
      if (newResizeProps.hasOwnProperty('offsetY')) {
        if (isNaN(newResizeProps.offsetY)) {
          broadcastError('Invalid offsetY in resize properties: ' + newResizeProps.offsetY, 'setResizeProperties', 'setResizeProperties() called with invalid offsetY: ' + newResizeProps.offsetY);
          return;
        }
        oy = newResizeProps.offsetY;
      }
      if (newResizeProps.hasOwnProperty('customClosePosition')) {
        var ok = false;
        for (var pos in consts.closePosition) {
          if (consts.closePosition[pos] === newResizeProps.customClosePosition) {
            ok = true;
            break;
          }
        }
        if (!ok) {
          broadcastError('Invalid customClosePosition in resize properties: ' + newResizeProps.customClosePosition, 'setResizeProperties', 'setResizeProperties() called with invalid customClosePosition: ' + newResizeProps.customClosePosition);
          return;
        }
        ccp = newResizeProps.customClosePosition;
      }
      if (newResizeProps.hasOwnProperty('allowOffscreen')) {
        if (isNaN(newResizeProps.allowOffscreen) || newResizeProps.allowOffscreen < 0) {
          broadcastError('Invalid allowOffscreen in resize properties: ' + newResizeProps.allowOffscreen, 'setResizeProperties', 'setResizeProperties() called with invalid allowOffscreen: ' + newResizeProps.allowOffscreen);
          return;
        }
        ao = newResizeProps.allowOffscreen;
      }
      resizeProperties.width = w;
      resizeProperties.height = h;
      resizeProperties.offsetX = ox;
      resizeProperties.offsetY = oy;
      resizeProperties.customClosePosition = ccp;
      resizeProperties.allowOffscreen = ao;
      isResizePropertiesSet = true; // need to know to allow resize, resize properties must be set before calling resize()
    };

    var getCurrentPosition = function () {
      return {
        x: currentPosition.x,
        y: currentPosition.y,
        width: currentPosition.width,
        height: currentPosition.height
      };
    };

    var updatePosition = function (newPos) {
      if (newPos === undefined || newPos === null) {
        device.sendError('updatePosition() - no new position passed');
      }
      if (isNaN(newPos.width) || newPos.width < 0) {
        device.sendError('updatePosition() - width must be a number greater or equal 0');
        return false;
      }
      if (isNaN(newPos.height) || newPos.height < 0) {
        device.sendError('updatePosition() - height must be a number greater or equal 0');
        return false;
      }
      currentPosition.x = newPos.x;
      currentPosition.y = newPos.y;
      currentPosition.width = newPos.width;
      currentPosition.height = newPos.height;
      return true;
    };

    var getLocation = function () {
      if (currentLocation !== null && currentLocation.isValid) {
        return {
          lat: currentLocation.lat,
          lon: currentLocation.lon,
          acc: currentLocation.acc
        };
      }
      // no current location available, return null
      return null;
    };

    var updateLocation = function (message) {
      if (message.isValid) {
        currentLocation = {
          lat: message.lat,
          lon: message.lon,
          acc: message.acc,
          isValid: true
        };
        eventBus.dispatchEvent(consts.eventType.LOCATIONCHANGE, message.lat, message.lon, message.acc);
      }
    };

    var getMaxSize = function () {
      device.sendInfo('getMaxSize() called');
      return {
        width: maxSize.width,
        height: maxSize.height
      };
    };

    var updateMaxSize = function (newMaxSize) {
      maxSize.width = newMaxSize.width;
      maxSize.height = newMaxSize.height;
    };

    var getDefaultPosition = function () {
      device.sendInfo('getDefaultPosition() called');
      return {
        x: defaultPosition.x,
        y: defaultPosition.y,
        width: defaultPosition.width,
        height: defaultPosition.height
      };
    };

    var updateDefaultPosition = function (newDefPos) {
      defaultPosition.x = newDefPos.x;
      defaultPosition.y = newDefPos.y;
      defaultPosition.width = newDefPos.width;
      defaultPosition.height = newDefPos.height;
    };

    var getScreenSize = function () {
      device.sendInfo('getScreenSize() called');
      return {
        width: screenSize.width,
        height: screenSize.height
      };
    };

    var updateScreenSize = function (newScreenSize) {
      screenSize.width = newScreenSize.width;
      screenSize.height = newScreenSize.height;
    };

    var getVersion = function () {
      return consts.MRAIDVersion;
    };

    var supports = function (feature) {
      if (supportedFeatures.hasOwnProperty(feature)) {
        return supportedFeatures[feature];
      }
      return false;
    };

    var setSupports = function (supports) {
      for (var f in supports) {
        if (supports.hasOwnProperty(f)) {
          supportedFeatures[f] = supports[f];
        }
      }
    };

    var resize = function () {
      if (!isResizePropertiesSet) {
        broadcastError('Resize properties must be set before calling resize()', 'resize', 'Attempt to call resize() before setting resize properties');
        return;
      }
      if (state === consts.state.EXPANDED) {
        broadcastError('resize() called on an expanded ad has no effect', 'resize', 'Attempt to call resize() on expanded ad');
        return;
      }
      if (placementType === consts.placementType.INTERSTITIAL) {
        return; // no effect when it's interstitial
      }

      device.resize(resizeProperties, function (response) {
        if (response.status === 'ok') {
          // update current position - resize was successful
          updatePosition({
            x: resizeProperties.offsetX,
            y: resizeProperties.offsetY,
            width: resizeProperties.width,
            height: resizeProperties.height
          });
          updateState(consts.state.RESIZED); // this will dispatch stateChange event
          eventBus.dispatchEvent(consts.eventType.SIZECHANGE, resizeProperties.width, resizeProperties.height);
        } else {
          broadcastError(response.message, 'resize');
        }
      });
    };

    var playVideo = function (url) {
      if (!isViewable) {
        broadcastError('Video cannot be played before the ad is viewable', 'playVideo');
        return;
      }
      if (!url) {
        broadcastError('Invalid url when attempting to play video', 'playVideo');
        return;
      }
      device.playVideo(url, function (response) {
        if (response.status !== 'ok') {
          broadcastError(response.message, 'playVideo');
        }
      });
    };

    var storePicture = function (uri) {
      if (!isViewable) {
        broadcastError('Picture cannot be stored before the ad is viewable', 'storePicture');
        return;
      }
      if (!uri) {
        broadcastError('Invalid URI when attempting to store picture', 'storePicture');
        return;
      }
      device.storePicture(uri, function (response) {
        if (response.status !== 'ok') {
          broadcastError(response.message, 'storePicture');
        }
      });
    };

    var createCalendarEvent = function (parameters) {
      device.createCalendarEvent(parameters, function (response) {
        if (response.status !== 'ok') {
          broadcastError(response.message, 'createCalendarEvent');
        }
      });
    };

/*
			initialData is a JSON object containing initial values for the ad variables.
			{
				'placementType': placementType,
				'currentPosition': currentPosition,
				'maxSize': maxSize,
				'screenSize': screenSize,
				'defaultPosition': defaultPosition,
				'supports': supports object,
				'location': location,
				'viewable': isViewable
			}
		*/
    var initializeComplete = function (initialData) {
      // called by the device SDK to inform the script that it's ready to roll
      // initial values are set
      placementType = initialData.placementType;
      updateState(consts.state.DEFAULT);
      updatePosition(initialData.currentPosition);
      updateMaxSize(initialData.maxSize);
      updateScreenSize(initialData.screenSize);
      // initial expand properties have width and height of the creative
      // equal to the screen size
      setExpandProperties({
        width: initialData.screenSize.width,
        height: initialData.screenSize.height,
        useCustomClose: false
      });
      updateDefaultPosition(initialData.defaultPosition);
      setSupports(initialData.supports);
      updateLocation(initialData.location);
      updateViewable(initialData.viewable);
      eventBus.dispatchEvent(consts.eventType.READY);
    };

    var reset = function () {
      state = consts.state.LOADING;
      // the initla placement type (inline), can be changed via AdView property (in the device code)
      placementType = consts.placementType.INLINE;
      // flag indicating whether the container is viewable
      isAdViewable = false;
      // inital expand properties of the ad
      expandProperties = {
        width: -1,
        height: -1,
        useCustomClose: false,
        isModal: true
      };
      // initial orientation properties of the ad
      orientationProperties = {
        allowOrientationChange: true,
        forceOrientation: consts.orientation.NONE
      };
      // initial resize properties of the ad
      resizeProperties = {
        width: 0,
        height: 0,
        offsetX: 0,
        offsetY: 0,
        customClosePosition: consts.closePosition.TOPRIGHT,
        allowOffscreen: true
      };
      // flag indicating whether resize properties are set
      // before resize properties are set, resize() throws an error
      isResizePropertiesSet = false;

      // clear events
      for (var e in consts.eventType) {
        if (consts.eventType.hasOwnProperty(e)) {
          eventBus.removeListener(consts.eventType[e]);
        }
      }
    };

    var closeByDevice = function () {
      close(true);
    };

    var broadcastError = function (innerMessage, methodName, deviceMessage) {
      eventBus.dispatchEvent(consts.eventType.ERROR, innerMessage, methodName);
      if (deviceMessage === undefined || deviceMessage === null) {
        deviceMessage = innerMessage;
      }
      device.sendError(deviceMessage);
    };

    return {
      // MRAID
      'addEventListener': addEventListener,
      'createCalendarEvent': createCalendarEvent,
      'close': close,
      'expand': expand,
      'getCurrentPosition': getCurrentPosition,
      'getDefaultPosition': getDefaultPosition,
      'getExpandProperties': getExpandProperties,
      'getMaxSize': getMaxSize,
      'getPlacementType': getPlacementType,
      'getResizeProperties': getResizeProperties,
      'getScreenSize': getScreenSize,
      'getState': getState,
      'getVersion': getVersion,
      'isViewable': isViewable,
      'open': open,
      'playVideo': playVideo,
      'removeEventListener': removeEventListener,
      'resize': resize,
      'setExpandProperties': setExpandProperties,
      'setResizeProperties': setResizeProperties,
      'storePicture': storePicture,
      'supports': supports,
      'useCustomClose': useCustomClose,
      'getOrientationProperties': getOrientationProperties,
      'setOrientationProperties': setOrientationProperties,
      // FUSION
      'getLocation': getLocation,
      'initializeComplete': initializeComplete,
      'reset': reset,
      // called by device
      'closeByDevice': closeByDevice,
      'updateViewable': updateViewable,
      'updateLocation': updateLocation,
      'updateScreenSize': updateScreenSize,
      'updateMaxSize': updateMaxSize,
      'updatePosition': updatePosition,
      'updateDefaultPosition': updateDefaultPosition
    };
  }

  exports.Fusion.SDK.adContainer = createAdContainer();
  exports.Fusion.SDK.adContainer.reset();
  exports.Fusion.SDK.device.sendSDKJSReady(exports.Fusion.SDK.adContainer.initializeComplete);

})(typeof exports === 'undefined' ? this : exports);

// the mraid object has only a subset of methods of our adContainer; expose them as mraid
(function (exports) {
  var isDefined = function (what) {
    return (what !== undefined && what !== null);
  };
  if (isDefined(exports) && isDefined(exports.Fusion) && isDefined(exports.Fusion.SDK) && isDefined(exports.Fusion.SDK.adContainer)) {
    var fusionAdContainer = exports.Fusion.SDK.adContainer;
    exports.mraid = {
      'addEventListener': fusionAdContainer.addEventListener,
      'removeEventListener': fusionAdContainer.removeEventListener,
      'createCalendarEvent': fusionAdContainer.createCalendarEvent,
      'close': fusionAdContainer.close,
      'expand': fusionAdContainer.expand,
      'getCurrentPosition': fusionAdContainer.getCurrentPosition,
      'getDefaultPosition': fusionAdContainer.getDefaultPosition,
      'getExpandProperties': fusionAdContainer.getExpandProperties,
      'getMaxSize': fusionAdContainer.getMaxSize,
      'getPlacementType': fusionAdContainer.getPlacementType,
      'getResizeProperties': fusionAdContainer.getResizeProperties,
      'getScreenSize': fusionAdContainer.getScreenSize,
      'getState': fusionAdContainer.getState,
      'getVersion': fusionAdContainer.getVersion,
      'isViewable': fusionAdContainer.isViewable,
      'open': fusionAdContainer.open,
      'playVideo': fusionAdContainer.playVideo,
      'resize': fusionAdContainer.resize,
      'setExpandProperties': fusionAdContainer.setExpandProperties,
      'setResizeProperties': fusionAdContainer.setResizeProperties,
      'storePicture': fusionAdContainer.storePicture,
      'supports': fusionAdContainer.supports,
      'useCustomClose': fusionAdContainer.useCustomClose,
      'setOrientationProperties': fusionAdContainer.setOrientationProperties
    };
  }
})(typeof exports === 'undefined' ? this : exports);

(function (exports) {
  if (exports.Fusion === undefined || exports.Fusion === null) {
    exports.Fusion = {};
  }
  if (exports.Fusion.SDK === undefined || exports.Fusion.SDK === null) {
    exports.Fusion.SDK = {};
  }
  var sdk = exports.Fusion.SDK;

  sdk.adsWillLoad = function () {
    sdk.device.adWillLoad();
  };

  sdk.adError = function (message) {
    sdk.device.adError(message);
  };

  sdk.adDidLoad = function (adId) {
    sdk.device.adDidLoad(adId);
  };

  sdk.noAdReceived = function (spaceName) {
    sdk.device.noAdReceived(spaceName);
  };

  sdk.getFusionAdSize = function (divId) {
    var result = {
      width: 0,
      height: 0
    };
    var adDiv = document.getElementById(divId);
    if (!adDiv) {
      sdk.device.adError('Cannot get the ad div by id: ' + divId);
      return result;
    }
    result.height = adDiv.scrollHeight;
    if (isNaN(result.height)) {
      result.height = 0;
    }
    result.width = adDiv.scrollWidth;
    if (isNaN(result.width)) {
      result.width = 0;
    }

    // Android way of returning value
    if (typeof sdk.device.fusionAdSizeResult === 'function') {
      sdk.device.fusionAdSizeResult(result);
    }

    return JSON.stringify(result);
  };

  sdk.setCloseEventRegionPresent = function (isCloseEventRegionPresent) {
    sdk.device.setCloseEventRegionPresent(isCloseEventRegionPresent);
  };

  sdk.setCloseIndicatorVisible = function (isCloseIndicatorVisible) {
    sdk.device.setCloseIndicatorVisible(isCloseIndicatorVisible);
  };

  sdk.inlineMediaWillStart = function (url) {
    sdk.device.inlineMediaWillStart(url);
  };

  sdk.inlineMediaDidStop = function (url) {
    sdk.device.inlineMediaDidStop(url);
  };

  sdk.getLocation = function () {
    return sdk.adContainer.getLocation();
  };

})(typeof exports === 'undefined' ? this : exports);

(function (exports) {
  var adContainer = exports.Fusion.SDK.adContainer;
  var device = exports.Fusion.SDK.device;
  if (!adContainer || !device) {
    return;
  }

  // register handlers possible to call from device
  device.registerHandler('deviceClose', adContainer.closeByDevice);
  device.registerHandler('updateViewable', adContainer.updateViewable);
  device.registerHandler('updateLocation', adContainer.updateLocation);
  device.registerHandler('updateScreenSize', adContainer.updateScreenSize);
  device.registerHandler('updateMaxSize', adContainer.updateMaxSize);
  device.registerHandler('updatePosition', adContainer.updatePosition);
  device.registerHandler('updateDefaultPosition', adContainer.updateDefaultPosition);

})(typeof exports === 'undefined' ? this : exports);