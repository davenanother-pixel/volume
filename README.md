# Lower Volume — GitHub Pages demo

This repository contains a small webpage that demonstrates controlling the volume of all `<audio>` and `<video>` elements on a page.

## Features
- Global slider to set volume (0–100%).
- Quick buttons: lower/raise by 10%, mute, restore.
- Fade buttons that reduce volume smoothly over a chosen number of seconds.
- Keyboard shortcuts: `Ctrl + ArrowDown` (lower 10%), `Ctrl + ArrowUp` (raise 10%).
- Bookmarklet snippet to run similar logic on other pages (replace `LOC` with the hosted URL of `script.js`).

## How to use on GitHub Pages
1. Create a new repository on GitHub and push the files in this repo (`index.html`, `style.css`, `script.js`, `README.md`, `LICENSE`).
2. In the repository settings → Pages, set the site source to the `main` (or `gh-pages`) branch and root folder.
3. Wait a minute and visit `https://<your-username>.github.io/<repo-name>/`.

## Bookmarklet
The page displays a bookmarklet snippet you can use to inject `script.js` into other pages. Edit the snippet to point `LOC` at the raw URL of your hosted `script.js`, e.g.:

