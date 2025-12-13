document.addEventListener("DOMContentLoaded", () => {
    // === ТРЕКИ ===
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
    let isPlaying = false;

    let audioCtx = null;
    let analyser = null;
    let source = null;
    let dataArray = null;
    let bufferLength = null;
    let animationId = null;

    // === ИНИЦИАЛИЗАЦИЯ ПЛЕЙЛИСТА ===
    function renderPlaylist() {
        playlistBox.innerHTML = '';
        tracks.forEach((track, index) => {
            const div = document.createElement("div");
            div.className = "track-item";
            if (index === currentIndex) {
                div.classList.add("track-active");
            }
            div.textContent = track.title;

            div.addEventListener("click", () => {
                currentIndex = index;
                loadTrack();
                play();
            });

            playlistBox.appendChild(div);
        });
    }

    // === ЗАГРУЗКА ТРЕКА ===
    function loadTrack() {
        const track = tracks[currentIndex];
        audio.src = track.src;
        currentTrackLabel.textContent = "Сейчас играет: " + track.title;
        
        // Обновляем выделение трека
        document.querySelectorAll(".track-item").forEach((item, idx) => {
            item.classList.toggle("track-active", idx === currentIndex);
        });

        // Анимация обновления названия
        currentTrackLabel.classList.remove("track-animate");
        void currentTrackLabel.offsetWidth;
        currentTrackLabel.classList.add("track-animate");

        // Инициализируем аудиоконтекст при первой загрузке
        if (!audioCtx) {
            initAudioContext();
        }
    }

    // === ВИЗУАЛИЗАЦИЯ ===
    function initAudioContext() {
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioCtx.createAnalyser();
            source = audioCtx.createMediaElementSource(audio);
            
            analyser.fftSize = 256;
            bufferLength = analyser.frequencyBinCount;
            dataArray = new Uint8Array(bufferLength);
            
            source.connect(analyser);
            analyser.connect(audioCtx.destination);
            
            drawVisualizer();
        } catch (error) {
            console.error("Ошибка инициализации аудиоконтекста:", error);
            canvas.style.display = 'none';
        }
    }

    function drawVisualizer() {
        if (!analyser) return;
        
        animationId = requestAnimationFrame(drawVisualizer);
        analyser.getByteFrequencyData(dataArray);
        
        ctx.fillStyle = '#0d0017';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const barWidth = (canvas.width / bufferLength) * 2.5;
        let barHeight;
        let x = 0;
        
        for (let i = 0; i < bufferLength; i++) {
            barHeight = dataArray[i] / 2;
            
            // Градиент для столбцов
            const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
            gradient.addColorStop(0, '#9e4cff');
            gradient.addColorStop(0.7, '#6e00b8');
            gradient.addColorStop(1, '#43006b');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
            
            x += barWidth + 1;
        }
    }

    // === УПРАВЛЕНИЕ ВОСПРОИЗВЕДЕНИЕМ ===
    function play() {
        if (!audio.src) {
            loadTrack();
        }
        
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        
        audio.play().then(() => {
            isPlaying = true;
            playBtn.classList.add("btn-active");
            playBtn.textContent = "⏸";
        }).catch(error => {
            console.error("Ошибка воспроизведения:", error);
            alert("Не удалось воспроизвести трек. Проверьте доступ к аудиофайлам.");
        });
    }

    function pause() {
        audio.pause();
        isPlaying = false;
        playBtn.classList.remove("btn-active");
        playBtn.textContent = "▶";
    }

    function playNext() {
        if (shuffle) {
            let newIndex;
            do {
                newIndex = Math.floor(Math.random() * tracks.length);
            } while (newIndex === currentIndex && tracks.length > 1);
            currentIndex = newIndex;
        } else {
            currentIndex = (currentIndex + 1) % tracks.length;
        }
        loadTrack();
        if (isPlaying) {
            play();
        }
    }

    function playPrev() {
        if (audio.currentTime > 3) {
            audio.currentTime = 0;
        } else {
            currentIndex = (currentIndex - 1 + tracks.length) % tracks.length;
            loadTrack();
            if (isPlaying) {
                play();
            }
        }
    }

    // === СОБЫТИЯ ===
    playBtn.addEventListener("click", () => {
        audio.paused ? play() : pause();
    });

    nextBtn.addEventListener("click", playNext);

    prevBtn.addEventListener("click", playPrev);

    repeatBtn.addEventListener("click", () => {
        repeat = !repeat;
        repeatBtn.classList.toggle("btn-active", repeat);
    });

    shuffleBtn.addEventListener("click", () => {
        shuffle = !shuffle;
        shuffleBtn.classList.toggle("btn-active", shuffle);
    });

    // Событие окончания трека
    audio.addEventListener("ended", () => {
        if (repeat) {
            audio.currentTime = 0;
            play();
        } else {
            playNext();
        }
    });

    // Событие загрузки метаданных
    audio.addEventListener("loadedmetadata", () => {
        if (audioCtx && !source) {
            initAudioContext();
        }
    });

    // Событие ошибки
    audio.addEventListener("error", (e) => {
        console.error("Ошибка загрузки аудио:", e);
        currentTrackLabel.textContent = "Ошибка: Трек не найден";
        pause();
    });

    // === ЗАГРУЗКА ВСЕХ ТРЕКОВ ===
    downloadAllBtn.addEventListener("click", async () => {
        if (!window.JSZip) {
            alert("Библиотека JSZip не загружена!");
            return;
        }
        
        downloadAllBtn.textContent = "Загрузка...";
        downloadAllBtn.disabled = true;
        
        try {
            const zip = new JSZip();
            let downloadedCount = 0;
            
            // Создаем папку для треков
            const audioFolder = zip.folder("OneShot OST");
            
            // Загружаем каждый трек
            for (const track of tracks) {
                try {
                    const response = await fetch(track.src);
                    if (!response.ok) throw new Error(`Ошибка ${response.status}`);
                    
                    const blob = await response.blob();
                    audioFolder.file(track.title + ".mp3", blob);
                    downloadedCount++;
                    
                    // Обновляем прогресс
                    downloadAllBtn.textContent = `Загружено ${downloadedCount}/${tracks.length}`;
                } catch (error) {
                    console.error(`Ошибка загрузки ${track.title}:`, error);
                }
            }
            
            // Генерируем и скачиваем ZIP
            const content = await zip.generateAsync({ type: "blob" });
            saveAs(content, "OneShot_OST.zip");
            
            alert(`Скачано ${downloadedCount} из ${tracks.length} треков`);
        } catch (error) {
            console.error("Ошибка создания архива:", error);
            alert("Ошибка при создании архива!");
        } finally {
            downloadAllBtn.textContent = "💾 Скачать все";
            downloadAllBtn.disabled = false;
        }
    });

    // === ОЧИСТКА ПРИ ЗАКРЫТИИ ===
    window.addEventListener("beforeunload", () => {
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
        if (audioCtx) {
            audioCtx.close();
        }
    });

    // === ИНИЦИАЛИЗАЦИЯ ===
    renderPlaylist();
    loadTrack();
    
    // Автоматическое воспроизведение при первом клике (по требованию пользователя)
    document.addEventListener('click', function initAudioOnClick() {
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        document.removeEventListener('click', initAudioOnClick);
    }, { once: true });
});
