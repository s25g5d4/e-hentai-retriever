import { EhRetriever, IPage } from '../lib/ehretriever';

declare const unsafeWindow: any;

const LoadTimeout = 10000;
const AutoReload = true;

// helper functions
const $ = (selector: string) => document.querySelector(selector) as HTMLElement;
const $$ = (selector: string) => Array.from(document.querySelectorAll(selector)) as HTMLElement[];

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
    };

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

let ehr: EhRetriever;

buttonRetrieve.addEventListener('click', event => {
  buttonRetrieve.setAttribute('disabled', '');
  buttonRange.setAttribute('disabled', '');
  buttonRetrieve.textContent = 'Initializing...';

  if (!ehr) {
    ehr = new EhRetriever(location.href, document.body.innerHTML);
    console.log(ehr);
  }

  ehr.on('load', (progress: {current: number, total: number}) => {
    buttonRetrieve.textContent = `${progress.current}/${progress.total}`;
  });

  let retrieve: Promise<IPage[]>;

  if ($('#ehrstart')) {
    const start = parseInt(($('#ehrstart') as HTMLInputElement).value, 10);
    const stop = parseInt(($('#ehrstop') as HTMLInputElement).value, 10);
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

    const reload = (event: MouseEvent): void => {
      event.stopPropagation();
      event.preventDefault();

      const target = event.target as HTMLImageElement;

      if (target.dataset.locked === 'true') {
        return;
      }

      target.dataset.locked = 'true';

      ehr.fail( parseInt(target.dataset.page, 10) ).then(imgInfo => {
        target.src = imgInfo.imgsrc;
        (target.parentNode as HTMLAnchorElement).href = imgInfo.imgsrc;
        target.dataset.locked = 'false';
      });
    };

    pages.forEach(e => {
      const pageNode = document.createElement('a');

      pageNode.setAttribute('href', e.imgsrc);
      pageNode.innerHTML = `<img src="${e.imgsrc}" style="${e.style}" />`;
      $('#i3').appendChild(pageNode);

      const imgNode = pageNode.childNodes[0] as HTMLImageElement;
      imgNode.dataset.page = e.page.toString();
      imgNode.dataset.locked = 'false';

      imgNode.addEventListener('error', reload);
      imgNode.addEventListener('click', reload);

      let timeout: number;
      if (AutoReload) {
        timeout = window.setTimeout( () => {
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
