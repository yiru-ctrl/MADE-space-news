# Made Space News

**A spatial news reader for Brown & RISD — built for collecting, connecting, and making sense of information.**

Made Space News is an experimental web app that reimagines the news feed as a personal knowledge space. Instead of treating articles as a disposable stream, the interface lets readers save pieces into boards, open those boards beside the feed, and arrange saved items on a canvas where relationships can be drawn visually.

The project began as a Figma-style prototype and was rebuilt as a working React/Vite application with responsive layouts, live RSS-backed content, board management, article detail views, and a draggable spatial canvas.

## Product idea

Most news products optimize for speed: scroll, skim, forget. Made Space explores a slower and more intentional model:

1. **Discover** relevant articles from a visual feed.
2. **Save** anything worth returning to.
3. **Organize** saved articles into boards.
4. **Connect** related ideas spatially.
5. **Return** to a personal context instead of starting from a blank feed every time.

The result sits somewhere between a news reader, a moodboard, and a lightweight research desk.

## Core experience

### Personalized feed

The main feed uses a Pinterest-style masonry layout with image-forward article cards, topic filters, search, and sort controls. Topics can be edited after onboarding, so the feed can shift with the reader’s interests.

### Boards as spaces

Saved articles live inside boards. A board can open in split view beside the feed, keeping discovery and organization in the same workspace. It can also expand into a fullscreen canvas for deeper arrangement.

### Canvas connections

Inside a board, articles become draggable nodes. Users can connect nodes with dashed lines to represent relationships, clusters, references, or personal meaning. Connections are intentionally lightweight: they are visual thinking aids rather than a rigid database model.

### Save from anywhere

Article cards, detail views, board cards, and selected text can all be saved into boards. Text selections are converted into clipping-style cards, making the app useful not only for articles but also for small fragments of thought.

### Article detail layer

Clicking an article opens a focused detail modal with the image, metadata, summary, breakdown-style sections, timeline-style notes, read-aloud controls, and board-saving actions.

## Interaction highlights

- Responsive split view between Discover and Board
- Fullscreen board mode for spatial organization
- Draggable article nodes with connection ports
- Dashed relationship lines between cards
- Global selected-text save toolbar
- Topic editing modal
- Board rename/delete/manage interactions
- Light and dark mode
- Subtle dot-grid background with pointer-responsive motion
- Unified highlight color system for hover and selected states

## Visual direction

Made Space uses a soft editorial interface language:

- light gray canvas background
- quiet dotted spatial grid
- rounded cards and pill controls
- black primary active states
- pale gray highlight states
- image-led article surfaces
- minimal, low-friction controls

The goal is to feel calmer than a typical news app and more spatial than a standard RSS reader.

## Technical stack

- **React** for interface composition
- **TypeScript** for app structure and safer state handling
- **Vite** for local development and production builds
- **Tailwind CSS** for styling and responsive layout
- **Lucide React** for interface icons
- **Local RSS source configuration** for live feed experiments

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
    editorial/
    onboarding/
  data/
    rssSources.ts
  imports/
  styles/
```

## Key files

- `src/app/App.tsx` — main app state, feed, boards, article modal, save flows
- `src/app/components/CanvasBoard.tsx` — spatial board canvas, dragging, zoom, connections
- `src/app/components/DotGridBackground.tsx` — animated dotted background layer
- `src/app/components/PolishedOnboarding.tsx` — onboarding and topic selection
- `src/data/rssSources.ts` — RSS source list

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

## Current status

This is a functional prototype. It demonstrates the core product model and interaction direction, but it is not yet a production news platform.

Current prototype capabilities include:

- working feed interface
- RSS-backed article loading
- topic filtering
- board creation and management
- article saving/removing
- split and fullscreen board views
- draggable canvas nodes
- manual visual connections
- article detail modal

## Future directions

- Persist boards, connections, and reading history to a backend
- Add authentication and multi-device sync
- Improve RSS parsing and source reliability
- Add semantic clustering or AI-assisted board organization
- Support annotations, quotes, and source excerpts
- Add shareable boards
- Improve keyboard accessibility across canvas interactions
- Add deployment pipeline and hosted preview

## Credits

Made Space News was created as an experimental interface prototype for spatial reading, personal curation, and Brown & RISD-oriented discovery.

Project contributors:

- **Yiru Chen** — project lead, product direction, interface design, and prototype development
- **Justin Le**
- **Shreshta Ranganathan**
- **Vanessa Y Wang**
- **Zhenyao Wang**
