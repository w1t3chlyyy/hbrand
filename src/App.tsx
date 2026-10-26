import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  ShoppingBag, 
  User, 
  X, 
  Check, 
  Send, 
  CheckCircle2,
  Menu,
  ArrowUpRight,
  Phone
} from 'lucide-react';

// Generated high-fidelity asset for Fireside Card
import firesideYachtImg from '@/src/assets/images/fireside_yacht_sunset_1792682674897.jpg';

// User uploaded assets in public/assets/aistudio (attached video ___4_6dfdce75)
const HERO_VIDEO = '/assets/aistudio/___4_6dfdce75.mp4';
const HERO_VIDEO_MOV = '/assets/aistudio/___4_6dfdce75.MOV';
const HERO_POSTER = '/assets/aistudio/hero_video_first_frame.jpg';
const HERO_IMG = '/assets/aistudio/hero_d49a1931.png';
const LOGO_IMG = '/assets/aistudio/logo_48344320.png';
const GLASS_IMG = '/assets/aistudio/glass_88145d06.png';
const YACHT_IMG = '/assets/aistudio/image_3f7bfbac.png';
const SWIMMER_IMG = '/assets/aistudio/26d36bcf-3170-4b63-bcdb-a5ac49b78497_4f19498b.png';

// Contacts block colors (taken from Frame_11 mockup)
const NAVY = '#001a66';   // section background
const ACCENT = '#001f80'; // borders, button, heading

const glassBtn =
  'rounded-full flex items-center justify-center backdrop-blur-xl bg-[rgba(190,190,190,0.55)] shadow-[0_6px_24px_rgba(0,0,0,0.25)] hover:bg-[rgba(210,210,210,0.65)] active:scale-95 transition';

const TelegramIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="white">
    <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" />
  </svg>
);

// 6 Products with User's Uploaded Photos (Upscaled to 4K, background removed) and 3D Rotating Videos
const UPLOADED_VIDEOS = [
  {
    id: 1,
    title: 'T-Shirt «Hustlify Club»',
    category: 'Футболки',
    price: 7900,
    desc: 'Премиальный плотный хлопок (240 г/м²). Авторский графический принт «Welcome to Hustlify Club — Hustle & Paxat» с бокалом мартини.',
    image: '/assets/aistudio/Frame_5_2ec6bdcd_nobg.png',
    video: '/assets/aistudio/1023__1__1__db02b3de.mp4'
  },
  {
    id: 2,
    title: 'T-Shirt «Young CEO»',
    category: 'Футболки',
    price: 8400,
    desc: 'Винтажный оверсайз крой с принтом NewMoney: селективный парфюм, швейцарские часы, шампанское и девиз «Hi — I\'m young CEO».',
    image: '/assets/aistudio/Frame_6_1df026a5_nobg.png',
    video: '/assets/aistudio/1023__1__2__09cbaa64.mp4'
  },
  {
    id: 3,
    title: 'T-Shirt «Fire Side Navy»',
    category: 'Футболки',
    price: 8900,
    desc: 'Глубокий ночной синий цвет Night Navy. Вышитый логотип Hustlify на груди и фирменный знак Fire Side на спине.',
    image: '/assets/aistudio/Frame_7_1dc70487_nobg.png',
    video: '/assets/aistudio/1023__1__3__127b3f12.mp4'
  },
  {
    id: 4,
    title: 'T-Shirt «Hustle в столице»',
    category: 'Футболки',
    price: 8400,
    desc: 'Лимитированный дроп: акцентные алые лодочки на шпильке и бокал мартини. Шелкография высокой стойкости, плотный воротник.',
    image: '/assets/aistudio/Frame_8_f887f17b_nobg.png',
    video: '/assets/aistudio/1023__1__4__841c8614.mp4'
  },
  {
    id: 5,
    title: 'T-Shirt «Classic on Wheels»',
    category: 'Футболки',
    price: 8900,
    desc: 'Культовый силуэт классического 911 и принт «Classic on Wheels 2026». Чистый гребенной хлопок пенье с шелковистым финишем.',
    image: '/assets/aistudio/Frame_9_063eac74_nobg.png',
    video: '/assets/aistudio/1023__1__5__40038b81.mp4'
  },
  {
    id: 6,
    title: 'T-Shirt «Salt & Sand»',
    category: 'Футболки',
    price: 7900,
    desc: 'Летняя капсула «Salt & Sand — Морская трапеза» с детализированным принтом глубоководного краба. Свободная комфортная посадка.',
    image: '/assets/aistudio/Frame_10_4fda5ca6_nobg.png',
    video: '/assets/aistudio/1023__1__6__f4a74880.mp4'
  }
];

// Carousel items repeated twice to form 12 fluid seamless cards on the 3D cylinder
const CAROUSEL_ITEMS = [
  ...UPLOADED_VIDEOS,
  ...UPLOADED_VIDEOS.map((item, idx) => ({ ...item, id: item.id + 6 }))
];

interface CardInfo {
  id: number;
  title: string;
  category: string;
  price: number;
  desc: string;
  image: string;
  video: string;
}

