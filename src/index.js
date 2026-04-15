const express = require("express");
const config = require("./config");
const { handleCrc } = require("./webhook/crc");
const { handleWebhook, getRecentLogs } = require("./webhook/handler");
const {
  registerWebhook,
  subscribeAccount,
  deleteWebhook,
  getWebhookStatus,
} = require("./webhook/setup");
const { postTestReply, postTweet, deleteTweet } = require("./api/xApiV2");
const { buildThread } = require("./game/threadBuilder");
const store = require("./store");

const app = express();
const startTime = Date.now();

// Parse JSON body and capture raw body for signature validation
app.use(
  express.json({
    verify(req, _res, buf) {
      req.rawBody = buf.toString("utf8");
    },
  })
);

// --- Webhook endpoints ---

app.get("/webhook/twitter", handleCrc);
app.post("/webhook/twitter", handleWebhook);

// --- Health & monitoring ---

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    uptime: Math.round((Date.now() - startTime) / 1000),
    startedAt: new Date(startTime).toISOString(),
  });
});

app.get("/stats", (_req, res) => {
  res.json(store.getStats());
});

app.get("/participants", (_req, res) => {
  res.json(store.getAllParticipants());
});

app.get("/participant/:id", (req, res) => {
  const participant = store.getParticipant(req.params.id);
  if (!participant) {
    return res.status(404).json({ error: "Participant not found" });
  }
  res.json(store.serialize(participant));
});

// --- Admin / webhook management ---

app.post("/admin/setup-webhook", async (_req, res) => {
  try {
    const webhook = await registerWebhook();
    await subscribeAccount();
    res.json({ ok: true, webhook });
  } catch (err) {
    console.error("Webhook setup failed:", err.response?.data || err.message);
    res.status(500).json({
      error: "Webhook setup failed",
      details: err.response?.data || err.message,
    });
  }
});

app.post("/admin/delete-webhook", async (_req, res) => {
  try {
    await deleteWebhook();
    res.json({ ok: true });
  } catch (err) {
    console.error("Webhook delete failed:", err.response?.data || err.message);
    res.status(500).json({
      error: "Webhook delete failed",
      details: err.response?.data || err.message,
    });
  }
});

app.post("/admin/delete-webhook/:id", async (req, res) => {
  try {
    await deleteWebhook(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    console.error("Webhook delete failed:", err.response?.data || err.message);
    res.status(500).json({
      error: "Webhook delete failed",
      details: err.response?.data || err.message,
    });
  }
});

app.get("/admin/logs", (_req, res) => {
  res.json(getRecentLogs());
});

app.get("/admin/webhook-status", async (_req, res) => {
  const status = await getWebhookStatus();
  res.json(status);
});

// --- Testing ---

app.post("/admin/test-reply/:handle", async (req, res) => {
  const handle = req.params.handle.replace(/^@/, "");
  try {
    const tweetId = await postTestReply(handle);
    res.json({ ok: true, tweetId });
  } catch (err) {
    console.error("Test reply failed:", err.response?.data || err.message);
    res.status(500).json({
      error: "Test reply failed",
      details: err.response?.data || err.message,
    });
  }
});

// --- Bulk delete ---

app.post("/admin/delete-tweets", async (req, res) => {
  const ids = req.body?.ids;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: "Provide { ids: [...] }" });
  }

  const results = [];
  for (const id of ids) {
    try {
      console.log(`Deleting tweet ${id}...`);
      await deleteTweet(id);
      results.push({ id, deleted: true });
      console.log(`  -> deleted`);
    } catch (err) {
      const detail = err.response?.data || err.message;
      console.error(`  -> failed: ${JSON.stringify(detail)}`);
      results.push({ id, deleted: false, error: detail });
    }
    // Small delay to avoid rate limits
    await new Promise((r) => setTimeout(r, 500));
  }

  res.json({
    ok: true,
    deleted: results.filter((r) => r.deleted).length,
    failed: results.filter((r) => !r.deleted).length,
    results,
  });
});

// --- Thread builder ---

app.post("/admin/post-thread", async (_req, res) => {
  const tweets = buildThread();
  const posted = [];
  let lastId = null;

  try {
    for (let i = 0; i < tweets.length; i++) {
      const tweet = tweets[i];
      console.log(`Posting tweet ${i + 1}/${tweets.length} [${tweet.role}]...`);
      const tweetId = await postTweet(tweet.text, lastId);
      posted.push({ index: i, role: tweet.role, tweetId });
      lastId = tweetId;
      console.log(`  -> ${tweetId}`);

      // Small delay to avoid rate limits
      if (i < tweets.length - 1) {
        await new Promise((r) => setTimeout(r, 1500));
      }
    }

    // Extract the important post IDs
    const keyPosts = posted.filter((p) => p.role !== "filler");
    console.log("\n=== KEY POST IDS ===");
    for (const p of keyPosts) {
      console.log(`${p.role}: ${p.tweetId}`);
    }

    res.json({
      ok: true,
      totalPosted: posted.length,
      keyPosts,
      allPosts: posted,
    });
  } catch (err) {
    console.error("Thread posting failed at tweet", posted.length + 1, err.response?.data || err.message);
    res.status(500).json({
      error: "Thread posting failed",
      failedAt: posted.length + 1,
      posted,
      details: err.response?.data || err.message,
    });
  }
});

// --- Start ---

app.listen(config.port, () => {
  console.log(`Grid Rush service running on port ${config.port}`);
  console.log(`Webhook endpoint: ${config.webhookUrl || "(not configured)"}`);
});
