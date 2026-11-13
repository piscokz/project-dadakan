/* ============================================================
   The Last One — logika buku, cuaca live & hujan real-time
   ============================================================ */

const PW = "2404";
const FALLBACK_COORDS = { lat: -6.2088, lon: 106.8456, city: "Jakarta" };
const WEATHER_REFRESH_MS = 10 * 60 * 1000;

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
const metaThemeColor = document.getElementById("meta-theme-color");
const root = document.documentElement;

const liveBadge = document.getElementById("liveBadge");
const liveClock = document.getElementById("liveClock");
const weatherSummary = document.getElementById("weatherSummary");
const rainProbEl = document.getElementById("rainProb");
const weatherLocEl = document.getElementById("weatherLoc");
const modeToggleBtn = document.getElementById("modeToggleBtn");
const geoBtn = document.getElementById("geoBtn");
const simDrawer = document.getElementById("simDrawer");
const timeSlider = document.getElementById("timeSlider");
const simHourHint = document.getElementById("simHourHint");
const rainCanvas = document.getElementById("rain-canvas");
const rainCtx = rainCanvas.getContext("2d");

const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
let reducedMotion = motionQuery.matches;

const TOTAL = templates.length;
let page = 0;
let locked = true;
let flipping = false;
let queued = 0;

/* ---------------- Keyframe warna langit realistis ---------------- */

// [hour, topHex, midHex, horizonHex, glowHex, glowAlpha, starAlpha, sunAlpha, moonAlpha, daylight]
const SKY_STOPS = [
  [0.0, "#050812", "#0c1424", "#18243b", "#8ba8d9", 0.14, 0.94, 0.0, 0.95, 0.0],
  [4.0, "#080e1c", "#131f36", "#253350", "#9db4d8", 0.16, 0.85, 0.0, 0.88, 0.04],
  [5.25, "#15233e", "#344667", "#7c6b79", "#e0a98f", 0.28, 0.28, 0.15, 0.35, 0.25],
  [6.25, "#264266", "#587699", "#d69c77", "#ffd2a1", 0.42, 0.0, 0.72, 0.0, 0.62],
  [7.75, "#33699e", "#679bc7", "#c4dced", "#fff0cf", 0.36, 0.0, 0.95, 0.0, 0.92],
  [11.0, "#27639c", "#548fc5", "#b2d3e9", "#fff4d9", 0.34, 0.0, 1.0, 0.0, 1.0],
  [14.5, "#2c689f", "#6097c7", "#c3dced", "#fff0cf", 0.35, 0.0, 0.98, 0.0, 1.0],
  [16.75, "#2c5480", "#6883a4", "#d6c0a2", "#ffe0b2", 0.38, 0.0, 0.82, 0.0, 0.78],
  [17.75, "#1d2f4e", "#4d5c7b", "#ce8e6b", "#f4a97d", 0.44, 0.08, 0.38, 0.15, 0.42],
  [18.6, "#0d1629", "#21314d", "#55546a", "#9aa9cc", 0.22, 0.56, 0.0, 0.72, 0.1],
  [19.8, "#060b16", "#101a2e", "#1d2b44", "#8ba8d9", 0.16, 0.9, 0.0, 0.94, 0.0],
  [24.0, "#050812", "#0c1424", "#18243b", "#8ba8d9", 0.14, 0.94, 0.0, 0.95, 0.0],
];

