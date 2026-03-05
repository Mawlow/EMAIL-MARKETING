import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, X, Users, ExternalLink } from 'lucide-react';
import { company } from '../../api/client';
import styles from './ContactGroups.module.css';

export default function ContactGroups() {
  const navigate = useNavigate();
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
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Group name is required.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      if (editing) {
        await company.contactGroups.update(editing.id, { name: trimmedName });
      } else {
        await company.contactGroups.create({ name: trimmedName });
      }
      closeModal();
      load();
    } catch (err) {
      console.error('Failed to save contact group:', err);
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

  if (loading) return <div className={`page-loading ${styles.pageLoading}`}>Loading...</div>;

  return (
    <div className={`page ${styles.page}`}>
      <div className={styles.groupsHeader}>
        <h1 className={styles.groupsTitle}>Contact groups</h1>
      </div>

      <div className={styles.descriptionRow}>
        <p className={styles.groupsDescription}>
          Create groups and assign contacts to them. When creating a campaign, you can send to 
          &quot;All marketing contacts&quot; or to selected groups.
        </p>
        <button type="button" className={styles.btnAddGroup} onClick={openAdd} style={{ flexShrink: 0 }}>
          <Plus size={20} strokeWidth={3} /> Add group
        </button>
      </div>

      {modalOpen && (
        <div className="modal-backdrop" onClick={closeModal} style={{ zIndex: 2000 }}>
          <div className={styles.modalDialogCustom} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeaderCustom}>
              <h3>{editing ? 'Edit group' : 'Add group'}</h3>
              <button type="button" className="modal-close" onClick={closeModal} aria-label="Close"><X /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className={styles.modalBodyCustom}>
                {error && <div className={styles.authError} style={{ marginBottom: '1rem' }}>{error}</div>}
                <label>Group name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Newsletter, VIP Customers"
                  required
                  autoFocus
                />
              </div>
              <div className={styles.modalActionsCustom}>
                <button type="submit" className={styles.btnModalPrimary} disabled={saving}>
                  {saving ? 'Saving...' : (editing ? 'Save changes' : 'Create group')}
                </button>
                <button type="button" className={styles.btnModalGhost} onClick={closeModal}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {groups.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: '#f8fafc', borderRadius: '16px', border: '2px dashed #e2e8f0' }}>
          <Users size={48} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
          <p className={styles.muted} style={{ fontWeight: 600 }}>No groups yet. Add a group to organize contacts and target campaigns.</p>
        </div>
      ) : (
        <table className={styles.tableCustom}>
          <thead>
            <tr>
              <th>Group Name</th>
              <th style={{ width: '120px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((g) => (
              <tr key={g.id}>
                <td>
                  <div className={styles.groupNameCell}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eff6ff', color: '#2b52a5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Users size={16} />
                    </div>
                    {g.name}
                  </div>
                </td>
                <td>
                  <div className={styles.actionBtns} style={{ justifyContent: 'flex-end' }}>
                    <button type="button" className={styles.btnIconCustom} onClick={() => navigate(`/contacts?group_id=${g.id}`)} title="View contacts">
                      <ExternalLink size={20} />
                    </button>
                    <button type="button" className={styles.btnIconCustom} onClick={() => openEdit(g)} title="Edit">
                      <Pencil size={20} />
                    </button>
                    <button type="button" className={`${styles.btnIconCustom} ${styles.btnIconCustomDelete}`} onClick={() => handleDelete(g.id)} title="Delete">
                      <Trash2 size={20} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
