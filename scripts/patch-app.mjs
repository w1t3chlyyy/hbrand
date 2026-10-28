// Запускается автоматически перед dev/build. Идемпотентный: вносит правки в src/App.tsx.
import fs from 'fs';

const F = 'src/App.tsx';
let s = fs.readFileSync(F, 'utf8');
if (s.includes("./lib/data")) { console.log('App.tsx уже пропатчен'); process.exit(0); }

const sub = (re, to, label) => {
  if (s.search(re) < 0) console.warn('⚠ не найдено:', label);
  s = s.replace(re, to);
};

sub(/import React, \{ useState, useEffect, useRef \} from 'react';/, "import React, { useState, useEffect, useRef, useMemo } from 'react';", 'react import');
sub(/\/\/ 6 Products[^\n]*\nconst UPLOADED_VIDEOS = \[[\s\S]*?\n\];\n/, '', 'UPLOADED_VIDEOS');
sub(/\/\/ Carousel items[^\n]*\nconst CAROUSEL_ITEMS = \[[\s\S]*?\n\];\n/, '', 'CAROUSEL_ITEMS');
sub(/interface CardInfo \{[\s\S]*?\n\}\n/, '', 'CardInfo');
sub(/(import firesideYachtImg from [^\n]+\n)/,
  `$1import { useProducts, useNovelty, useSite, submitLead, loadCart, saveCart } from './lib/data';\nimport type { CardInfo } from './lib/data';\nimport { FALLBACK_PRODUCTS } from './lib/fallback';\n`, 'imports');
