#!/bin/bash

set -euo pipefail

echo "🚀 Deploying Nexus Studio PWA..."

mkdir -p nexus-deployment
cd nexus-deployment

cat > index.html << 'HTML'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nexus Studio</title>
    <link rel="manifest" href="/manifest.json">
    <style>
        body { margin: 0; padding: 0; background: #0a0a0f; color: white; }
        .loading { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; }
    </style>
</head>
<body>
    <div class="loading">Loading Nexus Studio...</div>
    <script>
        // The complete JavaScript from above goes here
    </script>
</body>
</html>
HTML

cat > manifest.json << 'MANIFEST'
{
  "name": "Nexus Studio",
  "short_name": "Nexus",
  "description": "Build apps instantly with AI",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0a0a0f",
  "theme_color": "#00f3ff",
  "icons": [
    {
      "src": "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f680.png",
      "sizes": "72x72",
      "type": "image/png"
    }
  ]
}
MANIFEST

cat > sw.js << 'SERVICE_WORKER'
// Service worker code from above
SERVICE_WORKER

cat > README.md << 'DOCS'
# Nexus Studio PWA - One-Click Deployment

## Deploy to:

### 1. Vercel (Easiest)
```bash
npm i -g vercel
vercel
```

### 2. Netlify
```bash
# Drag and drop this folder to netlify.com
```

### 3. GitHub Pages
```bash
git init
git add .
git commit -m "Deploy Nexus Studio"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/nexus-studio.git
git push -u origin main
# Enable GitHub Pages in repo settings
```

### 4. Static Hosting (S3, Cloudflare, etc.)
```bash
# Upload all files to any static host
```

## Features:
- ✅ Zero installation for users
- ✅ Works offline
- ✅ CLI widget (Docker-style)
- ✅ Drag & drop app builder
- ✅ Local storage (no data leaves browser)
- ✅ Installable PWA
- ✅ Responsive design

## Prefer classic terminals?
You can also run Nexus workflows from classic terminals like Git Bash or PowerShell by working directly in a folder and using the CLI-only flow (no Studio UI required).
DOCS

cat > package.json << 'PACKAGE'
{
  "name": "nexus-studio-pwa",
  "version": "1.0.0",
  "description": "Nexus Studio PWA",
  "scripts": {
    "start": "serve -s .",
    "build": "echo 'No build needed'"
  },
  "dependencies": {
    "serve": "^14.0.0"
  }
}
PACKAGE

echo "✅ Nexus Studio PWA created in: nexus-deployment/"
echo ""
echo "📁 Files created:"
echo "  - index.html          (Main PWA application)"
echo "  - manifest.json       (PWA manifest)"
echo "  - sw.js               (Service worker)"
echo "  - README.md           (Deployment instructions)"
echo "  - package.json        (For Vercel/Netlify)"
echo ""
echo "🚀 To deploy:"
echo "  1. cd nexus-deployment"
echo "  2. Deploy to your preferred hosting:"
echo "     - Vercel:    vercel"
echo "     - Netlify:   Drag folder to netlify.com"
echo "     - GitHub:    Push to repo, enable Pages"
echo ""
echo "🌐 Users can then visit: YOUR_URL.com"
echo "📱 It will prompt to install as PWA"
echo "💻 Works on desktop and mobile"
