require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const bodyParser = require('body-parser');
const app = express();

const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/views/index.html');
});

// In-memory storage for URLs
let urlDatabase = {};
let counter = 1;

// POST endpoint to shorten URL
app.post('/api/shorturl', (req, res) => {
  const original_url = req.body.url;

  // Validate URL format (should start with http:// or https://)
  const urlPattern = /^https?:\/\/([\w.-]+)/;
  const match = original_url.match(urlPattern);

  if (!match) {
    return res.json({ error: 'invalid url' });
  }

  const hostname = match[1];

  // DNS lookup to verify the URL
  dns.lookup(hostname, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    } else {
      const short_url = counter++;
      urlDatabase[short_url] = original_url;
      res.json({ original_url, short_url });
    }
  });
});

// GET endpoint to redirect to the original URL
app.get('/api/shorturl/:short_url', (req, res) => {
  const short_url = req.params.short_url;
  const original_url = urlDatabase[short_url];

  if (original_url) {
    res.redirect(original_url);
  } else {
    res.json({ error: 'No short URL found for the given input' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
