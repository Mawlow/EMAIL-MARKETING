import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Users, Info } from 'lucide-react';
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

  if (loading) return <div className="page-loading">Loading...</div>;

  return (
    <div className="page page-groups-override">
      <style>{`
        .page-groups-override {
          background: #fff !important;
          color: #0f172a !important;
          border: 1px solid #e2e8f0 !important;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08) !important;
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
          padding: 1.5rem !important;
        }

        .groups-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .groups-title {
          margin: 0 !important;
          font-size: 2.25rem !important;
          font-weight: 800 !important;
          color: #0f172a !important;
          letter-spacing: -0.025em !important;
        }

        .btn-add-group {
          background-color: #e4002b !important;
          color: white !important;
          border: none !important;
          padding: 0.75rem 1.5rem !important;
          font-size: 1rem !important;
          font-weight: 700 !important;
          border-radius: 10px !important;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(228, 0, 43, 0.2) !important;
        }

        .btn-add-group:hover {
          background-color: #c00024 !important;
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(228, 0, 43, 0.3) !important;
        }

        .description-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .groups-description {
          color: #64748b !important;
          font-weight: 500;
          font-size: 1rem;
          line-height: 1.6;
          margin: 0 !important;
          max-width: 800px;
        }

        .table-custom {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
        }

        .table-custom th {
          background: #2b52a5 !important;
          padding: 1.25rem 1rem;
          text-align: left;
          font-size: 0.875rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #fff !important;
          border-bottom: none;
        }

        .table-custom td {
          padding: 1.25rem 1rem;
          border-bottom: 1px solid #e2e8f0;
          color: #0f172a !important;
          font-weight: 500;
        }

        .table-custom tr:last-child td {
          border-bottom: none;
        }

        .table-custom tr:hover td {
          background: #f8fafc;
        }

        .group-name-cell {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-weight: 600 !important;
          font-size: 1.0625rem;
        }

        .action-btns {
          display: flex;
          gap: 0.75rem;
        }

        .btn-icon-custom {
          width: 42px;
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          background: #eff6ff;
          border: 2px solid #dbeafe;
          color: #2b52a5 !important;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-icon-custom:hover {
          background: #2b52a5;
          color: #fff !important;
          transform: scale(1.05);
        }

        .btn-icon-custom.delete {
          background: #fff1f2;
          border-color: #ffe4e6;
          color: #e4002b !important;
        }

        .btn-icon-custom.delete:hover {
          background: #e4002b;
          color: #fff !important;
          border-color: #e4002b;
          transform: scale(1.05);
        }

        /* Modal Styles */
        .modal-dialog-custom {
          background: #fff !important;
          border-radius: 16px !important;
          width: 100%;
          max-width: 450px !important;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
        }

        .modal-header-custom {
          padding: 1.25rem 1.5rem;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-header-custom h3 {
          margin: 0 !important;
          font-weight: 800 !important;
          color: #0f172a !important;
        }

        .modal-body-custom {
          padding: 1.5rem;
        }

        .modal-body-custom label {
          color: #475569 !important;
          font-weight: 700 !important;
          margin-bottom: 0.5rem;
          display: block;
        }

        .modal-body-custom input {
          width: 100%;
          padding: 0.75rem 1rem !important;
          border: 2px solid #e2e8f0 !important;
          border-radius: 10px !important;
          font-size: 1rem !important;
          color: #0f172a !important;
          background: #fff !important;
          transition: all 0.2s !important;
        }

        .modal-body-custom input:focus {
          border-color: #2b52a5 !important;
          box-shadow: 0 0 0 4px rgba(43, 82, 165, 0.1) !important;
          outline: none !important;
        }

        .modal-actions-custom {
          padding: 1.25rem 1.5rem;
          background: #f8fafc;
          border-top: 1px solid #e2e8f0;
          display: flex;
          flex-direction: row-reverse;
          gap: 0.75rem;
        }

        .btn-modal-primary {
          background: #2b52a5 !important;
          color: #fff !important;
          padding: 0.65rem 1.5rem !important;
          font-weight: 700 !important;
          border-radius: 10px !important;
          border: none !important;
          cursor: pointer;
        }

        .btn-modal-ghost {
          background: #fff !important;
          color: #64748b !important;
          padding: 0.65rem 1.5rem !important;
          font-weight: 600 !important;
          border-radius: 10px !important;
          border: 1.5px solid #e2e8f0 !important;
          cursor: pointer;
        }

        .muted {
          color: #64748b !important;
        }

        .auth-error {
          background: #fef2f2 !important;
          color: #b91c1c !important;
          border: 1px solid #fecaca !important;
          padding: 0.75rem 1rem !important;
          border-radius: 8px !important;
          font-size: 0.875rem !important;
          font-weight: 500 !important;
        }
      `}</style>

      <div className="groups-header">
        <h1 className="groups-title">Contact groups</h1>
      </div>

      <div className="description-row">
        <p className="groups-description">
          Create groups and assign contacts to them. When creating a campaign, you can send to 
          &quot;All marketing contacts&quot; or to selected groups.
        </p>
        <button type="button" className="btn-add-group" onClick={openAdd} style={{ flexShrink: 0 }}>
          <Plus size={20} strokeWidth={3} /> Add group
        </button>
      </div>

      {modalOpen && (
        <div className="modal-backdrop" onClick={closeModal} style={{ zIndex: 2000 }}>
          <div className="modal-dialog-custom" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-custom">
              <h3>{editing ? 'Edit group' : 'Add group'}</h3>
              <button type="button" className="modal-close" onClick={closeModal} aria-label="Close"><X /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body-custom">
                {error && <div className="auth-error" style={{ marginBottom: '1rem' }}>{error}</div>}
                <label>Group name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Newsletter, VIP Customers"
                  required
                  autoFocus
                />
              </div>
              <div className="modal-actions-custom">
                <button type="submit" className="btn-modal-primary" disabled={saving}>
                  {saving ? 'Saving...' : (editing ? 'Save changes' : 'Create group')}
                </button>
                <button type="button" className="btn-modal-ghost" onClick={closeModal}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {groups.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: '#f8fafc', borderRadius: '16px', border: '2px dashed #e2e8f0' }}>
          <Users size={48} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
          <p className="muted" style={{ fontWeight: 600 }}>No groups yet. Add a group to organize contacts and target campaigns.</p>
        </div>
      ) : (
        <table className="table-custom">
          <thead>
            <tr>
              <th>Group Name</th>
              <th style={{ width: '100px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((g) => (
              <tr key={g.id}>
                <td>
                  <div className="group-name-cell">
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eff6ff', color: '#2b52a5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Users size={16} />
                    </div>
                    {g.name}
                  </div>
                </td>
                <td>
                  <div className="action-btns" style={{ justifyContent: 'flex-end' }}>
                    <button type="button" className="btn-icon-custom" onClick={() => openEdit(g)} title="Edit">
                      <Pencil size={20} />
                    </button>
                    <button type="button" className="btn-icon-custom delete" onClick={() => handleDelete(g.id)} title="Delete">
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
