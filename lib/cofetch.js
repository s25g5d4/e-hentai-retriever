// Origin from window.fetch polyfill
// https://github.com/github/fetch
// License https://github.com/github/fetch/blob/master/LICENSE

const COFetch = (input, init = {}) => {
  let request;
  if (Request.prototype.isPrototypeOf(input) && !init) {
    request = input;
  }
  else {
    request = new Request(input, init);
  }

  const headers = {};
  for (let [key, value] of request.headers) {
    headers[key] = value;
  }

  if (request.credentials === 'include') {
    headers['Cookie'] = document.cookie;
  }

  const onload = (resolve, reject, gmxhr) => {
    const init = {
      'url': gmxhr.finalUrl || request.url,
      'status': gmxhr.status,
      'statusText': gmxhr.statusText,
      'headers': undefined
    };

    try {
      const rawHeaders = gmxhr.responseHeaders.trim().replace(/\r\n(\s+)/g, '$1').split('\r\n').map(e => e.split(/:/));
      const header = new Headers();
      rawHeaders.forEach(e => {
        header.append(e[0].trim(), e[1].trim());
      })
      init.headers = header;

      const res = new Response(gmxhr.response, init);
      resolve(res);
    }
    catch (e) {
      reject(e);
    }
  };

  const onerror = (resolve, reject, gmxhr) => {
    reject(new TypeError('Network request failed'));
  };

  return new Promise( (resolve, reject) => {
    GM_xmlhttpRequest({
      'method':       request.method,
      'url':          request.url,
      'headers':      headers,
      'binary':       init.binary,
      'responseType': 'blob',
      'data':         init.data,
      'onload':       onload.bind(null, resolve, reject),
      'onerror':      onerror.bind(null, resolve, reject)
    });
  });
};

export default COFetch;
