// OWNER: Kaira
const booking = { movie: null, showtime: null, tickets: null, seats: null, name: null };
const SLOTS = ["movie", "showtime", "tickets", "seats", "name"];
const SLOT_LABELS = { movie: "Movie", showtime: "Showtime", tickets: "Tickets", seats: "Seats", name: "Name" };
const AREA_REPLIES = ["Front", "Middle", "Back"];
// currentSlot is a slot name, or "confirm", "change", "done"
let currentSlot = null;
let seatMap = null;
let failCount = 0; // consecutive invalid answers for the current question

function say(text, quickReplies = []) {
  addMessage("avatar", text, quickReplies);
  speak(text); // spoken response is always also visible text
}

function getMovie() { return MOVIES.find((m) => m.title === booking.movie); }
function nextEmptySlot() { return SLOTS.find((s) => !booking[s]); }

// ---- Validators: return { ok: true, value } or { ok: false, msg } ----
const NUMBER_WORDS = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6,
  seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12,
};

// "seven" -> "7" so typed and spoken numbers look the same
function wordsToDigits(t) {
  return t.toLowerCase().replace(/\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)\b/g, (w) => NUMBER_WORDS[w]);
}

const validators = {
  movie(t) {
    const lower = t.toLowerCase();
    const m = MOVIES.find((x) => lower.includes(x.title.toLowerCase().split(":")[0]));
    if (m) return { ok: true, value: m.title };
    return { ok: false, msg: `I don't have that movie. Now showing: ${MOVIES.map((x) => x.title).join(", ")}.` };
  },

  showtime(t, movieTitle) {
    const movie = MOVIES.find((x) => x.title === (movieTitle || booking.movie));
    const times = movie.showtimes.join(", ");
    const m = wordsToDigits(t).match(/(\d{1,2})(?::(\d{2}))?\s*(a\.?m\.?|p\.?m\.?)?/i);
    if (!m) return { ok: false, msg: `Please choose a showtime for ${movie.title}: ${times}.` };

    const hour = parseInt(m[1]);
    const min = m[2];
    const ampm = m[3] ? (m[3][0].toLowerCase() === "p" ? "PM" : "AM") : null;

    const match = movie.showtimes.find((s) => {
      const [, h, mm, ap] = s.match(/(\d{1,2}):(\d{2}) (AM|PM)/);
      return parseInt(h) === hour && (!min || mm === min) && (!ampm || ap === ampm);
    });
    if (match) return { ok: true, value: match };

    const asked = `${hour}${min ? ":" + min : ""}${ampm ? " " + ampm : ""}`;
    return { ok: false, msg: `${movie.title} isn't showing at ${asked}. Available times: ${times}.` };
  },

  tickets(t) {
    const m = wordsToDigits(t).match(/\d+/);
    if (!m) return { ok: false, msg: "Please tell me how many tickets you need, for example 2." };
    const n = parseInt(m[0]);
    if (n < 1 || n > MAX_TICKETS) return { ok: false, msg: `I can book 1 to ${MAX_TICKETS} tickets at once.` };
    return { ok: true, value: n };
  },

  name(t) {
    const cleaned = t.replace(/^(my name is|it's|it is|i'm|i am|this is|under)\s+/i, "").trim();
    if (!/[a-z]/i.test(cleaned) || /\d/.test(cleaned) || cleaned.length > 40) {
      return { ok: false, msg: "Please enter a name using letters, up to 40 characters." };
    }
    return { ok: true, value: cleaned };
  },
};

// ---- Step 5: pull several answers out of one message ----
const NAME_STOP_WORDS = /\b(for|at|and|to|with|please|tonight|tomorrow|today)\b.*$/i;

