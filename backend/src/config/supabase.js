import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

const supabaseUrl = process.env.SUPABASE_URL || 'https://zylkysxotwhdeytfbotn.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('[Supabase] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set — Supabase auth will be unavailable.');
}

// Admin client with service role — server-side only, never expose to browser
// Pass 'ws' package as transport to fix Node.js < 22 WebSocket compatibility
export const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      realtime: {
        transport: ws
      }
    })
  : null;

/**
 * Verifies a Supabase JWT access token and returns the user payload.
 * @param {string} token - The JWT from Authorization: Bearer <token>
 * @returns {{ user, error }}
 */
export async function verifySupabaseToken(token) {
  if (!supabaseAdmin) {
    return { user: null, error: 'Supabase not configured on server.' };
  }
  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data?.user) {
      return { user: null, error: error?.message || 'Invalid token' };
    }
    return { user: data.user, error: null };
  } catch (err) {
    return { user: null, error: err.message };
  }
}
