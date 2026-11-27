// OWNER: Person B  (Web Speech API – use Chrome/Edge, localhost or HTTPS)
// CONTRACT:
//   speak(text, onEnd?)
//   startListening(onResult, onError?)   onResult(text)  onError(code)
//   stopListening()
const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
const voiceSupported = !!SpeechRec;
let silenceTimer = null;
let currentUtterance = null;

function clearSilenceTimer() {
  if (silenceTimer) {
    window.clearTimeout(silenceTimer);
    silenceTimer = null;
  }
}

function resetMicButton() {
  const mic = document.getElementById("btn-mic");
  if (mic) {
    mic.setAttribute("aria-pressed", "false");
    mic.setAttribute("aria-label", "Start speaking");
  }
}

function speak(text, onEnd) {
  if (!("speechSynthesis" in window)) { setAvatarState("idle"); setStatus("Ready"); onEnd && onEnd(); return; }
  stopSpeaking();
  const u = new SpeechSynthesisUtterance(text);
  currentUtterance = u;
  u.onstart = () => {
    if (currentUtterance !== u) return;
    setAvatarState("speaking");
    setStatus("Speaking…");
  };
  u.onend = () => {
    if (currentUtterance !== u) return;
    currentUtterance = null;
    setAvatarState("idle");
    setStatus("Ready");
    onEnd && onEnd();
  };
  speechSynthesis.speak(u);
}

function stopSpeaking() {
  if (!("speechSynthesis" in window)) return;
  if (currentUtterance) {
    currentUtterance.onstart = null;
    currentUtterance.onend = null;
    currentUtterance = null;
  }
  speechSynthesis.cancel();
}

function startListening(onResult, onError) {
  if (!voiceSupported) { onError && onError("unsupported"); return; }
  stopListening();
  recognition = new SpeechRec();
  recognition.lang = "en-CA";
  recognition.interimResults = false;
  recognition.onstart = () => {
    clearSilenceTimer();
    silenceTimer = window.setTimeout(() => {
      if (recognition) recognition.stop();
      setAvatarState("error");
      onError && onError("no-speech");
      resetMicButton();
    }, 8000);
    setAvatarState("listening");
    setStatus("Listening…");
    const mic = document.getElementById("btn-mic");
    if (mic) {
      mic.setAttribute("aria-pressed", "true");
      mic.setAttribute("aria-label", "Stop speaking");
    }
  };
  recognition.onresult = (e) => {
    clearSilenceTimer();
    onResult(e.results[0][0].transcript);
  };
  recognition.onerror = (e) => {
    clearSilenceTimer();
    setAvatarState("error");
    onError && onError(e.error);
  };
  recognition.onend = () => {
    clearSilenceTimer();
    resetMicButton();
    if (document.getElementById("avatar").dataset.state === "listening") { setAvatarState("idle"); setStatus("Ready"); }
  };
  recognition.start();
}

function stopListening() {
  clearSilenceTimer();
  if (recognition) {
    const activeRecognition = recognition;
    recognition = null;
    try { activeRecognition.stop(); } catch (_) {}
  }
  resetMicButton();
}
