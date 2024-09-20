let browser = require("webextension-polyfill");

let apiKey;

async function fetchAllComments(limit) {
  apiKey = await browser.runtime.sendMessage({
    action: "get",
    key: "youtubeApiKey",
  });
  let videoId = new URLSearchParams(window.location.search).get("v");
  return await fetchAllCommentsLoop(limit, videoId, [], "", 0);
}

async function fetchAllCommentsLoop(limit, videoId, comments, pageToken) {
  const url = `https://youtube.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&key=${apiKey}&maxResults=50&order=relevance${
    pageToken ? `&pageToken=${pageToken}` : ""
  }`;
  const options = { method: "GET" };

  let response = await fetch(url, options);
  let data = await response.json();
  if (data?.error) {
    throw new Error(data.error.message);
  }
  data.items.forEach((c) => {
    comments.push({
      comment: c.snippet.topLevelComment.snippet.textOriginal,
      likes: c.snippet.topLevelComment.snippet.likeCount,
    });
  });
  if (comments.length < limit && Object.keys(data).includes("nextPageToken")) {
    return fetchAllCommentsLoop(limit, videoId, comments, data.nextPageToken);
  } else {
    return comments;
  }
}

module.exports = { fetchAllComments };
