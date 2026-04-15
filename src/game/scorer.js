const config = require("../config");

function score(participant) {
  const elapsed =
    Math.round(
      ((participant.endTime - participant.startTime) / 1000) * 100
    ) / 100;

  const middleCount = participant.middleLikes.size;
  const underTime = elapsed <= config.scoring.timeLimit;

  // Podium placement based on time + likes
  // 1st: under 15s AND 3 middle likes
  // 2nd: under 15s AND 2 middle likes
  // 3rd: under 15s AND 1 middle like
  // 0 (no podium): everything else
  let podium = 0;
  if (underTime && middleCount === 3) {
    podium = 1;
  } else if (underTime && middleCount === 2) {
    podium = 2;
  } else if (underTime && middleCount === 1) {
    podium = 3;
  }

  participant.elapsedSeconds = elapsed;
  participant.middleLikeCount = middleCount;
  participant.podium = podium;

  return { podium, elapsed, middleCount };
}

module.exports = { score };
