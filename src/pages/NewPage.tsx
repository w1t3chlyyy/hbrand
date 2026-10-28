import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ShoppingBag, X, Check, Menu } from 'lucide-react';
import HeroMedia from '../components/HeroMedia';
import SiteFooter from '../components/SiteFooter';
import { useProducts, useNovelty, useSite, loadCart, saveCart } from '../lib/data';
import type { CardInfo } from '../lib/data';
import { FALLBACK_PRODUCTS } from '../lib/fallback';

const HERO = '/assets/fireside/hero.jpg';
const STORY_IMG = '/assets/fireside/story.jpg';
const LOGO = '/assets/aistudio/logo_48344320.png';
const STORY =
  'Зимой, когда день уже кончился, а вечер ещё не начался, в старых домах зажигали камин. Бабушка доставала шерстяной плед, пахнущий кедром и лавандой, и укутывала меня с головой. Мы сидели у огня, и я помню не книгу, которую она читала, — я помню тепло её плеча и чувство абсолютной защищённости. Спустя годы я понял: настоящая роскошь — это не вещи, а моменты. Но вещи могут эти моменты хранить. Fireside — одежда, в которой ты несёшь это тепло с собой, даже когда выходишь за дверь. Приходи, садись ближе. Огонь уже горит.';
const NAV = [
  { label: 'Новинки', href: '/new' },
  { label: 'Каталог', href: '/catalog' },
  { label: 'Образы', href: '/builder' },
  { label: 'О бренде', href: '/#about' },
  { label: 'Контакты', href: '/#contacts' }
];
const rub = (n: number) => n.toLocaleString('ru-RU') + ' ₽';

