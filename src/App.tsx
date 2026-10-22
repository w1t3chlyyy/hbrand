import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  ShoppingBag, 
  User, 
  X, 
  Check, 
  Send, 
  CheckCircle2 
} from 'lucide-react';

// Generated high-fidelity asset for Fireside Card
import firesideYachtImg from '@/src/assets/images/fireside_yacht_sunset_1792682674897.jpg';

// User uploaded assets in public/assets/aistudio
const HERO_IMG = '/assets/aistudio/hero_d49a1931.png';
const LOGO_IMG = '/assets/aistudio/logo_48344320.png';
const GLASS_IMG = '/assets/aistudio/glass_88145d06.png';
const HORSE_IMG = '/assets/aistudio/horse_73b646c8.png';

// Video carousel sprite media from user's Reelmark spec
const CAROUSEL_POSTER = 'https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/b7ebb74a-8c8a-4f7e-8f80-55e2d74ecd05.webp';
const CAROUSEL_VIDEO = 'https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/04fd3d5f-99d7-476e-98a4-46c08518ffb3.mp4';

interface CardInfo {
  id: number;
  title: string;
  category: string;
  price: number;
  desc: string;
}

const ITEMS: CardInfo[] = [
  { id: 1, title: 'Aurora Runner Sneaker', category: 'Обувь', price: 18900, desc: 'Премиальная белая кожа Nappa, мягкая оливковая замша и эргономичная подошва.' },
  { id: 2, title: 'Hydra Splash Serum', category: 'Уход', price: 12400, desc: 'Глубокое увлажнение с экстрактом альпийских минералов и скваланом.' },
  { id: 3, title: 'Barista Ceramic Mug', category: 'Lifestyle', price: 4900, desc: 'Авторская керамика ручной работы с золотым ободком для утреннего ритуала.' },
  { id: 4, title: 'Studio Acoustic Sage', category: 'Аудио', price: 26500, desc: 'Мониторные наушники с мягким кожаным оголовьем и активным шумоподавлением.' },
  { id: 5, title: 'Botanical Atelier Ivy', category: 'Декор', price: 8200, desc: 'Коллекционное комнатное растение в скульптурном терракотовом кашпо.' },
  { id: 6, title: 'Monochrome Floral Art', category: 'Декор', price: 9500, desc: 'Авторская композиция из редких сухоцветов и эвкалипта.' },
  { id: 7, title: 'Terracotta Sculptural Vase', category: 'Кермаика', price: 14200, desc: 'Фактурная ваза ручной лепки на гончарном круге, матовая фактура.' },
  { id: 8, title: 'Emerald Revival Essence', category: 'Парфюм', price: 16800, desc: 'Ноты свежей вербены, можжевельника, кедровой смолы и розового перца.' },
  { id: 9, title: 'Porcelain Latte Cup', category: 'Lifestyle', price: 5400, desc: 'Тонкостенный матовый фарфор с природным крапом и теплым оттенком.' },
  { id: 10, title: 'Minimalist Headphone Stand', category: 'Аксессуары', price: 11000, desc: 'Скульптурная подставка из массива светлого дуба и полированной латуни.' }
];

