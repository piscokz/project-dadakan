/* ============================================================
   The Last One — logika buku
   ============================================================ */

const PW = "2404";
const templates = Array.from(document.querySelectorAll("template.page-tpl"));
const pageBase = document.getElementById("pageBase");
const bookRight = document.getElementById("bookRight");
const pageCurl = document.getElementById("pageCurl");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const popup = document.getElementById("ux-popup");
const popupOk = document.getElementById("popupOk");
const loadingScreen = document.getElementById("loading-screen");
const audio = document.getElementById("bgm");
const timeSlider = document.getElementById("timeSlider");
const timeLabel = document.getElementById("time-label");
const metaThemeColor = document.getElementById("meta-theme-color");
const root = document.documentElement;

const TOTAL = templates.length;
let page = 0;
let locked = true;
let flipping = false;
let queued = 0;
let isNight = false;

/* ---------------- Palet langit (sama seperti versi lama) ---------------- */

const skyPalette = {
  0: { bg: "linear-gradient(135deg, #020111 0%, #20124d 100%)", text: "#ecf0f1", head: "#a2b9bc", glow: "0 0 15px rgba(162,185,188,0.5)", boxBg: "rgba(0,0,0,0.5)", footBg: "rgba(0,0,0,0.6)", border: "#444", tab: "#020111" },
  1: { bg: "linear-gradient(135deg, #020111 0%, #19123b 100%)", text: "#ecf0f1", head: "#a2b9bc", glow: "0 0 15px rgba(162,185,188,0.5)", boxBg: "rgba(0,0,0,0.5)", footBg: "rgba(0,0,0,0.6)", border: "#444", tab: "#020111" },
  2: { bg: "linear-gradient(135deg, #020111 0%, #151030 100%)", text: "#ecf0f1", head: "#a2b9bc", glow: "0 0 15px rgba(162,185,188,0.5)", boxBg: "rgba(0,0,0,0.5)", footBg: "rgba(0,0,0,0.6)", border: "#444", tab: "#020111" },
  3: { bg: "linear-gradient(135deg, #020111 0%, #120e26 100%)", text: "#ecf0f1", head: "#a2b9bc", glow: "0 0 15px rgba(162,185,188,0.5)", boxBg: "rgba(0,0,0,0.5)", footBg: "rgba(0,0,0,0.6)", border: "#444", tab: "#020111" },
  4: { bg: "linear-gradient(135deg, #0a081c 0%, #1a1638 100%)", text: "#ecf0f1", head: "#b2c9cc", glow: "0 0 15px rgba(178,201,204,0.5)", boxBg: "rgba(0,0,0,0.5)", footBg: "rgba(0,0,0,0.6)", border: "#444", tab: "#0a081c" },
  5: { bg: "linear-gradient(135deg, #2c1b4d 0%, #5b3e6c 100%)", text: "#f4f4f4", head: "#f0a8c2", glow: "0 0 15px rgba(240,168,194,0.6)", boxBg: "rgba(20,10,30,0.5)", footBg: "rgba(20,10,30,0.6)", border: "#5b3e6c", tab: "#2c1b4d" },
  6: { bg: "linear-gradient(135deg, #f2c94c 0%, #f2994a 100%)", text: "#333", head: "#fff", glow: "0 0 15px rgba(255,255,255,0.7)", boxBg: "rgba(255,255,255,0.6)", footBg: "rgba(255,255,255,0.7)", border: "#e8b243", tab: "#f2c94c" },
  7: { bg: "linear-gradient(135deg, #ffdf8c 0%, #a4d8ff 100%)", text: "#2c3e50", head: "#e67e22", glow: "0 0 15px rgba(230,126,34,0.4)", boxBg: "rgba(255,255,255,0.7)", footBg: "rgba(255,255,255,0.7)", border: "#f0cf7e", tab: "#ffdf8c" },
  8: { bg: "linear-gradient(135deg, #cde3ff 0%, #89cff0 100%)", text: "#2c3e50", head: "#2980b9", glow: "0 0 12px rgba(41,128,185,0.3)", boxBg: "rgba(255,255,255,0.8)", footBg: "rgba(255,255,255,0.8)", border: "#aecff2", tab: "#cde3ff" },
  9: { bg: "linear-gradient(135deg, #89cff0 0%, #4facfe 100%)", text: "#112233", head: "#ff6b81", glow: "0 2px 10px rgba(255,107,129,0.3)", boxBg: "rgba(255,255,255,0.85)", footBg: "rgba(255,255,255,0.85)", border: "#7bb7d4", tab: "#89cff0" },
  10: { bg: "linear-gradient(135deg, #4facfe 0%, #00c6ff 100%)", text: "#112233", head: "#e84393", glow: "0 2px 15px rgba(232,67,147,0.4)", boxBg: "rgba(255,255,255,0.9)", footBg: "rgba(255,255,255,0.9)", border: "#449cdb", tab: "#4facfe" },
  11: { bg: "linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)", text: "#fff", head: "#ffeaa7", glow: "0 2px 20px rgba(255,234,167,0.7)", boxBg: "rgba(255,255,255,0.2)", footBg: "rgba(255,255,255,0.3)", border: "#00a8ff", tab: "#00c6ff" },
  12: { bg: "linear-gradient(135deg, #0052D4 0%, #4364F7 50%, #6FB1FC 100%)", text: "#fff", head: "#f1c40f", glow: "0 2px 20px rgba(241,196,15,0.8)", boxBg: "rgba(255,255,255,0.2)", footBg: "rgba(255,255,255,0.3)", border: "#3252d4", tab: "#0052D4" },
  13: { bg: "linear-gradient(135deg, #0062E6 0%, #33AEFF 100%)", text: "#fff", head: "#f1c40f", glow: "0 2px 20px rgba(241,196,15,0.8)", boxBg: "rgba(255,255,255,0.2)", footBg: "rgba(255,255,255,0.3)", border: "#3252d4", tab: "#0062E6" },
  14: { bg: "linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)", text: "#fff", head: "#ffeaa7", glow: "0 2px 20px rgba(255,234,167,0.7)", boxBg: "rgba(255,255,255,0.2)", footBg: "rgba(255,255,255,0.3)", border: "#00a8ff", tab: "#00c6ff" },
  15: { bg: "linear-gradient(135deg, #4facfe 0%, #00c6ff 100%)", text: "#112233", head: "#e84393", glow: "0 2px 15px rgba(232,67,147,0.4)", boxBg: "rgba(255,255,255,0.8)", footBg: "rgba(255,255,255,0.9)", border: "#449cdb", tab: "#4facfe" },
  16: { bg: "linear-gradient(135deg, #89cff0 0%, #fbd786 100%)", text: "#2c3e50", head: "#d35400", glow: "0 2px 15px rgba(211,84,0,0.4)", boxBg: "rgba(255,255,255,0.7)", footBg: "rgba(255,255,255,0.8)", border: "#a5b4be", tab: "#89cff0" },
  17: { bg: "linear-gradient(135deg, #f12711 0%, #f5af19 100%)", text: "#fff", head: "#fff", glow: "0 0 20px rgba(255,255,255,0.8)", boxBg: "rgba(50,10,0,0.4)", footBg: "rgba(50,10,0,0.5)", border: "#de381b", tab: "#f12711" },
  18: { bg: "linear-gradient(135deg, #301847 0%, #c1445f 100%)", text: "#f4f4f4", head: "#ffdfba", glow: "0 0 15px rgba(255,223,186,0.6)", boxBg: "rgba(30,10,20,0.5)", footBg: "rgba(30,10,20,0.6)", border: "#8a4053", tab: "#301847" },
  19: { bg: "linear-gradient(135deg, #1f1c2c 0%, #928dab 100%)", text: "#f4f4f4", head: "#e0eaf5", glow: "0 0 15px rgba(224,234,245,0.6)", boxBg: "rgba(20,20,30,0.5)", footBg: "rgba(20,20,30,0.6)", border: "#605b73", tab: "#1f1c2c" },
  20: { bg: "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)", text: "#ecf0f1", head: "#85c1e9", glow: "0 0 15px rgba(133,193,233,0.5)", boxBg: "rgba(0,0,0,0.4)", footBg: "rgba(0,0,0,0.5)", border: "#444", tab: "#0f2027" },
  21: { bg: "linear-gradient(135deg, #0b171c 0%, #162a31 50%, #1f3c48 100%)", text: "#ecf0f1", head: "#85c1e9", glow: "0 0 15px rgba(133,193,233,0.5)", boxBg: "rgba(0,0,0,0.5)", footBg: "rgba(0,0,0,0.6)", border: "#333", tab: "#0b171c" },
  22: { bg: "linear-gradient(135deg, #071013 0%, #0d1a1e 50%, #13272f 100%)", text: "#ecf0f1", head: "#a2b9bc", glow: "0 0 15px rgba(162,185,188,0.5)", boxBg: "rgba(0,0,0,0.5)", footBg: "rgba(0,0,0,0.6)", border: "#333", tab: "#071013" },
  23: { bg: "linear-gradient(135deg, #04080a 0%, #081114 50%, #0b171c 100%)", text: "#ecf0f1", head: "#a2b9bc", glow: "0 0 15px rgba(162,185,188,0.5)", boxBg: "rgba(0,0,0,0.5)", footBg: "rgba(0,0,0,0.6)", border: "#333", tab: "#04080a" },
};

