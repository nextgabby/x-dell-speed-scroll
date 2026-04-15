require("dotenv").config();

const posts = {
  cta: "2044419196281291144",
  middle: [
    "2044421657041801297",
    "2044421954342359323",
    "2044422253522124934",
  ],
  last: "2044422575263035860",
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
