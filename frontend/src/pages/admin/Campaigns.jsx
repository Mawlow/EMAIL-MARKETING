import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Mail, Building2, Calendar as CalendarIcon, Filter } from 'lucide-react';
import { admin } from '../../api/client';

export default function AdminCampaigns() {
  const [campaigns, setCampaigns] = useState({ data: [], meta: {} });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const params = { page };
    if (status) params.status = status;
    admin.campaigns.list(params).then(({ data }) => {
      setCampaigns(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [page, status]);

  if (loading) return <div className="page-loading">Loading...</div>;

  return (
    <div className="page page-campaigns-override">
      <style>{`
        .page-campaigns-override {
          background: #fff !important;
          color: #0f172a !important;
          border: 1px solid #e2e8f0 !important;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08) !important;
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
          padding: 1.5rem !important;
        }

        .groups-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .groups-title {
          margin: 0 !important;
          font-size: 2.25rem !important;
          font-weight: 800 !important;
          color: #0f172a !important;
          letter-spacing: -0.025em !important;
        }

        .toolbar-custom {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 1.5rem;
            background: #f8fafc;
            padding: 1rem;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
        }

        .select-custom {
            padding: 0.6rem 1rem;
            border: 1.5px solid #e2e8f0;
            border-radius: 8px;
            background: #fff;
            color: #0f172a;
            font-size: 0.9rem;
            cursor: pointer;
            min-width: 200px;
            transition: all 0.2s;
        }
        .select-custom:focus {
            border-color: #2b52a5;
            outline: none;
            box-shadow: 0 0 0 3px rgba(43, 82, 165, 0.1);
        }

        .table-custom {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
        }

        .table-custom th {
          background: #2b52a5 !important;
          padding: 1.25rem 1rem;
          text-align: left;
          font-size: 0.875rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #fff !important;
          border-bottom: none;
        }

        .table-custom td {
          padding: 1.25rem 1rem;
          border-bottom: 1px solid #e2e8f0;
          color: #0f172a !important;
          font-weight: 500;
        }

        .table-custom tr:last-child td {
          border-bottom: none;
        }

        .table-custom tr:hover td {
          background: #f8fafc;
        }

        .campaign-name-cell {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-weight: 600 !important;
        }

        .campaign-link {
            color: #2b52a5;
            text-decoration: none;
            transition: color 0.2s;
        }
        .campaign-link:hover {
            color: #1e40af;
            text-decoration: underline;
        }

        .status-badge {
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            display: inline-block;
        }
        .status-draft { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; }
        .status-sending { background: #dbeafe; color: #1e40af; border: 1px solid #bfdbfe; }
        .status-completed { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
        .status-cancelled { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }

        .pagination-container {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 1rem;
            margin-top: 2rem;
        }
        .pagination-btn {
            background: #fff;
            border: 1.5px solid #e2e8f0;
            color: #64748b;
            padding: 0.5rem 1rem;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        .pagination-btn:hover:not(:disabled) {
            border-color: #cbd5e1;
            color: #0f172a;
        }
        .pagination-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        .pagination-info {
            color: #64748b;
            font-weight: 500;
            font-size: 0.9rem;
        }
      `}</style>

      <div className="groups-header">
        <h1 className="groups-title">All Campaigns</h1>
      </div>

      <div className="toolbar-custom">
        <Filter size={20} color="#64748b" />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="select-custom">
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="sending">Sending</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {campaigns.data?.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#f8fafc', borderRadius: '16px', border: '2px dashed #e2e8f0' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#eff6ff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <Mail size={40} color="#2b52a5" />
          </div>
          <h3 style={{ color: '#0f172a', margin: '0 0 0.5rem 0', fontWeight: 800, fontSize: '1.25rem' }}>No campaigns found</h3>
          <p className="muted" style={{ fontWeight: 500, margin: 0, fontSize: '1rem', color: '#64748b' }}>
            {status ? `There are no campaigns currently in "${status}" status.` : 'No campaigns have been created on the platform yet.'}
          </p>
        </div>
      ) : (
        <>
          <table className="table-custom">
            <thead>
              <tr>
                <th>Name</th>
                <th>Company</th>
                <th>Status</th>
                <th>Sent / Total</th>
                <th>Completed</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.data?.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div className="campaign-name-cell">
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eff6ff', color: '#2b52a5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Mail size={16} />
                        </div>
                        <Link to={`/admin/campaigns/${c.id}`} className="campaign-link">{c.name}</Link>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569' }}>
                        <Building2 size={16} />
                        {c.company?.name}
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge status-${c.status}`}>
                        {c.status}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.95rem' }}>{c.sent_count} / {c.total_recipients}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.9rem' }}>
                        <CalendarIcon size={14} />
                        {c.completed_at ? new Date(c.completed_at).toLocaleString() : '-'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {campaigns.meta?.last_page > 1 && (
            <div className="pagination-container">
              <button type="button" className="pagination-btn" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft size={16} /> Previous</button>
              <span className="pagination-info">Page {page} of {campaigns.meta.last_page}</span>
              <button type="button" className="pagination-btn" disabled={page >= campaigns.meta.last_page} onClick={() => setPage((p) => p + 1)}>Next <ChevronRight size={16} /></button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
