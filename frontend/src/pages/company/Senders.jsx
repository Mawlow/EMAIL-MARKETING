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

export default function Senders() {
  const [senders, setSenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(defaultForm);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

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

  const handleDelete = (id) => {
    if (!confirm('Delete this sender?')) return;
    company.senderAccounts.delete(id).then(load);
  };

  const closeModal = () => {
    setShowForm(false);
    setEditing(null);
    setForm(defaultForm);
  };

  if (loading) return <div className="page-loading">Loading...</div>;

  return (
    <div className="page">
      <h1>Senders</h1>
      <div className="toolbar">
        <button type="button" className="btn btn-primary" onClick={openNew}><Plus size={18} /> Add sender</button>
      </div>
      {showForm && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-dialog modal-dialog--medium" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Edit sender' : 'Add sender'}</h3>
              <button type="button" className="modal-close" onClick={closeModal} aria-label="Close"><X /></button>
            </div>
            <form onSubmit={handleSubmit} className="form modal-body">
              <label>Name (label) <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Gmail Primary" required /></label>
              <label>Email <input type="email" value={form.from_email} onChange={(e) => setForm((f) => ({ ...f, from_email: e.target.value }))} required /></label>
              <label>Password <input type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder="App password" required={!editing} /></label>
              <div className="form-row">
                <label>Host <input value={form.host} onChange={(e) => setForm((f) => ({ ...f, host: e.target.value }))} placeholder="smtp.gmail.com" required /></label>
                <label>Port <input type="number" min={1} max={65535} value={form.port} onChange={(e) => setForm((f) => ({ ...f, port: parseInt(e.target.value, 10) || 587 }))} /></label>
              </div>
              <label>Encryption <select value={form.encryption} onChange={(e) => setForm((f) => ({ ...f, encryption: e.target.value }))}>
                <option value="null">None</option>
                <option value="tls">TLS</option>
                <option value="ssl">SSL</option>
              </select></label>
              <label className="checkbox-label">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} />
                <span>Active (use for sending)</span>
              </label>
              <div className="form-actions modal-actions">
                <button type="submit">Save</button>
                <button type="button" onClick={closeModal}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Host</th>
            <th>Active</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {senders.map((s) => (
            <tr key={s.id}>
              <td>{s.name}</td>
              <td>{s.from_email || '—'}</td>
              <td>{s.host ? `${s.host}:${s.port ?? 587}` : '—'}</td>
              <td>{s.is_active ? 'Yes' : 'No'}</td>
              <td>
                <button type="button" className="btn-icon" onClick={() => handleEdit(s)} title="Edit"><Pencil size={16} /></button>
                <button type="button" className="btn-icon" onClick={() => handleDelete(s.id)} title="Delete"><Trash2 size={16} /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
