import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') });
dotenv.config();
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = supabaseUrl && serviceKey ? createClient(supabaseUrl, serviceKey) : null;

export function isSupabaseEnabled() {
  return process.env.DATABASE_MODE === 'supabase' && !!supabase;
}

export async function getSupabaseProgress(guestId) {
  if (!isSupabaseEnabled()) return null;
  const { data, error } = await supabase
    .from('player_progress')
    .select('progress')
    .eq('player_id', guestId)
    .eq('location_id', 'global')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data?.progress ?? null;
}

export async function saveSupabaseProgress(guestId, progress) {
  if (!isSupabaseEnabled()) return false;
  const { data: existing, error: readError } = await supabase
    .from('player_progress')
    .select('id')
    .eq('player_id', guestId)
    .eq('location_id', 'global')
    .limit(1)
    .maybeSingle();
  if (readError) throw readError;

  if (existing?.id) {
    const { error } = await supabase
      .from('player_progress')
      .update({ progress, updated_at: new Date().toISOString() })
      .eq('id', existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('player_progress')
      .insert({ player_id: guestId, location_id: 'global', progress, updated_at: new Date().toISOString() });
    if (error) throw error;
  }
  return true;
}
