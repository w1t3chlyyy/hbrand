import { useEffect, useRef } from 'react';

const isVideo = (u: string) => /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(u);

/** Фон hero: картинка или видео. Видео стартует само, без кнопки запуска. */
export default function HeroMedia({ src, className = '' }: { src: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const video = isVideo(src);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;
    v.defaultMuted = true;
    v.controls = false;
    const play = () => { v.play().catch(() => {}); };
    play();
    const onVis = () => { if (!document.hidden) play(); };
    document.addEventListener('visibilitychange', onVis);
    document.addEventListener('touchstart', play, { once: true });
    document.addEventListener('click', play, { once: true });
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      document.removeEventListener('touchstart', play);
      document.removeEventListener('click', play);
    };
  }, [src]);

  if (video)
    return (
      <video ref={ref} key={src} src={src} autoPlay muted loop playsInline preload="auto" controls={false}
        disablePictureInPicture disableRemotePlayback tabIndex={-1} aria-hidden="true"
        className={`pointer-events-none ${className}`} />
    );
  return <img src={src} alt="" className={className} />;
}
