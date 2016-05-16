import '../lib/regenerator-runtime';
import ehRetriever from '../lib/ehRetriever';

let button = document.createElement('button');
button.textContent = 'Retrieve!';
document.querySelector('#i1').insertBefore(button, document.querySelector('#i2'));


button.addEventListener('click', (e) => {
  e.target.setAttribute('disabled', '');
  e.target.textContent = 'Initializing...';

  let ehr = new ehRetriever(location.href, document.body.innerHTML);
  console.log(ehr);

  function failReload(e) {
    e.stopPropagation();
    e.preventDefault();

    if (e.target.dataset.locked === 'true') return;

    e.target.dataset.locked = 'true';
    ehr.fail( parseInt(e.target.dataset.page, 10) ).then( (imgInfo) => {
      console.log(imgInfo);
      e.target.src = imgInfo.imgsrc;
      e.target.parentNode.href = imgInfo.imgsrc;
      e.target.dataset.locked = 'false';
    });
  };

  ehr.onPageLoad( (page, total) => {
    e.target.textContent = `${page}/${total}`;
  });

  ehr.retrieve().then( (pages) => {
    console.log(pages);

    document.querySelector('#i3 a').style.display = 'none';

    pages.forEach( (e) => {
      let pageNode = document.createElement('a');

      pageNode.setAttribute('href', e.imgsrc);
      pageNode.innerHTML = `<img src="${e.imgsrc}" style="${e.style}" />`;
      document.querySelector('#i3').appendChild(pageNode);

      pageNode.childNodes[0].dataset.page = e.page;
      pageNode.childNodes[0].dataset.locked = 'false';
      pageNode.childNodes[0].addEventListener('error', failReload);
      pageNode.childNodes[0].addEventListener('click', failReload);
    });

    e.target.textContent = 'Done!';
  });
});
