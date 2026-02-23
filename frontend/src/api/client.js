import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

function getStoredToken() {
  return sessionStorage.getItem('token') || localStorage.getItem('token');
}

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const auth = {
  login: (email, password) => api.post('/login', { email, password }),
  register: (data) => api.post('/register', data),
  logout: () => api.post('/logout'),
  user: () => api.get('/user'),
  forgotPassword: (email) => api.post('/forgot-password', { email }),
  resetPassword: (data) => api.post('/reset-password', data),
};

export const admin = {
  companies: {
    list: (params) => api.get('/admin/companies', { params }),
    get: (id) => api.get(`/admin/companies/${id}`),
    create: (data) => api.post('/admin/companies', data),
    update: (id, data) => api.put(`/admin/companies/${id}`, data),
    delete: (id) => api.delete(`/admin/companies/${id}`),
    approve: (id) => api.post(`/admin/companies/${id}/approve`),
    verify: (id) => api.post(`/admin/companies/${id}/verify`),
    disable: (id) => api.post(`/admin/companies/${id}/disable`),
  },
  campaigns: {
    list: (params) => api.get('/admin/campaigns', { params }),
    get: (id) => api.get(`/admin/campaigns/${id}`),
    logs: (id, params) => api.get(`/admin/campaigns/${id}/logs`, { params }),
  },
  analytics: (params) => api.get('/admin/analytics', { params }),
};

export const company = {
  campaigns: {
    list: (params) => api.get('/company/campaigns', { params }),
    get: (id) => api.get(`/company/campaigns/${id}`),
    create: (data) => api.post('/company/campaigns', data),
    update: (id, data) => api.put(`/company/campaigns/${id}`, data),
    delete: (id) => api.delete(`/company/campaigns/${id}`),
    send: (id) => api.post(`/company/campaigns/${id}/send`),
    resend: (id) => api.post(`/company/campaigns/${id}/resend`),
    logs: (id, params) => api.get(`/company/campaigns/${id}/logs`, { params }),
  },
  contacts: {
    list: (params) => api.get('/company/contacts', { params }),
    get: (id) => api.get(`/company/contacts/${id}`),
    create: (data) => api.post('/company/contacts', data),
    update: (id, data) => api.put(`/company/contacts/${id}`, data),
    delete: (id) => api.delete(`/company/contacts/${id}`),
    import: (formData) => api.post('/company/contacts/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  },
  contactGroups: {
    list: () => api.get('/company/contact-groups'),
    get: (id) => api.get(`/company/contact-groups/${id}`),
    create: (data) => api.post('/company/contact-groups', data),
    update: (id, data) => api.put(`/company/contact-groups/${id}`, data),
    delete: (id) => api.delete(`/company/contact-groups/${id}`),
  },
  senderAccounts: {
    list: () => api.get('/company/sender-accounts'),
    get: (id) => api.get(`/company/sender-accounts/${id}`),
    create: (data) => api.post('/company/sender-accounts', data),
    update: (id, data) => api.put(`/company/sender-accounts/${id}`, data),
    delete: (id) => api.delete(`/company/sender-accounts/${id}`),
  },
  suppressionList: {
    list: (params) => api.get('/company/suppression-list', { params }),
    add: (data) => api.post('/company/suppression-list', data),
    remove: (email) => api.delete(`/company/suppression-list/${encodeURIComponent(email)}`),
  },
  analytics: (params) => api.get('/company/analytics', { params }),
  templates: () => api.get('/company/templates'),
  events: {
    list: (params) => api.get('/company/events', { params }),
    get: (id) => api.get(`/company/events/${id}`),
    create: (data) => api.post('/company/events', data),
    update: (id, data) => api.put(`/company/events/${id}`, data),
    delete: (id) => api.delete(`/company/events/${id}`),
  },
};
