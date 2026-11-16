# Node.js alarmclock api

## explanation
Simple alarmclock api built using node.js and express. Server saves all of the alarms in ``data/alarms.json` and serves a small frontend `public`. User can view, add, edit, delete, update and add snooze time without refreshing the page.

## installation

```bash
npm install
```
## startup
```bash
npm start
```

the app will run on

```text
http://localhost:3000
```

## docs

### GET /api/alarms
fetches all alarms

### GET /api/alarms/:id
fetches 1 alarm by id

### POST /api/alarms
adds new alarm

format:

```json
{
  "name": "",
  "hour": 0,
  "minute": 0,
  "enabled": true,
  "days": [""]
}
```

Validation:
- name can't be empty
- hour must be between 0 and 23
- minutes have to be between 0 and 59
- enable has to be a boolean
- min. 1 valid day has to be chosen

### PUT /api/alarms/:id
edits an existing alarm

### DELETE /api/alarms/:id
deletes an existing alarm

### PATCH /api/alarms/:id/toggle
enables/disables an existing alarm

### POST /api/alarms/:id/snooze
activates snooze for an alarm. Standard value is 10 min. App also accepts 5, 10, 15 mins.

### GET /api/alarms/next
decides which alarm goes off next, accounting for current day, time and selected days

result format:

```json
{
  "alarm": {
    "id": 0,
    "name": "",
    "hour": 0,
    "minute": 0,
    "enabled": true,
    "days": [""]
  },
  "day": "",
  "minutesUntil": 0,
  "secondsUntil": 0
}
```

## structure
```text
nodejs-wekker-api/
├── server.js
├── package.json
├── README.md
├── data/
│   └── alarms.json
└── public/
    ├── index.html
    ├── style.css
    └── script.js
```

## conclusion
the project is finished with node.js/express api, a persistant data storage, a rest api with validation, a frontend with fetch() and a readme.
