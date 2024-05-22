const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const WebSocket = require('ws');
const app = express();
const configRoutes = require('./routes/config');
const botRoutes = require('./routes/bot');

let botProcess;
let wsServer;
let wsClients = [];

// Serve static files from the "public" directory
app.use(express.static('public'));

// Use body-parser middleware to parse JSON requests
app.use(bodyParser.json());

// Set up routes for API endpoints
app.use('/api/config', configRoutes);
app.use('/api/bot', botRoutes);

// Start the server on port 3000
const PORT = 3000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Set up WebSocket server
wsServer = new WebSocket.Server({ server });

wsServer.on('connection', (ws) => {
  wsClients.push(ws);
  ws.on('close', () => {
    wsClients = wsClients.filter((client) => client !== ws);
  });
});

function broadcast(message) {
  wsClients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Redirect console output to WebSocket
function setupConsoleMirroring() {
  const originalLog = console.log;
  const originalError = console.error;

  console.log = function (...args) {
    const message = args.join(' ');
    broadcast(message);
    originalLog.apply(console, args);
  };

  console.error = function (...args) {
    const message = args.join(' ');
    broadcast(`ERROR: ${message}`);
    originalError.apply(console, args);
  };
}

// Bot start and stop functions
function startBot() {
  if (botProcess) return;
  botProcess = exec('node index.js');
  botProcess.stdout.on('data', (data) => {
    console.log(data.toString());
  });
  botProcess.stderr.on('data', (data) => {
    console.error(data.toString());
  });
  botProcess.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
    botProcess = null;
  });
}

function stopBot() {
  if (!botProcess) return;
  botProcess.kill();
  botProcess = null;
}

// Bot control routes
app.post('/api/bot/start', (req, res) => {
  if (botProcess) {
    return res.status(400).send('Bot is already running');
  }
  setupConsoleMirroring();
  startBot();
  res.send('Bot started');
});

app.post('/api/bot/stop', (req, res) => {
  if (!botProcess) {
    return res.status(400).send('Bot is not running');
  }
  stopBot();
  res.send('Bot stopped');
});
