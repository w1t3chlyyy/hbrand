import { db, tg, admins, esc } from './_lib.js';

export async function POST(req: Request) {
  const b: any = await req.json().catch(() => null);
  const name = String(b?.name ?? '').trim().slice(0, 100);
  const phone = String(b?.phone ?? '').trim().slice(0, 40);
  const note = String(b?.note ?? '').trim().slice(0, 1500);
  if (!name || !phone || b?.website) return Response.json({ ok: false }, { status: 400 });

  const { data, error } = await db
    .from('leads')
    .insert({ name, phone, note, source: String(b?.source ?? 'site').slice(0, 20) })
    .select()
    .single();
  if (error) return Response.json({ ok: false }, { status: 500 });

  const icon = data.source === 'order' ? '🛍 Новый заказ' : data.source === 'look' ? '👗 Образ для стилиста' : '📨 Новая анкета';
  const text = `${icon} <b>#${data.id}</b>\n👤 ${esc(name)}\n📞 ${esc(phone)}${note ? `\n💬 ${esc(note)}` : ''}`;
  await Promise.all(
    admins.map((id) =>
      tg('sendMessage', {
        chat_id: id,
        text,
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: [[{ text: '✅ Обработано', callback_data: `l:ok:${data.id}` }]] }
      })
    )
  );
  return Response.json({ ok: true });
}
