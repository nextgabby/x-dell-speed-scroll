const participants = new Map();

function getParticipant(userId) {
  return participants.get(userId) || null;
}

function createParticipant(userId, username, startTime) {
  const participant = {
    userId,
    username,
    startTime,
    middleLikes: new Set(),
    endTime: null,
    elapsedSeconds: null,
    middleLikeCount: null,
    podium: null,
    replied: false,
    replyTweetId: null,
  };
  participants.set(userId, participant);
  return participant;
}

function getAllParticipants() {
  return Array.from(participants.values()).map(serialize);
}

function getStats() {
  const all = Array.from(participants.values());
  const scored = all.filter((p) => p.podium !== null);
  const podiumFinishers = scored.filter((p) => p.podium > 0);
  const noPodium = scored.filter((p) => p.podium === 0);
  const times = scored
    .filter((p) => p.elapsedSeconds !== null)
    .map((p) => p.elapsedSeconds);
  const avgTime =
    times.length > 0
      ? Math.round((times.reduce((a, b) => a + b, 0) / times.length) * 100) /
        100
      : null;

  return {
    total: all.length,
    active: all.filter((p) => p.podium === null).length,
    p1: scored.filter((p) => p.podium === 1).length,
    p2: scored.filter((p) => p.podium === 2).length,
    p3: scored.filter((p) => p.podium === 3).length,
    noPodium: noPodium.length,
    avgTime,
  };
}

function serialize(p) {
  return {
    ...p,
    middleLikes: Array.from(p.middleLikes),
  };
}

module.exports = {
  getParticipant,
  createParticipant,
  getAllParticipants,
  getStats,
  serialize,
};
