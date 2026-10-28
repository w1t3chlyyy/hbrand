import { db, tg, admins, esc, download, upload } from './_lib.js';

type Btn = { text: string; callback_data: string };
type KB = Btn[][];
const b = (text: string, callback_data: string): Btn => ({ text, callback_data });

const LABEL: Record<string, string> = {
  title: 'название',
  name: 'название вещи',
  homeHero: 'видео для главной (mp4 или ссылку https://…)',
  newHero: 'фото или видео для страницы «Новинки» (или ссылку https://…)',
  builderHero: 'фото или видео для страницы «Образы» (или ссылку https://…)',
  price: 'цену (числом, ₽)',
  category: 'категорию (например: Футболки)',
  description: 'описание',
  image: 'фото (картинкой или файлом)',
  video: 'видео 3D (mp4)',
  subtitle: 'подпись под названием',
  text: 'текст баннера',
  story: 'историю коллекции (длинный текст для страницы «Новинки»)',
  storyImage: 'фото для блока истории (картинкой или файлом)'
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
    [b('👗 Вещи образов', 'o:0'), b('🖼 Галерея образов', 'g:0')],
    [b('🎬 Обложки', 'h'), b('📨 Заявки', 'l')]
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
    `<b>🆕 Новинка (баннер в каталоге)</b>\nСтатус: ${n.active ? '✅ показывается' : '🚫 скрыт'}\nНазвание: ${esc(n.title)}\nПодпись: ${esc(n.subtitle)}\nТекст: ${esc(n.text) || '—'}\nИстория: ${n.story ? 'задана' : 'по умолчанию'}\nФон: ${n.image ? `<a href="${n.image}">открыть</a>` : 'по умолчанию'}`,
    [
      [b('✏️ Название', 'n:e:title'), b('✏️ Подпись', 'n:e:subtitle')],
      [b('📝 Текст', 'n:e:text'), b('🖼 Фон', 'n:e:image')],
      [b('📖 История', 'n:e:story'), b('🖼 Фото истории', 'n:e:storyImage')],
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
    text: `${st.w ? `Шаг ${(st.n ?? 6) - st.q.length}/${st.n ?? 6}\n` : ''}Отправьте ${LABEL[st.f]}`,
    reply_markup: { inline_keyboard: [[
      ...(st.w ? [b('⏭ Пропустить', 'skip')] : []),
      b('✖️ Отмена', st.k === 'p' ? `x:${st.id}` : st.k === 'o' ? `xo:${st.id}` : st.k === 'g' ? `xg:${st.id}` : 'x')
    ]] }
  });
}
async function after(c: number, st: any) {
  if (st.w && st.q.length) return ask(c, { ...st, f: st.q[0], q: st.q.slice(1) });
  await setState(c, null);
  if (st.k === 'n') return novView(c);
  if (st.k === 'o') { await say(c, '✅ Сохранено'); return ocard(c, undefined, st.id); }
  if (st.k === 'g') { await say(c, '✅ Сохранено'); return gcard(c, undefined, st.id); }
  if (st.k === 'h') { await say(c, '✅ Сохранено'); return heroView(c); }
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

/* ---------- Вещи для «Собрать образ» ---------- */
const KINDS: Record<string, string> = { tee: 'Футболка', jeans: 'Джинсы', trousers: 'Брюки', bracelet: 'Браслет' };
const COLORS: Record<string, string> = { navy: 'Тёмно-синий', red: 'Красный', white: 'Белый', black: 'Чёрный', gray: 'Серый', beige: 'Бежевый', green: 'Изумруд', plum: 'Сливовый', sky: 'Небесный' };
const OPRICE: Record<string, number> = { tee: 8400, jeans: 12900, trousers: 11900, bracelet: 3900 };
async function olist(c: number, m: number | undefined, page: number) {
  const { data, count } = await db.from('outfit_items').select('id,kind,color,published', { count: 'exact' })
    .order('kind').order('id').range(page * PAGE, page * PAGE + PAGE - 1);
  const kb: KB = (data ?? []).map((p: any) => [b(`${p.published ? '👁' : '🚫'} ${KINDS[p.kind] ?? p.kind} · ${COLORS[p.color] ?? p.color}`, `o:v:${p.id}`)]);
  const nav: Btn[] = [];
  if (page > 0) nav.push(b('◀️', `o:${page - 1}`));
  if ((page + 1) * PAGE < (count ?? 0)) nav.push(b('▶️', `o:${page + 1}`));
  if (nav.length) kb.push(nav);
  kb.push([b('➕ Добавить вещь', 'o:new')], [b('⬅️ Меню', 'm')]);
  await show(c, m, `<b>👗 Вещи для «Собрать образ»</b> (${count ?? 0})\nПока вещей нет — на сайте показываются заглушки. Футболки, джинсы/брюки и браслеты попадают в свои ленты.`, kb);
}
async function ocard(c: number, m: number | undefined, id: number) {
  const { data: p } = await db.from('outfit_items').select('*').eq('id', id).maybeSingle();
  if (!p) return olist(c, m, 0);
  await show(c, m,
    `<b>${esc(p.name)}</b>\n${KINDS[p.kind] ?? p.kind} · ${COLORS[p.color] ?? p.color} · ${p.price} ₽\nФото: ${p.image ? `<a href="${p.image}">есть</a>` : 'нет'}\nСтатус: ${p.published ? '👁 на сайте' : '🚫 скрыта'}`,
    [
      [b('✏️ Название', `o:e:${id}:name`), b('💰 Цена', `o:e:${id}:price`)],
      [b('🖼 Фото', `o:e:${id}:image`), b(p.published ? '🚫 Скрыть' : '👁 Показать', `o:t:${id}`)],
      [b('🗑 Удалить', `o:d:${id}`), b('⬅️ К списку', 'o:0')]
    ]);
}
async function onOutfit(c: number, m: number, d: string) {
  const [, s, x, y] = d.split(':');
  if (/^\d+$/.test(s)) return olist(c, m, +s);
  if (s === 'new') return show(c, m, 'Что добавляем?', [[b('👕 Футболка', 'o:k:tee'), b('👖 Джинсы', 'o:k:jeans')], [b('👖 Брюки', 'o:k:trousers'), b('📿 Браслет', 'o:k:bracelet')], [b('⬅️ Назад', 'o:0')]]);
  if (s === 'k') {
    const ids = Object.keys(COLORS);
    const kb: KB = [];
    for (let i = 0; i < ids.length; i += 2) kb.push(ids.slice(i, i + 2).map((k) => b(COLORS[k], `o:c:${x}:${k}`)));
    kb.push([b('⬅️ Назад', 'o:new')]);
    return show(c, m, `${KINDS[x]}: выберите цвет`, kb);
  }
  if (s === 'c') {
    const { data } = await db.from('outfit_items').insert({ kind: x, color: y, name: `${KINDS[x]} · ${COLORS[y]}`, price: OPRICE[x], published: true }).select('id').single();
    return ask(c, { k: 'o', id: data!.id, f: 'name', w: true, n: 3, q: ['price', 'image'] });
  }
  const id = +x;
  if (s === 'v') return ocard(c, m, id);
  if (s === 'e') return ask(c, { k: 'o', id, f: y });
  if (s === 't') { const { data: p } = await db.from('outfit_items').select('published').eq('id', id).single(); await db.from('outfit_items').update({ published: !p!.published }).eq('id', id); return ocard(c, m, id); }
  if (s === 'd') return show(c, m, 'Удалить вещь безвозвратно?', [[b('🗑 Да, удалить', `o:dd:${id}`), b('Отмена', `o:v:${id}`)]]);
  if (s === 'dd') { await db.from('outfit_items').delete().eq('id', id); return olist(c, m, 0); }
}

/* ---------- Обложки страниц (hero: фото / видео) ---------- */
const SITE_LABEL: Record<string, string> = { homeHero: '🏠 Главная (видео)', newHero: '🆕 «Новинки»', builderHero: '👗 «Образы»' };
const getSite = async () => ((await db.from('settings').select('value').eq('key', 'site').maybeSingle()).data?.value ?? {}) as Record<string, string>;
const saveSite = async (patch: object) => {
  await db.from('settings').upsert({ key: 'site', value: { ...(await getSite()), ...patch } });
};
async function heroView(c: number, m?: number) {
  const st = await getSite();
  const kb: KB = Object.keys(SITE_LABEL).map((k) => [
    b(`${SITE_LABEL[k]}: ${st[k] ? 'своё' : 'по умолчанию'}`, `h:e:${k}`),
    ...(st[k] ? [b('♻️ Сбросить', `h:r:${k}`)] : [])
  ]);
  kb.push([b('⬅️ Меню', 'm')]);
  await show(c, m, '<b>🎬 Обложки страниц</b>\nФото или видео на весь экран вверху страницы. Видео до 20 МБ; для больших файлов вставьте ссылку (https://…) на mp4.', kb);
}

/* ---------- Галерея готовых образов ---------- */
async function glist(c: number, m: number | undefined, page: number) {
  const { data, count } = await db.from('outfit_looks').select('id,title,published', { count: 'exact' })
    .order('sort').order('id').range(page * PAGE, page * PAGE + PAGE - 1);
  const kb: KB = (data ?? []).map((p: any) => [b(`${p.published ? '👁' : '🚫'} ${p.title}`.slice(0, 60), `g:v:${p.id}`)]);
  const nav: Btn[] = [];
  if (page > 0) nav.push(b('◀️', `g:${page - 1}`));
  if ((page + 1) * PAGE < (count ?? 0)) nav.push(b('▶️', `g:${page + 1}`));
  if (nav.length) kb.push(nav);
  kb.push([b('➕ Добавить образ', 'g:new')], [b('⬅️ Меню', 'm')]);
  await show(c, m, `<b>🖼 Галерея образов</b> (${count ?? 0})\nКвадраты внизу страницы «Образы»: фото образа, название и цена. По нажатию образ попадает в корзину.`, kb);
}
async function gcard(c: number, m: number | undefined, id: number) {
  const { data: p } = await db.from('outfit_looks').select('*').eq('id', id).maybeSingle();
  if (!p) return glist(c, m, 0);
  await show(c, m,
    `<b>${esc(p.title)}</b>\n${p.price} ₽\nФото: ${p.image ? `<a href="${p.image}">есть</a>` : 'нет'}\nСтатус: ${p.published ? '👁 на сайте' : '🚫 скрыт'}`,
    [
      [b('✏️ Название', `g:e:${id}:title`), b('💰 Цена', `g:e:${id}:price`)],
      [b('🖼 Фото', `g:e:${id}:image`), b(p.published ? '🚫 Скрыть' : '👁 Показать', `g:t:${id}`)],
      [b('🗑 Удалить', `g:d:${id}`), b('⬅️ К списку', 'g:0')]
    ]);
}
async function onGallery(c: number, m: number, d: string) {
  const [, s, x, y] = d.split(':');
  if (/^\d+$/.test(s)) return glist(c, m, +s);
  if (s === 'new') {
    const { data } = await db.from('outfit_looks').insert({ title: 'Новый образ', price: 0, published: true }).select('id').single();
    return ask(c, { k: 'g', id: data!.id, f: 'title', w: true, n: 3, q: ['price', 'image'] });
  }
  const id = +x;
  if (s === 'v') return gcard(c, m, id);
  if (s === 'e') return ask(c, { k: 'g', id, f: y });
  if (s === 't') { const { data: p } = await db.from('outfit_looks').select('published').eq('id', id).single(); await db.from('outfit_looks').update({ published: !p!.published }).eq('id', id); return gcard(c, m, id); }
  if (s === 'd') return show(c, m, 'Удалить образ безвозвратно?', [[b('🗑 Да, удалить', `g:dd:${id}`), b('Отмена', `g:v:${id}`)]]);
  if (s === 'dd') { await db.from('outfit_looks').delete().eq('id', id); return glist(c, m, 0); }
}

/* ---------- Сообщения и кнопки ---------- */
async function onMessage(msg: any) {
  const c = msg.chat.id;
  const st = await getState(c);
  const t = (msg.text || '').trim();
  if (!st || t === '/start' || t === '/menu') { await setState(c, null); return menu(c); }

  const f = st.f;
  let val: any;
  if (f === 'image' || f === 'storyImage') {
    const fid = msg.photo?.at(-1)?.file_id ?? (msg.document?.mime_type?.startsWith('image/') ? msg.document.file_id : null);
    if (!fid) return say(c, 'Нужна картинка (фото или файл-изображение).');
    const { buf, path } = await download(fid);
    const ext = path.split('.').pop() || 'jpg';
    val = await upload(buf, ext, ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg');
  } else if (['homeHero', 'newHero', 'builderHero'].includes(f)) {
    if (/^https?:\/\//.test(t)) val = t;
    else {
      const v = msg.video ?? msg.animation ?? (msg.document?.mime_type?.startsWith('video/') ? msg.document : null);
      const fid = v?.file_id ?? (f !== 'homeHero' ? (msg.photo?.at(-1)?.file_id ?? (msg.document?.mime_type?.startsWith('image/') ? msg.document.file_id : null)) : null);
      if (!fid) return say(c, f === 'homeHero' ? 'Нужно видео (mp4, до 20 МБ) или ссылка на него.' : 'Нужно фото или видео (до 20 МБ) или ссылка.');
      const { buf, path } = await download(fid);
      const ext = path.split('.').pop() || (v ? 'mp4' : 'jpg');
      val = await upload(buf, ext, v ? (v.mime_type || 'video/mp4') : ext === 'png' ? 'image/png' : 'image/jpeg');
    }
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
  else if (st.k === 'h') await saveSite({ [f]: val });
  else if (st.k === 'g') await db.from('outfit_looks').update({ [f]: val }).eq('id', st.id);
  else if (st.k === 'o') await db.from('outfit_items').update({ [f]: val }).eq('id', st.id);
  else await db.from('products').update({ [f]: val }).eq('id', st.id);
  await after(c, st);
}

async function onCallback(q: any) {
  const c = q.message.chat.id, m = q.message.message_id, d: string = q.data;
  const [a, s, x, y] = d.split(':');
  await tg('answerCallbackQuery', { callback_query_id: q.id });

  if (d === 'm') { await setState(c, null); return menu(c, m); }
  if (a === 'xg') { await setState(c, null); return gcard(c, undefined, +s); }
  if (a === 'g') return onGallery(c, m, d);
  if (d === 'h') return heroView(c, m);
  if (a === 'h') {
    if (s === 'e') return ask(c, { k: 'h', f: x });
    if (s === 'r') { await saveSite({ [x]: '' }); return heroView(c, m); }
  }
  if (a === 'xo') { await setState(c, null); return ocard(c, undefined, +s); }
  if (a === 'o') return onOutfit(c, m, d);
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
      return ask(c, { k: 'p', id: data!.id, f: 'title', w: true, n: 6, q: ['price', 'category', 'description', 'image', 'video'] });
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
