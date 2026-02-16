# Luxury Todo

Premium todo app with gamification, themes, and AI features.

## Tech Stack

- **SolidJS** - Reactive UI framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **pnpm** - Package manager

## Prerequisites

- Node.js 20+
- pnpm

## Setup

```bash
pnpm install
cp .env.example .env
pnpm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the app.

## Available Scripts

| Command                  | Description              |
| ------------------------ | ------------------------ |
| `pnpm run dev`           | Start development server |
| `pnpm run build`         | Build for production     |
| `pnpm run preview`       | Preview production build |
| `pnpm run test`          | Run unit tests           |
| `pnpm run test:ui`       | Run tests with UI        |
| `pnpm run test:coverage` | Run tests with coverage  |
| `pnpm run test:e2e`      | Run end-to-end tests     |
| `pnpm run lint`          | Lint code                |
| `pnpm run lint:fix`      | Fix lint errors          |
| `pnpm run format`        | Format code              |
| `pnpm run format:check`  | Check formatting         |
| `pnpm run typecheck`     | Type check               |

## Project Structure

```
src/
├── components/       # UI components
│   ├── ai/          # AI-related components
│   ├── base/        # Base components (Button, Input, etc.)
│   ├── center-bar/  # Center action bar
│   ├── gamification/# Achievements, karma display
│   ├── layout/      # App layout components
│   ├── music/       # Music player
│   ├── settings/    # Settings panel
│   ├── statistics/  # Stats display
│   └── tasks/       # Task components
├── hooks/           # Custom Solid hooks
├── services/        # Business logic (AI, audio, storage)
├── stores/          # Solid stores for state management
├── styles/          # CSS styles and themes
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
└── assets/          # Static assets
tests/
├── setup.ts         # Test setup
└── unit/            # Unit tests
```

## Environment Variables

Create a `.env` file based on `.env.example`:

```env
VITE_LLM7_API_KEY=your_api_key_here
```

## Testing

```bash
pnpm run test           # Run unit tests
pnpm run test:coverage  # Run with coverage report
pnpm run test:e2e       # Run Playwright e2e tests
```

## Build

```bash
pnpm run build
```

Output goes to the `dist/` folder.

## License

MIT
