let browser = require("webextension-polyfill");

// listen to tab URL changes
browser.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.url) {
    browser.tabs.sendMessage(tabId, {
      message: "urlUpdated",
      url: changeInfo.url,
    });
  }
});

const defaultValues = {
  fetchType: "scroll",
  maximumCommentCount: 1000,
  weightedSentiment: false,
  youtubeApiKey: "",
  calculateOnLoad: false,
};

function setStorageLocal(key, value, sendResponse) {
  browser.storage.local.set({ [key]: value });
}

function getStorageLocal(key, sendResponse) {
  browser.storage.local.get(key).then((v) => {
    sendResponse(v?.[key] || defaultValues?.[key] || "");
  });
}

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  let action = message?.action;
  let key = message?.key;
  let value = message?.value;
  if (action === "set") {
    setStorageLocal(key, value, sendResponse);
    return true;
  } else if (action === "get") {
    getStorageLocal(key, sendResponse);
    return true;
  }
});
