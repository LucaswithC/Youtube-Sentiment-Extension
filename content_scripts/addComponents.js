let browser = require("webextension-polyfill");
let getCommentsLocally = require("./getCommentsLocally");
let getCommentsApi = require("./getCommentsApi");
let evaluateSentiments = require("./evaluateSentiment");

const reloadIcon =
  '<?xml version="1.0" encoding="UTF-8"?><svg viewBox="0 0 19 19"xmlns=http://www.w3.org/2000/svg><defs><style>.cls-1{fill:none}.cls-1{stroke-linejoin:round}</style></defs><path class=cls-1 d=M18.12,6.49l-.89-5.11c-.09-.5-.72-.67-1.05-.28l-1.31,1.56c-1.52-1.19-3.38-1.83-5.33-1.83-2.32,0-4.5.9-6.13,2.54S.87,7.18.87,9.5s.9,4.5,2.54,6.13,3.82,2.54,6.13,2.54c1.41,0,2.81-.35,4.05-1,.67-.35.93-1.18.57-1.86-.35-.67-1.18-.93-1.86-.57-.86.45-1.79.68-2.77.68-3.27,0-5.93-2.66-5.93-5.93s2.66-5.93,5.93-5.93c1.3,0,2.54.42,3.56,1.19l-1.22,1.45c-.33.39-.05.98.46.98h5.19c.37,0,.65-.33.59-.7Z /></svg>';

async function startGettingComments() {
  addFetchingButton();

  let fetchType = await browser.runtime.sendMessage({
    action: "get",
    key: "fetchType",
  });
  let maximumCommentCount = await browser.runtime.sendMessage({
    action: "get",
    key: "maximumCommentCount",
  });

  try {
    let comments;
    if (fetchType === "scroll") {
      comments = await getCommentsLocally.loadAllComments(maximumCommentCount);
    } else if (fetchType === "api") {
      comments = await getCommentsApi.fetchAllComments(maximumCommentCount);
    }
    sentiment = await evaluateSentiments.evaluateSentiments(comments);
    addCurrentSentiment(
      sentiment[0],
      sentiment[1].Negative,
      sentiment[1].Neutral,
      sentiment[1].Positive
    );
  } catch (error) {
    addFetchButton();
    addErrorBox(error);
  }
}

function addFetchButton() {
  clearSentimentInfos();

  let allSentimentInfos = document.getElementById("all-sentiment-infos");
  let sentimentFetchBtn = document.createElement("div");
  sentimentFetchBtn.classList.add("fetch-sentiment-btn");

  let sentimentFetchBtnIcon = document.createElement("div");
  sentimentFetchBtnIcon.classList.add("fetch-sentiment-btn-icon");
  sentimentFetchBtnIcon.innerHTML = reloadIcon;

  let sentimentFetchBtnText = document.createElement("p");
  sentimentFetchBtnText.innerText = "Get Audience Sentiment";
  sentimentFetchBtn.appendChild(sentimentFetchBtnIcon);
  sentimentFetchBtn.appendChild(sentimentFetchBtnText);
  sentimentFetchBtn.addEventListener("click", () => {
    startGettingComments();
  });

  allSentimentInfos.appendChild(sentimentFetchBtn);
}

