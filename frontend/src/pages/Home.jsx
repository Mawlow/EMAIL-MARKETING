import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();
  if (user?.role === 'admin') return <Navigate to="/admin/companies" replace />;
  return <Navigate to="/campaigns" replace />;
}
