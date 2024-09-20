let browser = require("webextension-polyfill");
let waitFor = require("../utils/wait_for");
let addComponents = require("./addComponents");

function init() {
  waitFor
    .waitForAllElm(["ytd-watch-metadata", "ytd-watch-metadata #title"])
    .then(async (elements) => {
      let [youtubeInfo, titleRow] = elements;

      let allSentimentInfos = document.createElement("div");
      allSentimentInfos.id = "all-sentiment-infos";

      titleRow.appendChild(allSentimentInfos);
      titleRow.style.display = "flex";
      titleRow.style.flexDirection = "row";
      titleRow.style.justifyContent = "space-between";
      titleRow.style.gap = "10px";

      let calculateOnLoad = await browser.runtime.sendMessage({
        action: "get",
        key: "calculateOnLoad",
      });
      let fetchMethod = await browser.runtime.sendMessage({
        action: "get",
        key: "fetchType",
      });

      if (calculateOnLoad && fetchMethod === "api") {
        addComponents.startGettingComments();
      } else {
        addComponents.addFetchButton();
      }
    });
}

init();

let prevUrl = window.location.href;

browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message === "urlUpdated") {
    if (request.url !== prevUrl) {
      let oldSentimentInfos = document.getElementById("all-sentiment-infos");
      if (oldSentimentInfos) {
        oldSentimentInfos.remove();
      }
      prevUrl = request.url;
      if (window.location.href.match(/.+www\.youtube\.com\/watch\?v=.+/))
        init();
    }
  }
});
