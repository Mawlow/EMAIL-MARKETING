import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { admin } from '../../api/client';

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
    <div className="page">
      <h1>Campaign email logs</h1>
      <div className="toolbar">
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="sent">Sent</option>
          <option value="failed">Failed</option>
        </select>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>Recipient</th>
            <th>Status</th>
            <th>Error</th>
            <th>Sent at</th>
          </tr>
        </thead>
        <tbody>
          {logs.data?.map((l) => (
            <tr key={l.id}>
              <td>{l.recipient_email}</td>
              <td>{l.status}</td>
              <td>{l.error_message || '-'}</td>
              <td>{l.sent_at ? new Date(l.sent_at).toLocaleString() : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {logs.meta?.last_page > 1 && (
        <div className="pagination">
          <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
          <span>Page {page} of {logs.meta.last_page}</span>
          <button type="button" disabled={page >= logs.meta.last_page} onClick={() => setPage((p) => p + 1)}>Next</button>
        </div>
      )}
    </div>
  );
}
