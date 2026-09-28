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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
