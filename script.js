function preloadAssets() {
    const assets = [
        "cake.svg",
        "cat-1.mp3",
        "cat-2.mp3",
        "cat-3.mp3",
        "hbd.mp3",
        "hope.png",
        "ipi_2.jpg",
        "ipi_3.jpeg",
        "ipi_4.jpg",
        "lucky_cat.svg"
    ];

    let loaded = 0;
    const total = assets.length;

    const onAssetLoad = () => {
        loaded++;
        if (loaded === total) {
            setTimeout(() => {
                document.getElementById('loading-screen').classList.add('fade-out');
                sceneEl.innerHTML = scenes[0];
                sceneEl.classList.add("fade-in");
            }, 500);
        }
    };

    assets.forEach(src => {
        if (src.endsWith(".mp3")) {
            const audio = new Audio();
            audio.src = src;
            audio.addEventListener('canplaythrough', onAssetLoad, { once: true });
        } else {
            const img = new Image();
            img.src = src;
            img.onload = onAssetLoad;
        }
    });
}


let currentScene = 0;
const sceneEl = document.getElementById("scene");
const nextBtn = document.getElementById("nextBtn");

const scenes = [
    `<div class=" "></div>`,
    `<div class="bg-birthday"><h1> Happy Birth Day Silvia! 🎉</h1></div>`,
    `
  <h1>🏆 Pencapaianmu</h1>
  <p>Kamu udah banyak banget berkembang. Bangga banget sama kamu!</p>
  <div class="achievement-photos">
    <div class="achievement-item">
      <div class="image-wrapper" onclick="openPopup('Juara Umum 9 MIPA', 'Selamat juara umum lagi ya, walaupun turun rangking tetep sumangeet 👐🏻' )">
        <img src="ipi_4.jpg" alt="Juara Umum 9 MIPA" />
        <div class="click-indicator">Lihat Pesan 📩</div>
      </div>
      <h2 onclick="openPopup('Juara Umum 9 MIPA', 'Selamat juara umum lagi ya, walaupun turun rangking tetep sumangeet 👐🏻' )">Juara Umum 9 MIPA</h2>
    </div>
    <div class="achievement-item">
      <div class="image-wrapper" onclick="openPopup('Juara Umum 5 MIPA', 'Kamu berhasil jadi juara umum 5 di bidang MIPA, hebat banget! 👏' )">
        <img src="ipi_2.jpg" alt="Juara Umum 5 MIPA" />
        <div class="click-indicator">Lihat Pesan 📩</div>
      </div>
      <h2 onclick="openPopup('Juara Umum 5 MIPA', 'Kamu berhasil jadi juara umum 5 di bidang MIPA, hebat banget! 👏' )">Juara Umum 5 MIPA</h2>
    </div>
    <div class="achievement-item">
      <div class="image-wrapper" onclick="openPopup('Pradana Putri', 'Kamu dipercaya jadi Pradana Putri, bukti kamu punya jiwa kepemimpinan 💪')">
        <img src="ipi_3.jpeg" alt="Pradana Putri" />
        <div class="click-indicator">Lihat Pesan 📩</div>
      </div>
      <h2 onclick="openPopup('Pradana Putri', 'Kamu dipercaya jadi Pradana Putri, bukti kamu punya jiwa kepemimpinan 💪')">Pradana Putri</h2>
    </div>
  </div>
  `,
    `
  <h1>🌈 Harapan untukmu</h1>
  <p>Semoga tahun depan penuh dengan petualangan baru, rezeki berlimpah, dan teman-teman yang mendukung kamu untuk mencapai cita citamu.</p>
  <div class="image-wrapper" style="max-width: 400px; margin: 0 auto;" onclick="openPopup('Universitas Pendidikan Indonesia', 'Denger denger TKA bisa buat daftar SNBP juga, jangan di sia siakan opportunity nya ')">
    <img src="hope.png" alt="Harapan" />
    <div class="click-indicator">Lihat Pesan 📩</div>
  </div>
  <h2 onclick="openPopup('Universitas Pendidikan Indonesia', 'Denger denger TKA bisa buat daftar SNBP juga, jangan di sia siakan opportunity nya ')">Universitas Pendidikan Indonesia</h2>
  `,
    `
  <h1>Terima Kasih !</h1>
  <div class="box-button">
<div class="button"><span class="teks-hadiah">Hadiah buat kamu</span></div>
</div>

  <div style="margin-top:20px">
    <a href="dashboard.html">
      <button>Dashboard ✨</button>
    </a>

    <button onclick="restart()">🔁 Tonton Lagi</button> 
  </div>

  `
];

