# Repository Guidelines

## Project Structure & Module Organization
`main.js` owns the Electron app lifecycle, window creation, dialogs, packaging behavior, and desktop widget coordination. `preload.js` is the only bridge between Electron/Node APIs and the renderer. Keep browser-facing UI code inside `src/`: `index.html`, `renderer.js`, and `styles.css` drive the main scoring window, while `widget.html`, `widget.js`, and `widget.css` implement the floating desktop widget. `dist/` and `node_modules/` are generated output; do not edit them directly.

## Build, Test, and Development Commands
Use `npm start` or `npm run dev` to launch the app locally in Electron. Run `npm run pack` to create an unpacked build for manual verification. Run `npm run dist` to produce the Windows installer and portable `.exe` under `dist/`. Before packaging, run syntax checks:

```powershell
node --check main.js
node --check preload.js
node --check src/renderer.js
node --check src/widget.js
```

## Coding Style & Naming Conventions
Use 2-space indentation in JavaScript, HTML, and CSS. Prefer descriptive `camelCase` for JavaScript identifiers, such as `loadStudentList` or `updateCountdownState`. Follow existing HTML/CSS naming patterns with readable kebab-case classes and ids. Keep all user-facing text in Simplified Chinese. Do not call Electron or filesystem APIs directly from renderer files; expose them through `preload.js` and IPC instead.

## Testing Guidelines
This repository does not yet include an automated test suite or coverage gate, so every change needs manual smoke testing. Verify the main scoring window and the floating widget on each UI or state-management change. For import, scoring, or timing work, test one real spreadsheet import plus one full add-score, deduct-score, countdown, and stopwatch flow before shipping.

## Commit & Pull Request Guidelines
Local git history is not available in this environment, so use short imperative commits with a type prefix, for example `feat: add draggable widget bounds` or `fix: preserve score rules on reload`. Keep each commit focused on one concern. Pull requests should include a short summary, affected files or screens, manual test steps, packaging impact if `main.js`, `preload.js`, or `package.json` changed, and screenshots or GIFs for visible UI updates.
