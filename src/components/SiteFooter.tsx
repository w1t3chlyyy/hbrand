import { Phone } from 'lucide-react';

const NAV = [
  { label: 'Новинки', href: '/new' },
  { label: 'Каталог', href: '/catalog' },
  { label: 'Образы', href: '/builder' },
  { label: 'О бренде', href: '/#about' },
  { label: 'Контакты', href: '/#contacts' }
];

export default function SiteFooter() {
  return (
    <footer className="bg-[#020a48] text-white rounded-t-[44px] sm:rounded-t-[68px] md:rounded-t-[96px] mt-10 sm:mt-16">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-10 pt-16 sm:pt-24 pb-8">
        <div className="grid md:grid-cols-[1.5fr_1fr_1fr] gap-12 md:gap-16">
          <div>
            <a href="/" className="font-script text-[88px] sm:text-[110px] leading-[0.85] block">Hustlify.</a>
            <p className="font-wide font-light text-sm leading-snug mt-10 max-w-[320px] text-white/85">Мы знаем, что такое стиль. Тихо и по делу.</p>
            <a href="/#contacts" className="btn-site btn-white mt-8">
              Записаться к стилисту
            </a>
          </div>
          <nav className="flex flex-col gap-3.5">
            <span className="font-wide text-[11px] tracking-[0.18em] uppercase text-[#8f9bd6] mb-1">Навигация</span>
            {NAV.map((l) => <a key={l.label} href={l.href} className="font-wide font-light text-sm text-white/90 hover:text-white w-fit">{l.label}</a>)}
          </nav>
          <div className="flex flex-col gap-3.5">
            <span className="font-wide text-[11px] tracking-[0.18em] uppercase text-[#8f9bd6] mb-1">Связь</span>
            <a href="https://t.me/hustlify" target="_blank" rel="noopener noreferrer" className="font-wide font-light text-sm text-white/90 hover:text-white w-fit">Telegram</a>
            <a href="tel:+79990002026" className="font-wide font-light text-sm text-white/90 hover:text-white w-fit flex items-center gap-2"><Phone className="w-4 h-4" />+7 (999) 000-20-26</a>
          </div>
        </div>
        <div className="mt-14 pt-6 border-t border-white/15 flex flex-col sm:flex-row justify-between gap-2 text-xs text-[#8f9bd6]">
          <span>© 2026 Hustlify. Тихо и по делу. Все права защищены.</span>
          <a href="#" className="hover:text-white transition-colors">Наверх ↑</a>
        </div>
      </div>
    </footer>
  );
}