/* ---------------- Matahari, bulan, bintang ---------------- */

function gambarMatahari() {
  const ctx = document.getElementById("sunCanvas").getContext("2d");
  ctx.clearRect(0, 0, 80, 80);
  ctx.translate(40, 40);
  ctx.strokeStyle = "#FFD700";
  ctx.lineWidth = 3;
  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(35, 0);
    ctx.stroke();
    ctx.rotate(Math.PI / 4);
  }
  ctx.beginPath();
  ctx.arc(0, 0, 18, 0, Math.PI * 2);
  ctx.fillStyle = "#FFA500";
  ctx.fill();
  ctx.strokeStyle = "#FF8C00";
  ctx.stroke();
  ctx.translate(-40, -40);
}

function gambarBulan() {
  const ctx = document.getElementById("moonCanvas").getContext("2d");
  ctx.clearRect(0, 0, 80, 80);
  ctx.beginPath();
  ctx.arc(45, 40, 22, 0, Math.PI * 2);
  ctx.fillStyle = "#F4F6F0";
  ctx.fill();
  ctx.shadowBlur = 15;
  ctx.shadowColor = "#FFFFFF";
  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  ctx.arc(32, 35, 18, 0, Math.PI * 2);
  ctx.fillStyle = "#000";
  ctx.fill();
  ctx.globalCompositeOperation = "source-over";
  ctx.shadowBlur = 0;
}

