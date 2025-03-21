const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

let registeredUsers = [];
let workoutRecords = [];

app.post('/api/users', (req, res) => {
  const newUser = {
    username: req.body.username,
    _id: Math.random().toString(36).substr(2, 9)
  };
  registeredUsers.push(newUser);
  res.json(newUser);
});

app.get('/api/users', (req, res) => {
  res.json(registeredUsers);
});

app.post('/api/users/:userId/exercises', (req, res) => {
  const currentUser = registeredUsers.find(user => user._id === req.params.userId);
  if (!currentUser) return res.status(404).send('User does not exist');

  const { description, duration, date } = req.body;
  const workout = {
    userId: currentUser._id,
    description: description,
    duration: parseInt(duration),
    date: date ? new Date(date) : new Date()
  };

  workoutRecords.push(workout);

  res.json({
    _id: currentUser._id,
    username: currentUser.username,
    description: workout.description,
    duration: workout.duration,
    date: workout.date.toDateString()
  });
});

app.get('/api/users/:userId/logs', (req, res) => {
  const foundUser = registeredUsers.find(user => user._id === req.params.userId);
  if (!foundUser) return res.status(404).send('User not found');

  let userWorkouts = workoutRecords.filter(record => record.userId === foundUser._id);
  const { from, to, limit } = req.query;

  if (from) {
    const fromDate = new Date(from);
    userWorkouts = userWorkouts.filter(record => record.date >= fromDate);
  }

  if (to) {
    const toDate = new Date(to);
    userWorkouts = userWorkouts.filter(record => record.date <= toDate);
  }

  if (limit) {
    userWorkouts = userWorkouts.slice(0, Number(limit));
  }

  res.json({
    _id: foundUser._id,
    username: foundUser.username,
    count: userWorkouts.length,
    log: userWorkouts.map(record => ({
      description: record.description,
      duration: record.duration,
      date: record.date.toDateString()
    }))
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
