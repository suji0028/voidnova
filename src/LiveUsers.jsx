import { useEffect, useState } from 'react';

export default function LiveUsers() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let ws;
    let reconnectTimeout;

    const urlFromEnv = import.meta.env.VITE_PRESENCE_URL;
    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    const defaultUrl = `${protocol}//${location.hostname}:8081`;
    const url = urlFromEnv || defaultUrl;

    const connect = () => {
      console.debug('[LiveUsers] connecting to', url);
      try {
        ws = new WebSocket(url);
      } catch (e) {
        console.warn('[LiveUsers] websocket construction failed, retrying', e?.message);
        reconnectTimeout = setTimeout(connect, 2000);
        return;
      }

      ws.addEventListener('open', () => console.debug('[LiveUsers] connected'));

      ws.addEventListener('message', (ev) => {
        try {
          const data = JSON.parse(ev.data);
          if (data && data.type === 'count') setCount(data.count);
        } catch (err) { console.warn('[LiveUsers] bad message', err); }
      });

      ws.addEventListener('close', () => {
        console.debug('[LiveUsers] closed, reconnecting');
        reconnectTimeout = setTimeout(connect, 1500);
      });
      ws.addEventListener('error', (err) => {
        console.error('[LiveUsers] ws error', err);
        try { ws.close(); } catch {}
      });
    };

    connect();
    return () => {
      if (ws) ws.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, []);

  return (
    <div className="presence" aria-live="polite" title={`${count} live users`}>
      <span className="dot" aria-hidden="true" />
      <span className="count">{count}</span>
      <span className="label">With You</span>
    </div>
  );
}
