// ==UserScript==
// @name        e-hentai retriever
// @namespace   http://e-hentai.org
// @description e-hentai & exhentai image url retriever
// @include     /^https?:\/\/e-hentai.org\/s\/.*/
// @include     /^https?:\/\/exhentai.org\/s\/.*/
// @version     4.0.0
// @grant       GM_xmlhttpRequest
// @grant       unsafeWindow
// ==/UserScript==

/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 4);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const queue_1 = __webpack_require__(3);
const cofetch_1 = __webpack_require__(2);
const EventEmitter = __webpack_require__(1);
class EhRetriever extends EventEmitter {
    constructor(url, html) {
        super();
        const testEXHentaiUrl = /^https?:\/\/(?:e-|ex)hentai\.org\//;
        if (typeof url !== 'string') {
            throw new TypeError('invalid `url`, expected a string');
        }
        if (!testEXHentaiUrl.test(url)) {
            throw new TypeError(`invalid url: ${url}`);
        }
        this.url = url;
        this.html = html;
        this.gallery = { gid: '', token: '' };
        this.referer = url;
        this.showkey = '';
        this.ehentaiHost = testEXHentaiUrl.exec(url)[0].slice(0, -1);
        this.q = new queue_1.default(3, 3000, 1000);
        this.pages = this.init();
        this.pages.then(() => this.emit('ready'));
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.html) {
                this.html = yield this.fetch(this.url).then(res => res.text());
            }
            const galleryURL = this.html.match(/hentai\.org\/g\/(\d+)\/([a-z0-9]+)/i);
            const showkey = this.html.match(/showkey="([^"]+)"/i);
            if (galleryURL) {
                this.gallery.gid = galleryURL[1];
                this.gallery.token = galleryURL[2];
            }
            else {
                throw new Error("Can't get gallery URL");
            }
            if (showkey) {
                this.showkey = showkey[1];
            }
            else {
                throw new Error("Can't get showkey");
            }
            return yield this.getAllPageURL();
        });
    }
    getAllPageURL() {
        return __awaiter(this, void 0, void 0, function* () {
            const { ehentaiHost, gallery: { gid, token } } = this;
            const firstPage = yield this.fetch(`${ehentaiHost}/g/${gid}/${token}`).then(res => res.text());
            let pageNum;
            const pageLinksTable = firstPage.match(/<table[^>]*class="ptt"[^>]*>((?:[^<]*)(?:<(?!\/table>)[^<]*)*)<\/table>/);
            if (pageLinksTable) {
                const pageLinks = pageLinksTable[1].match(/g\/[^/]+\/[^/]+\/\?p=\d+/g);
                if (pageLinks) {
                    pageNum = Math.max.apply(null, pageLinks.map(e => parseInt(/\d+$/.exec(e)[0], 10)));
                }
                else {
                    pageNum = 0;
                }
            }
            else {
                throw new Error('Cant get page numbers');
            }
            const allPages = yield Promise.all(Array(pageNum).fill(undefined).map((e, i) => {
                return this.fetch(`${ehentaiHost}/g/${gid}/${token}/?p=${i + 1}`).then(res => res.text());
            }));
            allPages.unshift(firstPage);
            return allPages
                .map(e => e.match(/<div[^>]*class="gdt\w"[^>]*>(?:(?:[^<]*)(?:<(?!\/div>)[^<]*)*)<\/div>/g))
                .reduce((p, c) => p.concat(c)) // 2d array to 1d
                .map(e => {
                const [, imgkey, page] = e.match(/s\/(\w+)\/\d+-(\d+)/);
                return { imgkey, page: parseInt(page, 10) };
            });
        });
    }
    fetch(url, options = {}) {
        if (typeof url !== 'string') {
            return Promise.reject(new TypeError('invalid `url`, expected a string'));
        }
        if (url.search(/^https?:\/\//) < 0) {
            return Promise.reject(new TypeError(`invalid url: ${url}`));
        }
        const cofetchOptions = {
            method: 'GET',
            credentials: 'include',
            headers: {
                'User-Agent': navigator.userAgent,
                Referer: this.referer
            }
        };
        for (const key of Object.keys(options)) {
            if (key === 'headers') {
                Object.assign(cofetchOptions.headers, options.headers);
            }
            else {
                cofetchOptions[key] = options[key];
            }
        }
        return this.q.queue((resolve, reject) => {
            cofetch_1.default(url, cofetchOptions).then(resolve).catch(reject);
        }, `Fetch ${url} ${JSON.stringify(cofetchOptions)}`);
    }
    retrieve(start = 0, stop = -1) {
        return __awaiter(this, void 0, void 0, function* () {
            const pages = yield this.pages;
            if (start < 0 || start >= pages.length || isNaN(start)) {
                throw new RangeError(`invalid start number: ${start}`);
            }
            if (stop < 0) {
                stop = pages.length - 1;
            }
            else if (stop < start || stop >= pages.length || isNaN(stop)) {
                throw new RangeError(`invalid stop number: ${stop}, start: ${start}`);
            }
            const retrievePages = pages.slice(start, stop + 1);
            const loadPage = (e) => __awaiter(this, void 0, void 0, function* () {
                if (e.imgsrc && e.filename) {
                    return Promise.resolve(e);
                }
                const fetchPage = yield this.fetch(`${this.ehentaiHost}/api.php`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    // assign e = {'imgkey': ..., 'page': ...} to object literal {'method': ..., 'gid': ..., 'showkey': ...}
                    // does not modify e
                    body: JSON.stringify(Object.assign({
                        method: 'showpage',
                        gid: this.gallery.gid,
                        showkey: this.showkey
                    }, e))
                }).then(res => res.json());
                this.emit('load', {
                    current: e.page - start,
                    total: stop - start + 1
                });
                return fetchPage;
            });
            const imagePages = yield Promise.all(retrievePages.map(loadPage));
            imagePages.forEach((e, i) => {
                retrievePages[i].filename = e.i.match(/>([^:]+):/)[1].trim();
                retrievePages[i].imgsrc = e.i3.match(/src="([^"]+)"/)[1];
                retrievePages[i].failnl = new Set([e.i6.match(/nl\('([^']+)'/)[1]]);
                retrievePages[i].style = e.i3.match(/style="([^"]+)"/)[1];
                retrievePages[i].url = e.s;
            });
            return retrievePages;
        });
    }
    fail(index) {
        return __awaiter(this, void 0, void 0, function* () {
            const { ehentaiHost } = this;
            const pages = yield this.pages;
            const failPage = pages[index - 1];
            const failnl = [...failPage.failnl.values()].map(e => `nl=${e}`).join('&');
            const res = yield this.fetch(`${this.ehentaiHost}/${failPage.url}?${failnl}`).then(res => res.text());
            const parsed = res.match(/<img[^>]*id="img"[^>]*src="([^"]+)"[^>]*.*onclick="return nl\('([0-9-]+)'\)/i);
            if (parsed) {
                failPage.imgsrc = parsed[1];
                failPage.failnl.add(parsed[2]);
                return failPage;
            }
            return null;
        });
    }
}
exports.EhRetriever = EhRetriever;
exports.default = EhRetriever;


