let currentScene = 0;
const sceneEl = document.getElementById("scene");
const nextBtn = document.querySelector("button");

const scenes = [
  `
  <div class="bg-birthday">
    <h1>🎉 Selamat Ulang Tahun! 🎂</h1>
    <p>Hari ini adalah hari spesialmu. Semoga hari ini penuh tawa, cinta, dan kue! 🍰</p>
  </div>
`
  ,
  `
  <h1>🏆 Pencapaianmu</h1>
  <div class="achievement-photos">
    <!-- Gambar 1 -->
    <img src="img/ipi_2.jpg" alt="Achievement 1">
    
    <!-- Gambar 2 -->
    <img src="img/ipi_3.jpeg" alt="Achievement 2">
    
    <!-- Gambar 3 -->
    <img src="img/achievement3.jpg" alt="Achievement 3">
  </div>
  <p>Kamu udah banyak banget berkembang tahun ini. Bangga banget sama kamu!</p>
  <img src="img/achievement.jpg" alt="Pencapaian">
`

,
  `
    <h1>🌈 Harapan untukmu</h1>
    <p>Semoga tahun depan penuh dengan petualangan baru, rezeki berlimpah, dan teman teman yang supportif.</p>
    <img src="img/hope.png" alt="Harapan">
  `,
  `
    <h1>🎁 Pertunjukan Selesai</h1>
    <p>Terima kasih udah liat🎂</p>
    <button onclick="restart()">🔁 Tonton Lagi</button>
  `
];

function nextScene() {
  sceneEl.classList.remove("fade-in");
  sceneEl.classList.add("fade-out");

  setTimeout(() => {
    currentScene++;
    if (currentScene < scenes.length) {
      sceneEl.innerHTML = scenes[currentScene];

      // Cek apakah udah di akhir
      if (currentScene === scenes.length - 1) {
        nextBtn.style.display = "none";
      }
    }

    sceneEl.classList.remove("fade-out");
    sceneEl.classList.add("fade-in");
  }, 500); // Waktu tunggu sebelum ganti scene (harus match dengan transition di CSS)
}


function restart() {
  currentScene = 0;
  sceneEl.innerHTML = scenes[0];
  nextBtn.style.display = "inline-block";
  sceneEl.classList.add("fade-in");
}


// Load first scene
sceneEl.innerHTML = scenes[0];
sceneEl.classList.add("fade-in");

