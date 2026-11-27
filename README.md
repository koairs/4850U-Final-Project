# Reel Assistant – Voice/Text Movie Booking Avatar (SOFE4850)

Run: `python3 -m http.server 8000` then open http://localhost:8000 in **Chrome/Edge** (needed for voice).

## Ownership
| File | Owner |
|---|---|
| js/conversation.js, data/movies.js | Kaira (A) |
| js/voice.js, js/ui.js, js/main.js, index.html, css/styles.css | Colton (B) |
| js/avatar.js (+ avatar section of styles.css) | Pedro (C) |

## Contract (do not change signatures without telling the others)
- `setAvatarState("idle"|"listening"|"thinking"|"speaking"|"error")`
- `handleUserInput(text, source)` – source is "voice" or "text"
- `speak(text, onEnd?)`, `startListening(onResult, onError?)`, `stopListening()`
- `addMessage(sender, text, quickReplies?)`, `setStatus`, `showHeard`, `setProgress`, `showSummary`

## Required test cases
Normal completion · Missing info · Invalid answer · Correction · Voice recognition problem · Final confirmation
