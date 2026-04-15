# x-dell-speed-scroll

**Grid Rush** — Dell x Formula 1 speed-scroll campaign backend.

Users race through a series of posts on X. Like the green-light post to start the timer, hit the overtake / DRS / tire-change posts in the middle, then like the checkered-flag post to finish. Placement on the podium depends on scroll speed and how many posts were liked.

## Post order (pixelsattack)

| # | Post ID | CTA |
|---|---------|-----|
| 1 | `2044419196281291144` | Get the green light (start) |
| 2 | `2044421657041801297` | Overtake the car ahead |
| 3 | `2044421954342359323` | Call for DRS |
| 4 | `2044422253522124934` | Change your tires |
| 5 | `2044422575263035860` | Cross the finish line (end) |

## Podium scoring

| Placement | Criteria |
|-----------|----------|
| P1 | < 15 s **and** liked 3 middle posts |
| P2 | < 15 s **and** liked 2 middle posts |
| P3 | < 15 s **and** liked 1 middle post |
| No podium | Everything else |

## Quick start

```bash
cp .env.example .env   # fill in X API creds
npm install
npm run dev
```
