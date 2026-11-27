// OWNER: Person B
// CONTRACT:
//   addMessage(sender, text, quickReplies?)   sender = "avatar" | "user"
//   setStatus(text)                           e.g. "Listening…"
//   showHeard(text)                           "I heard: ..." (pass "" to hide)
//   setProgress(stepIndex, totalSteps, label)
//   showSummary(booking)                      final confirmation view
const $ = (id) => document.getElementById(id);

function addMessage(sender, text, quickReplies = []) {
  const div = document.createElement("div");
  div.className = `msg ${sender}`;
  div.textContent = text;
  $("messages").appendChild(div);
  $("messages").scrollTop = $("messages").scrollHeight;

  const qr = $("quick-replies");
  qr.innerHTML = "";
  quickReplies.forEach((label) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = label;
    b.onclick = () => handleUserInput(label, "text");
    qr.appendChild(b);
  });
}

function setStatus(text) { $("status").textContent = text; }

function showHeard(text) {
  const el = $("heard");
  el.hidden = !text;
  el.replaceChildren();

  if (!text) return;

  const heardText = document.createElement("span");
  heardText.textContent = `I heard: "${text}"`;
  const retry = document.createElement("button");
  retry.type = "button";
  retry.className = "heard-retry";
  retry.textContent = "Retry";
  retry.onclick = () => {
    startListening(
      (result) => { showHeard(result); handleUserInput(result, "voice"); },
      (code) => {
        setAvatarState("error");
        const message = code === "no-speech"
          ? "I didn't hear anything. You can try again or type your answer."
          : "Sorry, I couldn't hear that. You can try again or type your answer.";
        addMessage("avatar", message);
        setStatus("Ready");
      }
    );
  };

  el.append(heardText, retry);
}

function setProgress(step, total, label) {
  $("progress").textContent = `Step ${step} of ${total}: ${label}`;
}

function showSummary(booking) {
  const card = document.createElement("section");
  card.className = "booking-summary";
  card.setAttribute("aria-label", "Booking summary");

  const title = document.createElement("h3");
  title.textContent = "Your booking";

  const rows = [
    ["Movie", booking.movie],
    ["Date", booking.date ? new Date(`${booking.date}T00:00:00`).toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" }) : ""],
    ["Showtime", booking.showtime],
    ["Tickets", booking.tickets],
    ["Seats", booking.seats ? booking.seats.join(", ") : ""],
    ["Name", booking.name],
  ];

  card.appendChild(title);
  rows.forEach(([label, value]) => {
    const row = document.createElement("div");
    row.className = "summary-row";
    const key = document.createElement("span");
    key.textContent = label;
    const val = document.createElement("strong");
    val.textContent = value;
    row.append(key, val);
    card.appendChild(row);
  });

  $("messages").appendChild(card);
  $("messages").scrollTop = $("messages").scrollHeight;
}
