import { useState, useEffect } from 'react';
import { admin } from '../../api/client';
import { BarChart3, Send, AlertCircle, CheckCircle, Calendar as CalendarIcon, Building2 } from 'lucide-react';

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    admin.analytics().then(({ data: d }) => {
      setData(d);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading">Loading...</div>;
  if (!data) return null;

  return (
    <div className="page page-analytics-override">
      <style>{`
        .page-analytics-override {
          background: #fff !important;
          color: #0f172a !important;
          border: 1px solid #e2e8f0 !important;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08) !important;
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
          padding: 1.5rem !important;
        }

        .analytics-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e2e8f0;
        }

        .analytics-title {
          margin: 0 !important;
          font-size: 2.25rem !important;
          font-weight: 800 !important;
          color: #0f172a !important;
          letter-spacing: -0.025em !important;
        }

        .period-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #eff6ff;
          color: #2b52a5 !important;
          padding: 0.5rem 1rem;
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: 600;
          border: 1px solid #dbeafe;
        }

        .stats-grid-custom {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card-custom {
          background: #fff;
          border-radius: 16px;
          padding: 1.5rem;
          border: 2px solid #94a3b8;
          transition: all 0.2s;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          position: relative;
          overflow: hidden;
        }

        .stat-card-custom:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          border-color: #64748b;
        }

        .stat-icon-wrapper {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0.5rem;
        }

        .stat-label-custom {
          font-size: 0.9375rem;
          font-weight: 700;
          color: #475569 !important;
          margin: 0;
        }

        .stat-value-custom {
          font-size: 2.25rem;
          font-weight: 900;
          color: #0f172a !important;
          margin: 0;
          letter-spacing: -0.025em;
        }

        .stat-accent-bar {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
        }
      `}</style>

      <div className="analytics-header">
        <h1 className="analytics-title">Platform Analytics</h1>
        <div className="period-badge">
          <CalendarIcon size={16} />
          {data.period?.from} — {data.period?.to}
        </div>
      </div>

      <div className="stats-grid-custom">
        <div className="stat-card-custom">
          <div className="stat-accent-bar" style={{ background: '#8b5cf6' }}></div>
          <div className="stat-icon-wrapper" style={{ background: '#f5f3ff', color: '#8b5cf6' }}>
            <Building2 size={24} />
          </div>
          <div>
            <h3 className="stat-label-custom">Companies</h3>
            <p className="stat-value-custom">{data.companies_count}</p>
          </div>
        </div>

        <div className="stat-card-custom">
          <div className="stat-accent-bar" style={{ background: '#2b52a5' }}></div>
          <div className="stat-icon-wrapper" style={{ background: '#eff6ff', color: '#2b52a5' }}>
            <BarChart3 size={24} />
          </div>
          <div>
            <h3 className="stat-label-custom">Total Campaigns</h3>
            <p className="stat-value-custom">{data.total_campaigns}</p>
          </div>
        </div>

        <div className="stat-card-custom">
          <div className="stat-accent-bar" style={{ background: '#10b981' }}></div>
          <div className="stat-icon-wrapper" style={{ background: '#ecfdf5', color: '#10b981' }}>
            <Send size={24} />
          </div>
          <div>
            <h3 className="stat-label-custom">Emails Sent</h3>
            <p className="stat-value-custom">{data.total_emails_sent}</p>
          </div>
        </div>

        <div className="stat-card-custom">
          <div className="stat-accent-bar" style={{ background: '#e4002b' }}></div>
          <div className="stat-icon-wrapper" style={{ background: '#fff1f2', color: '#e4002b' }}>
            <AlertCircle size={24} />
          </div>
          <div>
            <h3 className="stat-label-custom">Emails Failed</h3>
            <p className="stat-value-custom">{data.total_emails_failed}</p>
          </div>
        </div>

        <div className="stat-card-custom">
          <div className="stat-accent-bar" style={{ background: '#f59e0b' }}></div>
          <div className="stat-icon-wrapper" style={{ background: '#fffbeb', color: '#f59e0b' }}>
            <CheckCircle size={24} />
          </div>
          <div>
            <h3 className="stat-label-custom">Completed Campaigns</h3>
            <p className="stat-value-custom">{data.completed_campaigns}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
