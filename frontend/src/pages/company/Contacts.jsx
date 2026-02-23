import { useState, useEffect, useRef } from 'react';
import { UserPlus, Upload, Search, X, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { company } from '../../api/client';

const emptyForm = {
  email: '',
  first_name: '',
  last_name: '',
  phone: '',
  is_marketing: true,
  contact_group_ids: [],
};

export default function Contacts() {
  const [contacts, setContacts] = useState({ data: [], meta: {} });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [groups, setGroups] = useState([]);
  const fileRef = useRef(null);

  const load = () => {
    company.contacts.list({ page, search: search || undefined }).then(({ data }) => setContacts(data)).finally(() => setLoading(false));
  };

  useEffect(() => {
    setLoading(true);
    load();
  }, [page, search]);

  useEffect(() => {
    company.contactGroups.list().then(({ data }) => setGroups(Array.isArray(data) ? data : []));
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    setShowAddForm(true);
  };

  const openEdit = (c) => {
    setEditing(c);
    setForm({
      email: c.email,
      first_name: c.first_name || '',
      last_name: c.last_name || '',
      phone: c.phone || '',
      is_marketing: !!c.is_marketing,
      contact_group_ids: (c.groups || []).map((g) => g.id),
    });
    setError('');
    setShowAddForm(true);
  };

  const closeModal = () => {
    setShowAddForm(false);
    setEditing(null);
    setForm(emptyForm);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (editing) {
        await company.contacts.update(editing.id, form);
      } else {
        await company.contacts.create(form);
      }
      closeModal();
      load();
    } catch (err) {
      const msg = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join(' ')
        : err.response?.data?.message || (editing ? 'Failed to update contact.' : 'Failed to add contact.');
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id) => {
    if (!confirm('Delete this contact?')) return;
    company.contacts.delete(id).then(() => load()).catch((err) => alert(err.response?.data?.message || 'Failed to delete'));
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    company.contacts.import(fd).then(({ data }) => {
      alert(data.message);
      load();
    }).catch((err) => alert(err.response?.data?.message || 'Import failed'));
    e.target.value = '';
  };

  if (loading) return <div className="page-loading">Loading...</div>;

  return (
    <div className="page">
      <h1>Contacts</h1>
      <div className="toolbar">
        <button type="button" className="btn btn-primary" onClick={openAdd}><UserPlus size={18} /> Add contact</button>
        <div className="search-wrap">
          <Search size={18} />
          <input type="search" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <input type="file" ref={fileRef} accept=".csv" style={{ display: 'none' }} onChange={handleImport} />
        <button type="button" className="btn btn-ghost" onClick={() => fileRef.current?.click()}><Upload size={18} /> Import CSV</button>
      </div>

      {showAddForm && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Edit contact' : 'Add contact'}</h3>
              <button type="button" className="modal-close" onClick={closeModal} aria-label="Close"><X /></button>
            </div>
            <form onSubmit={handleSubmit} className="form modal-body">
              {error && <div className="auth-error">{error}</div>}
              <label>
                Email <span style={{ color: '#dc2626' }}>*</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  required
                  placeholder="contact@example.com"
                />
              </label>
              <label>
                First name
                <input
                  value={form.first_name}
                  onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
                  placeholder="John"
                />
              </label>
              <label>
                Last name
                <input
                  value={form.last_name}
                  onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
                  placeholder="Doe"
                />
              </label>
              <label>
                Phone
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="+1 234 567 8900"
                />
              </label>
              <label>
                Group
                <select
                  value={form.contact_group_ids[0] ?? ''}
                  onChange={(e) => setForm((f) => ({
                    ...f,
                    contact_group_ids: e.target.value ? [Number(e.target.value)] : [],
                  }))}
                >
                  <option value="">No group</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={form.is_marketing}
                  onChange={(e) => setForm((f) => ({ ...f, is_marketing: e.target.checked }))}
                />
                <span>Include in marketing campaigns</span>
              </label>
              <div className="form-actions modal-actions">
                <button type="submit" disabled={saving}>{saving ? (editing ? 'Saving...' : 'Adding...') : (editing ? 'Save' : 'Add contact')}</button>
                <button type="button" onClick={closeModal}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <table className="table">
        <thead>
          <tr>
            <th>Email</th>
            <th>First name</th>
            <th>Last name</th>
            <th>Phone</th>
            <th>Groups</th>
            <th>Marketing</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {contacts.data?.map((c) => (
            <tr key={c.id}>
              <td>{c.email}</td>
              <td>{c.first_name || '—'}</td>
              <td>{c.last_name || '—'}</td>
              <td>{c.phone || '—'}</td>
              <td>{(c.groups || []).map((g) => g.name).join(', ') || '—'}</td>
              <td>{c.is_marketing ? 'Yes' : 'No'}</td>
              <td>
                <button type="button" className="btn-icon" onClick={() => openEdit(c)} title="Edit"><Pencil size={16} /></button>
                <button type="button" className="btn-icon" onClick={() => handleDelete(c.id)} title="Delete"><Trash2 size={16} /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {contacts.meta?.last_page > 1 && (
        <div className="pagination">
          <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft size={16} /> Previous</button>
          <span>Page {page} of {contacts.meta.last_page}</span>
          <button type="button" disabled={page >= contacts.meta.last_page} onClick={() => setPage((p) => p + 1)}>Next <ChevronRight size={16} /></button>
        </div>
      )}
    </div>
  );
}
