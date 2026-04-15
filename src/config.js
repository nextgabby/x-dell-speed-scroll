require("dotenv").config();

const posts = {
  cta: "2044510795502129487",
  middle: [
    "2044510829924782172",
    "2044510864343241018",
    "2044510898623287758",
  ],
  last: "2044510926154740051",
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
