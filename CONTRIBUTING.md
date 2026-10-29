# Contributing

Keep changes focused. NahaAdmin uses static HTML, Bootstrap 5, CSS, and jQuery;
do not add a framework or dependency for behavior the browser already provides.

## Editing

- Shared theme: `assets/styles/naha-admin.css`.
- Shared navigation and layout: `assets/scripts/naha-admin.js`.
- Page-only behavior and styles: the corresponding `pages/` directory.
- Examples: `demo/`. Guides: `docs/`. Landing page: `index.html` and `assets/styles/landing.css`.
- Do not edit third-party minified files to fix the theme. Add a scoped override instead.
- Keep asset URLs working. When consolidating demo pages, update every menu, link, and guide.
- Group related component variants in one destination rather than adding duplicate pages.

The historical `.min.css` and `.min.js` URLs are compatibility copies.
They intentionally remain uncompressed so no minifier dependency is required.
After editing a shared source file, copy its contents to the matching `.min` file.

## Browser review

Open `index.html` directly in your browser, then follow the demo and documentation links.
You can also open `demo/index.html` or `docs/index.html` directly. Keep the project folders together.
Some examples need an internet connection for CDN assets.

Check the landing page, default dashboard, starter, mini layout, auth forms, and changed guides:

- At desktop and mobile widths, no unintended horizontal scroll or overlapping navigation.
- Sidebar toggle, active links, nested menus, Escape on mobile, and desktop state after reload.
- Tab navigation, visible focus, skip link, and mini sidebar expansion with keyboard focus.
- Dropdowns, modals, form validation, and reduced-motion preference.
- Auth forms reject invalid input, password confirmation matches, and submit never sends credentials.
- Ctrl/Cmd-click, downloads, and browser back/forward keep native behavior.
- No missing local requests or new console errors.

For grouped chat examples, open `demo/apps-chat.html` and run this check in the browser console:

```js
console.assert(document.querySelectorAll('#messageInput').length === 1, 'Compact composer ID must be unique');
console.assert(document.querySelector('#chatForm input') !== document.querySelector('#messageForm input'), 'Composers must stay independent');
document.getElementById('conversationStyle').value = 'plain';
document.getElementById('conversationStyle').dispatchEvent(new Event('change'));
console.assert(document.getElementById('message').classList.contains('conversation-plain'), 'Plain style must apply');
```

## Design and content

Keep the shared soft light semantic tokens, Outfit typography, and local sample names. Use readable tables,
and status colors with a meaning. Avoid blanket hover movement, decorative gradients,
glow, and entry animations on every widget. Do not replace useful density with empty space.

Use specific labels and internally consistent sample data. State when functionality
requires a backend. Documentation must describe the code that ships, not planned features.

For bug reports, include the page URL, browser, viewport width, reproduction steps,
and a screenshot if the issue is visual. For code changes, list the checks run and
record user-visible changes under `Unreleased` in `CHANGELOG.md`.