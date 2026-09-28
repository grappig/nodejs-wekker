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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
