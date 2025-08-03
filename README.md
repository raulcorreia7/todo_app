# Luxury Todo - Local Server Setup

A simple, no-frills local server for testing the Luxury Todo app with hot reload and mobile access support.

## Features

- 🔥 **Hot Reload**: Automatically refreshes the browser when files change
- 📱 **Mobile Access**: Access the app from your phone on the same network
- 🚀 **Minimal**: Uses `serve` - a lightweight, production-ready static server
- 🌐 **PWA Ready**: Proper headers for Progressive Web App functionality
- 🎯 **No Dependencies**: Just Node.js and npm

## Quick Start

### Automatic Setup (Recommended)

```bash
# Install dependencies and start server (one command)
npm start

# Or for development
npm run dev
```

### Manual Setup

```bash
# Install dependencies only
npm run setup

# Start server
npm start
```

## Access URLs

Once the server is running, you can access the app at:

- **Local**: http://localhost:8080
- **Network**: http://[your-computer-ip]:8080

### Finding Your IP Address

**Windows:**
1. Open Command Prompt
2. Run `ipconfig`
3. Look for "IPv4 Address" under your active network adapter

**macOS/Linux:**
1. Open Terminal
2. Run `ifconfig` or `ip addr`
3. Look for your local IP (usually starts with 192.168.x.x or 10.x.x.x)

## Mobile Access

1. Make sure your phone and computer are on the same WiFi network
2. Find your computer's local IP address (see above)
3. On your phone's browser, navigate to: `http://[your-computer-ip]:8080`
4. The app will work just like on your computer!

## Development Features

### Hot Reload
- The server automatically detects file changes
- Your browser will refresh when you save changes
- No manual refresh needed during development

### PWA Support
- Service worker registration
- Proper CORS headers
- Manifest file support
- Offline functionality ready

### File Structure
The server automatically serves all files from the current directory:
- `index.html` - Main app entry point
- `js/` - JavaScript files (including all app modules)
- `styles/` - CSS files (including all theme and component styles)
- `sounds/` - Audio files (for premium sound effects)
- `manifest.json` - PWA manifest
- Other files in the root directory

**How it works:**
- The `-s .` flag tells `serve` to use the current directory as the root
- All subdirectories (`js/`, `styles/`, `sounds/`) are automatically served
- URLs are mapped directly to file paths (e.g., `/js/app.js` serves `js/app.js`)
- No additional configuration needed for your file structure

## Troubleshooting

### Port Already in Use
If you get an error about port 8080 being in use:
1. Close any other programs using port 8080
2. Or change the port in `package.json` (look for `"8080"`)

### Mobile Connection Issues
1. Ensure both devices are on the same network
2. Check firewall settings on your computer
3. Try using the IP address instead of hostname

### File Not Found
- Make sure all files are in the correct directory
- Check file paths in your HTML/CSS/JS files
- The server serves files relative to its location

## Commands

```bash
# Install dependencies and start server (recommended)
npm start

# Install dependencies only
npm run setup

# Start server in development mode
npm run dev

# Stop server
Press Ctrl+C in the terminal
```

## Server Configuration

The server is configured with:
- **Port**: 8080
- **Host**: 0.0.0.0 (allows access from any device on the network)
- **Static Files**: Serves from current directory
- **Hot Reload**: Enabled for development

## License

MIT - Feel free to use this setup for any project!

---

**Happy coding! 🎉**