gambarMatahari();
gambarBulan();

const starCanvas = document.getElementById("stars-canvas");
const starCtx = starCanvas.getContext("2d");
let stars = [];

function initStars() {
  starCanvas.width = window.innerWidth;
  starCanvas.height = window.innerHeight;
  stars = [];
  for (let i = 0; i < 150; i++) {
    stars.push({
      x: Math.random() * starCanvas.width,
      y: Math.random() * starCanvas.height,
      radius: Math.random() * 1.5,
      alpha: Math.random(),
      speed: Math.random() * 0.05,
    });
  }
}

function animateStars() {
  if (isNight) {
    starCtx.clearRect(0, 0, starCanvas.width, starCanvas.height);
    starCtx.fillStyle = "#FFF";
    stars.forEach((s) => {
      starCtx.globalAlpha = s.alpha;
      starCtx.beginPath();
      starCtx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      starCtx.fill();
      s.alpha += s.speed;
      if (s.alpha <= 0 || s.alpha >= 1) s.speed *= -1;
    });
  }
  requestAnimationFrame(animateStars);
}

initStars();
animateStars();
window.addEventListener("resize", initStars);

/* ---------------- Debu ambient ---------------- */

(function buatDebu() {
  const dust = document.getElementById("dust");
  for (let i = 0; i < 16; i++) {
    const m = document.createElement("span");
    m.className = "dust-mote";
    m.style.left = Math.random() * 100 + "%";
    m.style.animationDuration = 9 + Math.random() * 13 + "s";
    m.style.animationDelay = -Math.random() * 20 + "s";
    const size = 2 + Math.random() * 2;
    m.style.width = size + "px";
    m.style.height = size + "px";
    dust.appendChild(m);
  }
})();

