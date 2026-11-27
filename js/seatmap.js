// OWNER: Person A – seat map component
function renderSeatMap(count, onConfirm) {
  const selected = new Set();
  const wrap = document.createElement("div");
  wrap.className = "seatmap";
  wrap.innerHTML = `<div class="screen-bar"></div><div class="screen-label">SCREEN</div>`;

  SEAT_ROWS.forEach((row) => {
    const r = document.createElement("div");
    r.className = "seat-row";
    r.innerHTML = `<span class="row-label">${row}</span>`;
    for (let n = 1; n <= SEATS_PER_ROW; n++) {
      const id = row + n;
      const b = document.createElement("button");
      b.type = "button";
      b.className = "seat";
      b.dataset.id = id;
      if (TAKEN_SEATS.includes(id)) {
        b.classList.add("taken");
        b.disabled = true;
        b.title = `Seat ${id} is taken`;
        b.setAttribute("aria-label", `Seat ${id}, taken`);
      } else {
        b.textContent = n;
        b.setAttribute("aria-label", `Seat ${id}`);
        b.onclick = () => toggle(id);
      }
      r.appendChild(b);
    }
    wrap.appendChild(r);
  });

  const foot = document.createElement("div");
  foot.className = "seat-foot";
  foot.innerHTML = `<span class="seat-count"></span>
    <button type="button" class="seat-confirm" disabled>Use these seats</button>
    <span class="seat-legend">Crossed-out seats are taken</span>`;
  wrap.appendChild(foot);

  const countEl = foot.querySelector(".seat-count");
  const confirmBtn = foot.querySelector(".seat-confirm");

  function update() {
    countEl.textContent = `${selected.size} of ${count} selected`;
    confirmBtn.disabled = selected.size !== count;
    wrap.querySelectorAll(".seat").forEach((b) =>
      b.setAttribute("aria-pressed", selected.has(b.dataset.id)));
  }

  function toggle(id) {
    if (selected.has(id)) selected.delete(id);
    else if (selected.size < count) selected.add(id);
    else { setStatus(`You've picked ${count}. Tap a seat to deselect it.`); return; }
    update();
  }

  function confirm() {
    if (selected.size !== count) return false;
    wrap.classList.add("locked");
    wrap.querySelectorAll(".seat:not(.taken)").forEach((seat) => { seat.disabled = true; });
    onConfirm([...selected]);
    return true;
  }
  confirmBtn.onclick = confirm;

  update();
  document.getElementById("messages").appendChild(wrap);
  $("messages").scrollTop = $("messages").scrollHeight;


  return {
    set(ids) {
      selected.clear();
      ids.filter((i) => !TAKEN_SEATS.includes(i)).slice(0, count).forEach((i) => selected.add(i));
      update();
    },
    confirm,
    lock() {
      wrap.classList.add("locked");
      wrap.querySelectorAll(".seat:not(.taken)").forEach((seat) => { seat.disabled = true; });
      confirmBtn.disabled = true;
    },
    isFull: () => selected.size === count,
  };
}

// Pick `count` seats in an area: prefer seats side by side, else any free seats there
function suggestSeats(area, count) {
  const rows = AREA_ROWS[area];
  for (const row of rows) {
    for (let start = 1; start + count - 1 <= SEATS_PER_ROW; start++) {
      const ids = Array.from({ length: count }, (_, i) => row + (start + i));
      if (ids.every((id) => !TAKEN_SEATS.includes(id))) return ids;
    }
  }
  const free = rows.flatMap((r) => Array.from({ length: SEATS_PER_ROW }, (_, i) => r + (i + 1)))
                   .filter((id) => !TAKEN_SEATS.includes(id));
  return free.length >= count ? free.slice(0, count) : null;
}

// "C4 and C5" -> ["C4", "C5"]
function parseSeats(text) {
  return [...text.toUpperCase().matchAll(/\b([A-E])\s*-?\s*([1-8])\b/g)].map((m) => m[1] + m[2]);
}