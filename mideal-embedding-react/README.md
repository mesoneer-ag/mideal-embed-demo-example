# mideal-embedding-react

This sample demonstrates embedding m_IDeal inside a React app using a plain iframe and the window.postMessage API (no @mesoneer-ag/mideal-embed dependency).

How it works:
- The app renders an iframe pointing to the start URL returned by the public m_IDeal API.
- The parent window listens to message events and, if the origin matches allowed domains, parses the payload and displays the identification result.

## Run locally
1. cd mideal-embedding-react
2. npm install
3. npm start
4. Open http://localhost:3000

## Provide the start URL
- Paste the start URL (e.g. https://ubiid.ubitec.io/scan/start?tenantid=...&language=de) in the input field at the top of the page.
- Alternatively, pass it via query string: http://localhost:3000?startUrl=https://ubiid.ubitec.io/scan/start?tenantid=...

## What you’ll see
- The embedded m_IDeal flow inside the iframe (camera/microphone allowed).
- A “Received message (parsed)” panel showing scanResult, statusReason, statusDetails, signingResult, signingErrors, and date/time.
- A “Raw message payload” panel with the exact message received.
- A “Debug logs” panel logging received/ignored messages and any parsing errors.

## Origin filtering
The listener accepts events only when the event.origin includes one of the allowed domains:
- ubiid.ch
- id-validation.ch
- ubiid.ubitec.io
Additionally, if you provide a start URL, its hostname is also allowed dynamically.

## Troubleshooting
- If you don’t see messages, confirm that the embedded app calls window.parent.postMessage(JSON.stringify(payload), '*').
- Verify the event.origin in the Debug logs panel; if it’s different from the allowed list, update the domain in App.tsx accordingly.
- Ensure the start URL is correct and loads within the iframe; console logs can provide further hints.
