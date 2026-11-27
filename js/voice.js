// OWNER: Person B  (Web Speech API – use Chrome/Edge, localhost or HTTPS)
// CONTRACT:
//   speak(text, onEnd?)
//   startListening(onResult, onError?)   onResult(text)  onError(code)
//   stopListening()
const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
const voiceSupported = !!SpeechRec;

function speak(text, onEnd) {
  if (!("speechSynthesis" in window)) { onEnd && onEnd(); return; }
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.onstart = () => { setAvatarState("speaking"); setStatus("Speaking…"); };
  u.onend = () => { setAvatarState("idle"); setStatus("Ready"); onEnd && onEnd(); };
  speechSynthesis.speak(u);
}

function startListening(onResult, onError) {
  if (!voiceSupported) { onError && onError("unsupported"); return; }
  recognition = new SpeechRec();
  recognition.lang = "en-CA";
  recognition.interimResults = false;
  recognition.onstart = () => { setAvatarState("listening"); setStatus("Listening…"); };
  recognition.onresult = (e) => onResult(e.results[0][0].transcript);
  recognition.onerror = (e) => { setAvatarState("error"); onError && onError(e.error); };
  recognition.onend = () => {
    if (document.getElementById("avatar").dataset.state === "listening") { setAvatarState("idle"); setStatus("Ready"); }
  };
  recognition.start();
  // TODO (B): timeout for silence -> onError("no-speech")
}

function stopListening() { recognition && recognition.stop(); }