export default function App() {
  const [selectedProduct, setSelectedProduct] = useState<CardInfo | null>(null);
  const [cart, setCart] = useState<CardInfo[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [isLookModalOpen, setIsLookModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  // 3D Curved Cylinder Ribbon Animation Loop (from Reelmark architecture)
  useEffect(() => {
    const R = ribbonRef.current;
    if (!R) return;

    const cards = Array.from(R.querySelectorAll<HTMLDivElement>('.ribbon-card-item'));
    const N = cards.length;
    if (N === 0) return;

    // Reelmark cylinder geometry scaled up for large luxury cards
    const PITCH = 245;
    const LOOP = PITCH * N;

    // Smooth rounded quad path builder with subpixel precision (zero jitter)
    function getCylinderQuadPath(w: number, h: number, a: number, b: number, r: number) {
      const p = [
        [0, a],
        [w, b],
        [w, h - b],
        [0, h - a]
      ];
      const maxR = Math.min(r, w * 0.45, Math.max(4, (h - a - b) * 0.35));
      let d = '';
      for (let i = 0; i < 4; i++) {
        const prev = p[(i + 3) % 4];
        const curr = p[i];
        const next = p[(i + 1) % 4];

        const d1x = prev[0] - curr[0];
        const d1y = prev[1] - curr[1];
        const l1 = Math.hypot(d1x, d1y) || 1;

        const d2x = next[0] - curr[0];
        const d2y = next[1] - curr[1];
        const l2 = Math.hypot(d2x, d2y) || 1;

        const sx = curr[0] + (d1x / l1) * maxR;
        const sy = curr[1] + (d1y / l1) * maxR;
        const ex = curr[0] + (d2x / l2) * maxR;
        const ey = curr[1] + (d2y / l2) * maxR;

        if (i === 0) {
          d += `M ${sx.toFixed(2)} ${sy.toFixed(2)} Q ${curr[0].toFixed(2)} ${curr[1].toFixed(2)} ${ex.toFixed(2)} ${ey.toFixed(2)}`;
        } else {
          d += ` L ${sx.toFixed(2)} ${sy.toFixed(2)} Q ${curr[0].toFixed(2)} ${curr[1].toFixed(2)} ${ex.toFixed(2)} ${ey.toFixed(2)}`;
        }
      }
      return d + ' Z';
    }

    let animId: number;

    function renderFrame(now: number) {
      const state = dragData.current;
      const dt = Math.min(0.05, (now - state.lastTime) / 1000);
      state.lastTime = now;

      const W = R!.clientWidth || 1000;
      const H = R!.clientHeight || 450;
      const u = Math.min(1.2, Math.max(0.68, W / 1440));
      const cy = H / 2;

      // Reelmark motion: drag 1:1, coast decay 95% per second, steady right -> left auto-scroll
      if (!isDragging) {
        state.scroll += state.vel * dt;
        state.vel *= Math.pow(0.05, dt); // ~95% per second decay
        if (Math.abs(state.vel) < 0.8) state.vel = 0;
        state.scroll -= 50 * u * dt; // Continuous right -> left auto-scroll
      }

      cards.forEach((c, i) => {
        let t = ((i * PITCH + state.scroll) % LOOP + LOOP) % LOOP;
        if (t >= LOOP / 2) t -= LOOP;

        // Pushed outward geometry: x = t * (1 + 0.088 * (t / 706)^2)
        const normT = t / 706;
        const x = t * (1 + 0.088 * normT * normT);
        const d = Math.min(1.4, Math.abs(x) / 706);

        // Center card width stays 210u (as now), edges expand up to ~325u (+55%)
        const w = 210 + 115 * Math.pow(d, 1.8);
        const xl = x - w / 2;
        const xr = x + w / 2;

        // Height formula: center stays 340u (as now), edge cards grow up to ~550u (+62%)
        const ql = Math.min(1.5, Math.abs(xl) / 706);
        const qr = Math.min(1.5, Math.abs(xr) / 706);
        const hl = 340 + 220 * Math.pow(ql, 2.2);
        const hr = 340 + 220 * Math.pow(qr, 2.2);
        const hm = Math.max(hl, hr);

        // 3D perspective rotation (Y-axis tilt): cards lean inward towards camera like inside of a cylinder
        const rotY = -Math.max(-28, Math.min(28, (x / 706) * 25));

        // 3D Z-depth translation: edge cards curve forward towards viewer in 3D space
        const z = 130 * Math.pow(Math.min(1.4, d), 1.6) * u;

        // Vertical center offset (panoramic curve)
        const oy = -28 * Math.pow(d, 1.8);

        const cw = w * u;
        const ch = hm * u;
        const a = ((hm - hl) / 2) * u;
        const b = ((hm - hr) / 2) * u;
        const r = 20 * u;

        // Subpixel GPU 3D translate & rotate positioning
        const px = W / 2 + xl * u;
        const py = cy - ch / 2 + oy * u;

        c.style.transform = `translate3d(${px.toFixed(2)}px, ${py.toFixed(2)}px, ${z.toFixed(2)}px) rotateY(${rotY.toFixed(2)}deg)`;
        c.style.width = `${cw.toFixed(2)}px`;
        c.style.height = `${ch.toFixed(2)}px`;
        c.style.clipPath = `path("${getCylinderQuadPath(cw, ch, a, b, r)}")`;
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
    d.vel = dx * k * 35;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    const d = dragData.current;
    if (d.moved < 6) {
      const el = (document.elementFromPoint(e.clientX, e.clientY) as HTMLElement)?.closest('.ribbon-card-item') as HTMLElement;
      if (el && el.dataset.index) {
        const idx = parseInt(el.dataset.index, 10);
        if (CAROUSEL_ITEMS[idx]) {
          setSelectedProduct(CAROUSEL_ITEMS[idx]);
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

  const filteredCatalog = UPLOADED_VIDEOS.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Contact form (desktop uses cqw units from the 1600x900 mockup grid)
  const renderContactForm = (desktop: boolean) =>
    formSubmitted ? (
      <div
        className={`bg-[#eef3ff] text-center flex flex-col items-center justify-center ${
          desktop ? 'h-full rounded-[3.2cqw] border-[0.25cqw]' : 'rounded-[28px] border-2 p-8'
        }`}
        style={{ borderColor: ACCENT }}
      >
        <CheckCircle2 className={desktop ? 'w-[5cqw] h-[5cqw]' : 'w-12 h-12'} style={{ color: ACCENT }} />
        <h4 className={`font-wide font-semibold mt-2 ${desktop ? 'text-[2cqw]' : 'text-lg'}`} style={{ color: ACCENT }}>
          Анкета получена!
        </h4>
        <p className={`mt-1 font-wide font-light ${desktop ? 'text-[1.2cqw]' : 'text-sm'}`} style={{ color: ACCENT }}>
          Персональный стилист свяжется с вами в течение 15 минут.
        </p>
      </div>
    ) : (
      <form
        onSubmit={handleFormSubmit}
        className={desktop ? 'flex flex-col gap-[1.5625cqw] w-full' : 'flex flex-col gap-3 w-full'}
      >
        {[
          { key: 'name', type: 'text', ph: 'Ваше имя', req: true },
          { key: 'phone', type: 'tel', ph: 'Телефон', req: true },
          { key: 'note', type: 'text', ph: 'Что ищете? Повод, размер, цвета', req: false }
        ].map((f) => (
          <input
            key={f.key}
            type={f.type}
            required={f.req}
            placeholder={f.ph}
            value={(formData as any)[f.key]}
            onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })}
            style={{ borderColor: ACCENT, color: ACCENT }}
            className={
              desktop
                ? 'w-full h-[6.25cqw] rounded-full border-solid border-[0.25cqw] bg-white outline-none font-wide font-light text-[1.75cqw]! px-[2.9cqw] placeholder-[#b4b4b4] focus:ring-2 focus:ring-[#001f80]/20'
                : 'w-full rounded-full border-[2.5px] border-solid bg-white outline-none font-wide font-light px-6 py-3.5 placeholder-[#b4b4b4] focus:ring-2 focus:ring-[#001f80]/20'
            }
          />
        ))}
        <button
          type="submit"
          style={{ backgroundColor: ACCENT }}
          className={
            desktop
              ? 'w-full h-[6.25cqw] rounded-full text-white font-wide font-normal text-[1.9cqw] hover:brightness-125 transition cursor-pointer'
              : 'w-full rounded-full text-white font-wide font-normal text-base py-4 active:scale-[0.99] transition'
          }
        >
          Отправить анкету
        </button>
      </form>
    );

  return (
    <div className="min-h-screen bg-white text-[#020a48] font-text relative selection:bg-[#1c3a9e] selection:text-white">

      {/* TOP HEADER & HERO SECTION & BLOCK 2 */}
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
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Открыть меню навигации"
              className="md:hidden w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-white/40 hover:border-white hover:bg-white/10 flex items-center justify-center text-white transition-all duration-200 active:scale-95"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* HERO BLOCK WITH CENTERED WORDMARK & LEFT-ALIGNED SLOGAN */}
        <div className="relative w-full aspect-[16/11] sm:aspect-[16/10] md:aspect-[16/9.2] max-h-[880px] min-h-[500px] sm:min-h-[580px] md:min-h-[660px] overflow-hidden flex flex-col justify-center items-center bg-black">
          {/* Hero background video */}
          <video 
            key={HERO_VIDEO}
            src={HERO_VIDEO}
            autoPlay 
            muted 
            loop 
            playsInline
            preload="auto"
            poster={HERO_POSTER}
            onLoadedMetadata={(e) => {
              e.currentTarget.playbackRate = 1.0;
            }}
            onPlay={(e) => {
              e.currentTarget.playbackRate = 1.0;
            }}
            ref={(el) => {
              if (el) {
                el.muted = true;
                el.defaultMuted = true;
                el.playbackRate = 1.0;
                const tryPlay = () => {
                  const p = el.play();
                  if (p !== undefined) {
                    p.catch(() => {
                      // Attempt fallback on next user touch or interaction
                      const resume = () => {
                        el.playbackRate = 1.0;
                        el.play().catch(() => {});
                        window.removeEventListener('touchstart', resume);
                        window.removeEventListener('click', resume);
                      };
                      window.addEventListener('touchstart', resume, { once: true });
                      window.addEventListener('click', resume, { once: true });
                    });
                  }
                };
                tryPlay();
              }
            }}
            className="absolute inset-0 w-full h-full object-cover object-center opacity-70"
            style={{
              imageRendering: '-webkit-optimize-contrast',
              transform: 'translate3d(0, 0, 0)',
              backfaceVisibility: 'hidden'
            }}
          >
            <source src={HERO_VIDEO} type="video/mp4" />
            <source src={HERO_VIDEO_MOV} type="video/quicktime" />
          </video>

          {/* Smooth multi-stage gradient shifted lower down directly into #020a48 */}
          <div 
            className="absolute inset-0 pointer-events-none z-[2]"
            style={{
              background: 'linear-gradient(180deg, rgba(2,10,72,0) 0%, rgba(2,10,72,0) 48%, rgba(2,10,72,0.15) 66%, rgba(2,10,72,0.55) 82%, rgba(2,10,72,0.88) 93%, #020a48 100%)'
            }}
          />

          {/* CENTERED HERO TEXT GROUP: Hustlify. + Menu-styled slogan below, lifted higher */}
          <div className="relative z-10 flex flex-col items-start px-6 sm:px-10 translate-x-4 sm:translate-x-6 md:translate-x-8 lg:translate-x-10 -translate-y-10 sm:-translate-y-12 md:-translate-y-14 lg:-translate-y-16 select-none pointer-events-none transition-all duration-300">
            <h1 
              className="font-script text-[9.2vw] sm:text-[8vw] md:text-[6.8vw] lg:text-[90px] leading-[0.8] text-white tracking-normal select-none pointer-events-none drop-shadow-[0_12px_36px_rgba(0,0,0,0.7)] transition-all duration-300 -translate-x-2 sm:-translate-x-3 md:-translate-x-4 -translate-y-1.5 sm:-translate-y-2 md:-translate-y-2.5"
              style={{
                fontFamily: "'The Nautigal', cursive",
                textShadow: '0 8px 30px rgba(2,10,72,0.9), 0 2px 10px rgba(255,255,255,0.2)'
              }}
            >
              Hustlify.
            </h1>
            <div 
              className="-mt-2.5 sm:-mt-3 md:-mt-3.5 translate-x-3 sm:translate-x-4 md:translate-x-5 text-left font-wide text-[4.8px] sm:text-[5.5px] md:text-[6.2px] lg:text-[7.2px] tracking-[0.06em] text-white/90 font-normal uppercase leading-[1.0] drop-shadow-[0_4px_16px_rgba(0,0,0,0.85)]"
              style={{
                textShadow: '0 4px 18px rgba(2,10,72,0.95)'
              }}
            >
              МЫ ЗНАЕМ ЧТО ТАКОЕ<br />СТИЛЬ.
            </div>
          </div>
        </div>

        {/* BLOCK 2: EXACT 1-TO-1 MATCH OF image_6e0a6074.png (SHIFTED LOWER DOWN) */}
        <div id="news" className="relative z-10 max-w-[840px] lg:max-w-[880px] mx-auto px-4 sm:px-6 pt-10 sm:pt-16 md:pt-20 pb-20 md:pb-28">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-6 md:gap-7 items-end justify-center">
            
            {/* LEFT COLUMN: # + Новинки Pill + 4-line Right-Aligned Paragraph */}
            <div className="flex flex-col items-center sm:items-end text-center sm:text-right w-full">
              
              {/* Stylized Hashtag Graphic */}
              <div className="w-full max-w-[280px] sm:max-w-[320px] md:max-w-[350px] mb-3 sm:mb-4 transition-transform duration-500 hover:rotate-[-2deg]">
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
                className="w-full max-w-[280px] sm:max-w-[320px] md:max-w-[350px] text-center bg-white text-[#020a48] font-wide font-medium text-2xl sm:text-[28px] md:text-[32px] tracking-tight py-3 sm:py-3.5 px-6 rounded-full shadow-lg hover:bg-[#e4ebff] hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 active:scale-[0.98] inline-block"
              >
                Новинки
              </a>

              {/* 4-Line Paragraph Right-Aligned, bottom baseline aligns with "БЫВАЕТ" */}
              <div className="mt-4 sm:mt-5 w-full max-w-[280px] sm:max-w-[320px] md:max-w-[350px] text-center sm:text-right font-wide font-light text-[12px] sm:text-[13.5px] md:text-[15px] leading-[1.3] text-white tracking-[-0.035em]">
                Первыми — те, кто ценит<br />
                тишину и качество.<br />
                Новая партия уже<br />
                в наличии.
              </div>
            </div>

            {/* RIGHT COLUMN: Fireside Card & "СВЕЖЕЕ / НЕ / БЫВАЕТ" */}
            <div className="flex flex-col items-center sm:items-start text-left w-full mt-2 sm:mt-0">
              
              {/* Fireside Collection Card */}
              <div 
                onClick={() => setIsCatalogModalOpen(true)}
                className="group cursor-pointer relative w-full max-w-[280px] sm:max-w-[320px] md:max-w-[350px] aspect-[260/152] rounded-[20px] sm:rounded-[26px] overflow-hidden shadow-2xl transition-transform duration-500 hover:scale-[1.02] border border-white/10"
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
              <div className="mt-2.5 sm:mt-3 w-full max-w-[280px] sm:max-w-[320px] md:max-w-[350px] font-wide font-bold sm:font-extrabold uppercase text-white tracking-[-0.04em] leading-[0.88] text-[38px] sm:text-[45px] md:text-[50px] select-none text-left">
                <div>СВЕЖЕЕ</div>
                <div>НЕ</div>
                <div>БЫВАЕТ</div>
              </div>

            </div>

          </div>
        </div>

      </section>


      {/* BLOCK 3: THE WARDROBE (CURVED CYLINDER VIDEO CAROUSEL WITH USER'S 6 VIDEOS) */}
      <section id="catalog" className="pt-10 sm:pt-14 md:pt-16 pb-3 sm:pb-5 overflow-hidden text-center bg-white">
        
        {/* Section Header */}
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="relative inline-block">
            <h2 
              className="font-script text-7xl sm:text-9xl md:text-[140px] lg:text-[160px] leading-[0.85] text-[#020a48] font-normal"
              style={{ fontFamily: "'The Nautigal', cursive" }}
            >
              The Wardrobe
            </h2>
            {/* 2-line Subtitle under drobe, adjusted so it does not overlap the title */}
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

          {/* USER'S UPLOADED T-SHIRT PHOTOS IN RIBBON CAROUSEL (3D CYLINDER, NO BORDER, CLICK OPENS VIDEO) */}
          {CAROUSEL_ITEMS.map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              data-index={idx}
              className="ribbon-card-item z-10 overflow-hidden active:scale-[0.98] group bg-white cursor-pointer flex items-center justify-center p-2.5 sm:p-4 select-none border-0 outline-none shadow-none"
            >
              <img 
                src={item.image}
                alt={item.title}
                className="w-full h-full object-contain pointer-events-none select-none transition-transform duration-300 group-hover:scale-105"
                loading="eager"
              />
            </div>
          ))}
        </div>

        {/* Action Button below ribbon - shifted noticeably higher */}
        <div className="flex items-center justify-center -mt-3 sm:-mt-6 md:-mt-8 mb-4 sm:mb-6 px-4 relative z-20">
          <button 
            onClick={() => setIsCatalogModalOpen(true)}
            className="font-wide font-normal text-sm sm:text-base md:text-lg px-8 sm:px-10 py-3 sm:py-3.5 rounded-full border-2 border-[#020a48] text-[#020a48] hover:bg-[#020a48] hover:text-white transition-all duration-300 active:scale-95 shadow-sm"
          >
            Весь каталог
          </button>
        </div>

      </section>


      {/* BLOCK: LUXURY SHOWCASE BANNER (EXACT 1-TO-1 MATCH OF Frame_11_338dc050.png) */}
      <section className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 mt-8 sm:mt-16 md:mt-24 lg:mt-28 pb-16 sm:pb-20 md:pb-28">
        <div 
          onClick={() => setIsLookModalOpen(true)}
          className="group relative w-full aspect-[16/10.5] sm:aspect-[16/9.5] md:aspect-[16/9] rounded-[28px] sm:rounded-[44px] md:rounded-[56px] lg:rounded-[64px] overflow-hidden shadow-2xl cursor-pointer select-none transition-transform duration-500 hover:scale-[1.008]"
        >
          {/* Swimmer Oil Painting Background (26d36bcf-3170-4b63-bcdb-a5ac49b78497_4f19498b.png) */}
          <img 
            src={SWIMMER_IMG} 
            alt="Роскошь не кричит. Она просто хорошо сшита." 
            className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
            loading="eager"
          />

          {/* Vignette & Contrast Overlay matching Frame_11 */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 25%, rgba(0,0,0,0.18) 55%, rgba(0,0,0,0.48) 95%)'
            }}
          />

          {/* Bottom-left text backing gradient for readability */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(to top right, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.25) 35%, rgba(0,0,0,0) 65%)'
            }}
          />

          {/* Top-right button backing gradient */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(to bottom left, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.15) 25%, rgba(0,0,0,0) 50%)'
            }}
          />

          {/* TOP RIGHT: Собрать образ (Glassmorphic capsule without circle under arrow) */}
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6 md:top-8 md:right-9 lg:top-10 lg:right-12 z-10">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsLookModalOpen(true);
              }}
              className="bg-white/10 hover:bg-white/20 active:bg-white/30 text-white font-wide font-normal text-xs sm:text-sm md:text-base px-4 sm:px-6 py-2 sm:py-2.5 rounded-full border border-white/25 hover:border-white/45 backdrop-blur-md shadow-[0_4px_24px_rgba(0,0,0,0.3)] transition-all duration-300 active:scale-95 flex items-center gap-1.5 sm:gap-2 group/btn cursor-pointer"
            >
              <span className="tracking-tight">Собрать образ</span>
              <ArrowUpRight className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-white/90 group-hover/btn:text-white transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
            </button>
          </div>

          {/* BOTTOM LEFT: Роскошь не кричит. / Она просто хорошо сшита. */}
          <div className="absolute bottom-5 left-5 sm:bottom-8 sm:left-8 md:bottom-10 md:left-11 lg:bottom-12 lg:left-14 z-10 max-w-[92%] sm:max-w-[85%]">
            <h3 
              className="font-wide font-light text-white text-[20px] sm:text-[32px] md:text-[42px] lg:text-[50px] xl:text-[56px] leading-[1.12] tracking-[-0.035em] drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)]"
            >
              Роскошь не кричит.<br />
              Она просто хорошо сшита.
            </h3>
          </div>
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


      {/* BLOCK 5: CONTACTS — 1:1 по макету Frame_11 (сетка 1600×900, 1px = 0.0625cqw) */}
      <section
        id="contacts"
        className="relative text-white rounded-t-[44px] sm:rounded-t-[68px] md:rounded-t-[96px] pt-10 sm:pt-14 pb-8 overflow-hidden"
        style={{ backgroundColor: NAVY }}
      >
        {/* ───────── DESKTOP (md+) ───────── */}
        <div className="hidden md:block max-w-[1600px] mx-auto">
          <div className="relative w-full aspect-[16/9] [container-type:inline-size]">

            {/* Картинка с яхтой (слева, скруглена слева) */}
            <img
              src={YACHT_IMG}
              alt="Hustlify Racing Yacht Artwork"
              className="absolute object-cover object-left select-none pointer-events-none"
              style={{
                left: '4.875cqw', top: '2.75cqw', width: '36.375cqw', height: '50.75cqw',
                borderRadius: '6.5cqw 0 0 6.5cqw'
              }}
            />

            {/* Белая карточка поверх картинки */}
            <div
              className="absolute bg-white"
              style={{
                left: '36.625cqw', top: '2.75cqw', width: '58.5cqw', height: '50.75cqw',
                borderRadius: '6.5cqw'
              }}
            />

            {/* Стеклянные кнопки Telegram / Phone */}
            <a
              href="https://t.me/hustlify" target="_blank" rel="noopener noreferrer"
              aria-label="Написать в Telegram"
              className={`absolute ${glassBtn}`}
              style={{ left: '16.0625cqw', top: '18.5625cqw', width: '8.5cqw', height: '8.5cqw' }}
            >
              <TelegramIcon className="w-[4.6cqw] h-[4.6cqw]" />
            </a>
            <a
              href="tel:+79990002026" aria-label="Позвонить"
              className={`absolute ${glassBtn}`}
              style={{ left: '16.0625cqw', top: '29.125cqw', width: '8.5cqw', height: '8.5cqw' }}
            >
              <Phone className="w-[3.6cqw] h-[3.6cqw] fill-white text-white" />
            </a>

            {/* Заголовок */}
            <h3
              className="absolute font-bold leading-none tracking-normal whitespace-nowrap"
              style={{
                left: '40.9cqw', top: '6.4cqw', fontSize: '7.9cqw',
                fontFamily: "'Dancing Script', cursive", color: ACCENT
              }}
            >
              Contacts
            </h3>

            {/* Подзаголовок */}
            <p
              className="absolute font-wide font-light text-black"
              style={{
                left: '40.6cqw', top: '13.9cqw', width: '52cqw',
                fontSize: '1.3cqw', lineHeight: 1.08, letterSpacing: '-0.01em'
              }}
            >
              Заполните анкету — стилист свяжется с вами и подберёт образ под ваш вкус, повод и бюджет.
            </p>

            {/* Форма */}
            <div
              className="absolute"
              style={{ left: '40.625cqw', top: '19.25cqw', width: '50.875cqw', height: '29.8cqw' }}
            >
              {renderContactForm(true)}
            </div>
          </div>
        </div>

        {/* ───────── MOBILE (<md) ───────── */}
        <div className="md:hidden px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-[32px]">
            <img
              src={YACHT_IMG}
              alt="Hustlify Racing Yacht Artwork"
              className="w-full h-[340px] sm:h-[420px] object-cover object-[20%_center] select-none pointer-events-none"
            />
            <div className="absolute inset-x-0 top-[28%] flex justify-center gap-4">
              <a href="https://t.me/hustlify" target="_blank" rel="noopener noreferrer" aria-label="Написать в Telegram" className={`w-16 h-16 ${glassBtn}`}>
                <TelegramIcon className="w-8 h-8" />
              </a>
              <a href="tel:+79990002026" aria-label="Позвонить" className={`w-16 h-16 ${glassBtn}`}>
                <Phone className="w-7 h-7 fill-white text-white" />
              </a>
            </div>
          </div>

          <div className="relative -mt-10 bg-white rounded-[32px] p-6 sm:p-8">
            <h3 className="font-bold text-6xl leading-[0.95] mb-2" style={{ fontFamily: "'Dancing Script', cursive", color: ACCENT }}>
              Contacts
            </h3>
            <p className="font-wide font-light text-[13px] leading-tight text-black mb-5">
              Заполните анкету — стилист свяжется с вами и подберёт образ под ваш вкус, повод и бюджет.
            </p>
            <div style={{ color: ACCENT }}>{renderContactForm(false)}</div>
          </div>
        </div>

        <footer className="relative z-10 text-center text-xs font-text text-[#8f9bd6] pt-10 sm:pt-14 pb-2">
          © 2026 Hustlify. Тихо и по делу. Все права защищены.
        </footer>
      </section>


      {/* MOBILE NAVIGATION DRAWER */}
      {isMobileMenuOpen && (
        <div 
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex justify-end md:hidden"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-[84%] max-w-[340px] bg-[#020a48] text-white h-full shadow-2xl flex flex-col justify-between p-6 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] border-l border-white/10"
          >
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-white/15">
                <div className="flex items-center gap-2.5">
                  <img src={LOGO_IMG} alt="Hustlify Logo" className="w-8 h-8 object-contain" />
                  <span className="font-script text-3xl tracking-tight" style={{ fontFamily: "'The Nautigal', cursive" }}>
                    Hustlify.
                  </span>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-label="Закрыть меню"
                  className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 active:scale-90"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Navigation Links with smooth scroll */}
              <nav className="flex flex-col gap-4 mt-8">
                {[
                  { label: 'Новинки', href: '#news' },
                  { label: 'Каталог', href: '#catalog' },
                  { label: 'О бренде', href: '#about' },
                  { label: 'Контакты', href: '#contacts' }
                ].map((link) => (
                  <a 
                    key={link.label}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="font-wide text-base font-light tracking-wide text-white/90 hover:text-white py-1.5 transition-colors flex items-center justify-between"
                  >
                    <span>{link.label}</span>
                    <span className="text-white/40 text-xs">→</span>
                  </a>
                ))}
              </nav>

              {/* Action Buttons in Drawer */}
              <div className="mt-8 pt-6 border-t border-white/15 flex flex-col gap-3">
                <button 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsCatalogModalOpen(true);
                  }}
                  className="w-full py-3.5 rounded-full border border-white/40 text-white font-wide text-xs hover:bg-white/10 transition-colors text-center"
                >
                  Весь каталог
                </button>
                <button 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsLookModalOpen(true);
                  }}
                  className="w-full py-3.5 rounded-full bg-white text-[#020a48] font-wide font-medium text-xs hover:bg-slate-100 transition-colors text-center shadow-lg"
                >
                  Собрать образ со стилистом
                </button>
              </div>
            </div>

            {/* Quick Contact Footer in Drawer */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/60 font-text">
              <a href="tel:+79990002026" className="hover:text-white transition-colors">
                +7 (999) 000-20-26
              </a>
              <a 
                href="https://t.me/hustlify" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-white transition-colors underline"
              >
                Telegram
              </a>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCT DETAIL POPUP MODAL (WITH 3D ROTATING VIDEO PREVIEW) */}
      {/* Background fill matches the video background (pure black #000000) */}
      {selectedProduct && (
        <div 
          onClick={() => setSelectedProduct(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative bg-black text-white rounded-[24px] sm:rounded-[28px] max-w-[780px] w-full p-5 sm:p-8 shadow-2xl border border-white/15 my-auto max-h-[92vh] overflow-y-auto overscroll-contain"
          >
            <button 
              onClick={() => setSelectedProduct(null)}
              aria-label="Закрыть"
              className="absolute right-3 top-3 sm:right-4 sm:top-4 z-20 w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-all duration-200 hover:rotate-90 border border-white/10 active:scale-90"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_1.1fr] gap-4 sm:gap-8 items-center pt-2 sm:pt-0">
              {/* 3D Rotating Video container - pure black background matches the 3D rotating video */}
              <div className="relative aspect-[4/3] sm:aspect-[3/4] max-h-[250px] sm:max-h-[400px] rounded-2xl overflow-hidden bg-black flex items-center justify-center border border-white/10 shadow-2xl w-full">
                <video 
                  key={selectedProduct.video}
                  src={selectedProduct.video}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  className="w-full h-full object-contain select-none"
                />
              </div>

              {/* Product Info */}
              <div className="flex flex-col justify-center">
                <span className="text-[10px] sm:text-xs font-wide text-[#8f9bd6] uppercase tracking-wider mb-1 block">
                  {selectedProduct.category}
                </span>
                <h4 className="font-wide font-semibold text-xl sm:text-3xl tracking-tight text-white">
                  {selectedProduct.title}
                </h4>
                <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                  {selectedProduct.desc}
                </p>
                <div className="font-wide font-medium text-xl sm:text-3xl text-white mt-4 sm:mt-5 mb-5 sm:mb-6">
                  {selectedProduct.price.toLocaleString('ru-RU')} ₽
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
                  <button 
                    onClick={() => {
                      addToCart(selectedProduct);
                      setSelectedProduct(null);
                    }}
                    className="w-full sm:flex-1 bg-white text-[#020a48] font-wide font-medium text-xs sm:text-sm py-3.5 rounded-full hover:bg-slate-200 transition-colors shadow-lg active:scale-95 text-center min-h-[46px]"
                  >
                    В корзину
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedProduct(null);
                      setIsLookModalOpen(true);
                    }}
                    className="w-full sm:w-auto px-5 py-3.5 rounded-full border border-white/30 text-white font-wide text-xs hover:bg-white/10 transition-colors text-center min-h-[46px]"
                  >
                    Собрать образ
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}


      {/* FULL CATALOG MODAL */}
      {isCatalogModalOpen && (
        <div 
          onClick={() => setIsCatalogModalOpen(false)}
          className="fixed inset-0 z-50 bg-[#020a48]/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white text-[#020a48] rounded-[24px] sm:rounded-[32px] max-w-[1080px] w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl my-auto"
          >
            <div className="px-5 sm:px-8 py-4 sm:py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] sm:text-xs font-wide text-[#1c3a9e] uppercase tracking-wider">Hustlify 2026</span>
                <h3 className="font-wide font-bold text-xl sm:text-3xl tracking-tight text-[#020a48]">
                  Коллекция Wardrobe
                </h3>
              </div>
              <button 
                onClick={() => setIsCatalogModalOpen(false)}
                aria-label="Закрыть каталог"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors active:scale-90"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-8 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 overscroll-contain">
              {UPLOADED_VIDEOS.map((item) => (
                <div 
                  key={item.id} 
                  className="rounded-2xl bg-white border border-slate-200 flex flex-col justify-between overflow-hidden hover:shadow-lg transition-all group"
                >
                  <div 
                    onClick={() => {
                      setSelectedProduct(item);
                      setIsCatalogModalOpen(false);
                    }}
                    className="relative aspect-[3/4] bg-[#fcfcfd] p-4 flex items-center justify-center overflow-hidden cursor-pointer"
                  >
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105" 
                    />
                  </div>
                  <div className="p-4 sm:p-5 flex flex-col justify-between flex-1">
                    <div>
                      <span className="text-[10px] font-wide uppercase text-[#1c3a9e] tracking-wider">
                        {item.category}
                      </span>
                      <h4 
                        onClick={() => {
                          setSelectedProduct(item);
                          setIsCatalogModalOpen(false);
                        }}
                        className="font-wide font-semibold text-sm sm:text-base text-[#020a48] mt-1 cursor-pointer hover:text-[#1c3a9e]"
                      >
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 font-light">
                        {item.desc}
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                      <span className="font-wide font-bold text-sm text-[#020a48]">
                        {item.price.toLocaleString('ru-RU')} ₽
                      </span>
                      <button 
                        onClick={() => addToCart(item)}
                        className="bg-[#020a48] text-white text-xs font-wide px-3.5 py-2 rounded-full hover:bg-[#1c3a9e] transition-colors active:scale-95"
                      >
                        В корзину
                      </button>
                    </div>
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
          className="fixed inset-0 z-50 bg-[#020a48]/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white text-[#020a48] rounded-[24px] sm:rounded-[32px] max-w-[820px] w-full p-5 sm:p-10 max-h-[92vh] overflow-y-auto overscroll-contain shadow-2xl my-auto"
          >
            <button 
              onClick={() => setIsLookModalOpen(false)}
              aria-label="Закрыть"
              className="absolute right-4 top-4 sm:right-6 sm:top-6 w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors active:scale-90"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="max-w-md pr-8 sm:pr-0">
              <span className="text-[10px] sm:text-xs font-wide text-[#1c3a9e] uppercase tracking-wider font-semibold">
                NewMoney Styling Service
              </span>
              <h3 className="font-wide font-bold text-xl sm:text-3xl text-[#020a48] mt-1 mb-2 sm:mb-3">
                Собрать образ со стилистом
              </h3>
              <p className="text-xs sm:text-sm text-[#1c3a9e] font-light leading-relaxed">
                Персональный подбор капсулы под мероприятие, деловой гардероб или повседневную жизнь с учетом вашей конституции и предпочтений.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 my-5 sm:my-8">
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
              className="w-full bg-[#020a48] text-white font-wide font-normal text-sm py-3.5 sm:py-4 rounded-full hover:bg-[#1c3a9e] transition-colors min-h-[46px] active:scale-[0.98]"
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
          className="fixed inset-0 z-50 bg-[#020a48]/85 backdrop-blur-md flex flex-col items-center pt-16 sm:pt-24 px-3 sm:px-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[640px] bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl"
          >
            <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input 
                type="text"
                autoFocus
                placeholder="Поиск по гардеробу (Hustlify, CEO, клуб...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full font-text text-base sm:text-sm text-[#020a48] outline-none placeholder:text-slate-400"
              />
              <button onClick={() => setIsSearchOpen(false)} aria-label="Закрыть поиск" className="p-1">
                <X className="w-5 h-5 text-slate-400 hover:text-slate-700" />
              </button>
            </div>

            <div className="mt-4 max-h-[300px] sm:max-h-[340px] overflow-y-auto space-y-2 overscroll-contain">
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
            className="w-full sm:max-w-[420px] bg-white h-full shadow-2xl flex flex-col p-5 sm:p-8 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-wide font-bold text-lg sm:text-xl text-[#020a48]">Корзина ({cart.length})</h3>
              <button 
                onClick={() => setIsCartOpen(false)}
                aria-label="Закрыть корзину"
                className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-100 active:scale-90"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-3 overscroll-contain">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-400">
                  <ShoppingBag className="w-12 h-12 stroke-[1.2] mb-3 text-slate-300" />
                  <p className="font-wide text-sm">Ваша корзина пуста</p>
                  <p className="text-xs text-slate-400 mt-1">Выберите понравившиеся позиции из The Wardrobe</p>
                </div>
              ) : (
                cart.map((item, idx) => (
                  <div key={idx} className="flex gap-3 items-center p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                      <img 
                        src={item.image} 
                        alt={item.title} 
                        referrerPolicy="no-referrer" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-wide text-xs font-semibold text-[#020a48] truncate">{item.title}</h4>
                      <span className="text-[11px] text-[#1c3a9e]">{item.price.toLocaleString('ru-RU')} ₽</span>
                    </div>
                    <button 
                      onClick={() => setCart((prev) => prev.filter((_, i) => i !== idx))}
                      className="text-slate-400 hover:text-red-500 p-1.5"
                      aria-label="Удалить"
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
                  <span className="text-base sm:text-lg font-bold text-[#020a48]">
                    {cart.reduce((sum, item) => sum + item.price, 0).toLocaleString('ru-RU')} ₽
                  </span>
                </div>
                <button 
                  onClick={() => {
                    setIsCartOpen(false);
                    showToast('Заказ оформлен! Наш консьерж свяжется с вами.');
                    setCart([]);
                  }}
                  className="w-full bg-[#020a48] text-white font-wide font-normal text-sm py-3.5 rounded-full hover:bg-[#1c3a9e] transition-colors min-h-[46px] active:scale-[0.98]"
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
        className={`fixed left-1/2 bottom-[max(1.5rem,env(safe-area-inset-bottom))] -translate-x-1/2 z-50 bg-[#020a48] text-white font-wide text-xs sm:text-sm px-6 py-3.5 rounded-full shadow-2xl transition-all duration-300 pointer-events-none flex items-center gap-2 border border-white/20 ${
          toastMessage ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
        }`}
      >
        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>{toastMessage}</span>
      </div>

    </div>
  );
}
