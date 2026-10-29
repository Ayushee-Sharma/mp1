# PWA implementation

This project’s frontend is a Progressive Web App (PWA): a website that can be
installed from a supported browser and can load its basic app shell again when
the network is unavailable. The PWA setup is in the Vite frontend; it does not
make the healthcare backend or its data available offline.

## What makes the frontend a PWA

### App identity and icon

The `vite-plugin-pwa` configuration in `frontend/vite.config.js` defines the
web app manifest. The manifest gives the browser the app’s name, short name,
description, colors, display mode, start page, and scope. It also points to the
locally hosted icon at `frontend/public/icons/reaching-the-unreached.svg`.

The `standalone` display setting asks the browser to open an installed app
without the usual browser tabs and address bar when the platform supports it.
The icon and manifest describe the app to the browser; they do not themselves
provide offline behavior.

### Service worker and cached files

At build time, Vite’s PWA plugin generates a service worker and a manifest for
the built frontend. The service worker precaches built JavaScript, CSS, HTML,
SVG, PNG, icon, and WOFF2 files that match the configured patterns. “Precache”
means the browser saves these frontend files so it can reuse them later without
fetching them from the server.

For page navigation, the worker can return the built `index.html` as a fallback.
This lets the single-page frontend start when the browser is offline. Requests
whose paths begin with `/api` are excluded from that fallback so an API request
is not mistakenly answered with the app’s HTML page.

This setup does **not** configure caching for API responses, accounts,
appointments, prescriptions, or other healthcare data. It also does not queue
changes made while offline to send later. The installed app may open offline,
but features that need current server data or save changes still need a working
connection to the backend.

### Registering the worker and applying updates

`ConnectionStatus` in `frontend/src/components/common/ConnectionStatus.jsx`
uses `useRegisterSW` from `vite-plugin-pwa` to register the generated service
worker and read its status. The component is included at the top level in
`frontend/src/App.jsx`, so the PWA status is available throughout the app.

The worker is configured with `registerType: 'prompt'`. When a new version is
available, the app displays an **Update app** button rather than applying the
update without asking. Choosing that button calls the plugin’s update function
and applies the new worker, which refreshes the app to use the updated files.
The component also displays **App shell ready for offline viewing** when the
plugin reports that the first offline-ready cache is in place.

### Install prompt

The same status component listens for the browser’s `beforeinstallprompt`
event. When a browser provides that event, the component saves it and shows an
**Install app** button. Clicking the button opens the browser’s installation
prompt. If the browser does not provide the event, this button is not shown;
some browsers may still offer an install option in their own menu.

Whether installation is offered depends on the browser and platform. Service
workers and installation generally require a secure context, such as HTTPS or
`localhost`.

## Connection status is separate from offline caching

The status bar also checks connectivity; this is useful feedback, but it does
not extend what the service worker caches. It uses the browser’s online/offline
events and requests `/api/health`. The health check runs when the component
starts, when the network state changes, when the page becomes visible, and
every 45 seconds. A slow response is labeled **Slow connection** based on
request time; it is not a measurement of cellular signal strength.

The status distinguishes a browser that is offline from a browser that is
online while the backend is unavailable. When offline, the interface explains
that login, appointment booking, prescription saving, and live data need a
connection. A previously loaded frontend shell can still be displayed, but
the status message does not mean server-dependent features are usable.

## How to test

1. Run a production build with `npm run build --prefix frontend`.
2. Serve the build with `npm run preview --prefix frontend -- --host 0.0.0.0`.
   Use the URL and port printed by Vite.
3. Open the app over HTTPS (for example, the forwarded HTTPS URL in
   Codespaces) or `localhost`. Service workers are not available on an
   ordinary, insecure HTTP site.
4. Load the app once so its frontend files can be cached. In browser developer
   tools, switch the network to offline and reload to check that the app shell
   starts. Then try server-dependent actions to confirm they still require the
   backend.
5. To test updates, publish or serve a new build and revisit the app. When the
   browser detects the new service worker, use **Update app** to apply it.

For the repository’s existing run commands and more connection guidance, see
the **PWA and Unstable Connections** section in `README.md`.