let isMusicPlaying = false;

function nextScene() {
    if (!isMusicPlaying) {
        const bgm = document.getElementById('bgm');
        bgm.play().catch(() => { });
        isMusicPlaying = true;
    }

    sceneEl.classList.remove("fade-in");
    sceneEl.classList.add("fade-out");

    setTimeout(() => {
        currentScene++;
        if (currentScene < scenes.length) {
            sceneEl.innerHTML = scenes[currentScene];
            if (currentScene === scenes.length - 1) {
                nextBtn.style.display = "none";
            }
            if (currentScene > 0) showConfetti();
        }

        sceneEl.classList.remove("fade-out");
        sceneEl.classList.add("fade-in");
    }, 500);
}

function restart() {
    currentScene = 1;
    sceneEl.innerHTML = scenes[1];
    nextBtn.style.display = "inline-block";
    sceneEl.classList.add("fade-in");
}

function toggleDarkMode() {
    document.body.classList.toggle('dark');
}

function openPopup(title, description) {
    document.getElementById("popup-text").innerHTML = `
<h2>${title}</h2>
<p>${description}</p>
`;
    document.getElementById("popup").classList.add("show");
}


function closePopup() {
    document.getElementById("popup").classList.remove("show");
}

function showConfetti() {
    for (let i = 0; i < 20; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.animationDelay = Math.random() * 5 + 's';
        confetti.style.backgroundColor = ['#e91e63', '#ff9800', '#ffc107', '#8bc34a', '#00bcd4'][Math.floor(Math.random() * 5)];

        document.body.appendChild(confetti);
    }
}

// Init
window.addEventListener("DOMContentLoaded", () => {
    preloadAssets(); // Nunggu semua asset siap
});

// Initial scene setup handled in preloadAssets callback, but setting initial state here just in case or for immediate render if needed (though preload handles it)
// sceneEl.innerHTML = scenes[0]; // This is redundant if preloadAssets handles it, but keeping for safety if preload fails or takes long, though preload hides it with loading screen.
// sceneEl.classList.add("fade-in");

document.addEventListener("click", function (e) {
    if (e.target.closest(".box-button")) {
        showCatConfetti();
    }
});

function showCatConfetti() {
    const catSounds = [
        "cat-1.mp3", // Ganti dengan URL audio kucing pertama
        "cat-2.mp3", // Ganti dengan URL audio kucing kedua
        "cat-3.mp3"  // Ganti dengan URL audio kucing ketiga
    ];

    // Pilih audio kucing secara acak
    const randomCatSound = catSounds[Math.floor(Math.random() * catSounds.length)];

    // Membuat elemen audio dan memutar suara kucing
    const audio = new Audio(randomCatSound);
    audio.play();

    const img = document.createElement("img");
    img.src = "lucky_cat.svg"; // bisa ganti ke gif lain kalau mau!
    img.alt = "Confetti Kucing";
    img.style.position = "fixed";
    img.style.width = "80px";
    img.style.left = Math.random() * 90 + "vw";
    img.style.top = "-100px";
    img.style.zIndex = 10;
    img.style.animation = "dropCat 3s ease-in-out forwards";

    document.body.appendChild(img);

    // hapus elemen setelah selesai animasi
    setTimeout(() => img.remove(), 3000);
}
