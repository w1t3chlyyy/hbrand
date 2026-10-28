import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, X, Check, Menu, Plus } from 'lucide-react';
import { useOutfitItems, useSite, useLooks, loadCart, saveCart, submitLead } from '../lib/data';
import HeroMedia from '../components/HeroMedia';
import type { CardInfo } from '../lib/data';
import SiteFooter from '../components/SiteFooter';

const HERO = '/assets/builder/hero.jpg'; // замените файл своим фото
const LOGO = '/assets/aistudio/logo_48344320.png';
const NAV = [
  { label: 'Новинки', href: '/new' },
  { label: 'Каталог', href: '/catalog' },
  { label: 'Образы', href: '/builder' },
  { label: 'Контакты', href: '/#contacts' }
];
const ALL: Record<string, [string, string]> = {
  navy: ['Тёмно-синий', '#0b1a6b'], red: ['Красный', '#b3202a'], white: ['Белый', '#f4f1ea'],
  black: ['Чёрный', '#14161f'], gray: ['Серый', '#8a8f9c'], beige: ['Бежевый', '#d9c7a3'],
  green: ['Изумруд', '#0f5c46'], plum: ['Сливовый', '#5a1f4a'], sky: ['Небесный', '#7fa6e8']
};
const KIND: Record<string, string> = { tee: 'T-Shirt', jeans: 'Джинсы', trousers: 'Брюки', bracelet: 'Браслет' };
const PRICE: Record<string, number> = { tee: 8400, jeans: 12900, trousers: 11900, bracelet: 3900 };
const rub = (n: number) => n.toLocaleString('ru-RU') + ' ₽';

interface Piece { id: string; kind: string; color: string; name: string; price: number; image: string }
const mk = (kind: string, color: string): Piece => ({ id: `f-${kind}-${color}`, kind, color, name: `${KIND[kind]} · ${ALL[color][0]}`, price: PRICE[kind], image: '' });
const FB = {
  tee: ['navy', 'red'].map((c) => mk('tee', c)),
  bottom: ['white', 'black', 'navy', 'gray', 'beige'].map((c) => mk('jeans', c)),
  bra: ['navy', 'red', 'black', 'white'].map((c) => mk('bracelet', c))
};

/* Векторная заглушка, пока нет фото вещи */
function Thumb({ p }: { p: Piece }) {
  const hex = ALL[p.color]?.[1] ?? '#0b1a6b';
  const ink = ['white', 'beige', 'gray', 'sky'].includes(p.color) ? '#020a48' : '#fff';
  if (p.kind === 'tee')
    return (
      <svg viewBox="0 0 200 216" className="w-full h-full" aria-hidden="true">
        <path d="M62 8 L18 34 L2 84 L38 96 L52 78 L52 208 L148 208 L148 78 L162 96 L198 84 L182 34 L138 8 Q100 44 62 8 Z" fill={hex} />
        <path d="M62 8 Q100 44 138 8" fill="none" stroke="rgba(0,0,0,.25)" strokeWidth="3" />
        <text x="100" y="116" textAnchor="middle" fontFamily="The Nautigal" fontWeight="700" fontSize="40" fill={ink}>Hustlify.</text>
      </svg>
    );
  if (p.kind === 'bracelet')
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full" aria-hidden="true" fill="none">
        <ellipse cx="50" cy="42" rx="36" ry="13" stroke={hex} strokeWidth="9" />
        <ellipse cx="50" cy="64" rx="36" ry="13" stroke={hex} strokeWidth="9" strokeDasharray="14 3" />
      </svg>
    );
  const jeans = p.kind === 'jeans';
  return (
    <svg viewBox="0 0 200 260" className="w-full h-full" aria-hidden="true">
      <path d="M16 8 L184 8 L198 252 L112 252 L100 90 L88 252 L2 252 Z" fill={hex} />
      <rect x="16" y="8" width="168" height="16" fill="rgba(0,0,0,.18)" />
      {jeans
        ? <g fill="none" stroke="rgba(255,255,255,.55)" strokeWidth="2" strokeDasharray="6 4"><path d="M22 28 Q54 58 62 90" /><path d="M178 28 Q146 58 138 90" /></g>
        : <g stroke="rgba(0,0,0,.3)" strokeWidth="2"><path d="M54 28 L46 252" /><path d="M146 28 L154 252" /></g>}
    </svg>
  );
}

