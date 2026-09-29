import { supabase } from '@/lib/supabase';

// In-memory fallback tracking for fast response
const memoryGuestSessions = new Map<string, number>();

function pruneMemorySessions() {
  const cutoff = Date.now() - 5 * 60 * 1000;
  for (const [sid, timestamp] of memoryGuestSessions.entries()) {
    if (timestamp < cutoff) {
      memoryGuestSessions.delete(sid);
    }
  }
}

/**
 * Record a guest heartbeat ping
 */
export async function recordGuestPing(sessionId: string): Promise<number> {
  if (!sessionId || typeof sessionId !== 'string') return 0;
  const cleanId = sessionId.slice(0, 64).trim();
  if (!cleanId) return 0;

  // Update in-memory
  memoryGuestSessions.set(cleanId, Date.now());
  pruneMemorySessions();

  try {
    const nowIso = new Date().toISOString();
    const cutoffIso = new Date(Date.now() - 5 * 60 * 1000).toISOString();

    await supabase
      .from('guest_sessions')
      .upsert({ session_id: cleanId, last_seen: nowIso }, { onConflict: 'session_id' });

    // Cleanup old sessions occasionally (1 in 5 pings)
    if (Math.random() < 0.2) {
      await supabase
        .from('guest_sessions')
        .delete()
        .lt('last_seen', cutoffIso);
    }

    const { count, error } = await supabase
      .from('guest_sessions')
      .select('*', { count: 'exact', head: true })
      .gte('last_seen', cutoffIso);

    const dbCount = !error && count !== null ? count : 0;
    return Math.max(dbCount, memoryGuestSessions.size);
  } catch (err) {
    console.error('Error recording guest ping to DB, using in-memory count:', err);
    return memoryGuestSessions.size;
  }
}

/**
 * Get the current number of online guests (last 5 minutes)
 */
export async function getActiveGuestCount(): Promise<number> {
  pruneMemorySessions();

  try {
    const cutoffIso = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { count, error } = await supabase
      .from('guest_sessions')
      .select('*', { count: 'exact', head: true })
      .gte('last_seen', cutoffIso);

    const dbCount = !error && count !== null ? count : 0;
    return Math.max(dbCount, memoryGuestSessions.size);
  } catch (err) {
    console.error('Error fetching active guest count from DB, using in-memory count:', err);
    return memoryGuestSessions.size;
  }
}