const OVERCAST_NIGHT = ["#06090f", "#111722", "#1c2533"];
const OVERCAST_TWILIGHT = ["#1f2633", "#3a4352", "#596270"];
const OVERCAST_DAY = ["#4b5a69", "#71818f", "#9aa8b4"];
const STORM_DARK_DAY = "#25303b";
const STORM_DARK_NIGHT = "#04060b";

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  const n = parseInt(clean, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex(r, g, b) {
  const toHex = (c) => clamp(Math.round(c), 0, 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function lerpHex(hexA, hexB, t) {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  return rgbToHex(lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t));
}

function hexToRgba(hex, alpha) {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(3)})`;
}

function sampleSkyByHour(hourFloat) {
  const h = ((hourFloat % 24) + 24) % 24;
  for (let i = 0; i < SKY_STOPS.length - 1; i++) {
    const a = SKY_STOPS[i];
    const b = SKY_STOPS[i + 1];
    if (h >= a[0] && h <= b[0]) {
      const span = Math.max(0.0001, b[0] - a[0]);
      const t = (h - a[0]) / span;
      return {
        top: lerpHex(a[1], b[1], t),
        mid: lerpHex(a[2], b[2], t),
        horizon: lerpHex(a[3], b[3], t),
        glow: lerpHex(a[4], b[4], t),
        glowAlpha: lerp(a[5], b[5], t),
        starAlpha: lerp(a[6], b[6], t),
        sunAlpha: lerp(a[7], b[7], t),
        moonAlpha: lerp(a[8], b[8], t),
        daylight: lerp(a[9], b[9], t),
      };
    }
  }
  return sampleSkyByHour(0);
}

function pickOvercastStops(daylight) {
  if (daylight < 0.45) {
    const t = daylight / 0.45;
    return [
      lerpHex(OVERCAST_NIGHT[0], OVERCAST_TWILIGHT[0], t),
      lerpHex(OVERCAST_NIGHT[1], OVERCAST_TWILIGHT[1], t),
      lerpHex(OVERCAST_NIGHT[2], OVERCAST_TWILIGHT[2], t),
    ];
  }
  const t = (daylight - 0.45) / 0.55;
  return [
    lerpHex(OVERCAST_TWILIGHT[0], OVERCAST_DAY[0], t),
    lerpHex(OVERCAST_TWILIGHT[1], OVERCAST_DAY[1], t),
    lerpHex(OVERCAST_TWILIGHT[2], OVERCAST_DAY[2], t),
  ];
}

/* ---------------- Matahari, bulan, bintang ---------------- */

function gambarMatahari() {
  const ctx = document.getElementById("sunCanvas").getContext("2d");
  ctx.clearRect(0, 0, 80, 80);

  const halo = ctx.createRadialGradient(40, 40, 8, 40, 40, 38);
  halo.addColorStop(0, "rgba(255, 250, 224, 0.96)");
  halo.addColorStop(0.38, "rgba(255, 226, 152, 0.86)");
  halo.addColorStop(0.62, "rgba(255, 198, 108, 0.34)");
  halo.addColorStop(1, "rgba(255, 198, 108, 0)");
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(40, 40, 38, 0, Math.PI * 2);
  ctx.fill();

  const core = ctx.createRadialGradient(36, 36, 2, 40, 40, 17);
  core.addColorStop(0, "#fffdf2");
  core.addColorStop(0.7, "#ffe49e");
  core.addColorStop(1, "#f4bc60");
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.arc(40, 40, 17, 0, Math.PI * 2);
  ctx.fill();
}

function gambarBulan() {
  const ctx = document.getElementById("moonCanvas").getContext("2d");
  ctx.clearRect(0, 0, 80, 80);

  const aura = ctx.createRadialGradient(44, 40, 10, 44, 40, 36);
  aura.addColorStop(0, "rgba(220, 232, 255, 0.32)");
  aura.addColorStop(1, "rgba(220, 232, 255, 0)");
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.arc(44, 40, 36, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.beginPath();
  ctx.arc(44, 40, 19, 0, Math.PI * 2);
  const disc = ctx.createLinearGradient(28, 24, 58, 56);
  disc.addColorStop(0, "#fafcff");
  disc.addColorStop(1, "#cfdcf2");
  ctx.fillStyle = disc;
  ctx.fill();
  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  ctx.arc(34, 35, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

gambarMatahari();
gambarBulan();

const starCanvas = document.getElementById("stars-canvas");
const starCtx = starCanvas.getContext("2d");
let stars = [];
let starOpacity = 0;
let starRafId = null;

function initStars() {
  starCanvas.width = window.innerWidth;
  starCanvas.height = window.innerHeight;
  stars = [];
  const count = window.innerWidth < 600 ? 95 : 150;
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * starCanvas.width,
      y: Math.random() * starCanvas.height * 0.78,
      radius: 0.4 + Math.random() * 1.25,
      alpha: 0.25 + Math.random() * 0.75,
      speed: 0.004 + Math.random() * 0.014,
    });
  }
  drawStarsFrame(false);
}

function drawStarsFrame(twinkle) {
  starCtx.clearRect(0, 0, starCanvas.width, starCanvas.height);
  if (starOpacity <= 0.02) return;
  for (const s of stars) {
    starCtx.globalAlpha = s.alpha;
    starCtx.fillStyle = "#f4f7ff";
    starCtx.beginPath();
    starCtx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
    starCtx.fill();
    if (twinkle) {
      s.alpha += s.speed;
      if (s.alpha <= 0.18 || s.alpha >= 1) s.speed *= -1;
    }
  }
  starCtx.globalAlpha = 1;
}

function syncStarLoop() {
  const shouldAnimate = !reducedMotion && starOpacity > 0.02 && !document.hidden;
  if (!shouldAnimate) {
    if (starRafId !== null) {
      cancelAnimationFrame(starRafId);
      starRafId = null;
    }
    drawStarsFrame(false);
    return;
  }
  if (starRafId === null) {
    const tickStars = () => {
      drawStarsFrame(true);
      if (!reducedMotion && starOpacity > 0.02 && !document.hidden) {
        starRafId = requestAnimationFrame(tickStars);
      } else {
        starRafId = null;
      }
    };
    starRafId = requestAnimationFrame(tickStars);
  }
}

initStars();

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

/* ---------------- Efek hujan dinamis sesuai data cuaca ---------------- */

let rainIntensity = 0;
let rainTint = [205, 224, 245];
let rainDrops = [];
let rainRafId = null;
let lastRainTime = 0;
let rainCssWidth = 0;
let rainCssHeight = 0;

function createDrop(w, h, scatterY) {
  const depth = 0.45 + Math.random() * 0.55;
  return {
    x: Math.random() * (w + 80) - 40,
    y: scatterY ? Math.random() * h : -Math.random() * 60,
    depth,
    len: 10 + depth * (8 + rainIntensity * 14),
    speed: (360 + rainIntensity * 480) * depth,
    alpha: (0.14 + rainIntensity * 0.34) * depth,
  };
}

function resizeRainCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  rainCssWidth = window.innerWidth;
  rainCssHeight = window.innerHeight;
  rainCanvas.width = Math.max(1, Math.round(rainCssWidth * dpr));
  rainCanvas.height = Math.max(1, Math.round(rainCssHeight * dpr));
  rainCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  syncDropPopulation();
  if (reducedMotion || rainIntensity <= 0.02) {
    renderRainFrame(0);
  }
}

function syncDropPopulation() {
  if (rainIntensity <= 0.02) {
    rainDrops = [];
    return;
  }
  const baseMax = rainCssWidth < 600 ? 90 : 170;
  const targetCount = Math.max(10, Math.round(baseMax * clamp(rainIntensity, 0.08, 1)));
  while (rainDrops.length < targetCount) {
    rainDrops.push(createDrop(rainCssWidth, rainCssHeight, true));
  }
  if (rainDrops.length > targetCount) {
    rainDrops.length = targetCount;
  }
}

function renderRainFrame(dtSec) {
  rainCtx.clearRect(0, 0, rainCssWidth, rainCssHeight);
  if (rainIntensity <= 0.02 || rainDrops.length === 0) return;

  const windX = -(55 + rainIntensity * 110);
  const [r, g, b] = rainTint;
  rainCtx.lineCap = "round";

  for (const drop of rainDrops) {
    if (dtSec > 0) {
      drop.x += windX * drop.depth * dtSec;
      drop.y += drop.speed * dtSec;
      if (drop.y > rainCssHeight + 30 || drop.x < -60) {
        Object.assign(drop, createDrop(rainCssWidth, rainCssHeight, false));
      }
    }
    const slant = (windX * drop.len) / Math.max(200, drop.speed);
    rainCtx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${drop.alpha.toFixed(3)})`;
    rainCtx.lineWidth = 0.7 + drop.depth * (0.45 + rainIntensity * 0.5);
    rainCtx.beginPath();
    rainCtx.moveTo(drop.x, drop.y);
    rainCtx.lineTo(drop.x + slant, drop.y + drop.len);
    rainCtx.stroke();
  }
}

