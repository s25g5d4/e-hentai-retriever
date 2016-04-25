import '../lib/regenerator-runtime';
import ehRetriever from '../lib/ehRetriever';

let ehr = new ehRetriever(location.href, document.body.innerHTML);
console.log(ehr);

let div = document.createElement('div');
div.appendChild(document.createElement('button'));
div.childNodes[0].textContent = 'retrieve';

div.childNodes[0].addEventListener('click', (e) => {
  e.target.setAttribute('disabled', '');

  ehr.retrieve().then( (data) => {
    console.log(data);

    data.forEach( (e) => {
      let imgNode = document.createElement('a');

      imgNode.setAttribute('href', e.imgsrc);
      imgNode.innerHTML = `<img src="${e.imgsrc}" style="${e.style}" />`;
      document.querySelector('#i3').appendChild(imgNode);

      imgNode.childNodes[0].dataset.page = e.page;
      imgNode.childNodes[0].dataset.locked = 'false';

      let failReload = async (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (e.target.dataset.locked === 'true') return;
        e.target.dataset.locked = 'true';
        let imginfo = await ehr.fail(parseInt(e.target.dataset.page, 10));
        e.target.src = imginfo.imgsrc;
        e.target.dataset.locked = 'false';
      };

      imgNode.childNodes[0].addEventListener('error', failReload);
      imgNode.childNodes[0].addEventListener('click', failReload);
    });

    document.querySelector('#i3 a').style.display = 'none';

  div.childNodes[0].textContent = 'done!';
  });
})

document.querySelector('#i2').appendChild(div);

ehr.onPageLoad( (page, total) => {
  div.childNodes[0].textContent = `${page}/${total}`;
});
