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
  el.textContent = text ? `I heard: "${text}"` : "";
  // TODO (B): add "Retry" button next to heard text
}

function setProgress(step, total, label) {
  $("progress").textContent = `Step ${step} of ${total}: ${label}`;
}

function showSummary(booking) {
  // TODO (B): styled confirmation card (movie, time, tickets, seats, name)
  console.log("SUMMARY", booking);
}
