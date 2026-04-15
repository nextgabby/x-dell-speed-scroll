const road = (n) => {
  const pair = "\u{1F6E3}\uFE0F\u{1F6DE}";
  return Array(n).fill(pair).join(" ");
};

// 15 filler posts spread across 4 gaps (4-4-4-3) + 5 key posts = 20 total
const fillerSets = [
  // Between start and overtake (4 posts)
  [
    road(24),
    road(20) + "\n" + road(20),
    road(22),
    road(18) + "\n" + road(22),
  ],
  // Between overtake and DRS (4 posts)
  [
    road(22),
    road(24),
    road(18) + "\n" + road(18),
    road(20),
  ],
  // Between DRS and tires (4 posts)
  [
    road(24),
    road(20) + "\n" + road(22),
    road(22),
    road(20),
  ],
  // Between tires and finish (3 posts)
  [
    road(22),
    road(20) + "\n" + road(20),
    road(24),
  ],
];

function buildThread() {
  // Append a unique tag so X doesn't reject as duplicate content
  const tag = `\n\n\u{1F3CE}\uFE0F #GridRush${Date.now().toString(36).slice(-4)}`;
  const tweets = [];

  // 1. Start / CTA
  tweets.push({
    text: "\u{1F7E2} LIGHTS OUT AND AWAY WE GO!\n\n\u2764\uFE0F this post to get the green light!" + tag,
    role: "cta",
  });

  // Filler block 1
  for (const filler of fillerSets[0]) {
    tweets.push({ text: filler + tag, role: "filler" });
  }

  // 2. Overtake
  tweets.push({
    text: "\u26A1 \u2764\uFE0F this post to overtake the car ahead!" + tag,
    role: "middle",
  });

  // Filler block 2
  for (const filler of fillerSets[1]) {
    tweets.push({ text: filler + tag, role: "filler" });
  }

  // 3. DRS
  tweets.push({
    text: "\u{1F4E1} \u2764\uFE0F this post to call for DRS" + tag,
    role: "middle",
  });

  // Filler block 3
  for (const filler of fillerSets[2]) {
    tweets.push({ text: filler + tag, role: "filler" });
  }

  // 4. Tires
  tweets.push({
    text: "\u{1F527} \u2764\uFE0F this post to change your tires" + tag,
    role: "middle",
  });

  // Filler block 4
  for (const filler of fillerSets[3]) {
    tweets.push({ text: filler + tag, role: "filler" });
  }

  // 5. Finish
  tweets.push({
    text: "\u{1F3C1} \u2764\uFE0F this post to cross the finish line!" + tag,
    role: "last",
  });

  return tweets;
}

module.exports = { buildThread };
