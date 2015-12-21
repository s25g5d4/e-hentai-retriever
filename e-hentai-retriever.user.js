// ==UserScript==
// @name        e-hentai retriever
// @namespace   http://e-hentai.org
// @description e-hentai & exhentai image url retriever
// @include     http://exhentai.org/s/*
// @include     http://g.e-hentai.org/s/*
// @version     2.2.0
// @grant       GM_xmlhttpRequest
// @grant       unsafeWindow
// ==/UserScript==

/**
 * @title e-hentai retriever
 * @file Main script of e-hentai retriever.
 * @version 2.2.0
 * @author s25g5d4
 * @copyright Z.J. Wu, s25g5d4 2015
 * @license
 * This script is licensed under under MIT License:
 * http://opensource.org/licenses/MIT
 */

/**
 * E-hentai retriever main object.
 * @namespace
 * @property {object} current - Current retrieving status.
 * @property {number} current.index - Last retrieved image index.
 * @property {number} current.total - total number of images in gallery.
 * @property {string} current.next - Next page URL.
 * @property {number} current.current - Last retrieved URL.
 * @property {object} config - Settings.
 * @property {number} config.getInterval - Retrieving interval, in millisecond.
 */
var ehRetriever = {
      'current': {
        'index':   undefined,
        'total':   undefined,
        'next':    undefined,
        'current': undefined
      },
      config: {
        'getInterval': 1000
      }
    };
/**
 * Simple jquery-like universal selector using native <code>document.querySelectorAll</code> method.
 * @param {string} selector - Element selector.
 */
var $ = function $(selector) {
      return [].slice.call(document.querySelectorAll(selector), 0);
    };

/** Init, create elements and add event listeners. */
ehRetriever.init = function init() {
  var buttons;

  if ($('#i1')[0]) {
    buttons = document.createElement('div');

    buttons.setAttribute('id', 'ehd_btn');
    buttons.insertAdjacentHTML('beforeend', '<input id="ehr_elbtn" type="button" value="Enlarge">');
    buttons.insertAdjacentHTML('beforeend', '<input id="ehr_dlbtn" type="button" value="Generate img Link">');
    buttons.insertAdjacentHTML('beforeend', '<input id="ehr_scbtn" type="button" value="Unlimited Scroll!">');
    buttons.insertAdjacentHTML('beforeend', '<input id="ehr_stopbtn" type="button" value="Stop At" disabled="disabled">');
    buttons.insertAdjacentHTML('beforeend', '<div id="ehr_status" style="display: none;">please wait, now:<span id="ehr_now"></span></div>');
    buttons.insertAdjacentHTML('beforeend', '<div id="ehr_output" style="display: none; text-align: left;"></div>');

    $('#i1')[0].insertBefore(buttons, $('#i2')[0]);

    $("#ehr_dlbtn")[0].addEventListener('click', ehRetriever.retrieve);
    $("#ehr_scbtn")[0].addEventListener('click', ehRetriever.retrieve);
    $("#ehr_elbtn")[0].addEventListener('click', ehRetriever.enlarge);
    $("#ehr_stopbtn")[0].addEventListener('click', ehRetriever.stopAt);
  }
};

/**
 * Callback after {@link ehRetriever.getNextPage} successfully done.
 * @callback getNextPageCallback
 * @param {Error} err - error message. If success, return null.
 * @param {string} html - Fetched html.
 * @param {string} url - Fetched target URL.
 */
/**
 * Retrieve next page.
 * @param {string} [url] - Fetch target. If omitted, use {@link ehRetriever.current.next} instead.
 * @param {getNextPageCallback} callback - Callback after request done.
 */
ehRetriever.getNextPage = function getNextPage(url, callback) {
  var c = ehRetriever.current;

  if (!callback) {
    callback = url;
    url = c.next;
  }

  if (!url) {
    setTimeout(function () {
      callback(new Error('URL not defined.'));
    }, 1);
    return;
  }
  
  GM_xmlhttpRequest({
    'method':  'GET',
    'url':     url.toString(),
    'headers': {
      'User-Agent': navigator.userAgent,
      'Referer':    c.current,
      'Cookie':     document.cookie
    },
    'onload':  function (xhr) {
      callback(null, xhr.responseText, xhr.finalUrl);
    },
    'onerror': function (e) {
      callback(e);
    }
  });
};

