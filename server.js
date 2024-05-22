const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const configRoutes = require('./routes/config');
const botRoutes = require('./routes/bot');

// Serve static files from the "public" directory
app.use(express.static('public'));

// Use body-parser middleware to parse JSON requests
app.use(bodyParser.json());

// Set up routes for API endpoints
app.use('/api/config', configRoutes);
app.use('/api/bot', botRoutes);

// Start the server on port 3000
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
