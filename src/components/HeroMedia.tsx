const isVideo = (u: string) => /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(u);

/** Фон hero: картинка или видео (определяется по расширению ссылки) */
export default function HeroMedia({ src, className = '' }: { src: string; className?: string }) {
  if (isVideo(src))
    return <video key={src} src={src} autoPlay muted loop playsInline preload="auto" className={className} />;
  return <img src={src} alt="" className={className} />;
}