function syncRainLoop() {
  const shouldRun = !reducedMotion && rainIntensity > 0.02 && !document.hidden;
  if (!shouldRun) {
    if (rainRafId !== null) {
      cancelAnimationFrame(rainRafId);
      rainRafId = null;
    }
    renderRainFrame(0);
    return;
  }
  if (rainRafId === null) {
    lastRainTime = performance.now();
    const tickRain = (now) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - lastRainTime) / 1000));
      lastRainTime = now;
      renderRainFrame(dt);
      if (!reducedMotion && rainIntensity > 0.02 && !document.hidden) {
        rainRafId = requestAnimationFrame(tickRain);
      } else {
        rainRafId = null;
      }
    };
    rainRafId = requestAnimationFrame(tickRain);
  }
}

resizeRainCanvas();

window.addEventListener("resize", () => {
  initStars();
  resizeRainCanvas();
  syncStarLoop();
  syncRainLoop();
});

document.addEventListener("visibilitychange", () => {
  syncStarLoop();
  syncRainLoop();
});

motionQuery.addEventListener("change", (e) => {
  reducedMotion = e.matches;
  syncStarLoop();
  syncRainLoop();
});

/* ---------------- Data cuaca live, waktu nyata & pemetaan langit ---------------- */

const weatherState = {
  city: FALLBACK_COORDS.city,
  lat: FALLBACK_COORDS.lat,
  lon: FALLBACK_COORDS.lon,
  utcOffsetSeconds: -new Date().getTimezoneOffset() * 60,
  tzLabel: formatOffsetTz(-new Date().getTimezoneOffset() * 60),
  isLiveMode: true,
  simHour: new Date().getHours(),
  loaded: false,
  current: {
    tempC: null,
    precipMm: 0,
    rainMm: 0,
    showersMm: 0,
    weatherCode: null,
    cloudPct: 20,
    probPct: null,
  },
  hourly: [],
};

