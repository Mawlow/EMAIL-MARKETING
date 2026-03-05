import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { UserPlus, Upload, Search, X, Pencil, Trash2, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { company } from '../../api/client';
import stylesModule from './Contacts.module.css';

const emptyForm = {
  email: '',
  first_name: '',
  last_name: '',
  phone: '',
  is_marketing: true,
  contact_group_ids: [],
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
  searchInput: {
    borderColor: '#2b52a5',
    background: '#ffffff',
    color: '#000000'
  },
  btnImport: {
    background: '#2b52a5',
    color: '#fff',
    border: '1px solid #2b52a5'
  },
  modalRow: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1.125rem',
    alignItems: 'flex-end'
  },
  fieldHalf: {
    flex: 1
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
    background: '#2b52a5',
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
  },
  filterBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.4rem 0.75rem',
    background: '#eff6ff',
    color: '#2b52a5',
    borderRadius: '8px',
    border: '1px solid #dbeafe',
    fontSize: '0.875rem',
    fontWeight: 600,
    marginBottom: '1rem'
  },
  clearFilter: {
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    color: '#2b52a5',
    opacity: 0.7
  }
};

export default function Contacts() {
  const [searchParams, setSearchParams] = useSearchParams();
  const groupIdFromUrl = searchParams.get('group_id');

  const [contacts, setContacts] = useState({ data: [], meta: {} });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [groups, setGroups] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const fileRef = useRef(null);

  const load = () => {
    company.contacts.list({ 
      page, 
      search: debouncedSearch || undefined,
      group_id: groupIdFromUrl || undefined 
    })
      .then(({ data }) => setContacts(data))
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, groupIdFromUrl]);

  useEffect(() => {
    load();
  }, [page, debouncedSearch, groupIdFromUrl]);

  useEffect(() => {
    company.contactGroups.list().then(({ data }) => setGroups(Array.isArray(data) ? data : []));
  }, []);

  const clearGroupFilter = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('group_id');
    setSearchParams(newParams);
  };

  const selectedGroupName = groups.find(g => g.id === Number(groupIdFromUrl))?.name;

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

  const handleDelete = (contact) => {
    setDeleteConfirm(contact);
  };

  const executeDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await company.contacts.delete(deleteConfirm.id);
      setDeleteConfirm(null);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
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

  if (loading && !contacts.data) return <div className={`page-loading ${stylesModule.pageLoading}`}>Loading...</div>;

  // Debug: Log the contacts data
  console.log('Contacts data:', contacts.data);
  console.log('Loading:', loading);

  return (
    <div className={`page ${stylesModule.page}`} style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Contacts</h1>
        <div className={`toolbar ${stylesModule.toolbar}`} style={{ ...styles.toolbar, justifyContent: 'flex-end' }}>
          <div className={stylesModule.searchWrap}>
            <Search size={18} />
            <input 
              type="search" 
              placeholder="Search..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              className={stylesModule.searchInput}
              style={styles.searchInput}
            />
          </div>
          <button type="button" className={`btn btn-primary ${stylesModule.btn} ${stylesModule.btnPrimary}`} onClick={openAdd}><UserPlus size={18} /> Add contact</button>
          <input type="file" ref={fileRef} accept=".csv" style={{ display: 'none' }} onChange={handleImport} />
          <button 
            type="button" 
            className={`btn ${stylesModule.btn} ${stylesModule.btnImport}`} 
            onClick={() => fileRef.current?.click()}
            style={styles.btnImport}
          >
            <Upload size={18} /> Import CSV
          </button>
        </div>
      </div>

      {groupIdFromUrl && (
        <div style={styles.filterBadge}>
          <Filter size={14} />
          <span>Group: {selectedGroupName || 'Loading...'}</span>
          <div onClick={clearGroupFilter} style={styles.clearFilter} title="Clear filter">
            <X size={14} strokeWidth={3} />
          </div>
        </div>
      )}

      {showAddForm && (
        <div className="modal-backdrop" onClick={closeModal} style={styles.modalBackdrop}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={styles.modalDialog}>
            <div className="modal-header" style={styles.modalHeader}>
              <h3 style={{ margin: 0, color: '#000' }}>{editing ? 'Edit contact' : 'Add contact'}</h3>
              <button type="button" className="modal-close" onClick={closeModal} aria-label="Close" style={{ color: '#0f172a' }}><X /></button>
            </div>
            <form onSubmit={handleSubmit} className={`form modal-body ${stylesModule.modalBody}`}>
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
              <div className={stylesModule.modalRow}>
                <label className={stylesModule.fieldHalf}>
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
                <label className={stylesModule.fieldHalf}>
                  Marketing
                  <select
                    value={form.is_marketing ? 'yes' : 'no'}
                    onChange={(e) => setForm((f) => ({ ...f, is_marketing: e.target.value === 'yes' }))}
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </label>
              </div>
              <div className={`form-actions modal-actions ${stylesModule.modalActions}`}>
                <button type="submit" className={`${stylesModule.btn} ${stylesModule.btnPrimary}`} disabled={saving}>{saving ? (editing ? 'Saving...' : 'Adding...') : (editing ? 'Save' : 'Add contact')}</button>
                <button type="button" className={stylesModule.btn} onClick={closeModal}>Cancel</button>
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
            <div className={`modal-body ${stylesModule.modalBody}`} style={styles.modalBody}>
              <p style={{ margin: 0, color: '#000' }}>Are you sure you want to delete the contact <strong>"{deleteConfirm.email}"</strong>?</p>
              <p style={{ marginTop: '0.5rem', color: '#dc2626', fontSize: '0.875rem' }}>This action cannot be undone.</p>
              <div className={`modal-actions ${stylesModule.modalActions}`} style={styles.modalActions}>
                <button type="button" className={`btn ${stylesModule.btn}`} onClick={() => setDeleteConfirm(null)} style={{ color: '#000' }}>Cancel</button>
                <button type="button" className={stylesModule.btn} style={styles.btnConfirm} onClick={executeDelete}>Yes, Delete Contact</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <table className={`table ${stylesModule.table}`} style={styles.table}>
        <thead>
          <tr>
            <th style={styles.tableHeader}>Email</th>
            <th style={styles.tableHeader}>First name</th>
            <th style={styles.tableHeader}>Last name</th>
            <th style={styles.tableHeader}>Phone</th>
            <th style={styles.tableHeader}>Groups</th>
            <th style={styles.tableHeader}>Marketing</th>
            <th style={styles.tableHeader}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {contacts.data?.length > 0 ? (
            contacts.data?.map((c) => (
              <tr key={c.id}>
                <td style={styles.tableCell}>{c.email}</td>
                <td style={styles.tableCell}>{c.first_name || '—'}</td>
                <td style={styles.tableCell}>{c.last_name || '—'}</td>
                <td style={styles.tableCell}>{c.phone || '—'}</td>
                <td style={styles.tableCell}>{(c.groups || []).map((g) => g.name).join(', ') || '—'}</td>
                <td style={styles.tableCell}>
                  <span 
                    className={`${stylesModule.marketingBadge} ${c.is_marketing ? stylesModule.marketingYes : stylesModule.marketingNo}`}
                  >
                    {c.is_marketing ? 'Yes' : 'No'}
                  </span>
                </td>
                <td style={styles.tableCell}>
                  <button type="button" className={`btn-icon ${stylesModule.btnIcon} ${stylesModule.actionBtnEdit}`} onClick={() => openEdit(c)} title="Edit" style={{ marginRight: '0.5rem', padding: '0.35rem', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', color: '#64748b' }}><Pencil size={16} /></button>
                  <button type="button" className={`btn-icon ${stylesModule.btnIcon} ${stylesModule.actionBtnDelete}`} onClick={() => handleDelete(c)} title="Delete" style={{ padding: '0.35rem', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', color: '#64748b' }}><Trash2 size={16} /></button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                No contacts found. Click "Add contact" to create your first contact.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {contacts.meta?.last_page > 1 && (
        <div className={`pagination ${stylesModule.pagination}`}>
          <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft size={16} /> Previous</button>
          <span>Page {page} of {contacts.meta.last_page}</span>
          <button type="button" disabled={page >= contacts.meta.last_page} onClick={() => setPage((p) => p + 1)}>Next <ChevronRight size={16} /></button>
        </div>
      )}
    </div>
  );
}
