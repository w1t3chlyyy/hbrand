import { db, tg, admins, esc, download, upload } from './_lib.js';

type Btn = { text: string; callback_data: string };
type KB = Btn[][];
const b = (text: string, callback_data: string): Btn => ({ text, callback_data });

const LABEL: Record<string, string> = {
  title: 'название',
  price: 'цену (числом, ₽)',
  category: 'категорию (например: Футболки)',
  description: 'описание',
  image: 'фото (картинкой или файлом)',
  video: 'видео 3D (mp4)',
  subtitle: 'подпись под названием',
  text: 'текст баннера'
};
const PAGE = 8;

const getState = async (id: number) =>
  (await db.from('bot_state').select('state').eq('chat_id', id).maybeSingle()).data?.state ?? null;
const setState = async (id: number, state: any) => {
  if (state) await db.from('bot_state').upsert({ chat_id: id, state });
  else await db.from('bot_state').delete().eq('chat_id', id);
};

async function show(chat: number, mid: number | undefined, text: string, kb: KB) {
  const body = {
    chat_id: chat,
    text,
    parse_mode: 'HTML',
    disable_web_page_preview: true,
    reply_markup: { inline_keyboard: kb }
  };
  if (mid) {
    const r = await tg('editMessageText', { ...body, message_id: mid });
    if (r.ok || /not modified/.test(r.description || '')) return;
  }
  await tg('sendMessage', body);
}
const say = (chat: number, text: string) => tg('sendMessage', { chat_id: chat, text, parse_mode: 'HTML' });

const menu = (c: number, m?: number) =>
  show(c, m, '<b>Hustlify · Админка</b>\nВыберите раздел:', [
    [b('📦 Товары', 'p:0'), b('🆕 Новинка', 'n')],
    [b('📨 Заявки', 'l')]
  ]);

/* ---------- Новинка (баннер в каталоге) ---------- */
const getNov = async () => ({
  active: true, title: 'Fireside', subtitle: 'COLLECTION', text: '', image: '',
  ...((await db.from('settings').select('value').eq('key', 'novelty').maybeSingle()).data?.value ?? {})
});
const saveNov = async (patch: object) => {
  const n = await getNov();
  await db.from('settings').upsert({ key: 'novelty', value: { ...n, ...patch } });
};
async function novView(c: number, m?: number) {
  const n = await getNov();
  await show(c, m,
    `<b>🆕 Новинка (баннер в каталоге)</b>\nСтатус: ${n.active ? '✅ показывается' : '🚫 скрыт'}\nНазвание: ${esc(n.title)}\nПодпись: ${esc(n.subtitle)}\nТекст: ${esc(n.text) || '—'}\nФон: ${n.image ? `<a href="${n.image}">открыть</a>` : 'по умолчанию'}`,
    [
      [b('✏️ Название', 'n:e:title'), b('✏️ Подпись', 'n:e:subtitle')],
      [b('📝 Текст', 'n:e:text'), b('🖼 Фон', 'n:e:image')],
      [b(n.active ? '🚫 Скрыть баннер' : '✅ Показать баннер', 'n:t')],
      [b('⬅️ Меню', 'm')]
    ]);
}

