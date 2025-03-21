const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// ✅ In-memory data storage
let users = [];
let exercises = [];

// ✅ Create a new user
app.post('/api/users', (req, res) => {
  const user = {
    username: req.body.username,
    _id: Math.random().toString(36).substring(2, 10)
  };
  users.push(user);
  res.json(user);
});

// ✅ Get all users
app.get('/api/users', (req, res) => {
  res.json(users);
});

// ✅ Add exercise
app.post('/api/users/:_id/exercises', (req, res) => {
  const user = users.find(u => u._id === req.params._id);
  if (!user) return res.status(404).send('User not found');

  const { description, duration, date } = req.body;
  const exercise = {
    userId: user._id,
    description,
    duration: Number(duration),
    date: date ? new Date(date) : new Date()
  };
  exercises.push(exercise);

  res.json({
    _id: user._id,
    username: user.username,
    date: exercise.date.toDateString(),
    duration: exercise.duration,
    description: exercise.description
  });
});

// ✅ Get exercise log
app.get('/api/users/:_id/logs', (req, res) => {
  const user = users.find(u => u._id === req.params._id);
  if (!user) return res.status(404).send('User not found');

  let userLogs = exercises.filter(ex => ex.userId === user._id);

  // ✅ Filtering by date
  const { from, to, limit } = req.query;
  if (from) {
    const fromDate = new Date(from);
    userLogs = userLogs.filter(ex => ex.date >= fromDate);
  }
  if (to) {
    const toDate = new Date(to);
    userLogs = userLogs.filter(ex => ex.date <= toDate);
  }

  // ✅ Apply limit
  if (limit) {
    userLogs = userLogs.slice(0, Number(limit));
  }

  res.json({
    _id: user._id,
    username: user.username,
    count: userLogs.length,
    log: userLogs.map(ex => ({
      description: ex.description,
      duration: ex.duration,
      date: ex.date.toDateString()
    }))
  });
});

// ✅ Start server
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
