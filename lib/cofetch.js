let COFetch = (url, options = {}) => {
  return new Promise( (resolve, reject) => {
    GM_xmlhttpRequest(Object.assign({
      'url':     url,
      'onload':  resolve,
      'onerror': reject
    }, options));
  });
};

export default COFetch;
