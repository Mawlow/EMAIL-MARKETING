import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { company } from '../../api/client';

const defaultForm = {
  name: '',
  from_email: '',
  from_name: '',
  password: '',
  host: 'smtp.gmail.com',
  port: 587,
  encryption: 'null',
  username: '',
  is_active: true,
};

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
  getStatusStyle: (isActive) => {
    return isActive 
      ? { background: 'transparent', color: '#4ade80', border: '1px solid #4ade80' }
      : { background: 'transparent', color: '#64748b', border: '1px solid #cbd5e1' };
  },
  modalDialog: {
    background: '#ffffff',
    color: '#000000',
    borderRadius: '16px',
    boxShadow: '0 24px 48px -12px rgba(0, 0, 0, 0.25)',
    border: '1px solid #cbd5e1'
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
  label: {
    display: 'block',
    marginBottom: '1rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#000',
  },
  input: {
    background: '#ffffff',
    color: '#000000',
    borderColor: '#cbd5e1',
    width: '100%',
    maxWidth: 'none',
    padding: '0.6rem 0.875rem',
    borderRadius: '8px',
    marginTop: '0.35rem',
    fontSize: '0.9375rem',
    border: '1px solid #cbd5e1',
    boxSizing: 'border-box'
  },
  modalRow: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1.125rem'
  },
  hostField: {
    width: 'calc(75% - 0.5rem)',
    display: 'block'
  },
  portField: {
    width: 'calc(25% - 0.5rem)',
    display: 'block'
  },
  actionBtn: {
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    padding: '4px',
    marginRight: '8px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
    cursor: 'pointer'
  },
  modalBackdrop: {
    background: 'transparent',
    backdropFilter: 'none',
    WebkitBackdropFilter: 'none'
  }
};

