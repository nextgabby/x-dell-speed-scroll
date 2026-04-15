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

// In-memory thread progress tracker
let threadProgress = null;

app.post("/admin/post-thread", (_req, res) => {
  if (threadProgress && threadProgress.status === "in_progress") {
    return res.status(409).json({ error: "Thread is already being posted", progress: threadProgress });
  }

  const tweets = buildThread();
  const DELAY_MS = 2 * 60 * 1000; // 2 minutes between posts

  threadProgress = {
    status: "in_progress",
    total: tweets.length,
    posted: [],
    keyPosts: [],
    startedAt: new Date().toISOString(),
    error: null,
  };

  // Respond immediately — post in the background
  res.json({ ok: true, message: `Posting ${tweets.length} nullcast tweets with 2-min gaps. Check GET /admin/thread-status for progress.` });

  // Fire-and-forget
  (async () => {
    let lastId = null;

    for (let i = 0; i < tweets.length; i++) {
      const tweet = tweets[i];
      try {
        console.log(`[thread] Posting ${i + 1}/${tweets.length} [${tweet.role}]...`);
        const tweetId = await postTweet(tweet.text, lastId, { nullcast: true });
        const entry = { index: i, role: tweet.role, tweetId };
        threadProgress.posted.push(entry);
        if (tweet.role !== "filler") {
          threadProgress.keyPosts.push(entry);
        }
        lastId = tweetId;
        console.log(`[thread]   -> ${tweetId}`);
      } catch (err) {
        const detail = err.response?.data || err.message;
        console.error(`[thread] Failed at tweet ${i + 1}:`, detail);
        threadProgress.status = "failed";
        threadProgress.error = { failedAt: i + 1, detail };
        return;
      }

      // Wait between posts (skip after the last one)
      if (i < tweets.length - 1) {
        console.log(`[thread] Waiting 2 minutes before next post...`);
        await new Promise((r) => setTimeout(r, DELAY_MS));
      }
    }

    threadProgress.status = "done";
    threadProgress.finishedAt = new Date().toISOString();
    console.log("\n=== THREAD COMPLETE ===");
    console.log("Key posts:");
    for (const p of threadProgress.keyPosts) {
      console.log(`  ${p.role}: ${p.tweetId}`);
    }
  })();
});

app.get("/admin/thread-status", (_req, res) => {
  if (!threadProgress) {
    return res.json({ status: "idle", message: "No thread has been posted yet" });
  }
  res.json(threadProgress);
});

// --- Start ---

app.listen(config.port, () => {
  console.log(`Grid Rush service running on port ${config.port}`);
  console.log(`Webhook endpoint: ${config.webhookUrl || "(not configured)"}`);
});
