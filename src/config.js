require("dotenv").config();

const posts = {
  cta: "2044505220819108189",
  middle: [
    "2044505268764217794",
    "2044505323705356765",
    "2044505371663077759",
  ],
  last: "2044505426507796744",
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
