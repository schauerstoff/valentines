const windowsRoot = document.getElementById("windows");
const taskButtonsRoot = document.getElementById("task-buttons");
const clockEl = document.getElementById("clock");

let zTop = 10;
let selectedIcon = null;

function valentineBodyHtml() {
    return `
    <div style="display:grid; gap:10px;">
      <p style="margin:0;">今年も、私のバレンタインになってくれる？💘</p>
      <div style="display:flex; gap:10px; justify-content:flex-end;">
        <button type="button" data-valentine="yes">はい</button>
        <button type="button" data-valentine="no">いいえ</button>
      </div>
    </div>
  `;
}

const appMeta = {
    recycle: { title: "Recycle Bin", body: "<p>Empty.</p>" },
    ie: { title: "Internet Explorer", body: "<p>Not connected.</p>" },
    folder: { title: "My Folder", body: "<p>Didn't it say *secret*?!.</p>" },
    valentine: { title: "valentine.exe", body: valentineBodyHtml() },
};

// ---------- DESKTOP ICON BEHAVIOUR ----------

document.querySelectorAll(".desktop-icon").forEach((icon) => {
    icon.addEventListener("click", () => selectIcon(icon));
    icon.addEventListener("dblclick", () => openApp(icon.dataset.target));
});

document.addEventListener("click", (e) => {
    if (e.target.closest(".desktop-icon")) return;
    if (e.target.closest(".window")) return;
    clearSelection();
});

document.addEventListener("keydown", (e) => {
    if (!selectedIcon) return;
    if (e.key === "Enter") openApp(selectedIcon.dataset.target);
});

function selectIcon(icon) {
    if (selectedIcon) selectedIcon.classList.remove("selected");
    selectedIcon = icon;
    selectedIcon.classList.add("selected");
}

function clearSelection() {
    if (selectedIcon) selectedIcon.classList.remove("selected");
    selectedIcon = null;
}

// ---------- WINDOW MANAGEMENT ----------

function openApp(appId) {
    const meta = appMeta[appId];
    if (!meta) return;

    const existing = document.querySelector(`.window[data-app='${appId}']`);
    if (existing) {
        focusWindow(existing);
        return;
    }

    const win = document.createElement("div");
    win.className = "window";
    win.dataset.app = appId;
    win.style.position = "absolute";
    win.style.left = `${120 + Math.floor(Math.random() * 220)}px`;
    win.style.top = `${70 + Math.floor(Math.random() * 140)}px`;
    win.style.width = appId === "valentine" ? "320px" : "300px";
    win.style.zIndex = String(++zTop);

    win.innerHTML = `
    <div class="title-bar">
      <div class="title-bar-text">${escapeHtml(meta.title)}</div>
      <div class="title-bar-controls">
        <button aria-label="Close"></button>
      </div>
    </div>
    <div class="window-body">
      ${meta.body}
    </div>
  `;

    makeWindowDraggable(win);

    win.querySelector("[aria-label='Close']")
        .addEventListener("click", () => closeWindow(win));

    win.addEventListener("mousedown", () => focusWindow(win));

    if (appId === "valentine") {
        win.addEventListener("click", (e) => {
            const btn = e.target.closest("button[data-valentine]");
            if (!btn) return;

            if (btn.dataset.valentine === "no") {
                runNoFlow();
            } else {
                runYesFlow();
            }
        });
    }

    windowsRoot.appendChild(win);
    createTaskButton(appId, meta.title, win);
    focusWindow(win);
}

function focusWindow(win) {
    win.style.zIndex = String(++zTop);

    document.querySelectorAll(".title-bar")
        .forEach(tb => tb.classList.add("inactive"));

    const tb = win.querySelector(".title-bar");
    if (tb) tb.classList.remove("inactive");

    document.querySelectorAll(".task-buttons button")
        .forEach(b => b.removeAttribute("aria-current"));

    const appId = win.dataset.app;
    const taskBtn = document.querySelector(`.task-buttons button[data-task='${appId}']`);
    if (taskBtn) taskBtn.setAttribute("aria-current", "true");
}

function closeWindow(win) {
    const appId = win.dataset.app;
    win.remove();

    const taskBtn = document.querySelector(`.task-buttons button[data-task='${appId}']`);
    if (taskBtn) taskBtn.remove();
}

function createTaskButton(appId, title, win) {
    const btn = document.createElement("button");
    btn.textContent = title;
    btn.dataset.task = appId;
    btn.addEventListener("click", () => focusWindow(win));
    taskButtonsRoot.appendChild(btn);
}

function makeWindowDraggable(win) {
    const titleBar = win.querySelector(".title-bar");
    if (!titleBar) return;

    let dragging = false;
    let startX = 0, startY = 0;
    let startLeft = 0, startTop = 0;

    titleBar.style.userSelect = "none";

    titleBar.addEventListener("mousedown", (e) => {
        if (e.button !== 0) return;
        if (e.target.closest(".title-bar-controls")) return;

        focusWindow(win);

        dragging = true;
        const rect = win.getBoundingClientRect();
        startLeft = rect.left;
        startTop = rect.top;
        startX = e.clientX;
        startY = e.clientY;

        document.body.style.cursor = "move";
        e.preventDefault();
    });

    window.addEventListener("mousemove", (e) => {
        if (!dragging) return;

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        const desktopRect = document.getElementById("desktop").getBoundingClientRect();
        const winRect = win.getBoundingClientRect();

        let newLeft = startLeft + dx - desktopRect.left;
        let newTop = startTop + dy - desktopRect.top;

        const maxLeft = desktopRect.width - winRect.width;
        const maxTop = desktopRect.height - winRect.height - 38;

        newLeft = Math.max(0, Math.min(newLeft, maxLeft));
        newTop = Math.max(0, Math.min(newTop, maxTop));

        win.style.left = `${newLeft}px`;
        win.style.top = `${newTop}px`;
    });

    window.addEventListener("mouseup", () => {
        if (!dragging) return;
        dragging = false;
        document.body.style.cursor = "";
    });
}