export default function App() {
  const [selectedProduct, setSelectedProduct] = useState<CardInfo | null>(null);
  const [cart, setCart] = useState<CardInfo[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [isLookModalOpen, setIsLookModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Form state
  const [formData, setFormData] = useState({ name: '', phone: '', note: '' });
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Ribbon physics & state
  const ribbonRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragData = useRef({
    scroll: 0,
    vel: 0,
    lastX: 0,
    moved: 0,
    lastTime: performance.now()
  });

  const showToast = (msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const addToCart = (product: CardInfo) => {
    setCart((prev) => [...prev, product]);
    showToast(`«${product.title}» добавлен в корзину`);
  };

  // Cylinder Ribbon Animation Loop based on user's exact specification
  useEffect(() => {
    const R = ribbonRef.current;
    if (!R) return;

    const cards = Array.from(R.querySelectorAll<HTMLDivElement>('.ribbon-card-item'));
    const N = 10;
    const PITCH = 196;
    const LOOP = PITCH * N;

    function roundPath(p: number[][], r: number) {
      let d = '';
      const n = p.length;
      for (let i = 0; i < n; i++) {
        const a = p[(i + n - 1) % n];
        const b = p[i];
        const c = p[(i + 1) % n];
        const u = (q: number[], s: number[]) => {
          const dx = q[0] - s[0];
          const dy = q[1] - s[1];
          const l = Math.hypot(dx, dy) || 1;
          return [s[0] + (dx / l) * r, s[1] + (dy / l) * r];
        };
        const s = u(a, b);
        const e = u(c, b);
        d += (i ? 'L' : 'M') + s[0].toFixed(1) + ' ' + s[1].toFixed(1) + 'Q' + b[0].toFixed(1) + ' ' + b[1].toFixed(1) + ' ' + e[0].toFixed(1) + ' ' + e[1].toFixed(1);
      }
      return d + 'Z';
    }

    let animId: number;
    function renderFrame(now: number) {
      const state = dragData.current;
      const dt = Math.min(0.05, (now - state.lastTime) / 1000);
      state.lastTime = now;

      const W = R!.clientWidth || 1000;
      const H = R!.clientHeight || 360;
      const u = W / 1440;
      const cy = H / 2;

      // Friction & Auto-scroll (~50u per second right -> left)
      if (!isDragging) {
        state.scroll += state.vel * dt;
        state.vel *= Math.pow(0.05, dt); // ~95% per second velocity decay
        if (Math.abs(state.vel) < 1) state.vel = 0;
        state.scroll -= 50 * u * dt; // Continuous right -> left auto-drift
      }

      cards.forEach((c, i) => {
        let t = ((i * PITCH + state.scroll) % LOOP + LOOP) % LOOP;
        if (t >= LOOP / 2) t -= LOOP;

        // Pushed outward geometry: x = 720 + t * (1 + 0.083 * (t/706)^2)
        const x = t * (1 + 0.083 * Math.pow(t / 706, 2));
        const d = Math.min(1.3, Math.abs(x) / 706);
        const w = 170 + 48 * d * d;
        const hf = (xx: number) => 280 + 92 * Math.pow(Math.min(1.4, Math.abs(xx) / 706), 2.6);
        const xl = x - w / 2;
        const xr = x + w / 2;
        const hl = hf(xl);
        const hr = hf(xr);
        const oy = -12 * d * d;
        const hm = Math.max(hl, hr);
        const px = W / 2 + xl * u;
        const cw = w * u;

        c.style.left = px + 'px';
        c.style.width = cw + 'px';
        c.style.height = hm * u + 'px';
        c.style.top = cy - (hm * u) / 2 + oy * u + 'px';

        const a = ((hm - hl) / 2) * u;
        const b = ((hm - hr) / 2) * u;
        c.style.clipPath = 'path("' + roundPath([[0, a], [cw, b], [cw, hm * u - b], [0, hm * u - a]], 15 * u) + '")';
      });

      animId = requestAnimationFrame(renderFrame);
    }

    animId = requestAnimationFrame(renderFrame);
    return () => cancelAnimationFrame(animId);
  }, [isDragging]);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    const d = dragData.current;
    d.moved = 0;
    d.lastX = e.clientX;
    d.vel = 0;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const d = dragData.current;
    const dx = e.clientX - d.lastX;
    d.lastX = e.clientX;
    d.moved += Math.abs(dx);
    const R = ribbonRef.current;
    const k = 1440 / (R?.clientWidth || 1000);
    d.scroll += dx * k;
    d.vel = dx * k * 60 * 0.6 + d.vel * 0.4;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    const d = dragData.current;
    if (d.moved < 6) {
      const el = (document.elementFromPoint(e.clientX, e.clientY) as HTMLElement)?.closest('.ribbon-card-item') as HTMLElement;
      if (el && el.dataset.index) {
        const idx = parseInt(el.dataset.index, 10);
        if (ITEMS[idx]) {
          setSelectedProduct(ITEMS[idx]);
        }
      }
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;
    setFormSubmitted(true);
    showToast('Анкета успешно отправлена стилисту!');
    setTimeout(() => {
      setFormData({ name: '', phone: '', note: '' });
      setFormSubmitted(false);
    }, 4000);
  };

  const filteredCatalog = ITEMS.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white text-[#020a48] font-text relative selection:bg-[#1c3a9e] selection:text-white">

      {/* TOP HEADER & HERO SECTION & BLOCK 2 */}
      {/* 100% unified deep navy background #020a48 with zero color difference */}
      <section className="relative bg-[#020a48] text-white rounded-b-[44px] sm:rounded-b-[68px] md:rounded-b-[96px] overflow-hidden shadow-2xl">
        
        {/* Navigation Bar */}
        <header className="absolute z-30 top-0 left-0 right-0 flex items-center justify-between px-4 sm:px-8 md:px-12 py-5 md:py-7">
          <a href="#" className="flex items-center gap-3 group">
            <img 
              src={LOGO_IMG} 
              alt="Hustlify Logo" 
              className="w-8 h-8 sm:w-9 sm:h-9 object-contain drop-shadow transition-transform duration-300 group-hover:scale-105"
            />
          </a>

          <nav className="hidden md:flex items-center gap-7 lg:gap-11 absolute left-1/2 -translate-x-1/2">
            {[
              { label: 'Новинки', href: '#news' },
              { label: 'Каталог', href: '#catalog' },
              { label: 'О бренде', href: '#about' },
              { label: 'Контакты', href: '#contacts' }
            ].map((link) => (
              <a 
                key={link.label}
                href={link.href}
                className="font-wide text-xs lg:text-[13px] tracking-wide text-white/90 hover:text-white relative py-1 transition-colors duration-200 group whitespace-nowrap"
              >
                {link.label}
                <span className="absolute left-0 bottom-0 w-full h-[1.5px] bg-white scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <button 
              onClick={() => setIsSearchOpen(true)}
              aria-label="Поиск по каталогу"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-white/40 hover:border-white hover:bg-white/10 flex items-center justify-center text-white transition-all duration-200 active:scale-95"
            >
              <Search className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setIsCartOpen(true)}
              aria-label="Корзина покупок"
              className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-white/40 hover:border-white hover:bg-white/10 flex items-center justify-center text-white transition-all duration-200 active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-white text-[#020a48] text-[10px] font-wide font-bold w-4 h-4 rounded-full flex items-center justify-center shadow">
                  {cart.length}
                </span>
              )}
            </button>
            <button 
              onClick={() => {
                const el = document.getElementById('contacts');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              aria-label="Личный кабинет / Консультация"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-white/40 hover:border-white hover:bg-white/10 flex items-center justify-center text-white transition-all duration-200 active:scale-95"
            >
              <User className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* HERO BLOCK WITH HUSTLIFY WORDMARK LIFTED EVEN HIGHER OVER ARTWORK */}
        <div className="relative w-full aspect-[16/10] sm:aspect-[16/9.2] md:aspect-[16/8.8] max-h-[820px] min-h-[440px] overflow-hidden flex flex-col justify-end">
          {/* Painting artwork */}
          <img 
            src={HERO_IMG} 
            alt="Hustlify Monte Carlo Night" 
            className="absolute inset-0 w-full h-full object-cover object-top animate-slow-zoom"
          />

          {/* Smooth multi-stage gradient directly into #020a48 (completely seamless) */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(180deg, rgba(2,10,72,0) 0%, rgba(2,10,72,0.02) 28%, rgba(2,10,72,0.18) 46%, rgba(2,10,72,0.52) 64%, rgba(2,10,72,0.85) 80%, #020a48 100%)'
            }}
          />

          {/* HUSTLIFY WORDMARK LIFTED HIGHER: right across the lower middle of the art scene */}
          <div className="relative z-10 text-center px-4 -translate-y-28 sm:-translate-y-40 md:-translate-y-52 lg:-translate-y-64">
            <h1 
              className="font-script text-[18vw] sm:text-[16vw] md:text-[15vw] lg:text-[180px] leading-[0.8] text-white tracking-normal select-none pointer-events-none drop-shadow-[0_12px_36px_rgba(0,0,0,0.7)]"
              style={{
                fontFamily: "'The Nautigal', cursive",
                textShadow: '0 8px 30px rgba(2,10,72,0.9), 0 2px 10px rgba(255,255,255,0.2)'
              }}
            >
              Hustlify.
            </h1>
          </div>
        </div>

        {/* BLOCK 2: EXACT 1-TO-1 MATCH OF image_6e0a6074.png */}
        <div id="news" className="relative z-10 max-w-[840px] lg:max-w-[880px] mx-auto px-4 sm:px-6 pt-0 pb-20 md:pb-28">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-7 items-end justify-center">
            
            {/* LEFT COLUMN: # + Новинки Pill + 4-line Right-Aligned Paragraph */}
            <div className="flex flex-col items-center sm:items-end text-center sm:text-right w-full">
              
              {/* Stylized Hashtag Graphic */}
              <div className="w-[280px] sm:w-[320px] md:w-[350px] mb-3 sm:mb-4 transition-transform duration-500 hover:rotate-[-2deg]">
                <svg viewBox="0 0 248 155" fill="none" className="w-full h-auto text-white drop-shadow-md">
                  <rect x="74" y="0" width="22" height="155" fill="currentColor" />
                  <rect x="154" y="0" width="22" height="155" fill="currentColor" />
                  <path d="M0 32 L248 44 L248 64 L0 52 Z" fill="currentColor" />
                  <path d="M0 96 L248 108 L248 128 L0 116 Z" fill="currentColor" />
                </svg>
              </div>

              {/* "Новинки" White Pill Capsule - Top aligns with "СВЕЖЕЕ" */}
              <a 
                href="#catalog"
                className="w-[280px] sm:w-[320px] md:w-[350px] text-center bg-white text-[#020a48] font-wide font-medium text-2xl sm:text-[28px] md:text-[32px] tracking-tight py-3 sm:py-3.5 px-6 rounded-full shadow-lg hover:bg-[#e4ebff] hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 active:scale-[0.98] inline-block"
              >
                Новинки
              </a>

              {/* 4-Line Paragraph Right-Aligned, bottom baseline aligns with "БЫВАЕТ" */}
              <div className="mt-4 sm:mt-5 w-[280px] sm:w-[320px] md:w-[350px] text-center sm:text-right font-wide font-light text-[12px] sm:text-[13.5px] md:text-[15px] leading-[1.3] text-white tracking-[-0.035em]">
                Первыми — те, кто ценит<br />
                тишину и качество.<br />
                Новая партия уже<br />
                в наличии.
              </div>
            </div>

            {/* RIGHT COLUMN: Fireside Card & "СВЕЖЕЕ / НЕ / БЫВАЕТ" */}
            <div className="flex flex-col items-center sm:items-start text-left w-full">
              
              {/* Fireside Collection Card */}
              <div 
                onClick={() => setIsCatalogModalOpen(true)}
                className="group cursor-pointer relative w-[280px] sm:w-[320px] md:w-[350px] aspect-[260/152] rounded-[20px] sm:rounded-[26px] overflow-hidden shadow-2xl transition-transform duration-500 hover:scale-[1.02] border border-white/10"
              >
                <img 
                  src={firesideYachtImg} 
                  alt="Fireside Collection Mediterranean Yacht" 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/25" />
                
                <div className="relative z-10 h-full flex flex-col items-center justify-center text-center p-4">
                  <span 
                    className="font-script text-4xl sm:text-5xl md:text-6xl text-white font-normal drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]"
                    style={{ fontFamily: "'The Nautigal', cursive" }}
                  >
                    Fireside
                  </span>
                  <span className="font-wide text-[9px] sm:text-[10px] tracking-[0.2em] uppercase text-white/90 font-medium -mt-1 drop-shadow">
                    COLLECTION
                  </span>
                </div>
              </div>

              {/* Exact 3-line Headline matching mockup: width identical to Fireside card */}
              <div className="mt-2.5 sm:mt-3 w-[280px] sm:w-[320px] md:w-[350px] font-wide font-bold sm:font-extrabold uppercase text-white tracking-[-0.04em] leading-[0.88] text-[38px] sm:text-[45px] md:text-[50px] select-none text-left">
                <div>СВЕЖЕЕ</div>
                <div>НЕ</div>
                <div>БЫВАЕТ</div>
              </div>

            </div>

          </div>
        </div>

      </section>


      {/* BLOCK 3: THE WARDROBE (REELMARK CURVED VIDEO CAROUSEL) */}
      <section id="catalog" className="pt-10 sm:pt-14 md:pt-16 pb-8 sm:pb-12 overflow-hidden text-center bg-white">
        
        {/* Section Header */}
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="relative inline-block">
            <h2 
              className="font-script text-7xl sm:text-9xl md:text-[140px] lg:text-[160px] leading-[0.85] text-[#020a48] font-normal"
              style={{ fontFamily: "'The Nautigal', cursive" }}
            >
              The Wardrobe
            </h2>
            {/* 2-line Subtitle under drobe, adjusted slightly lower so it does not overlap the title */}
            <div className="absolute right-1 sm:right-2 md:right-3 -bottom-3 sm:-bottom-4 md:-bottom-5 text-right font-wide font-light text-[11px] sm:text-sm md:text-base leading-[1.18] text-[#020a48] tracking-tight">
              остальное — вопрос<br />вкуса
            </div>
          </div>
        </div>

        {/* 3D Curved Cylinder Video Carousel with Star underneath */}
        <div 
          ref={ribbonRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className={`ribbon-wrap mt-5 sm:mt-7 md:mt-8 overflow-hidden select-none touch-pan-y ${
            isDragging ? 'dragging' : ''
          }`}
        >
          {/* STAR ICON UNDER THE RIBBON CAROUSEL */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none select-none">
            <svg 
              viewBox="0 0 48 48" 
              fill="none" 
              className="w-10 h-10 sm:w-14 sm:h-14 text-[#020a48] opacity-75 drop-shadow-sm"
            >
              <path 
                d="M24 0 L26.8 17.2 L44 20 L26.8 22.8 L24 40 L21.2 22.8 L4 20 L21.2 17.2 Z" 
                fill="currentColor" 
              />
              <path 
                d="M24 6 L25.5 18.5 L38 20 L25.5 21.5 L24 34 L22.5 21.5 L10 20 L22.5 18.5 Z" 
                fill="currentColor" 
                opacity="0.5" 
              />
            </svg>
          </div>

          {/* 10 VIDEO CARDS WITH 5x2 SPRITE GRID TILES */}
          {ITEMS.map((item, idx) => {
            const col = idx % 5;
            const row = Math.floor(idx / 5);

            return (
              <div
                key={item.id}
                data-index={idx}
                className="ribbon-card-item z-10 overflow-hidden shadow-none active:scale-[0.98] group bg-slate-900"
              >
                <div 
                  className="absolute pointer-events-none"
                  style={{
                    width: '500%',
                    height: '200%',
                    left: `${-col * 100}%`,
                    top: `${-row * 100}%`
                  }}
                >
                  <video 
                    src={CAROUSEL_VIDEO}
                    poster={CAROUSEL_POSTER}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Small frosted round play icon at each card's bottom-left */}
                <div className="absolute left-3 bottom-3 w-5 h-5 rounded-full bg-white/45 backdrop-blur-md flex items-center justify-center text-white pointer-events-none shadow-sm">
                  <div className="w-0 h-0 border-y-[3px] border-y-transparent border-l-[5px] border-l-white ml-0.5" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons below ribbon: Lifted higher to fit the block on screen */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-4 sm:mt-6 md:mt-7 px-4">
          <button 
            onClick={() => setIsCatalogModalOpen(true)}
            className="font-wide font-normal text-sm sm:text-base md:text-lg px-7 sm:px-9 py-2.5 sm:py-3 rounded-full border-2 border-[#020a48] text-[#020a48] hover:bg-[#020a48] hover:text-white transition-all duration-300 active:scale-95 shadow-sm"
          >
            Весь каталог
          </button>
          <button 
            onClick={() => setIsLookModalOpen(true)}
            className="font-wide font-normal text-sm sm:text-base md:text-lg px-7 sm:px-9 py-2.5 sm:py-3 rounded-full bg-[#020a48] text-white border-2 border-[#020a48] hover:bg-white hover:text-[#020a48] transition-all duration-300 active:scale-95 shadow-md"
          >
            Собрать образ
          </button>
        </div>

      </section>


      {/* BLOCK 4: ABOUT US ("Записаться к стилисту" REMOVED) */}
      <section id="about" className="max-w-[1040px] mx-auto px-5 sm:px-8 py-16 sm:py-24">
        <div className="grid grid-cols-1 md:grid-cols-[0.9fr_1.1fr] gap-10 sm:gap-14 lg:gap-16 items-center">
          
          {/* Blue cocktail glass illustration */}
          <div className="flex justify-center">
            <div className="relative max-w-[280px] sm:max-w-[340px] w-full">
              <img 
                src={GLASS_IMG} 
                alt="Hustlify Martini Signature" 
                className="w-full h-auto object-contain animate-float drop-shadow-xl"
              />
            </div>
          </div>

          {/* Brand Philosophy */}
          <div className="flex flex-col text-[#1c3a9e]">
            <h2 
              className="font-script text-7xl sm:text-8xl md:text-9xl text-[#1c3a9e] leading-[0.85] font-normal"
              style={{ fontFamily: "'The Nautigal', cursive" }}
            >
              Hustlify.
            </h2>
            <h3 className="font-wide font-semibold text-2xl sm:text-3xl md:text-4xl text-[#020a48] tracking-tight mt-1 mb-6 uppercase">
              ABOUT US
            </h3>

            <div className="space-y-4 text-sm sm:text-base leading-relaxed text-[#1c3a9e]/90 font-light">
              <p>
                Hustlify — это одежда для тех, кто знает, что такое качество, и не нуждается в доказательствах.
              </p>
              <p>
                Мы создаём вещи вне времени: сдержанные силуэты, благородные ткани, точный крой. Каждая модель — не про тренды, а про то, чтобы остаться в гардеробе надолго.
              </p>
              <p>
                Бренд создан в [2026], олицетворяет стиль NewMoney. Мы подбираем под каждого покупателя его личный стиль.
              </p>
              <p className="pt-2 font-medium text-[#020a48]">
                Мы не гонимся за шумом. Мы делаем вещи, которые говорят за нас — тихо и по делу.
              </p>
            </div>
          </div>

        </div>
      </section>


      {/* BLOCK 5: CONTACTS */}
      {/* Background text "СЛОВИМ КОННЕКТ" in 2 lines, static enlarged horse shifted to left edge and raised higher */}
      <section id="contacts" className="relative bg-[#020a48] text-white rounded-t-[44px] sm:rounded-t-[68px] md:rounded-t-[96px] pt-14 sm:pt-20 pb-10 overflow-hidden shadow-2xl">
        
        {/* GIANT BACKGROUND TEXT IN 2 LINES: СЛОВИМ / КОННЕКТ */}
        <div 
          aria-hidden="true"
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none z-0 overflow-hidden opacity-90"
        >
          <div className="w-full text-center">
            <span 
              className="block font-wide font-black uppercase tracking-[-0.05em] text-[#071556] leading-[0.82]"
              style={{
                fontSize: 'clamp(5rem, 18vw, 190px)',
                letterSpacing: '-0.05em'
              }}
            >
              СЛОВИМ
            </span>
            <span 
              className="block font-wide font-black uppercase tracking-[-0.05em] text-[#071556] leading-[0.82]"
              style={{
                fontSize: 'clamp(5rem, 18vw, 190px)',
                letterSpacing: '-0.05em'
              }}
            >
              КОННЕКТ
            </span>
          </div>
        </div>

        {/* Foreground White Consultation Card */}
        <div className="relative z-10 max-w-[940px] mx-auto px-4 sm:px-6">
          <div className="bg-white text-[#020a48] rounded-[28px] sm:rounded-[38px] shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-[1.1fr_auto_1.1fr] min-h-[460px] border border-white/20">
            
            {/* Left Column: Horse Portrait RAISED HIGHER AND SHIFTED ALL THE WAY TO THE LEFT EDGE */}
            <div className="flex items-end justify-start overflow-hidden bg-gradient-to-b from-[#f8faff] to-white relative p-0">
              <img 
                src={HORSE_IMG} 
                alt="Hustlify Equestrian Symbol" 
                className="w-full max-w-[360px] sm:max-w-[420px] md:max-w-[460px] h-auto object-contain object-bottom select-none pointer-events-none -translate-x-2 sm:-translate-x-4 -translate-y-4 sm:-translate-y-6"
                style={{
                  animation: 'none',
                  transformOrigin: 'bottom left'
                }}
              />
            </div>

            {/* Middle: Signature Navy Divider Line with Top & Bottom End-Dots */}
            <div className="hidden md:flex flex-col items-center justify-center my-8 px-2">
              <div className="relative w-[2px] h-full bg-[#020a48]">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#020a48]" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-4 h-4 rounded-full bg-[#020a48]" />
              </div>
            </div>

            {/* Right Column: Consultation Form (Aligned edge to edge with right side) */}
            <div className="p-6 sm:p-9 md:p-10 flex flex-col justify-center">
              <h3 className="font-wide font-semibold text-2xl sm:text-3xl text-[#020a48] tracking-tight uppercase leading-tight">
                Давайте знакомиться
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-[#1c3a9e] font-light leading-relaxed mb-6">
                Заполните анкету — стилист свяжется с вами и подберёт образ под ваш вкус, повод и бюджет.
              </p>

              {formSubmitted ? (
                <div className="bg-[#eef3ff] border border-[#1c3a9e]/30 rounded-2xl p-6 text-center animate-fadeIn">
                  <CheckCircle2 className="w-10 h-10 text-[#1c3a9e] mx-auto mb-2" />
                  <h4 className="font-wide font-semibold text-base text-[#020a48]">Анкета получена!</h4>
                  <p className="text-xs text-[#1c3a9e] mt-1">Персональный стилист свяжется с вами в течение 15 минут.</p>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="flex flex-col gap-3 w-full">
                  <input 
                    type="text"
                    required
                    placeholder="Ваше имя"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full text-sm font-text text-[#020a48] placeholder-[#020a48]/50 px-5 py-3 rounded-full border-[1.5px] border-[#020a48] outline-none bg-transparent focus:ring-2 focus:ring-[#1c3a9e]/30 transition-all"
                  />
                  <input 
                    type="tel"
                    required
                    placeholder="Телефон"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full text-sm font-text text-[#020a48] placeholder-[#020a48]/50 px-5 py-3 rounded-full border-[1.5px] border-[#020a48] outline-none bg-transparent focus:ring-2 focus:ring-[#1c3a9e]/30 transition-all"
                  />
                  <textarea 
                    rows={2}
                    placeholder="Что ищете? Повод, размер, любимые цвета"
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    className="w-full text-sm font-text text-[#020a48] placeholder-[#020a48]/50 px-5 py-3 rounded-[22px] border-[1.5px] border-[#020a48] outline-none bg-transparent focus:ring-2 focus:ring-[#1c3a9e]/30 transition-all resize-none"
                  />
                  
                  <button 
                    type="submit"
                    className="w-full bg-[#020a48] text-white font-wide font-normal text-sm sm:text-[15px] py-3.5 rounded-full hover:bg-[#1c3a9e] transition-all duration-300 shadow-md active:scale-[0.99] mt-1 flex items-center justify-center gap-2"
                  >
                    <span>Отправить анкету</span>
                    <Send className="w-4 h-4" />
                  </button>

                  <div className="grid grid-cols-2 gap-2.5 mt-2 w-full">
                    <a 
                      href="tel:+79990002026"
                      className="text-center font-wide text-[11px] sm:text-xs text-[#020a48] py-2.5 px-2 rounded-full border-[1.5px] border-[#020a48] hover:bg-[#020a48] hover:text-white transition-all duration-200"
                    >
                      Позвонить
                    </a>
                    <a 
                      href="https://t.me/hustlify" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-center font-wide text-[11px] sm:text-xs text-[#020a48] py-2.5 px-2 rounded-full border-[1.5px] border-[#020a48] bg-white hover:bg-[#020a48] hover:text-white transition-all duration-200"
                    >
                      В Telegram
                    </a>
                  </div>
                </form>
              )}
            </div>

          </div>
        </div>

        {/* Footer */}
        <footer className="relative z-10 text-center text-xs font-text text-[#8f9bd6] pt-12 sm:pt-16 pb-2">
          © 2026 Hustlify. Тихо и по делу. Все права защищены.
        </footer>

      </section>


      {/* PRODUCT DETAIL POPUP MODAL */}
      {selectedProduct && (
        <div 
          onClick={() => setSelectedProduct(null)}
          className="fixed inset-0 z-50 bg-[#020a48]/75 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white text-[#020a48] rounded-[28px] max-w-[680px] w-full p-6 sm:p-8 shadow-2xl border border-white/20"
          >
            <button 
              onClick={() => setSelectedProduct(null)}
              aria-label="Закрыть"
              className="absolute right-4 top-4 z-20 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-[#020a48] flex items-center justify-center transition-transform hover:rotate-90"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-xs font-wide text-[#1c3a9e] uppercase tracking-wider mb-1 block">
              {selectedProduct.category}
            </span>
            <h4 className="font-wide font-semibold text-2xl sm:text-3xl tracking-tight text-[#020a48]">
              {selectedProduct.title}
            </h4>
            <p className="mt-3 text-sm text-[#1c3a9e] leading-relaxed font-light">
              {selectedProduct.desc}
            </p>
            <div className="font-wide font-medium text-2xl sm:text-3xl text-[#020a48] mt-5 mb-6">
              {selectedProduct.price.toLocaleString('ru-RU')} ₽
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => {
                  addToCart(selectedProduct);
                  setSelectedProduct(null);
                }}
                className="flex-1 bg-[#020a48] text-white font-wide font-normal text-sm py-3.5 rounded-full hover:bg-[#1c3a9e] transition-colors shadow-md active:scale-95"
              >
                В корзину
              </button>
              <button 
                onClick={() => {
                  setSelectedProduct(null);
                  setIsLookModalOpen(true);
                }}
                className="px-5 py-3.5 rounded-full border border-[#020a48] text-[#020a48] font-wide text-xs hover:bg-slate-50 transition-colors"
              >
                Собрать образ
              </button>
            </div>
          </div>
        </div>
      )}


      {/* FULL CATALOG MODAL */}
      {isCatalogModalOpen && (
        <div 
          onClick={() => setIsCatalogModalOpen(false)}
          className="fixed inset-0 z-50 bg-[#020a48]/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white text-[#020a48] rounded-[32px] max-w-[1000px] w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl"
          >
            <div className="px-6 sm:px-8 py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-wide text-[#1c3a9e] uppercase tracking-wider">Hustlify 2026</span>
                <h3 className="font-wide font-bold text-2xl sm:text-3xl tracking-tight text-[#020a48]">
                  Коллекция Wardrobe
                </h3>
              </div>
              <button 
                onClick={() => setIsCatalogModalOpen(false)}
                className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 sm:p-8 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {ITEMS.map((item) => (
                <div 
                  key={item.id} 
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div>
                    <span className="text-[10px] font-wide uppercase text-[#1c3a9e] tracking-wider">
                      {item.category}
                    </span>
                    <h4 className="font-wide font-semibold text-base text-[#020a48] mt-1">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {item.desc}
                    </p>
                  </div>
                  <div className="mt-5 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                    <span className="font-wide font-bold text-sm text-[#020a48]">
                      {item.price.toLocaleString('ru-RU')} ₽
                    </span>
                    <button 
                      onClick={() => addToCart(item)}
                      className="bg-[#020a48] text-white text-xs font-wide px-3.5 py-1.5 rounded-full hover:bg-[#1c3a9e] transition-colors"
                    >
                      В корзину
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}


      {/* LOOKBOOK BUILDER MODAL */}
      {isLookModalOpen && (
        <div 
          onClick={() => setIsLookModalOpen(false)}
          className="fixed inset-0 z-50 bg-[#020a48]/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white text-[#020a48] rounded-[32px] max-w-[820px] w-full p-6 sm:p-10 overflow-hidden shadow-2xl"
          >
            <button 
              onClick={() => setIsLookModalOpen(false)}
              className="absolute right-6 top-6 w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="max-w-md">
              <span className="text-xs font-wide text-[#1c3a9e] uppercase tracking-wider font-semibold">
                NewMoney Styling Service
              </span>
              <h3 className="font-wide font-bold text-2xl sm:text-3xl text-[#020a48] mt-1 mb-3">
                Собрать образ со стилистом
              </h3>
              <p className="text-sm text-[#1c3a9e] font-light leading-relaxed">
                Персональный подбор капсулы под мероприятие, деловой гардероб или повседневную жизнь с учетом вашей конституции и предпочтений.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-8">
              <div className="p-4 rounded-2xl border-2 border-[#020a48] bg-slate-50 cursor-pointer">
                <span className="text-xs font-wide font-bold text-[#020a48]">Капсула «Evening»</span>
                <p className="text-xs text-slate-500 mt-1">Шелк, кашемир и акцентная обувь для вечерних выходов.</p>
              </div>
              <div className="p-4 rounded-2xl border border-slate-200 hover:border-[#020a48] cursor-pointer transition-colors">
                <span className="text-xs font-wide font-bold text-[#020a48]">Капсула «Urban Leisure»</span>
                <p className="text-xs text-slate-500 mt-1">Оверсайз крой, комфортные фактуры и авторские аксессуары.</p>
              </div>
              <div className="p-4 rounded-2xl border border-slate-200 hover:border-[#020a48] cursor-pointer transition-colors">
                <span className="text-xs font-wide font-bold text-[#020a48]">Капсула «Quiet Luxury»</span>
                <p className="text-xs text-slate-500 mt-1">Идеальная базовая палитра без кричащих логотипов.</p>
              </div>
            </div>

            <button 
              onClick={() => {
                setIsLookModalOpen(false);
                const el = document.getElementById('contacts');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full bg-[#020a48] text-white font-wide font-normal text-sm py-4 rounded-full hover:bg-[#1c3a9e] transition-colors"
            >
              Перейти к анкете стилиста
            </button>
          </div>
        </div>
      )}


      {/* SEARCH OVERLAY */}
      {isSearchOpen && (
        <div 
          onClick={() => setIsSearchOpen(false)}
          className="fixed inset-0 z-50 bg-[#020a48]/85 backdrop-blur-md flex flex-col items-center pt-24 px-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[640px] bg-white rounded-3xl p-6 shadow-2xl"
          >
            <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
              <Search className="w-5 h-5 text-slate-400" />
              <input 
                type="text"
                autoFocus
                placeholder="Поиск по гардеробу (рубашка, кроссовки, парфюм...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full font-text text-base text-[#020a48] outline-none placeholder:text-slate-400"
              />
              <button onClick={() => setIsSearchOpen(false)}>
                <X className="w-5 h-5 text-slate-400 hover:text-slate-700" />
              </button>
            </div>

            <div className="mt-4 max-h-[340px] overflow-y-auto space-y-2">
              {filteredCatalog.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">Ничего не найдено</div>
              ) : (
                filteredCatalog.map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => {
                      setSelectedProduct(item);
                      setIsSearchOpen(false);
                    }}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <div>
                      <h5 className="font-wide text-xs font-semibold text-[#020a48]">{item.title}</h5>
                      <span className="text-[11px] text-slate-400">{item.category}</span>
                    </div>
                    <span className="font-wide text-xs font-bold text-[#020a48]">
                      {item.price.toLocaleString('ru-RU')} ₽
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}


      {/* CART DRAWER */}
      {isCartOpen && (
        <div 
          onClick={() => setIsCartOpen(false)}
          className="fixed inset-0 z-50 bg-[#020a48]/70 backdrop-blur-sm flex justify-end"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[420px] bg-white h-full shadow-2xl flex flex-col p-6 sm:p-8"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-wide font-bold text-xl text-[#020a48]">Корзина ({cart.length})</h3>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-400">
                  <ShoppingBag className="w-12 h-12 stroke-[1.2] mb-3 text-slate-300" />
                  <p className="font-wide text-sm">Ваша корзина пуста</p>
                  <p className="text-xs text-slate-400 mt-1">Выберите понравившиеся позиции из The Wardrobe</p>
                </div>
              ) : (
                cart.map((item, idx) => (
                  <div key={idx} className="flex gap-3 items-center p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-wide text-xs font-semibold text-[#020a48] truncate">{item.title}</h4>
                      <span className="text-[11px] text-[#1c3a9e]">{item.price.toLocaleString('ru-RU')} ₽</span>
                    </div>
                    <button 
                      onClick={() => setCart((prev) => prev.filter((_, i) => i !== idx))}
                      className="text-slate-400 hover:text-red-500 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex justify-between items-center font-wide">
                  <span className="text-xs text-slate-500">Итого:</span>
                  <span className="text-lg font-bold text-[#020a48]">
                    {cart.reduce((sum, item) => sum + item.price, 0).toLocaleString('ru-RU')} ₽
                  </span>
                </div>
                <button 
                  onClick={() => {
                    setIsCartOpen(false);
                    showToast('Заказ оформлен! Наш консьерж свяжется с вами.');
                    setCart([]);
                  }}
                  className="w-full bg-[#020a48] text-white font-wide font-normal text-sm py-3.5 rounded-full hover:bg-[#1c3a9e] transition-colors"
                >
                  Оформить заказ
                </button>
              </div>
            )}
          </div>
        </div>
      )}


      {/* TOAST NOTIFICATION */}
      <div 
        className={`fixed left-1/2 bottom-8 -translate-x-1/2 z-50 bg-[#020a48] text-white font-wide text-xs sm:text-sm px-6 py-3.5 rounded-full shadow-2xl transition-all duration-300 pointer-events-none flex items-center gap-2 border border-white/20 ${
          toastMessage ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
        }`}
      >
        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>{toastMessage}</span>
      </div>

    </div>
  );
}
