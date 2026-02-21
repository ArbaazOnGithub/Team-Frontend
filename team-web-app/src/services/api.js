export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export const fetchRequests = async (token) => {
    const res = await fetch(`${API_URL}/requests`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error("Failed to load requests");
    const data = await res.json();
    return data.requests || data;
};

export const fetchStats = async (token) => {
    const res = await fetch(`${API_URL}/stats`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error("Failed to load stats");
    return await res.json();
};

export const loginUser = async (mobile, password) => {
    const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");
    return data;
};

export const registerUser = async (formData) => {
    const res = await fetch(`${API_URL}/register`, { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Registration failed");
    return data;
};

export const forgotPassword = async (email) => {
    const res = await fetch(`${API_URL}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to send OTP");
    return data;
};

export const resetPassword = async (email, otp, newPassword) => {
    const res = await fetch(`${API_URL}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Reset failed");
    return data;
};

export const submitRequest = async (token, payload) => {
    const res = await fetch(`${API_URL}/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Failed to submit request");
    return await res.json();
};

export const updateRequestStatus = async (token, id, status, comment = "") => {
    const res = await fetch(`${API_URL}/requests/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status, comment })
    });
    if (!res.ok) throw new Error("Failed to update status");
    return await res.json();
};

export const deleteRequest = async (token, id) => {
    const res = await fetch(`${API_URL}/requests/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Failed to delete request");
    return await res.json();
};

export const updateProfile = async (token, formData) => {
    const res = await fetch(`${API_URL}/profile`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Update failed");
    return data;
};

export const fetchDetailedStats = async (token) => {
    const res = await fetch(`${API_URL}/requests/detailed`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Failed to load detailed stats");
    return await res.json();
};

// --- ADMIN API ---
export const fetchAllUsers = async (token) => {
    const res = await fetch(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Failed to fetch users");
    return await res.json();
};

export const updateUserRole = async (token, userId, role) => {
    const res = await fetch(`${API_URL}/admin/users/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId, role })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to update role");
    return data;
};

export const deleteUser = async (token, userId) => {
    const res = await fetch(`${API_URL}/admin/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to delete user");
    return data;
};

export const fetchRequestLogs = async (token) => {
    const res = await fetch(`${API_URL}/admin/requests/logs`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Failed to fetch logs");
    return await res.json();
};

export const getImageUrl = (path) => {
    if (!path) return "https://ui-avatars.com/api/?name=User&background=68BA7F&color=fff";
    if (path.startsWith("http")) return path;

    // Clean path and handle potential double uploads
    let cleanPath = path.replace(/\\/g, "/");
    if (cleanPath.startsWith("/")) cleanPath = cleanPath.substring(1);

    // Proactively replace legacy via.placeholder.com
    if (cleanPath.includes("via.placeholder.com")) {
        return "https://ui-avatars.com/api/?name=User&background=68BA7F&color=fff";
    }

    // Ensure BACKEND_URL doesn't end with a slash to avoid double slashes
    const baseUrl = BACKEND_URL.endsWith('/') ? BACKEND_URL.slice(0, -1) : BACKEND_URL;
    return `${baseUrl}/${cleanPath}`;
};

