const config = require("../config");
const store = require("../store");
const { score } = require("./scorer");
const { compose } = require("./replyComposer");
const { postReply } = require("../api/xApiV2");

function processEvent(event) {
  const postId = event.favorited_status?.id_str;
  const userId = event.user?.id_str;
  const username = event.user?.screen_name;
  const timestamp = event.timestamp_ms;

  if (!postId || !userId || !username || !timestamp) {
    console.log("Malformed favorite event, skipping");
    return;
  }

  // Only process likes on our campaign posts
  if (!config.posts.all.has(postId)) {
    return;
  }

  console.log(`[${username}] liked post ${postId}`);

  if (postId === config.posts.cta) {
    handleCtaLike(userId, username, Number(timestamp));
  } else if (config.posts.middle.includes(postId)) {
    handleMiddleLike(userId, postId);
  } else if (postId === config.posts.last) {
    handleLastLike(userId, username, Number(timestamp));
  }
}

function handleCtaLike(userId, username, timestamp) {
  const existing = store.getParticipant(userId);
  if (existing && existing.podium === null) {
    // Currently in progress — ignore duplicate CTA like
    console.log(`[${username}] already in progress, ignoring duplicate CTA like`);
    return;
  }

  // New driver or replay (already scored — reset for a new round)
  if (existing) {
    console.log(`[${username}] replaying — resetting for new race`);
  }

  store.createParticipant(userId, username, timestamp);
  console.log(`[${username}] lights out — race started`);
}

function handleMiddleLike(userId, postId) {
  const participant = store.getParticipant(userId);
  if (!participant) {
    // No start recorded — ignore
    return;
  }
  if (participant.podium !== null) {
    // Already scored — ignore
    return;
  }
  if (participant.middleLikes.has(postId)) {
    // Duplicate — ignore
    return;
  }

  participant.middleLikes.add(postId);
  console.log(
    `[${participant.username}] liked middle post (${participant.middleLikes.size}/3)`
  );
}

async function handleLastLike(userId, username, timestamp) {
  const participant = store.getParticipant(userId);

  if (!participant) {
    // Never liked the CTA — jumped the start
    console.log(`[${username}] jumped the start — no green light like recorded`);
    const text = compose(username, null);
    try {
      const tweetId = await postReply(text);
      console.log(`[${username}] jump start reply sent: ${tweetId}`);
    } catch (err) {
      console.error(`[${username}] failed to send jump start reply:`, err.message);
    }
    return;
  }

  if (participant.podium !== null) {
    // Already scored — ignore duplicate
    console.log(`[${username}] already finished, ignoring duplicate last-post like`);
    return;
  }

  participant.endTime = timestamp;
  const result = score(participant);
  const text = compose(username, result);

  const podiumLabel = result.podium > 0 ? `P${result.podium}` : "No podium";
  console.log(
    `[${username}] finished: ${podiumLabel} | ` +
      `${result.elapsed}s | ${result.middleCount}/3 middle likes`
  );

  try {
    const tweetId = await postReply(text);
    participant.replied = true;
    participant.replyTweetId = tweetId;
    console.log(`[${username}] reply sent: ${tweetId}`);
  } catch (err) {
    console.error(`[${username}] failed to send reply:`, err.message);
  }
}

module.exports = { processEvent };
