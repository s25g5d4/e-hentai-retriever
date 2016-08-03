import "regenerator-runtime/runtime";
import ehRetriever from '../lib/ehretriever';

// helper functions
const $ = selector => document.querySelector(selector);
const $$ = selector => Array.from(document.querySelectorAll(selector));

const buttonDoubleFrame = document.createElement('button');
buttonDoubleFrame.textContent = "Double Frame";
$('#i1').insertBefore(buttonDoubleFrame, $('#i2'));

const buttonRetrieve = document.createElement('button');
buttonRetrieve.textContent = 'Retrieve!';
$('#i1').insertBefore(buttonRetrieve, $('#i2'));

const buttonRange = document.createElement('button');
buttonRange.textContent = 'Set Range';
$('#i1').insertBefore(buttonRange, $('#i2'));

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

let ehr;

buttonRetrieve.addEventListener('click', event => {
  buttonRetrieve.setAttribute('disabled', '');
  buttonRange.setAttribute('disabled', '');
  buttonRetrieve.textContent = 'Initializing...';

  if (!ehr) {
    ehr = new ehRetriever(location.href, document.body.innerHTML);
    console.log(ehr);
  }

  ehr.onPageLoad( (page, total) => {
    buttonRetrieve.textContent = `${page}/${total}`;
  });

  let retrieve;

  if (document.getElementById('ehrstart')) {
    const start = parseInt(document.getElementById('ehrstart').value, 10);
    const stop = parseInt(document.getElementById('ehrstop').value, 10);
    const pageNumMax = parseInt($('div.sn').textContent.match(/\/\s*(\d+)/)[1], 10);

    if (stop < start || start <= 0 || start > pageNumMax || stop > pageNumMax) {
      alert(`invalid range: ${start} - ${stop}, accepted range: 1 - ${pageNumMax}`);
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
    console.log(pages);

    $('#i3 a').style.display = 'none';

    const reload = event => {
      event.stopPropagation();
      event.preventDefault();

      if (event.target.dataset.locked === 'true') return;

      event.target.dataset.locked = 'true';

      ehr.fail( parseInt(event.target.dataset.page, 10) ).then(imgInfo => {
        console.log(imgInfo);

        event.target.src = imgInfo.imgsrc;
        event.target.parentNode.href = imgInfo.imgsrc;
        event.target.dataset.locked = 'false';
      });
    };

    pages.forEach(e => {
      const pageNode = document.createElement('a');

      pageNode.setAttribute('href', e.imgsrc);
      pageNode.innerHTML = `<img src="${e.imgsrc}" style="${e.style}" />`;
      $('#i3').appendChild(pageNode);

      pageNode.childNodes[0].dataset.page = e.page;
      pageNode.childNodes[0].dataset.locked = 'false';

      const timeout = setTimeout( () => {
        console.log(`timeout: page ${e.page}`);
        const clickEvent = new MouseEvent('click');
        pageNode.childNodes[0].dispatchEvent(clickEvent);
      }, 5000);

      pageNode.childNodes[0].addEventListener('error', reload);
      pageNode.childNodes[0].addEventListener('click', reload);

      pageNode.childNodes[0].addEventListener('load', function onload() {
        pageNode.removeEventListener('load', onload);
        clearTimeout(timeout);
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
