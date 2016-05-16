// ==UserScript==
// @name        e-hen-test
// @namespace   117414516
// @include     http://g.e-hentai.org/s/*
// @include     http://exhentai.org/s/*
// @version     1
// @grant       GM_xmlhttpRequest
// ==/UserScript==
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";Object.defineProperty(exports,"__esModule",{value:!0});var COFetch=function(e){var t=arguments.length<=1||void 0===arguments[1]?{}:arguments[1];return new Promise(function(r,o){GM_xmlhttpRequest(Object.assign({url:e,onload:r,onerror:o},t))})};exports["default"]=COFetch;

},{}],2:[function(require,module,exports){
"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{"default":e}}function _asyncToGenerator(e){return function(){var t=e.apply(this,arguments);return new Promise(function(e,r){function n(a,i){try{var o=t[a](i),s=o.value}catch(u){return void r(u)}return o.done?void e(s):Promise.resolve(s).then(function(e){return n("next",e)},function(e){return n("throw",e)})}return n("next")})}}function _classCallCheck(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(exports,"__esModule",{value:!0});var _createClass=function(){function e(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}return function(t,r,n){return r&&e(t.prototype,r),n&&e(t,n),t}}(),_queue=require("./queue"),_queue2=_interopRequireDefault(_queue),_cofetch=require("./cofetch"),_cofetch2=_interopRequireDefault(_cofetch),ehRetriever=function(){function e(t,r){if(_classCallCheck(this,e),!t)throw new Error("`url` undefined");this.url=t,this.html=r,this.gallery={gid:void 0,token:void 0},this.referer=t,this.showkey=void 0,this.exprefix=t.match("exhentai.org")?"ex":"g.e-",this.pages=[],this.q=new _queue2["default"](3,3e3),this.onPageLoadCallback=[],this.promiseInit=this.init()["catch"](function(e){console.log(e)})}return _createClass(e,[{key:"init",value:function(){function e(){return t.apply(this,arguments)}var t=_asyncToGenerator(regeneratorRuntime.mark(function r(){var e,t,n;return regeneratorRuntime.wrap(function(r){for(;;)switch(r.prev=r.next){case 0:if(e=void 0,t=void 0,this.html){r.next=7;break}return r.next=5,this.fetch(this.url);case 5:n=r.sent,this.html=n.responseText;case 7:if(e=this.html.match(/hentai\.org\/g\/(\d+)\/([a-z0-9]+)/i),t=this.html.match(/showkey="([^"]+)"/i),!e){r.next=13;break}Object.assign(this.gallery,{gid:parseInt(e[1],10),token:e[2]}),r.next=14;break;case 13:throw new Error("Can't get gallery URL!");case 14:if(!t){r.next=18;break}this.showkey=t[1],r.next=19;break;case 18:throw new Error("Can't get showkey!");case 19:return r.next=21,this.getAllPageURL();case 21:case"end":return r.stop()}},r,this)}));return e}()},{key:"getAllPageURL",value:function(){function e(){return t.apply(this,arguments)}var t=_asyncToGenerator(regeneratorRuntime.mark(function r(){var e,t,n,a,i,o=this;return regeneratorRuntime.wrap(function(r){for(;;)switch(r.prev=r.next){case 0:return e=this,r.next=3,this.fetch("http://"+this.exprefix+"hentai.org/g/"+this.gallery.gid+"/"+this.gallery.token);case 3:return t=r.sent,n=void 0,a=t.responseText.match(/<table[^>]*class="ptt"[^>]*>((?:[^<]*)(?:<(?!\/table>)[^<]*)*)<\/table>/)[1].match(/g\/[^\/]+\/[^\/]+\/\?p=\d+/g),n=a?Math.max.apply(null,a.map(function(e){return parseInt(e.match(/\d+$/),10)})):0,r.next=9,Promise.all(Array(n).fill().map(function(e,t){return o.fetch("http://"+o.exprefix+"hentai.org/g/"+o.gallery.gid+"/"+o.gallery.token+"/?p="+(t+1))}));case 9:return i=r.sent,i.shift(t),this.pages=i.map(function(e){return e=e.responseText.match(/<div[^>]*id="gdt"[^>]*>((?:[^<]*)(?:<(?!\/div>)[^<]*)*)<\/div>/)[0],e.match(/s\/[a-z0-9]+\/\d+-\d+/g)}).reduce(function(e,t){return e.concat(t)}).map(function(e){var t=e.split("/");return{imgkey:t[1],page:parseInt(t[2].split("-")[1],10)}}),r.abrupt("return");case 13:case"end":return r.stop()}},r,this)}));return e}()},{key:"fetch",value:function(e){var t=arguments.length<=1||void 0===arguments[1]?{}:arguments[1];if("string"!=typeof e)return Promise.reject(new Error("invalid url: "+e));var r=this,n={method:"GET",headers:{"User-Agent":navigator.userAgent,Referer:r.referer,Cookie:document.cookie}};return t.headers&&(Object.assign(n.headers,t.headers),delete t.headers),t=Object.assign(n,t),console.log("fetch",e,t),r.q.queue(function(r,n){(0,_cofetch2["default"])(e,t).then(r)["catch"](n)},"fetch "+e)}},{key:"retrieve",value:function(){function e(){return t.apply(this,arguments)}var t=_asyncToGenerator(regeneratorRuntime.mark(function r(){var e,t,n;return regeneratorRuntime.wrap(function(r){for(;;)switch(r.prev=r.next){case 0:return e=this,r.next=3,e.promiseInit;case 3:return r.next=5,Promise.all(e.pages.map(function(t){return new Promise(function r(n,a,i){e.fetch("http://"+e.exprefix+"hentai.org/api.php",{method:"POST",headers:{"Content-Type":"application/json"},data:JSON.stringify(Object.assign({method:"showpage",gid:e.gallery.gid,showkey:e.showkey},t))}).then(function(r){e.onPageLoadCallback.forEach(function(r){r(t.page,e.pages.length)}),n(r)})["catch"](i?void 0:r.bind(null,n,a,!0))})}));case 5:return t=r.sent,n=t.map(function(e){var t=JSON.parse(e.responseText);return{filename:t.i.match(/>([^:]+):/)[1].trim(),imgsrc:t.i3.match(/src="([^"]+)"/)[1],failnl:[t.i6.match(/nl\('([^']+)'/)[1]],style:t.i3.match(/style="([^"]+)"/)[1],url:t.s}}),e.pages.forEach(function(e,t){return Object.assign(e,n[t])}),r.abrupt("return",e.pages);case 9:case"end":return r.stop()}},r,this)}));return e}()},{key:"fail",value:function(){function e(e){return t.apply(this,arguments)}var t=_asyncToGenerator(regeneratorRuntime.mark(function r(e){var t,n,a,i;return regeneratorRuntime.wrap(function(r){for(;;)switch(r.prev=r.next){case 0:return t=this,n=t.pages[e-1],r.next=4,new Promise(function o(e,r){t.fetch("http://"+t.exprefix+"hentai.org/"+n.url+"?"+n.failnl.map(function(e){return"nl="+e}).join("&")).then(e)["catch"](failedOnce?void 0:o.bind(null,e,r,!0))});case 4:return a=r.sent,i=a.responseText.match(/<img[^>]*id="img"[^>]*src="([^"]+)"[^>]*.*onclick="return nl\('([0-9-]+)'\)/i),n.imgsrc=i[1],n.failnl.push(i[2]),r.abrupt("return",n);case 9:case"end":return r.stop()}},r,this)}));return e}()},{key:"onPageLoad",value:function(e){this.onPageLoadCallback.push(e)}}]),e}();exports["default"]=ehRetriever;

},{"./cofetch":1,"./queue":3}],3:[function(require,module,exports){
"use strict";function _classCallCheck(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(exports,"__esModule",{value:!0});var _createClass=function(){function e(e,t){for(var o=0;o<t.length;o++){var u=t[o];u.enumerable=u.enumerable||!1,u.configurable=!0,"value"in u&&(u.writable=!0),Object.defineProperty(e,u.key,u)}}return function(t,o,u){return o&&e(t.prototype,o),u&&e(t,u),t}}(),Queue=function(){function e(t){var o=arguments.length<=1||void 0===arguments[1]?0:arguments[1];_classCallCheck(this,e),this.limit=t,this.timeout=o,this.slot=[],this.q=[]}return _createClass(e,[{key:"queue",value:function(e,t){var o=this;console.log("queue: job "+t+" queued");var u=new Promise(function(u,i){o.q.push({name:t,run:e,resolver:u,rejector:i,timeout:!1,timeoutid:void 0})});return o.dequeue(),u}},{key:"dequeue",value:function(){var e=this;e.slot.length<e.limit&&e.q.length>=1&&!function(){var t=e.q.shift();e.slot.push(t),console.log("job "+t.name+" started"),e.timeout&&(t.timeoutid=setTimeout(e.jobTimeout.bind(e,t),e.timeout)),t.run(function(o){return t.timeout?void(t=null):(e.removeJob(t),setTimeout(e.dequeue.bind(e),500+Math.floor(1e3*Math.random())),t.timeoutid&&clearTimeout(t.timeoutid),console.log("queue: job "+t.name+" resolved"),t.resolver(o),void(t=null))},function(o){return t.timeout?void(t=null):(e.removeJob(t),setTimeout(e.dequeue.bind(e),500+Math.floor(1e3*Math.random())),t.timeoutid&&clearTimeout(t.timeoutid),console.log("queue: job "+t.name+" rejected"),t.rejector(o),void(t=null))})}()}},{key:"jobTimeout",value:function(e){this.removeJob(e),console.log("queue: job "+e.name+" timeout"),e.rejector(new Error("queue: job "+(e.name||"")+" timeout")),e=null}},{key:"removeJob",value:function(e){var t=this.slot.indexOf(e);return t>=0?void this.slot.splice(t,1):(t=this.q.indexOf(e),void(t>=0&&this.q.splice(t,1)))}}]),e}();exports["default"]=Queue;

},{}],4:[function(require,module,exports){
(function (process,global){
"use strict";var _typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol?"symbol":typeof t};!function(t){function e(t,e,r,o){var i=Object.create((e||n).prototype),a=new h(o||[]);return i._invoke=f(t,r,a),i}function r(t,e,r){try{return{type:"normal",arg:t.call(e,r)}}catch(n){return{type:"throw",arg:n}}}function n(){}function o(){}function i(){}function a(t){["next","throw","return"].forEach(function(e){t[e]=function(t){return this._invoke(e,t)}})}function c(t){this.arg=t}function u(t){function e(n,o,i,a){var u=r(t[n],t,o);if("throw"!==u.type){var f=u.arg,l=f.value;return l instanceof c?Promise.resolve(l.arg).then(function(t){e("next",t,i,a)},function(t){e("throw",t,i,a)}):Promise.resolve(l).then(function(t){f.value=t,i(f)},a)}a(u.arg)}function n(t,r){function n(){return new Promise(function(n,o){e(t,r,n,o)})}return o=o?o.then(n,n):n()}"object"===("undefined"==typeof process?"undefined":_typeof(process))&&process.domain&&(e=process.domain.bind(e));var o;this._invoke=n}function f(t,e,n){var o=x;return function(i,a){if(o===_)throw new Error("Generator is already running");if(o===j){if("throw"===i)throw a;return y()}for(;;){var c=n.delegate;if(c){if("return"===i||"throw"===i&&c.iterator[i]===d){n.delegate=null;var u=c.iterator["return"];if(u){var f=r(u,c.iterator,a);if("throw"===f.type){i="throw",a=f.arg;continue}}if("return"===i)continue}var f=r(c.iterator[i],c.iterator,a);if("throw"===f.type){n.delegate=null,i="throw",a=f.arg;continue}i="next",a=d;var l=f.arg;if(!l.done)return o=E,l;n[c.resultName]=l.value,n.next=c.nextLoc,n.delegate=null}if("next"===i)o===E?n.sent=a:n.sent=d;else if("throw"===i){if(o===x)throw o=j,a;n.dispatchException(a)&&(i="next",a=d)}else"return"===i&&n.abrupt("return",a);o=_;var f=r(t,e,n);if("normal"===f.type){o=n.done?j:E;var l={value:f.arg,done:n.done};if(f.arg!==S)return l;n.delegate&&"next"===i&&(a=d)}else"throw"===f.type&&(o=j,i="throw",a=f.arg)}}}function l(t){var e={tryLoc:t[0]};1 in t&&(e.catchLoc=t[1]),2 in t&&(e.finallyLoc=t[2],e.afterLoc=t[3]),this.tryEntries.push(e)}function s(t){var e=t.completion||{};e.type="normal",delete e.arg,t.completion=e}function h(t){this.tryEntries=[{tryLoc:"root"}],t.forEach(l,this),this.reset(!0)}function p(t){if(t){var e=t[m];if(e)return e.call(t);if("function"==typeof t.next)return t;if(!isNaN(t.length)){var r=-1,n=function o(){for(;++r<t.length;)if(v.call(t,r))return o.value=t[r],o.done=!1,o;return o.value=d,o.done=!0,o};return n.next=n}}return{next:y}}function y(){return{value:d,done:!0}}var d,v=Object.prototype.hasOwnProperty,g="function"==typeof Symbol?Symbol:{},m=g.iterator||"@@iterator",w=g.toStringTag||"@@toStringTag",b="object"===("undefined"==typeof module?"undefined":_typeof(module)),L=t.regeneratorRuntime;if(L)return void(b&&(module.exports=L));L=t.regeneratorRuntime=b?module.exports:{},L.wrap=e;var x="suspendedStart",E="suspendedYield",_="executing",j="completed",S={},k=i.prototype=n.prototype;o.prototype=k.constructor=i,i.constructor=o,i[w]=o.displayName="GeneratorFunction",L.isGeneratorFunction=function(t){var e="function"==typeof t&&t.constructor;return e?e===o||"GeneratorFunction"===(e.displayName||e.name):!1},L.mark=function(t){return Object.setPrototypeOf?Object.setPrototypeOf(t,i):(t.__proto__=i,w in t||(t[w]="GeneratorFunction")),t.prototype=Object.create(k),t},L.awrap=function(t){return new c(t)},a(u.prototype),L.async=function(t,r,n,o){var i=new u(e(t,r,n,o));return L.isGeneratorFunction(r)?i:i.next().then(function(t){return t.done?t.value:i.next()})},a(k),k[m]=function(){return this},k[w]="Generator",k.toString=function(){return"[object Generator]"},L.keys=function(t){var e=[];for(var r in t)e.push(r);return e.reverse(),function n(){for(;e.length;){var r=e.pop();if(r in t)return n.value=r,n.done=!1,n}return n.done=!0,n}},L.values=p,h.prototype={constructor:h,reset:function(t){if(this.prev=0,this.next=0,this.sent=d,this.done=!1,this.delegate=null,this.tryEntries.forEach(s),!t)for(var e in this)"t"===e.charAt(0)&&v.call(this,e)&&!isNaN(+e.slice(1))&&(this[e]=d)},stop:function(){this.done=!0;var t=this.tryEntries[0],e=t.completion;if("throw"===e.type)throw e.arg;return this.rval},dispatchException:function(t){function e(e,n){return i.type="throw",i.arg=t,r.next=e,!!n}if(this.done)throw t;for(var r=this,n=this.tryEntries.length-1;n>=0;--n){var o=this.tryEntries[n],i=o.completion;if("root"===o.tryLoc)return e("end");if(o.tryLoc<=this.prev){var a=v.call(o,"catchLoc"),c=v.call(o,"finallyLoc");if(a&&c){if(this.prev<o.catchLoc)return e(o.catchLoc,!0);if(this.prev<o.finallyLoc)return e(o.finallyLoc)}else if(a){if(this.prev<o.catchLoc)return e(o.catchLoc,!0)}else{if(!c)throw new Error("try statement without catch or finally");if(this.prev<o.finallyLoc)return e(o.finallyLoc)}}}},abrupt:function(t,e){for(var r=this.tryEntries.length-1;r>=0;--r){var n=this.tryEntries[r];if(n.tryLoc<=this.prev&&v.call(n,"finallyLoc")&&this.prev<n.finallyLoc){var o=n;break}}o&&("break"===t||"continue"===t)&&o.tryLoc<=e&&e<=o.finallyLoc&&(o=null);var i=o?o.completion:{};return i.type=t,i.arg=e,o?this.next=o.finallyLoc:this.complete(i),S},complete:function(t,e){if("throw"===t.type)throw t.arg;"break"===t.type||"continue"===t.type?this.next=t.arg:"return"===t.type?(this.rval=t.arg,this.next="end"):"normal"===t.type&&e&&(this.next=e)},finish:function(t){for(var e=this.tryEntries.length-1;e>=0;--e){var r=this.tryEntries[e];if(r.finallyLoc===t)return this.complete(r.completion,r.afterLoc),s(r),S}},"catch":function(t){for(var e=this.tryEntries.length-1;e>=0;--e){var r=this.tryEntries[e];if(r.tryLoc===t){var n=r.completion;if("throw"===n.type){var o=n.arg;s(r)}return o}}throw new Error("illegal catch attempt")},delegateYield:function(t,e,r){return this.delegate={iterator:p(t),resultName:e,nextLoc:r},S}}}("object"===("undefined"==typeof global?"undefined":_typeof(global))?global:"object"===("undefined"==typeof window?"undefined":_typeof(window))?window:"object"===("undefined"==typeof self?"undefined":_typeof(self))?self:void 0);

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
"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{"default":e}}function _asyncToGenerator(e){return function(){var t=e.apply(this,arguments);return new Promise(function(e,r){function n(i,o){try{var a=t[i](o),d=a.value}catch(c){return void r(c)}return a.done?void e(d):Promise.resolve(d).then(function(e){return n("next",e)},function(e){return n("throw",e)})}return n("next")})}}require("../lib/regenerator-runtime");var _ehRetriever=require("../lib/ehRetriever"),_ehRetriever2=_interopRequireDefault(_ehRetriever),ehr=new _ehRetriever2["default"](location.href,document.body.innerHTML);console.log(ehr);var div=document.createElement("div");div.appendChild(document.createElement("button")),div.childNodes[0].textContent="retrieve",div.childNodes[0].addEventListener("click",function(e){e.target.setAttribute("disabled",""),ehr.retrieve().then(function(e){console.log(e),e.forEach(function(e){var t=document.createElement("a");t.setAttribute("href",e.imgsrc),t.innerHTML='<img src="'+e.imgsrc+'" style="'+e.style+'" />',document.querySelector("#i3").appendChild(t),t.childNodes[0].dataset.page=e.page,t.childNodes[0].dataset.locked="false";var r=function(){var e=_asyncToGenerator(regeneratorRuntime.mark(function t(e){var r;return regeneratorRuntime.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:if(e.stopPropagation(),e.preventDefault(),"true"!==e.target.dataset.locked){t.next=4;break}return t.abrupt("return");case 4:return e.target.dataset.locked="true",t.next=7,ehr.fail(parseInt(e.target.dataset.page,10));case 7:r=t.sent,e.target.src=r.imgsrc,e.target.dataset.locked="false";case 10:case"end":return t.stop()}},t,void 0)}));return function(t){return e.apply(this,arguments)}}();t.childNodes[0].addEventListener("error",r),t.childNodes[0].addEventListener("click",r)}),document.querySelector("#i3 a").style.display="none",div.childNodes[0].textContent="done!"})}),document.querySelector("#i2").appendChild(div),ehr.onPageLoad(function(e,t){div.childNodes[0].textContent=e+"/"+t});

},{"../lib/ehRetriever":2,"../lib/regenerator-runtime":4}]},{},[6]);
