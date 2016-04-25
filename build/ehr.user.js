// ==UserScript==
// @name        e-hen-test
// @namespace   117414516
// @include     http://g.e-hentai.org/s/*
// @include     http://exhentai.org/s/*
// @version     1
// @grant       GM_xmlhttpRequest
// ==/UserScript==
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var COFetch = function COFetch(url) {
  var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  return new Promise(function (resolve, reject) {
    GM_xmlhttpRequest(Object.assign({
      'url': url,
      'onload': resolve,
      'onerror': reject
    }, options));
  });
};

exports.default = COFetch;

},{}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _queue = require('./queue');

var _queue2 = _interopRequireDefault(_queue);

var _cofetch = require('./cofetch');

var _cofetch2 = _interopRequireDefault(_cofetch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ehRetriever = function () {
  function ehRetriever(url, html) {
    _classCallCheck(this, ehRetriever);

    if (!url) throw new Error('`url` undefined');

    this.url = url;
    this.html = html;
    this.gallery = {
      'gid': undefined,
      'token': undefined
    };
    this.referer = url;
    this.showkey = undefined;
    this.exprefix = url.match('exhentai.org') ? 'ex' : 'g.e-';
    this.pages = [];
    this.q = new _queue2.default(3, 3000);
    this.onPageLoadCallback = [];

    this.promiseInit = this.init().catch(function (reason) {
      console.log(reason);
    });
  }

  _createClass(ehRetriever, [{
    key: 'init',
    value: function () {
      var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
        var galleryURL, showkey, res;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                galleryURL = void 0;
                showkey = void 0;

                if (this.html) {
                  _context.next = 7;
                  break;
                }

                _context.next = 5;
                return this.fetch(this.url);

              case 5:
                res = _context.sent;

                this.html = res.responseText;

              case 7:

                galleryURL = this.html.match(/hentai\.org\/g\/(\d+)\/([a-z0-9]+)/i);
                showkey = this.html.match(/showkey="([^"]+)"/i);

                if (!galleryURL) {
                  _context.next = 13;
                  break;
                }

                Object.assign(this.gallery, {
                  'gid': parseInt(galleryURL[1], 10),
                  'token': galleryURL[2]
                });
                _context.next = 14;
                break;

              case 13:
                throw new Error("Can't get gallery URL!");

              case 14:
                if (!showkey) {
                  _context.next = 18;
                  break;
                }

                this.showkey = showkey[1];
                _context.next = 19;
                break;

              case 18:
                throw new Error("Can't get showkey!");

              case 19:
                _context.next = 21;
                return this.getAllPageURL();

              case 21:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function init() {
        return ref.apply(this, arguments);
      }

      return init;
    }()
  }, {
    key: 'getAllPageURL',
    value: function () {
      var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee2() {
        var _self, firstPage, pageNumMax, pageNum, allPage;

        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _self = this;
                _context2.next = 3;
                return this.fetch('http://' + _self.exprefix + 'hentai.org/g/' + _self.gallery.gid + '/' + _self.gallery.token);

              case 3:
                firstPage = _context2.sent;
                pageNumMax = void 0;
                pageNum = firstPage.responseText.match(/g\/[^/]+\/[^/]+\/\?p=\d+/g);

                if (!pageNum) pageNumMax = 0;else pageNumMax = Math.max.apply(null, pageNum.map(function (e) {
                  return parseInt(e.match(/\d+$/), 10);
                }));

                _context2.t0 = [firstPage];
                _context2.next = 10;
                return Promise.all(Array(pageNumMax).fill().map(function (e, i) {
                  return _self.fetch('http://' + _self.exprefix + 'hentai.org/g/' + _self.gallery.gid + '/' + _self.gallery.token + '/?p=' + (i + 1));
                }));

              case 10:
                _context2.t1 = _context2.sent;
                allPage = _context2.t0.concat.call(_context2.t0, _context2.t1);


                _self.pages = allPage.reduce(function (p, c) {
                  return p.concat(c.responseText.match(/s\/[a-z0-9]+\/\d+-\d+(?=[^>]*>[^<]*<img)/ig));
                }, []).map(function (e) {
                  var tokens = e.split('/');
                  return {
                    'imgkey': tokens[1],
                    'page': parseInt(tokens[2].split('-')[1], 10)
                  };
                });

                return _context2.abrupt('return');

              case 14:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function getAllPageURL() {
        return ref.apply(this, arguments);
      }

      return getAllPageURL;
    }()
  }, {
    key: 'fetch',
    value: function fetch(url) {
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      if (typeof url !== 'string') return Promise.reject(new Error('invalid url: ' + url));

      var _self = this;
      var defaultOptions = {
        'method': 'GET',
        'headers': {
          'User-Agent': navigator.userAgent,
          'Referer': _self.referer,
          'Cookie': document.cookie
        }
      };
      if (options.headers) {
        Object.assign(defaultOptions.headers, options.headers);
        delete options.headers;
      }
      options = Object.assign(defaultOptions, options);
      console.log('fetch', url, options);

      return _self.q.queue(function (resolve, reject) {
        (0, _cofetch2.default)(url, options).then(resolve).catch(reject);
      }, 'fetch ' + url);
    }
  }, {
    key: 'retrieve',
    value: function () {
      var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee3() {
        var _self, imagePages, imageInfo;

        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _self = this;
                _context3.next = 3;
                return _self.promiseInit;

              case 3:
                _context3.next = 5;
                return Promise.all(_self.pages.map(function (e) {
                  return new Promise(function fetchPage(resolve, reject, failedOnce) {
                    _self.fetch('http://' + _self.exprefix + 'hentai.org/api.php', {
                      'method': 'POST',
                      'headers': { 'Content-Type': 'application/json' },
                      'data': JSON.stringify(Object.assign({
                        'method': 'showpage',
                        'gid': _self.gallery.gid,
                        'showkey': _self.showkey
                      }, e))
                    }).then(function (data) {
                      _self.onPageLoadCallback.forEach(function (callback) {
                        callback(e.page, _self.pages.length);
                      });
                      resolve(data);
                    }).catch(failedOnce ? undefined : fetchPage.bind(null, resolve, reject, true));
                  });
                }));

              case 5:
                imagePages = _context3.sent;
                imageInfo = imagePages.map(function (e) {
                  var info = JSON.parse(e.responseText);
                  return {
                    'filename': info.i.match(/>([^:]+):/)[1].trim(),
                    'imgsrc': info.i3.match(/src="([^"]+)"/)[1],
                    'failnl': [info.i6.match(/nl\('([^']+)'/)[1]],
                    'style': info.i3.match(/style="([^"]+)"/)[1],
                    'url': info.s
                  };
                });


                _self.pages.forEach(function (e, i) {
                  return Object.assign(e, imageInfo[i]);
                });

                return _context3.abrupt('return', _self.pages);

              case 9:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function retrieve() {
        return ref.apply(this, arguments);
      }

      return retrieve;
    }()
  }, {
    key: 'fail',
    value: function () {
      var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(page) {
        var _self, p, res, parsed;

        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _self = this;
                p = _self.pages[page - 1];
                _context4.next = 4;
                return new Promise(function fetchPage(resolve, reject) {
                  _self.fetch('http://' + _self.exprefix + 'hentai.org/' + p.url + '?' + p.failnl.map(function (e) {
                    return 'nl=' + e;
                  }).join('&')).then(resolve).catch(failedOnce ? undefined : fetchPage.bind(null, resolve, reject, true));
                });

              case 4:
                res = _context4.sent;
                parsed = res.responseText.match(/<img[^>]*id="img"[^>]*src="([^"]+)"[^>]*.*onclick="return nl\('([0-9-]+)'\)/i);

                p.imgsrc = parsed[1];
                p.failnl.push(parsed[2]);
                return _context4.abrupt('return', p);

              case 9:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function fail(_x2) {
        return ref.apply(this, arguments);
      }

      return fail;
    }()
  }, {
    key: 'onPageLoad',
    value: function onPageLoad(callback) {
      this.onPageLoadCallback.push(callback);
    }
  }]);

  return ehRetriever;
}();

