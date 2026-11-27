# Reel Assistant – Voice/Text Movie Booking Avatar (SOFE4850)


## Avatar preview (Person C)
Open http://localhost:8000/avatar-preview.html to switch between all five avatar states without using the microphone or booking flow. The checkbox previews the static expressions; the system's reduced-motion preference is also respected.

The SVG cinema robot uses CSS animations with no additional libraries. `initAvatar()` renders it inside `#avatar`; `setAvatarState("idle"|"listening"|"thinking"|"speaking"|"error")` updates its expression and accessible label. Invalid states are ignored. The conversation and voice modules remain responsible for state transitions and the visible status text. Speaking animates the mouth as an activity indicator, not lip synchronization.

Run: open the folder in the terminal, run "py -m http.server 8000" then open "http://localhost:8000" in **chrome/edge**

The booking flow collects a date (today, tomorrow, or a future date) and includes it in the final confirmation. This demo uses the same movie showtimes for every selected date.

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
