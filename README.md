# Chrome URL Safety Check

What it does
- A simple Chrome extension that checks URLs and provides a tooltip/popup to indicate safety.

Key files
- `manifest.json`: extension metadata and permissions.
- `background.js`: background script handling checks and messaging.
- `content.js`: injected into pages to add tooltips or interact with page content.
- `popup.html` / `popup.js`: extension popup UI.

Developer install (Load unpacked)
1. Clone the repository and open the project folder:

```bash
git clone <your-repo-url>
cd chrome-url-safety-check
```

2. (Optional) Install dependencies for running tests or dev scripts:

```bash
npm install
```

3. Open Chrome and navigate to `chrome://extensions`.
4. Enable **Developer mode** (top-right).
5. Click **Load unpacked** and select the `chrome-url-safety-check/chrome-url-safety-check` folder.
6. The extension should load; open the popup or visit pages to test behavior.

Testing
- Run unit tests with:

```bash
npm test
```

Notes
- `node_modules/` is ignored by `.gitignore`. If you removed it earlier, restore with `npm install`.
- If you change `manifest.json`, reload the extension on `chrome://extensions`.