/* ---------- Товары ---------- */
async function list(c: number, m: number | undefined, page: number) {
  const { data, count } = await db.from('products').select('id,title,published,is_new', { count: 'exact' })
    .order('sort').order('id').range(page * PAGE, page * PAGE + PAGE - 1);
  const kb: KB = (data ?? []).map((p: any) => [
    b(`${p.published ? '👁' : '🚫'} ${p.is_new ? '⭐ ' : ''}${p.title}`.slice(0, 60), `p:v:${p.id}`)
  ]);
  const nav: Btn[] = [];
  if (page > 0) nav.push(b('◀️', `p:${page - 1}`));
  if ((page + 1) * PAGE < (count ?? 0)) nav.push(b('▶️', `p:${page + 1}`));
  if (nav.length) kb.push(nav);
  kb.push([b('➕ Добавить товар', 'p:new')], [b('⬅️ Меню', 'm')]);
  await show(c, m, `<b>📦 Товары</b> (${count ?? 0})\n👁 на сайте · 🚫 скрыт · ⭐ новинка`, kb);
}
async function card(c: number, m: number | undefined, id: number) {
  const { data: p } = await db.from('products').select('*').eq('id', id).maybeSingle();
  if (!p) return list(c, m, 0);
  await show(c, m,
    `<b>${esc(p.title)}</b>\n${esc(p.category)} · ${p.price} ₽\n${esc(p.description) || '<i>без описания</i>'}\n\nФото: ${p.image ? `<a href="${p.image}">есть</a>` : 'нет'} · Видео: ${p.video ? `<a href="${p.video}">есть</a>` : 'нет'}\nСтатус: ${p.published ? '👁 на сайте' : '🚫 скрыт'}${p.is_new ? ' · ⭐ новинка' : ''}`,
    [
      [b('✏️ Название', `p:e:${id}:title`), b('💰 Цена', `p:e:${id}:price`)],
      [b('🗂 Категория', `p:e:${id}:category`), b('📝 Описание', `p:e:${id}:description`)],
      [b('🖼 Фото', `p:e:${id}:image`), b('🎬 Видео', `p:e:${id}:video`)],
      [b(p.published ? '🚫 Скрыть' : '👁 Опубликовать', `p:t:${id}`), b(p.is_new ? '☆ Не новинка' : '⭐ Новинка', `p:s:${id}`)],
      [b('🗑 Удалить', `p:d:${id}`), b('⬅️ К списку', 'p:0')]
    ]);
}

/* ---------- Ввод значений (одно поле или мастер добавления) ---------- */
async function ask(c: number, st: any) {
  await setState(c, st);
  await tg('sendMessage', {
    chat_id: c,
    parse_mode: 'HTML',
    text: `${st.w ? `Шаг ${6 - st.q.length}/6\n` : ''}Отправьте ${LABEL[st.f]}`,
    reply_markup: { inline_keyboard: [[
      ...(st.w ? [b('⏭ Пропустить', 'skip')] : []),
      b('✖️ Отмена', st.k === 'p' ? `x:${st.id}` : 'x')
    ]] }
  });
}
async function after(c: number, st: any) {
  if (st.w && st.q.length) return ask(c, { ...st, f: st.q[0], q: st.q.slice(1) });
  await setState(c, null);
  if (st.k === 'n') return novView(c);
  await say(c, st.w ? '✅ Готово! Проверьте карточку и опубликуйте:' : '✅ Сохранено');
  return card(c, undefined, st.id);
}

/* ---------- Заявки ---------- */
async function leads(c: number, m?: number) {
  const { data } = await db.from('leads').select('*').eq('done', false).order('id', { ascending: false }).limit(10);
  const rows = data ?? [];
  await show(c, m,
    `<b>📨 Необработанные</b> (${rows.length})\n\n` +
      (rows.map((l: any) => `#${l.id} · ${esc(l.name)} · ${esc(l.phone)}${l.note ? `\n💬 ${esc(l.note)}` : ''}`).join('\n\n') || 'Пока пусто 🎉'),
    [...rows.map((l: any) => [b(`✅ #${l.id} обработано`, `l:d:${l.id}`)]), [b('⬅️ Меню', 'm')]]);
}

