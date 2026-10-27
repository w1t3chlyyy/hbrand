import { useMemo, useState } from 'react';
import { Search, ShoppingBag, X, Check, ArrowLeft } from 'lucide-react';
import { useProducts, useNovelty, submitLead, loadCart, saveCart } from '../lib/data';
import type { CardInfo } from '../lib/data';
import { FALLBACK_PRODUCTS } from '../lib/fallback';
import firesideImg from '@/src/assets/images/fireside_yacht_sunset_1792682674897.jpg';

const rub = (n: number) => n.toLocaleString('ru-RU') + ' ₽';

export default function Catalog() {
  const { products, loading } = useProducts(FALLBACK_PRODUCTS);
  const novelty = useNovelty();
  const [cat, setCat] = useState(() => (new URLSearchParams(location.search).get('new') ? 'Новинки' : 'Все'));
  const [q, setQ] = useState('');
  const [sel, setSel] = useState<CardInfo | null>(null);
  const [cart, setCart] = useState<CardInfo[]>(loadCart);
  const [cartOpen, setCartOpen] = useState(() => new URLSearchParams(location.search).has('cart'));
  const [form, setForm] = useState({ name: '', phone: '' });
  const [toast, setToast] = useState('');

  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(''), 2500); };
  const update = (c: CardInfo[]) => { setCart(c); saveCart(c); };
  const add = (p: CardInfo) => { update([...cart, p]); flash(`«${p.title}» добавлен в корзину`); };

  const cats = useMemo(
    () => ['Все', ...(products.some((p) => p.isNew) ? ['Новинки'] : []), ...Array.from(new Set(products.map((p) => p.category)))],
    [products]
  );
  const shown = products.filter(
    (p) =>
      (cat === 'Все' || (cat === 'Новинки' ? p.isNew : p.category === cat)) &&
      (p.title + p.desc + p.category).toLowerCase().includes(q.toLowerCase())
  );
  const total = cart.reduce((s, i) => s + i.price, 0);

  const order = async (e: React.FormEvent) => {
    e.preventDefault();
    const note = cart.map((i) => `${i.title} — ${rub(i.price)}`).join('; ') + ` | Итого: ${rub(total)}`;
    if (await submitLead({ ...form, note, source: 'order' })) {
      update([]); setCartOpen(false); setForm({ name: '', phone: '' });
      flash('Заказ отправлен! Мы свяжемся с вами.');
    } else flash('Не удалось отправить. Попробуйте ещё раз.');
  };

  return (
    <div className="min-h-screen bg-white text-[#020a48] font-text">
      <section className="bg-[#020a48] text-white rounded-b-[44px] sm:rounded-b-[68px] md:rounded-b-[96px] pb-14 sm:pb-20 shadow-2xl">
        <header className="flex items-center justify-between px-4 sm:px-8 md:px-12 py-5 md:py-7">
          <a href="/" className="flex items-center gap-2 font-wide text-xs sm:text-[13px]">
            <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">На главную</span>
          </a>
          <a href="/" className="font-script text-4xl leading-none">Hustlify.</a>
          <button onClick={() => setCartOpen(true)} aria-label="Корзина"
            className="relative w-10 h-10 rounded-full border border-white/40 hover:bg-white/10 flex items-center justify-center active:scale-95 transition">
            <ShoppingBag className="w-4 h-4" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-white text-[#020a48] text-[10px] font-wide font-bold w-4 h-4 rounded-full flex items-center justify-center">{cart.length}</span>
            )}
          </button>
        </header>
        <div className="text-center pt-6 sm:pt-10 px-4">
          <h1 className="font-script text-[22vw] sm:text-9xl md:text-[140px] leading-[0.85]">The Wardrobe</h1>
          <p className="font-wide font-light text-xs sm:text-base mt-4">Весь гардероб Hustlify — тихо и по делу</p>
        </div>
      </section>

      <main className="max-w-[1200px] mx-auto px-4 sm:px-8 pt-10 sm:pt-14 pb-16">
        {novelty.active && (
          <a href="/new" className="group relative block w-full text-left aspect-[16/9] sm:aspect-[16/6] rounded-[28px] sm:rounded-[44px] overflow-hidden shadow-2xl mb-10 sm:mb-14">
            <img src={novelty.image || firesideImg} alt={novelty.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/20 to-transparent" />
            <div className="relative h-full flex flex-col justify-center px-6 sm:px-12 text-white">
              <span className="font-script text-7xl sm:text-9xl leading-[0.8] drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">{novelty.title}</span>
              <span className="font-wide text-[10px] sm:text-xs tracking-[0.2em] uppercase mt-1">{novelty.subtitle}</span>
              {novelty.text && <span className="font-wide font-light text-xs sm:text-base mt-3 max-w-[340px] leading-snug">{novelty.text}</span>}
            </div>
          </a>
        )}

        <div id="grid" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8 scroll-mt-6">
          <div className="flex gap-2 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 pb-1">
            {cats.map((c) => (
              <button key={c} onClick={() => setCat(c)}
                className={`shrink-0 font-wide text-xs sm:text-sm px-4 sm:px-5 py-2.5 rounded-full border-2 border-[#020a48] transition ${cat === c ? 'bg-[#020a48] text-white' : 'hover:bg-[#020a48]/5'}`}>
                {c}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 border-2 border-[#020a48] rounded-full px-4 py-2 sm:w-64">
            <Search className="w-4 h-4 shrink-0" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Поиск" className="w-full outline-none font-text bg-transparent" />
          </label>
        </div>

        {loading ? (
          <p className="text-center py-20 font-wide text-sm text-slate-400">Загружаем гардероб…</p>
        ) : shown.length === 0 ? (
          <p className="text-center py-20 font-wide text-sm text-slate-400">Ничего не найдено. Попробуйте другой запрос или категорию.</p>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {shown.map((p) => (
              <div key={p.id} className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white overflow-hidden flex flex-col hover:shadow-lg transition-shadow">
                <button onClick={() => setSel(p)} className="relative aspect-[3/4] bg-[#fcfcfd] p-3 sm:p-6 flex items-center justify-center group">
                  {p.isNew && <span className="absolute top-3 left-3 bg-[#020a48] text-white font-wide text-[10px] px-3 py-1 rounded-full">Новинка</span>}
                  <img src={p.image} alt={p.title} className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105" />
                </button>
                <div className="p-3 sm:p-5 flex flex-col flex-1 justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-wide text-[#1c3a9e]">{p.category}</span>
                    <h2 className="font-wide font-semibold text-xs sm:text-base mt-1 leading-snug">{p.title}</h2>
                  </div>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="font-wide font-bold text-xs sm:text-sm">{rub(p.price)}</span>
                    <button onClick={() => add(p)} className="bg-[#020a48] text-white text-[11px] sm:text-xs font-wide px-3.5 py-2 rounded-full hover:bg-[#1c3a9e] active:scale-95 transition">В корзину</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="bg-[#020a48] text-[#8f9bd6] rounded-t-[44px] sm:rounded-t-[68px] md:rounded-t-[96px] text-center text-xs py-12 sm:py-16 px-4">
        <a href="/#contacts" className="inline-block mb-6 font-wide text-sm text-white border border-white/40 rounded-full px-7 py-3 hover:bg-white/10 transition">Связаться со стилистом</a>
        <p>© 2026 Hustlify. Тихо и по делу. Все права защищены.</p>
      </footer>

      {sel && (
        <div onClick={() => setSel(null)} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div onClick={(e) => e.stopPropagation()} className="relative bg-black text-white rounded-[24px] sm:rounded-[28px] max-w-[780px] w-full p-5 sm:p-8 border border-white/15 max-h-[92vh] overflow-y-auto">
            <button onClick={() => setSel(null)} aria-label="Закрыть" className="absolute right-3 top-3 z-20 w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center"><X className="w-5 h-5" /></button>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_1.1fr] gap-4 sm:gap-8 items-center pt-2">
              <div className="aspect-[4/3] sm:aspect-[3/4] max-h-[260px] sm:max-h-[400px] rounded-2xl overflow-hidden bg-black flex items-center justify-center border border-white/10">
                {sel.video
                  ? <video key={sel.video} src={sel.video} autoPlay muted loop playsInline className="w-full h-full object-contain" />
                  : <img src={sel.image} alt={sel.title} className="w-full h-full object-contain" />}
              </div>
              <div>
                <span className="text-[10px] sm:text-xs font-wide text-[#8f9bd6]">{sel.category}</span>
                <h3 className="font-wide font-semibold text-xl sm:text-3xl tracking-tight mt-1">{sel.title}</h3>
                <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed font-light">{sel.desc}</p>
                <div className="font-wide font-medium text-xl sm:text-3xl my-5">{rub(sel.price)}</div>
                <button onClick={() => { add(sel); setSel(null); }} className="w-full bg-white text-[#020a48] font-wide font-medium text-sm py-3.5 rounded-full hover:bg-slate-200 active:scale-95 transition min-h-[46px]">В корзину</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {cartOpen && (
        <div onClick={() => setCartOpen(false)} className="fixed inset-0 z-50 bg-[#020a48]/70 backdrop-blur-sm flex justify-end">
          <div onClick={(e) => e.stopPropagation()} className="w-full sm:max-w-[420px] bg-white h-full shadow-2xl flex flex-col p-5 sm:p-8 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-wide font-bold text-lg sm:text-xl">Корзина ({cart.length})</h3>
              <button onClick={() => setCartOpen(false)} aria-label="Закрыть корзину" className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-100"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-400">
                  <ShoppingBag className="w-12 h-12 stroke-[1.2] mb-3" />
                  <p className="font-wide text-sm">Корзина пуста</p>
                  <p className="text-xs mt-1">Добавьте вещи из The Wardrobe</p>
                </div>
              ) : cart.map((i, idx) => (
                <div key={idx} className="flex gap-3 items-center p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <img src={i.image} alt="" className="w-12 h-12 rounded-xl bg-white border border-slate-200 object-contain shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-wide text-xs font-semibold truncate">{i.title}</h4>
                    <span className="text-[11px] text-[#1c3a9e]">{rub(i.price)}</span>
                  </div>
                  <button onClick={() => update(cart.filter((_, k) => k !== idx))} aria-label="Удалить" className="text-slate-400 hover:text-red-500 p-1.5"><X className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
            {cart.length > 0 && (
              <form onSubmit={order} className="pt-4 border-t border-slate-100 space-y-3">
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ваше имя" className="w-full rounded-full border-2 border-[#020a48] px-5 py-3 outline-none" />
                <input required type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Телефон" className="w-full rounded-full border-2 border-[#020a48] px-5 py-3 outline-none" />
                <div className="flex justify-between items-center font-wide">
                  <span className="text-xs text-slate-500">Итого:</span>
                  <span className="text-lg font-bold">{rub(total)}</span>
                </div>
                <button type="submit" className="w-full bg-[#020a48] text-white font-wide text-sm py-3.5 rounded-full hover:bg-[#1c3a9e] active:scale-[0.98] transition min-h-[46px]">Оформить заказ</button>
              </form>
            )}
          </div>
        </div>
      )}

      <div className={`fixed left-1/2 bottom-[max(1.5rem,env(safe-area-inset-bottom))] -translate-x-1/2 z-[60] bg-[#020a48] text-white font-wide text-xs sm:text-sm px-6 py-3.5 rounded-full shadow-2xl transition-all duration-300 pointer-events-none flex items-center gap-2 border border-white/20 ${toast ? 'opacity-100' : 'opacity-0 translate-y-8'}`}>
        <Check className="w-4 h-4 text-emerald-400 shrink-0" /><span>{toast}</span>
      </div>
    </div>
  );
}
