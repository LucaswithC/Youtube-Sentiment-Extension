let browser = require("webextension-polyfill");
let waitFor = require("../utils/wait_for");

function getOffset(el) {
  const rect = el.getBoundingClientRect();
  return {
    left: rect.left + window.scrollX,
    top: rect.top + window.scrollY,
  };
}

async function loadAllComments(limit) {
  await waitFor.waitForElm("ytd-comments#comments #continuations");
  return loadAllCommentsLoop(limit, 0);
}

async function loadAllCommentsLoop(limit, pageHeight) {
  let next_comments = document.querySelector(
    "ytd-comments#comments #continuations"
  );
  next_comments.scrollIntoView({ block: "end" });

  await sleep(2);

  let next_comments_new = document.querySelector(
    "ytd-comments#comments #continuations"
  );
  let newPageHeight = getOffset(next_comments_new).top;
  let comments = document.querySelectorAll("ytd-comment-thread-renderer");

  if (pageHeight < newPageHeight && comments.length < limit) {
    return loadAllCommentsLoop(limit, newPageHeight);
  } else {
    let all_comments = [];
    comments.forEach((c) => {
      let text = c.querySelector("#content-text span").innerText;
      let likes = c.querySelector("#vote-count-middle").innerText;
      let likesInt = parseInt(likes);
      if (!likesInt) {
        likesInt = 0;
      }
      all_comments.push({ comment: text, likes: likesInt });
    });
    window.scrollTo(0, 0);
    return all_comments;
  }
}

async function sleep(s) {
  return new Promise((resolve) => setTimeout(resolve, s * 1000));
}

module.exports = { loadAllComments };
