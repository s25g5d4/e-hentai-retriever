import Queue from './queue';
import COFetch from './cofetch';

class ehRetriever {
  constructor(url, html) {
    if (!url) throw new Error('`url` undefined');

    this.url = url;
    this.html = html;
    this.gallery = {
      'gid':   undefined,
      'token': undefined
    }
    this.referer = url;
    this.showkey = undefined;
    this.exprefix = url.match('exhentai.org') ? 'ex' : 'g.e-';
    this.pages = [];
    this.q = new Queue(3, 3000);
    this.onPageLoadCallback = [];

    this.promiseInit = this.init().catch((reason) => { console.log(reason); });
  }

  async init() {
      let galleryURL;
      let showkey;

      if (!this.html) {
        let res = await this.fetch(this.url);
        this.html = res.responseText;
      }

      galleryURL = this.html.match(/hentai\.org\/g\/(\d+)\/([a-z0-9]+)/i);
      showkey = this.html.match(/showkey="([^"]+)"/i);

      if (galleryURL) {
        Object.assign(this.gallery, {
          'gid':   parseInt(galleryURL[1], 10),
          'token': galleryURL[2]
        });
      }
      else throw new Error("Can't get gallery URL!");

      if (showkey) this.showkey = showkey[1];
      else throw new Error("Can't get showkey!");

      await this.getAllPageURL();
  }

  async getAllPageURL() {
    let _self = this;
    let firstPage = await this.fetch(`http://${this.exprefix}hentai.org/g/${this.gallery.gid}/${this.gallery.token}`);

    let pageNumMax;
    let pageNum = firstPage.responseText
      .match(/<table[^>]*class="ptt"[^>]*>((?:[^<]*)(?:<(?!\/table>)[^<]*)*)<\/table>/)[1]
      .match(/g\/[^/]+\/[^/]+\/\?p=\d+/g);

    pageNumMax = (pageNum ? Math.max.apply(null, pageNum.map( (e) => parseInt(e.match(/\d+$/), 10)) ) : 0);

    let allPages = await Promise.all(Array(pageNumMax).fill().map( (e, i) => {
      return this.fetch(`http://${this.exprefix}hentai.org/g/${this.gallery.gid}/${this.gallery.token}/?p=${i + 1}`);
    }));
    allPages.unshift(firstPage);

    this.pages = allPages
      .map( (e) => e.responseText.match(/<div[^>]*class="gdtm"[^>]*>(?:(?:[^<]*)(?:<(?!\/div>)[^<]*)*)<\/div>/g))
      .reduce( (p, c) => p.concat(c) )
      .map( (e) => {
        let tokens = e.match(/s\/[a-z0-9]+\/\d+-\d+/)[0].split('/');
        return {
          'imgkey': tokens[1],
          'page': parseInt(tokens[2].split('-')[1], 10)
        };
      });

    return;
  }

  fetch(url, options = {}) {
    if (typeof url !== 'string') return Promise.reject(new Error(`invalid url: ${url}`));

    let defaultOptions = {
      'method':  'GET',
      'headers': {
        'User-Agent': navigator.userAgent,
        'Referer':    this.referer,
        'Cookie':     document.cookie
      }
    };
    if (options.headers) {
      Object.assign(defaultOptions.headers, options.headers);
      delete options.headers;
    }
    options = Object.assign(defaultOptions, options);
    console.log('fetch', url, options);

    return this.q.queue( (resolve, reject) => {
      COFetch(url, options).then(resolve).catch(reject);
    }, `fetch ${url}`);
  }

  async retrieve() {
    await this.promiseInit;

    let _self = this;
    let imagePages = await Promise.all(this.pages.map( (e) => {
      return new Promise(function fetchPage(resolve, reject, failedOnce) {
        _self.fetch(`http://${_self.exprefix}hentai.org/api.php`, {
          'method':  'POST',
          'headers': { 'Content-Type': 'application/json' },
          'data': JSON.stringify(Object.assign({
            'method': 'showpage',
            'gid': _self.gallery.gid,
            'showkey': _self.showkey
          }, e))
        }).then( (data) => {
          _self.onPageLoadCallback.forEach( (callback) => { callback(e.page, _self.pages.length); });
          resolve(data);
        }).catch(failedOnce ? undefined : fetchPage.bind(null, resolve, reject, true));
      });
    }));

    let imageInfo = imagePages.map( (e) => {
      let info = JSON.parse(e.responseText);
      return {
        'filename': info.i.match(/>([^:]+):/)[1].trim(),
        'imgsrc':   info.i3.match(/src="([^"]+)"/)[1],
        'failnl':   [ info.i6.match(/nl\('([^']+)'/)[1] ],
        'style':    info.i3.match(/style="([^"]+)"/)[1],
        'url':      info.s
      };
    });

    this.pages.forEach( (e, i) => Object.assign(e, imageInfo[i]));

    return this.pages;
  }

  async fail(page) {
    let p = this.pages[page - 1];

    let _self = this;
    let res = await new Promise(function fetchPage(resolve, reject, onceFailed) {
      _self.fetch(`http://${_self.exprefix}hentai.org/${p.url}?${p.failnl.map( (e) => 'nl=' + e).join('&')}`)
        .then(resolve)
        .catch(onceFailed ? reject : fetchPage.bind(null, resolve, reject, true));
    });

    let parsed = res.responseText.match(/<img[^>]*id="img"[^>]*src="([^"]+)"[^>]*.*onclick="return nl\('([0-9-]+)'\)/i);

    p.imgsrc = parsed[1];
    p.failnl.push(parsed[2]);

    return p;
  }

  onPageLoad(callback) {
    this.onPageLoadCallback.push(callback);
  }
}

export default ehRetriever;
