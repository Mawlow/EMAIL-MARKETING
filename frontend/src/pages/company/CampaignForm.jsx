import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save } from 'lucide-react';
import { company } from '../../api/client';
import RichTextEditor from '../../components/RichTextEditor';

const RECIPIENT_OPTIONS = [
  { value: 'marketing_contacts', label: 'All marketing contacts' },
  { value: 'contact_groups', label: 'Selected groups' },
];

const PROFESSIONAL_TEMPLATE = `<h1>Welcome</h1>
<p>Hi {{email}},</p>
<p>Thanks for being with us. Here's what you need to know.</p>
<h2>Quick links</h2>
<ul>
  <li><a href="#">Your account</a></li>
  <li><a href="#">Help center</a></li>
</ul>
<p>To stop receiving these emails, <a href="{{unsubscribe_url}}">unsubscribe here</a>.</p>
<p>— The Team</p>`;

export default function CampaignForm({ asModal, onSuccess, onCancel, editId } = {}) {
  const { id: paramsId } = useParams();
  const navigate = useNavigate();
  const currentId = editId || paramsId;
  const isEdit = Boolean(currentId);
  const [form, setForm] = useState({
    name: '',
    subject: '',
    body: '',
    recipient_type: 'marketing_contacts',
    contact_group_ids: [],
    sender_account_id: '',
  });
  const [senders, setSenders] = useState([]);
  const [contactGroups, setContactGroups] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [bodyMode, setBodyMode] = useState('visual'); // 'visual' | 'html'

  useEffect(() => {
    Promise.all([
      company.senderAccounts.list().then(({ data }) => setSenders(Array.isArray(data) ? data : data?.data ?? [])),
      company.contactGroups.list().then(({ data }) => setContactGroups(Array.isArray(data) ? data : [])),
    ]).finally(() => {
      if (!isEdit) setLoading(false);
    });
    if (isEdit) {
      company.campaigns.get(currentId).then(({ data }) => {
        setForm({
          name: data.name,
          subject: data.subject,
          body: data.body || '',
          recipient_type: data.recipient_type || 'marketing_contacts',
          contact_group_ids: Array.isArray(data.contact_group_ids) ? data.contact_group_ids : [],
          sender_account_id: data.sender_account_id ?? '',
        });
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [currentId, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      sender_account_id: form.sender_account_id || null,
      contact_group_ids: form.recipient_type === 'contact_groups' ? (form.contact_group_ids || []) : [],
    };
    try {
      if (isEdit) {
        await company.campaigns.update(currentId, payload);
        if (onSuccess) onSuccess();
        else navigate('/campaigns');
      } else {
        const { data: campaign } = await company.campaigns.create(payload);
        try {
          await company.campaigns.send(campaign.id);
        } catch (sendErr) {
          console.error('Failed to send immediately:', sendErr);
          alert('Campaign saved as draft, but failed to start sending: ' + (sendErr.response?.data?.message || 'Check your sender accounts.'));
        }
        if (onSuccess) onSuccess();
        else navigate('/campaigns');
      }
    } catch (err) {
      console.error('Failed to save campaign:', err);
      const msg = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join(' ')
        : err.response?.data?.message || 'Failed to save campaign. Please check all fields.';
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return asModal ? <div className="modal-body-loading">Loading...</div> : <div className="page-loading">Loading...</div>;

  const formContent = (
    <form onSubmit={handleSubmit} className="form">
        <label>
          Name
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
        </label>
        <label>
          Subject
          <input
            value={form.subject}
            onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
            required
          />
        </label>
        <label>
          Recipient type
          <select
            value={form.recipient_type}
            onChange={(e) => setForm((f) => ({ ...f, recipient_type: e.target.value }))}
          >
            {RECIPIENT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </label>
        {form.recipient_type === 'contact_groups' && (
          <label>
            Select group
            <select
              value={(form.contact_group_ids || [])[0] ?? ''}
              onChange={(e) => setForm((f) => ({
                ...f,
                contact_group_ids: e.target.value ? [Number(e.target.value)] : [],
              }))}
            >
              <option value="">Select a group...</option>
              {contactGroups.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
            <span className="form-hint">Campaign will be sent to contacts in this group.</span>
          </label>
        )}
        <label>
          Select sender
          <select
            value={form.sender_account_id === null || form.sender_account_id === undefined ? '' : form.sender_account_id}
            onChange={(e) => setForm((f) => ({ ...f, sender_account_id: e.target.value ? Number(e.target.value) : '' }))}
          >
            <option value="">Default (rotate senders)</option>
            {senders.filter((s) => s.is_active).map((s) => (
              <option key={s.id} value={s.id}>{s.from_name || s.name || s.from_email}</option>
            ))}
          </select>
        </label>
        <div className="form-section">
          <div className="form-section-head">
            <span className="form-section-label">Email body</span>
            <button
              type="button"
              className="btn btn-ghost btn-load-template"
              onClick={() => setForm((f) => ({ ...f, body: PROFESSIONAL_TEMPLATE }))}
            >
              Load professional template
            </button>
          </div>
          <div className="body-editor-tabs">
            <button type="button" className={bodyMode === 'visual' ? 'body-editor-tab active' : 'body-editor-tab'} onClick={() => setBodyMode('visual')}>Visual (WYSIWYG)</button>
            <button type="button" className={bodyMode === 'html' ? 'body-editor-tab active' : 'body-editor-tab'} onClick={() => setBodyMode('html')}>HTML</button>
          </div>
          <div className="form-section-body">
            {bodyMode === 'visual' ? (
              <RichTextEditor value={form.body} onChange={(body) => setForm((f) => ({ ...f, body }))} minHeight={320} />
            ) : (
              <textarea
                className="campaign-body-input"
                value={form.body}
                onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                placeholder="HTML content. Use {{unsubscribe_url}} and {{email}}."
                rows={14}
              />
            )}
          </div>
        </div>
        <div className={asModal ? 'form-actions modal-actions' : 'form-actions'}>
          <button type="submit" disabled={saving}><Save size={16} /> {saving ? 'Saving...' : 'Save'}</button>
          <button type="button" onClick={() => { if (onCancel) onCancel(); else navigate('/campaigns'); }}>Cancel</button>
        </div>
      </form>
  );

  if (asModal) return <div className="modal-body">{formContent}</div>;
  return (
    <div className="page">
      <h1>{isEdit ? 'Edit campaign' : 'New campaign'}</h1>
      {formContent}
    </div>
  );
}