exports.default = ehRetriever;

},{"./cofetch":1,"./queue":3}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Queue = function () {
  function Queue(limit) {
    var timeout = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

    _classCallCheck(this, Queue);

    this.limit = limit;
    this.timeout = timeout;
    this.slot = [];
    this.q = [];
  }

  _createClass(Queue, [{
    key: 'queue',
    value: function queue(asyncFunc, name) {
      var _self = this;

      console.log('queue: job ' + name + ' queued');
      var job = new Promise(function (resolve, reject) {
        _self.q.push({
          'name': name,
          'run': asyncFunc,
          'resolver': resolve,
          'rejector': reject,
          'timeout': false,
          'timeoutid': undefined
        });
      });
      _self.dequeue();

      return job;
    }
  }, {
    key: 'dequeue',
    value: function dequeue() {
      var _self = this;

      if (_self.slot.length < _self.limit && _self.q.length >= 1) {
        (function () {
          var job = _self.q.shift();
          _self.slot.push(job);
          console.log('job ' + job.name + ' started');
          if (_self.timeout) job.timeoutid = setTimeout(_self.jobTimeout.bind(_self, job), _self.timeout);
          job.run(function (data) {
            if (job.timeout) {
              job = null;
              return;
            }

            _self.removeJob(job);
            setTimeout(_self.dequeue.bind(_self), 500 + Math.floor(Math.random() * 1000));
            if (job.timeoutid) clearTimeout(job.timeoutid);
            console.log('queue: job ' + job.name + ' resolved');
            job.resolver(data);
            job = null;
          }, function (reason) {
            if (job.timeout) {
              job = null;
              return;
            }

            _self.removeJob(job);
            setTimeout(_self.dequeue.bind(_self), 500 + Math.floor(Math.random() * 1000));
            if (job.timeoutid) clearTimeout(job.timeoutid);
            console.log('queue: job ' + job.name + ' rejected');
            job.rejector(reason);
            job = null;
          });
        })();
      }
    }
  }, {
    key: 'jobTimeout',
    value: function jobTimeout(job) {
      this.removeJob(job);
      console.log('queue: job ' + job.name + ' timeout');
      job.rejector(new Error('queue: job ' + (job.name || '') + ' timeout'));
      job = null;
    }
  }, {
    key: 'removeJob',
    value: function removeJob(job) {
      var index = this.slot.indexOf(job);
      if (index >= 0) {
        this.slot.splice(index, 1);
        return;
      }

      index = this.q.indexOf(job);
      if (index >= 0) this.q.splice(index, 1);
    }
  }]);

  return Queue;
}();

