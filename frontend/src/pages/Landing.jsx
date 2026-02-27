import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LogIn, ArrowRight, Mail, MessageSquare, Zap, BarChart3, Users, ShieldCheck } from 'lucide-react';

const HERO_VIDEO = '/landing.mp4';

export default function Landing() {
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
    <div className="landing-new">
      <header className="landing-header">
        <Link to="/" className="landing-logo-link">
          <img src="/logo1.png" alt="FH CRM" className="landing-logo" />
        </Link>
        <nav className="landing-nav">
          <Link to="/login" className="landing-nav-btn">
            <LogIn size={18} /> Sign In
          </Link>
        </nav>
      </header>

      <main>
        {/* Hero Section - Full Page */}
        <section className="landing-hero-full">
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
          
          <div className="hero-content">
            <p className="hero-badge">Company Use Only</p>
            <h1 className="hero-title">
              <span className="text-gradient">Email</span> & <span className="text-gradient">SMS</span><br />
              Campaigns
            </h1>
            <p className="hero-subtitle">
              Sign in to access your company account. Manage contacts, send campaigns, and track results
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
