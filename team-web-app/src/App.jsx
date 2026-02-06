import { useState, useEffect, useMemo } from 'react';
import io from 'socket.io-client';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import * as api from './services/api';

// Components
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import { ForgotPassword, ResetPassword } from './components/Auth/PasswordReset';
import Header from './components/Dashboard/Header';
import Stats from './components/Dashboard/Stats';
import ProfileModal from './components/Dashboard/ProfileModal';
import RequestForm from './components/Requests/RequestForm';
import RequestList from './components/Requests/RequestList';
import AdminDashboard from './components/Admin/AdminDashboard';

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("team_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("team_token") || null);

  // Views: 'login', 'register', 'forgot-password', 'reset-password'
  const [view, setView] = useState("login");

  // Form States
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Forgot Password States
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetMobile, setResetMobile] = useState("");

  // Dashboard States
  const [query, setQuery] = useState("");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const stats = useMemo(() => {
    const counts = { Pending: 0, Approved: 0, Resolved: 0, Cancelled: 0 };
    requests.forEach(req => {
      if (!req.status) return;
      const cleanStatus = req.status.trim();
      const normalized = cleanStatus.charAt(0).toUpperCase() + cleanStatus.slice(1).toLowerCase();
      if (counts[normalized] !== undefined) counts[normalized]++;
    });
    return counts;
  }, [requests]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);


  // --- SOCKET CONNECTION ---
  useEffect(() => {
    let socket = null;
    if (token && user) {
      socket = io("http://localhost:5000", { auth: { token } });
      socket.on("connect", () => console.log("Connected to Socket"));
      socket.on("new_request", (data) => {
        if (user.role === 'admin' || data.user._id === user._id) {
          setRequests((prev) => [data, ...prev]);
          loadStats();
          toast.success(`New request from ${data.user.name}`, { icon: '📝' });
        }
      });
      socket.on("status_update", (updatedItem) => {
        setRequests((prev) => prev.map((item) => (item._id === updatedItem._id ? updatedItem : item)));
        loadStats();
        if (updatedItem.user._id === user._id) {
          toast(`Request status updated: ${updatedItem.status}`, { icon: '🔔' });
        }
      });
      socket.on("request_deleted", (data) => {
        setRequests((prev) => prev.filter(item => item._id !== data.id));
        loadStats();
      });
    }
    return () => { if (socket) socket.disconnect(); };
  }, [token, user]);

  // --- INITIAL DATA FETCH ---
  useEffect(() => {
    if (user && token) {
      loadRequests();
      loadStats();
    }
  }, [user, token]);

  useEffect(() => {
    const handleOpenProfile = () => setIsProfileOpen(true);
    window.addEventListener('open-profile', handleOpenProfile);
    return () => window.removeEventListener('open-profile', handleOpenProfile);
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await api.fetchRequests(token);
      setRequests(data);
    } catch (err) { setError("Failed to load requests"); } finally { setLoading(false); }
  };

  const loadStats = async () => {
    // Stats are now derived from frontend requests list
  };

  // --- AUTH HANDLERS ---
  const handleRegister = async (e) => {
    e.preventDefault();
    setError(""); setSuccessMsg("");

    if (!mobile || !password || !name || !email || !imageFile) return setError("Please fill all fields!");

    const formData = new FormData();
    formData.append("mobile", mobile);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("name", name);
    formData.append("profileImage", imageFile);

    setLoading(true);
    try {
      const data = await api.registerUser(formData);
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem("team_user", JSON.stringify(data.user));
      localStorage.setItem("team_token", data.token);
      resetForms();
      toast.success("Account created successfully!");
    } catch (err) {
      setError(err.message || "Registration Failed");
      toast.error(err.message || "Registration Failed");
    } finally { setLoading(false); }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); setSuccessMsg("");
    if (!mobile || !password) return setError("Please enter credentials");

    setLoading(true);
    try {
      const data = await api.loginUser(mobile, password);
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem("team_user", JSON.stringify(data.user));
      localStorage.setItem("team_token", data.token);
      resetForms();
      toast.success(`Welcome back, ${data.user.name}!`);
    } catch (err) {
      setError(err.message || "Login Failed");
      toast.error(err.message || "Login Failed");
    } finally { setLoading(false); }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError(""); setSuccessMsg("");
    if (!email) return setError("Please enter your registered email");

    setLoading(true);
    try {
      const data = await api.forgotPassword(email);
      setSuccessMsg(data.message);
      if (data.mobile) setResetMobile(data.mobile);
      toast.success(data.message);
      setTimeout(() => setView("reset-password"), 1500);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally { setLoading(false); }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(""); setSuccessMsg("");
    if (!otp || !newPassword) return setError("Please enter OTP and new password");

    setLoading(true);
    try {
      await api.resetPassword(email, otp, newPassword);
      setSuccessMsg("Password reset successfully! Redirecting to login...");
      toast.success("Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        setView("login");
        resetForms();
      }, 2000);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally { setLoading(false); }
  }

  const handleLogout = () => {
    setUser(null); setToken(null); setRequests([]); setView("login");
    localStorage.removeItem("team_user");
    localStorage.removeItem("team_token");
    toast.success("Logged out successfully!");
  };

  const resetForms = () => {
    setMobile(""); setName(""); setPassword(""); setEmail(""); setOtp(""); setNewPassword("");
    setImageFile(null); setImagePreview(null); setError(""); setSuccessMsg("");
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // --- DASHBOARD ACTIONS ---
  const handleRequestSubmit = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const newReq = await api.submitRequest(token, query);
      setRequests(prev => [newReq, ...prev]);
      setQuery(""); setError("");
      toast.success("Request submitted!");
    } catch (err) {
      setError("Failed to submit");
      toast.error("Failed to submit");
    } finally { setLoading(false); }
  };

  const handleChangeStatus = async (id, newStatus, comment = "") => {
    try {
      await api.updateRequestStatus(token, id, newStatus, comment);
      toast.success(`Updated to ${newStatus}`);
    }
    catch (err) {
      setError("Failed to update");
      toast.error("Failed to update");
    }
  };

  const handleDeleteRequest = async (id) => {
    if (!window.confirm("Delete?")) return;
    try {
      await api.deleteRequest(token, id);
      toast.success("Request deleted");
    }
    catch (err) {
      setError("Failed to delete");
      toast.error("Failed to delete");
    }
  };

  const handleProfileUpdate = async (formData) => {
    setLoading(true);
    try {
      const data = await api.updateProfile(token, formData);
      setUser(data.user);
      setIsProfileOpen(false);
      toast.success("Profile updated!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter(req =>
    (filterStatus === "all" || req.status.toLowerCase() === filterStatus.toLowerCase()) &&
    (req.query.toLowerCase().includes(searchQuery.toLowerCase()) || (req.user?.name || "").toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatDate = (date) => new Date(date).toLocaleDateString();

  // --- RENDER ---
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-5 bg-auth-gradient">
        <Toaster position="top-center" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }}></div>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card p-10 w-full max-w-md relative z-10 border-white/20"
          >
            <h2 className="text-4xl font-black text-center mb-8 bg-gradient-to-r from-slate-800 to-slate-500 bg-clip-text text-transparent">
              {view === "login" ? "Team Login" :
                view === "register" ? "Create Account" :
                  view === "forgot-password" ? "Forgot Password" : "Reset Password"}
            </h2>

            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-center text-sm">{error}</div>}
            {successMsg && <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-4 text-center text-sm">{successMsg}</div>}

            {view === "login" && (
              <Login
                mobile={mobile} setMobile={setMobile}
                password={password} setPassword={setPassword}
                loading={loading} handleLogin={handleLogin}
                setView={setView} resetForms={resetForms}
              />
            )}

            {view === "register" && (
              <Register
                name={name} setName={setName}
                email={email} setEmail={setEmail}
                mobile={mobile} setMobile={setMobile}
                password={password} setPassword={setPassword}
                imagePreview={imagePreview} handleImageChange={handleImageChange}
                loading={loading} handleRegister={handleRegister}
                setView={setView} resetForms={resetForms}
              />
            )}

            {view === "forgot-password" && (
              <ForgotPassword
                email={email} setEmail={setEmail}
                loading={loading} handleForgotPassword={handleForgotPassword}
                setView={setView}
              />
            )}

            {view === "reset-password" && (
              <ResetPassword
                email={email} otp={otp} setOtp={setOtp}
                newPassword={newPassword} setNewPassword={setNewPassword}
                loading={loading} handleResetPassword={handleResetPassword}
                mobile={resetMobile}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mesh pb-20">
      <Toaster position="top-center" />
      <Header user={user} handleLogout={handleLogout} setView={setView} />

      <ProfileModal
        isOpen={isProfileOpen}
        user={user}
        onClose={() => setIsProfileOpen(false)}
        onUpdate={handleProfileUpdate}
        loading={loading}
      />

      <div className="max-w-2xl mx-auto px-6 py-12">
        {view === 'admin' ? (
          <AdminDashboard
            token={token}
            user={user}
            onBack={() => setView('dashboard')}
          />
        ) : (
          <>
            {error && <div className="glass bg-emerald-50/50 text-[#2E6F40] p-4 rounded-xl mb-8 text-center text-sm font-bold border-[#68BA7F]/20">{error}</div>}

            <Stats stats={stats} />

            <RequestForm
              query={query} setQuery={setQuery}
              submitRequest={handleRequestSubmit} loading={loading}
            />

            <div className="flex items-center gap-4 mb-8">
              <div className="relative flex-1 group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#68BA7F]/50 group-focus-within:text-[#2E6F40] transition-colors">🔍</span>
                <input
                  type="text"
                  placeholder="Search queries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-premium pl-12 py-3 bg-white/70 border-[#68BA7F]/30 focus:bg-white"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input-premium w-40 py-3 bg-white/70 border-[#68BA7F]/30 font-bold text-xs uppercase tracking-widest cursor-pointer focus:bg-white text-[#253D2C]"
              >
                <option value="all">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Resolved">Resolved</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <RequestList
              requests={filteredRequests}
              user={user}
              changeStatus={handleChangeStatus}
              deleteRequest={handleDeleteRequest}
              formatDate={formatDate}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default App;