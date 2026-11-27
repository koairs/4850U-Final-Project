// OWNER: Person C
// CONTRACT: setAvatarState(state)  where state = idle | listening | thinking | speaking | error
const AVATAR_STATES = ["idle", "listening", "thinking", "speaking", "error"];

function setAvatarState(state) {
  if (!AVATAR_STATES.includes(state)) return;
  const el = document.getElementById("avatar");
  el.dataset.state = state;
  // TODO (C): trigger animations per state (CSS selectors like #avatar[data-state="speaking"] ...)
}

function initAvatar() {
  // TODO (C): replace this placeholder with the custom avatar (SVG/CSS)
  document.getElementById("avatar").innerHTML = `
    <svg viewBox="0 0 200 200" role="img" aria-label="Cinema assistant avatar">
      <circle cx="100" cy="100" r="80" fill="#e8a33d"/>
      <circle cx="75" cy="85" r="8" fill="#1b1b1f"/>
      <circle cx="125" cy="85" r="8" fill="#1b1b1f"/>
      <rect id="avatar-mouth" x="75" y="125" width="50" height="8" rx="4" fill="#1b1b1f"/>
    </svg>`;
}