function formatOffsetTz(offsetSec) {
  if (offsetSec === 25200) return "WIB";
  if (offsetSec === 28800) return "WITA";
  if (offsetSec === 32400) return "WIT";
  const hours = offsetSec / 3600;
  const sign = hours >= 0 ? "+" : "";
  return `UTC${sign}${Number.isInteger(hours) ? hours : hours.toFixed(1)}`;
}

function getLocationClock() {
  const shifted = new Date(Date.now() + weatherState.utcOffsetSeconds * 1000);
  const hours = shifted.getUTCHours();
  const minutes = shifted.getUTCMinutes();
  const seconds = shifted.getUTCSeconds();
  return {
    hours,
    minutes,
    seconds,
    fractionalHour: hours + minutes / 60 + seconds / 3600,
  };
}

function describeWeatherCode(code, probPct) {
  if (code === 0) return "Cerah";
  if (code === 1 || code === 2) return "Cerah Berawan";
  if (code === 3) return "Berawan";
  if (code === 45 || code === 48) return "Berkabut";
  if (code >= 51 && code <= 57) return "Gerimis";
  if (code === 61 || code === 80) return "Hujan Ringan";
  if (code === 63 || code === 81) return "Hujan Sedang";
  if (code === 65 || code === 66 || code === 67 || code === 82) return "Hujan Lebat";
  if (code >= 95) return "Badai Petir";
  if (typeof probPct === "number" && probPct >= 55) return "Berpotensi Hujan";
  return "Berawan Ringan";
}