/* ---------------- Siang / malam ---------------- */

function updateWaktuLingkungan(jam) {
  const isSiang = jam >= 6 && jam < 18;
  isNight = !isSiang;

  document.body.classList.toggle("is-night", isNight);
  timeLabel.innerText = `Simulasi: ${jam}:00 (${isSiang ? "Siang ☀️" : "Malam 🌙"})`;

  const tema = skyPalette[jam];
  root.style.setProperty("--scene-bg", tema.bg);
  root.style.setProperty("--text-color", tema.text);
  root.style.setProperty("--heading-color", tema.head);
  root.style.setProperty("--heading-glow", tema.glow);
  root.style.setProperty("--border-color", tema.border);
  metaThemeColor.setAttribute("content", tema.tab);
}

const currentHour = new Date().getHours();
timeSlider.value = currentHour;
updateWaktuLingkungan(currentHour);
timeSlider.addEventListener("input", (e) => updateWaktuLingkungan(parseInt(e.target.value)));

/* ---------------- Render & navigasi ---------------- */

function pageHTML(i) {
  return templates[i].innerHTML;
}

function updateChrome() {
  prevBtn.disabled = flipping || page === 0;
  nextBtn.disabled = flipping || page === TOTAL - 1 || (locked && page === 0);
  bookRight.classList.toggle("can-next", !locked && !flipping && page < TOTAL - 1);
}

function render(i) {
  page = i;
  pageBase.innerHTML = pageHTML(i);
  updateChrome();
}

function flipTo(target, dir) {
  if (flipping || target < 0 || target >= TOTAL || target === page) return;
  if (locked && target !== 0 && page === 0) return;
  if (dir > 0 && locked && page === 0) return;

  flipping = true;
  updateChrome();

  const wrap = document.createElement("div");
  wrap.className = "flip-wrap";
  const sheet = document.createElement("div");
  sheet.className = "flip-sheet";
  const front = document.createElement("div");
  front.className = "face front";
  const back = document.createElement("div");
  back.className = "face back";

  if (dir > 0) {
    front.innerHTML = pageBase.innerHTML;
    pageBase.innerHTML = pageHTML(target);
  } else {
    front.innerHTML = pageHTML(target);
  }

  // Klon hanya untuk tampilan — buang id agar tidak dobel
  front.querySelectorAll("[id]").forEach((el) => el.removeAttribute("id"));

  sheet.append(front, back);
  wrap.append(sheet);
  bookRight.appendChild(wrap);

  if (dir < 0) sheet.style.transform = "rotateY(-180deg)";
  void sheet.offsetWidth;

  bookRight.classList.add("flipping");
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      sheet.style.transform = dir > 0 ? "rotateY(-180deg)" : "rotateY(0deg)";
    });
  });

  let selesai = false;
  const finish = () => {
    if (selesai) return;
    selesai = true;
    if (dir < 0) pageBase.innerHTML = pageHTML(target);
    page = target;
    wrap.remove();
    bookRight.classList.remove("flipping");
    flipping = false;
    updateChrome();

    if (queued) {
      const next = page + queued;
      queued = 0;
      if (next >= 0 && next < TOTAL) flipTo(next, next > page ? 1 : -1);
    }
  };

  sheet.addEventListener(
    "transitionend",
    (e) => {
      if (e.target === sheet && e.propertyName === "transform") finish();
    },
    { once: true }
  );
  setTimeout(finish, 1000);
}

function gantiSlide(arah) {
  if (locked && page === 0) return;
  if (flipping) {
    queued = arah;
    return;
  }
  const target = page + arah;
  if (target < 0 || target >= TOTAL) return;
  flipTo(target, arah);
}

prevBtn.addEventListener("click", () => gantiSlide(-1));
nextBtn.addEventListener("click", () => gantiSlide(1));
pageCurl.addEventListener("click", () => gantiSlide(1));

document.addEventListener("keydown", (e) => {
  if (e.target.matches("input, textarea, select")) return;
  if (e.key === "ArrowRight") gantiSlide(1);
  if (e.key === "ArrowLeft") gantiSlide(-1);
});