export default function Senders() {
  const [senders, setSenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(defaultForm);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const load = () => {
    company.senderAccounts.list().then(({ data }) => {
      setSenders(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: form.name,
        from_email: form.from_email,
        from_name: form.from_name || null,
        host: form.host,
        port: Number(form.port),
        encryption: form.encryption === 'null' ? null : form.encryption,
        username: form.username || null,
        is_active: form.is_active,
      };
      if (editing) {
        if (form.password) payload.password = form.password;
        await company.senderAccounts.update(editing.id, payload);
      } else {
        payload.password = form.password;
        await company.senderAccounts.create(payload);
      }
      setShowForm(false);
      setEditing(null);
      setForm(defaultForm);
      load();
    } catch (err) {
      const msg = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join(' ')
        : err.response?.data?.message || 'Failed to save';
      alert(msg);
    }
  };

  const openNew = () => {
    setEditing(null);
    setForm({ ...defaultForm });
    setShowForm(true);
  };

  const handleEdit = (s) => {
    setEditing(s);
    setForm({
      name: s.name || '',
      from_email: s.from_email || '',
      from_name: s.from_name || '',
      password: '',
      host: s.host || 'smtp.gmail.com',
      port: s.port ?? 587,
      encryption: s.encryption === null || s.encryption === '' ? 'null' : s.encryption,
      username: s.username || '',
      is_active: !!s.is_active,
    });
    setShowForm(true);
  };

  const handleDelete = (s) => {
    setDeleteConfirm(s);
  };

  const executeDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await company.senderAccounts.delete(deleteConfirm.id);
      setDeleteConfirm(null);
      load();
    } catch (err) {
      alert('Failed to delete sender');
    }
  };

  const closeModal = () => {
    setShowForm(false);
    setEditing(null);
    setForm(defaultForm);
  };

  if (loading) return <div className="page-loading">Loading...</div>;

  return (
    <div className="page" style={styles.page}>
      <style>{`
        .action-btn-edit:hover {
          background-color: #f1f5f9 !important;
          border-color: #94a3b8 !important;
          color: #0f172a !important;
        }
        .action-btn-delete:hover {
          background-color: #fef2f2 !important;
          border-color: #ef4444 !important;
          color: #dc2626 !important;
        }
        .modal-body .form input,
        .modal-body .form select {
          width: 100% !important;
          max-width: 100% !important;
          box-sizing: border-box !important;
        }
      `}</style>
      <div style={styles.header}>
        <h1 style={styles.title}>Senders</h1>
        <div className="toolbar" style={styles.toolbar}>
          <button type="button" className="btn btn-primary" onClick={openNew} style={{ background: '#0f172a', border: '1px solid #0f172a', color: '#fff', fontWeight: 600, padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
            + Add sender
          </button>
        </div>
      </div>
      {showForm && (
        <div className="modal-backdrop" onClick={closeModal} style={styles.modalBackdrop}>
          <div className="modal-dialog modal-dialog--medium" onClick={(e) => e.stopPropagation()} style={styles.modalDialog}>
            <div className="modal-header" style={styles.modalHeader}>
              <h3 style={{ margin: 0, color: '#000' }}>{editing ? 'Edit sender' : 'Add sender'}</h3>
              <button type="button" className="modal-close" onClick={closeModal} aria-label="Close" style={{ color: '#0f172a' }}><X /></button>
            </div>
            <form onSubmit={handleSubmit} className="form modal-body" style={styles.modalBody}>
              <label style={styles.label}>Full Name <input style={styles.input} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. John Doe" required /></label>
              <label style={styles.label}>Email <input style={styles.input} type="email" value={form.from_email} onChange={(e) => setForm((f) => ({ ...f, from_email: e.target.value }))} required /></label>
              <label style={styles.label}>Password <input style={styles.input} type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder="App password" required={!editing} /></label>
              <div style={styles.modalRow}>
                <label style={{ ...styles.label, ...styles.hostField }}>Host <input style={styles.input} value={form.host} onChange={(e) => setForm((f) => ({ ...f, host: e.target.value }))} placeholder="smtp.gmail.com" required /></label>
                <label style={{ ...styles.label, ...styles.portField }}>Port <input style={styles.input} type="number" min={1} max={65535} value={form.port} onChange={(e) => setForm((f) => ({ ...f, port: parseInt(e.target.value, 10) || 587 }))} /></label>
              </div>
              <label style={styles.label}>Encryption <select style={styles.input} value={form.encryption} onChange={(e) => setForm((f) => ({ ...f, encryption: e.target.value }))}>
                <option value="null">None</option>
                <option value="tls">TLS</option>
                <option value="ssl">SSL</option>
              </select></label>
              <label style={styles.label}>Status <select style={styles.input} value={form.is_active ? 'active' : 'inactive'} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.value === 'active' }))}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select></label>
              <div className="form-actions modal-actions">
                <button type="submit" style={{ background: 'transparent', border: '1px solid #0f172a', color: '#0f172a' }}>Save</button>
                <button type="button" onClick={closeModal} style={{ color: '#000' }}>Cancel</button>
              </div>
            </form>
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
              <p style={{ margin: 0, color: '#000' }}>Are you sure you want to delete the sender <strong>"{deleteConfirm.name}"</strong>?</p>
              <p style={{ marginTop: '0.5rem', color: '#dc2626', fontSize: '0.875rem' }}>This action cannot be undone.</p>
              <div style={styles.modalActions}>
                <button type="button" className="btn" onClick={() => setDeleteConfirm(null)} style={{ color: '#000' }}>Cancel</button>
                <button type="button" style={styles.btnConfirm} onClick={executeDelete}>Yes, Delete Sender</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <table className="table" style={styles.table}>
        <thead>
          <tr>
            <th style={styles.tableHeader}>Name</th>
            <th style={styles.tableHeader}>Email</th>
            <th style={styles.tableHeader}>Host</th>
            <th style={styles.tableHeader}>Status</th>
            <th style={styles.tableHeader}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {senders.map((s) => (
            <tr key={s.id}>
              <td style={styles.tableCell}>{s.name}</td>
              <td style={styles.tableCell}>{s.from_email || '—'}</td>
              <td style={styles.tableCell}>{s.host ? `${s.host}:${s.port ?? 587}` : '—'}</td>
              <td style={styles.tableCell}>
                <span style={{ ...styles.badge, ...styles.getStatusStyle(s.is_active) }}>
                  {s.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td style={styles.tableCell}>
                <button type="button" className="btn-icon action-btn-edit" onClick={() => handleEdit(s)} title="Edit" style={{ ...styles.actionBtn, color: '#475569' }}><Pencil size={16} /></button>
                <button type="button" className="btn-icon action-btn-delete" onClick={() => handleDelete(s)} title="Delete" style={{ ...styles.actionBtn, color: '#dc2626', borderColor: '#fecaca' }}><Trash2 size={16} /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
