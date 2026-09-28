function pad(number) {
    return String(number).padStart(2, "0");
}

function updateClock() {
    const now = new Date();
    const clock = document.getElementById("clock");
    clock.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

function showError(message) {
    document.getElementById("error").textContent = message;
}

async function loadAlarms() {
    try {
        const response = await fetch("/api/alarms");
        const alarms = await response.json();

        const list = document.getElementById("alarm-list");
        list.innerHTML = "";

        for (const alarm of alarms) {
            const item = document.createElement("li");
            const status = alarm.enabled ? "aan" : "uit";
            item.textContent = `${pad(alarm.hour)}:${pad(alarm.minute)} ${alarm.name} (${alarm.days.join(", ")}) ${status}`;
            list.appendChild(item);
        }
    } catch(error) {
        showError("Kon de wekkers niet laden.");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    updateClock();
    setInterval(updateClock, 1000);
    loadAlarms();
});
