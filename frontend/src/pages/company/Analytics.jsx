import { useState, useEffect } from 'react';
import { company } from '../../api/client';
import { BarChart3, Send, AlertCircle, CheckCircle, Calendar as CalendarIcon } from 'lucide-react';
import styles from './Analytics.module.css';

export default function CompanyAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    company.analytics().then(({ data: d }) => {
      setData(d);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className={`page-loading ${styles.pageLoading}`}>Loading...</div>;
  if (!data) return null;

  return (
    <div className={`page ${styles.page}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>Analytics</h1>
        <div className={styles.periodBadge}>
          <CalendarIcon size={16} />
          {data.period?.from} — {data.period?.to}
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statAccentBar} style={{ background: '#2b52a5' }}></div>
          <div className={styles.statIconWrapper} style={{ background: '#eff6ff', color: '#2b52a5' }}>
            <BarChart3 size={24} />
          </div>
          <div>
            <h3 className={styles.statLabel}>Total Campaigns</h3>
            <p className={styles.statValue}>{data.total_campaigns}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statAccentBar} style={{ background: '#10b981' }}></div>
          <div className={styles.statIconWrapper} style={{ background: '#ecfdf5', color: '#10b981' }}>
            <Send size={24} />
          </div>
          <div>
            <h3 className={styles.statLabel}>Emails Sent</h3>
            <p className={styles.statValue}>{data.total_emails_sent}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statAccentBar} style={{ background: '#e4002b' }}></div>
          <div className={styles.statIconWrapper} style={{ background: '#fff1f2', color: '#e4002b' }}>
            <AlertCircle size={24} />
          </div>
          <div>
            <h3 className={styles.statLabel}>Emails Failed</h3>
            <p className={styles.statValue}>{data.total_emails_failed}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statAccentBar} style={{ background: '#f59e0b' }}></div>
          <div className={styles.statIconWrapper} style={{ background: '#fffbeb', color: '#f59e0b' }}>
            <CheckCircle size={24} />
          </div>
          <div>
            <h3 className={styles.statLabel}>Completed Campaigns</h3>
            <p className={styles.statValue}>{data.completed_campaigns}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
