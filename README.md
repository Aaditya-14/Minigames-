# Mini Games

Small collection of HTML/JS mini-games bundled in subfolders. Each game is self-contained (HTML + JS + CSS + assets) and can be opened directly in a browser.

## Contents

- `index.html` - Main games hub (do not rename). Links to individual games.
- `guess the word/guess-the-word.html` - Morse/Crypto decode challenge
- `maths iq/maths-iq.html` - Math IQ Blitz (true/false)
- `print Fingerprint/print-fingerprint.html` - Fingerprint scanner memory game
- `seen unseen/seen-unseen.html` - Seen / Unseen word repeat challenge
- `sissor paper rock/rock-paper-scissors.html` - Rock Paper Scissors
- `tik tak/tic-tac-toe.html` - Tic Tac Toe
- `wordfalls/wordfalls.html` - Falling words game

Notes: For backwards-compatibility each game folder contains a small `index.html` that redirects to the new filename (so links to `.../index.html` still work).

## Run locally (Windows / PowerShell)

1. Open the project folder in File Explorer and double-click `index.html` to open the hub in your default browser.

OR start a simple local server (recommended) so that relative assets and audio load correctly:

PowerShell - built-in simple server (Python required):

```powershell
# from the project root (this folder)
python -m http.server 8000
# then open http://localhost:8000 in your browser
```

If you don't have Python, you can use other simple servers (Node's `http-server`, Live Server extension in VSCode, etc.).

## Quick links (from the project root URL)

- Hub: `index.html`
- Guess the Word: `guess the word/guess-the-word.html`
- Maths IQ: `maths iq/maths-iq.html`
- Print Fingerprint: `print Fingerprint/print-fingerprint.html`
- Seen Unseen: `seen unseen/seen-unseen.html`
- Rock Paper Scissors: `sissor paper rock/rock-paper-scissors.html`
- Tic Tac Toe: `tik tak/tic-tac-toe.html`
- Word Falls: `wordfalls/wordfalls.html`

## Development notes

- I kept the root `index.html` as the main hub. To make file names cleaner I created normalized filenames inside each game folder (e.g. `guess-the-word.html`) and updated the hub links.
- For safety, each original `index.html` inside game folders was replaced with a lightweight redirect to the new filename. If you prefer to remove the old `index.html` files entirely I can remove the redirects and leave only the new filenames.
- Folder names still contain spaces (e.g. `guess the word`) — this is fine locally but may require URL-encoding on some servers. If you want, I can rename folders to hyphenated names and update all links accordingly.

## Contributing / Changes

- To add a new game, create a new subfolder with the game's assets and an HTML entrypoint, update `index.html` to add a card/link for the game.
- If you change filenames, update hub links in `index.html`.

## Next steps (suggested)

- Optionally rename folders to remove spaces for cleaner URLs.
- Add build scripts or package.json if you want to run a local dev server with npm.
- Add a small test page to verify all games load their scripts and assets.

If you'd like any of those next steps, tell me which and I will implement them.
