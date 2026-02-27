import { useState, useEffect } from 'react';
import { CheckCircle, ShieldCheck, Ban, ChevronLeft, ChevronRight, Building2 } from 'lucide-react';
import { admin } from '../../api/client';

export default function AdminCompanies() {
  const [companies, setCompanies] = useState({ data: [], meta: {} });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    admin.companies.list({ page }).then(({ data }) => {
      setCompanies(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [page]);

  const handleApprove = (id) => {
    admin.companies.approve(id).then(() => {
      setCompanies((c) => ({
        ...c,
        data: c.data.map((x) => (x.id === id ? { ...x, is_approved: true } : x)),
      }));
    });
  };

  const handleVerify = (id) => {
    admin.companies.verify(id).then(() => {
      setCompanies((c) => ({
        ...c,
        data: c.data.map((x) => (x.id === id ? { ...x, is_verified: true } : x)),
      }));
    });
  };

  const handleEnable = (id) => {
    admin.companies.enable(id).then(() => {
      setCompanies((c) => ({
        ...c,
        data: c.data.map((x) => (x.id === id ? { ...x, is_active: true } : x)),
      }));
    });
  };

  const handleDisable = (id) => {
    admin.companies.disable(id).then(() => {
      setCompanies((c) => ({
        ...c,
        data: c.data.map((x) => (x.id === id ? { ...x, is_active: false } : x)),
      }));
    });
  };

  if (loading) return <div className="page-loading">Loading...</div>;

  return (
    <div className="page page-companies-override">
      <style>{`
        .page-companies-override {
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

        .status-badge {
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            display: inline-block;
        }
        .status-yes { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
        .status-no { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }

        .action-btns {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .btn-action-sm {
            padding: 0.4rem 0.8rem;
            border-radius: 8px;
            font-size: 0.8rem;
            font-weight: 600;
            border: 1px solid transparent;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
            transition: all 0.2s;
        }
        .btn-approve { background: #dcfce7; color: #166534; border-color: #bbf7d0; }
        .btn-approve:hover { background: #bbf7d0; }
        .btn-verify { background: #dbeafe; color: #1e40af; border-color: #bfdbfe; }
        .btn-verify:hover { background: #bfdbfe; }
        .btn-disable { background: #fee2e2; color: #991b1b; border-color: #fecaca; }
        .btn-disable:hover { background: #fecaca; }

        .pagination-container {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 1rem;
            margin-top: 2rem;
        }
        .pagination-btn {
            background: #fff;
            border: 1.5px solid #e2e8f0;
            color: #64748b;
            padding: 0.5rem 1rem;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        .pagination-btn:hover:not(:disabled) {
            border-color: #cbd5e1;
            color: #0f172a;
        }
        .pagination-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        .pagination-info {
            color: #64748b;
            font-weight: 500;
            font-size: 0.9rem;
        }
      `}</style>

      <div className="groups-header">
        <h1 className="groups-title">Companies</h1>
      </div>

      <table className="table-custom">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Approved</th>
            <th>Verified</th>
            <th>Active</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {companies.data?.map((c) => (
            <tr key={c.id}>
              <td>
                 <div className="group-name-cell">
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f3f4f6', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Building2 size={16} />
                    </div>
                    {c.name}
                  </div>
              </td>
              <td>{c.email}</td>
              <td><span className={`status-badge ${c.is_approved ? 'status-yes' : 'status-no'}`}>{c.is_approved ? 'Yes' : 'No'}</span></td>
              <td><span className={`status-badge ${c.is_verified ? 'status-yes' : 'status-no'}`}>{c.is_verified ? 'Yes' : 'No'}</span></td>
              <td><span className={`status-badge ${c.is_active ? 'status-yes' : 'status-no'}`}>{c.is_active ? 'Yes' : 'No'}</span></td>
              <td>
                <div className="action-btns">
                    {!c.is_approved && <button type="button" className="btn-action-sm btn-approve" onClick={() => handleApprove(c.id)}><CheckCircle size={14} /> Approve</button>}
                    {!c.is_verified && <button type="button" className="btn-action-sm btn-verify" onClick={() => handleVerify(c.id)}><ShieldCheck size={14} /> Verify</button>}
                    {c.is_active ? (
                        <button type="button" className="btn-action-sm btn-disable" onClick={() => handleDisable(c.id)}><Ban size={14} /> Disable</button>
                    ) : (
                        <button type="button" className="btn-action-sm btn-approve" onClick={() => handleEnable(c.id)}><CheckCircle size={14} /> Enable</button>
                    )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {companies.meta?.last_page > 1 && (
        <div className="pagination-container">
          <button type="button" className="pagination-btn" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft size={16} /> Previous</button>
          <span className="pagination-info">Page {page} of {companies.meta.last_page}</span>
          <button type="button" className="pagination-btn" disabled={page >= companies.meta.last_page} onClick={() => setPage((p) => p + 1)}>Next <ChevronRight size={16} /></button>
        </div>
      )}
    </div>
  );
}
