let browser = require("webextension-polyfill");

let inputFetchMethod = document.querySelectorAll(
  'input[type="radio"][name="fetch-method"]'
);

browser.runtime
  .sendMessage({ action: "get", key: "fetchType" })
  .then((fetchType) => {
    for (let i = 0; i < inputFetchMethod.length; i++) {
      if (inputFetchMethod[i].value === fetchType) {
        inputFetchMethod[i].checked = true;
      }
      inputFetchMethod[i].addEventListener("change", (e) => {
        if (inputFetchMethod[i].checked) {
          browser.runtime.sendMessage({
            action: "set",
            key: "fetchType",
            value: inputFetchMethod[i].value,
          });
        }
      });
    }
  });

let inputMaxComments = document.getElementById("inputMaxComments");

browser.runtime
  .sendMessage({ action: "get", key: "maximumCommentCount" })
  .then((maxComments) => {
    inputMaxComments.value = maxComments;
    inputMaxComments.addEventListener("input", (e) => {
      let inputValue = parseInt(inputMaxComments.value);
      let newMaxComments =
        inputMaxComments.value && inputValue && inputValue > 0
          ? inputMaxComments.value
          : 1000;
      browser.runtime.sendMessage({
        action: "set",
        key: "maximumCommentCount",
        value: newMaxComments,
      });
    });
  });

let inputWeightedSentiment = document.getElementById("inputWeightedSentiment");

browser.runtime
  .sendMessage({ action: "get", key: "weightedSentiment" })
  .then((weightedSentiment) => {
    inputWeightedSentiment.checked = weightedSentiment;
    inputWeightedSentiment.addEventListener("change", (e) => {
      browser.runtime.sendMessage({
        action: "set",
        key: "weightedSentiment",
        value: inputWeightedSentiment.checked,
      });
    });
  });

let inputYoutubeApiKey = document.getElementById("inputYoutubeApiKey");

browser.runtime
  .sendMessage({ action: "get", key: "youtubeApiKey" })
  .then((youtubeApiKey) => {
    inputYoutubeApiKey.value = youtubeApiKey;
    inputYoutubeApiKey.addEventListener("input", (e) => {
      browser.runtime.sendMessage({
        action: "set",
        key: "youtubeApiKey",
        value: inputYoutubeApiKey.value,
      });
    });
  });

let inputCalculateOnLoad = document.getElementById("inputCalculateOnLoad");

browser.runtime
  .sendMessage({ action: "get", key: "calculateOnLoad" })
  .then((calculateOnLoad) => {
    inputCalculateOnLoad.checked = calculateOnLoad;
    inputCalculateOnLoad.addEventListener("change", (e) => {
      browser.runtime.sendMessage({
        action: "set",
        key: "calculateOnLoad",
        value: inputCalculateOnLoad.checked,
      });
    });
  });