// ---------- CLOCK ----------

function tickClock() {
    const d = new Date();
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    clockEl.textContent = `${hh}:${mm}`;
}

tickClock();
setInterval(tickClock, 1000);

// ---------- UTIL ----------

function escapeHtml(str) {
    return String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function runYesFlow() {
    const desktop = document.getElementById("desktop");
    desktop.classList.add("valentine-mode");

    startHeartRain();
    spawnCats(15);
    playYippie();

    const valWindow = document.querySelector(".window[data-app='valentine']");
    if (valWindow) {
        closeWindow(valWindow);
    }
}

function runNoFlow() {
    const valWindow = document.querySelector(".window[data-app='valentine']");
    if (valWindow) closeWindow(valWindow);

    spawnErrorStorm(20);
    playErrorBurst(20);

    setTimeout(() => {
        showBlueScreen();
    }, 5000);
}

function spawnErrorStorm(count = 10) {
    const desktop = document.getElementById("desktop");
    const desktopRect = desktop.getBoundingClientRect();
    const taskbarHeight = 38;

    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            const win = document.createElement("div");
            win.className = "window";
            win.dataset.app = `error-${Date.now()}-${i}`;
            win.style.position = "absolute";
            win.style.width = "320px";
            win.style.left = `${Math.random() * Math.max(0, desktopRect.width - 340)}px`;
            win.style.top = `${Math.random() * Math.max(0, desktopRect.height - 220 - taskbarHeight)}px`;
            win.style.zIndex = String(++zTop);

            win.innerHTML = `
        <div class="title-bar">
          <div class="title-bar-text">Error</div>
          <div class="title-bar-controls">
            <button aria-label="Close"></button>
          </div>
        </div>
        <div class="window-body">
          <p>An unexpected error occurred.</p>
          <div style="display:flex; justify-content:flex-end; margin-top:10px;">
            <button type="button">OK</button>
          </div>
        </div>
      `;

            makeWindowDraggable(win);
            win.addEventListener("mousedown", () => focusWindow(win));

            const closeBtn = win.querySelector("[aria-label='Close']");
            if (closeBtn) closeBtn.addEventListener("click", () => win.remove());

            const okBtn = win.querySelector(".window-body button");
            if (okBtn) okBtn.addEventListener("click", () => win.remove());

            windowsRoot.appendChild(win);
            focusWindow(win);
        }, i * 80);
    }
}

function playErrorBurst(count = 10) {
    for (let i = 0; i < count; i++) {
        const delay = Math.random() * 600;
        setTimeout(() => {
            const audio = new Audio("./assets/error.mp3");
            audio.volume = 0.9;
            audio.play().catch(() => { });
        }, delay);
    }
}

function showBlueScreen() {
    const desktop = document.getElementById("desktop");
    const overlay = document.createElement("div");
    overlay.id = "bsod-overlay";
    overlay.innerHTML = `
    <div class="bsod-text">
      <p><strong>A problem has been detected and Windows has been shutdown to prevent damage to my heart.</strong></p>
        <p>片思い_EXCEPTION</p>
      <p>All future memories have been corrupted.</p>
      <br>
      <p>goodbye world</p>
    </div>
  `;

    desktop.appendChild(overlay);
}

// ---------- Heart Rain ----------

let heartRainIntervalId = null;

function startHeartRain() {
    if (heartRainIntervalId) return;

    const desktop = document.getElementById("desktop");

    heartRainIntervalId = setInterval(() => {
        const heart = document.createElement("div");
        heart.textContent = "🩷";

        heart.className = "heart-drop";
        heart.style.left = `${Math.random() * 100}%`;
        heart.style.fontSize = `${16 + Math.random() * 22}px`;
        heart.style.animationDuration = `${2.5 + Math.random() * 2.5}s`;
        heart.style.opacity = `${0.6 + Math.random() * 0.4}`;
        desktop.appendChild(heart);
        const ms = parseFloat(heart.style.animationDuration) * 1000;
        setTimeout(() => heart.remove(), ms + 200);
    }, 120);
}

// ---------- Cats ----------

function spawnCats(count = 10) {
    const desktop = document.getElementById("desktop");
    const taskbarHeight = 38;

    const rect = desktop.getBoundingClientRect();
    const maxX = rect.width - 140;
    const maxY = rect.height - 140 - taskbarHeight;

    for (let i = 0; i < count; i++) {
        const img = document.createElement("img");
        img.src = "./assets/cat.gif";
        img.alt = "cat";
        img.className = "cat-spawn";
        img.draggable = false;

        img.style.left = `${Math.max(0, Math.random() * maxX)}px`;
        img.style.top = `${Math.max(0, Math.random() * maxY)}px`;
        img.style.transform = `rotate(${(Math.random() * 10 - 5).toFixed(2)}deg)`;

        desktop.appendChild(img);
    }
}

// ---------- Audio ----------

function playYippie() {
    for (let i = 0; i < 5; i++) {
        const randomDelay = 50 + Math.random() * 500;

        setTimeout(() => {
            const audio = new Audio("./assets/yippie.mp3");
            audio.volume = 0.9;
            audio.play().catch(() => { });
        }, randomDelay);
    }
}