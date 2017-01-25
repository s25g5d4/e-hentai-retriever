import Queue from './queue';
import COFetch from './cofetch';

class ehRetriever {
  constructor(url, html) {
    if (typeof url !== 'string') throw new TypeError('invalid `url`, expected a string');
    if (url.search(/^https?:\/\//) < 0) throw new TypeError(`invalid url: ${url}`);

    this.url = url;
    this.html = html;
    this.gallery = {
      'gid':   undefined,
      'token': undefined
    }
    this.referer = url;
    this.showkey = undefined;
    this.exprefix = url.search(/exhentai/) >= 0 ? 'ex' : 'e-';
    this.pages = [];
    this.q = new Queue(3, { 'timeout': 3000, 'delay': 1000 });
    this.onPageLoadCallback = [];

    this.promiseInit = this.init();
  }

  async init() {
      if (!this.html) this.html = await this.fetch(this.url).then(res => res.text());

      const galleryURL = this.html.match(/hentai\.org\/g\/(\d+)\/([a-z0-9]+)/i);
      const showkey = this.html.match(/showkey="([^"]+)"/i);

      if (galleryURL) {
        this.gallery.gid = galleryURL[1];
        this.gallery.token = galleryURL[2];
      }
      else {
        throw new Error("Can't get gallery URL");
      }

      if (showkey) this.showkey = showkey[1];
      else throw new Error("Can't get showkey");

      this.pages = await this.getAllPageURL();
  }

  async getAllPageURL() {
    const firstPage = await this.fetch(`http://${this.exprefix}hentai.org/g/${this.gallery.gid}/${this.gallery.token}`).then(res => res.text());

    let pageNum = firstPage.match(/<table[^>]*class="ptt"[^>]*>((?:[^<]*)(?:<(?!\/table>)[^<]*)*)<\/table>/);
    if (pageNum) pageNum = pageNum[1].match(/g\/[^/]+\/[^/]+\/\?p=\d+/g);
    else throw new Error('Cant get page numbers');

    // A gallery containing only one page won't have page number in gallery link.
    // So, if pageNum is null, the gallery has only one page.
    if (pageNum) {
      pageNum = pageNum.map(e => parseInt(e.match(/(\d+)$/)[1], 10));
    }
    const pageNumMax = (pageNum ? Math.max.apply(null, pageNum) : 0);

    const allPages = await Promise.all(
      Array(pageNumMax).fill().map( (e, i) => {
        return this.fetch(`http://${this.exprefix}hentai.org/g/${this.gallery.gid}/${this.gallery.token}/?p=${i + 1}`).then(res => res.text());
      })
    );
    allPages.unshift(firstPage);

    return allPages
      .map(e => e.match(/<div[^>]*class="gdt[lm]"[^>]*>(?:(?:[^<]*)(?:<(?!\/div>)[^<]*)*)<\/div>/g))
      .reduce( (p, c) => p.concat(c) )
      .map(e => {
        let tokens = e.match(/s\/[a-z0-9]+\/\d+-\d+/)[0].split('/');
        return {
          'imgkey': tokens[1],
          'page': parseInt(tokens[2].split('-')[1], 10)
        };
      });
  }

  fetch(url, options = {}) {
    if (typeof url !== 'string') return Promise.reject(new TypeError('invalid `url`, expected a string'));
    if (url.search(/^https?:\/\//) < 0) return Promise.reject(new TypeError(`invalid url: ${url}`));

    const defaultOptions = {
      'method':  'GET',
      'credentials': 'include',
      'headers': {
        'User-Agent': navigator.userAgent,
        'Referer':    this.referer
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

  async retrieve(start = 0, stop = -1) {
    await this.promiseInit;

    if (start < 0 || start >= this.pages.length || isNaN(start)) throw new RangeError(`invalid start number: ${start}`);

    if (stop < 0) stop = this.pages.length - 1;
    else if (stop < start || stop >= this.pages.length || isNaN(stop)) throw new RangeError(`invalid stop number: ${stop}, start: ${start}`);

    const retrievePages = this.pages.slice(start, stop + 1);

    const loadPage = e => {
      if (e.imgsrc && img.filename) return Promise.resolve(e);

      const fetchPage = this.fetch(`http://${this.exprefix}hentai.org/api.php`, {
        'method':  'POST',
        'headers': { 'Content-Type': 'application/json' },
        // assign e = {'imgkey': ..., 'page': ...} to object literal {'method': ..., 'gid': ..., 'showkey': ...}
        // does not modify e
        'data': JSON.stringify(Object.assign({
          'method': 'showpage',
          'gid': this.gallery.gid,
          'showkey': this.showkey
        }, e))
      }).then(res => res.json());

      return fetchPage.then(data => {
        // insert callback invocations
        this.onPageLoadCallback.forEach(callback => { callback(e.page - start, stop - start + 1); });
        return Promise.resolve(data);
      });
    };

    const imagePages = await Promise.all( retrievePages.map(e => loadPage(e)) );

    const imageInfo = imagePages.map(e => {
      return {
        'filename': e.i.match(/>([^:]+):/)[1].trim(),
        'imgsrc':   e.i3.match(/src="([^"]+)"/)[1],
        'failnl':   [ e.i6.match(/nl\('([^']+)'/)[1] ],
        'style':    e.i3.match(/style="([^"]+)"/)[1],
        'url':      e.s
      };
    });

    retrievePages.forEach( (e, i) => Object.assign(e, imageInfo[i]));

    return retrievePages;
  }

  async fail(index) {
    const page = this.pages[index - 1];

    const failnl = page.failnl.map( (e) => 'nl=' + e).join('&');
    const res = await this.fetch(`http://${this.exprefix}hentai.org/${page.url}?${failnl}`).then(res => res.text());

    const parsed = res.match(/<img[^>]*id="img"[^>]*src="([^"]+)"[^>]*.*onclick="return nl\('([0-9-]+)'\)/i);

    if (parsed) {
      page.imgsrc = parsed[1];
      page.failnl.push(parsed[2]);

      return page;
    }

    return null;
  }

  onPageLoad(callback) {
    this.onPageLoadCallback.push(callback);
  }
}

export default ehRetriever;
