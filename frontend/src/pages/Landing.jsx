import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';

const HERO_VIDEO = '/hero.mp4';

export default function Landing() {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const play = () => video.play().catch(() => {});
    play();
    video.addEventListener('loadeddata', play);
    return () => video.removeEventListener('loadeddata', play);
  }, []);

  return (
    <div className="landing">
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

      <header className="landing-header">
        <Link to="/" className="landing-logo-link">
          <img src="/logo.svg" alt="FH CRM" className="landing-logo" />
        </Link>
        <nav className="landing-nav">
          <Link to="/login" className="landing-nav-btn">
            <LogIn size={18} /> Get started
          </Link>
        </nav>
      </header>

      <main className="landing-hero">
        <p className="landing-badge">Company use only</p>
        <h1 className="landing-title">
          <span className="landing-title-accent">Email & SMS</span> campaigns
        </h1>
        <p className="landing-subtitle">
          Sign in to access your company account. Manage contacts, send campaigns, and track results.
        </p>
      </main>
    </div>
  );
}
