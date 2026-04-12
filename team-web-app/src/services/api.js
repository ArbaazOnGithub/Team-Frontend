import axios from 'axios';

// Production Render Backend (Works on any device with internet)
export const API_URL = import.meta.env.VITE_API_URL || "https://team-backend-8gkd.onrender.com/api";
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://team-backend-8gkd.onrender.com";

const api = axios.create({
    baseURL: API_URL,
});

export const updateFcmToken = async (fcmToken) => {
    const res = await api.put('/profile/fcm-token', { fcmToken });
    return res.data;
};

// Interceptor to add token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("team_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    const companyContext = localStorage.getItem("team_company_context");
    if (companyContext) {
        config.headers['x-company-context'] = companyContext;
    }

    const teamContext = localStorage.getItem("team_active_id");
    if (teamContext) {
        config.headers['x-team-context'] = teamContext;
    }

    const adminModeContext = localStorage.getItem("team_admin_mode");
    if (adminModeContext === "true") {
        config.headers['x-admin-mode'] = 'true';
    }

    return config;
}, (error) => {
    return Promise.reject(error);
});

// Interceptor to handle 401s
api.interceptors.response.use((response) => {
    return response;
}, (error) => {
    if (error.response && error.response.status === 401) {
        window.dispatchEvent(new Event('force-logout'));
    }
    return Promise.reject(error);
});

export const fetchRequests = async (calendar = false) => {
    const res = await api.get(calendar ? '/requests?calendar=true' : '/requests');
    return res.data.requests || res.data;
};

export const fetchStats = async () => {
    const res = await api.get('/stats');
    return res.data;
};

export const fetchCompanyBySlug = async (slug) => {
    const res = await api.get(`/companies/${slug}`);
    return res.data;
};

export const loginUser = async (mobile, password, companyId) => {
    const res = await api.post('/login', { mobile, password, companyId });
    return res.data;
};

export const registerUser = async (formData) => {
    const res = await api.post('/register', formData);
    return res.data;
};

export const forgotPassword = async (email, companyId) => {
    const res = await api.post('/forgot-password', { email, companyId });
    return res.data;
};

export const resetPassword = async (email, otp, newPassword, companyId) => {
    const res = await api.post('/reset-password', { email, otp, newPassword, companyId });
    return res.data;
};

export const submitRequest = async (payload) => {
    const res = await api.post('/requests', payload);
    return res.data;
};

export const updateRequestStatus = async (id, status, comment = "") => {
    const res = await api.put(`/requests/${id}`, { status, comment });
    return res.data;
};

export const deleteRequest = async (id) => {
    const res = await api.delete(`/requests/${id}`);
    return res.data;
};

export const updateProfile = async (formData) => {
    const res = await api.put('/profile', formData);
    return res.data;
};

export const fetchDetailedStats = async () => {
    const res = await api.get('/requests/detailed');
    return res.data;
};

// --- ADMIN API ---
export const fetchAllUsers = async () => {
    const res = await api.get('/admin/users');
    return res.data;
};

export const updateUserRole = async (userId, role, teamId = null, managedTeams = null) => {
    const res = await api.put('/admin/users/role', { userId, role, teamId, managedTeams });
    return res.data;
};

export const deleteUser = async (userId) => {
    const res = await api.delete(`/admin/users/${userId}`);
    return res.data;
};

export const fetchRequestLogs = async () => {
    const res = await api.get('/admin/requests/logs');
    return res.data;
};

export const updateUserLeaveBalance = async (userId, newBalance, reason) => {
    const res = await api.put('/admin/users/leave-balance', { userId, newBalance, reason });
    return res.data;
};

export const fetchSystemLogs = async () => {
    const res = await api.get('/admin/system-logs');
    return res.data;
};

export const fetchSystemErrorLogs = async () => {
    const res = await api.get('/admin/superadmin/error-logs');
    return res.data;
};

export const sendAnnouncement = async (message) => {
    const res = await api.post('/admin/announce', { message });
    return res.data;
};

// --- SUPERADMIN COMPANY API ---
export const fetchAllCompanies = async () => {
    const res = await api.get('/admin/superadmin/companies');
    return res.data;
};

export const createCompany = async (payload) => {
    const res = await api.post('/admin/superadmin/companies', payload);
    return res.data;
};

export const deleteCompany = async (companyId) => {
    const res = await api.delete(`/admin/superadmin/companies/${companyId}`);
    return res.data;
};

// --- TEAMS API ---
export const fetchTeamsByCompany = async (companyId) => {
    const res = await api.get(`/teams/company/${companyId}`);
    return res.data;
};

export const createTeam = async (name, companyId) => {
    const res = await api.post('/teams', { name, companyId });
    return res.data;
};

export const updateTeam = async (id, name) => {
    const res = await api.put(`/teams/${id}`, { name });
    return res.data;
};

export const deleteTeam = async (id) => {
    const res = await api.delete(`/teams/${id}`);
    return res.data;
};

// --- NOTIFICATIONS API ---
export const fetchNotifications = async () => {
    const res = await api.get('/notifications');
    return res.data;
};

export const markNotificationsAsRead = async () => {
    const res = await api.put('/notifications/mark-read');
    return res.data;
};

// --- CHAT API ---
export const fetchChatMessages = async () => {
    const res = await api.get('/chat');
    return res.data;
};

export const togglePinMessage = async (messageId) => {
    const res = await api.patch(`/chat/pin/${messageId}`);
    return res.data;
};

export const fetchChatUsers = async () => {
    const res = await api.get('/chat/users');
    return res.data;
};

export const deleteChatMessage = async (messageId) => {
    const res = await api.delete(`/chat/${messageId}`);
    return res.data;
};

export const uploadChatMessageFile = async (file) => {
    const formData = new FormData();
    formData.append('chatFile', file);
    const res = await api.post('/chat/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
};

export const getImageUrl = (path) => {
    if (!path) return "https://ui-avatars.com/api/?name=User&background=68BA7F&color=fff";
    if (path.startsWith("http")) return path;

    let cleanPath = path.replace(/\\/g, "/");
    if (cleanPath.startsWith("/")) cleanPath = cleanPath.substring(1);

    if (cleanPath.includes("via.placeholder.com")) {
        return "https://ui-avatars.com/api/?name=User&background=68BA7F&color=fff";
    }

    const baseUrl = BACKEND_URL.endsWith('/') ? BACKEND_URL.slice(0, -1) : BACKEND_URL;
    return `${baseUrl}/${cleanPath}`;
};
