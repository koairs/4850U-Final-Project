// OWNER: Person C
// CONTRACT: setAvatarState(state)  where state = idle | listening | thinking | speaking | error
const AVATAR_STATES = ["idle", "listening", "thinking", "speaking", "error"];
const AVATAR_LABELS = {
  idle: "Cinema assistant: ready",
  listening: "Cinema assistant: listening",
  thinking: "Cinema assistant: thinking",
  speaking: "Cinema assistant: speaking",
  error: "Cinema assistant: needs attention",
};

function setAvatarState(state) {
  if (!AVATAR_STATES.includes(state)) return;
  const el = document.getElementById("avatar");
  if (!el) return;
  el.dataset.state = state;
  const graphic = el.querySelector("svg");
  if (graphic) graphic.setAttribute("aria-label", AVATAR_LABELS[state]);
}

function initAvatar() {
  const el = document.getElementById("avatar");
  if (!el) return;
  // Inline SVG keeps the character lightweight and lets CSS own every animation.
  // No timers or audio access: the conversation/voice modules own state changes.
  el.innerHTML = `
    <svg class="reel-avatar" viewBox="0 0 240 240" role="img" aria-label="Cinema assistant: ready" focusable="false">
      <g aria-hidden="true">
        <circle class="avatar-backdrop" cx="120" cy="117" r="96"/>
        <circle class="avatar-halo" cx="120" cy="117" r="101"/>
        <ellipse class="avatar-shadow" cx="120" cy="219" rx="49" ry="6"/>
        <g class="avatar-character">
          <path class="avatar-antenna" d="M120 57V41"/>
          <g class="avatar-reel">
            <circle cx="120" cy="31" r="16" class="avatar-shell"/>
            <circle cx="120" cy="31" r="3" class="avatar-reel-hole"/>
            <circle cx="120" cy="22" r="3" class="avatar-reel-hole"/>
            <circle cx="129" cy="31" r="3" class="avatar-reel-hole"/>
            <circle cx="120" cy="40" r="3" class="avatar-reel-hole"/>
            <circle cx="111" cy="31" r="3" class="avatar-reel-hole"/>
          </g>
          <rect class="avatar-ear" x="35" y="91" width="19" height="39" rx="9"/>
          <rect class="avatar-ear" x="186" y="91" width="19" height="39" rx="9"/>
          <rect class="avatar-shell" x="47" y="56" width="146" height="111" rx="35"/>
          <path class="avatar-highlight" d="M64 84Q68 69 86 69H147"/>
          <rect class="avatar-screen" x="61" y="77" width="118" height="72" rx="24"/>
          <g class="avatar-eyes">
            <rect class="avatar-eye avatar-eye-left" x="84" y="98" width="13" height="21" rx="6.5"/>
            <rect class="avatar-eye avatar-eye-right" x="143" y="98" width="13" height="21" rx="6.5"/>
          </g>
          <g class="avatar-brows">
            <path d="M83 97l16-5M141 92l16 5"/>
          </g>
          <path class="avatar-smile" d="M108 127Q120 138 132 127"/>
          <rect id="avatar-mouth" class="avatar-speaking-mouth" x="110" y="124" width="20" height="13" rx="6"/>
          <path class="avatar-error-mouth" d="M109 134Q120 123 131 134"/>
          <g class="avatar-thinking-dots">
            <circle cx="108" cy="131" r="3"/>
            <circle cx="120" cy="131" r="3"/>
            <circle cx="132" cy="131" r="3"/>
          </g>
          <path class="avatar-body" d="M91 167H149L160 204Q120 218 80 204Z"/>
          <path class="avatar-collar" d="M91 170l29 17 29-17"/>
          <path class="avatar-bow" d="M120 183l-13-7v16l13-7 13 7v-16Z"/>
          <circle class="avatar-button" cx="120" cy="199" r="3"/>
        </g>
        <g class="avatar-error-badge">
          <circle cx="191" cy="177" r="16"/>
          <path d="M191 168v11m0 6v1"/>
        </g>
      </g>
    </svg>`;
  // Preserve a valid state if the caller set it before initialization.
  setAvatarState(AVATAR_STATES.includes(el.dataset.state) ? el.dataset.state : "idle");
}
