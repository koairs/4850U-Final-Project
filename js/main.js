// OWNER: Person B – wires UI events to the contract functions
document.addEventListener("DOMContentLoaded", () => {
  initAvatar();

  $("btn-send").onclick = sendText;
  $("text-input").addEventListener("keydown", (e) => { if (e.key === "Enter") sendText(); });

  $("btn-mic").onclick = () => {
    startListening(
      (text) => { showHeard(text); handleUserInput(text, "voice"); },
      () => { addMessage("avatar", "Sorry, I couldn't hear that. You can try again or type your answer."); setStatus("Ready"); }
    );
  };

  $("btn-restart").onclick = () => { $("messages").innerHTML = ""; startConversation(); };
  $("btn-back").onclick = () => goBack();

  startConversation();
});

function sendText() {
  const v = $("text-input").value.trim();
  if (!v) return;
  $("text-input").value = "";
  showHeard("");
  handleUserInput(v, "text");
}
