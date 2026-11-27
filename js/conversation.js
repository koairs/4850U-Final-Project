// OWNER: Person A
// CONTRACT:
//   startConversation()
//   handleUserInput(text, source)   source = "voice" | "text"
// Calls out to: addMessage, setAvatarState, setStatus, setProgress, showSummary, speak
const booking = { movie: null, showtime: null, tickets: null, seats: null, name: null };
const SLOTS = ["movie", "showtime", "tickets", "seats", "name"]; // order of questions
let confirming = false;

function say(text, quickReplies = []) {
  addMessage("avatar", text, quickReplies);
  speak(text); // spoken response is always also visible text
}

function startConversation() {
  SLOTS.forEach((s) => (booking[s] = null));
  confirming = false;
  say("Hi! I can help you book movie tickets. Which movie would you like to see?", MOVIES.map((m) => m.title));
}

function handleUserInput(text, source) {
  addMessage("user", text);
  setAvatarState("thinking");
  setStatus("Thinking…");
  // TODO (A):
  //  1. extract ANY slots from text (user may give several at once)
  //  2. detect corrections ("actually 3 tickets") -> overwrite slot, no restart
  //  3. invalid answer -> list the valid choices
  //  4. missing info -> ask for next empty slot
  //  5. all filled -> confirm summary, then finish
  say("(stub) I heard: " + text);
}

function goBack() { /* TODO (A): clear last filled slot and re-ask it */ }
function nextEmptySlot() { return SLOTS.find((s) => !booking[s]); }
