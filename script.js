const tracks = [
    { title: "OneShot Title Theme", src: "audio/title_theme.mp3" },
    { title: "The World Machine", src: "audio/the_world_machine.mp3" },
    { title: "Niko and the World Machine", src: "audio/niko_and_wm.mp3" },
    { title: "Return", src: "audio/return.mp3" },
    { title: "Niko’s Theme", src: "audio/nikos_theme.mp3" }
];

// === ЭЛЕМЕНТЫ ===
const audio = document.getElementById("audio-player");
const currentTrackLabel = document.getElementById("current-track");
const playlistBox = document.getElementById("playlist");

const playBtn = document.getElementById("play-btn");
const nextBtn = document.getElementById("next-btn");
const prevBtn = document.getElementById("prev-btn");
const repeatBtn = document.getElementById("repeat-btn");
const shuffleBtn = document.getElementById("shuffle-btn");
const downloadAllBtn = document.getElementById("download-all-btn");

const canvas = document.getElementById("visualizer");
const ctx = canvas.getContext("2d");

// === СОСТОЯНИЯ ===
let currentIndex = 0;
let repeat = false;
let shuffle = false;

let audioCtx = null;
let analyser = null;
let source = null;

// === ПЛЕЙЛИСТ ===
tracks.forEach((track, index) => {
    const div = document.createElement("div");
    div.className = "track-item";
    div.innerText = track.title;

    div.onclick = () => {
        currentIndex = index;
        loadTrack();
        audio.play();
        playBtn.classList.add("btn-active");
    };

    playlistBox.appendChild(div);
});

function highlightTrack() {
    document.querySelectorAll(".track-item").forEach((item, idx) => {
        item.classList.toggle("track-active", idx === currentIndex);
    });
}

function loadTrack() {
    audio.src = tracks[currentIndex].src;
    currentTrackLabel.textContent = "Сейчас играет: " + tracks[currentIndex].title;

    highlightTrack();

    // анимация названия трека
    currentTrackLabel.classList.remove("track-animate");
    void currentTrackLabel.offsetWidth;
    currentTrackLabel.classList.add("track-animate");
}

// === КНОПКИ ===
playBtn.onclick = () => {
    if (!audioCtx) initAudioContext();

    if (audio.paused) {
        audio.play();
        playBtn.classList.add("btn-active");
    } else {
        audio.pause();
        playBtn.classList.remove("btn-active");
    }
};

nextBtn.onclick = () => playNext();

prevBtn.onclick = () => {
    currentIndex = (currentIndex - 1 + tracks.length) % tracks.length;
    loadTrack();
    audio.play();
    playBtn.classList.add("btn-active");
};

repeatBtn.onclick = () => {
    repeat = !repeat;
    repeatBtn.classList.toggle("btn-active", repeat);
};

shuffleBtn.onclick = () => {
    shuffle = !shuffle;
    shuffleBtn.classList.toggle("btn-active", shuffle);
};

// === АНИМАЦИЯ НАЖАТИЙ КНОПОК ===
[
    playBtn,
    nextBtn,
    prevBtn,
    repeatBtn,
    shuffleBtn,
    downloadAllBtn
].forEach(btn => {
    btn.addEventListener("mousedown", () => btn.classList.add("btn-press"));
    btn.addEventListener("mouseup", () => btn.classList.remove("btn-press"));
    btn.addEventListener("mouseleave", () => btn.classList.remove("btn-press"));
});

// === АВТОПЕРЕКЛЮЧЕНИЕ ===
audio.addEventListener("ended", () => {
    if (repeat) {
        audio.play();
    } else {
        playNext();
    }
});

function playNext() {
    currentIndex = shuffle
        ? Math.floor(Math.random() * tracks.length)
        : (currentIndex + 1) % tracks.length;

    loadTrack();
    audio.play();
    playBtn.classList.add("btn-active");
}

// === ВИЗУАЛИЗАЦИЯ ===
function initAudioContext() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 128;

    source = audioCtx.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);

    drawVisualizer();
}

function drawVisualizer() {
    if (!analyser) return;

    requestAnimationFrame(drawVisualizer);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    ctx.fillStyle = "#0d0017";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const barWidth = (canvas.width / bufferLength) * 1.5;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i] / 2;
        ctx.fillStyle = `rgb(${200 + barHeight}, 50, 255)`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
    }
}

// === СКАЧИВАНИЕ ВСЕХ ТРЕКОВ ===
downloadAllBtn.onclick = async () => {
    const zip = new JSZip();

    await Promise.all(
        tracks.map(async track => {
            const file = await fetch(track.src).then(r => r.blob());
            zip.file(track.title + ".mp3", file);
        })
    );

    const content = await zip.generateAsync({ type: "blob" });

    const a = document.createElement("a");
    a.href = URL.createObjectURL(content);
    a.download = "OneShot_TheWorldMachine.zip";
    a.click();
};

// === СТАРТ ===
loadTrack();