/* ───────── 3D-лента: крутится курсором; auto — сама; клик выбирает и ставит по центру ───────── */
function Ribbon({ items, selectedId, onSelect, auto, small, flush }: {
  items: Piece[]; selectedId: string | null; onSelect: (p: Piece | null) => void; auto: boolean; small?: boolean; flush?: boolean;
}) {
  const reps = useMemo(() => {
    if (!items.length) return [] as Piece[];
    const out: Piece[] = [];
    while (out.length < 12) out.push(...items);
    return out;
  }, [items]);
  const ref = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState(false);
  const dragRef = useRef(false);
  const autoRef = useRef(auto);
  autoRef.current = auto;
  const st = useRef({ scroll: 0, vel: 0, lastX: 0, moved: 0, last: performance.now(), target: null as number | null });
  const PITCH = 245;
  const kc = small ? 0.72 : 1;

  useEffect(() => {
    const R = ref.current;
    if (!R) return;
    const cards = Array.from(R.querySelectorAll<HTMLDivElement>('.ribbon-card-item'));
    const N = cards.length;
    if (!N) return;
    const LOOP = PITCH * N;
    const path = (w: number, h: number, a: number, b: number, r: number) => {
      const p = [[0, a], [w, b], [w, h - b], [0, h - a]];
      const mr = Math.min(r, w * 0.45, Math.max(4, (h - a - b) * 0.35));
      let d = '';
      for (let i = 0; i < 4; i++) {
        const pr = p[(i + 3) % 4], c = p[i], nx = p[(i + 1) % 4];
        const l1 = Math.hypot(pr[0] - c[0], pr[1] - c[1]) || 1, l2 = Math.hypot(nx[0] - c[0], nx[1] - c[1]) || 1;
        d += `${i ? ' L' : 'M'} ${(c[0] + ((pr[0] - c[0]) / l1) * mr).toFixed(2)} ${(c[1] + ((pr[1] - c[1]) / l1) * mr).toFixed(2)} Q ${c[0].toFixed(2)} ${c[1].toFixed(2)} ${(c[0] + ((nx[0] - c[0]) / l2) * mr).toFixed(2)} ${(c[1] + ((nx[1] - c[1]) / l2) * mr).toFixed(2)}`;
      }
      return d + ' Z';
    };
    let id = 0;
    const frame = (now: number) => {
      const s = st.current;
      const dt = Math.min(0.05, (now - s.last) / 1000);
      s.last = now;
      const W = R.clientWidth || 1000, H = R.clientHeight || 450;
      const u = Math.min(1.2, Math.max(0.68, W / 1440));
      if (!dragRef.current) {
        if (s.target !== null) {
          const d = s.target - s.scroll;
          s.scroll += d * (1 - Math.exp(-dt * 9));
          s.vel = 0;
          if (Math.abs(d) < 0.4) { s.scroll = s.target; s.target = null; }
        } else {
          s.scroll += s.vel * dt;
          s.vel *= Math.pow(0.05, dt);
          if (Math.abs(s.vel) < 0.8) s.vel = 0;
          if (autoRef.current) s.scroll -= 50 * u * dt;
        }
      }
      cards.forEach((c, i) => {
        let t = (((i * PITCH + s.scroll) % LOOP) + LOOP) % LOOP;
        if (t >= LOOP / 2) t -= LOOP;
        const nt = t / 706, x = t * (1 + 0.088 * nt * nt), d = Math.min(1.4, Math.abs(x) / 706);
        const w = (210 + 115 * Math.pow(d, 1.8)) * kc, xl = x - w / 2, xr = x + w / 2;
        const ql = Math.min(1.5, Math.abs(xl) / 706), qr = Math.min(1.5, Math.abs(xr) / 706);
        const hl = (340 + 220 * Math.pow(ql, 2.2)) * kc, hr = (340 + 220 * Math.pow(qr, 2.2)) * kc, hm = Math.max(hl, hr);
        const rotY = -Math.max(-28, Math.min(28, (x / 706) * 25));
        const z = 130 * Math.pow(d, 1.6) * u, oy = -28 * Math.pow(d, 1.8);
        const cw = w * u, ch = hm * u;
        c.style.transform = `translate3d(${(W / 2 + xl * u).toFixed(2)}px, ${(H / 2 - ch / 2 + oy * u).toFixed(2)}px, ${z.toFixed(2)}px) rotateY(${rotY.toFixed(2)}deg)`;
        c.style.width = `${cw.toFixed(2)}px`;
        c.style.height = `${ch.toFixed(2)}px`;
        c.style.clipPath = `path("${path(cw, ch, ((hm - hl) / 2) * u, ((hm - hr) / 2) * u, 20 * u * kc)}")`;
      });
      id = requestAnimationFrame(frame);
    };
    id = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(id);
  }, [reps.length, kc]);

  const down = (e: React.PointerEvent) => {
    dragRef.current = true; setDrag(true);
    const s = st.current;
    s.moved = 0; s.lastX = e.clientX; s.vel = 0; s.target = null;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const move = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const s = st.current, dx = e.clientX - s.lastX, k = 1440 / (ref.current?.clientWidth || 1000);
    s.lastX = e.clientX; s.moved += Math.abs(dx); s.scroll += dx * k; s.vel = dx * k * 35;
  };
  const up = (e: React.PointerEvent) => {
    dragRef.current = false; setDrag(false);
    const s = st.current;
    if (s.moved >= 6) return;
    const el = (document.elementFromPoint(e.clientX, e.clientY) as HTMLElement)?.closest('.ribbon-card-item') as HTMLElement | null;
    if (!el?.dataset.index) return;
    const i = parseInt(el.dataset.index, 10), p = reps[i];
    if (!p) return;
    if (selectedId === p.id) { onSelect(null); return; }
    const LOOP = PITCH * reps.length, base = -i * PITCH;
    s.target = base + Math.round((s.scroll - base) / LOOP) * LOOP;
    onSelect(p);
  };

  return (
    <div ref={ref} onPointerDown={down} onPointerMove={move} onPointerUp={up}
      style={small ? { height: 'clamp(200px,20vw,300px)' } : undefined}
      className={`ribbon-wrap ${flush ? 'mt-0' : 'mt-5 sm:mt-7 md:mt-8'} overflow-hidden select-none touch-pan-y ${drag ? 'dragging' : ''}`}>
      {reps.map((p, idx) => {
        const sel = selectedId === p.id;
        return (
          <div key={idx} data-index={idx}
            className={`ribbon-card-item z-10 cursor-pointer flex items-center justify-center p-2.5 sm:p-4 select-none transition-colors ${sel ? 'bg-[#e4ebff]' : 'bg-white'}`}>
            {p.image
              ? <img src={p.image} alt={p.name} loading="eager" className="w-full h-full object-contain pointer-events-none" />
              : <div className="w-full h-full pointer-events-none"><Thumb p={p} /></div>}
            {sel && <span className="absolute inset-1.5 rounded-[22px] border-2 border-[#020a48] pointer-events-none" />}
          </div>
        );
      })}
    </div>
  );
}

