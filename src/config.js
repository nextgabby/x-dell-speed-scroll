require("dotenv").config();

const posts = {
  cta: "2044515043472249329",
  middle: [
    "2044517563137462520",
    "2044520082722984114",
    "2044522602690187327",
  ],
  last: "2044524618426503424",
};

posts.all = new Set([posts.cta, ...posts.middle, posts.last]);

module.exports = {
  posts,
  scoring: {
    timeLimit: 15,
  },
  x: {
    apiKey: process.env.X_API_KEY,
    apiSecret: process.env.X_API_SECRET,
    accessToken: process.env.X_ACCESS_TOKEN,
    accessTokenSecret: process.env.X_ACCESS_TOKEN_SECRET,
    bearerToken: process.env.X_BEARER_TOKEN,
  },
  webhookUrl: process.env.WEBHOOK_URL,
  port: process.env.PORT || 3000,
};
