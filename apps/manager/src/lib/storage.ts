import { supabase } from './supabase';
import { uid } from './id';

const BUCKET = 'media';

/** Upload une image vers le bucket public `media`, renvoie son URL publique. */
export async function uploadImage(file: File, folder: string): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${folder}/${uid()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: false });
  if (error) throw new Error(`[storage] ${error.message}`);
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}