/* ───────── 3D-лента «The Wardrobe» (та же, что на главной) ───────── */
function Wardrobe({ products, onPick, title, subtitle }: { products: CardInfo[]; onPick: (p: CardInfo) => void; title: string; subtitle: React.ReactNode }) {
  const items = useMemo(() => {
    if (!products.length) return [] as CardInfo[];
    const out: CardInfo[] = [];
    while (out.length < 12) out.push(...products);
    return out;
  }, [products]);
  const ref = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState(false);
  const st = useRef({ scroll: 0, vel: 0, lastX: 0, moved: 0, last: performance.now() });

  useEffect(() => {
    const R = ref.current;
    if (!R) return;
    const cards = Array.from(R.querySelectorAll<HTMLDivElement>('.ribbon-card-item'));
    const N = cards.length;
    if (!N) return;
    const PITCH = 245, LOOP = PITCH * N;

    const path = (w: number, h: number, a: number, b: number, r: number) => {
      const p = [[0, a], [w, b], [w, h - b], [0, h - a]];
      const mr = Math.min(r, w * 0.45, Math.max(4, (h - a - b) * 0.35));
      let d = '';
      for (let i = 0; i < 4; i++) {
        const pr = p[(i + 3) % 4], c = p[i], nx = p[(i + 1) % 4];
        const l1 = Math.hypot(pr[0] - c[0], pr[1] - c[1]) || 1;
        const l2 = Math.hypot(nx[0] - c[0], nx[1] - c[1]) || 1;
        const sx = c[0] + ((pr[0] - c[0]) / l1) * mr, sy = c[1] + ((pr[1] - c[1]) / l1) * mr;
        const ex = c[0] + ((nx[0] - c[0]) / l2) * mr, ey = c[1] + ((nx[1] - c[1]) / l2) * mr;
        d += `${i ? ' L' : 'M'} ${sx.toFixed(2)} ${sy.toFixed(2)} Q ${c[0].toFixed(2)} ${c[1].toFixed(2)} ${ex.toFixed(2)} ${ey.toFixed(2)}`;
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
      if (!drag) {
        s.scroll += s.vel * dt;
        s.vel *= Math.pow(0.05, dt);
        if (Math.abs(s.vel) < 0.8) s.vel = 0;
        s.scroll -= 50 * u * dt;
      }
      cards.forEach((c, i) => {
        let t = (((i * PITCH + s.scroll) % LOOP) + LOOP) % LOOP;
        if (t >= LOOP / 2) t -= LOOP;
        const nt = t / 706, x = t * (1 + 0.088 * nt * nt), d = Math.min(1.4, Math.abs(x) / 706);
        const w = 210 + 115 * Math.pow(d, 1.8), xl = x - w / 2, xr = x + w / 2;
        const ql = Math.min(1.5, Math.abs(xl) / 706), qr = Math.min(1.5, Math.abs(xr) / 706);
        const hl = 340 + 220 * Math.pow(ql, 2.2), hr = 340 + 220 * Math.pow(qr, 2.2), hm = Math.max(hl, hr);
        const rotY = -Math.max(-28, Math.min(28, (x / 706) * 25));
        const z = 130 * Math.pow(d, 1.6) * u, oy = -28 * Math.pow(d, 1.8);
        const cw = w * u, ch = hm * u;
        c.style.transform = `translate3d(${(W / 2 + xl * u).toFixed(2)}px, ${(H / 2 - ch / 2 + oy * u).toFixed(2)}px, ${z.toFixed(2)}px) rotateY(${rotY.toFixed(2)}deg)`;
        c.style.width = `${cw.toFixed(2)}px`;
        c.style.height = `${ch.toFixed(2)}px`;
        c.style.clipPath = `path("${path(cw, ch, ((hm - hl) / 2) * u, ((hm - hr) / 2) * u, 20 * u)}")`;
      });
      id = requestAnimationFrame(frame);
    };
    id = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(id);
  }, [drag, items.length]);

  const down = (e: React.PointerEvent) => {
    setDrag(true);
    const s = st.current;
    s.moved = 0; s.lastX = e.clientX; s.vel = 0;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const move = (e: React.PointerEvent) => {
    if (!drag) return;
    const s = st.current, dx = e.clientX - s.lastX, k = 1440 / (ref.current?.clientWidth || 1000);
    s.lastX = e.clientX; s.moved += Math.abs(dx); s.scroll += dx * k; s.vel = dx * k * 35;
  };
  const up = (e: React.PointerEvent) => {
    setDrag(false);
    if (st.current.moved < 6) {
      const el = (document.elementFromPoint(e.clientX, e.clientY) as HTMLElement)?.closest('.ribbon-card-item') as HTMLElement | null;
      const p = el?.dataset.index ? items[parseInt(el.dataset.index, 10)] : null;
      if (p) onPick(p);
    }
  };

  return (
    <section id="wardrobe" className="pt-10 sm:pt-14 md:pt-16 pb-3 sm:pb-5 overflow-hidden text-center bg-white scroll-mt-4">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="relative inline-block">
          <h2 className="font-script text-7xl sm:text-9xl md:text-[140px] lg:text-[160px] leading-[0.85] text-[#020a48] font-normal">{title}</h2>
          <div className="absolute right-1 sm:right-2 md:right-3 -bottom-3 sm:-bottom-4 md:-bottom-5 text-right font-wide font-light text-[11px] sm:text-sm md:text-base leading-[1.18] text-[#020a48] tracking-tight">
            {subtitle}
          </div>
        </div>
      </div>
      <div ref={ref} onPointerDown={down} onPointerMove={move} onPointerUp={up}
        className={`ribbon-wrap mt-5 sm:mt-7 md:mt-8 overflow-hidden select-none touch-pan-y ${drag ? 'dragging' : ''}`}>
        {items.map((p, idx) => (
          <div key={`${p.id}-${idx}`} data-index={idx}
            className="ribbon-card-item z-10 overflow-hidden active:scale-[0.98] group bg-white cursor-pointer flex items-center justify-center p-2.5 sm:p-4 select-none">
            <img src={p.image} alt={p.title} loading="eager" className="w-full h-full object-contain pointer-events-none select-none transition-transform duration-300 group-hover:scale-105" />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center -mt-3 sm:-mt-6 md:-mt-8 mb-4 sm:mb-6 px-4 relative z-20">
        <a href="/catalog" className="btn-site btn-outline">
          Весь каталог
        </a>
      </div>
    </section>
  );
}

/* ───────── Страница «Новинки» (Fire Side) ───────── */
export default function NewPage() {
  const novelty = useNovelty();
  const site = useSite();
  const { products } = useProducts(FALLBACK_PRODUCTS);
  const [sel, setSel] = useState<CardInfo | null>(null);
  const [cart, setCart] = useState<CardInfo[]>(loadCart);
  const [menu, setMenu] = useState(false);
  const [toast, setToast] = useState('');

  const add = (p: CardInfo) => {
    const n = [...cart, p];
    setCart(n); saveCart(n);
    setToast(`«${p.title}» добавлен в корзину`);
    setTimeout(() => setToast(''), 2500);
  };
  const title = novelty.title && novelty.title !== 'Fireside' ? novelty.title : 'Fire Side';
  const story = novelty.story || STORY;
  const iconBtn = 'relative w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-white/40 hover:border-white hover:bg-white/10 flex items-center justify-center text-white transition-all duration-200 active:scale-95';

  return (
    <div className="min-h-screen bg-white text-[#020a48] font-text overflow-x-hidden">
      <div className="w-full max-w-[1920px] mx-auto [container-type:inline-size]">

        {/* HERO */}
        <section className="relative overflow-hidden bg-black rounded-b-[44px] sm:rounded-b-[68px] md:rounded-b-[6.25cqw] min-h-[100svh] md:min-h-0 md:aspect-[16/9] flex md:block">
          <HeroMedia src={site.newHero || novelty.image || HERO} className="absolute inset-0 w-full h-full object-cover brightness-[0.55]" />
          <div className="absolute inset-0 bg-black/25" />

          <header className="absolute z-30 top-0 left-0 right-0 flex items-center justify-between px-4 sm:px-8 md:px-12 py-5 md:py-7">
            <a href="/" aria-label="Hustlify"><img src={LOGO} alt="Hustlify" className="w-8 h-8 sm:w-9 sm:h-9 object-contain" /></a>
            <nav className="hidden md:flex items-center gap-8 lg:gap-11 absolute left-1/2 -translate-x-1/2">
              {NAV.map((l) => (
                <a key={l.label} href={l.href} className="font-wide text-xs lg:text-[13px] tracking-wide text-white/90 hover:text-white relative py-1 group whitespace-nowrap">
                  {l.label}
                  <span className={`absolute left-0 bottom-0 w-full h-[1.5px] bg-white origin-left transition-transform duration-300 ${l.href === '/new' ? '' : 'scale-x-0 group-hover:scale-x-100'}`} />
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

          <div className="relative z-10 flex flex-col justify-end w-full px-5 pb-12 pt-28 md:contents">
            <h1 className="font-script font-bold text-white whitespace-nowrap leading-[0.8] text-[27vw] sm:text-[24vw] md:text-[19cqw] md:absolute md:z-10 md:left-[1.4cqw] md:top-[13cqw] -ml-1 md:ml-0 drop-shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
              {title}
            </h1>
            <p className="font-wide font-light text-white leading-[1.25] tracking-[-0.04em] text-sm sm:text-lg mt-5 md:mt-0 md:absolute md:z-10 md:left-[8.9cqw] md:top-[29.2cqw] md:text-[1.5cqw]">
              Первыми — те, кто ценит тишину и качество.<br />Новая партия уже в наличии.
            </p>
            <div className="flex gap-3 md:gap-[1.6cqw] mt-6 md:mt-0 md:absolute md:z-10 md:left-[8.9cqw] md:top-[35.3cqw]">
              <a href="#wardrobe" className="btn-site btn-white flex-1 md:flex-none">
                Смотреть
              </a>
              <a href="/builder" className="btn-site btn-glass flex-1 md:flex-none">
                Образы
              </a>
            </div>
          </div>
        </section>

        {/* COLLECTION STORY */}
        <section className="relative px-5 py-14 sm:px-10 md:p-0 md:h-[55cqw] flex flex-col md:block">
          <div className="flex flex-col gap-6 md:contents">
            <img src={novelty.storyImage || STORY_IMG} alt="Fireside — Collection Story"
              className="object-cover w-[68%] max-w-[300px] aspect-[353/642] rounded-[36px] sm:rounded-[44px] md:rounded-[7cqw] md:max-w-none md:w-[22.1cqw] md:absolute md:left-[11.75cqw] md:top-[6.5cqw] self-center md:self-auto" />
            <h2 className="font-script font-bold text-[#020a48] whitespace-nowrap leading-[0.85] text-[13.5vw] sm:text-[12vw] md:text-[12.2cqw] md:absolute md:z-10 md:left-[36.25cqw] md:top-[10.2cqw] pointer-events-none">
              Collection Story
            </h2>
            <p className="font-wide font-light leading-[1.3] tracking-[-0.03em] text-[12px] sm:text-sm text-[#020a48]/60 md:absolute md:left-[36.25cqw] md:top-[22cqw] md:w-[52.5cqw] md:text-[1.2cqw] md:leading-[1.4]">
              {story}
            </p>
            <a href="#wardrobe" className="btn-site btn-navy self-center md:self-auto md:absolute md:left-[36.25cqw] md:top-[38.8cqw]">
              Согреться
            </a>
          </div>
        </section>

        <Wardrobe products={products} onPick={setSel} title="Fireside Edit" subtitle={<>вещи, которые греют<br />и в холода</>} />
      </div>

      <SiteFooter />

      {menu && (
        <div onClick={() => setMenu(false)} className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex justify-end md:hidden">
          <div onClick={(e) => e.stopPropagation()} className="w-[84%] max-w-[340px] bg-[#020a48] text-white h-full p-6 pt-[max(1.5rem,env(safe-area-inset-top))] border-l border-white/10">
            <div className="flex items-center justify-between pb-6 border-b border-white/15">
              <span className="font-script text-4xl">Hustlify.</span>
              <button onClick={() => setMenu(false)} aria-label="Закрыть меню" className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center"><X className="w-4 h-4" /></button>
            </div>
            <nav className="flex flex-col gap-4 mt-8">
              {NAV.map((l) => <a key={l.label} href={l.href} onClick={() => setMenu(false)} className="font-wide text-base font-light py-1.5">{l.label}</a>)}
            </nav>
          </div>
        </div>
      )}

      {sel && (
        <div onClick={() => setSel(null)} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div onClick={(e) => e.stopPropagation()} className="relative bg-black text-white rounded-[24px] sm:rounded-[28px] max-w-[780px] w-full p-5 sm:p-8 border border-white/15 max-h-[92vh] overflow-y-auto">
            <button onClick={() => setSel(null)} aria-label="Закрыть" className="absolute right-3 top-3 z-20 w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center"><X className="w-5 h-5" /></button>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_1.1fr] gap-4 sm:gap-8 items-center pt-2">
              <div className="aspect-[4/3] sm:aspect-[3/4] max-h-[260px] sm:max-h-[400px] rounded-2xl overflow-hidden bg-black flex items-center justify-center border border-white/10">
                {sel.video
                  ? <video key={sel.video} src={sel.video} autoPlay muted loop playsInline preload="auto" className="w-full h-full object-contain" />
                  : <img src={sel.image} alt={sel.title} className="w-full h-full object-contain" />}
              </div>
              <div>
                <span className="text-[10px] sm:text-xs font-wide text-[#8f9bd6] uppercase tracking-wider">{sel.category}</span>
                <h4 className="font-wide font-semibold text-xl sm:text-3xl tracking-tight mt-1">{sel.title}</h4>
                <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed font-light">{sel.desc}</p>
                <div className="font-wide font-medium text-xl sm:text-3xl my-5">{rub(sel.price)}</div>
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <button onClick={() => { add(sel); setSel(null); }} className="btn-site btn-white w-full sm:flex-1 sm:min-w-0">В корзину</button>
                  <a href="/catalog" className="btn-site btn-ghost w-full sm:w-auto sm:min-w-0">Весь каталог</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`fixed left-1/2 bottom-[max(1.5rem,env(safe-area-inset-bottom))] -translate-x-1/2 z-[60] bg-[#020a48] text-white font-wide text-xs sm:text-sm px-6 py-3.5 rounded-full shadow-2xl transition-all duration-300 pointer-events-none flex items-center gap-2 border border-white/20 ${toast ? 'opacity-100' : 'opacity-0 translate-y-8'}`}>
        <Check className="w-4 h-4 text-emerald-400 shrink-0" /><span>{toast}</span>
      </div>
    </div>
  );
}
