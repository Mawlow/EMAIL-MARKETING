import { useState, useEffect } from 'react';
import { CheckCircle, ShieldCheck, Ban, ChevronLeft, ChevronRight } from 'lucide-react';
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
    <div className="page">
      <h1>Companies</h1>
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Approved</th>
            <th>Verified</th>
            <th>Active</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {companies.data?.map((c) => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>{c.email}</td>
              <td>{c.is_approved ? 'Yes' : 'No'}</td>
              <td>{c.is_verified ? 'Yes' : 'No'}</td>
              <td>{c.is_active ? 'Yes' : 'No'}</td>
              <td>
                {!c.is_approved && <button type="button" className="btn btn-ghost" onClick={() => handleApprove(c.id)}><CheckCircle size={16} /> Approve</button>}
                {!c.is_verified && <button type="button" className="btn btn-ghost" onClick={() => handleVerify(c.id)}><ShieldCheck size={16} /> Verify</button>}
                {c.is_active && <button type="button" className="btn btn-ghost" onClick={() => handleDisable(c.id)}><Ban size={16} /> Disable</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {companies.meta?.last_page > 1 && (
        <div className="pagination">
          <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft size={16} /> Previous</button>
          <span>Page {page} of {companies.meta.last_page}</span>
          <button type="button" disabled={page >= companies.meta.last_page} onClick={() => setPage((p) => p + 1)}>Next <ChevronRight size={16} /></button>
        </div>
      )}
    </div>
  );
}
