const express = require("express");
const fs = require("node:fs/promises");

const app = express();
const PORT = 3000;
const DATA_FILE = "data/alarms.json";

app.use(express.json());
app.use(express.static("public"));

async function readAlarms() {
  const content = await fs.readFile(DATA_FILE, "utf8");
  return JSON.parse(content);
}

const VALID_DAYS = ["maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag", "zondag"];

async function writeAlarms(alarms) {
    await fs.writeFile(DATA_FILE, JSON.stringify(alarms, null, 2));
}

function validateAlarm(alarm) {
    if (typeof alarm.name !== "string" || alarm.name.trim() === "") {
        return "naam mag niet leeg zijn";
    }
    if (!Number.isInteger(alarm.hour) || alarm.hour < 0 || alarm.hour > 23) {
        return "uur moet tussen de 0 en 23 liggen";

    }
    if (!Number.isInteger(alarm.minute) || alarm.minute < 0 || alarm.minute > 59) {
        return "minuten moeten tussen 0 en 59 liggen";
    }
    if (typeof alarm.enabled !== "boolean") {
        return "enabled moet true of false zijn";
    }
    if (!Array.isArray(alarm.days) || alarm.days.length === 0) {
        return "kies minstens 1 dag";
    }
    for (const day of alarm.days) {
        if (!VALID_DAYS.includes(day)) {
            return `invalid day: ${day}`;
        }
    }
    return null;
}

app.get("/api/alarms", async (req, res) => {
  const alarms = await readAlarms();
  res.json(alarms);
});

const DAYS_BY_INDEX = ["zondag", "maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag"];

app.get("/api/alarms/next", async (req, res) => {
    const alarms = await readAlarms();
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    let nextAlarm = null;
    let nextDay = null;
    let minutesUntil = Infinity;

    for (let offset = 0; offset <= 7; offset++) {
        const day = DAYS_BY_INDEX[(now.getDay() + offset) % 7];

        for (const alarm of alarms) {
            if (!alarm.enabled || !alarm.days.includes(day)) {
                continue;
            }

            const alarmMinutes = alarm.hour * 60 + alarm.minute;
            const difference = offset * 24 * 60 + alarmMinutes - nowMinutes;

            if (difference > 0 && difference < minutesUntil) {
                nextAlarm = alarm;
                nextDay = day;
                minutesUntil = difference;
            }
        }
    }
    if (!nextAlarm) {
        return res.status(404).json({ error: "geen actieve wekkers."});
    }
    const secondsUntil = minutesUntil * 60 - now.getSeconds();
    res.json({ alarm: nextAlarm, day: nextDay, minutesUntil: minutesUntil, secondsUntil: secondsUntil});
});

app.get("/api/alarms/:id", async (req, res) => {
    const id = Number(req.params.id);
    const alarms = await readAlarms();
    const alarm = alarms.find((a) => a.id === id);

    if (!alarm)  {
        return res.status(404).json({ error: "Wekker niet gevonden."});
    }

    res.json(alarm);
})

app.post("/api/alarms", async (req, res) => {
    const error = validateAlarm(req.body);
    if (error) {
        return res.status(400).json({ error: error });
    }

    const alarms = await readAlarms();
    let newId = 1;
    for (const alarm of alarms) {
        if (alarm.id >= newId) {
            newId = alarm.id + 1;
        }
    }

    const newAlarm = {
        id: newId,
        name: req.body.name,
        hour: req.body.hour,
        minute: req.body.minute,
        enabled: req.body.enabled,
        days: req.body.days,

    };

    alarms.push(newAlarm);
    await writeAlarms(alarms);
    res.status(201).json(newAlarm);
})

app.put("/api/alarms/:id", async (req, res) => {
    const id = Number(req.params.id);
    const alarms = await readAlarms();
    const alarm = alarms.find((a) => a.id === id);

    if (!alarm) {
        return res.status(404).json({ error: "Wekker niet gevonden." });
    }

    const error = validateAlarm(req.body);
    if (error) {
        return res.status(400).json({ error: error });
    }

    alarm.name = req.body.name;
    alarm.hour = req.body.hour;
    alarm.minute = req.body.minute;
    alarm.enabled = req.body.enabled;
    alarm.days = req.body.days;

    await writeAlarms(alarms);
    res.json(alarm);
});

app.delete("/api/alarms/:id", async (req, res) => {
    const id = Number(req.params.id);
    const alarms = await readAlarms();
    const index = alarms.findIndex((a) => a.id === id);

    if (index === -1) {
        return res.status(404).json({ error: "wekker niet gevonden. "});
    }

    alarms.splice(index, 1);
    await writeAlarms(alarms);
    res.status(204).send();
});

app.patch("/api/alarms/:id/toggle", async (req, res) => {
    const id = Number(req.params.id);
    const alarms = await readAlarms();
    const alarm = alarms.find((a) => a.id === id);

    if (!alarm) {
        return res.status(404).json({ error: "wekker niet gevonden." });
    }

    alarm.enabled = !alarm.enabled;
    await writeAlarms(alarms);
    res.json(alarm);
});

const SNOOZE_MINUTES = 10;

app.post("/api/alarms/:id/snooze", async (req, res) => {
    const id = Number(req.params.id);
    const alarms = await readAlarms();
    const alarm = alarms.find((a) => a.id === id);

    if (!alarm) {
        return res.status(404).json({ error: "wekker niet gevonden." });
    }

    const totalMinutes = (alarm.hour * 60 + alarm.minute + SNOOZE_MINUTES) % (24*60);
    const snoozeHour = Math.floor(totalMinutes / 60);
    const snoozeMinute = totalMinutes % 60;

    res.json({ id: alarm.id, name: alarm.name, hour: snoozeHour, minute: snoozeMinute });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
