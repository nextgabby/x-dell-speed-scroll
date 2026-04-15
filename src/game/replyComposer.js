function compose(username, result) {
  if (!result) {
    // No start time — user liked the last post without liking CTA first
    return (
      `@${username} \u{1F6D1} Jump start! You crossed the finish line without ` +
      `waiting for the green light. Head back to the starting grid and try again!\n\n`
    );
  }

  const { podium, elapsed, middleCount } = result;
  const time = elapsed.toFixed(2);

  // Fun callouts for missed middle posts
  const missedHints = [];
  if (middleCount < 3) {
    const skips = [
      "You skipped a pit stop!",
      "No DRS for you!",
      "You drove right past the tire change!",
    ];
    // Pick hints based on how many were missed
    const missed = 3 - middleCount;
    for (let i = 0; i < missed; i++) {
      missedHints.push(skips[i]);
    }
  }
  const missedNote = missedHints.length > 0 ? " " + missedHints.join(" ") : "";

  if (podium === 1) {
    return (
      `@${username} \u{1F3C6} P1 — YOU'RE ON TOP OF THE PODIUM! You nailed every ` +
      `overtake, pit stop, and DRS zone in just ${time} seconds — that's ` +
      `championship-winning pace. Champagne shower incoming!\n\n`
    );
  }

  if (podium === 2) {
    return (
      `@${username} \u{1F948} P2 — Podium finish! You crossed the line in ${time} seconds ` +
      `with solid race craft.${missedNote} One more move and you'd be spraying ` +
      `champagne from the top step.\n\n`
    );
  }

  if (podium === 3) {
    return (
      `@${username} \u{1F949} P3 — You made it onto the podium! ${time} seconds with raw speed, ` +
      `but you left moves on the table.${missedNote} Next race, hit every mark ` +
      `and aim for the top step.\n\n`
    );
  }

  // No podium
  return (
    `@${username} \u{1F3C1} You crossed the finish line in ${time} seconds but didn't ` +
    `make it onto the podium this race.${missedNote} Every F1 driver has off days — ` +
    `get back on the grid and go again!\n\n`
  );
}

module.exports = { compose };