function addCurrentSentiment(score, neg, neu, pos) {
  clearSentimentInfos();

  let allSentimentInfos = document.getElementById("all-sentiment-infos");
  let currentSentiment = document.createElement("div");
  currentSentiment.classList.add("current-sentiment-cont");

  let sentimentCont = document.createElement("div");
  sentimentCont.classList.add("sentiment-cont");

  let sentimentContRow1 = document.createElement("div");
  sentimentContRow1.classList.add("sentiment-cont-row1");

  let sentimentTitle = document.createElement("p");
  sentimentTitle.innerText = "Sentiment: ";
  sentimentTitle.classList.add("sentiment-cont-title");

  let sentimentValue = document.createElement("p");
  sentimentValue.innerText = score;
  sentimentValue.classList.add("sentiment-cont-value");

  let sentimentContRow2 = document.createElement("div");
  sentimentContRow2.classList.add("sentiment-cont-row2");

  let sentimentContNeg = document.createElement("div");
  sentimentContNeg.classList.add("sentiment-cont-neg");
  sentimentContNeg.style.flex = neg;
  sentimentContNeg.setAttribute("data-value", neg);
  let sentimentContNegInner = document.createElement("div");
  sentimentContNeg.appendChild(sentimentContNegInner);

  let sentimentContNeu = document.createElement("div");
  sentimentContNeu.classList.add("sentiment-cont-neu");
  sentimentContNeu.style.flex = neu;
  sentimentContNeu.setAttribute("data-value", neu);
  let sentimentContNeuInner = document.createElement("div");
  sentimentContNeu.appendChild(sentimentContNeuInner);

  let sentimentContPos = document.createElement("div");
  sentimentContPos.classList.add("sentiment-cont-pos");
  sentimentContPos.style.flex = pos;
  sentimentContPos.setAttribute("data-value", pos);
  let sentimentContPosInner = document.createElement("div");
  sentimentContPos.appendChild(sentimentContPosInner);

  sentimentCont.appendChild(sentimentContRow1);
  sentimentContRow1.appendChild(sentimentTitle);
  sentimentContRow1.appendChild(sentimentValue);
  sentimentCont.appendChild(sentimentContRow2);
  sentimentContRow2.appendChild(sentimentContNeg);
  sentimentContRow2.appendChild(sentimentContNeu);
  sentimentContRow2.appendChild(sentimentContPos);

  currentSentiment.appendChild(sentimentCont);

  let reloadSentiment = document.createElement("div");
  reloadSentiment.innerHTML = reloadIcon;
  reloadSentiment.classList.add("reload-sentiment-btn");

  reloadSentiment.addEventListener("click", () => {
    startGettingComments();
  });

  currentSentiment.appendChild(reloadSentiment);

  allSentimentInfos.appendChild(currentSentiment);
}

function addFetchingButton() {
  clearSentimentInfos();

  let allSentimentInfos = document.getElementById("all-sentiment-infos");
  let sentimentFetchBtn = document.createElement("div");
  sentimentFetchBtn.classList.add("fetch-sentiment-btn");

  let sentimentFetchBtnIcon = document.createElement("div");
  sentimentFetchBtnIcon.classList.add("fetch-sentiment-btn-icon");
  sentimentFetchBtnIcon.classList.add("fetching-sentiment-btn-icon");
  sentimentFetchBtnIcon.innerHTML = reloadIcon;

  let sentimentFetchBtnText = document.createElement("p");
  sentimentFetchBtnText.innerText = "Evaluating Sentiment";
  sentimentFetchBtn.appendChild(sentimentFetchBtnIcon);
  sentimentFetchBtn.appendChild(sentimentFetchBtnText);
  allSentimentInfos.appendChild(sentimentFetchBtn);
}

function addErrorBox(message) {
  let allSentimentInfos = document.getElementById("all-sentiment-infos");
  let errorBox = document.createElement("div");
  errorBox.id = "sentiment-error-box";
  errorBox.innerHTML =
    '<svg viewBox="0 0 19 19"xmlns=http://www.w3.org/2000/svg><defs><style>.cls-1{stroke-miterlimit:10}.cls-1{fill:none}</style></defs><g><path class=cls-1 d=M8.55,2.44L1.03,15.46c-.42.73.11,1.64.95,1.64h15.03c.84,0,1.37-.91.95-1.64L10.45,2.44c-.42-.73-1.48-.73-1.9,0Z /><g><rect class=cls-1 height=6 rx=1 ry=1 width=2 x=8.5 y=5.8 /><rect class=cls-1 height=2 rx=1 ry=1 width=2 x=8.5 y=13.3 /></g></g></svg>';
  errorBox.setAttribute("title", message);
  allSentimentInfos.appendChild(errorBox);
}

function clearSentimentInfos() {
  let allSentimentInfos = document.getElementById("all-sentiment-infos");
  allSentimentInfos.innerHTML = "";
}

module.exports = {
  addFetchButton,
  addCurrentSentiment,
  addFetchingButton,
  startGettingComments,
  addErrorBox,
};
