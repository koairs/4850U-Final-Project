# Reel Assistant: Voice & Text Movie Booking Avatar

**SOFE 4850U Final Project.** A browser-based conversational assistant ("Bob the Ticket Master") that books movie tickets through speech or typed text. An animated cinema-robot avatar reacts to the conversation as it listens, thinks, speaks and handles errors.

No frameworks, build step or backend: just HTML, CSS and vanilla JavaScript using the browser's Web Speech API.

---

## Quick start

1. Open a terminal in the project folder.
2. Start a local server:
   ```bash
   py -m http.server 8000        # Windows
   python3 -m http.server 8000   # macOS / Linux
   ```
3. Open **http://localhost:8000** in **Chrome or Edge**.

> Voice input requires Chrome or Edge, served from `localhost` or HTTPS. Opening `index.html` directly as a file will not enable the microphone. Text input works in any modern browser.

**Avatar preview:** open http://localhost:8000/avatar-preview.html to cycle through all five avatar states without using the microphone or the booking flow.

---

## Features

- **Voice or text, interchangeably.** Speak with the 🎤 button or type; every spoken reply is also shown as text.
- **Say it all at once.** "2 tickets for Dune on November 28 at 7" fills four fields in one message.
- **Flexible input.** Understands number words ("seven"), dates like *today*, *tomorrow*, *Nov 28th*, *11/28* or *2026-11-28*, and times like *7*, *7pm* or *7:00 PM*.
- **Corrections mid-conversation.** "Actually, make it 3 tickets", "change my name to Sam", "wait, I meant 9:45".
- **Interactive seat map.** Tap seats, pick an area (Front / Middle / Back), or say seats like "C4 and C5".
- **Confirmation before booking.** A full summary with the option to change any field, then a booking code.
- **Navigation.** "Back" / "undo" returns to the previous question; "start over" restarts.
- **Error recovery.** Clear messages for invalid answers, a hint to use buttons after repeated failures, and a timeout if no speech is heard.
- **Accessible.** ARIA live regions for status and messages, labelled controls, and support for reduced-motion preferences.

---

## Booking flow

The assistant collects six pieces of information in order, skipping any already provided:

| # | Slot | Example answers |
|---|------|-----------------|
| 1 | Movie | "Dune", "Robot Bakery" |
| 2 | Date | "today", "tomorrow", "November 28" |
| 3 | Showtime | "7", "9:45 pm" |
| 4 | Tickets | "2", "four" (1–8) |
| 5 | Seats | seat map, "middle", "C4 and C5" |
| 6 | Name | "My name is Alex" |

It then shows a summary for confirmation. On "yes" it issues a booking code (e.g. `RA-X7K2P`).

> This demo uses the same showtimes for every date. Movies, showtimes and taken seats are defined in `data/movies.js`.

---

## Project structure

```
├── index.html             # Page layout and script load order
├── avatar-preview.html    # Standalone avatar state preview
├── css/styles.css         # All styling, including avatar animations
├── data/movies.js         # Movies, showtimes, seat layout, taken seats
└── js/
    ├── main.js            # Wires buttons and input to the modules below
    ├── conversation.js    # Dialogue manager: parsing, validation, flow control
    ├── seatmap.js         # Seat map rendering, seat suggestions, seat parsing
    ├── voice.js           # Speech recognition and speech synthesis
    ├── ui.js              # Chat messages, quick replies, progress, summary
    └── avatar.js          # SVG robot avatar and its states
```

Scripts are plain globals loaded in a fixed order in `index.html` (**data → avatar → ui → seatmap → voice → conversation → main**). Keep that order when adding files.

### How the conversation works

`conversation.js` uses **slot filling**. A `booking` object holds the six slots, and after every message the assistant asks about the first one that's still empty. This lets users answer out of order, give several answers at once, or correct earlier answers.

Each message passes through `handleUserInput()`, which checks in order for:

1. Navigation commands (back / restart)
2. Corrections (cue words like *actually*, *instead*, *change*, *make it*)
3. State-specific handlers (seats, confirmation, change menu, done)
4. Multi-slot extraction (`extractAll`), falling back to the current slot's validator

Dependent fields are cleared automatically: changing the movie clears the showtime, and changing the ticket count clears the seats.

---

## Module contract

These functions are shared between modules. **Do not change signatures without telling the rest of the team.**

| Module | Function | Notes |
|---|---|---|
| avatar | `setAvatarState(state)` | `"idle"`, `"listening"`, `"thinking"`, `"speaking"`, `"error"`; invalid states are ignored |
| conversation | `handleUserInput(text, source)` | `source` is `"voice"` or `"text"` |
| voice | `speak(text, onEnd?)` | |
| voice | `startListening(onResult, onError?)` / `stopListening()` | `onError(code)`, e.g. `"no-speech"` |
| ui | `addMessage(sender, text, quickReplies?)` | `sender` is `"avatar"` or `"user"` |
| ui | `setStatus(text)`, `showHeard(text)`, `setProgress(step, total, label)`, `showSummary(booking)` | |

The avatar's mouth animation while speaking is an activity indicator, not lip sync.

---

## Required test cases

| Case | Example to try |
|---|---|
| **Normal completion** | Answer each question in turn → confirm with "yes" |
| **Missing info** | "2 tickets for Dune" → assistant asks for the remaining fields |
| **Invalid answer** | "Titanic", "30 tickets", "February 30", a past date, or "Dune at 2pm" |
| **Correction** | At any point: "actually make it 3 tickets" or "change the movie to Robot Bakery" |
| **Voice recognition problem** | Press 🎤 and stay silent for 8 seconds, or deny microphone access |
| **Final confirmation** | At the summary, say "change the seats", then confirm |

---

## Team

| Member | Responsibilities | Files |
|---|---|---|
| **Kaira** (A) | Dialogue logic, data, seat map | `js/conversation.js`, `js/seatmap.js`, `data/movies.js` |
| **Colton** (B) | UI, voice, page structure | `js/voice.js`, `js/ui.js`, `js/main.js`, `index.html`, `css/styles.css` |
| **Pedro** (C) | Avatar | `js/avatar.js`, avatar section of `css/styles.css`, `avatar-preview.html` |

---

## Known limitations

- Demo data only: there's no backend, payment or persistence, and seats aren't actually reserved.
- A date without a year assumes the current year, so dates in early next year may be rejected as already passed.
- Showtimes that have already passed today are not filtered out.
- Speech recognition is set to `en-CA` and depends on browser support.
