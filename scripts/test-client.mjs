import WebSocket from 'ws';

const url = process.env.URL || 'ws://localhost:8081';
console.log('Connecting to', url);
const ws = new WebSocket(url);

ws.on('open', () => {
  console.log('connected');
});
ws.on('message', (msg) => {
  try {
    const data = JSON.parse(msg.toString());
    console.log('message', data);
  } catch (e) { console.log('raw', msg.toString()); }
});
ws.on('close', () => console.log('closed'));
ws.on('error', (err) => console.error('error', err.message));

// keep process alive
setInterval(() => ws.ping?.(), 25_000);
