import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const CHANNEL_NAME = 'khaalipan-presence';

export default function LiveUsers() {
  const [liveCount, setLiveCount] = useState(1);
  const [totalCount, setTotalCount] = useState(null);

  useEffect(() => {
    const userId = crypto.randomUUID();

    const channel = supabase.channel(CHANNEL_NAME, {
      config: { presence: { key: userId } }
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        setLiveCount(Object.keys(state).length);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ online_at: new Date().toISOString() });
        }
      });

    const incrementVisits = async () => {
      try {
        const { data, error } = await supabase.rpc('increment_visits');
        if (!error && data) setTotalCount(data);
      } catch {
        // silently fail - non-critical
      }
    };

    incrementVisits();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fmt = (n) => {
    if (n === null) return null;
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return String(n);
  };

  return (
    <div className="presence" aria-live="polite">
      <span className="dot" aria-hidden="true" />
      <span className="presence-live">
        <span className="presence-num">{liveCount}</span>
        <span className="presence-label">online</span>
      </span>
      {totalCount !== null && (
        <>
          <span className="presence-divider"> · </span>
          <span className="presence-num">{fmt(totalCount)}</span>
          <span className="presence-label">visited</span>
        </>
      )}
    </div>
  );
}