function computeRainIntensity({ precipMm, rainMm, showersMm, probPct, weatherCode }) {
  const activeMm = Math.max(precipMm || 0, rainMm || 0, showersMm || 0);
  let wmoFactor = 0;
  if (weatherCode >= 95) wmoFactor = 0.92;
  else if (weatherCode === 65 || weatherCode === 67 || weatherCode === 82) wmoFactor = 0.8;
  else if (weatherCode === 63 || weatherCode === 66 || weatherCode === 81) wmoFactor = 0.56;
  else if (weatherCode === 61 || weatherCode === 80) wmoFactor = 0.36;
  else if (weatherCode >= 51 && weatherCode <= 57) wmoFactor = 0.22;

  const gaugeFactor = activeMm > 0 ? clamp(0.2 + Math.sqrt(activeMm) * 0.36, 0, 1) : 0;
  // Saat peluang hujan >= 50%, tampilkan rintik halus meski sensor curah belum mencatat hujan deras.
  const probFactor =
    typeof probPct === "number" && probPct >= 50
      ? clamp(((probPct - 45) / 55) * 0.24, 0, 0.24)
      : 0;

  return clamp(Math.max(wmoFactor, gaugeFactor, probFactor), 0, 1);
}

function formatRainBadge(probPct, weatherCode, activeMm) {
  const icon =
    rainIntensity >= 0.55
      ? "⛈️"
      : rainIntensity > 0.05
        ? "🌧️"
        : weatherCode === 3 || weatherCode === 45 || weatherCode === 48
          ? "☁️"
          : "🌤️";
  const text = describeWeatherCode(weatherCode, probPct);
  return `${icon} ${text}`;
}

function getActiveWeatherSnapshot() {
  const clk = getLocationClock();
  if (weatherState.isLiveMode) {
    const cur = weatherState.current;
    const fallbackHourlyProb = weatherState.hourly[clk.hours]?.probPct ?? null;
    const probPct = cur.probPct ?? fallbackHourlyProb;
    return {
      hourFloat: clk.fractionalHour,
      hours: clk.hours,
      minutes: clk.minutes,
      tempC: cur.tempC,
      precipMm: Math.max(cur.precipMm || 0, cur.rainMm || 0, cur.showersMm || 0),
      rainMm: cur.rainMm || 0,
      showersMm: cur.showersMm || 0,
      weatherCode: cur.weatherCode,
      cloudPct: cur.cloudPct ?? 20,
      probPct,
    };
  }

  const h = clamp(Math.round(weatherState.simHour), 0, 23);
  const slot = weatherState.hourly[h];
  return {
    hourFloat: h + 0.25,
    hours: h,
    minutes: 0,
    tempC: weatherState.current.tempC,
    precipMm: slot?.precipMm ?? 0,
    rainMm: slot?.precipMm ?? 0,
    showersMm: 0,
    weatherCode: slot?.weatherCode ?? weatherState.current.weatherCode ?? 1,
    cloudPct: slot?.cloudPct ?? 25,
    probPct: slot?.probPct ?? null,
  };
}

