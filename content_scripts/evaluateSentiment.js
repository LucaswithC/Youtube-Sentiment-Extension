let browser = require("webextension-polyfill");
let germanWordlist = require("../wordlists/german");
var Sentiment = require("sentiment");
var sentiment = new Sentiment();

const validLanguages = ["en", "de"];

sentiment.registerLanguage("de", germanWordlist.germanWordlist);

function interpretSentiment(score) {
  let nrScore = score.comparative;
  if (nrScore > 0.05) return "Positive";
  if (nrScore < -0.05) return "Negative";
  return "Neutral";
}

async function calculateSentiment(c, weighted) {
  return new Promise((resolve, reject) => {
    browser.i18n.detectLanguage(c.comment).then((l) => {
      let language = "en";
      if (
        l.languages.length > 0 &&
        validLanguages.includes(l.languages[0].language)
      ) {
        language = l.languages[0].language;
      }
      console.log(language);
      let result = sentiment.analyze(c.comment, { language: language });
      let interpretedResult = interpretSentiment(result);
      let resArray = new Array(weighted ? c.likes + 1 : 1).fill(
        interpretedResult
      );
      resolve(resArray);
    });
  });
}

async function evaluateSentiments(comments) {
  if (comments.length === 0) {
    return [
      0,
      {
        Negative: 0,
        Neutral: 0,
        Positive: 0,
      },
    ];
  }

  let weightedSentiment = await browser.runtime.sendMessage({
    action: "get",
    key: "weightedSentiment",
  });

  let sentimentList = await Promise.all(
    comments.map((c) => calculateSentiment(c, weightedSentiment))
  );
  let sentiments = sentimentList.flat().reduce(function (acc, curr) {
    return acc[curr] ? ++acc[curr] : (acc[curr] = 1), acc;
  }, {});

  sentiments.Negative = sentiments.Negative || 0;
  sentiments.Neutral = sentiments.Neutral || 0;
  sentiments.Positive = sentiments.Positive || 0;

  let totalSentiments =
    sentiments.Negative + sentiments.Neutral + sentiments.Positive;

  let positiveRel = Math.round((sentiments.Positive / totalSentiments) * 100);
  let negativeRel = Math.round((sentiments.Negative / totalSentiments) * 100);
  let score = positiveRel - negativeRel;

  return [score, sentiments];
}

module.exports = { evaluateSentiments };