/**
 * Parsed result returns from {@link ehRetriever.parse}.
 * @typedef {object} parsedResult
 * @property {number} index - Index of parsed image in gallery.
 * @property {number} total - Total images in gallery.
 * @property {string} filename - Image file name.
 * @property {string} next - Next page url.
 * @property {string} imgsrc - Image url.
 * @property {string} style - CSS style of the image in original page.
 * @property {string} failnl - E-hentai fail load number, used to indicate failed host of the image.
 */
/**
 * Parse html.
 * @param {string} html - HTML string to parse.
 * @return {parsedResult} Parsed result.
 */
ehRetriever.parse = function parse(html) {
  var regex = /<span>(\d+)<\/span> \/ <span>(\d+)<\/span>.*<div>([^ ]*) ::.*<a[^>]*href="([^"]*)"><img[^>]*src="([^"]*)"[^>]*style="([^"]*)".*onclick="return nl\('([0-9-]+)'\)/;
  var parsed = html.match(regex);

  if (parsed) {
    return {
      'index':    parseInt(parsed[1], 10),
      'total':    parseInt(parsed[2], 10),
      'filename': parsed[3],
      'next':     parsed[4],
      'imgsrc':   parsed[5],
      'style':    parsed[6],
      'failnl':   parsed[7]
    };
  }
  return null;
};

/**
 * Disable, enable some buttons, and display the information element.
 * <ul>
 *  <li>Disable <code>input#ehr_dlbtn</code></li>
 *  <li>Disable <code>input#ehr_scbtn</code></li>
 *  <li>Enable <code>input#ehr_stopbtn</code></li>
 *  <li>Display <code>div#ehr_output</code></li>
 *  <li>Display <code>div#ehr_status</code></li>
 * </ul>
 */
ehRetriever.updateInfo = function updateInfo() {
  $("#ehr_dlbtn")[0].setAttribute('disabled', 'disabled');
  $("#ehr_scbtn")[0].setAttribute('disabled', 'disabled');
  $("#ehr_stopbtn")[0].removeAttribute('disabled');
  $('#ehr_output')[0].style.display = 'block';
  $('#ehr_status')[0].style.display = 'block';
};

/**
 * Double the width of image frame. Allows showing 2 images horizontally.
 * <code>click</code> event handler of <code>input#ehr_elbtn</code>.
 * @param {Event} event - Event object.
 */
ehRetriever.enlarge = function enlarge(event) {
  if (event.target.value.match('Enlarge')) {
    try { unsafeWindow.onresize = null; } catch (e) { console.log(e); };

    $('#i1')[0].style.maxWidth = $('#i1')[0].style.maxWidth.toString().replace(/\D/g, '') * 2 + 'px';
    $('#i1')[0].style.width = $('#i1')[0].style.width.toString().replace(/\D/g, '') * 2 + 'px';
    event.target.setAttribute('value', 'Diminish');
  }
  else {
    try {
      unsafeWindow.onresize = unsafeWindow.update_window_extents;
      unsafeWindow.update_window_extents();
    } catch (e) { console.log(e); };

    event.target.setAttribute('value', 'Enlarge');
  }
};

/**
 * Stop at specified index.
 * <code>click</code> event handler of <code>input#ehr_stopbtn</code>.
 * @param {Event} event - Event object.
 */
ehRetriever.stopAt = function stopAt(event) {
  event.target.setAttribute('disabled', 'disabled');
  var stopAt = parseInt(prompt('Stop at page:', ehRetriever.current.total), 10);
  if (isNaN(stopAt)) {
    alert('Not a number!');
    event.target.removeAttribute('disabled');
  }
  else {
    ehRetriever.current.stopAt = stopAt;
  }
};

/**
 * Write retrieved urls to page.
 * @param {string} html - Retrieved HTML string.
 */
