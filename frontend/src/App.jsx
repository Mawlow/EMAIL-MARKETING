import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Home from './pages/Home';
import AdminCompanies from './pages/admin/Companies';
import AdminCampaigns from './pages/admin/Campaigns';
import AdminCampaignDetail from './pages/admin/CampaignDetail';
import AdminCampaignLogs from './pages/admin/CampaignLogs';
import AdminAnalytics from './pages/admin/Analytics';
import CompanyCampaigns from './pages/company/Campaigns';
import CampaignForm from './pages/company/CampaignForm';
import CampaignLogs from './pages/company/CampaignLogs';
import Contacts from './pages/company/Contacts';
import ContactGroups from './pages/company/ContactGroups';
import Senders from './pages/company/Senders';
import CompanyAnalytics from './pages/company/Analytics';
import Calendar from './pages/company/Calendar';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loading">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppRoot() {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loading">Loading...</div>;
  if (!user) return <Landing />;
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/" element={<AppRoot />}>
        <Route index element={<Home />} />
        <Route path="admin/companies" element={<AdminCompanies />} />
        <Route path="admin/campaigns" element={<AdminCampaigns />} />
        <Route path="admin/campaigns/:id" element={<AdminCampaignDetail />} />
        <Route path="admin/campaigns/:id/logs" element={<AdminCampaignLogs />} />
        <Route path="admin/analytics" element={<AdminAnalytics />} />
        <Route path="campaigns" element={<CompanyCampaigns />} />
        <Route path="campaigns/new" element={<CampaignForm />} />
        <Route path="campaigns/:id" element={<CampaignForm />} />
        <Route path="campaigns/:id/logs" element={<CampaignLogs />} />
        <Route path="contacts" element={<Contacts />} />
        <Route path="contact-groups" element={<ContactGroups />} />
        <Route path="senders" element={<Senders />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="analytics" element={<CompanyAnalytics />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
