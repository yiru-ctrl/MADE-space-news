# Made Space News

Made Space News is a visual news-reading and curation prototype for Brown & RISD. It combines a Pinterest-style feed, topic personalization, board-based saving, and a spatial canvas for connecting saved articles.

The project was rebuilt from a Figma-style prototype into a working React/Vite web app.

## What it does

- Personalized news feed with topic filters and live RSS-backed sources
- Pinterest-style article cards with rich imagery and save controls
- Topic editing flow for adding/removing interests
- Board system for saving articles into collections
- Split-view board workspace for browsing and organizing at the same time
- Fullscreen canvas mode with draggable cards and dashed article connections
- Article detail modal with summaries, breakdown-style content, and save actions
- Global “save selected text to board” toolbar
- Light/dark mode support

## Tech stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Lucide icons

## Running locally

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

The production build is generated in `dist/`.

## Project structure

```text
src/
  app/
    App.tsx
    components/
      CanvasBoard.tsx
      DotGridBackground.tsx
      PolishedOnboarding.tsx
  assets/
  data/
    rssSources.ts
  imports/
  styles/
```

## Notes

This is a prototype-oriented rebuild. Some article data, editorial imagery, and board examples are included to demonstrate the interaction model and visual direction.
