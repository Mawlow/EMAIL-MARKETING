import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Send as SendIcon, FileText, Pencil, Trash2, RotateCw, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { company } from '../../api/client';
import CampaignForm from './CampaignForm';
import ErrorBoundary from '../../components/ErrorBoundary';

export default function CompanyCampaigns() {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState({ data: [], meta: {} });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);

  const load = () => {
    const params = { page };
    if (status) params.status = status;
    company.campaigns.list(params).then(({ data }) => setCampaigns(data)).finally(() => setLoading(false));
  };

  useEffect(() => {
    setLoading(true);
    load();
  }, [page, status]);

  const handleSend = (id) => {
    if (!confirm('Start sending this campaign?')) return;
    company.campaigns.send(id).then(() => load()).catch((err) => alert(err.response?.data?.message || 'Failed to send'));
  };

  const handleDelete = (id, name) => {
    if (!confirm(`Delete campaign "${name}"? This cannot be undone.`)) return;
    company.campaigns.delete(id).then(() => load()).catch((err) => alert(err.response?.data?.message || 'Failed to delete'));
  };

  const handleResend = (id) => {
    if (!confirm('Create a new campaign with the same content and send it now?')) return;
    company.campaigns.resend(id).then(() => load()).catch((err) => alert(err.response?.data?.message || 'Failed to resend'));
  };

  const handleEdit = (id) => {
    navigate(`/campaigns/${id}`);
  };

  if (loading) return <div className="page-loading">Loading...</div>;

  return (
    <div className="page">
      <h1>Campaigns</h1>
      <div className="toolbar">
        <button type="button" className="btn btn-primary" onClick={() => setShowNewModal(true)}><Plus size={18} /> New campaign</button>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="sending">Sending</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Subject</th>
            <th>Status</th>
            <th>Sent / Total</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.data?.map((c) => (
            <tr key={c.id}>
              <td><Link to={`/campaigns/${c.id}`}>{c.name}</Link></td>
              <td>{c.subject}</td>
              <td>{c.status}</td>
              <td>{c.sent_count} / {c.total_recipients}</td>
              <td>
                <button type="button" className="btn-icon" onClick={() => handleEdit(c.id)} title="Edit"><Pencil size={16} /></button>
                {c.status === 'draft' && <button type="button" className="btn-icon" onClick={() => handleSend(c.id)} title="Send"><SendIcon size={16} /></button>}
                {(c.status === 'completed' || c.status === 'cancelled') && <button type="button" className="btn-icon" onClick={() => handleResend(c.id)} title="Resend"><RotateCw size={16} /></button>}
                <Link to={`/campaigns/${c.id}/logs`} className="btn-icon" title="Logs"><FileText size={16} /></Link>
                {c.status !== 'sending' && <button type="button" className="btn-icon" onClick={() => handleDelete(c.id, c.name)} title="Delete"><Trash2 size={16} /></button>}
              </td>
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

      {showNewModal && (
        <div className="modal-backdrop" onClick={() => setShowNewModal(false)}>
          <div className="modal-dialog modal-dialog--large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>New campaign</h3>
              <button type="button" className="modal-close" onClick={() => setShowNewModal(false)} aria-label="Close"><X /></button>
            </div>
            <ErrorBoundary
              fallback={
                <div className="modal-body">
                  <div className="modal-body-loading" style={{ color: '#0f172a' }}>
                    <p style={{ margin: '0 0 1rem' }}>Something went wrong loading the editor.</p>
                    <p style={{ margin: '0 0 1rem', fontSize: '0.875rem' }}>You can close this and try again, or edit campaigns from the list.</p>
                    <button type="button" className="btn btn-primary" onClick={() => setShowNewModal(false)}>Close</button>
                  </div>
                </div>
              }
              onRetry={() => {}}
            >
              <CampaignForm
                asModal
                onSuccess={() => { setShowNewModal(false); load(); }}
                onCancel={() => setShowNewModal(false)}
              />
            </ErrorBoundary>
          </div>
        </div>
      )}
    </div>
  );
}