function applyEnvironment() {
  const snap = getActiveWeatherSnapshot();
  const clearSky = sampleSkyByHour(snap.hourFloat);
  const rainLevel = computeRainIntensity(snap);
  const cloudRatio = clamp((snap.cloudPct ?? 20) / 100, 0, 1);
  const overcastFactor = clamp(cloudRatio * 0.72 + rainLevel * 0.45, 0, 0.92);
  const overcastStops = pickOvercastStops(clearSky.daylight);

  let top = lerpHex(clearSky.top, overcastStops[0], overcastFactor);
  let mid = lerpHex(clearSky.mid, overcastStops[1], overcastFactor);
  let horizon = lerpHex(clearSky.horizon, overcastStops[2], overcastFactor);

  if (rainLevel > 0.25) {
    const stormTarget = clearSky.daylight > 0.35 ? STORM_DARK_DAY : STORM_DARK_NIGHT;
    const stormAmount = (rainLevel - 0.25) * 0.34;
    top = lerpHex(top, stormTarget, stormAmount);
    mid = lerpHex(mid, stormTarget, stormAmount * 0.75);
    horizon = lerpHex(horizon, stormTarget, stormAmount * 0.45);
  }

  const gradient = `linear-gradient(175deg, ${top} 0%, ${mid} 52%, ${horizon} 100%)`;
  root.style.setProperty("--scene-bg", gradient);
  metaThemeColor.setAttribute("content", top);

  const glowAlpha = clearSky.glowAlpha * (1 - overcastFactor * 0.65);
  const hazeAlpha = 0.08 + overcastFactor * 0.22;
  const glowCss = `radial-gradient(56% 46% at 80% 10%, ${hexToRgba(clearSky.glow, glowAlpha)}, transparent 64%), radial-gradient(88% 58% at 24% 110%, ${hexToRgba(horizon, hazeAlpha)}, transparent 72%)`;
  root.style.setProperty("--sky-glow", glowCss);

  const isNightPhase = clearSky.daylight < 0.28;
  document.body.classList.toggle("is-night", isNightPhase);

  const cloudDim = 1 - cloudRatio * 0.76 - rainLevel * 0.2;
  starOpacity = clamp(clearSky.starAlpha * clamp(1 - cloudRatio * 0.85, 0, 1), 0, 1);
  const sunOpacity = clamp(clearSky.sunAlpha * clamp(cloudDim, 0.12, 1), 0, 1);
  const moonOpacity = clamp(clearSky.moonAlpha * clamp(cloudDim, 0.15, 1), 0, 1);

  root.style.setProperty("--stars-opacity", starOpacity.toFixed(2));
  root.style.setProperty("--sun-opacity", sunOpacity.toFixed(2));
  root.style.setProperty("--moon-opacity", moonOpacity.toFixed(2));
  root.style.setProperty("--sun-shift-y", `${Math.round((1 - clearSky.sunAlpha) * 10)}px`);
  root.style.setProperty("--moon-shift-y", `${Math.round((1 - clearSky.moonAlpha) * -10)}px`);
  root.style.setProperty("--dust-opacity", clamp(1 - rainLevel * 0.9, 0.1, 1).toFixed(2));

  rainIntensity = rainLevel;
  rainTint =
    clearSky.daylight > 0.55
      ? [206, 224, 244]
      : clearSky.daylight > 0.18
        ? [220, 206, 202]
        : [152, 178, 212];

  syncDropPopulation();
  syncStarLoop();
  syncRainLoop();
  updateWeatherHud(snap);
}

function updateWeatherHud(snap) {
  const hh = String(snap.hours).padStart(2, "0");
  const mm = String(snap.minutes).padStart(2, "0");
  liveClock.textContent = `${hh}:${mm} ${weatherState.tzLabel}`;
  liveClock.dateTime = `${hh}:${mm}`;

  if (weatherState.isLiveMode) {
    liveBadge.textContent = "LIVE";
    liveBadge.classList.remove("is-sim");
    modeToggleBtn.textContent = "Simulasi Jam";
    modeToggleBtn.setAttribute("aria-expanded", "false");
    simDrawer.hidden = true;
  } else {
    liveBadge.textContent = "SIMULASI";
    liveBadge.classList.add("is-sim");
    modeToggleBtn.textContent = "Kembali Live";
    modeToggleBtn.setAttribute("aria-expanded", "true");
    simDrawer.hidden = false;
    simHourHint.textContent = `${hh}:00`;
  }

  const condBadge = weatherState.loaded
    ? formatRainBadge(snap.probPct, snap.weatherCode, snap.precipMm)
    : snap.hourFloat >= 6 && snap.hourFloat < 18
      ? "🌤️ Cerah Lokal"
      : "🌙 Malam Lokal";
  const tempSuffix = typeof snap.tempC === "number" ? ` · ${Math.round(snap.tempC)}°C` : "";
  weatherSummary.textContent = `${condBadge}${tempSuffix}`;

  if (typeof snap.probPct === "number") {
    rainProbEl.textContent = `Peluang hujan ${Math.round(snap.probPct)}%`;
  } else {
    rainProbEl.textContent = weatherState.loaded ? "Peluang hujan 0%" : "Cuaca perangkat";
  }

  weatherLocEl.textContent = weatherState.city;
}

