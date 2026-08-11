import { WebSocketServer } from 'ws';

const PORT = process.env.PORT || 8081;
const wss = new WebSocketServer({ port: PORT });

console.log(`Presence server listening on ws://0.0.0.0:${PORT}`);

function broadcastCount() {
  const payload = JSON.stringify({ type: 'count', count: wss.clients.size });
  for (const client of wss.clients) {
    if (client.readyState === 1) client.send(payload);
  }
}

wss.on('connection', (ws) => {
  ws.isAlive = true;
  ws.on('pong', () => { ws.isAlive = true; });

  // send initial count
  broadcastCount();

  ws.on('close', () => {
    broadcastCount();
  });
});

// Heartbeat to clean dead clients and keep accurate count
const interval = setInterval(() => {
  for (const ws of wss.clients) {
    if (ws.isAlive === false) return ws.terminate();
    ws.isAlive = false;
    ws.ping(() => {});
  }
  broadcastCount();
}, 30_000);

process.on('SIGTERM', () => { clearInterval(interval); wss.close(); process.exit(0); });
