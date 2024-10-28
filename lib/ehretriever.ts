import Queue from './queue';
import COFetch from './cofetch';
import { EventEmitter } from 'events';

interface IGallery {
  gid: string;
  token: string;
}

export interface IPage {
  filename?: string;
  imgsrc?: string;
  failnl?: Set<string>;
  style?: string;
  url?: string;
  imgkey?: string;
  page?: number;
}

interface IHeaders {
  [key: string]: string;
}

export class EhRetriever extends EventEmitter {
  url: string;
  html: string;
  gallery: IGallery;
  referer: string;
  showkey: string;
  ehentaiHost: string;
  q: Queue<Response>;
  pages: Promise<IPage[]>;

  constructor(url: string, html: string) {
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
    this.q = new Queue(3, 3000, 1000);
    this.pages = this.init();
    this.pages.then(() => this.emit('ready'));
  }

  private async init(): Promise<IPage[]> {
      if (!this.html) {
        this.html = await this.fetch(this.url).then(res => res.text());
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

      return await this.getAllPageURL();
  }

  private async getAllPageURL(): Promise<IPage[]> {
    const { ehentaiHost, gallery: { gid, token } } = this;

    const firstPage = await this.fetch(`${ehentaiHost}/g/${gid}/${token}`).then(res => res.text());

    let pageNum: number;
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

    const allPages: string[] = await Promise.all(
      Array(pageNum).fill(undefined).map( (e, i) => {
        return this.fetch(`${ehentaiHost}/g/${gid}/${token}/?p=${i + 1}`).then(res => res.text());
      })
    );
    allPages.unshift(firstPage);

    return allPages
      .map(p =>this.parsePage(p))
      .reduce( (p, c) => p.concat(c), []) // 2d array to 1d
  }

  private parsePage(page: string): IPage[] {
    const gdtMatcher = /<div[^>]*id="gdt"[^>]*>/g;
    gdtMatcher.exec(page);
    const gtbMatcher = /<div[^>]*class="gtb"[^>]*>/g;
    gtbMatcher.lastIndex = gdtMatcher.lastIndex;
    gtbMatcher.exec(page);
    const gdtContent = page.substring(gdtMatcher.lastIndex, gtbMatcher.lastIndex);
    return Array.from(gdtContent.matchAll(/s\/(\w+)\/\d+-(\d+)/g)).map(([ , imgkey, page ]) => ({ imgkey, page: parseInt(page, 10) }))
  }

  private fetch(url: string, options: RequestInit = {}): Promise<Response> {
    if (typeof url !== 'string') {
      return Promise.reject(new TypeError('invalid `url`, expected a string'));
    }
    if (url.search(/^https?:\/\//) < 0) {
      return Promise.reject(new TypeError(`invalid url: ${url}`));
    }

    const cofetchOptions: RequestInit = {
      method:  'GET',
      credentials: 'include',
      headers: {
        'User-Agent': navigator.userAgent,
        Referer:      this.referer
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

    return this.q.queue( (resolve, reject) => {
      COFetch(url, cofetchOptions).then(resolve).catch(reject);
    }, `Fetch ${url} ${JSON.stringify(cofetchOptions)}`);
  }

  async retrieve(start = 0, stop = -1): Promise<IPage[]> {
    const pages: IPage[] = await this.pages;

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

    const loadPage = async (e: IPage): Promise<any> => {
      if (e.imgsrc && e.filename) {
        return Promise.resolve(e);
      }

      const fetchPage = await this.fetch(`${this.ehentaiHost}/api.php`, {
        method:  'POST',
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
    };

    const imagePages = await Promise.all( retrievePages.map(loadPage) );

    imagePages.forEach((e, i) => {
      retrievePages[i].filename = (e.i as string).match(/>([^:]+):/)[1].trim();
      retrievePages[i].imgsrc   = (e.i3 as string).match(/src="([^"]+)"/)[1];
      retrievePages[i].failnl   = new Set<string>([ (e.i6 as string).match(/nl\('([^']+)'/)[1] ]);
      retrievePages[i].style    = (e.i3 as string).match(/style="([^"]+)"/)[1];
      retrievePages[i].url      = (e.s as string);
    });
    return retrievePages;
  }

  async fail(index: number): Promise<IPage> {
    const { ehentaiHost } = this;
    const pages = await this.pages;
    const failPage = pages[index - 1];

    const failnl = [ ...failPage.failnl.values() ].map(e => `nl=${e}`).join('&');
    const res = await this.fetch(`${this.ehentaiHost}/${failPage.url}?${failnl}`).then(res => res.text());

    const parsed = res.match(/<img[^>]*id="img"[^>]*src="([^"]+)"[^>]*.*onclick="return nl\('([^']+)'\)/i);

    if (parsed) {
      failPage.imgsrc = parsed[1];
      failPage.failnl.add(parsed[2]);

      return failPage;
    }

    return null;
  }
}

export default EhRetriever;
