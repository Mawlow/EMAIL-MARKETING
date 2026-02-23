import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { admin } from '../../api/client';

export default function AdminCampaignDetail() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    admin.campaigns.get(id).then(({ data }) => {
      setCampaign(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="page-loading">Loading...</div>;
  if (!campaign) return <div className="page">Campaign not found.</div>;

  return (
    <div className="page">
      <h1>{campaign.name}</h1>
      <p><strong>Company:</strong> {campaign.company?.name}</p>
      <p><strong>Subject:</strong> {campaign.subject}</p>
      <p><strong>Status:</strong> {campaign.status}</p>
      <p><strong>Recipients:</strong> {campaign.sent_count} sent, {campaign.failed_count} failed, {campaign.pending_count} pending / {campaign.total_recipients} total</p>
      <p><strong>Started:</strong> {campaign.started_at ? new Date(campaign.started_at).toLocaleString() : '-'}</p>
      <p><strong>Completed:</strong> {campaign.completed_at ? new Date(campaign.completed_at).toLocaleString() : '-'}</p>
      <p><Link to={`/admin/campaigns/${id}/logs`}>View email logs</Link></p>
    </div>
  );
}
