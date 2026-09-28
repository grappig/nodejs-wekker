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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
