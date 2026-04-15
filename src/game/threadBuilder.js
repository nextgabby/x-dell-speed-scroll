const road = (n) => {
  const pair = "\u{1F6E3}\uFE0F\u{1F6DE}";
  return Array(n).fill(pair).join(" ");
};

// Vary the filler posts — different lengths and occasional flavor
const fillerSets = [
  // Between start and overtake (6 posts)
  [
    road(24),
    road(20) + "\n" + road(20),
    road(22),
    road(18) + "\n" + road(22),
    road(24),
    road(20),
  ],
  // Between overtake and DRS (7 posts)
  [
    road(22),
    road(24),
    road(18) + "\n" + road(18),
    road(20),
    road(24),
    road(22) + "\n" + road(20),
    road(20),
  ],
  // Between DRS and tires (6 posts)
  [
    road(24),
    road(20),
    road(22) + "\n" + road(22),
    road(18),
    road(24),
    road(20) + "\n" + road(20),
  ],
  // Between tires and finish (7 posts)
  [
    road(22),
    road(20) + "\n" + road(20),
    road(24),
    road(22),
    road(18) + "\n" + road(22),
    road(24),
    road(20),
  ],
];

function buildThread() {
  const tweets = [];

  // 1. Start / CTA
  tweets.push({
    text: "\u{1F7E2} LIGHTS OUT AND AWAY WE GO!\n\n\u2764\uFE0F this post to get the green light!",
    role: "cta",
  });

  // Filler block 1
  for (const filler of fillerSets[0]) {
    tweets.push({ text: filler, role: "filler" });
  }

  // 2. Overtake
  tweets.push({
    text: "\u26A1 \u2764\uFE0F this post to overtake the car ahead!",
    role: "middle",
  });

  // Filler block 2
  for (const filler of fillerSets[1]) {
    tweets.push({ text: filler, role: "filler" });
  }

  // 3. DRS
  tweets.push({
    text: "\u{1F4E1} \u2764\uFE0F this post to call for DRS",
    role: "middle",
  });

  // Filler block 3
  for (const filler of fillerSets[2]) {
    tweets.push({ text: filler, role: "filler" });
  }

  // 4. Tires
  tweets.push({
    text: "\u{1F527} \u2764\uFE0F this post to change your tires",
    role: "middle",
  });

  // Filler block 4
  for (const filler of fillerSets[3]) {
    tweets.push({ text: filler, role: "filler" });
  }

  // 5. Finish
  tweets.push({
    text: "\u{1F3C1} \u2764\uFE0F this post to cross the finish line!",
    role: "last",
  });

  return tweets;
}

module.exports = { buildThread };
