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
  `$1import { useProducts, useNovelty, submitLead, loadCart, saveCart } from './lib/data';\nimport type { CardInfo } from './lib/data';\nimport { FALLBACK_PRODUCTS } from './lib/fallback';\n`, 'imports');
sub(/export default function App\(\) \{\n/, `export default function App() {
  const { products: UPLOADED_VIDEOS } = useProducts(FALLBACK_PRODUCTS);
  const novelty = useNovelty();
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

fs.writeFileSync(F, s);
console.log('App.tsx обновлён');
