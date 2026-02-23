import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Users } from 'lucide-react';
import { company } from '../../api/client';

export default function ContactGroups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    company.contactGroups.list().then(({ data }) => setGroups(Array.isArray(data) ? data : [])).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setName('');
    setError('');
    setModalOpen(true);
  };

  const openEdit = (g) => {
    setEditing(g);
    setName(g.name);
    setError('');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setName('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (editing) {
        await company.contactGroups.update(editing.id, { name: name.trim() });
      } else {
        await company.contactGroups.create({ name: name.trim() });
      }
      closeModal();
      load();
    } catch (err) {
      const msg = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join(' ')
        : err.response?.data?.message || 'Failed to save group.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id) => {
    if (!confirm('Delete this group? Contacts will be unassigned from it.')) return;
    company.contactGroups.delete(id).then(() => load()).catch((err) => alert(err.response?.data?.message || 'Failed to delete'));
  };

  if (loading) return <div className="page-loading">Loading...</div>;

  return (
    <div className="page">
      <h1>Contact groups</h1>
      <p className="form-hint" style={{ marginBottom: '1rem' }}>Create groups and assign contacts to them. When creating a campaign, you can send to &quot;All marketing contacts&quot; or to selected groups.</p>
      <div className="toolbar">
        <button type="button" className="btn btn-primary" onClick={openAdd}><Plus size={18} /> Add group</button>
      </div>

      {modalOpen && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Edit group' : 'Add group'}</h3>
              <button type="button" className="modal-close" onClick={closeModal} aria-label="Close"><X /></button>
            </div>
            <form onSubmit={handleSubmit} className="form modal-body">
              {error && <div className="auth-error">{error}</div>}
              <label>
                Group name
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Newsletter, VIP"
                  required
                />
              </label>
              <div className="form-actions modal-actions">
                <button type="submit" disabled={saving}>{saving ? 'Saving...' : (editing ? 'Save' : 'Add group')}</button>
                <button type="button" onClick={closeModal}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {groups.length === 0 ? (
        <p className="muted">No groups yet. Add a group to organize contacts and target campaigns.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((g) => (
              <tr key={g.id}>
                <td>{g.name}</td>
                <td>
                  <button type="button" className="btn-icon" onClick={() => openEdit(g)} title="Edit"><Pencil size={16} /></button>
                  <button type="button" className="btn-icon" onClick={() => handleDelete(g.id)} title="Delete"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
