// OWNER: Person B – wires UI events to the contract functions
document.addEventListener("DOMContentLoaded", () => {
  initAvatar();

  $("btn-send").onclick = sendText;
  $("btn-back").onclick = goBack;
  $("text-input").addEventListener("keydown", (e) => { if (e.key === "Enter") sendText(); });

  $("btn-mic").onclick = () => {
    stopSpeaking();

    if ($("btn-mic").getAttribute("aria-pressed") === "true") {
      stopListening();
      setStatus("Ready");
      setAvatarState("idle");
      return;
    }

    startListening(
      (text) => { showHeard(text); handleUserInput(text, "voice"); },
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

$("btn-restart").onclick = () => restartConversation();
  startConversation();
});

function sendText() {
  const v = $("text-input").value.trim();
  if (!v) return;
  $("text-input").value = "";
  showHeard("");
  handleUserInput(v, "text");
}