function Block({ title, subtitle, caption, pad, subClass, children }: { title?: string; subtitle?: React.ReactNode; caption?: string; pad?: string; subClass?: string; children: React.ReactNode }) {
  return (
    <section className={`${pad ?? 'pt-10 sm:pt-14 md:pt-16 pb-3 sm:pb-5'} overflow-hidden text-center bg-white`}>
      {title && (
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="relative inline-block">
            <h2 className="font-script text-7xl sm:text-9xl md:text-[140px] lg:text-[160px] leading-[0.85] text-[#020a48] font-normal">{title}</h2>
            <div className={`absolute right-1 sm:right-2 md:right-3 -bottom-3 sm:-bottom-4 md:-bottom-5 text-right font-wide font-light text-[11px] sm:text-sm md:text-base leading-[1.18] text-[#020a48] tracking-tight ${subClass ?? ''}`}>{subtitle}</div>
          </div>
        </div>
      )}
      {children}
      {caption && <p className="font-wide font-light text-xs sm:text-sm text-[#020a48]/70 px-4 mt-1">{caption}</p>}
    </section>
  );
}

/* ───────── Галерея готовых образов (фото и цены — из админки) ───────── */
interface LookT { id: string; title: string; price: number; image: string; parts?: Piece[] }
const FB_LOOKS: LookT[] = [[0, 0, 0], [1, 1, 1], [0, 2, 2], [1, 3, 3], [0, 4, 1], [1, 0, 3]].map(([t, b, r], k) => {
  const parts = [FB.tee[t], FB.bottom[b], FB.bra[r]];
  return { id: `fl-${k}`, title: `Образ 0${k + 1}`, price: parts.reduce((a, p) => a + p.price, 0), image: '', parts };
});

