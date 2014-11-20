// ==UserScript==
// @name        exhentai downloader
// @namespace   http://exhentai.org
// @description exhentai downloader
// @include     http://exhentai.org/s/*
// @include     http://g.e-hentai.org/s/*
// @version     2
// @grant       GM_xmlhttpRequest
// ==/UserScript==

/*This script is licensed under GNU General Public License v3
 *http://www.gnu.org/licenses/gpl.html
 */
(function (document) {
  var e_hen_download = {
        //"loadjQuery": document.createElement("script"),
        current: {},
        output: [],
        //btn: {},
        settings: {
          getNextPageInterval: 5000
        }
      },
      $ = function $(selector) {
        return [].slice.call(document.querySelectorAll(selector), 0);
      };

  (function init(document) {
    var buttons_wrapper;

    if (document.getElementsByTagName("h1")[0]) {
      buttons_wrapper = document.createElement('div');

      buttons_wrapper.setAttribute('id', 'ehd_btn');
      buttons_wrapper.innerHTML = '<input id="ehd_dlbtn" type="button" value="Generate img Link"><input id="ehd_scbtn" type="button" value="Unlimited Scroll!"><div id="ehd_output" style="display: none;"><div id="ehd_status">please wait, now:<span id="ehd_now"></span></div></div>';

      $('#i2')[0].appendChild(buttons_wrapper);

      $("#ehd_dlbtn")[0].addEventListener('click', DLbtnHandler);
      $("#ehd_scbtn")[0].addEventListener('click', SCbtnHandler);

    }
    else {
      setTimeout(init, 500);
    }
  }(document));

  function DLbtnHandler() {
    $('#ehd_btn input').forEach(function (e) { e.setAttribute('disabled', 'disabled') });
    $('#ehd_output')[0].style.display = 'block';

    GetHtml(DLout);
  };

  function DLout(html) {
      var c = e_hen_download.current,
          s = e_hen_download.settings,

      parseResult = parse(html);

      $('#ehd_output')[0].innerHTML += '<a href="' + parseResult.src + '" title="' + parseResult.filename + '">' + parseResult.filename + '</a>&nbsp;';

      $('#ehd_now')[0].innerHTML = c.current + '/' + c.total;

      if (c.current >= c.total) $('#ehd_status')[0].innerHTML = 'Done!';
      else setTimeout(function () {
        GetHtml(DLout);
      }, s.getNextPageInterval);
  }

  function SCbtnHandler() {
    $('#ehd_btn input').forEach(function (e) { e.setAttribute('disabled', 'disabled') });
    $('#ehd_output')[0].style.display = 'block';
    $('#i3 a')[0].style.display =  'none';

    GetHtml(SCout);
  };

  function SCout(html, url) {
    var c = e_hen_download.current,
        s = e_hen_download.settings,
        img_node = document.createElement('a');

    parseResult = parse(html, url);

    img_node.setAttribute('href', 'javascript:;');
    img_node.innerHTML = '<img src="' + parseResult.src + '" style="' + parseResult.style + '" />';
    img_node.addEventListener('click', function (event) {
        FailLoad(event, parseResult.failnl, parseResult.currentUrl);
    });

    $('#i3')[0].appendChild(img_node);

    $('#ehd_now')[0].innerHTML = c.current + '/' + c.total;

    if(c.current >= c.total) $('#ehd_status')[0].innerHTML = 'Done!';
    else setTimeout(function () {
        GetHtml(SCout);
    }, s.getNextPageInterval);
  }

  function GetHtml(callback, current) {
    var c = current || e_hen_download.current;

    if(c.next) {
      GM_xmlhttpRequest({
        'method': 'GET',
        'url': c.next,

        'headers': {
          //'User-Agent': navigator.userAgent,
          'Referer': c.currentUrl,
          'Cookie': document.cookie
        },

        'onload': function (xhr) {
          callback(xhr.responseText, xhr.finalUrl);
        },

        'onerror': function (e) {
          console.log(e);
        }
      });
    }
    else callback(document.body.innerHTML, document.location + '');
  }

  function FailLoad(event, nl, url) {
    var e = event.target.parentNode,
        c = {
          'next': (url.indexOf('?') > -1 ? '&' : '?') + 'nl=' + nl,
          'currentUrl': document.location + '',
        };

    GetHtml(function (html) {
      var regex = /<a[^>]*href="([^"]*)"><img[^>]*id="img"[^>]*src="([^"]*)"[^>]*style="([^"]*)".*onclick="return nl\((\d+)\)/,
          parsed = html.match(regex),
          result;

      if(parsed) {
        result = {
          'filename': parsed[0],
          'src': parsed[1],
          'style': parsed[2],
          'failnl': parsed[3],
          'currentUrl': url
        };

        event.target.innerHTML = '<img src="' + result.src + '" style="' + result.style + '" />';
        event.target.addEventListener('click', function (event) {
          FailLoad(event, result.failnl, result.currentUrl);
        });
      }
    }, c);
  }

  function parse(html, currentUrl) {
    var c = e_hen_download.current,
        regex = /<span>(\d+)<\/span> \/ <span>(\d+)<\/span>.*<div>([^ ]*) ::.*<a[^>]*href="([^"]*)"><img[^>]*src="([^"]*)"[^>]*style="([^"]*)".*onclick="return nl\((\d+)\)/,
        parsed = html.match(regex),
        result;

    if (parsed) {
      c.current = parseInt(parsed[1], 10);
      c.total = parseInt(parsed[2], 10);
      c.next = parsed[4];
      c.currentUrl = currentUrl;

      result = {
        'filename': parsed[3],
        'src': parsed[5],
        'style': parsed[6],
        'failnl': parsed[7],
        'currentUrl': currentUrl
      };
    }

    return result;
  }

}(document));