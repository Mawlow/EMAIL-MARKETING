import { useRef, useEffect } from 'react';

const HERO_VIDEO = '/landing.mp4';

export default function AuthLayout({ children }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = 0.5;
    const play = () => video.play().catch(() => {});
    play();
    video.addEventListener('loadeddata', play);
    return () => video.removeEventListener('loadeddata', play);
  }, []);

  return (
    <div className="auth-page">
      <div className="landing-video-wrap">
        <video
          ref={videoRef}
          className="landing-video"
          src={HERO_VIDEO}
          autoPlay
          muted
          loop
          playsInline
          aria-hidden
        />
        <div className="landing-video-overlay" aria-hidden />
      </div>
      <div className="auth-page-inner">
        {children}
      </div>
    </div>
  );
}