exports.default = Queue;

},{}],4:[function(require,module,exports){
(function (process,global){
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

/**
 * Copyright (c) 2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * https://raw.github.com/facebook/regenerator/master/LICENSE file. An
 * additional grant of patent rights can be found in the PATENTS file in
 * the same directory.
 */

!function (global) {
  "use strict";

  var hasOwn = Object.prototype.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  var inModule = (typeof module === "undefined" ? "undefined" : _typeof(module)) === "object";
  var runtime = global.regeneratorRuntime;
  if (runtime) {
    if (inModule) {
      // If regeneratorRuntime is defined globally and we're in a module,
      // make the exports object identical to regeneratorRuntime.
      module.exports = runtime;
    }
    // Don't bother evaluating the rest of this file if the runtime was
    // already defined globally.
    return;
  }

  // Define the runtime globally (as expected by generated code) as either
  // module.exports (if we're in a module) or a new, empty object.
  runtime = global.regeneratorRuntime = inModule ? module.exports : {};

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided, then outerFn.prototype instanceof Generator.
    var generator = Object.create((outerFn || Generator).prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
  }
  runtime.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype;
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunctionPrototype[toStringTagSymbol] = GeneratorFunction.displayName = "GeneratorFunction";

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function (method) {
      prototype[method] = function (arg) {
        return this._invoke(method, arg);
      };
    });
  }

  runtime.isGeneratorFunction = function (genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor ? ctor === GeneratorFunction ||
    // For the native GeneratorFunction constructor, the best we can
    // do is to check its .name property.
    (ctor.displayName || ctor.name) === "GeneratorFunction" : false;
  };

  runtime.mark = function (genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      if (!(toStringTagSymbol in genFun)) {
        genFun[toStringTagSymbol] = "GeneratorFunction";
      }
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `value instanceof AwaitArgument` to determine if the yielded value is
  // meant to be awaited. Some may consider the name of this method too
  // cutesy, but they are curmudgeons.
  runtime.awrap = function (arg) {
    return new AwaitArgument(arg);
  };

  function AwaitArgument(arg) {
    this.arg = arg;
  }

  function AsyncIterator(generator) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value instanceof AwaitArgument) {
          return Promise.resolve(value.arg).then(function (value) {
            invoke("next", value, resolve, reject);
          }, function (err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return Promise.resolve(value).then(function (unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration. If the Promise is rejected, however, the
          // result for this iteration will be rejected with the same
          // reason. Note that rejections of yielded Promises are not
          // thrown back into the generator function, as is the case
          // when an awaited Promise is rejected. This difference in
          // behavior between yield and await is important, because it
          // allows the consumer to decide what to do with the yielded
          // rejection (swallow it and continue, manually .throw it back
          // into the generator, abandon iteration, whatever). With
          // await, by contrast, there is no opportunity to examine the
          // rejection reason outside the generator function, so the
          // only option is to throw it from the await expression, and
          // let the generator function handle the exception.
          result.value = unwrapped;
          resolve(result);
        }, reject);
      }
    }

    if ((typeof process === "undefined" ? "undefined" : _typeof(process)) === "object" && process.domain) {
      invoke = process.domain.bind(invoke);
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new Promise(function (resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
      // If enqueue has been called before, then we want to wait until
      // all previous Promises have been resolved before calling invoke,
      // so that results are always delivered in the correct order. If
      // enqueue has not been called before, then it is important to
      // call invoke immediately, without waiting on a callback to fire,
      // so that the async generator function has the opportunity to do
      // any necessary setup in a predictable way. This predictability
      // is why the Promise constructor synchronously invokes its
      // executor callback, and why async functions synchronously
      // execute code before the first await. Since we implement simple
      // async functions in terms of async generators, it is especially
      // important to get this right, even though it requires care.
      previousPromise ? previousPromise.then(callInvokeWithMethodAndArg,
      // Avoid propagating failures to Promises returned by later
      // invocations of the iterator.
      callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  runtime.async = function (innerFn, outerFn, self, tryLocsList) {
    var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList));

    return runtime.isGeneratorFunction(outerFn) ? iter // If outerFn is a generator, return the full iterator.
    : iter.next().then(function (result) {
      return result.done ? result.value : iter.next();
    });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          if (method === "return" || method === "throw" && delegate.iterator[method] === undefined) {
            // A return or throw (when the delegate iterator has no throw
            // method) always terminates the yield* loop.
            context.delegate = null;

            // If the delegate iterator has a return method, give it a
            // chance to clean up.
            var returnMethod = delegate.iterator["return"];
            if (returnMethod) {
              var record = tryCatch(returnMethod, delegate.iterator, arg);
              if (record.type === "throw") {
                // If the return method threw an exception, let that
                // exception prevail over the original return or throw.
                method = "throw";
                arg = record.arg;
                continue;
              }
            }

            if (method === "return") {
              // Continue with the outer return, now that the delegate
              // iterator has been terminated.
              continue;
            }
          }

          var record = tryCatch(delegate.iterator[method], delegate.iterator, arg);

          if (record.type === "throw") {
            context.delegate = null;

            // Like returning generator.throw(uncaught), but without the
            // overhead of an extra function call.
            method = "throw";
            arg = record.arg;
            continue;
          }

          // Delegate generator ran and handled its own exceptions so
          // regardless of what the method was, we continue as if it is
          // "next" with an undefined arg.
          method = "next";
          arg = undefined;

          var info = record.arg;
          if (info.done) {
            context[delegate.resultName] = info.value;
            context.next = delegate.nextLoc;
          } else {
            state = GenStateSuspendedYield;
            return info;
          }

          context.delegate = null;
        }

        if (method === "next") {
          if (state === GenStateSuspendedYield) {
            context.sent = arg;
          } else {
            context.sent = undefined;
          }
        } else if (method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw arg;
          }

          if (context.dispatchException(arg)) {
            // If the dispatched exception was caught by a catch block,
            // then let that catch block handle the exception normally.
            method = "next";
            arg = undefined;
          }
        } else if (method === "return") {
          context.abrupt("return", arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done ? GenStateCompleted : GenStateSuspendedYield;

          var info = {
            value: record.arg,
            done: context.done
          };

          if (record.arg === ContinueSentinel) {
            if (context.delegate && method === "next") {
              // Deliberately forget the last sent value so that we don't
              // accidentally pass it on to the delegate.
              arg = undefined;
            }
          } else {
            return info;
          }
        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(arg) call above.
          method = "throw";
          arg = record.arg;
        }
      }
    };
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  Gp[iteratorSymbol] = function () {
    return this;
  };

  Gp[toStringTagSymbol] = "Generator";

  Gp.toString = function () {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  runtime.keys = function (object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1,
            next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  runtime.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function reset(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      this.sent = undefined;
      this.done = false;
      this.delegate = null;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" && hasOwn.call(this, name) && !isNaN(+name.slice(1))) {
            this[name] = undefined;
          }
        }
      }
    },

    stop: function stop() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function dispatchException(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;
        return !!caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }
          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }
          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }
          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function abrupt(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry && (type === "break" || type === "continue") && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.next = finallyEntry.finallyLoc;
      } else {
        this.complete(record);
      }

      return ContinueSentinel;
    },

    complete: function complete(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" || record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = record.arg;
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }
    },

    finish: function finish(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function _catch(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function delegateYield(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      return ContinueSentinel;
    }
  };
}(
// Among the various tricks for obtaining a reference to the global
// object, this seems to be the most reliable technique that does not
// use indirect eval (which violates Content Security Policy).
(typeof global === "undefined" ? "undefined" : _typeof(global)) === "object" ? global : (typeof window === "undefined" ? "undefined" : _typeof(window)) === "object" ? window : (typeof self === "undefined" ? "undefined" : _typeof(self)) === "object" ? self : undefined);

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"_process":5}],5:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],6:[function(require,module,exports){
'use strict';

require('../lib/regenerator-runtime');

var _ehRetriever = require('../lib/ehRetriever');

var _ehRetriever2 = _interopRequireDefault(_ehRetriever);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

var ehr = new _ehRetriever2.default(location.href, document.body.innerHTML);
console.log(ehr);

var div = document.createElement('div');
div.appendChild(document.createElement('button'));
div.childNodes[0].textContent = 'retrieve';

div.childNodes[0].addEventListener('click', function (e) {
  e.target.setAttribute('disabled', '');

  ehr.retrieve().then(function (data) {
    console.log(data);

    data.forEach(function (e) {
      var imgNode = document.createElement('a');

      imgNode.setAttribute('href', e.imgsrc);
      imgNode.innerHTML = '<img src="' + e.imgsrc + '" style="' + e.style + '" />';
      document.querySelector('#i3').appendChild(imgNode);

      imgNode.childNodes[0].dataset.page = e.page;
      imgNode.childNodes[0].dataset.locked = 'false';

      var failReload = function () {
        var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(e) {
          var imginfo;
          return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  e.stopPropagation();
                  e.preventDefault();

                  if (!(e.target.dataset.locked === 'true')) {
                    _context.next = 4;
                    break;
                  }

                  return _context.abrupt('return');

                case 4:
                  e.target.dataset.locked = 'true';
                  _context.next = 7;
                  return ehr.fail(parseInt(e.target.dataset.page, 10));

                case 7:
                  imginfo = _context.sent;

                  e.target.src = imginfo.imgsrc;
                  e.target.dataset.locked = 'false';

                case 10:
                case 'end':
                  return _context.stop();
              }
            }
          }, _callee, undefined);
        }));

        return function failReload(_x) {
          return ref.apply(this, arguments);
        };
      }();

      imgNode.childNodes[0].addEventListener('error', failReload);
      imgNode.childNodes[0].addEventListener('click', failReload);
    });

    document.querySelector('#i3 a').style.display = 'none';

    div.childNodes[0].textContent = 'done!';
  });
});

document.querySelector('#i2').appendChild(div);

ehr.onPageLoad(function (page, total) {
  div.childNodes[0].textContent = page + '/' + total;
});

},{"../lib/ehRetriever":2,"../lib/regenerator-runtime":4}]},{},[6]);
