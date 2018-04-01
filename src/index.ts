import './style.css';
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
const buttonFullHeight = document.createElement('button');
buttonsFragment.appendChild(buttonDoubleFrame);
buttonsFragment.appendChild(buttonFullHeight);
buttonsFragment.appendChild(buttonRetrieve);
buttonsFragment.appendChild(buttonRange);
buttonDoubleFrame.textContent = 'Double Frame';
buttonRetrieve.textContent = 'Retrieve!';
buttonRange.textContent = 'Set Range';
buttonFullHeight.textContent = 'View Height';

$('#i1').insertBefore(buttonsFragment, $('#i2'));

let ehentaiResize;
let originalWidth: number;
let ehr: EhRetriever;
let showHiddenImageLink: boolean = false;

const reload = (event: Event): void => {
  event.stopPropagation();
  event.preventDefault();

  const target = event.target as HTMLImageElement;
  if (target.dataset.locked === 'true') {
    return;
  }

  target.dataset.locked = 'true';

  ehr.fail( parseInt(target.dataset.page, 10) ).then(imgInfo => {
    target.src = imgInfo.imgsrc;
    (target.parentElement as HTMLAnchorElement).href = imgInfo.imgsrc;
    target.dataset.locked = 'false';
  });
};

const showImage = (event: Event): void => {
  event.stopPropagation();
  event.preventDefault();

  $$('#i3 a').forEach(e => {
    e.classList.remove('hidden');
  });
  (event.target as HTMLElement).remove();
  showHiddenImageLink = false;
};

const hideImage = (event: Event): void => {
  event.stopPropagation();
  event.preventDefault();

  ((event.target as HTMLElement).parentElement as HTMLElement).classList.add('hidden');
  if (!showHiddenImageLink) {
    const showHiddenImage = document.createElement('a');
    showHiddenImage.href = '';
    showHiddenImage.textContent = 'show hidden image';
    showHiddenImage.classList.add('show-hidden');
    showHiddenImage.addEventListener('click', showImage);
    buttonRetrieve.insertAdjacentElement('afterend', showHiddenImage);
    showHiddenImageLink = true;
  }
};

const swapImage = (event: Event): void => {
  event.stopPropagation();
  event.preventDefault();

  const right = ((event.target as HTMLElement).parentElement as HTMLElement);
  const left = (right.previousElementSibling as HTMLElement);
  if (left) {
    (left.parentElement as HTMLElement).insertBefore(right, left);
  }
};


buttonDoubleFrame.addEventListener('click', event => {
  if (!ehentaiResize) {
    try {
      ehentaiResize = unsafeWindow.onresize;
    }
    catch (e) {
      console.log(e);
    }
  }

  const imgWidths = $$('#i3 a img').map(e => e.getBoundingClientRect().width);
  const avg = imgWidths.reduce((p, c) => p + c) / imgWidths.length;
  const filtered = imgWidths.filter(v => (v < avg * 1.5 && v > avg * 0.5));
  const filteredMax = Math.max.apply(null, filtered);

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

    $('#i1').style.maxWidth = (filteredMax * 2 + 20) + 'px';
    $('#i1').style.width = (filteredMax * 2 + 20) + 'px';
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

buttonRetrieve.addEventListener('click', event => {
  buttonRetrieve.setAttribute('disabled', '');
  buttonRange.setAttribute('disabled', '');
  buttonRetrieve.textContent = 'Initializing...';

  if (!ehr) {
    ehr = new EhRetriever(location.href, document.body.innerHTML);
    console.log(ehr);
  }

  ehr.on('ready', () => {
    buttonRetrieve.textContent = `Ready to retrieve`;
  })

  ehr.on('load', (progress: {current: number, total: number}) => {
    buttonRetrieve.textContent = `Retrieving ${progress.current}/${progress.total}`;
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
    $('#ehrsetrange').remove();
  }
  else {
    retrieve = ehr.retrieve();
    buttonRange.remove();
  }

  retrieve.then(pages => {
    $('#i3 a').remove();

    const template = document.createElement('template');
    template.innerHTML = pages
      .map(e => `
        <a href="${e.imgsrc}">
          <img src="${e.imgsrc}" style="${e.style}" data-page="${e.page}" data-locked="false" />
          <div class="close"></div>
          <div class="swap"></div>
          <div class="page-number">${e.page}</div>
        </a>`)
      .join('');

    template.content.querySelectorAll('img').forEach(e => {
      e.addEventListener('error', function onError(event) {
        e.removeEventListener('error', onError);
        reload(event);
      });

      let timeout: number;
      if (AutoReload) {
        timeout = window.setTimeout( () => {
          console.log(`timeout: page ${e.dataset.page}`);
          const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
          });
          e.dispatchEvent(clickEvent);
        }, LoadTimeout);

        e.addEventListener('load', function onload() {
          e.removeEventListener('load', onload);
          clearTimeout(timeout);
        });
      }
    });

    $('#i3').appendChild(template.content);
    $('#i3').addEventListener('click', event => {
      if ((event.target as HTMLElement).nodeName === 'IMG') {
        reload(event);
      }
      else if ((event.target as HTMLElement).classList.contains('close')) {
        hideImage(event);
      }
      else if ((event.target as HTMLElement).classList.contains('swap')) {
        swapImage(event);
      }
      else if ((event.target as HTMLElement).classList.contains('page-number')) {
        event.preventDefault();
        event.stopPropagation();
      }
    });

    buttonRetrieve.textContent = 'Done!';
    buttonDoubleFrame.removeAttribute('disabled');
    buttonFullHeight.removeAttribute('disabled');
  }).catch(e => { console.log(e); });
});

buttonRange.addEventListener('click', event => {
  // override e-hentai's viewing shortcut
  document.onkeydown = undefined;

  const pageNum = $('div.sn').textContent.match(/(\d+)\s*\/\s*(\d+)/).slice(1);
  buttonRange.insertAdjacentHTML('afterend', `<span id="ehrsetrange"><input type="number" id="ehrstart" value="${pageNum[0]}" min="1" max="${pageNum[1]}"> - <input type="number" id="ehrstop" value="${pageNum[1]}" min="1" max="${pageNum[1]}"></span>`);

  buttonRange.remove();
});

buttonFullHeight.addEventListener('click', event => {
  $('#i3').classList.toggle('force-img-full-height');
});
