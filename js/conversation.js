// OWNER: Person A
const booking = { movie: null, showtime: null, tickets: null, seats: null, name: null };
const SLOTS = ["movie", "showtime", "tickets"]; // we'll add seats + name in Step 2
let currentSlot = null;

function say(text, quickReplies = []) {
  addMessage("avatar", text, quickReplies);
  speak(text); // spoken response is always also visible text
}

function getMovie() { return MOVIES.find((m) => m.title === booking.movie); }
function nextEmptySlot() { return SLOTS.find((s) => !booking[s]); }

// ---- Parsers: return a valid value, or null if the text isn't usable ----
const NUMBER_WORDS = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8 };

const parsers = {
  movie(t) {
    t = t.toLowerCase();
    const m = MOVIES.find((x) => t.includes(x.title.toLowerCase().split(":")[0]));
    return m ? m.title : null;
  },
  showtime(t) {
    const digits = t.match(/\d{1,2}/);
    if (!digits) return null;
    return getMovie().showtimes.find((s) => parseInt(s) === parseInt(digits[0])) || null;
  },
  tickets(t) {
    const word = Object.keys(NUMBER_WORDS).find((w) => t.toLowerCase().includes(w));
    const n = word ? NUMBER_WORDS[word] : parseInt(t.match(/\d+/)?.[0]);
    return n >= 1 && n <= MAX_TICKETS ? n : null;
  },
};

// ---- Questions ----
function ask(slot) {
  currentSlot = slot;
  if (slot === "movie") {
    say("Which movie would you like to see?", MOVIES.map((m) => m.title));
  } else if (slot === "showtime") {
    say(`What time would you like to see ${booking.movie}?`, getMovie().showtimes);
  } else if (slot === "tickets") {
    say("How many tickets do you need?", ["1", "2", "3", "4"]);
  }
}

function askNext() {
  const slot = nextEmptySlot();
  if (slot) { ask(slot); return; }
  // TODO Step 2+: seats, name, summary
  say(`Got it: ${booking.tickets} ticket(s) for ${booking.movie} at ${booking.showtime}. (Seats coming in Step 2)`);
}

// ---- Entry points ----
function startConversation() {
  SLOTS.forEach((s) => (booking[s] = null));
  say("Hi! I can help you book movie tickets. Which movie would you like to see?", MOVIES.map((m) => m.title));
  currentSlot = "movie";
}

function handleUserInput(text, source) {
  addMessage("user", text);
  setAvatarState("thinking");
  setStatus("Thinking…");

  const value = parsers[currentSlot](text);
  if (value === null) {
    say("Sorry, I didn't catch that. Please pick one of the options below or type your answer.");
    ask(currentSlot); // re-ask with the quick replies
    return;
  }
  booking[currentSlot] = value;
  askNext();
}

function goBack() { /* TODO Step 6 */ }