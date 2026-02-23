import { useState, useEffect } from 'react';
import { admin } from '../../api/client';

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    admin.analytics().then(({ data: d }) => {
      setData(d);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading">Loading...</div>;
  if (!data) return null;

  return (
    <div className="page">
      <h1>Platform Analytics</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Companies</h3>
          <p className="stat-value">{data.companies_count}</p>
        </div>
        <div className="stat-card">
          <h3>Total campaigns</h3>
          <p className="stat-value">{data.total_campaigns}</p>
        </div>
        <div className="stat-card">
          <h3>Emails sent</h3>
          <p className="stat-value">{data.total_emails_sent}</p>
        </div>
        <div className="stat-card">
          <h3>Emails failed</h3>
          <p className="stat-value">{data.total_emails_failed}</p>
        </div>
        <div className="stat-card">
          <h3>Completed campaigns</h3>
          <p className="stat-value">{data.completed_campaigns}</p>
        </div>
      </div>
      <p className="muted">Period: {data.period?.from} to {data.period?.to}</p>
    </div>
  );
}