ehRetriever.writeURL = function writeURL(html) {
  var parsed = ehRetriever.parse(html);

  if (parsed) {
    $('#ehr_output')[0].insertAdjacentHTML('beforeend', `<a href="${parsed.imgsrc}" title="${parsed.filename}" target="_blank" style="display: inline-block;">${parsed.filename}</a>&nbsp;`);
    $('#ehr_now')[0].innerHTML = `${parsed.index}/${parsed.total}`;
  }

  return parsed;
};

/**
 * Write retrieved images to page.
 * @param {string} html - Retrieved HTML string.
 * @param {string} url - Retrieved page URL.
 */
ehRetriever.writeImg = function writeImg(html, url) {
  var parsed = ehRetriever.parse(html);
  var imgNode = document.createElement('a');

  if (parsed) {
    imgNode.setAttribute('href', parsed.imgsrc);
    imgNode.innerHTML = `<img src="${parsed.imgsrc}" style="${parsed.style}" />`;
    imgNode.addEventListener('click', ehRetriever.failload);
    imgNode.childNodes[0].addEventListener('error', ehRetriever.failload);
    $('#i3')[0].appendChild(imgNode);

    imgNode.dataset.failnl = parsed.failnl;
    imgNode.dataset.current = url;
    imgNode.dataset.locked = 'false';

    $('#ehr_now')[0].innerHTML = `${parsed.index}/${parsed.total}`;
  }

  return parsed;
};

/**
 * Start retrieving images in gallery.
 * <code>click</code> event handler of <code>input#ehr_scbtn</code> and <code>input#ehr_dlbtn</code>.
 * @param {Event} event - Event object.
 */
ehRetriever.retrieve = function retrieve(event) {
  var writeToPage;
  var parsed;

  ehRetriever.updateInfo();

  if (event.currentTarget.getAttribute('id') === 'ehr_dlbtn') writeToPage = ehRetriever.writeURL;
  else if (event.currentTarget.getAttribute('id') === 'ehr_scbtn') writeToPage = ehRetriever.writeImg;

  if (writeToPage) {
    parsed = writeToPage(document.body.innerHTML);
    if (!parsed) return false;

    ehRetriever.current.index   = parsed.index;
    ehRetriever.current.next    = parsed.next;
    ehRetriever.current.total   = parsed.total;
    ehRetriever.current.current = document.location.href;

    ehRetriever.getNextPage(function callback(err, html, url) {
      var c;
      var parsed;

      if (err) {
        console.log(err);
        return err;
      }

      c = ehRetriever.current;
      parsed = writeToPage(html, url);
      if (!parsed) return false;

      c.index   = parsed.index;
      c.next    = parsed.next;
      c.current = url;

      if (c.index < c.total && (!c.stopAt || c.index < c.stopAt)) {
        setTimeout(ehRetriever.getNextPage.bind(this, callback), ehRetriever.config.getInterval);
      }
      else {
        $('#ehr_status')[0].innerHTML = 'Done!';
      };
    });
  }
};

/**
 * When loading image from H@H host fails, this function can try loading the same image from another host.
 * <code>click</code> event handler of <code>div#i3 a</code>, <code>error</code> event handler of <code>div#i3 a img</code>.
 * @see {@link ehRetriever.writeImg}
 * @param {Event} event - Event object.
 */
ehRetriever.failload = function failload(event) {
  var imgNode = event.target.parentNode;   // to handle 'error' event from img element, do not use event.currentTarget.
  var failnl = imgNode.dataset.failnl;
  var url = imgNode.dataset.current + (imgNode.dataset.current.indexOf('?') > -1 ? '&' : '?') + 'nl=' + failnl;

  event.preventDefault();
  event.stopPropagation();

  if (imgNode.dataset.locked === 'true') return;

  imgNode.dataset.locked = 'true';

  ehRetriever.getNextPage(url, function (err, html, url) {
    var parsed;

    if (err) {
      console.log(err);
      imgNode.dataset.locked = 'false';
      return;
    }

    parsed = ehRetriever.parse(html);
    if (!parsed) return;

    imgNode.innerHTML = `<img src="${parsed.imgsrc}" style="${parsed.style}" />`;
    imgNode.setAttribute('href', parsed.imgsrc);

    imgNode.dataset.failnl = parsed.failnl;
    imgNode.dataset.current = url;
    imgNode.dataset.locked = 'false';
  });
};

ehRetriever.init();