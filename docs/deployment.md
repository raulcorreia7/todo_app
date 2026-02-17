# Deployment Guide

## Architecture Overview

```
[Browser]
    │
    ├── luxtodo.raulcorreia.dev ──► Cloudflare Pages (Frontend)
    │
    └── api.luxtodo.raulcorreia.dev ──► VPS (Backend API)
                                          │
                                          └──► OpenRouter API
```

## Prerequisites

- VPS with public IP (e.g., DigitalOcean, Hetzner, Linode)
- Domain managed in Cloudflare
- OpenRouter API key ([get one here](https://openrouter.ai/keys))

---

## 1. Cloudflare DNS Setup

### Frontend (Cloudflare Pages)

1. Push frontend to GitHub
2. In Cloudflare Dashboard: **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
3. Select repo, set:
   - **Build command:** `pnpm install && pnpm build`
   - **Build output directory:** `frontend/dist`
   - **Root directory:** `frontend`
4. Deploy
5. Go to **Settings** → **Custom Domains** → add `luxtodo.raulcorreia.dev`

### Backend API (VPS)

1. Go to **DNS** → **Records**
2. Add A record:

| Type | Name | Content                     | Proxy Status          | TTL  |
| ---- | ---- | --------------------------- | --------------------- | ---- |
| A    | api  | cerberus.raulcorreia.dev IP | DNS only (gray cloud) | Auto |

**Important notes:**

- **No port configuration in DNS** - DNS only maps domain → IP address, ports are not involved
- **Use DNS only (gray cloud)** - Orange cloud would proxy through Cloudflare and break SSL
- **Caddy handles ports** - Your VPS receives traffic on 80/443, Caddy proxies to API on 3000

**Traffic flow:**

```
Browser: https://api.luxtodo.raulcorreia.dev
    │
    ▼ (DNS A record → VPS IP)
VPS (cerberus.raulcorreia.dev):443
    │
    ▼ (Caddy receives HTTPS)
Caddy (port 443)
    │
    ▼ (reverse_proxy)
API (port 3000, internal only)
```

---

## 2. VPS Setup (cerberus.raulcorreia.dev)

**Architecture on VPS (all self-contained in Docker):**

```
cerberus.raulcorreia.dev (no system-level reverse proxy needed)
    │
    └── Docker Compose
            ├── api:3000     ← Hono backend (internal only, not exposed)
            └── caddy:80,443 ← Reverse proxy (public, handles SSL)
```

No Nginx, Traefik, or system-level Caddy needed. Docker Compose handles everything.

### Initial Setup (One-time)

```bash
# Copy backend files to VPS
scp -r backend/ cerberus.raulcorreia.dev:/opt/luxtodo/

# SSH in and create .env
ssh cerberus.raulcorreia.dev
cd /opt/luxtodo
cat > .env << 'EOF'
OPENROUTER_API_KEY=sk-or-v1-your-key-here
EOF

# Add email to Caddyfile for Let's Encrypt
nano Caddyfile
# Add: tls your-email@example.com

# Install Docker if needed
curl -fsSL https://get.docker.com | sh

# First deploy
docker compose up -d --build
```

### Deploy Updates

From project root:

```bash
VPS_HOST=cerberus.raulcorreia.dev ./scripts/deploy-backend.sh
```

This script:

1. Builds Docker image locally
2. Saves to tar.gz
3. Transfers to VPS
4. Loads image and restarts containers

### Verify

```bash
# Health check
curl https://api.luxtodo.raulcorreia.dev/health
# Expected: {"status":"ok"}
```

---

## 3. Firewall (UFW)

```bash
# Allow SSH, HTTP, HTTPS
ufw allow 22
ufw allow 80
ufw allow 443
ufw enable
```

---

## 4. Deploy Script

From project root:

```bash
# Basic
VPS_HOST=cerberus.raulcorreia.dev ./scripts/deploy-backend.sh

# With options
VPS_USER=myuser VPS_HOST=cerberus.raulcorreia.dev VPS_PATH=/opt/luxtodo ./scripts/deploy-backend.sh
```

---

## Troubleshooting

### SSL Certificate Issues

```bash
# Check Caddy logs
docker compose logs caddy

# Force certificate renewal
docker compose exec caddy caddy reload --config /etc/caddy/Caddyfile
```

### API Not Responding

```bash
# Check API container
docker compose logs api

# Test internal connection
docker compose exec caddy wget -qO- http://api:3000/health
```

### DNS Not Propagating

```bash
# Check DNS resolution
dig api.luxtodo.raulcorreia.dev
nslookup api.luxtodo.raulcorreia.dev
```

---

## Ports Reference

| Service     | Internal Port | External Port |
| ----------- | ------------- | ------------- |
| API (Hono)  | 3000          | - (via Caddy) |
| Caddy HTTP  | -             | 80            |
| Caddy HTTPS | -             | 443           |
