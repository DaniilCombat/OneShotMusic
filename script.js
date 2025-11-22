const tracks = [
    { title: "OneShot Title Theme", src: "audio/title_theme.mp3" },
    { title: "The World Machine", src: "audio/the_world_machine.mp3" },
    { title: "Niko and the World Machine", src: "audio/niko_and_wm.mp3" },
    { title: "Return", src: "audio/return.mp3" },
    { title: "Niko’s Theme", src: "audio/nikos_theme.mp3" }
];

// Элементы
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

let currentIndex = 0;
let repeat = false;
let shuffle = false;

// Плейлист
tracks.forEach((track, index) => {
    const div = document.createElement("div");
    div.className = "track-item";
    div.innerText = track.title;
    div.onclick = () => { currentIndex = index; loadTrack(); audio.play(); };
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
}

// Кнопки управления
playBtn.onclick = () => audio.paused ? audio.play() : audio.pause();
nextBtn.onclick = () => playNext();
prevBtn.onclick = () => { currentIndex = (currentIndex - 1 + tracks.length) % tracks.length; loadTrack(); audio.play(); };
repeatBtn.onclick = () => { repeat = !repeat; repeatBtn.style.opacity = repeat ? 1 : 0.6; };
shuffleBtn.onclick = () => { shuffle = !shuffle; shuffleBtn.style.opacity = shuffle ? 1 : 0.6; };

// Автопереход
audio.addEventListener("ended", () => {
    if(repeat) { audio.play(); return; }
    playNext();
});

function playNext() {
    if(shuffle) currentIndex = Math.floor(Math.random() * tracks.length);
    else currentIndex = (currentIndex + 1) % tracks.length;
    loadTrack();
    audio.play();
}

// Загрузка трека при старте
loadTrack();

// Визуализатор
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioCtx.createAnalyser();
const source = audioCtx.createMediaElementSource(audio);
source.connect(analyser);
analyser.connect(audioCtx.destination);
analyser.fftSize = 128;
const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);

function drawVisualizer() {
    requestAnimationFrame(drawVisualizer);
    analyser.getByteFrequencyData(dataArray);
    ctx.fillStyle = '#0d0017';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const barWidth = (canvas.width / bufferLength) * 1.5;
    let x = 0;
    for(let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i]/2;
        ctx.fillStyle = `rgb(${200+barHeight}, ${50}, 255)`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
    }
}
drawVisualizer();

// Скачать все
downloadAllBtn.onclick = () => {
    const zip = new JSZip();
    tracks.forEach(t => { zip.file(t.title + ".mp3", fetch(t.src).then(r => r.blob())); });
    zip.generateAsync({type:"blob"}).then(content => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(content);
        a.download = "OneShot_TheWorldMachine.zip";
        a.click();
    });
};