/* ---------- Сообщения и кнопки ---------- */
async function onMessage(msg: any) {
  const c = msg.chat.id;
  const st = await getState(c);
  const t = (msg.text || '').trim();
  if (!st || t === '/start' || t === '/menu') { await setState(c, null); return menu(c); }

  const f = st.f;
  let val: any;
  if (f === 'image') {
    const fid = msg.photo?.at(-1)?.file_id ?? (msg.document?.mime_type?.startsWith('image/') ? msg.document.file_id : null);
    if (!fid) return say(c, 'Нужна картинка (фото или файл-изображение).');
    const { buf, path } = await download(fid);
    const ext = path.split('.').pop() || 'jpg';
    val = await upload(buf, ext, ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg');
  } else if (f === 'video') {
    const v = msg.video ?? msg.animation ?? (msg.document?.mime_type?.startsWith('video/') ? msg.document : null);
    if (!v) return say(c, 'Нужно видео (mp4, до 20 МБ).');
    const { buf, path } = await download(v.file_id);
    val = await upload(buf, path.split('.').pop() || 'mp4', v.mime_type || 'video/mp4');
  } else {
    if (!t) return say(c, 'Нужен текст.');
    val = f === 'price' ? parseInt(t.replace(/\D/g, ''), 10) : t;
    if (f === 'price' && !val) return say(c, 'Введите цену числом, например 7900.');
  }
  if (st.k === 'n') await saveNov({ [f]: val });
  else await db.from('products').update({ [f]: val }).eq('id', st.id);
  await after(c, st);
}

async function onCallback(q: any) {
  const c = q.message.chat.id, m = q.message.message_id, d: string = q.data;
  const [a, s, x, y] = d.split(':');
  await tg('answerCallbackQuery', { callback_query_id: q.id });

  if (d === 'm') { await setState(c, null); return menu(c, m); }
  if (a === 'x') { await setState(c, null); return s ? card(c, undefined, +s) : menu(c); }
  if (d === 'skip') { const st = await getState(c); return st && after(c, st); }

  if (d === 'n') return novView(c, m);
  if (a === 'n' && s === 't') { await saveNov({ active: !(await getNov()).active }); return novView(c, m); }
  if (a === 'n' && s === 'e') return ask(c, { k: 'n', f: x });

  if (d === 'l') return leads(c, m);
  if (a === 'l' && s === 'd') { await db.from('leads').update({ done: true }).eq('id', +x); return leads(c, m); }
  if (a === 'l' && s === 'ok') {
    await db.from('leads').update({ done: true }).eq('id', +x);
    return tg('editMessageReplyMarkup', { chat_id: c, message_id: m, reply_markup: { inline_keyboard: [[b('✅ Обработано', 'noop')]] } });
  }

  if (a === 'p') {
    if (/^\d+$/.test(s)) return list(c, m, +s);
    if (s === 'new') {
      const { data } = await db.from('products').insert({ title: 'Новый товар', category: 'Футболки', price: 0, published: false }).select('id').single();
      return ask(c, { k: 'p', id: data!.id, f: 'title', w: true, q: ['price', 'category', 'description', 'image', 'video'] });
    }
    const id = +x;
    if (s === 'v') return card(c, m, id);
    if (s === 'e') return ask(c, { k: 'p', id, f: y });
    if (s === 't' || s === 's') {
      const { data: p } = await db.from('products').select('published,is_new').eq('id', id).single();
      await db.from('products').update(s === 't' ? { published: !p!.published } : { is_new: !p!.is_new }).eq('id', id);
      return card(c, m, id);
    }
    if (s === 'd') return show(c, m, 'Удалить товар безвозвратно?', [[b('🗑 Да, удалить', `p:dd:${id}`), b('Отмена', `p:v:${id}`)]]);
    if (s === 'dd') { await db.from('products').delete().eq('id', id); return list(c, m, 0); }
  }
}

export async function POST(req: Request) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (secret && req.headers.get('x-telegram-bot-api-secret-token') !== secret) return new Response('forbidden', { status: 403 });
  try {
    const u: any = await req.json();
    const from = (u.message ?? u.callback_query)?.from?.id;
    if (!from) return new Response('ok');
    if (!admins.includes(from)) {
      await say(from, `Нет доступа. Ваш ID: <code>${from}</code> — добавьте его в TELEGRAM_ADMIN_IDS.`);
      return new Response('ok');
    }
    if (u.callback_query) await onCallback(u.callback_query);
    else if (u.message) await onMessage(u.message);
  } catch (e) {
    console.error(e);
  }
  return new Response('ok');
}
