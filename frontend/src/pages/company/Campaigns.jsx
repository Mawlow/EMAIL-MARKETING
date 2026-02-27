import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Send as SendIcon, FileText, Pencil, Trash2, RotateCw, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { company } from '../../api/client';
import CampaignForm from './CampaignForm';
import ErrorBoundary from '../../components/ErrorBoundary';

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
  link: {
    color: '#1d4ed8',
    fontWeight: 600,
    textDecoration: 'none'
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
  },
  modalDialog: {
    background: '#ffffff',
    color: '#000000',
    borderRadius: '16px',
    boxShadow: '0 24px 48px -12px rgba(0, 0, 0, 0.25)',
    border: '1px solid #cbd5e1',
    backdropFilter: 'none',
    WebkitBackdropFilter: 'none'
  },
  modalHeader: {
    background: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    padding: '1.25rem 1.5rem',
    color: '#000000'
  },
  modalBody: {
    padding: '1.5rem',
    color: '#000000'
  },
  modalActions: {
    display: 'flex',
    gap: '0.75rem',
    justifyContent: 'flex-end',
    marginTop: '1.5rem',
    paddingTop: '1.25rem',
    borderTop: '1px solid #e2e8f0'
  },
  btnConfirm: {
    background: '#dc2626',
    color: '#fff',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    fontWeight: 600,
    cursor: 'pointer'
  },
  modalBackdrop: {
    background: 'transparent',
    backdropFilter: 'none',
    WebkitBackdropFilter: 'none'
  }
};

export default function CompanyCampaigns() {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState({ data: [], meta: {} });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [editCampaignId, setEditCampaignId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const load = () => {
    const params = { page };
    if (status) params.status = status;
    company.campaigns.list(params).then(({ data }) => setCampaigns(data)).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [page, status]);

  const handleSend = (id) => {
    if (!confirm('Start sending this campaign?')) return;
    company.campaigns.send(id).then(() => load()).catch((err) => alert(err.response?.data?.message || 'Failed to send'));
  };

  const handleDelete = (campaign) => {
    setDeleteConfirm(campaign);
  };

  const executeDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await company.campaigns.delete(deleteConfirm.id);
      setDeleteConfirm(null);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete campaign');
    }
  };

  const handleResend = (id) => {
    if (!confirm('Create a new campaign with the same content and send it now?')) return;
    company.campaigns.resend(id).then(() => load()).catch((err) => alert(err.response?.data?.message || 'Failed to resend'));
  };

  const handleEdit = (id) => {
    setEditCampaignId(id);
  };

  if (loading) return <div className="page-loading">Loading...</div>;

  return (
    <div className="page" style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Campaigns</h1>
        <div className="toolbar" style={{ ...styles.toolbar, justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-primary" onClick={() => setShowNewModal(true)}><Plus size={18} /> New campaign</button>
          <select 
            value={status} 
            onChange={(e) => setStatus(e.target.value)}
            style={{ backgroundColor: '#0f172a', color: '#fff', borderColor: '#0f172a' }}
          >
            <option value="">All statuses</option>
            <option value="draft">Draft</option>
            <option value="sending">Sending</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>
      <table className="table" style={styles.table}>
        <thead>
          <tr>
            <th style={styles.tableHeader}>Name</th>
            <th style={styles.tableHeader}>Subject</th>
            <th style={styles.tableHeader}>Status</th>
            <th style={styles.tableHeader}>Sent / Total</th>
            <th style={styles.tableHeader}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.data?.map((c) => (
            <tr key={c.id}>
              <td style={styles.tableCell}><Link to={`/campaigns/${c.id}`} style={styles.link}>{c.name}</Link></td>
              <td style={styles.tableCell}>{c.subject}</td>
              <td style={styles.tableCell}>
                <span style={{ ...styles.badge, ...styles.getStatusStyle(c.status) }}>
                  {c.status}
                </span>
              </td>
              <td style={styles.tableCell}>{c.sent_count} / {c.total_recipients}</td>
              <td style={styles.tableCell}>
                <button type="button" className="btn-icon" onClick={() => handleEdit(c.id)} title="Edit" style={{ color: '#475569' }}><Pencil size={16} /></button>
                {c.status === 'draft' && <button type="button" className="btn-icon" onClick={() => handleSend(c.id)} title="Send" style={{ color: '#0f172a' }}><SendIcon size={16} /></button>}
                {(c.status === 'completed' || c.status === 'cancelled') && <button type="button" className="btn-icon" onClick={() => handleResend(c.id)} title="Resend" style={{ color: '#0f172a' }}><RotateCw size={16} /></button>}
                <Link to={`/campaigns/${c.id}/logs`} className="btn-icon" title="Logs" style={{ color: '#475569' }}><FileText size={16} /></Link>
                {c.status !== 'sending' && <button type="button" className="btn-icon" onClick={() => handleDelete(c)} title="Delete" style={{ color: '#dc2626' }}><Trash2 size={16} /></button>}
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

      {(showNewModal || editCampaignId) && (
        <div className="modal-backdrop" onClick={() => { setShowNewModal(false); setEditCampaignId(null); }} style={styles.modalBackdrop}>
          <div className="modal-dialog modal-dialog--large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editCampaignId ? 'Edit campaign' : 'New campaign'}</h3>
              <button type="button" className="modal-close" onClick={() => { setShowNewModal(false); setEditCampaignId(null); }} aria-label="Close" style={{ color: '#0f172a' }}><X /></button>
            </div>
            <ErrorBoundary
              fallback={
                <div className="modal-body">
                  <div className="modal-body-loading" style={{ color: '#0f172a' }}>
                    <p style={{ margin: '0 0 1rem' }}>Something went wrong loading the editor.</p>
                    <p style={{ margin: '0 0 1rem', fontSize: '0.875rem' }}>You can close this and try again, or edit campaigns from the list.</p>
                    <button type="button" className="btn btn-primary" onClick={() => { setShowNewModal(false); setEditCampaignId(null); }}>Close</button>
                  </div>
                </div>
              }
              onRetry={() => {}}
            >
              <CampaignForm
                asModal
                editId={editCampaignId}
                onSuccess={() => { setShowNewModal(false); setEditCampaignId(null); load(); }}
                onCancel={() => { setShowNewModal(false); setEditCampaignId(null); }}
              />
            </ErrorBoundary>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="modal-backdrop" onClick={() => setDeleteConfirm(null)} style={styles.modalBackdrop}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ ...styles.modalDialog, maxWidth: '400px' }}>
            <div className="modal-header" style={styles.modalHeader}>
              <h3 style={{ margin: 0, color: '#000' }}>Confirm Deletion</h3>
              <button type="button" className="modal-close" onClick={() => setDeleteConfirm(null)} aria-label="Close" style={{ color: '#0f172a' }}><X /></button>
            </div>
            <div className="modal-body" style={styles.modalBody}>
              <p style={{ margin: 0, color: '#000' }}>Are you sure you want to delete the campaign <strong>"{deleteConfirm.name}"</strong>?</p>
              <p style={{ marginTop: '0.5rem', color: '#dc2626', fontSize: '0.875rem' }}>This action cannot be undone.</p>
              <div style={styles.modalActions}>
                <button type="button" className="btn" onClick={() => setDeleteConfirm(null)} style={{ color: '#000' }}>Cancel</button>
                <button type="button" style={styles.btnConfirm} onClick={executeDelete}>Yes, Delete Campaign</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
