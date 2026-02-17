# Luxury Todo

Premium todo app with gamification, themes, and AI features.

## Structure

```
├── frontend/   # SolidJS app → Cloudflare Pages
├── backend/    # Hono API → VPS (Docker)
└── scripts/    # Deploy scripts
```

## Development

```bash
pnpm install
pnpm dev           # Frontend only
pnpm dev:backend   # Backend only
```

## Commands

| Command            | Description               |
| ------------------ | ------------------------- |
| `pnpm dev`         | Start frontend dev server |
| `pnpm dev:backend` | Start backend dev server  |
| `pnpm build`       | Build all                 |
| `pnpm check`       | Lint + typecheck + test   |

## Deployment

See [docs/deployment.md](docs/deployment.md)

### Frontend

Cloudflare Pages (auto-deploys from GitHub)

### Backend

```bash
VPS_HOST=your-vps-ip ./scripts/deploy-backend.sh
```

## License

MIT
