/* ============================================================
   Nocturne Keys — Rhythm Tap 4-Lane dengan Nada Kustom
   Melodi: "Nocturne in F Major" (F Mayor, 108 BPM, 24 Birama)
   ============================================================ */

(() => {
  "use strict";

  const BASE_BPM = 108;
  const TOTAL_BEATS = 97;
  const LEAD_IN_SEC = 1.6;
  const HIT_LINE_RATIO = 0.84;
  const PERFECT_WINDOW = 0.08;
  const GOOD_WINDOW = 0.155;
  const MISS_AFTER = 0.175;
  const STORAGE_KEY = "theLastOne_rhythmBest_v1";

  const LANE_COLORS = [
    { fill: "#5ca8ad", glow: "rgba(92, 168, 173, 0.45)", edge: "#b6e5e8" },
    { fill: "#d6a853", glow: "rgba(214, 168, 83, 0.45)", edge: "#f9e3ad" },
    { fill: "#d98680", glow: "rgba(217, 134, 128, 0.45)", edge: "#fbd2ce" },
    { fill: "#ede0c4", glow: "rgba(237, 224, 196, 0.48)", edge: "#ffffff" },
  ];

  const KEY_TO_LANE = { d: 0, f: 1, j: 2, k: 3 };
  const CAT_SFX_PATHS = ["cat-1.mp3", "cat-2.mp3", "cat-3.mp3"];

  // Melodi utama [beat, lane(0-3), midiNote]
  // Pemetaan nada naik dari kiri ke kanan:
  // Lane 0: E4(64), F4(65) | Lane 1: G4(67), A4(69)
  // Lane 2: Bb4(70), C5(72), D5(74) | Lane 3: E5(76), F5(77), G5(79), A5(81)
  const RAW_MELODY = [
    // Phrase A1 (Birama 1-4: F -> C/E -> Dm7 -> Bb)
    [0, 1, 69], [1, 2, 72], [2, 3, 77], [3, 2, 72],
    [4, 3, 76], [5, 2, 74], [6, 2, 72], [7, 1, 67],
    [8, 1, 69], [9, 2, 74], [10, 2, 72], [10.5, 1, 69], [11, 0, 65],
    [12, 1, 67], [13, 1, 69], [14, 2, 70], [15, 0, 65],

    // Phrase A2 (Birama 5-8: F -> C -> Gm7 -> C7)
    [16, 1, 69], [16.5, 2, 72], [17, 3, 77], [18, 3, 79], [19, 3, 77],
    [20, 3, 76], [21, 2, 72], [22, 1, 67], [22.5, 1, 69], [23, 2, 70],
    [24, 1, 69], [25, 1, 67], [26, 0, 65], [27, 1, 67],
    [28, 2, 72], [29, 1, 69], [30, 1, 67], [31, 0, 64],

    // Phrase B1 (Birama 9-12: Bb -> C -> Am7 -> Dm)
    [32, 2, 74], [32.5, 2, 72], [33, 2, 70], [34, 1, 69], [35, 2, 70],
    [36, 3, 76], [36.5, 2, 74], [37, 2, 72], [38, 1, 67], [39, 2, 72],
    [40, 3, 77], [40.5, 3, 76], [41, 2, 74], [42, 2, 72], [43, 1, 69],
    [44, 2, 74], [45, 1, 69], [46, 0, 65], [46.5, 1, 67], [47, 1, 69],

    // Phrase B2 (Birama 13-16: Gm7 -> C -> F -> C/E)
    [48, 2, 70], [48.5, 1, 69], [49, 1, 67], [50, 2, 74], [51, 2, 72],
    [52, 3, 76], [53, 3, 79], [54, 3, 77], [54.5, 3, 76], [55, 2, 72],
    [56, 3, 81], [57, 3, 79], [58, 3, 77], [59, 2, 72],
    [60, 2, 74], [60.5, 3, 76], [61, 2, 72], [62, 1, 67], [63, 1, 69],

    // Phrase C / Finale (Birama 17-24: Dm -> Bb -> F -> C -> Gm7 -> C7 -> F)
    [64, 3, 77], [64.5, 3, 76], [65, 2, 74], [66, 1, 69], [67, 2, 72],
    [68, 2, 74], [68.5, 3, 77], [69, 3, 79], [70, 3, 77], [71, 2, 74],
    [72, 2, 72], [72.5, 2, 74], [73, 3, 77], [74, 3, 81], [75, 3, 79],
    [76, 3, 76], [76.5, 2, 74], [77, 2, 72], [78, 1, 67], [79, 2, 72],
    [80, 2, 70], [80.5, 2, 72], [81, 2, 74], [82, 3, 77], [83, 3, 76],
    [84, 2, 74], [84.5, 2, 72], [85, 1, 69], [86, 1, 67], [87, 0, 64],
    [88, 0, 65], [89, 1, 69], [90, 2, 72], [91, 3, 77],
    [92, 2, 72], [93, 1, 69], [94, 0, 65],
  ];

  // Progresi akor per birama (4 ketukan per birama): [bassMidi, chordMidi[]]
  const BAR_CHORDS = [
    [41, [53, 57, 60]], [40, [52, 55, 60]], [38, [50, 53, 57, 60]], [46, [53, 58, 62]],
    [41, [53, 57, 60]], [48, [55, 60, 64]], [43, [53, 58, 62]], [48, [55, 58, 64]],
    [46, [53, 58, 62]], [48, [55, 60, 64]], [45, [52, 55, 60]], [50, [53, 57, 62]],
    [43, [53, 58, 62]], [48, [55, 60, 64]], [41, [53, 57, 60]], [40, [52, 55, 60]],
    [50, [53, 57, 62]], [46, [53, 58, 62]], [41, [53, 57, 60]], [48, [55, 60, 64]],
    [43, [53, 58, 62]], [48, [55, 58, 64]], [41, [53, 57, 60]], [41, [53, 57, 60]],
  ];

  // Referensi DOM
  const canvas = document.getElementById("rhythmCanvas");
  const ctx = canvas ? canvas.getContext("2d") : null;
  const canvasStage = document.getElementById("canvasStage");
  const stageOverlay = document.getElementById("stageOverlay");
  const overlayTitle = document.getElementById("overlayTitle");
  const overlayDesc = document.getElementById("overlayDesc");
  const overlayStartBtn = document.getElementById("overlayStartBtn");

  const startPauseBtn = document.getElementById("startPauseBtn");
  const restartGameBtn = document.getElementById("restartGameBtn");
  const muteBtn = document.getElementById("muteBtn");
  const speedButtons = Array.from(document.querySelectorAll(".speed-btn"));
  const lanePads = Array.from(document.querySelectorAll(".lane-pad"));
  const jumpToGameBtn = document.getElementById("jumpToGameBtn");

  const hudScore = document.getElementById("hudScore");
  const hudCombo = document.getElementById("hudCombo");
  const hudAccuracy = document.getElementById("hudAccuracy");
  const hudBest = document.getElementById("hudBest");
  const cardBestScore = document.getElementById("cardBestScore");
  const trackMeta = document.getElementById("trackMeta");
  const songProgressBar = document.getElementById("songProgressBar");
  const songProgressFill = document.getElementById("songProgressFill");
  const gameLiveStatus = document.getElementById("gameLiveStatus");

  const resultDialog = document.getElementById("resultDialog");
  const resultGrade = document.getElementById("resultGrade");
  const resultTitle = document.getElementById("resultTitle");
  const resultMessage = document.getElementById("resultMessage");
  const resScore = document.getElementById("resScore");
  const resAccuracy = document.getElementById("resAccuracy");
  const resMaxCombo = document.getElementById("resMaxCombo");
  const resPerfect = document.getElementById("resPerfect");
  const resGood = document.getElementById("resGood");
  const resMiss = document.getElementById("resMiss");

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  // State permainan
  let speed = 1;
  let state = "idle"; // "idle" | "playing" | "paused" | "ended"
  let isMuted = false;

  let notes = [];
  let backingEvents = [];
  let nextMelodyScheduleIdx = 0;
  let nextBackingScheduleIdx = 0;
  let totalDuration = 0;

  let songStartAudioTime = 0;
  let pausedElapsed = -LEAD_IN_SEC;

  let score = 0;
  let combo = 0;
  let maxCombo = 0;
  let counts = { perfect: 0, good: 0, miss: 0 };

  let laneFlash = [0, 0, 0, 0];
  let effects = [];
  let lastJudgment = { text: "", color: "#f6ecd8", until: 0 };

  let audioCtx = null;
  let masterGain = null;
  let noiseBuffer = null;
  const activeNodes = new Set();
  let catArrayBuffers = [];
  let catAudioBuffers = [];
  let catBytesPromise = null;
  let catDecodePromise = null;
  let activeCatSource = null;
  let activeCatGain = null;

  let rafId = null;
  let schedulerId = null;
  let viewWidth = 560;
  let viewHeight = 380;

  /* ---------------- Utilitas Audio & Penyimpanan ---------------- */

  function midiToFreq(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  function beatDuration() {
    return 60 / (BASE_BPM * speed);
  }

  function travelDuration() {
    return 1.45 / Math.sqrt(speed);
  }

  function readBestRecords() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  function writeBestRecord(newScore, grade) {
    try {
      const records = readBestRecords();
      const key = String(speed);
      const prev = records[key];
      if (!prev || newScore > prev.score) {
        records[key] = { score: newScore, grade };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
      }
      if (!records.overall || newScore > records.overall.score) {
        records.overall = { score: newScore, grade };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
      }
    } catch {
      // Abaikan jika storage dibatasi
    }
  }

  function refreshBestDisplays() {
    const records = readBestRecords();
    const forSpeed = records[String(speed)];
    const overall = records.overall;
    if (hudBest) hudBest.textContent = forSpeed ? String(forSpeed.score) : "0";
    if (cardBestScore) cardBestScore.textContent = overall ? `${overall.score} (${overall.grade})` : "—";
  }

  // Pada halaman katalog utama, cukup tampilkan skor terbaik lalu hentikan inisialisasi arena
  if (!canvas || !ctx) {
    refreshBestDisplays();
    return;
  }

  function preloadCatBytes() {
    if (catBytesPromise) return catBytesPromise;
    catBytesPromise = Promise.all(
      CAT_SFX_PATHS.map((url) =>
        fetch(url)
          .then((res) => (res.ok ? res.arrayBuffer() : null))
          .catch(() => null)
      )
    ).then((buffers) => {
      catArrayBuffers = buffers.filter(Boolean);
      return catArrayBuffers;
    });
    return catBytesPromise;
  }

  function decodeCatBuffers(context) {
    if (!context || catDecodePromise) return catDecodePromise;
    catDecodePromise = preloadCatBytes().then((rawList) =>
      Promise.all(
        rawList.map((raw) => context.decodeAudioData(raw.slice(0)).catch(() => null))
      ).then((decoded) => {
        catAudioBuffers = decoded.filter(Boolean);
        return catAudioBuffers;
      })
    );
    return catDecodePromise;
  }

  function ensureAudio() {
    if (!audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      audioCtx = new Ctx();
      masterGain = audioCtx.createGain();
      masterGain.gain.value = isMuted ? 0 : 0.85;
      masterGain.connect(audioCtx.destination);
      noiseBuffer = createNoiseBuffer(audioCtx);
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }
    decodeCatBuffers(audioCtx);
    return audioCtx;
  }

  function createNoiseBuffer(ctx) {
    const len = Math.floor(ctx.sampleRate * 0.08);
    const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
    const ch = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) {
      ch[i] = (Math.random() * 2 - 1) * Math.exp(-i / (len * 0.25));
    }
    return buffer;
  }

  function trackNode(node) {
    activeNodes.add(node);
    node.onended = () => activeNodes.delete(node);
  }

  function stopAllAudioNodes() {
    for (const node of activeNodes) {
      try {
        node.stop();
      } catch {
        // Sudah berhenti
      }
    }
    activeNodes.clear();
  }

  function playSynthTone(freq, when, dur, type, peakGain, attack = 0.012) {
    if (!audioCtx || !masterGain || when + dur < audioCtx.currentTime) return;
    const start = Math.max(when, audioCtx.currentTime);
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.linearRampToValueAtTime(peakGain, start + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);

    osc.connect(gain).connect(masterGain);
    trackNode(osc);
    osc.start(start);
    osc.stop(start + dur + 0.02);
  }

  function playSoftTick(when, accent) {
    if (!audioCtx || !masterGain || !noiseBuffer) return;
    const start = Math.max(when, audioCtx.currentTime);
    const src = audioCtx.createBufferSource();
    src.buffer = noiseBuffer;

    const filter = audioCtx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = accent ? 2400 : 4200;
    filter.Q.value = 1.6;

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(accent ? 0.065 : 0.03, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.055);

    src.connect(filter).connect(gain).connect(masterGain);
    trackNode(src);
    src.start(start);
  }

  function playHitChime(midi, tier) {
    if (!ensureAudio()) return;
    const now = audioCtx.currentTime;
    const freq = midiToFreq(midi);
    const vol = tier === "perfect" ? 0.16 : 0.11;
    playSynthTone(freq, now, 0.36, "triangle", vol, 0.006);
    playSynthTone(freq * 2, now, 0.22, "sine", vol * 0.42, 0.005);
  }

  function playEmptyTap(lane) {
    if (!ensureAudio()) return;
    const now = audioCtx.currentTime;
    playSynthTone(180 + lane * 26, now, 0.07, "sine", 0.04, 0.004);
  }

  function playWrongNoteCat(lane) {
    if (!ensureAudio()) return;
    const now = audioCtx.currentTime;

    if (catAudioBuffers.length > 0) {
      if (activeCatSource && activeCatGain) {
        try {
          activeCatGain.gain.cancelScheduledValues(now);
          activeCatGain.gain.setValueAtTime(Math.max(activeCatGain.gain.value, 0.0001), now);
          activeCatGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);
          activeCatSource.stop(now + 0.04);
        } catch {
          // Node sudah berhenti
        }
      }

      const buf = catAudioBuffers[Math.floor(Math.random() * catAudioBuffers.length)];
      const src = audioCtx.createBufferSource();
      const gain = audioCtx.createGain();
      src.buffer = buf;
      src.playbackRate.value = 0.98 + (lane % 4) * 0.02;

      gain.gain.setValueAtTime(0.45, now);
      src.connect(gain).connect(masterGain);

      activeCatSource = src;
      activeCatGain = gain;
      activeNodes.add(src);
      src.onended = () => {
        activeNodes.delete(src);
        if (activeCatSource === src) {
          activeCatSource = null;
          activeCatGain = null;
        }
      };
      src.start(now);
      return;
    }

    decodeCatBuffers(audioCtx);
    playSynthTone(560 + lane * 45, now, 0.16, "triangle", 0.09, 0.015);
  }

  /* ---------------- Pembangunan Chart & Pengiring ---------------- */

  function buildTrack() {
    const bSec = beatDuration();
    totalDuration = TOTAL_BEATS * bSec;

    notes = RAW_MELODY.map(([beat, lane, midi], idx) => ({
      id: idx,
      beat,
      lane,
      midi,
      time: beat * bSec,
      hit: false,
      missed: false,
    }));

    backingEvents = [];
    BAR_CHORDS.forEach(([bassMidi, chordMidis], barIdx) => {
      const barBeat = barIdx * 4;
      backingEvents.push({
        time: barBeat * bSec,
        kind: "bar",
        bassMidi,
        chordMidis,
        dur: 3.6 * bSec,
      });
      backingEvents.push({
        time: (barBeat + 2) * bSec,
        kind: "half",
        bassMidi: bassMidi + 7,
        dur: 1.5 * bSec,
      });
      for (let sub = 0; sub < 4; sub++) {
        backingEvents.push({
          time: (barBeat + sub) * bSec,
          kind: "tick",
          accent: sub === 0 || sub === 2,
        });
      }
    });
    backingEvents.sort((a, b) => a.time - b.time);
  }

  function scheduleUpcomingAudio() {
    if (state !== "playing" || !audioCtx) return;
    const lookAheadUntil = audioCtx.currentTime + 0.18;

    while (nextMelodyScheduleIdx < notes.length) {
      const note = notes[nextMelodyScheduleIdx];
      const scheduledAt = songStartAudioTime + note.time;
      if (scheduledAt > lookAheadUntil) break;
      // Nada penuntun lembut agar ritme lagu tetap terdengar alami
      playSynthTone(midiToFreq(note.midi), scheduledAt, 0.42 / speed, "sine", 0.075, 0.015);
      nextMelodyScheduleIdx++;
    }

    while (nextBackingScheduleIdx < backingEvents.length) {
      const ev = backingEvents[nextBackingScheduleIdx];
      const scheduledAt = songStartAudioTime + ev.time;
      if (scheduledAt > lookAheadUntil) break;

      if (ev.kind === "bar") {
        playSynthTone(midiToFreq(ev.bassMidi), scheduledAt, ev.dur * 0.85, "triangle", 0.11, 0.02);
        ev.chordMidis.forEach((m) => {
          playSynthTone(midiToFreq(m), scheduledAt, ev.dur, "sine", 0.032, 0.04);
        });
      } else if (ev.kind === "half") {
        playSynthTone(midiToFreq(ev.bassMidi), scheduledAt, ev.dur * 0.8, "triangle", 0.065, 0.02);
      } else if (ev.kind === "tick") {
        playSoftTick(scheduledAt, ev.accent);
      }
      nextBackingScheduleIdx++;
    }
  }

  /* ---------------- Status, HUD & Siklus Game ---------------- */

  function currentElapsed() {
    if (state === "playing" && audioCtx) {
      return audioCtx.currentTime - songStartAudioTime;
    }
    return pausedElapsed;
  }

  function updateHud() {
    hudScore.textContent = String(score);
    hudCombo.textContent = String(combo);
    const totalDone = counts.perfect + counts.good + counts.miss;
    const acc =
      totalDone === 0
        ? 100
        : Math.round(((counts.perfect * 100 + counts.good * 60) / (totalDone * 100)) * 100);
    hudAccuracy.textContent = `${acc}%`;
  }

  function updateProgress(elapsed) {
    const pct = totalDuration > 0 ? Math.max(0, Math.min(100, (elapsed / totalDuration) * 100)) : 0;
    songProgressFill.style.width = `${pct.toFixed(1)}%`;
    songProgressBar.setAttribute("aria-valuenow", String(Math.round(pct)));
  }

  function setSpeedControlsDisabled(disabled) {
    speedButtons.forEach((btn) => {
      btn.disabled = disabled;
    });
  }

  function resetGameState() {
    stopLoop();
    stopAllAudioNodes();
    buildTrack();

    state = "idle";
    pausedElapsed = -LEAD_IN_SEC;
    nextMelodyScheduleIdx = 0;
    nextBackingScheduleIdx = 0;

    score = 0;
    combo = 0;
    maxCombo = 0;
    counts = { perfect: 0, good: 0, miss: 0 };
    laneFlash = [0, 0, 0, 0];
    effects = [];
    lastJudgment = { text: "", color: "#f6ecd8", until: 0 };

    updateHud();
    updateProgress(0);
    refreshBestDisplays();

    setSpeedControlsDisabled(false);
    startPauseBtn.textContent = "Mulai ▶";
    restartGameBtn.disabled = true;

    overlayTitle.textContent = "Siap Bermain?";
    overlayDesc.innerHTML =
      "Tekan tombol <strong>Mulai</strong>, lalu ketuk jalur tepat saat not menyentuh garis emas.";
    overlayStartBtn.textContent = "Mulai Lagu ▶";
    stageOverlay.hidden = false;

    drawFrame(-LEAD_IN_SEC);
  }

  function startGame() {
    if (!ensureAudio()) return;
    if (state === "ended" || state === "idle") {
      buildTrack();
      score = 0;
      combo = 0;
      maxCombo = 0;
      counts = { perfect: 0, good: 0, miss: 0 };
      pausedElapsed = -LEAD_IN_SEC;
      nextMelodyScheduleIdx = 0;
      nextBackingScheduleIdx = 0;
      updateHud();
    }

    songStartAudioTime = audioCtx.currentTime - pausedElapsed;

    // Pastikan scheduler tidak memutar nada yang sudah lewat saat resume
    while (
      nextMelodyScheduleIdx < notes.length &&
      notes[nextMelodyScheduleIdx].time < pausedElapsed
    ) {
      nextMelodyScheduleIdx++;
    }
    while (
      nextBackingScheduleIdx < backingEvents.length &&
      backingEvents[nextBackingScheduleIdx].time < pausedElapsed
    ) {
      nextBackingScheduleIdx++;
    }

    state = "playing";
    stageOverlay.hidden = true;
    setSpeedControlsDisabled(true);
    startPauseBtn.textContent = "Jeda ❚❚";
    restartGameBtn.disabled = false;
    gameLiveStatus.textContent = "Lagu dimulai. Ketuk jalur D, F, J, K atau tombol di layar.";

    startLoop();
  }

  function pauseGame() {
    if (state !== "playing") return;
    pausedElapsed = currentElapsed();
    state = "paused";
    stopLoop();
    stopAllAudioNodes();

    startPauseBtn.textContent = "Lanjutkan ▶";
    overlayTitle.textContent = "Permainan Dijeda";
    overlayDesc.textContent = "Tarik napas sejenak, lalu lanjutkan kapan saja.";
    overlayStartBtn.textContent = "Lanjutkan ▶";
    stageOverlay.hidden = false;
    gameLiveStatus.textContent = "Permainan dijeda.";
    drawFrame(pausedElapsed);
  }

  function finishGame() {
    stopLoop();
    state = "ended";
    updateProgress(totalDuration);
    setSpeedControlsDisabled(false);
    startPauseBtn.textContent = "Main Lagi ▶";

    const totalNotes = notes.length || 1;
    const accuracy = Math.round(
      ((counts.perfect * 100 + counts.good * 60) / (totalNotes * 100)) * 100
    );
    let grade = "C";
    let msg = "Langkah awal yang manis! Coba lagi untuk ritme yang lebih pas.";
    if (accuracy >= 95) {
      grade = "S";
      msg = "Luar biasa! Jarimu menari seirama dengan setiap nada malam ini.";
    } else if (accuracy >= 85) {
      grade = "A";
      msg = "Keren sekali! Hampir semua nada jatuh tepat pada waktunya.";
    } else if (accuracy >= 70) {
      grade = "B";
      msg = "Bagus! Sedikit lagi menyentuh kesempurnaan melodi.";
    }

    writeBestRecord(score, grade);
    refreshBestDisplays();

    resultGrade.textContent = grade;
    resultTitle.textContent = "Lagu Selesai!";
    resultMessage.textContent = msg;
    resScore.textContent = String(score);
    resAccuracy.textContent = `${accuracy}%`;
    resMaxCombo.textContent = String(maxCombo);
    resPerfect.textContent = String(counts.perfect);
    resGood.textContent = String(counts.good);
    resMiss.textContent = String(counts.miss);

    gameLiveStatus.textContent = `Lagu selesai. Skor ${score}, akurasi ${accuracy} persen, nilai ${grade}.`;
    if (typeof resultDialog.showModal === "function") {
      resultDialog.showModal();
    }
  }

  /* ---------------- Penilaian Ketukan ---------------- */

  function triggerLane(laneIndex) {
    if (laneIndex < 0 || laneIndex > 3) return;
    flashPad(laneIndex);
    laneFlash[laneIndex] = 1;

    if (state !== "playing") {
      playEmptyTap(laneIndex);
      return;
    }

    const elapsed = currentElapsed();
    let bestNote = null;
    let bestDelta = Infinity;

    for (const n of notes) {
      if (n.lane !== laneIndex || n.hit || n.missed) continue;
      const delta = Math.abs(n.time - elapsed);
      if (delta < bestDelta) {
        bestDelta = delta;
        bestNote = n;
      }
      if (n.time > elapsed + GOOD_WINDOW + 0.05) break;
    }

    if (!bestNote || bestDelta > GOOD_WINDOW) {
      playWrongNoteCat(laneIndex);
      return;
    }

    bestNote.hit = true;
    const isPerfect = bestDelta <= PERFECT_WINDOW;
    const tier = isPerfect ? "perfect" : "good";

    combo++;
    if (combo > maxCombo) maxCombo = combo;

    if (isPerfect) {
      counts.perfect++;
      score += 100 + Math.min(combo, 40) * 2;
      registerJudgment("PERFECT!", "#f5d782", laneIndex);
    } else {
      counts.good++;
      score += 60 + Math.min(combo, 40);
      registerJudgment("GOOD", "#8fd3d8", laneIndex);
    }

    playHitChime(bestNote.midi, tier);
    updateHud();
  }

  function registerJudgment(text, color, laneIndex) {
    const now = performance.now();
    lastJudgment = { text, color, until: now + 520 };
    if (!prefersReducedMotion.matches) {
      effects.push({
        lane: laneIndex,
        born: now,
        color,
      });
    }
  }

  function flashPad(laneIndex) {
    const pad = lanePads[laneIndex];
    if (!pad) return;
    pad.classList.add("is-pressed");
    setTimeout(() => pad.classList.remove("is-pressed"), 110);
  }

  function processMissedNotes(elapsed) {
    let changed = false;
    for (const n of notes) {
      if (!n.hit && !n.missed && elapsed - n.time > MISS_AFTER) {
        n.missed = true;
        counts.miss++;
        combo = 0;
        lastJudgment = { text: "MISS", color: "#d67a73", until: performance.now() + 420 };
        changed = true;
      }
    }
    if (changed) updateHud();
  }

  /* ---------------- Render Canvas ---------------- */

  function resizeCanvas() {
    const rect = canvasStage.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    viewWidth = rect.width;
    viewHeight = rect.height;
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawFrame(currentElapsed());
  }

  function drawFrame(elapsed) {
    const w = viewWidth;
    const h = viewHeight;
    const laneW = w / 4;
    const hitY = h * HIT_LINE_RATIO;
    const travel = travelDuration();
    const bSec = beatDuration();

    ctx.clearRect(0, 0, w, h);

    // Latar gradien lembut
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, "#14272a");
    bg.addColorStop(1, "#091416");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Garis ketukan gulir (membuat ritme terlihat jelas)
    const minBeat = Math.max(0, Math.floor((elapsed - 0.5) / bSec));
    const maxBeat = Math.min(TOTAL_BEATS, Math.ceil((elapsed + travel) / bSec));
    for (let b = minBeat; b <= maxBeat; b++) {
      const t = b * bSec;
      const y = hitY - ((t - elapsed) / travel) * hitY;
      if (y < -10 || y > h) continue;
      ctx.strokeStyle = b % 4 === 0 ? "rgba(193, 154, 75, 0.22)" : "rgba(255, 255, 255, 0.05)";
      ctx.lineWidth = b % 4 === 0 ? 1.2 : 1;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Sorotan flash jalur saat ditekan
    for (let i = 0; i < 4; i++) {
      if (laneFlash[i] > 0.01) {
        const grad = ctx.createLinearGradient(0, hitY * 0.25, 0, h);
        grad.addColorStop(0, "transparent");
        grad.addColorStop(1, `rgba(229, 195, 119, ${(laneFlash[i] * 0.22).toFixed(3)})`);
        ctx.fillStyle = grad;
        ctx.fillRect(i * laneW, 0, laneW, h);
        laneFlash[i] *= 0.84;
      }
    }

    // Pemisah jalur
    ctx.strokeStyle = "rgba(193, 154, 75, 0.2)";
    ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(i * laneW, 0);
      ctx.lineTo(i * laneW, h);
      ctx.stroke();
    }

    // Garis hit emas
    ctx.strokeStyle = "rgba(229, 195, 119, 0.82)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, hitY);
    ctx.lineTo(w, hitY);
    ctx.stroke();

    // Reseptor jalur pada garis hit
    const padRadius = Math.min(30, Math.max(18, laneW * 0.21));
    for (let i = 0; i < 4; i++) {
      const cx = i * laneW + laneW / 2;
      ctx.strokeStyle = LANE_COLORS[i].edge;
      ctx.lineWidth = Math.max(1.6, padRadius * 0.08);
      ctx.globalAlpha = 0.45 + laneFlash[i] * 0.5;
      ctx.beginPath();
      ctx.arc(cx, hitY, padRadius, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Not jatuh
    const noteW = Math.min(laneW * 0.76, 136);
    const noteH = Math.round(Math.min(32, Math.max(22, h * 0.056)));
    const noteRadius = Math.round(noteH * 0.42);
    for (const n of notes) {
      if (n.hit) continue;
      const dt = n.time - elapsed;
      if (dt > travel || dt < -MISS_AFTER - 0.15) continue;

      const y = hitY - (dt / travel) * hitY;
      const cx = n.lane * laneW + laneW / 2;
      const x = cx - noteW / 2;
      const palette = LANE_COLORS[n.lane];

      ctx.save();
      ctx.globalAlpha = n.missed ? 0.28 : 1;
      ctx.shadowColor = palette.glow;
      ctx.shadowBlur = 12;
      ctx.fillStyle = palette.fill;
      drawRoundedRect(ctx, x, y - noteH / 2, noteW, noteH, noteRadius);
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.strokeStyle = palette.edge;
      ctx.lineWidth = 1.4;
      ctx.stroke();
      ctx.restore();
    }

    // Efek cincin lembut saat not mengenai garis
    const now = performance.now();
    const ringExpand = Math.max(22, padRadius * 1.15);
    effects = effects.filter((ef) => now - ef.born < 320);
    for (const ef of effects) {
      const p = (now - ef.born) / 320;
      const cx = ef.lane * laneW + laneW / 2;
      ctx.save();
      ctx.strokeStyle = ef.color;
      ctx.globalAlpha = (1 - p) * 0.75;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(cx, hitY, padRadius + p * ringExpand, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Teks penilaian (PERFECT / GOOD / MISS)
    if (now < lastJudgment.until && lastJudgment.text) {
      const remain = (lastJudgment.until - now) / 520;
      const judgeFontPx = Math.round(Math.min(26, Math.max(18, w * 0.034)));
      const judgeY = hitY - Math.max(42, padRadius + 24);
      ctx.save();
      ctx.globalAlpha = Math.min(1, remain * 1.4);
      ctx.fillStyle = lastJudgment.color;
      ctx.font = `600 ${judgeFontPx}px "Poppins", sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(lastJudgment.text, w / 2, judgeY);
      ctx.restore();
    }
  }

  function drawRoundedRect(context, x, y, width, height, radius) {
    context.beginPath();
    context.roundRect(x, y, width, height, radius);
  }

  /* ---------------- Game Loop ---------------- */

  function tick() {
    if (state !== "playing") return;
    const elapsed = currentElapsed();

    processMissedNotes(elapsed);
    updateProgress(elapsed);
    drawFrame(elapsed);

    if (elapsed >= totalDuration + 0.6) {
      finishGame();
      return;
    }
    rafId = requestAnimationFrame(tick);
  }

  function startLoop() {
    stopLoop();
    scheduleUpcomingAudio();
    schedulerId = setInterval(scheduleUpcomingAudio, 25);
    rafId = requestAnimationFrame(tick);
  }

  function stopLoop() {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    if (schedulerId !== null) {
      clearInterval(schedulerId);
      schedulerId = null;
    }
  }

  /* ---------------- Event Listener ---------------- */

  function handleStartPause() {
    if (state === "playing") pauseGame();
    else startGame();
  }

  startPauseBtn.addEventListener("click", handleStartPause);
  overlayStartBtn.addEventListener("click", handleStartPause);
  restartGameBtn.addEventListener("click", () => {
    resetGameState();
    startGame();
  });

  if (jumpToGameBtn) {
    jumpToGameBtn.addEventListener("click", () => {
      setTimeout(() => {
        if (state === "idle") overlayStartBtn.focus({ preventScroll: true });
      }, 250);
    });
  }

  muteBtn.addEventListener("click", () => {
    isMuted = !isMuted;
    muteBtn.setAttribute("aria-pressed", String(isMuted));
    muteBtn.textContent = isMuted ? "Suara: Bisu" : "Suara: Hidup";
    if (masterGain && audioCtx) {
      masterGain.gain.setTargetAtTime(isMuted ? 0 : 0.85, audioCtx.currentTime, 0.015);
    }
  });

  speedButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (state === "playing" || state === "paused") return;
      speed = Number(btn.dataset.speed) || 1;
      speedButtons.forEach((b) => {
        const active = b === btn;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-pressed", String(active));
      });
      const effectiveBpm = Math.round(BASE_BPM * speed);
      trackMeta.innerHTML =
        `Melodi Kustom: &ldquo;Nocturne in F Major&rdquo; &bull; ${effectiveBpm} BPM &bull; Web Audio Synth`;
      resetGameState();
    });
  });

  // Respons instan saat tap/klik tombol jalur maupun area canvas
  lanePads.forEach((pad) => {
    const lane = Number(pad.dataset.lane);
    pad.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      triggerLane(lane);
    });
    pad.addEventListener("click", (e) => {
      if (e.detail === 0) triggerLane(lane); // Aktivasi keyboard (Enter/Space pada tombol fokus)
    });
  });

  canvas.addEventListener("pointerdown", (e) => {
    if (state !== "playing") return;
    const rect = canvas.getBoundingClientRect();
    const lane = Math.min(3, Math.max(0, Math.floor(((e.clientX - rect.left) / rect.width) * 4)));
    triggerLane(lane);
  });

  document.addEventListener("keydown", (e) => {
    if (e.repeat || resultDialog.open) return;
    if (e.target instanceof Element && e.target.matches("input, textarea, select")) return;

    const k = e.key.toLowerCase();
    if (k in KEY_TO_LANE) {
      if (state === "playing") e.preventDefault();
      triggerLane(KEY_TO_LANE[k]);
    } else if (e.code === "Space" && (state === "playing" || state === "paused")) {
      if (e.target instanceof Element && e.target.closest("button, a")) return;
      e.preventDefault();
      handleStartPause();
    }
  });

  // Hentikan sementara jika tab berpindah agar audio & timer tetap sinkron
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && state === "playing") {
      pauseGame();
    }
  });

  // Penanganan native <dialog> hasil lagu
  resultDialog.addEventListener("close", () => {
    const choice = resultDialog.returnValue;
    resultDialog.returnValue = "";
    if (choice === "replay") {
      resetGameState();
      startGame();
    } else {
      resetGameState();
    }
  });

  // Fallback light-dismiss untuk browser tanpa <dialog closedby="any">
  if (!("closedBy" in HTMLDialogElement.prototype)) {
    const isOutside = (e, dlg) => {
      const r = dlg.getBoundingClientRect();
      return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
    };
    let pressedOutside = false;
    resultDialog.addEventListener("pointerdown", (e) => {
      pressedOutside = isOutside(e, resultDialog);
    });
    resultDialog.addEventListener("pointerup", (e) => {
      if (pressedOutside && isOutside(e, resultDialog)) resultDialog.close();
    });
  }

  // ResizeObserver menjaga ketajaman HiDPI canvas
  if (typeof ResizeObserver !== "undefined") {
    new ResizeObserver(resizeCanvas).observe(canvasStage);
  } else {
    window.addEventListener("resize", resizeCanvas);
  }

  preloadCatBytes();
  resetGameState();
  resizeCanvas();
})();