async function fetchJsonWithTimeout(url, timeoutMs = 6000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal, cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

async function detectIpLocation() {
  try {
    const geo = await fetchJsonWithTimeout("https://get.geojs.io/v1/ip/geo.json");
    const lat = Number(geo.latitude);
    const lon = Number(geo.longitude);
    if (Number.isFinite(lat) && Number.isFinite(lon)) {
      return { lat, lon, city: geo.city || geo.country || FALLBACK_COORDS.city };
    }
  } catch {
    // Lanjut ke fallback berikutnya
  }

  try {
    const who = await fetchJsonWithTimeout("https://ipwho.is/");
    if (who && who.success !== false && Number.isFinite(who.latitude) && Number.isFinite(who.longitude)) {
      return { lat: who.latitude, lon: who.longitude, city: who.city || FALLBACK_COORDS.city };
    }
  } catch {
    // Pakai koordinat default
  }

  return { ...FALLBACK_COORDS };
}

async function refreshLiveWeather(lat, lon, cityLabel) {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: "temperature_2m,precipitation,rain,showers,weather_code,cloud_cover,is_day",
    hourly: "precipitation_probability,precipitation,weather_code,cloud_cover",
    forecast_days: "1",
    timezone: "auto",
  });

  const data = await fetchJsonWithTimeout(`https://api.open-meteo.com/v1/forecast?${params}`);
  weatherState.lat = lat;
  weatherState.lon = lon;
  if (cityLabel) weatherState.city = cityLabel;

  if (typeof data.utc_offset_seconds === "number") {
    weatherState.utcOffsetSeconds = data.utc_offset_seconds;
    weatherState.tzLabel = formatOffsetTz(data.utc_offset_seconds);
  }

  const hourlyTimes = data.hourly?.time || [];
  const hourlyProbs = data.hourly?.precipitation_probability || [];
  const hourlyPrecip = data.hourly?.precipitation || [];
  const hourlyCodes = data.hourly?.weather_code || [];
  const hourlyClouds = data.hourly?.cloud_cover || [];

  weatherState.hourly = hourlyTimes.map((_, idx) => ({
    probPct: typeof hourlyProbs[idx] === "number" ? hourlyProbs[idx] : null,
    precipMm: typeof hourlyPrecip[idx] === "number" ? hourlyPrecip[idx] : 0,
    weatherCode: typeof hourlyCodes[idx] === "number" ? hourlyCodes[idx] : 0,
    cloudPct: typeof hourlyClouds[idx] === "number" ? hourlyClouds[idx] : 20,
  }));

  const cur = data.current || {};
  const clk = getLocationClock();
  weatherState.current = {
    tempC: typeof cur.temperature_2m === "number" ? cur.temperature_2m : null,
    precipMm: typeof cur.precipitation === "number" ? cur.precipitation : 0,
    rainMm: typeof cur.rain === "number" ? cur.rain : 0,
    showersMm: typeof cur.showers === "number" ? cur.showers : 0,
    weatherCode: typeof cur.weather_code === "number" ? cur.weather_code : null,
    cloudPct: typeof cur.cloud_cover === "number" ? cur.cloud_cover : 20,
    probPct: weatherState.hourly[clk.hours]?.probPct ?? null,
  };
  weatherState.loaded = true;
  applyEnvironment();
}

