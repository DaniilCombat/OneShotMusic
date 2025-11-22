const tracks = [
    { title: "OneShot Title Theme", src: "audio/title_theme.mp3" },
    { title: "The World Machine", src: "audio/the_world_machine.mp3" },
    { title: "Niko and the World Machine", src: "audio/niko_and_wm.mp3" },
    { title: "Return", src: "audio/return.mp3" },
    { title: "Niko’s Theme", src: "audio/nikos_theme.mp3" }
];

window.onload = function() {
    const list = document.getElementById("music-list");

    tracks.forEach(track => {
        const div = document.createElement("div");
        div.className = "track";

        div.innerHTML = `
            <h2>${track.title}</h2>
            <audio controls>
                <source src="${track.src}" type="audio/mpeg">
                Ваш браузер не поддерживает аудио.
            </audio>
        `;

        list.appendChild(div);
    });
};
