// OWNER: Person A
const booking = { movie: null, showtime: null, tickets: null, seats: null, name: null };
const SLOTS = ["movie", "showtime", "tickets", "seats", "name"];
const AREA_REPLIES = ["Front", "Middle", "Back"];
let currentSlot = null;
let seatMap = null;

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
  name(t) {
    const cleaned = t.replace(/^(my name is|it's|it is|i'm|i am|this is|under)\s+/i, "").trim();
    return cleaned.length >= 1 && cleaned.length <= 40 && /[a-z]/i.test(cleaned) ? cleaned : null;
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
  } else if (slot === "seats") {
    say(`Tickets: ${booking.tickets}. Where would you like to sit? Pick seats on the map, tap an area below, or say seats like "C4 and C5".`, AREA_REPLIES);
    seatMap = renderSeatMap(booking.tickets, (seats) => {
      booking.seats = seats;
      addMessage("user", `Seats: ${seats.join(", ")}`);
      askNext();
    });
  } else if (slot === "name") {
    say("Almost done. What name should the booking be under?");
  }
}

function askNext() {
  const slot = nextEmptySlot();
  if (slot) { ask(slot); return; }
  // TODO Step 3: summary + confirmation
  say(`Thanks, ${booking.name}! ${booking.tickets} ticket(s) for ${booking.movie} at ${booking.showtime}, seats ${booking.seats.join(", ")}. (Confirmation coming in Step 3)`);
}

// ---- Seat input (typed or spoken) ----
function handleSeatsInput(text) {
  const lower = text.toLowerCase();

  // "yes" / "confirm" locks in whatever is highlighted
  if (/^(yes|yeah|yep|confirm|ok|okay|use these seats)\b/.test(lower)) {
    if (!seatMap.confirm()) say(`Please choose ${booking.tickets} seat(s) first.`, AREA_REPLIES);
    return;
  }

  // Area: highlight a suggestion, let the user confirm or change it
  const area = Object.keys(AREA_ROWS).find((a) => lower.includes(a));
  if (area) {
    const ids = suggestSeats(area, booking.tickets);
    if (!ids) { say(`Sorry, there aren't enough free seats in the ${area}. Try another area.`, AREA_REPLIES); return; }
    seatMap.set(ids);
    say(`I've highlighted ${ids.join(", ")} in the ${area}. Say "yes" or press "Use these seats" to confirm, or pick different seats.`, AREA_REPLIES);
    return;
  }

  // Specific seats: "C4 and C5"
  const ids = parseSeats(text);
  if (ids.length === 0) {
    say(`Sorry, I didn't catch that. Tap seats on the map, choose an area, or say seats like "C4 and C5".`, AREA_REPLIES);
    return;
  }
  const taken = ids.filter((id) => TAKEN_SEATS.includes(id));
  if (taken.length) {
    say(`${taken.join(", ")} ${taken.length > 1 ? "are" : "is"} already taken. Please pick other seats.`, AREA_REPLIES);
    return;
  }
  if (ids.length !== booking.tickets) {
    say(`You have ${booking.tickets} ticket(s) but gave ${ids.length} seat(s). Please choose exactly ${booking.tickets}.`, AREA_REPLIES);
    return;
  }
  seatMap.set(ids);
  say(`I've selected ${ids.join(", ")}. Say "yes" or press "Use these seats" to confirm.`, AREA_REPLIES);
}

// ---- Entry points ----
function startConversation() {
  SLOTS.forEach((s) => (booking[s] = null));
  seatMap = null;
  say("Hi! I can help you book movie tickets. Which movie would you like to see?", MOVIES.map((m) => m.title));
  currentSlot = "movie";
}

function handleUserInput(text, source) {
  addMessage("user", text);
  setAvatarState("thinking");
  setStatus("Thinking…");

  if (currentSlot === "seats") { handleSeatsInput(text); return; }

  const value = parsers[currentSlot](text);
  if (value === null) {
    say("Sorry, I didn't catch that. Please pick one of the options below or type your answer.");
    ask(currentSlot);
    return;
  }
  booking[currentSlot] = value;
  askNext();
}

function goBack() { /* TODO Step 6 */ }