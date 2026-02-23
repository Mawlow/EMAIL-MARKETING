import { useRef, useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Mail, Users, Send, BarChart3, Building2, Calendar, LogOut, FolderOpen, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const HERO_VIDEO = '/hero.mp4';
const navClass = ({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link');

export default function Layout() {
  const videoRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const play = () => video.play().catch(() => {});
    play();
    video.addEventListener('loadeddata', play);
    return () => video.removeEventListener('loadeddata', play);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout-wrap">
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
      <div className="layout">
      <button type="button" className="sidebar-toggle" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
        <Menu size={24} />
      </button>
      <div className={`sidebar-overlay ${sidebarOpen ? 'sidebar-overlay--open' : ''}`} onClick={() => setSidebarOpen(false)} aria-hidden />
      <aside className={`sidebar ${sidebarOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar-brand">
          <Link to="/" onClick={() => setSidebarOpen(false)}>
            <img src="/logo.svg" alt="FH CRM" className="sidebar-logo" />
          </Link>
          <button type="button" className="sidebar-close" onClick={() => setSidebarOpen(false)} aria-label="Close menu">
            <X size={22} />
          </button>
        </div>
        <nav className="sidebar-nav" onClick={() => setSidebarOpen(false)}>
          {isAdmin ? (
            <>
              <NavLink to="/admin/companies" className={navClass}><Building2 /> Companies</NavLink>
              <NavLink to="/admin/campaigns" className={navClass}><Mail /> Campaigns</NavLink>
              <NavLink to="/admin/analytics" className={navClass}><BarChart3 /> Analytics</NavLink>
            </>
          ) : (
            <>
              <NavLink to="/campaigns" className={navClass}><Mail /> Campaigns</NavLink>
              <NavLink to="/contacts" className={navClass}><Users /> Contacts</NavLink>
              <NavLink to="/contact-groups" className={navClass}><FolderOpen /> Contact groups</NavLink>
              <NavLink to="/senders" className={navClass}><Send /> Senders</NavLink>
              <NavLink to="/calendar" className={navClass}><Calendar /> Calendar</NavLink>
              <NavLink to="/analytics" className={navClass}><BarChart3 /> Analytics</NavLink>
            </>
          )}
        </nav>
        <div className="sidebar-footer">
          <span className="sidebar-user">{user?.name}</span>
          <span className="sidebar-role">{user?.role}</span>
          <button type="button" onClick={() => { handleLogout(); setSidebarOpen(false); }} className="btn-logout"><LogOut /> Logout</button>
        </div>
      </aside>
      <main className="layout-main" onClick={() => setSidebarOpen(false)}>
        <Outlet />
      </main>
      </div>
    </div>
  );
}
