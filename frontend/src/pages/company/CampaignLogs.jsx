import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { company } from '../../api/client';

const styles = {
  page: {
    background: '#ffffff',
    color: '#000000',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)',
    padding: '1.75rem',
    borderRadius: '12px'
  },
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
  table: {
    color: '#000000'
  },
  tableHeader: {
    color: '#1e293b',
    borderBottom: '2px solid #94a3b8'
  },
  tableCell: {
    borderBottom: '1px solid #cbd5e1',
    color: '#000000'
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
        return { background: '#2b52a5', color: '#fff' };
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
    <div className="page" style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Campaign email logs</h1>
        <div className="toolbar" style={{ ...styles.toolbar, justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/campaigns')}>
            <ArrowLeft size={18} /> Back to campaigns
          </button>
          <select 
            value={status} 
            onChange={(e) => setStatus(e.target.value)}
            style={{ backgroundColor: '#2b52a5', color: '#fff', borderColor: '#2b52a5' }}
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="sent">Sent</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>
      
      <table className="table" style={styles.table}>
        <thead>
          <tr>
            <th style={styles.tableHeader}>Recipient</th>
            <th style={styles.tableHeader}>Status</th>
            <th style={styles.tableHeader}>Opened</th>
            <th style={styles.tableHeader}>Error</th>
            <th style={styles.tableHeader}>Sent at</th>
          </tr>
        </thead>
        <tbody>
          {logs.data?.map((l) => (
            <tr key={l.id}>
              <td style={styles.tableCell}>{l.recipient_email}</td>
              <td style={styles.tableCell}>
                <span style={{ ...styles.badge, ...styles.getStatusStyle(l.status) }}>
                  {l.status}
                </span>
              </td>
              <td style={styles.tableCell}>
                {l.opened_at ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ ...styles.badge, background: '#10b981', color: '#fff' }}>
                      Opened
                    </span>
                    <span style={{ fontSize: '0.85rem' }}>
                      {new Date(l.opened_at).toLocaleString()}
                    </span>
                  </div>
                ) : '—'}
              </td>
              <td style={styles.tableCell}>{l.error_message || '—'}</td>
              <td style={styles.tableCell}>{l.sent_at ? new Date(l.sent_at).toLocaleString() : '—'}</td>
            </tr>
          ))}
          {logs.data?.length === 0 && (
            <tr>
              <td colSpan="5" style={{ ...styles.tableCell, textAlign: 'center', padding: '2rem' }}>
                No logs found for this campaign.
              </td>
            </tr>
          )}
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