/* Geser (swipe) di layar sentuh */
let touchX = null;
let touchY = null;
bookRight.addEventListener(
  "touchstart",
  (e) => {
    if (e.target.closest(".pin-container")) return;
    touchX = e.changedTouches[0].clientX;
    touchY = e.changedTouches[0].clientY;
  },
  { passive: true }
);
bookRight.addEventListener(
  "touchend",
  (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    const dy = e.changedTouches[0].clientY - touchY;
    touchX = null;
    touchY = null;
    if (Math.abs(dx) < 55 || Math.abs(dx) < Math.abs(dy) * 1.4) return;
    if (dx < 0) gantiSlide(1);
    else gantiSlide(-1);
  },
  { passive: true }
);

/* ---------------- PIN ---------------- */

function pinBoxes() {
  return Array.from(pageBase.querySelectorAll(".pin-box"));
}

function hideError() {
  const err = pageBase.querySelector(".error-text");
  if (err) err.classList.remove("show");
}

function shakeBook() {
  const inner = pageBase.querySelector(".page-title");
  if (!inner) return;
  inner.classList.remove("shake");
  void inner.offsetWidth;
  inner.classList.add("shake");
  setTimeout(() => inner.classList.remove("shake"), 460);
}

function resetPin() {
  pinBoxes().forEach((b) => (b.value = ""));
  const first = pinBoxes()[0];
  if (first) first.focus();
}

function cekPassword() {
  const boxes = pinBoxes();
  const pinMasuk = boxes.map((b) => b.value).join("");
  if (pinMasuk.length !== 4) return;

  if (pinMasuk === PW) {
    hideError();
    audio.play().catch((e) => console.log("Audio diblokir: ", e));
    loadingScreen.hidden = false;

    setTimeout(() => {
      loadingScreen.hidden = true;
      locked = false;
      flipTo(1, 1);
    }, 2000);
  } else {
    const err = pageBase.querySelector(".error-text");
    if (err) err.classList.add("show");
    shakeBook();
    setTimeout(resetPin, 430);
  }
}

pageBase.addEventListener("input", (e) => {
  const input = e.target.closest(".pin-box");
  if (!input) return;

  hideError();
  const digits = input.value.replace(/[^0-9]/g, "");
  const boxes = pinBoxes();
  const index = boxes.indexOf(input);

  if (digits.length > 1) {
    // tempel 4 digit sekaligus
    for (let i = 0; i < digits.length && index + i < boxes.length; i++) {
      boxes[index + i].value = digits[i];
    }
    const last = Math.min(index + digits.length, boxes.length - 1);
    boxes[last].focus();
    if (boxes.every((b) => b.value)) cekPassword();
    return;
  }

  input.value = digits;
  if (digits !== "" && index < boxes.length - 1) boxes[index + 1].focus();
  if (boxes.every((b) => b.value)) cekPassword();
});

pageBase.addEventListener("keydown", (e) => {
  const input = e.target.closest(".pin-box");
  if (!input) return;
  const boxes = pinBoxes();
  const index = boxes.indexOf(input);

  if (e.key === "Backspace" && input.value === "" && index > 0) {
    boxes[index - 1].focus();
  }
  if (e.key === "Enter") {
    cekPassword();
  }
});

/* ---------------- Halaman akhir ---------------- */

pageBase.addEventListener("click", (e) => {
  const gift = e.target.closest("#giftBox");
  if (gift) {
    gift.classList.remove("pop");
    void gift.offsetWidth;
    gift.classList.add("pop");
  }
  if (e.target.closest("#restartBtn")) {
    if (page !== 1) flipTo(1, -1);
  }
});

/* ---------------- Popup awal & audio ---------------- */

popupOk.addEventListener("click", () => {
  audio
    .play()
    .then(() => {
      audio.pause();
      audio.currentTime = 0;
    })
    .catch(() => console.log("Audio unlock tertunda, aman."));

  popup.style.display = "none";
  setTimeout(() => {
    const first = pinBoxes()[0];
    if (first) first.focus();
  }, 400);
});

/* ---------------- Mulai ---------------- */

render(0);
