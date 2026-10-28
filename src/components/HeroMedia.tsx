import { useEffect, useRef, useState } from 'react';

const isVideo = (u: string) => /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(u);

/**
 * Фон hero: картинка или видео. Видео стартует само.
 * Пока оно не играет (например, iOS блокирует автозапуск), сверху лежит постер,
 * поэтому системной кнопки запуска не видно.
 */
export default function HeroMedia({ src, poster, className = '' }: { src: string; poster?: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const video = isVideo(src);

  useEffect(() => {
    setPlaying(false);
    const v = ref.current;
    if (!v) return;
    v.muted = true;
    v.defaultMuted = true;
    v.controls = false;
    const play = () => { v.play().catch(() => {}); };
    const onPause = () => { if (!document.hidden) play(); };
    const onVis = () => { if (!document.hidden) play(); };
    play();
    v.addEventListener('canplay', play);
    v.addEventListener('pause', onPause);
    document.addEventListener('visibilitychange', onVis);
    document.addEventListener('touchstart', play, { once: true });
    document.addEventListener('click', play, { once: true });
    return () => {
      v.removeEventListener('canplay', play);
      v.removeEventListener('pause', onPause);
      document.removeEventListener('visibilitychange', onVis);
      document.removeEventListener('touchstart', play);
      document.removeEventListener('click', play);
    };
  }, [src]);

  if (!video) return <img src={src} alt="" className={className} />;
  return (
    <>
      <video ref={ref} key={src} src={src} autoPlay muted loop playsInline preload="auto" controls={false}
        onPlaying={() => setPlaying(true)} disablePictureInPicture disableRemotePlayback tabIndex={-1} aria-hidden="true"
        className={`pointer-events-none ${className}`} />
      {!playing && (
        <div aria-hidden="true" className={`pointer-events-none bg-cover bg-center bg-black ${className}`}
          style={poster ? { backgroundImage: `url(${poster})` } : undefined} />
      )}
    </>
  );
}
