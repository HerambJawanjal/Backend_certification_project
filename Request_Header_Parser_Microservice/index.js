const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors()); 
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});


app.get('/api/whoami', (req, res) => {
  res.json({
    ipaddress: req.ip,
    language: req.get('Accept-Language'),
    software: req.get('User-Agent')
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
