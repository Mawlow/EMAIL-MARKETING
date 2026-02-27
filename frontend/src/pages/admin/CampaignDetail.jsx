import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { admin } from '../../api/client';
import { ArrowLeft, Building2, Calendar, Mail, FileText, CheckCircle, AlertCircle, Clock, List } from 'lucide-react';

export default function AdminCampaignDetail() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    admin.campaigns.get(id).then(({ data }) => {
      setCampaign(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="page-loading">Loading...</div>;
  if (!campaign) return <div className="page">Campaign not found.</div>;

  return (
    <div className="page page-detail-override">
      <style>{`
        .page-detail-override {
          background: #fff !important;
          color: #0f172a !important;
          border: 1px solid #e2e8f0 !important;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08) !important;
          padding: 2rem !important;
        }

        .detail-header {
          margin-bottom: 2rem;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 1.5rem;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: #64748b;
          text-decoration: none;
          font-weight: 600;
          font-size: 0.9rem;
          margin-bottom: 1rem;
          transition: color 0.2s;
        }
        .back-link:hover {
          color: #2b52a5;
        }

        .campaign-title {
          font-size: 2rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 0.5rem 0;
          letter-spacing: -0.025em;
        }

        .campaign-meta {
          display: flex;
          gap: 1.5rem;
          color: #64748b;
          font-size: 0.95rem;
          font-weight: 500;
        }
        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2.5rem;
        }

        .stat-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .stat-label {
          font-size: 0.85rem;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .stat-value {
          font-size: 1.75rem;
          font-weight: 800;
          color: #0f172a;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .info-section h3 {
          font-size: 1.1rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 0.75rem 0;
          border-bottom: 1px solid #f1f5f9;
        }
        .info-row:last-child { border-bottom: none; }
        
        .info-label { color: #64748b; font-weight: 500; }
        .info-value { color: #0f172a; font-weight: 600; text-align: right; }

        .btn-primary {
          background: #2b52a5;
          color: #fff;
          padding: 0.75rem 1.5rem;
          border-radius: 10px;
          font-weight: 600;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          transition: background 0.2s;
          border: none;
          cursor: pointer;
        }
        .btn-primary:hover {
          background: #1e40af;
        }
      `}</style>

      <div className="detail-header">
        <Link to="/admin/campaigns" className="back-link"><ArrowLeft size={16} /> Back to campaigns</Link>
        <h1 className="campaign-title">{campaign.name}</h1>
        <div className="campaign-meta">
          <span className="meta-item"><Building2 size={16} /> {campaign.company?.name}</span>
          <span className="meta-item"><Mail size={16} /> {campaign.subject}</span>
          <span className={`meta-item status-${campaign.status}`} style={{ textTransform: 'capitalize', color: campaign.status === 'completed' ? '#166534' : '#2b52a5', fontWeight: 700 }}>
            {campaign.status}
          </span>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Total Recipients</span>
          <span className="stat-value">{campaign.total_recipients}</span>
        </div>
        <div className="stat-card" style={{ background: '#ecfdf5', borderColor: '#bbf7d0' }}>
          <span className="stat-label" style={{ color: '#166534' }}>Sent</span>
          <span className="stat-value" style={{ color: '#14532d' }}>{campaign.sent_count}</span>
        </div>
        <div className="stat-card" style={{ background: '#fff1f2', borderColor: '#fecaca' }}>
          <span className="stat-label" style={{ color: '#991b1b' }}>Failed</span>
          <span className="stat-value" style={{ color: '#7f1d1d' }}>{campaign.failed_count}</span>
        </div>
        <div className="stat-card" style={{ background: '#eff6ff', borderColor: '#bfdbfe' }}>
          <span className="stat-label" style={{ color: '#1e40af' }}>Pending</span>
          <span className="stat-value" style={{ color: '#1e3a8a' }}>{campaign.pending_count}</span>
        </div>
      </div>

      <div className="info-grid">
        <div className="info-section">
          <h3><Clock size={20} className="text-gray-400" /> Timing</h3>
          <div className="info-row">
            <span className="info-label">Created At</span>
            <span className="info-value">{new Date(campaign.created_at).toLocaleString()}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Started At</span>
            <span className="info-value">{campaign.started_at ? new Date(campaign.started_at).toLocaleString() : '-'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Completed At</span>
            <span className="info-value">{campaign.completed_at ? new Date(campaign.completed_at).toLocaleString() : '-'}</span>
          </div>
        </div>

        <div className="info-section">
            <h3><FileText size={20} className="text-gray-400" /> Actions</h3>
            <p style={{ color: '#64748b', marginBottom: '1rem', lineHeight: 1.6 }}>
                View detailed logs for every email sent in this campaign, including status, timestamps, and error messages.
            </p>
            <Link to={`/admin/campaigns/${id}/logs`} className="btn-primary">
                <List size={18} /> View Email Logs
            </Link>
        </div>
      </div>
    </div>
  );
}
