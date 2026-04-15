const road = (n) => {
  const pair = "\u{1F6E3}\uFE0F\u{1F6DE}";
  return Array(n).fill(pair).join(" ");
};

// 15 filler posts spread across 4 gaps (4-4-4-3) + 5 key posts = 20 total
// Each filler has a unique emoji count to avoid duplicate content rejection
const fillerSets = [
  // Between start and overtake (4 posts)
  [road(24), road(21), road(19), road(23)],
  // Between overtake and DRS (4 posts)
  [road(17), road(22), road(20), road(18)],
  // Between DRS and tires (4 posts)
  [road(16), road(25), road(15), road(14)],
  // Between tires and finish (3 posts)
  [road(13), road(26), road(12)],
];

function buildThread() {
  const tweets = [];

  tweets.push({
    text: "\u{1F7E2} LIGHTS OUT AND AWAY WE GO!\n\n\u2764\uFE0F this post to get the green light!",
    role: "cta",
  });

  for (const filler of fillerSets[0]) {
    tweets.push({ text: filler, role: "filler" });
  }

  tweets.push({
    text: "\u26A1 \u2764\uFE0F this post to overtake the car ahead!",
    role: "middle",
  });

  for (const filler of fillerSets[1]) {
    tweets.push({ text: filler, role: "filler" });
  }

  tweets.push({
    text: "\u{1F4E1} \u2764\uFE0F this post to call for DRS",
    role: "middle",
  });

  for (const filler of fillerSets[2]) {
    tweets.push({ text: filler, role: "filler" });
  }

  tweets.push({
    text: "\u{1F527} \u2764\uFE0F this post to change your tires",
    role: "middle",
  });

  for (const filler of fillerSets[3]) {
    tweets.push({ text: filler, role: "filler" });
  }

  tweets.push({
    text: "\u{1F3C1} \u2764\uFE0F this post to cross the finish line!",
    role: "last",
  });

  return tweets;
}

module.exports = { buildThread };
