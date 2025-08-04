# Luxury Todo - Local Server Setup

A simple, no-frills local server for testing the Luxury Todo app with hot reload and mobile access support.

## Features

- 🔥 **Hot Reload**: Automatically refreshes the browser when files change
- 📱 **Mobile Access**: Access the app from your phone on the same network
- 🚀 **Minimal**: Uses `serve` - a lightweight, production-ready static server
- 🌐 **PWA Ready**: Proper headers for Progressive Web App functionality
- 🎯 **No Dependencies**: Just Node.js and npm

## Quick Start

```bash
# Install dependencies and start server (recommended)
npm start

# Or for development
npm run dev
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

## Sound Files

The app uses the following sound files in the `sounds/` directory:

| Interaction | Filename |
|-------------|----------|
| Add Task | `add-task.mp3` |
| Complete Task | `complete-task.mp3` |
| Edit Task | `edit-task.mp3` |
| Delete Task | `delete-task.mp3` |
| Settings Open | `settings-open.mp3` |
| Palette Change | `palette-change.mp3` |
| Progress Open | `progress-open.mp3` |
| Victory | `victory.mp3` |
| Font Change | `font-change.mp3` |
| Volume Adjust | `volume-adjust.mp3` |
| Sound Toggle | `sound-toggle.mp3` |

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

## License

MIT - Feel free to use this setup for any project!

---

**Happy coding! 🎉**
