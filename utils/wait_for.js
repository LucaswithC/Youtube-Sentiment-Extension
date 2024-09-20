// Thanks to https://stackoverflow.com/a/61511955

function waitForElm(selector) {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver((mutations) => {
      if (document.querySelector(selector)) {
        observer.disconnect();
        resolve(document.querySelector(selector));
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}

function waitForAllElm(selectors) {
  return Promise.all(selectors.map((selector) => waitForElm(selector)));
}

module.exports = { waitForElm, waitForAllElm };
