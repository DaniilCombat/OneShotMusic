document.addEventListener("DOMContentLoaded", () => {

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
    div.textContent = track.title;

    div.addEventListener("click", () => {
        currentIndex = index;
        loadTrack();
        play();
    });

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

    currentTrackLabel.classList.remove("track-animate");
    void currentTrackLabel.offsetWidth;
    currentTrackLabel.classList.add("track-animate");
}

// === УПРАВЛЕНИЕ ===
function play() {
    if (!audioCtx) initAudioContext();
    audio.play();
    playBtn.classList.add("btn-active");
}

function pause() {
    audio.pause();
    playBtn.classList.remove("btn-active");
}

// === КНОПКИ ===
playBtn.addEventListener("click", () => {
    audio.paused ? play() : pause();
});

nextBtn.addEventListener("click", playNext);

prevBtn.addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + tracks.length) % tracks.length;
    loadTrack();
    play();
});

repeatBtn.addEventListener("click", () => {
    repeat = !repeat;
    repeatBtn.classList.toggle("btn-active", repeat);

