import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { company } from '../../api/client';

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.25rem'
  },
  title: {
    margin: 0,
    color: '#000',
    fontWeight: 700
  },
  toolbar: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'center',
    margin: 0
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.2rem 0.6rem',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.025em',
  },
  getStatusStyle: (status) => {
    switch (status) {
      case 'sent':
      case 'completed':
      case 'active':
        return { background: '#0f172a', color: '#fff' };
      case 'pending':
      case 'draft':
        return { background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0' };
      case 'failed':
      case 'cancelled':
        return { background: '#fee2e2', color: '#b91c1c' };
      default:
        return { background: '#e2e8f0', color: '#475569' };
    }
  }
};

export default function CampaignLogs() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [logs, setLogs] = useState({ data: [], meta: {} });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const params = { page };
    if (status) params.status = status;
    company.campaigns.logs(id, params).then(({ data }) => {
      setLogs(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id, page, status]);

  if (loading) return <div className="page-loading">Loading...</div>;

  return (
    <div className="page">
      <div style={styles.header}>
        <h1 style={styles.title}>Campaign email logs</h1>
        <div className="toolbar" style={styles.toolbar}>
          <button type="button" className="btn btn-primary" onClick={() => navigate('/campaigns')}>
            <Plus size={18} /> New campaign
          </button>
          <select 
            value={status} 
            onChange={(e) => setStatus(e.target.value)}
            style={{ backgroundColor: '#0f172a', color: '#fff', borderColor: '#0f172a' }}
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="sent">Sent</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>Recipient</th>
            <th>Status</th>
            <th>Opened</th>
            <th>Error</th>
            <th>Sent at</th>
          </tr>
        </thead>
        <tbody>
          {logs.data?.map((l) => (
            <tr key={l.id}>
              <td>{l.recipient_email}</td>
              <td>
                <span style={{ ...styles.badge, ...styles.getStatusStyle(l.status) }}>
                  {l.status}
                </span>
              </td>
              <td>{l.opened_at ? new Date(l.opened_at).toLocaleString() : '—'}</td>
              <td>{l.error_message || '—'}</td>
              <td>{l.sent_at ? new Date(l.sent_at).toLocaleString() : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {logs.meta?.last_page > 1 && (
        <div className="pagination">
          <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft size={16} /> Previous</button>
          <span>Page {page} of {logs.meta.last_page}</span>
          <button type="button" disabled={page >= logs.meta.last_page} onClick={() => setPage((p) => p + 1)}>Next <ChevronRight size={16} /></button>
        </div>
      )}
    </div>
  );
}
