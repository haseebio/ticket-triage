# Theme: Coral/Cream rebrand

## What changed
Replaced the original ink/amber console palette with the brand spec: coral primary,
warm yellow secondary, white/cream/beige surface hierarchy, charcoal/gray text.

- **Sidebar** rebuilt from a dark panel to a light glass panel (`rgba(255,255,255,0.65)`
  + `backdrop-blur(20px)`) over a very faint coral/yellow gradient wash on the page
  background — otherwise the blur has nothing to blur.
- **Wordmark** uses the hover gradient as a text-clip gradient (coral → yellow) as the
  one deliberate brand moment, rather than spreading the gradient across many elements.
- **Primary buttons** (Sign in, Submit ticket) sit on flat coral and swap to the gradient
  on hover.
- **Status colors**: open = coral, in progress = yellow, resolved/failed reuse a green
  and a red that aren't in the brand spec — the spec only defines brand colors, not
  status semantics, and a triage dashboard needs those to stay legible. Flagging this
  rather than quietly inventing colors without saying so.

## Known gap
Your standing defaults call for dark mode as a first-class second mode from the start.
This rebuild is light-mode only — the brand spec you gave was light values, and building
a full dark variant wasn't part of what was asked. Tokens are structured (semantic layer
in `tokens.json`) so dark values can be slotted in later without touching component code,
but they aren't populated yet. Say the word if you want that filled in.

## Files touched
`tailwind.config.js`, `app/globals.css`, `components/Sidebar.jsx`, `StatusBadge.jsx`,
`TicketRow.jsx` — all other components already used semantic class names (`text-ink`,
`text-fog`, `border-line`, etc.) so they inherited the new palette automatically.