function extractAll(text, slot) {
  const found = {};
  const errors = [];
  const t = wordsToDigits(text);

  if (slot !== "name") {
    const mv = validators.movie(text);
    if (mv.ok) found.movie = mv.value;
  }

  const tk = t.match(/(\d+)\s*(?:tickets?|seats?|people|persons?|adults?)/i) || t.match(/tickets?\s+for\s+(\d+)\b/i);
  if (tk) {
    const r = validators.tickets(tk[1]);
    if (r.ok) found.tickets = r.value; else errors.push(r.msg);
  }

  const movieTitle = found.movie || booking.movie;
  if (slot !== "name" && movieTitle) {
    const st = t.match(/\bat\s+(\d{1,2}(?::\d{2})?\s*(?:a\.?m\.?|p\.?m\.?)?)/i)
            || t.match(/\b(\d{1,2}(?::\d{2})?\s*(?:a\.?m\.?|p\.?m\.?))/i)
            || t.match(/\b(\d{1,2}:\d{2})\b/);
    if (st) {
      const r = validators.showtime(st[1], movieTitle);
      if (r.ok) found.showtime = r.value; else errors.push(r.msg);
    }
  }

  const nm = text.match(/(?:my name is|name is|under(?: the name)?)\s+([a-z][a-z'’ -]*)/i);
  if (nm) {
    const r = validators.name(nm[1].replace(NAME_STOP_WORDS, "").trim());
    if (r.ok) found.name = r.value;
  }

  return { found, errors };
}

function applyFound(found) {
  if (found.movie && found.movie !== booking.movie) { booking.movie = found.movie; booking.showtime = null; }
  if (found.showtime) booking.showtime = found.showtime;
  if (found.tickets) {
    if (found.tickets !== booking.tickets) booking.seats = null; // old seats no longer fit
    booking.tickets = found.tickets;
  }
  if (found.name) booking.name = found.name;
}

function describeFound(found) {
  const parts = [];
  if (found.movie) parts.push(found.movie);
  if (found.showtime) parts.push(found.showtime);
  if (found.tickets) parts.push(`${found.tickets} ticket${found.tickets > 1 ? "s" : ""}`);
  if (found.name) parts.push(`booking under ${found.name}`);
  return parts.join(", ");
}

// ---- Questions (prefix = optional sentence said before the question) ----
function ask(slot, prefix = "") {
  currentSlot = slot;
  const p = prefix ? prefix + " " : "";
  setProgress(SLOTS.indexOf(slot) + 1, SLOTS.length, SLOT_LABELS[slot]);

  if (slot === "movie") {
    say(p + "Which movie would you like to see?", MOVIES.map((m) => m.title));
  } else if (slot === "showtime") {
    say(p + `What time would you like to see ${booking.movie}?`, getMovie().showtimes);
  } else if (slot === "tickets") {
    say(p + "How many tickets do you need?", ["1", "2", "3", "4"]);
  } else if (slot === "seats") {
    say(p + `Tickets: ${booking.tickets}. Where would you like to sit? Pick seats on the map, tap an area below, or say seats like "C4 and C5".`, AREA_REPLIES);
    seatMap = renderSeatMap(booking.tickets, (seats) => {
      booking.seats = seats;
      addMessage("user", `Seats: ${seats.join(", ")}`);
      askNext();
    });
  } else if (slot === "name") {
    say(p + "Almost done. What name should the booking be under?");
  }
}

function askNext(prefix = "") {
  const slot = nextEmptySlot();
  if (slot) { ask(slot, prefix); return; }
  askConfirm(prefix);
}

// ---- Step 3: summary, confirmation, changes ----
function summaryText() {
  return `Please check your booking:\n` +
    `Movie: ${booking.movie}\n` +
    `Showtime: ${booking.showtime}\n` +
    `Tickets: ${booking.tickets}\n` +
    `Seats: ${booking.seats.join(", ")}\n` +
    `Name: ${booking.name}\n` +
    `Is everything correct?`;
}

function askConfirm(prefix = "") {
  currentSlot = "confirm";
  setProgress(SLOTS.length, SLOTS.length, "Confirm");
  say((prefix ? prefix + "\n" : "") + summaryText(), ["Yes, book it", "Change something"]);
}

function askWhatToChange(prefix = "") {
  currentSlot = "change";
  say((prefix ? prefix + " " : "") + "What would you like to change?", SLOTS.map((s) => SLOT_LABELS[s]));
}

function changeSlot(slot, prefix) {
  lockSeatMap();
  booking[slot] = null;
  if (slot === "movie") booking.showtime = null;  // showtimes depend on the movie
  if (slot === "tickets") booking.seats = null;   // seats depend on the ticket count
  askNext(prefix || `Okay, let's update the ${SLOT_LABELS[slot].toLowerCase()}.`);
}

// Which slot is the user talking about? ("change the seats", "Name", ...)
function findSlotMention(text) {
  const t = text.toLowerCase();
  if (/movie|film/.test(t)) return "movie";
  if (/time|show/.test(t)) return "showtime";
  if (/ticket|how many/.test(t)) return "tickets";
  if (/seat/.test(t)) return "seats";
  if (/name/.test(t)) return "name";
  return null;
}

function handleConfirm(text) {
  const t = text.toLowerCase().trim();
  if (/^(yes|yeah|yep|correct|confirm|looks good|that's right|that is right|ok|okay)\b/.test(t)) {
    finishBooking();
    return;
  }
  const slot = findSlotMention(t);
  if (slot) { changeSlot(slot); return; }
  if (/^(no|nope|nah|change|edit|wrong|incorrect)\b/.test(t)) { askWhatToChange(); return; }
  say("Sorry, I didn't catch that. Is the booking correct?", ["Yes, book it", "Change something"]);
}

function handleChange(text) {
  const slot = findSlotMention(text);
  if (slot) { changeSlot(slot); return; }
  askWhatToChange("Sorry, I didn't catch that.");
}

function finishBooking() {
  currentSlot = "done";
  const code = "RA-" + Math.random().toString(36).slice(2, 7).toUpperCase();
  setProgress(SLOTS.length, SLOTS.length, "Done");
  setAvatarState("idle");
  say(`Your booking is confirmed, ${booking.name}! ${booking.tickets} ticket(s) for ${booking.movie} at ${booking.showtime}, seats ${booking.seats.join(", ")}. Your booking code is ${code}. Enjoy the movie!`, ["Book another"]);
}

// ---- Seat input (typed or spoken) ----
function handleSeatsInput(text) {
  const lower = text.toLowerCase();

  if (/^(yes|yeah|yep|confirm|ok|okay|use these seats)\b/.test(lower)) {
    if (!seatMap.confirm()) say(`Please choose ${booking.tickets} seat(s) first.`, AREA_REPLIES);
    return;
  }

  const area = Object.keys(AREA_ROWS).find((a) => lower.includes(a));
  if (area) {
    const ids = suggestSeats(area, booking.tickets);
    if (!ids) { say(`Sorry, there aren't enough free seats in the ${area}. Try another area.`, AREA_REPLIES); return; }
    seatMap.set(ids);
    say(`I've highlighted ${ids.join(", ")} in the ${area}. Say "yes" or press "Use these seats" to confirm, or pick different seats.`, AREA_REPLIES);
    return;
  }

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

// ---- Step 6: corrections, back, restart ----
function lockSeatMap() {
  if (seatMap) { seatMap.lock(); seatMap = null; }
}

function currentReplies() {
  if (currentSlot === "movie") return MOVIES.map((m) => m.title);
  if (currentSlot === "showtime") return getMovie() ? getMovie().showtimes : [];
  if (currentSlot === "tickets") return ["1", "2", "3", "4"];
  if (currentSlot === "seats") return AREA_REPLIES;
  if (currentSlot === "confirm") return ["Yes, book it", "Change something"];
  if (currentSlot === "change") return SLOTS.map((s) => SLOT_LABELS[s]);
  return [];
}

function goBack() {
  if (currentSlot === "done") {
    say(`Your booking is complete. Press "Book another" to start a new one.`, ["Book another"]);
    return;
  }
  const last = [...SLOTS].reverse().find((s) => booking[s]);
  if (!last) { say("We're already at the first question.", currentReplies()); return; }
  changeSlot(last, "Going back.");
}

function restartConversation() {
  lockSeatMap();
  $("messages").innerHTML = "";
  startConversation();
}

const CORRECTION_CUE = /\b(actually|instead|change|changed my mind|make it|make that|switch|update|i meant|i mean|wait)\b/i;

// Returns true if the message was a correction (and has been handled)
function tryCorrection(text) {
  if (!CORRECTION_CUE.test(text)) return false;

  const { found, errors } = extractAll(text, currentSlot);

  if (!Object.keys(found).length && !errors.length) {
    let slot = findSlotMention(text);
    if (!slot && /\bmake (it|that)\b/i.test(text) && (booking.tickets || currentSlot === "tickets")) slot = "tickets";
    if (!slot) return false;

    if (slot === "seats") {
      if (currentSlot === "seats" || !booking.seats) return false;
      changeSlot("seats");
      return true;
    }
    if (!booking[slot] && currentSlot !== slot) return false;
    if (slot === "showtime" && !booking.movie) return false;

    const to = text.match(/\b(?:to|as|be|is)\s+(.+)$/i);
    let r = null;
    if (to) r = validators[slot](to[1]);
    else if (slot === "tickets" && /\d|\b(one|two|three|four|five|six|seven|eight)\b/i.test(text)) r = validators.tickets(text);

    if (!r) { changeSlot(slot); return true; }
    if (r.ok) found[slot] = r.value; else errors.push(r.msg);
  }

  if (!Object.keys(found).length) {
    say(errors.join(" ") + " Your booking hasn't changed.", currentReplies());
    return true;
  }

  const hadSeats = !!booking.seats;
  lockSeatMap();
  applyFound(found);
  const notes = [`Updated: ${describeFound(found)}.`];
  if (hadSeats && !booking.seats) notes.push("Your seats were cleared, so please choose them again.");
  askNext([...notes, ...errors].join(" "));
  return true;
}

// ---- Entry points ----
function startConversation() {
  SLOTS.forEach((s) => (booking[s] = null));
  seatMap = null;
  failCount = 0;
  ask("movie", `Hi! I can help you book movie tickets. You can say everything at once, like "2 tickets for Dune at 7".`);
}

function handleUserInput(text, source) {
  addMessage("user", text);
  setAvatarState("thinking");
  setStatus("Thinking…");

  const trimmed = text.trim();
  // "Back" alone is also an area button while choosing seats, so only treat it as "go back" elsewhere
  if (/^(go back|previous|undo)\b/i.test(trimmed) || (/^back[.!]?$/i.test(trimmed) && currentSlot !== "seats")) { goBack(); return; }
  if (/^(start over|restart|begin again|reset)[.!]?$/i.test(trimmed)) { restartConversation(); return; }
  if (currentSlot !== "done" && tryCorrection(text)) return;

  if (currentSlot === "seats") { handleSeatsInput(text); return; }
  if (currentSlot === "confirm") { handleConfirm(text); return; }
  if (currentSlot === "change") { handleChange(text); return; }
  if (currentSlot === "done") {
    if (/another|again|new/i.test(text)) restartConversation();
    else say("Your booking is complete. Press \"Book another\" to start a new one.", ["Book another"]);
    return;
  }

  const { found, errors } = extractAll(text, currentSlot);
  const keys = Object.keys(found);

  if (keys.length === 0 && errors.length === 0) {
    const result = validators[currentSlot](text);
    if (!result.ok) {
      failCount++;
      setAvatarState("error");
      const hint = failCount >= 2 ? " You can also tap one of the buttons." : "";
      ask(currentSlot, result.msg + hint);
      return;
    }
    failCount = 0;
    booking[currentSlot] = result.value;
    askNext();
    return;
  }

  applyFound(found);
  if (keys.length) failCount = 0; else failCount++;
  if (errors.length) setAvatarState("error");
  const ack = keys.length ? `Got it: ${describeFound(found)}.` : "";
  const hint = failCount >= 2 ? "You can also tap one of the buttons." : "";
  askNext([ack, ...errors, hint].filter(Boolean).join(" "));
}