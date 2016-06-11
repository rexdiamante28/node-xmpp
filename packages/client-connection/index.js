'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NS = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _url = require('url');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// FIXME not browser friendly

var NS = exports.NS = 'jabber:client';

var Client = function (_EventEmitter) {
  _inherits(Client, _EventEmitter);

  function Client(options) {
    _classCallCheck(this, Client);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Client).call(this));

    _this.plugins = [];
    _this.transports = [];
    _this.transport = null;
    _this.jid = null;
    _this.uri = '';
    _this._domain = '';
    _this.options = (typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object' ? options : {};
    return _this;
  }

  _createClass(Client, [{
    key: 'id',
    value: function id() {
      return Math.random().toString().split('0.')[1];
    }
  }, {
    key: 'connect',
    value: function connect(uri) {
      var _this2 = this;

      var cb = arguments.length <= 1 || arguments[1] === undefined ? function () {} : arguments[1];

      var params = void 0;
      var Transport = this.transports.find(function (Transport) {
        return params = Transport.match(uri); // eslint-disable-line no-return-assign
      });

      // FIXME callback?
      if (!Transport) throw new Error('No transport found');

      var transport = this.transport = new Transport();['stream:features', 'close', 'error'].forEach(function (e) {
        transport.on(e, function () {
          for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          return _this2.emit.apply(_this2, [e].concat(args));
        });
      });
      transport.on('element', function (element) {
        return _this2._onelement(element);
      });
      transport.on('close', function (element) {
        return _this2._onclose();
      });

      transport.connect(params, function (err) {
        if (err) return cb(err);
        _this2.uri = uri;
        cb();
      });
    }
  }, {
    key: 'open',
    value: function open() {
      var _this3 = this;

      var params = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
      var cb = arguments.length <= 1 || arguments[1] === undefined ? function () {} : arguments[1];

      if (typeof params === 'string') {
        params = { domain: params };
      } else if (typeof params === 'function') {
        cb = params;
        params = {};
      }

      var domain = params.domain || (0, _url.parse)(this.uri).hostname;

      this.transport.open(domain, function (err, features) {
        if (err) return cb(err);
        _this3._domain = domain;
        _this3.features = features;
        _this3.emit('open', features);
        cb(null, features);
      });
    }
  }, {
    key: 'close',
    value: function close(cb) {
      this.transport.close(cb);
    }
  }, {
    key: '_onclose',
    value: function _onclose() {
      delete this._domain;
    }
  }, {
    key: '_restart',
    value: function _restart(cb) {
      var _this4 = this;

      this.transport.restart(this._domain, function (err, features) {
        if (err) return cb(err);
        _this4.features = features;
        cb();
      });
    }
  }, {
    key: '_onelement',
    value: function _onelement(element) {
      this.emit('element', element);['iq', 'message', 'presence'].some(function (n) {
        return n === element.name;
      }) ? this.emit('stanza', element) : this.emit('nonza', element);
    }
  }, {
    key: 'send',
    value: function send(stanza) {
      stanza = stanza.root();

      // FIXME move to WebSocket?
      switch (stanza.name) {
        case 'iq':
        case 'presence':
        case 'message':
          stanza.attrs.xmlns = stanza.attrs.xmlns || NS;
      }

      this.transport.send(stanza);
    }
  }, {
    key: 'use',
    value: function use(plugin) {
      if (this.plugins.includes(plugin)) return;
      this.plugins.push(plugin);
      plugin(this);
    }
  }]);

  return Client;
}(_events2.default);

exports.default = Client;