async function initLiveWeather() {
  applyEnvironment();
  const loc = await detectIpLocation();
  try {
    await refreshLiveWeather(loc.lat, loc.lon, loc.city);
  } catch {
    // Tetap pakai jam perangkat bila API tidak terjangkau
    weatherState.city = `${loc.city} (Offline)`;
    applyEnvironment();
  }
}

modeToggleBtn.addEventListener("click", () => {
  weatherState.isLiveMode = !weatherState.isLiveMode;
  if (!weatherState.isLiveMode) {
    weatherState.simHour = getLocationClock().hours;
    timeSlider.value = String(weatherState.simHour);
  }
  applyEnvironment();
});

timeSlider.addEventListener("input", (e) => {
  weatherState.isLiveMode = false;
  weatherState.simHour = parseInt(e.target.value, 10) || 0;
  applyEnvironment();
});

geoBtn.addEventListener("click", () => {
  if (!("geolocation" in navigator)) {
    weatherLocEl.textContent = "GPS tidak didukung";
    return;
  }
  geoBtn.disabled = true;
  geoBtn.textContent = "📍 Mencari…";

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      try {
        await refreshLiveWeather(pos.coords.latitude, pos.coords.longitude, "Lokasi GPS");
      } catch {
        weatherLocEl.textContent = "Gagal muat GPS";
      } finally {
        geoBtn.disabled = false;
        geoBtn.textContent = "📍 GPS";
      }
    },
    () => {
      geoBtn.disabled = false;
      geoBtn.textContent = "📍 Izin ditolak";
      setTimeout(() => {
        geoBtn.textContent = "📍 GPS";
      }, 2200);
    },
    { enableHighAccuracy: false, timeout: 7000, maximumAge: 300000 }
  );
});

initLiveWeather();
setInterval(() => {
  if (weatherState.isLiveMode) applyEnvironment();
}, 15000);
setInterval(() => {
  refreshLiveWeather(weatherState.lat, weatherState.lon, weatherState.city).catch(() => {});
}, WEATHER_REFRESH_MS);

/* ---------------- Render & navigasi buku ---------------- */

function pageHTML(i) {
  return templates[i].innerHTML;
}

function updateChrome() {
  document.body.dataset.page = String(page);
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

function waitForAudioReady(minMs, maxMs) {
  const minDelay = new Promise((resolve) => setTimeout(resolve, minMs));
  const audioReady =
    audio.readyState >= 3
      ? Promise.resolve()
      : new Promise((resolve) => {
          const done = () => {
            clearTimeout(capTimer);
            audio.removeEventListener("canplay", done);
            audio.removeEventListener("error", done);
            resolve();
          };
          const capTimer = setTimeout(done, maxMs);
          audio.addEventListener("canplay", done, { once: true });
          audio.addEventListener("error", done, { once: true });
        });
  return Promise.all([minDelay, audioReady]);
}

function cekPassword() {
  const boxes = pinBoxes();
  const pinMasuk = boxes.map((b) => b.value).join("");
  if (pinMasuk.length !== 4) return;

  if (pinMasuk === PW) {
    hideError();
    audio.play().catch((e) => console.log("Audio diblokir: ", e));
    loadingScreen.hidden = false;

    waitForAudioReady(650, 1800).then(() => {
      loadingScreen.hidden = true;
      locked = false;
      flipTo(1, 1);
    });
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
  if (audio.readyState === 0) audio.load();
  audio
    .play()
    .then(() => {
      audio.pause();
      audio.currentTime = 0;
    })
    .catch(() => console.log("Audio unlock tertunda, aman."));

  popup.style.display = "none";
  document.body.classList.remove("has-popup");
  setTimeout(() => {
    const first = pinBoxes()[0];
    if (first) first.focus();
  }, 400);
});

/* ---------------- Mulai ---------------- */

render(0);