/***/ }),
/* 1 */
/***/ (function(module, exports) {

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        // At least give some kind of context to the user
        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
        err.context = er;
        throw err;
      }
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function(type) {
  if (this._events) {
    var evlistener = this._events[type];

    if (isFunction(evlistener))
      return 1;
    else if (evlistener)
      return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
  return emitter.listenerCount(type);
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// Origin from window.fetch polyfill
// https://github.com/github/fetch
// License https://github.com/github/fetch/blob/master/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
const COFetch = (input, init = {}) => {
    let request;
    if (Request.prototype.isPrototypeOf(input) && !init) {
        request = input;
    }
    else {
        request = new Request(input, init);
    }
    const headers = Object.assign({}, request.headers);
    if (request.credentials === 'include') {
        headers['Cookie'] = document.cookie;
    }
    const onload = (resolve, reject, gmxhr) => {
        const init = {
            url: gmxhr.finalUrl || request.url,
            status: gmxhr.status,
            statusText: gmxhr.statusText,
            headers: undefined
        };
        try {
            const rawHeaders = gmxhr.responseHeaders.trim().replace(/\r\n(\s+)/g, '$1').split('\r\n').map(e => e.split(/:/));
            const header = new Headers();
            rawHeaders.forEach(e => {
                header.append(e[0].trim(), e[1].trim());
            });
            init.headers = header;
            const res = new Response(gmxhr.response, init);
            resolve(res);
        }
        catch (e) {
            reject(e);
        }
    };
    const onerror = (resolve, reject, gmxhr) => {
        reject(new TypeError('Network request failed'));
    };
    return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
            method: request.method,
            url: request.url,
            headers: headers,
            responseType: 'blob',
            data: init.body,
            onload: onload.bind(null, resolve, reject),
            onerror: onerror.bind(null, resolve, reject)
        });
    });
};
exports.default = COFetch;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
;
class Queue {
    constructor(limit, timeout = 0, delay = 0) {
        this.limit = limit;
        this.timeout = timeout;
        this.delay = delay;
        this.slot = [];
        this.q = [];
    }
    queue(executor, name) {
        const job = new Promise((resolve, reject) => {
            this.q.push({
                name,
                run: executor,
                resolve,
                reject,
                isTimeout: false,
                timeoutId: undefined
            });
        });
        console.log(`queue: job ${name} queued`);
        this.dequeue();
        return job;
    }
    dequeue() {
        const { q, slot, limit, timeout, delay } = this;
        if (slot.length < limit && q.length >= 1) {
            const job = q.shift();
            slot.push(job);
            console.log(`queue: job ${job.name} started`);
            if (timeout) {
                job.timeoutId = window.setTimeout(() => this.jobTimeout(job), timeout);
            }
            const onFulfilled = (data) => {
                if (job.isTimeout) {
                    return;
                }
                this.removeJob(job);
                window.setTimeout(() => this.dequeue(), delay); // force dequeue() run after current dequeue()
                if (job.timeoutId) {
                    window.clearTimeout(job.timeoutId);
                }
                console.log(`queue: job ${job.name} resolved`);
                job.resolve(data);
            };
            const onRejected = (reason) => {
                if (job.isTimeout) {
                    return;
                }
                this.removeJob(job);
                setTimeout(() => this.dequeue(), delay);
                if (job.timeoutId) {
                    window.clearTimeout(job.timeoutId);
                }
                console.log(`queue: job ${job.name} rejected`);
                job.reject(reason);
            };
            job.run(onFulfilled, onRejected);
        }
    }
    jobTimeout(job) {
        this.removeJob(job);
        console.log(`queue: job ${job.name} timeout`);
        job.reject(new Error(`queue: job ${job.name} timeout`));
        job = null;
    }
    removeJob(job) {
        let index = this.slot.indexOf(job);
        if (index >= 0) {
            this.slot.splice(index, 1);
            return;
        }
        index = this.q.indexOf(job);
        if (index >= 0) {
            this.q.splice(index, 1);
        }
    }
}
exports.default = Queue;


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const ehretriever_1 = __webpack_require__(0);
const LoadTimeout = 10000;
const AutoReload = true;
// helper functions
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));
const buttonsFragment = document.createDocumentFragment();
const buttonDoubleFrame = document.createElement('button');
const buttonRetrieve = document.createElement('button');
const buttonRange = document.createElement('button');
buttonsFragment.appendChild(buttonDoubleFrame);
buttonsFragment.appendChild(buttonRetrieve);
buttonsFragment.appendChild(buttonRange);
buttonDoubleFrame.textContent = 'Double Frame';
buttonRetrieve.textContent = 'Retrieve!';
buttonRange.textContent = 'Set Range';
$('#i1').insertBefore(buttonsFragment, $('#i2'));
let ehentaiResize;
let maxImageWidth;
let originalWidth;
buttonDoubleFrame.addEventListener('click', event => {
    if (!ehentaiResize) {
        try {
            ehentaiResize = unsafeWindow.onresize;
        }
        catch (e) {
            console.log(e);
        }
    }
    if (!maxImageWidth) {
        maxImageWidth = Math.max.apply(null, $$('#i3 a img').map(e => parseInt(e.style.width, 10)));
    }
    if (!originalWidth) {
        originalWidth = parseInt($('#i1').style.width, 10);
    }
    if (buttonDoubleFrame.textContent === 'Double Frame') {
        buttonDoubleFrame.textContent = 'Reset Frame';
        try {
            unsafeWindow.onresize = null;
        }
        catch (e) {
            console.log(e);
        }
        ;
        $('#i1').style.maxWidth = (maxImageWidth * 2 + 20) + 'px';
        $('#i1').style.width = (maxImageWidth * 2 + 20) + 'px';
    }
    else {
        buttonDoubleFrame.textContent = 'Double Frame';
        try {
            unsafeWindow.onresize = ehentaiResize;
            ehentaiResize();
        }
        catch (e) {
            console.log(e);
            $('#i1').style.maxWidth = originalWidth + 'px';
            $('#i1').style.width = originalWidth + 'px';
        }
    }
});
let ehr;
buttonRetrieve.addEventListener('click', event => {
    buttonRetrieve.setAttribute('disabled', '');
    buttonRange.setAttribute('disabled', '');
    buttonRetrieve.textContent = 'Initializing...';
    if (!ehr) {
        ehr = new ehretriever_1.EhRetriever(location.href, document.body.innerHTML);
        console.log(ehr);
    }
    ehr.on('load', (progress) => {
        buttonRetrieve.textContent = `${progress.current}/${progress.total}`;
    });
    let retrieve;
    if ($('#ehrstart')) {
        const start = parseInt($('#ehrstart').value, 10);
        const stop = parseInt($('#ehrstop').value, 10);
        const pageNumMax = parseInt($('div.sn').textContent.match(/\/\s*(\d+)/)[1], 10);
        if (stop < start || start <= 0 || start > pageNumMax || stop > pageNumMax) {
            window.alert(`invalid range: ${start} - ${stop}, accepted range: 1 - ${pageNumMax}`);
            buttonRetrieve.textContent = 'Retrieve!';
            buttonRetrieve.removeAttribute('disabled');
            return;
        }
        retrieve = ehr.retrieve(start - 1, stop - 1);
        $('#ehrsetrange').parentNode.removeChild($('#ehrsetrange'));
    }
    else {
        retrieve = ehr.retrieve();
        buttonRange.parentNode.removeChild(buttonRange);
    }
    retrieve.then(pages => {
        $('#i3 a').style.display = 'none';
        const reload = (event) => {
            event.stopPropagation();
            event.preventDefault();
            const target = event.target;
            if (target.dataset.locked === 'true') {
                return;
            }
            target.dataset.locked = 'true';
            ehr.fail(parseInt(target.dataset.page, 10)).then(imgInfo => {
                target.src = imgInfo.imgsrc;
                target.parentNode.href = imgInfo.imgsrc;
                target.dataset.locked = 'false';
            });
        };
        pages.forEach(e => {
            const pageNode = document.createElement('a');
            pageNode.setAttribute('href', e.imgsrc);
            pageNode.innerHTML = `<img src="${e.imgsrc}" style="${e.style}" />`;
            $('#i3').appendChild(pageNode);
            const imgNode = pageNode.childNodes[0];
            imgNode.dataset.page = e.page.toString();
            imgNode.dataset.locked = 'false';
            imgNode.addEventListener('error', reload);
            imgNode.addEventListener('click', reload);
            let timeout;
            if (AutoReload) {
                timeout = window.setTimeout(() => {
                    console.log(`timeout: page ${e.page}`);
                    const clickEvent = new MouseEvent('click');
                    imgNode.dispatchEvent(clickEvent);
                }, LoadTimeout);
            }
            imgNode.addEventListener('load', function onload() {
                pageNode.removeEventListener('load', onload);
                if (AutoReload) {
                    clearTimeout(timeout);
                }
            });
        });
        buttonRetrieve.textContent = 'Done!';
        buttonDoubleFrame.removeAttribute('disabled');
    }).catch(e => { console.log(e); });
});
buttonRange.addEventListener('click', event => {
    // override e-hentai's viewing shortcut
    document.onkeydown = undefined;
    const pageNum = $('div.sn').textContent.match(/(\d+)\s*\/\s*(\d+)/).slice(1);
    buttonRange.insertAdjacentHTML('afterend', `<span id="ehrsetrange"><input type="number" id="ehrstart" value="${pageNum[0]}" min="1" max="${pageNum[1]}"> - <input type="number" id="ehrstop" value="${pageNum[1]}" min="1" max="${pageNum[1]}"></span>`);
    buttonRange.parentNode.removeChild(buttonRange);
});


/***/ })
/******/ ]);