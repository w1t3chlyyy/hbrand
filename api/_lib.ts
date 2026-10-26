import { createClient } from '@supabase/supabase-js';

export const db = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false }
});
const T = process.env.TELEGRAM_BOT_TOKEN!;
export const admins = (process.env.TELEGRAM_ADMIN_IDS || '')
  .split(',')
  .map((s) => Number(s.trim()))
  .filter(Boolean);

export const tg = async (method: string, body: object): Promise<any> => {
  const r = await fetch(`https://api.telegram.org/bot${T}/${method}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body)
  });
  return r.json();
};

export const esc = (s: unknown) =>
  String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export async function download(file_id: string) {
  const r = await tg('getFile', { file_id });
  if (!r.ok) throw new Error('getFile: ' + r.description);
  const res = await fetch(`https://api.telegram.org/file/bot${T}/${r.result.file_path}`);
  return { buf: Buffer.from(await res.arrayBuffer()), path: r.result.file_path as string };
}

export async function upload(buf: Buffer, ext: string, mime: string) {
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await db.storage.from('media').upload(name, buf, { contentType: mime, upsert: true });
  if (error) throw error;
  return db.storage.from('media').getPublicUrl(name).data.publicUrl;
}
