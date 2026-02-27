import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { admin } from '../../api/client';
import { ArrowLeft, Filter, AlertCircle, CheckCircle, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

export default function AdminCampaignLogs() {
  const { id } = useParams();
  const [logs, setLogs] = useState({ data: [], meta: {} });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const params = { page };
    if (status) params.status = status;
    admin.campaigns.logs(id, params).then(({ data }) => {
      setLogs(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id, page, status]);

  if (loading) return <div className="page-loading">Loading...</div>;

  return (
    <div className="page page-logs-override">
      <style>{`
        .page-logs-override {
          background: #fff !important;
          color: #0f172a !important;
          border: 1px solid #e2e8f0 !important;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08) !important;
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
          padding: 1.5rem !important;
        }

        .logs-header {
          margin-bottom: 1.5rem;
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

        .logs-title {
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
          padding: 1rem;
          border-bottom: 1px solid #e2e8f0;
          color: #0f172a !important;
          font-weight: 500;
          font-size: 0.95rem;
        }

        .table-custom tr:last-child td {
          border-bottom: none;
        }

        .table-custom tr:hover td {
          background: #f8fafc;
        }

        .log-status { 
            font-weight: 700; 
            text-transform: uppercase; 
            font-size: 0.75rem; 
            letter-spacing: 0.05em; 
            padding: 0.35rem 0.75rem; 
            border-radius: 9999px; 
            display: inline-flex; 
            align-items: center; 
            gap: 0.4rem; 
        }
        .log-sent { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
        .log-failed { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }
        .log-pending { background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; }

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

      <div className="logs-header">
        <Link to={`/admin/campaigns/${id}`} className="back-link"><ArrowLeft size={16} /> Back to campaign</Link>
        <h1 className="logs-title">Email Logs</h1>
      </div>

      <div className="toolbar-custom">
        <Filter size={20} color="#64748b" />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="select-custom">
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="sent">Sent</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      <table className="table-custom">
        <thead>
          <tr>
            <th>Recipient</th>
            <th>Status</th>
            <th>Error Message</th>
            <th>Sent At</th>
          </tr>
        </thead>
        <tbody>
          {logs.data?.map((l) => (
            <tr key={l.id}>
              <td style={{ fontFamily: 'monospace' }}>{l.recipient_email}</td>
              <td>
                <span className={`log-status log-${l.status}`}>
                    {l.status === 'sent' && <CheckCircle size={12} />}
                    {l.status === 'failed' && <AlertCircle size={12} />}
                    {l.status === 'pending' && <Clock size={12} />}
                    {l.status}
                </span>
              </td>
              <td style={{ color: l.error_message ? '#ef4444' : '#94a3b8', fontStyle: l.error_message ? 'normal' : 'italic' }}>
                {l.error_message || 'No error'}
              </td>
              <td style={{ color: '#64748b' }}>{l.sent_at ? new Date(l.sent_at).toLocaleString() : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {logs.meta?.last_page > 1 && (
        <div className="pagination-container">
          <button type="button" className="pagination-btn" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft size={16} /> Previous</button>
          <span className="pagination-info">Page {page} of {logs.meta.last_page}</span>
          <button type="button" className="pagination-btn" disabled={page >= logs.meta.last_page} onClick={() => setPage((p) => p + 1)}>Next <ChevronRight size={16} /></button>
        </div>
      )}
    </div>
  );
}
