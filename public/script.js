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
            const toggleButton = document.createElement("button");
            toggleButton.textContent = alarm.enabled ? "uitzetten" : "aanzetten";
            toggleButton.addEventListener("click", async () => {
                const response = await fetch(`/api/alarms/${alarm.id}/toggle`, { method: "PATCH" });
                if (response.ok) {
                    loadAlarms();
                } else {
                    showError("Kon de wekker niet aanpassen.");
                }
            });
            item.appendChild(toggleButton);
            list.appendChild(item);
        }
    } catch(error) {
        showError("Kon de wekkers niet laden.");
    }
}

async function addAlarm(event) {
    event.preventDefault();

    const days = [];
    for (const checkbox of document.querySelectorAll("#days input:checked")) {
        days.push(checkbox.value);
    }
    const alarm = {
        name: document.getElementById("name").value,
        hour: Number(document.getElementById("hour").value),
        minute: Number(document.getElementById("minute").value),
        enabled: document.getElementById("enabled").checked,
        days: days,
    };

    const response = await fetch("/api/alarms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(alarm),
    });

    if (!response.ok) {
        const data = await response.json();
        showError(data.error);
        return;
    }

    showError("");
    event.target.reset();
    loadAlarms();
}

document.addEventListener("DOMContentLoaded", () => {
    updateClock();
    setInterval(updateClock, 1000);
    loadAlarms();
    document.getElementById("alarm-form").addEventListener("submit", addAlarm);
});