function Gallery({ looks, added, onAdd }: { looks: LookT[]; added: string | null; onAdd: (l: LookT) => void }) {
  return (
    <Block title="Ready Looks" subtitle={<>готовые образы<br />нажмите, чтобы забрать</>} subClass="translate-x-5 sm:translate-x-8 md:translate-x-12 translate-y-1.5" caption="Нажмите на образ — он окажется в корзине">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8 mt-8 sm:mt-10 grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
        {looks.map((l) => (
          <motion.button key={l.id} whileHover={{ y: -6 }} whileTap={{ scale: 0.97 }} onClick={() => onAdd(l)} aria-label={`${l.title} — в корзину`}
            className="group relative aspect-square rounded-[28px] sm:rounded-[44px] overflow-hidden bg-[#f1f4ff] border border-[#dfe5f7] text-left">
            {l.image
              ? <img src={l.image} alt={l.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              : <div className="absolute inset-0 flex items-center justify-center gap-2 p-5 pb-16">
                  <div className="w-1/2 h-[70%]">{l.parts && <Thumb p={l.parts[0]} />}</div>
                  <div className="w-[30%] h-[70%]">{l.parts && <Thumb p={l.parts[1]} />}</div>
                </div>}
            <div className="absolute inset-x-0 bottom-0 p-3 sm:p-5 bg-gradient-to-t from-black/75 to-transparent text-white">
              <div className="font-wide text-[11px] sm:text-sm leading-tight">{l.title}</div>
              {l.price > 0 && <div className="font-wide text-[10px] sm:text-xs text-white/75 mt-0.5">{rub(l.price)}</div>}
            </div>
            <span className={`absolute top-2.5 right-2.5 sm:top-4 sm:right-4 w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all ${added === l.id ? 'bg-emerald-500 text-white scale-110' : 'bg-white/90 text-[#020a48] group-hover:scale-110'}`}>
              {added === l.id ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </span>
          </motion.button>
        ))}
      </div>
    </Block>
  );
}

const swatch = (hex: string) => `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><rect width="10" height="10" rx="2" fill="${hex}"/></svg>`)}`;

export default function Builder() {
  const db = useOutfitItems();
  const site = useSite();
  const dbLooks = useLooks();
  const [added, setAdded] = useState<string | null>(null);
  const toPiece = (i: any): Piece => ({ id: `d-${i.id}`, kind: i.kind, color: i.color, name: i.name || `${KIND[i.kind]} · ${ALL[i.color]?.[0] ?? i.color}`, price: i.price || PRICE[i.kind] || 0, image: i.image });
  const tees = useMemo(() => { const x = db.filter((i) => i.kind === 'tee').map(toPiece); return x.length ? x : FB.tee; }, [db]);
  const bottoms = useMemo(() => { const x = db.filter((i) => i.kind === 'jeans' || i.kind === 'trousers').map(toPiece); return x.length ? x : FB.bottom; }, [db]);
  const bras = useMemo(() => { const x = db.filter((i) => i.kind === 'bracelet').map(toPiece); return x.length ? x : FB.bra; }, [db]);

  const [tee, setTee] = useState<Piece | null>(null);
  const [bot, setBot] = useState<Piece | null>(null);
  const [bra, setBra] = useState<Piece | null>(null);
  const [popup, setPopup] = useState(false);
  const [askLead, setAskLead] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '' });
  const [cart, setCart] = useState<CardInfo[]>(loadCart);
  const [menu, setMenu] = useState(false);
  const [toast, setToast] = useState('');

  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(''), 2600); };
  const gallery: LookT[] = dbLooks.length ? dbLooks.map((l) => ({ id: `g-${l.id}`, title: l.title, price: l.price, image: l.image })) : FB_LOOKS;
  const addLook = (l: LookT) => {
    const item: CardInfo = { id: Date.now(), title: l.title, category: 'Образ', price: l.price, desc: '', image: l.image || l.parts?.[0]?.image || swatch(ALL[l.parts?.[0]?.color ?? 'navy'][1]), video: '' };
    const n = [...cart, item];
    setCart(n); saveCart(n); setAdded(l.id); setTimeout(() => setAdded(null), 1500);
    flash(`«${l.title}» в корзине`);
  };
  const chosen = [tee, bot, bra].filter(Boolean) as Piece[];
  const total = chosen.reduce((s, p) => s + p.price, 0);

  const assemble = () => {
    if (!tee || !bot) return flash('Выберите футболку и низ — аксессуары по желанию');
    setAskLead(false); setPopup(true);
  };
  const addAll = () => {
    const add: CardInfo[] = chosen.map((p, k) => ({ id: Date.now() + k, title: p.name, category: 'Образ', price: p.price, desc: '', image: p.image || swatch(ALL[p.color]?.[1] ?? '#0b1a6b'), video: '' }));
    const n = [...cart, ...add];
    setCart(n); saveCart(n); setPopup(false); flash(`Образ в корзине: ${chosen.length} вещи · ${rub(total)}`);
  };
  const toStylist = async (e: React.FormEvent) => {
    e.preventDefault();
    const note = 'Образ: ' + chosen.map((p) => `${p.name} (${rub(p.price)})`).join('; ') + ` | Итого: ${rub(total)}`;
    if (await submitLead({ ...form, note, source: 'look' })) { setPopup(false); setForm({ name: '', phone: '' }); flash('Стилист получил ваш образ и свяжется с вами'); }
    else flash('Не удалось отправить. Попробуйте ещё раз.');
  };

  const iconBtn = 'relative w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-white/40 hover:border-white hover:bg-white/10 flex items-center justify-center text-white transition-all active:scale-95';
  const steps = [['1', 'Верх', !!tee], ['2', 'Низ', !!bot], ['3', 'Аксессуары', !!bra]] as const;

  return (
    <div className="min-h-screen bg-white text-[#020a48] font-text overflow-x-hidden">
      <div className="w-full max-w-[1920px] mx-auto [container-type:inline-size]">
        <section className="relative overflow-hidden bg-black rounded-b-[44px] sm:rounded-b-[68px] md:rounded-b-[6.25cqw] pb-14 md:pb-[5cqw] min-h-[100svh] md:min-h-0 flex flex-col">
          <HeroMedia src={site.builderHero || HERO} poster={HERO} className="absolute inset-0 w-full h-full object-cover brightness-[0.45]" />
          <div className="absolute inset-0 bg-black/20" />
          <header className="relative z-30 flex items-center justify-between px-4 sm:px-8 md:px-12 py-5 md:py-7">
            <a href="/" aria-label="Hustlify"><img src={LOGO} alt="Hustlify" className="w-8 h-8 sm:w-9 sm:h-9 object-contain" /></a>
            <nav className="hidden md:flex items-center gap-8 lg:gap-11 absolute left-1/2 -translate-x-1/2">
              {NAV.map((l) => (
                <a key={l.label} href={l.href} className="font-wide text-xs lg:text-[13px] tracking-wide text-white/90 hover:text-white relative py-1 group whitespace-nowrap">
                  {l.label}
                  <span className={`absolute left-0 bottom-0 w-full h-[1.5px] bg-white origin-left transition-transform duration-300 ${l.href === '/builder' ? '' : 'scale-x-0 group-hover:scale-x-100'}`} />
                </a>
              ))}
            </nav>
            <div className="flex items-center gap-2.5">
              <a href="/catalog?cart=1" aria-label="Корзина" className={iconBtn}>
                <ShoppingBag className="w-4 h-4" />
                {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-white text-[#020a48] text-[10px] font-wide font-bold w-4 h-4 rounded-full flex items-center justify-center">{cart.length}</span>}
              </a>
              <button onClick={() => setMenu(true)} aria-label="Меню" className={`md:hidden ${iconBtn}`}><Menu className="w-4 h-4" /></button>
            </div>
          </header>
          <div className="relative z-10 text-center px-5 pt-6 md:pt-[2.5cqw] flex-1 md:flex-none flex flex-col justify-center md:block">
            <h1 className="font-script font-bold text-white leading-[0.8] text-[21vw] sm:text-[19vw] md:text-[16cqw] drop-shadow-[0_8px_30px_rgba(0,0,0,0.5)]">Build Your Look</h1>
            <p className="font-wide font-light text-white leading-[1.25] tracking-[-0.03em] text-sm sm:text-lg md:text-[1.5cqw] mt-12 sm:mt-14 md:mt-[7cqw] max-w-[560px] md:max-w-[40cqw] mx-auto">
              Выберите футболку, низ и аксессуары — и посмотрите, как вы выглядите.
            </p>
            <div className="flex justify-center gap-2.5 sm:gap-3 mt-7 flex-wrap">
              {steps.map(([n, label, done]) => (
                <div key={n} className={`font-wide text-[11px] sm:text-xs flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full border border-white/35 transition-colors ${done ? 'bg-white text-[#020a48]' : 'text-white'}`}>
                  {done ? <Check className="w-3.5 h-3.5" /> : <span className="font-bold">{n}</span>}{label}
                </div>
              ))}
            </div>
          </div>
        </section>

        <Block title="T-Shirts" subtitle={<>начнём<br />с верха</>} pad="pt-10 sm:pt-14 md:pt-16 pb-0">
          <Ribbon items={tees} selectedId={tee?.id ?? null} onSelect={setTee} auto={false} />
        </Block>

        <Block pad="pt-0 pb-3 sm:pb-5"
          caption={tee || bot ? `Выбрано: ${[tee?.name, bot?.name].filter(Boolean).join(' + ')}` : 'Крутите ленты курсором и нажмите на футболку и низ'}>
          <Ribbon items={bottoms} selectedId={bot?.id ?? null} onSelect={setBot} auto={false} flush />
        </Block>

        <Block title="Accessories" subtitle={<>давайте дополним<br />образ аксессуарами</>}
          caption={bra ? `Выбрано: ${bra.name} · ${rub(bra.price)} — нажмите ещё раз, чтобы лента снова поплыла` : 'Нажмите на браслет — лента остановится, а он встанет по центру'}>
          <Ribbon items={bras} selectedId={bra?.id ?? null} onSelect={setBra} auto={!bra} small />
        </Block>

        <section className="max-w-[900px] mx-auto px-4 sm:px-6 text-center pt-10 pb-4">
          <div className="grid grid-cols-3 gap-3 sm:gap-5">
            {([['Футболка', tee], ['Низ', bot], ['Браслет', bra]] as const).map(([label, p]) => (
              <div key={label} className="aspect-square rounded-[22px] sm:rounded-[32px] border-2 border-dashed border-[#b9c3ec] bg-[#f1f4ff] flex items-center justify-center p-3 sm:p-5 transition-all">
                {p ? (p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-contain" /> : <Thumb p={p} />)
                  : <span className="font-wide text-[11px] sm:text-sm text-[#4b5690]">{label}</span>}
              </div>
            ))}
          </div>
          <div className="font-wide text-sm sm:text-base mt-6">Ваш образ: <b className="font-semibold">{chosen.length ? rub(total) : '—'}</b></div>
          <button onClick={assemble} className="btn-site btn-navy mt-5">Собрать</button>
        </section>

        <Gallery looks={gallery} added={added} onAdd={addLook} />
      </div>

      <SiteFooter />

      {popup && (
        <div onClick={() => setPopup(false)} className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <motion.div initial={{ opacity: 0, y: 30, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: 'spring', damping: 20, stiffness: 260 }}
            onClick={(e) => e.stopPropagation()} className="relative bg-[#020a48] text-white rounded-[28px] sm:rounded-[44px] max-w-[760px] w-full p-6 sm:p-12 text-center border border-white/15 max-h-[94vh] overflow-y-auto">
            <button onClick={() => setPopup(false)} aria-label="Закрыть" className="absolute right-4 top-4 w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center"><X className="w-5 h-5" /></button>
            <h3 className="font-wide font-light text-2xl sm:text-4xl leading-[1.15] tracking-[-0.03em] pt-4">Здравствуйте, вы выглядите дороже, чем думаете.</h3>
            <div className="flex justify-center gap-3 sm:gap-4 mt-8">
              {chosen.map((p) => (
                <div key={p.id} className="w-[28%] max-w-[150px]">
                  <div className="aspect-square rounded-2xl bg-white p-2.5">{p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-contain" /> : <Thumb p={p} />}</div>
                  <div className="font-wide text-[10px] sm:text-xs mt-2 leading-tight">{p.name}</div>
                  <div className="font-wide text-[10px] sm:text-xs text-[#8f9bd6] mt-0.5">{rub(p.price)}</div>
                </div>
              ))}
            </div>
            <div className="font-wide font-medium text-2xl sm:text-3xl mt-6">{rub(total)}</div>
            {askLead ? (
              <form onSubmit={toStylist} className="mt-6 flex flex-col gap-3 max-w-[420px] mx-auto">
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ваше имя" className="w-full rounded-full px-6 py-3.5 text-[#020a48] bg-white outline-none font-wide font-light" />
                <input required type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Телефон" className="w-full rounded-full px-6 py-3.5 text-[#020a48] bg-white outline-none font-wide font-light" />
                <button type="submit" className="btn-site btn-white w-full">Отправить стилисту</button>
              </form>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3 mt-7 justify-center">
                <button onClick={addAll} className="btn-site btn-white">Весь образ в корзину</button>
                <button onClick={() => setAskLead(true)} className="btn-site btn-ghost">Показать стилисту</button>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {menu && (
        <div onClick={() => setMenu(false)} className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex justify-end md:hidden">
          <div onClick={(e) => e.stopPropagation()} className="w-[84%] max-w-[340px] bg-[#020a48] text-white h-full p-6 pt-[max(1.5rem,env(safe-area-inset-top))] border-l border-white/10">
            <div className="flex items-center justify-between pb-6 border-b border-white/15">
              <span className="font-script text-4xl">Hustlify.</span>
              <button onClick={() => setMenu(false)} aria-label="Закрыть меню" className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center"><X className="w-4 h-4" /></button>
            </div>
            <nav className="flex flex-col gap-4 mt-8">{NAV.map((l) => <a key={l.label} href={l.href} onClick={() => setMenu(false)} className="font-wide text-base font-light py-1.5">{l.label}</a>)}</nav>
          </div>
        </div>
      )}

      <div className={`fixed left-1/2 bottom-[max(1.5rem,env(safe-area-inset-bottom))] -translate-x-1/2 z-[60] bg-[#020a48] text-white font-wide text-xs sm:text-sm px-6 py-3.5 rounded-full shadow-2xl transition-all duration-300 pointer-events-none flex items-center gap-2 border border-white/20 ${toast ? 'opacity-100' : 'opacity-0 translate-y-8'}`}>
        <Check className="w-4 h-4 text-emerald-400 shrink-0" /><span>{toast}</span>
      </div>
    </div>
  );
}
