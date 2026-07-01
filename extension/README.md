# CodeOracle Browser Extension

Analyze any GitHub repository directly from GitHub.com with AI-powered code review.

## Installation

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (top right toggle)
3. Click "Load unpacked"
4. Select the `extension/` folder from this project

## Features

- Adds "Analyze with CodeOracle" button to GitHub repo pages
- One-click analysis — opens CodeOracle with the current repo pre-filled
- Popup shows quick info about the current repo

## How it works

When you visit a GitHub repository page (e.g., `github.com/facebook/react`), the extension automatically adds a purple "Analyze with CodeOracle" button to the repository navigation. Clicking it opens CodeOracle with the repository URL pre-filled and analysis ready to start.

## Files

- `manifest.json` — Extension configuration (Manifest V3)
- `content.js` — Injects the button on GitHub pages
- `content.css` — Button styling
- `popup.html/js` — Extension popup UI
- `background.js` — Service worker
