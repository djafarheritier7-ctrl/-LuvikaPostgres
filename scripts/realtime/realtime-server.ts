// Realtime WS server: listens to Postgres NOTIFY channels and broadcasts {op, id}
// Requires: npm i pg ws
import { Client } from 'pg';
import WebSocket, { WebSocketServer } from 'ws';

const PG = process.env.DATABASE_URL;
const PORT = Number(process.env.REALTIME_PORT || 8999);

if (!PG) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

const wss = new WebSocketServer({ port: PORT });
console.log('Realtime WS server listening on', PORT);

wss.on('connection', (socket) => {
  console.log('ws client connected');
});

async function start() {
  const client = new Client({ connectionString: PG });
  await client.connect();
  client.on('notification', (msg) => {
    try {
      const payload = JSON.parse(msg.payload || '{}');
      wss.clients.forEach(ws => {
        if ((ws as WebSocket).readyState === WebSocket.OPEN) (ws as WebSocket).send(JSON.stringify(payload));
      });
    } catch (e) {
      console.error('failed to parse notify payload', e);
    }
  });

  // Example: listen to realtime_events (attach via trigger later)
  await client.query('LISTEN realtime_events');
  console.log('Listening to channel realtime_events');
}

start().catch(err => {
  console.error(err);
  process.exit(1);
});