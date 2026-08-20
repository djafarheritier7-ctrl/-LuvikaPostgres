import { useEffect, useRef } from 'react';

export function useRealtime(channel: string, onMessage: (msg: any) => void) {
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_REALTIME_WS_URL || (typeof window !== 'undefined' ? window.location.origin.replace(/^http/, 'ws') : 'ws://localhost:8999');
    const url = base + `/?channel=${encodeURIComponent(channel)}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.addEventListener('message', (ev) => {
      try {
        const payload = JSON.parse(ev.data);
        onMessage(payload);
      } catch (e) {
        // ignore parse errors
      }
    });

    ws.addEventListener('open', () => console.debug('realtime ws open', channel));
    ws.addEventListener('close', () => console.debug('realtime ws closed', channel));
    return () => { try { ws.close(); } catch {} };
  }, [channel, onMessage]);
}