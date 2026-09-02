# Project media

Drop your screenshots and screen recordings in here. No code change is needed.
Anything missing shows a tidy, clearly marked placeholder that names the exact
file it is waiting for, so the page never shows a broken image.

## Where the files go

One folder per project, under `client/public/media/projects/`:

| Project            | Folder                                    |
| ------------------ | ----------------------------------------- |
| Onishi             | `client/public/media/projects/onishi/`            |
| The Method Chat    | `client/public/media/projects/method-chat/`       |
| Orbit              | `client/public/media/projects/orbit/`             |
| The Last Human Job | `client/public/media/projects/last-human-job/`    |

## What to name them

Inside each project folder, exactly these names:

| File           | Required | What it is                                                     |
| -------------- | -------- | -------------------------------------------------------------- |
| `preview.mp4`  | optional | Looping muted screen recording. The main preview on the card.    |
| `preview.webm` | optional | Smaller companion to the mp4. Used first when both are present.  |
| `poster.jpg`   | optional | Still frame shown at rest. Falls back to `shot-1.jpg`.           |
| `shot-1.jpg`   | yes      | Gallery screenshot 1                                             |
| `shot-2.jpg`   | yes      | Gallery screenshot 2                                             |
| `shot-3.jpg`   | yes      | Gallery screenshot 3                                             |
| `shot-4.jpg`   | optional | Gallery screenshot 4                                             |
| `shot-5.jpg`   | optional | Gallery screenshot 5                                             |
| `shot-6.jpg`   | optional | Gallery screenshot 6                                             |

Three screenshots are the minimum. Slots up to `shot-6.jpg` are already wired
up, so a fourth, fifth or sixth appears the moment you add the file.

The extension matters. Screenshots must be `.jpg`, not `.jpeg` or `.png`.

## What good files look like

Screenshots: about 1600px wide, JPEG, quality around 80, under 400KB each.
They are cropped to the top of the image on the cards, so put the interesting
part near the top of the shot.

Recordings: 10 to 20 seconds, silent, looping cleanly from end back to start.
About 1280px wide, H.264 in an `.mp4`, under about 3MB. Trim any dead time at
the start. There is no audio track, so do not rely on sound.

To make the smaller `.webm` companion from an `.mp4`, with ffmpeg:

    ffmpeg -i preview.mp4 -c:v libvpx-vp9 -crf 34 -b:v 0 -an preview.webm

To pull a poster frame out of a recording, again with ffmpeg:

    ffmpeg -i preview.mp4 -ss 00:00:01 -frames:v 1 -q:v 3 poster.jpg

## How it behaves on the page

- The recording is the main card preview. On desktop it plays on hover and
  rewinds when the pointer leaves. On a phone it rests on the poster frame and
  plays when you tap the play control.
- Video never autoplays on mobile data, on a metered or slow connection, or
  when the visitor has data saver or reduced motion turned on. It waits for a tap.
- Everything is lazy: the video element is only created as the card comes near
  the viewport, images use native lazy loading, and playback stops when the card
  scrolls away.
- Gallery screenshots open larger on click, on both mobile and desktop. Escape
  or a click outside closes them.

## Captions

Captions are set per slot in `client/src/lib/project-media.ts`, under
`SHOT_LABELS`. Extra slots with no caption fall back to "Screen 4", "Screen 5"
and so on, so you never have to edit the file just to add a screenshot.
