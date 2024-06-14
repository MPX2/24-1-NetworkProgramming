const express = require('express');
const http = require('http');
const path = require('path');
const WebSocket = require('ws');
const url = require('url');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

const rooms = {};

wss.on('connection', function connection(ws, req) {
  const parameters = url.parse(req.url, true);
  const roomId = parameters.query.roomId;

  if (!rooms[roomId]) {
    rooms[roomId] = new Set();
  }
  rooms[roomId].add(ws);

  ws.on('message', function incoming(message) {
    rooms[roomId].forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message.toString());
      }
    });
  });

  ws.on('close', () => {
    rooms[roomId].delete(ws);
    if (rooms[roomId].size === 0) {
      delete rooms[roomId];
    }
  });

  ws.on('error', (error) => {
    console.error(`WebSocket error: ${error}`);
  });

  ws.send(`Connected to room ${roomId}`);
});

server.listen(8080, () => {
  console.log('Server is listening on port 8080');
});
