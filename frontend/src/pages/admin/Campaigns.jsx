import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
    <div className="page">
      <h1>All Campaigns</h1>
      <div className="toolbar">
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="sending">Sending</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      <table className="table">
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
              <td><Link to={`/admin/campaigns/${c.id}`}>{c.name}</Link></td>
              <td>{c.company?.name}</td>
              <td>{c.status}</td>
              <td>{c.sent_count} / {c.total_recipients}</td>
              <td>{c.completed_at ? new Date(c.completed_at).toLocaleString() : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {campaigns.meta?.last_page > 1 && (
        <div className="pagination">
          <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft size={16} /> Previous</button>
          <span>Page {page} of {campaigns.meta.last_page}</span>
          <button type="button" disabled={page >= campaigns.meta.last_page} onClick={() => setPage((p) => p + 1)}>Next <ChevronRight size={16} /></button>
        </div>
      )}
    </div>
  );
}
