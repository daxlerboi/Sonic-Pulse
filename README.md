# Sonic Pulse

[![TypeScript](https://img.shields.io/badge/TypeScript-used-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-used-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-used-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Web Audio API](https://img.shields.io/badge/Web_Audio_API-used-FF6A00)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![Browser](https://img.shields.io/badge/Browser-supported-0078D4)](https://www.google.com/chrome/)

Built by `daxler_boi`

Sonic Pulse is a browser-based audio analysis app that detects BPM and musical key from uploaded audio files.
It is built for producers, DJs, remix artists, and anyone who wants a fast local-style analysis workflow without opening heavy desktop software.

Live demo:
https://sonicpulse.daxlerboi.workers.dev/

## What It Does

- uploads and analyzes audio files in the browser
- detects BPM using `web-audio-beat-detector`
- detects musical key and scale with a custom chroma-based analyzer
- shows a waveform player for the loaded track
- keeps the interface clean, dark, and focused on the result
- supports common audio inputs such as `mp3`, `wav`, `flac`, and `m4a`

## How It Is Built

Sonic Pulse is a small React + Vite app with a lightweight audio-analysis pipeline.

The flow looks like this:

1. `UploadZone` accepts an audio file with `react-dropzone`.
2. `App.tsx` reads the file into an `AudioBuffer` using the Web Audio API.
3. BPM is detected with `web-audio-beat-detector`.
4. Musical key is detected in `src/lib/audioUtils.ts` using chroma-style analysis.
5. `WaveformDisplay` renders the waveform and playback controls with `wavesurfer.js`.
6. `motion` handles the animated transitions and polished UI movement.

The app is intentionally browser-first:
- no backend is required for the core analysis flow
- the analysis runs locally in the page
- the UI updates immediately when a track is loaded

## Code Walkthrough

The main logic lives in `src/App.tsx`.

- `handleFileSelect()` validates the file, decodes the audio, runs BPM and key detection, and stores the result.
- `reset()` clears the loaded track so a new file can be analyzed.
- The main layout switches between the upload screen and the analysis screen.
- The results panel shows BPM, key, scale, waveform, file name, and track metadata.

Supporting pieces:

- `src/components/UploadZone.tsx` handles drag-and-drop and click-to-upload.
- `src/components/WaveformDisplay.tsx` renders the waveform and playback controls.
- `src/lib/audioUtils.ts` performs the key-detection analysis.
- `src/lib/utils.ts` provides small utility helpers like `cn()`.

## Requirements

- Node.js
- npm
- a modern browser with Web Audio API support

## Install

From the project folder:

```bash
npm install
```

## Run

Start the development server:

```bash
npm run dev
```

Open the local Vite URL shown in the terminal, usually:

```text
http://localhost:3000
```

## Commands

### Development

```bash
npm run dev
```

### Production build

```bash
npm run build
```

### Preview the build

```bash
npm run preview
```

### Type check

```bash
npm run lint
```

## Output

The app does not generate files by default.
It analyzes the uploaded track in the browser and displays:

- BPM
- musical key
- scale
- waveform playback view
- file name and size metadata

## Notes

- Analysis happens in the browser, so performance depends on the device and the length of the audio file.
- The first file decode can take a moment on larger tracks.
- The current UI is intentionally dark and minimal, with the result cards keeping focus on the analysis.
- The project is still easy to extend with features like export, better confidence scoring, waveform annotations, or a library view.

## Author

Created and maintained by `daxler_boi`.