sub(/export default function App\(\) \{\n/, `export default function App() {
  const { products: UPLOADED_VIDEOS } = useProducts(FALLBACK_PRODUCTS);
  const novelty = useNovelty();
  const site = useSite();
  const [heroPlaying, setHeroPlaying] = useState(false);
  const CAROUSEL_ITEMS = useMemo(() => {
    if (!UPLOADED_VIDEOS.length) return [] as CardInfo[];
    const out: CardInfo[] = [];
    while (out.length < 12) out.push(...UPLOADED_VIDEOS);
    return out;
  }, [UPLOADED_VIDEOS]);
  const goCatalog = () => { window.location.href = '/catalog'; };
  const goBuilder = () => { window.location.href = '/builder'; };
`, 'App()');
sub(/const \[cart, setCart\] = useState<CardInfo\[\]>\(\[\]\);/,
  'const [cart, setCart] = useState<CardInfo[]>(loadCart);\n  useEffect(() => saveCart(cart), [cart]);', 'cart');
sub(/\}, \[isDragging\]\);/, '}, [isDragging, CAROUSEL_ITEMS.length]);', 'ribbon deps');
s = s.replace(/setIsLookModalOpen\(true\)/g, 'goBuilder()');
sub(/onClick=\{\(\) => setIsCatalogModalOpen\(true\)\}(\s*className="group cursor-pointer relative)/, "onClick={() => { window.location.href = '/new'; }}$1", 'fireside card');
s = s.replace(/setIsCatalogModalOpen\(true\)/g, 'goCatalog()');
s = s.replace(/(\s*)\{ label: 'О бренде', href: '#about' \}/g, "$1{ label: 'Образы', href: '/builder' },$1{ label: 'О бренде', href: '#about' }");
s = s.replace(/\{ label: 'Каталог', href: '#catalog' \}/g, "{ label: 'Каталог', href: '/catalog' }");
sub(/href="#catalog"/, 'href="/new"', 'Новинки pill');
sub(/src=\{firesideYachtImg\}/, 'src={novelty.image || firesideYachtImg}', 'fireside img');
sub(/(>\s*)Fireside(\s*<\/span>)/, '$1{novelty.title}$2', 'fireside title');
sub(/(>\s*)COLLECTION(\s*<\/span>)/, '$1{novelty.subtitle}$2', 'fireside subtitle');
sub(/const handleFormSubmit = \(e: React\.FormEvent\) => \{[\s\S]*?\n  \};\n/, `const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;
    const ok = await submitLead({ ...formData, source: 'site' });
    if (!ok) { showToast('Не удалось отправить анкету. Попробуйте ещё раз.'); return; }
    setFormSubmitted(true);
    showToast('Анкета успешно отправлена стилисту!');
    setTimeout(() => {
      setFormData({ name: '', phone: '', note: '' });
      setFormSubmitted(false);
    }, 4000);
  };
`, 'handleFormSubmit');

// ───── обложка hero на весь экран (моб.) + видео из админки ─────
const lit = (str) => new RegExp(str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
sub(lit('key={HERO_VIDEO}'), 'key={site.homeHero || HERO_VIDEO}', 'hero video key');
s = s.replace(/src=\{HERO_VIDEO\}/g, 'src={site.homeHero || HERO_VIDEO}');
sub(/relative w-full aspect-\[16\/11\] sm:aspect-\[16\/10\] md:aspect-\[16\/9\.2\] max-h-\[880px\] min-h-\[500px\] sm:min-h-\[580px\] md:min-h-\[660px\]/,
  'relative w-full h-[100svh] md:h-auto md:aspect-[16/9.2] md:max-h-[880px] md:min-h-[660px]', 'hero full screen');

// ───── блок «Contacts»: уменьшаем белую плашку и форму на ПК ─────
sub(lit('hidden md:block max-w-[1600px] mx-auto'), 'hidden md:block max-w-[1120px] mx-auto', 'contacts width');
s = s.replace(/h-\[6\.25cqw\]/g, 'h-[5.2cqw]');
s = s.replace(/text-\[1\.75cqw\]!/g, 'text-[1.35cqw]!');
s = s.replace(/text-\[1\.9cqw\]/g, 'text-[1.5cqw]');
s = s.replace(/px-\[2\.9cqw\]/g, 'px-[2.4cqw]');
sub(lit("'flex flex-col gap-[1.5625cqw] w-full'"), "'flex flex-col justify-center gap-[1.6cqw] w-full h-full'", 'contacts form layout');

// ───── единый размер кнопок ─────
const btn = (from, to, label) => sub(lit(from), to, label);
btn('className="font-wide font-normal text-sm sm:text-base md:text-lg px-8 sm:px-10 py-3 sm:py-3.5 rounded-full border-2 border-[#020a48] text-[#020a48] hover:bg-[#020a48] hover:text-white transition-all duration-300 active:scale-95 shadow-sm"', 'className="btn-site btn-outline"', 'btn Весь каталог');
sub(/className="bg-white\/10 hover:bg-white\/20 active:bg-white\/30 text-white font-wide[^"]*"/, 'className="btn-site btn-glass cursor-pointer group/btn"', 'btn Собрать образ');
btn('className="w-full py-3.5 rounded-full border border-white/40 text-white font-wide text-xs hover:bg-white/10 transition-colors text-center"', 'className="btn-site btn-ghost w-full"', 'btn drawer 1');
btn('className="w-full py-3.5 rounded-full bg-white text-[#020a48] font-wide font-medium text-xs hover:bg-slate-100 transition-colors text-center shadow-lg"', 'className="btn-site btn-white w-full"', 'btn drawer 2');
btn('className="w-full sm:flex-1 bg-white text-[#020a48] font-wide font-medium text-xs sm:text-sm py-3.5 rounded-full hover:bg-slate-200 transition-colors shadow-lg active:scale-95 text-center min-h-[46px]"', 'className="btn-site btn-white w-full sm:flex-1 sm:min-w-0"', 'btn modal 1');
btn('className="w-full sm:w-auto px-5 py-3.5 rounded-full border border-white/30 text-white font-wide text-xs hover:bg-white/10 transition-colors text-center min-h-[46px]"', 'className="btn-site btn-ghost w-full sm:w-auto sm:min-w-0"', 'btn modal 2');
btn('className="w-full bg-[#020a48] text-white font-wide font-normal text-sm py-3.5 rounded-full hover:bg-[#1c3a9e] transition-colors min-h-[46px] active:scale-[0.98]"', 'className="btn-site btn-navy w-full"', 'btn cart');
// кнопка отправки анкеты (ПК и моб.)
sub(/'w-full h-\[5\.2cqw\] rounded-full text-white font-wide font-normal text-\[1\.5cqw\] hover:brightness-125 transition cursor-pointer'/, "'w-full h-[5.2cqw] rounded-full text-white font-wide font-normal text-[1.5cqw] hover:brightness-125 transition cursor-pointer'", 'form submit desktop (keep)');

// ───── моб. hero: крупнее «Hustlify.», без наложений, видео без кнопки ─────
sub(lit('text-[9.2vw] sm:text-[8vw] md:text-[6.8vw] lg:text-[90px]'), 'text-[24vw] sm:text-[12vw] md:text-[6.8vw] lg:text-[90px]', 'hero title size');
sub(lit('text-[4.8px] sm:text-[5.5px] md:text-[6.2px] lg:text-[7.2px]'), 'text-[9px] sm:text-[5.5px] md:text-[6.2px] lg:text-[7.2px]', 'hero slogan size');
sub(lit('-mt-2.5 sm:-mt-3 md:-mt-3.5 translate-x-3'), '-mt-1.5 sm:-mt-3 md:-mt-3.5 translate-x-3', 'hero slogan margin');
sub(lit('className="absolute inset-0 w-full h-full object-cover object-center opacity-70"'), 'className="absolute inset-0 w-full h-full object-cover object-center opacity-70 pointer-events-none"', 'hero video pointer');
// «Hustlify.» в блоке About: хвост буквы y не должен налезать на ABOUT US
sub(lit('tracking-tight mt-1 mb-6 uppercase'), 'tracking-tight mt-6 mb-6 uppercase', 'about title margin');

// ───── постер поверх hero-видео, пока оно не играет (скрывает системную кнопку запуска) ─────
sub(lit('poster={HERO_POSTER}'), 'poster={HERO_POSTER}\n            onPlaying={() => setHeroPlaying(true)}', 'hero onPlaying');
sub(/<\/video>(\s*\{\/\* Smooth multi-stage gradient)/, '</video>\n          {!heroPlaying && <div aria-hidden="true" className="absolute inset-0 w-full h-full bg-cover bg-center opacity-70 pointer-events-none" style={{ backgroundImage: `url(${HERO_POSTER})` }} />}$1', 'hero poster overlay');

fs.writeFileSync(F, s);
console.log('App.tsx обновлён');
