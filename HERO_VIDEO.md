# The backdrop, and how to switch the video on

## What is live now

The showroom plate is the backdrop of the entire site — one fixed layer behind
every route, so the whole thing sits inside a single space. It renders twice from
one file:

| Where | Treatment |
| --- | --- |
| Site-wide (`VoltarisEnvironment`) | Heavily dimmed: desaturated, cooled toward the brand blue, sunk under a dark wash. It reads as depth and material, not as a picture. |
| The hero (`HeroMedia`) | Near full clarity, with a left-weighted scrim behind the copy. This is the one screen where the image is the point. |

Same URL, so the browser fetches it once. Assets: `public/hero/showroom-{640,1024,1536}.{avif,webp}` — 68 KB AVIF at full width, down from a 2 MB PNG.

**Why the site-wide layer is dimmed so far.** The plate is bright, high-contrast,
cool-white. At full strength it sits under every paragraph, price, and form label
on the site, and chrome text over the white bodywork or the lit ceiling strips
would drop under 4.5:1. Dimmed, the composite holds above 12:1 everywhere. The
hero is where the image gets to be seen properly.

---

## Activating the video

**Three steps.**

### 1. Produce the file

I cannot generate video, so this needs a motion designer, Blender, or an
image-to-video tool. The brief:

A slow orbit around the parked car, roughly 120° of arc, camera at chest height,
moving left to right. The ceiling light strips sweep across the paint as the
camera travels. A lighting study, not a car advert — no cuts, no zoom, no flare.

- **Seamless loop.** Start and end frames must match, or the reset is a visible
  jolt every eight seconds on a page people scroll slowly.
- **Frame one must match `showroom-1536.webp` exactly.** It is the poster, so any
  difference shows as a jump when the video takes over.
- **Keep the left third quiet.** The headline and search sit there. Motion behind
  text is where hero videos become unreadable.

### 2. Encode and upload

| | |
| --- | --- |
| Duration | 8–12s, seamless loop |
| Resolution | 1920×1080 |
| Frame rate | 24fps — cinematic, and a third fewer frames than 30 |
| Codecs | AV1 in WebM **and** H.264 in MP4. Both: many Safari versions lack AV1. |
| Budget | **Under 3 MB per file.** Above that it is slower than the still it replaces. |
| Audio | None. Strip the track — it is muted anyway and it is dead weight. |

```bash
# WebM / AV1
ffmpeg -i orbit.mov -c:v libsvtav1 -crf 34 -preset 6 -g 48 -an showroom-orbit.webm

# MP4 / H.264
ffmpeg -i orbit.mov -c:v libx264 -crf 26 -preset slow -pix_fmt yuv420p \
       -movflags +faststart -an showroom-orbit.mp4
```

`+faststart` is required, so playback begins before the file finishes downloading.

Upload both to your CDN. They must sit side by side and share a base name:

```
https://media.voltaris.rw/hero/showroom-orbit.webm
https://media.voltaris.rw/hero/showroom-orbit.mp4
```

### 3. Set one variable

In `.env.local` (or your host's environment settings), set the path **without the
extension** — the player appends `.webm` and `.mp4` itself and lets the browser
choose:

```
NEXT_PUBLIC_HERO_VIDEO_URL=https://media.voltaris.rw/hero/showroom-orbit
```

Then rebuild. `NEXT_PUBLIC_*` is compiled into the bundle, so a restart alone will
not pick it up:

```bash
npm run build && npm start
```

That is the whole switch. Leave it blank and the still is used alone — a complete
hero on its own. **There is no placeholder video**; an absent file would render a
black rectangle where the hero should be.

### Checking it worked

Open the homepage with devtools on the Network tab, filter to Media. You should
see one request for `showroom-orbit.webm` (or `.mp4` on Safari) firing *after*
the page has painted, not before. If nothing requests, one of the skip conditions
below is active.

---

## What the player already handles

The video is skipped entirely — not merely paused — when:

- no URL is configured
- the viewport is under 768px (a 3 MB download to fill a phone that already has a
  good still is not a trade worth making)
- `prefers-reduced-motion` is set (an orbiting camera is a vestibular trigger)
- the browser reports Save-Data, or a 2g/3g effective connection

It also **pauses once the hero scrolls out of view**, via an IntersectionObserver.
A looping video decoding behind three thousand pixels of content nobody can see is
pure battery drain.

Those last conditions matter more here than in most markets. A large share of
traffic will be Rwandan mobile, and the hero has to stay fast on it.

## Grading note

`HeroMedia` and `VoltarisEnvironment` apply the same cool-blue grade so the hero
and the rest of the page read as one room. Match the video's grade to the still,
or the cross-fade will visibly shift colour.
