function pad(number) {
    return String(number).padStart(2, "0");
}

function updateClock() {
    const now = new Date();
    const clock = document.getElementById("clock");
    clock.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

document.addEventListener("DOMContentLoaded", () => {
    updateClock();
    setInterval(updateClock, 1000);
});
