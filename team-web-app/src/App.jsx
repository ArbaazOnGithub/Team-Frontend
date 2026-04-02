import { useState, useEffect, useMemo, useRef, lazy, Suspense } from 'react';
import io from 'socket.io-client';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import * as api from './services/api';
import { useAuth } from './context/AuthContext';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { StatusBar, Style } from '@capacitor/status-bar';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { PushNotifications } from '@capacitor/push-notifications';
import { checkBiometricAvailability, authenticateWithBiometrics } from './utils/biometricAuth';

// Components
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import { ForgotPassword, ResetPassword } from './components/Auth/PasswordReset';
import Header from './components/Dashboard/Header';
import Stats from './components/Dashboard/Stats';
import ProfileModal from './components/Dashboard/ProfileModal';
import RequestForm from './components/Requests/RequestForm';
import RequestList from './components/Requests/RequestList';
const AdminDashboard = lazy(() => import('./components/Admin/AdminDashboard'));
const AnnouncementModal = lazy(() => import('./components/Dashboard/AnnouncementModal'));
const ChatSection = lazy(() => import('./components/Dashboard/ChatSection'));

function App() {
  const { user, token, login, logout, updateUserData } = useAuth();

  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [hasSavedCredentials, setHasSavedCredentials] = useState(false);
  const [useBiometric, setUseBiometric] = useState(false);

  // --- CAPACITOR INITIALIZATION ---
  useEffect(() => {
    const initCapacitor = async () => {
      if (Capacitor.isNativePlatform()) {
        StatusBar.setOverlaysWebView({ overlay: false });
        StatusBar.setBackgroundColor({ color: '#2E6F40' });
        StatusBar.setStyle({ style: Style.Dark });
        LocalNotifications.requestPermissions();

        // Check Biometrics
        const available = await checkBiometricAvailability();
        setIsBiometricSupported(available);
        if (available) {
          const { value } = await Preferences.get({ key: 'biometric_credentials' });
          if (value) setHasSavedCredentials(true);
        }
      }
    };
    initCapacitor();
  }, []);

  const triggerHaptic = async (style = ImpactStyle.Light) => {
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style });
    }
  };

  const handleBiometricLogin = async () => {
    const authenticated = await authenticateWithBiometrics();
    if (authenticated) {
      const { value } = await Preferences.get({ key: 'biometric_credentials' });
      if (value) {
        const { mobile, password, companySlug } = JSON.parse(value);
        // Simulate auto-login call
        setCompanySlug(companySlug);
        setMobile(mobile);
        setPassword(password);
        // Trigger actual login
        setTimeout(() => {
          const fakeEvent = { preventDefault: () => { } };
          handleLogin(fakeEvent, mobile, password, companySlug);
        }, 100);
      }
    }
  };

  // Views: 'login', 'register', 'forgot-password', 'reset-password'
  const [view, setView] = useState("login");

  // Form States
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companySlug, setCompanySlug] = useState("");
  const [name, setName] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Forgot Password States
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetMobile, setResetMobile] = useState("");

  // Leave Form States
  const [requestType, setRequestType] = useState("General");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");

  // Dashboard States
  const [query, setQuery] = useState("");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const isSubmittingRef = useRef(false);
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
  const [currentAnnouncement, setCurrentAnnouncement] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatUsers, setChatUsers] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [availableCompanies, setAvailableCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState(() => localStorage.getItem("team_company_context") || "");


  // --- SOCKET CONNECTION ---
  useEffect(() => {
    let socket = null;
    if (token && user) {
      socket = io(api.BACKEND_URL, { auth: { token } });
      socket.on("connect", () => console.log("Connected to Socket"));
      socket.on("new_request", (data) => {
        if (['admin', 'superadmin'].includes(user.role) || data.user._id === user._id) {
          setRequests((prev) => {
            // Deduplicate: If request already exists in state, don't add it again
            if (prev.some(req => req._id === data._id)) return prev;
            return [data, ...prev];
          });
          loadStats();

          // Only show toast if the request is NOT from the current user
          if (data.user._id !== user._id) {
            toast.success(`New request from ${data.user.name}`, { icon: '📝' });
          }
        }
      });
      socket.on("status_update", (updatedItem) => {
        setRequests((prev) => prev.map((item) => (item._id === updatedItem._id ? updatedItem : item)));
        loadStats();
        // Socket room ensures only the correct user hears this if we were using private events, 
        // but status_update is broadcasted to all admins or the requester. 
        // For the new 'notification_received' event, it's already room-restricted on backend.
      });
      socket.on("request_deleted", (data) => {
        setRequests((prev) => prev.filter(item => item._id !== data.id));
        loadStats();
      });
      socket.on("admin_announcement", (data) => {
        setCurrentAnnouncement(data);
        // Also refresh requests to show new notification in the bell
        loadRequests();
      });
      socket.on("receive_message", (msg) => {
        setChatMessages(prev => [...prev, msg]);
        
        // Local Notification for Chat
        if (Capacitor.isNativePlatform() && (msg.sender._id !== user._id)) {
          LocalNotifications.schedule({
            notifications: [
              {
                title: `New message from ${msg.sender.name}`,
                body: msg.content,
                id: Math.floor(Math.random() * 10000),
                schedule: { at: new Date(Date.now() + 1000) },
                sound: 'default'
              }
            ]
          });
          triggerHaptic(ImpactStyle.Medium);
        }
      });
      socket.on("message_pinned", (updatedMsg) => {
        setChatMessages(prev => prev.map(m => m._id === updatedMsg._id ? updatedMsg : m));
      });
      socket.on("message_read_update", ({ messageId, readBy }) => {
        setChatMessages(prev => prev.map(m => m._id === messageId ? { ...m, readBy } : m));
      });
      socket.on("message_deleted", (messageId) => {
        setChatMessages(prev => prev.filter(m => m._id !== messageId));
      });
    }
    return () => { if (socket) socket.disconnect(); };
  }, [token, user]);

  // --- INITIAL DATA FETCH ---
  useEffect(() => {
    if (user && token) {
      loadRequests();
      loadStats();
      loadChat();
      loadChatUsers();

      if (Capacitor.isNativePlatform()) {
        setupPushNotifications();
      }

      if (user.role === 'superadmin') {
        loadAvailableCompanies();
      }
    }
  }, [user, token, selectedCompanyId]);

  const setupPushNotifications = async () => {
    try {
      let permStatus = await PushNotifications.checkPermissions();

      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }

      if (permStatus.receive !== 'granted') {
        throw new Error('Push notification permission denied');
      }

      await PushNotifications.register();

      PushNotifications.addListener('registration', async (token) => {
        console.log('Push registration success, token: ' + token.value);
        try {
          await api.updateFcmToken(token.value);
        } catch (err) {
          console.error("Failed to sync FCM token to backend", err);
        }
      });

      PushNotifications.addListener('registrationError', (error) => {
        console.error('Error on registration: ' + JSON.stringify(error));
      });

      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Push received: ' + JSON.stringify(notification));
        toast.success(notification.title || 'Notification received', { icon: '🔔' });
      });

      PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.log('Push action performed: ' + JSON.stringify(notification));
        if (notification.notification.data?.type === 'chat') {
          setIsChatOpen(true);
        }
      });
    } catch (err) {
      console.error("Push Notifications Setup Failed:", err);
    }
  };

  const loadAvailableCompanies = async () => {
    try {
      const data = await api.fetchAllCompanies();
      setAvailableCompanies(data);
    } catch (err) {
      console.error("Failed to load companies for switcher");
    }
  };

  const handleCompanyContextChange = (companyId) => {
    setSelectedCompanyId(companyId);
    if (companyId) {
      localStorage.setItem("team_company_context", companyId);
      toast.success("Switched company context");
    } else {
      localStorage.removeItem("team_company_context");
      toast.success("Reset to default company");
    }
  };

  const loadChat = async () => {
    try {
      const msgs = await api.fetchChatMessages();
      setChatMessages(msgs);
    } catch (err) { console.error("Chat load failed"); }
  };

  const loadChatUsers = async () => {
    try {
      const users = await api.fetchChatUsers();
      setChatUsers(users);
    } catch (err) { console.error("Users load failed"); }
  };

  useEffect(() => {
    const handleOpenProfile = () => setIsProfileOpen(true);
    const handleOpenChat = () => setIsChatOpen(true);
    const handleForceLogout = () => handleLogout();

    window.addEventListener('open-profile', handleOpenProfile);
    window.addEventListener('open-chat', handleOpenChat);
    window.addEventListener('force-logout', handleForceLogout);

    return () => {
      window.removeEventListener('open-profile', handleOpenProfile);
      window.removeEventListener('open-chat', handleOpenChat);
      window.removeEventListener('force-logout', handleForceLogout);
    };
  }, []);

  useEffect(() => {
    const handleOnline = () => toast.success("Back online!", { icon: '🌐' });
    const handleOffline = () => toast.error("You are offline", { icon: '📶' });
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await api.fetchRequests();
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
      const company = await api.fetchCompanyBySlug(companySlug.toLowerCase().trim());
      formData.append("companyId", company._id);

      const data = await api.registerUser(formData);
      login(data.user, data.token);
      resetForms();
      toast.success("Account created successfully!");
    } catch (err) {
      const msg = err.response?.data?.error || err.message || "Registration Failed";
      setError(msg);
      toast.error(msg);
    } finally { setLoading(false); }
  };

  const handleLogin = async (e, forcedMobile, forcedPassword, forcedSlug) => {
    if (e) e.preventDefault();
    setError(""); setSuccessMsg("");

    const loginSlug = forcedSlug || companySlug;
    const loginMobile = forcedMobile || mobile;
    const loginPassword = forcedPassword || password;

    if (!loginSlug) return setError("Company ID is required");
    if (!loginMobile || !loginPassword) return setError("Please enter credentials");

    setLoading(true);
    try {
      const company = await api.fetchCompanyBySlug(loginSlug.toLowerCase().trim());
      const data = await api.loginUser(loginMobile, loginPassword, company._id);
      
      // Save for Biometrics if requested
      if (isBiometricSupported && useBiometric) {
        await Preferences.set({
          key: 'biometric_credentials',
          value: JSON.stringify({ mobile: loginMobile, password: loginPassword, companySlug: loginSlug })
        });
        setHasSavedCredentials(true);
      }

      login(data.user, data.token);
      resetForms();
      triggerHaptic(ImpactStyle.Medium);
      toast.success(`Welcome back, ${data.user.name}!`);
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || "Login Failed";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally { setLoading(false); }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError(""); setSuccessMsg("");
    if (!companySlug) return setError("Company ID is required");
    if (!email) return setError("Please enter your registered email");

    setLoading(true);
    try {
      const company = await api.fetchCompanyBySlug(companySlug.toLowerCase().trim());
      const data = await api.forgotPassword(email, company._id);
      setSuccessMsg(data.message);
      if (data.mobile) setResetMobile(data.mobile);
      toast.success(data.message);
      setTimeout(() => setView("reset-password"), 1500);
    } catch (err) {
      const msg = err.response?.data?.details || err.response?.data?.error || err.message || "Request failed";
      setError(msg);
      toast.error(msg);
    } finally { setLoading(false); }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(""); setSuccessMsg("");
    if (!otp || !newPassword) return setError("Please enter OTP and new password");

    setLoading(true);
    try {
      const company = await api.fetchCompanyBySlug(companySlug.toLowerCase().trim());
      await api.resetPassword(email, otp, newPassword, company._id);
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
    logout();
    setRequests([]);
    setView("login");
  };

  const resetForms = () => {
    setMobile(""); setName(""); setPassword(""); setEmail(""); setOtp(""); setNewPassword(""); setCompanySlug("");
    setImageFile(null); setImagePreview(null); setError(""); setSuccessMsg("");
    setQuery(""); setRequestType("General"); setStartDate(""); setEndDate("");
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
    if (!query.trim() || isSubmittingRef.current) return;

    let payload = { query: query.trim(), requestType };
    if (requestType === 'Leave') {
      if (!startDate || !endDate) return toast.error("Please select both dates");
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      payload = { ...payload, startDate, endDate, daysCount: diffDays };
    }
    if (attachmentUrl) {
      payload.attachmentUrl = attachmentUrl;
    }

    isSubmittingRef.current = true;
    setLoading(true);
    try {
      const newReq = await api.submitRequest(payload);
      setRequests((prev) => {
        if (prev.some(r => r._id === newReq._id)) return prev;
        return [newReq, ...prev];
      });
      resetForms();
      triggerHaptic(ImpactStyle.Heavy);
      toast.success("Request submitted!");
    } catch (err) {
      const msg = err.response?.data?.error || err.message || "Failed to submit";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  const handleChangeStatus = async (id, newStatus, comment = "") => {
    try {
      await api.updateRequestStatus(id, newStatus, comment);
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
      await api.deleteRequest(id);
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
      const data = await api.updateProfile(formData);
      updateUserData(data.user);
      setIsProfileOpen(false);
      toast.success("Profile updated!");
    } catch (err) {
      toast.error(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = (content) => {
    const socket = io(api.BACKEND_URL, { auth: { token } });
    socket.emit('send_message', content);
  };

  const handleTogglePinMessage = async (id) => {
    try {
      await api.togglePinMessage(id);
    } catch (err) {
      toast.error(err.response?.data?.error || err.message);
    }
  };

  const handleMarkRead = (messageId) => {
    const socket = io(api.BACKEND_URL, { auth: { token } });
    socket.emit('mark_read', messageId);
  };

  const handleDeleteChatMessage = async (messageId) => {
    try {
      await api.deleteChatMessage(messageId);
      toast.success("Message deleted");
    } catch (err) {
      toast.error(err.response?.data?.error || err.message);
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
                companySlug={companySlug} setCompanySlug={setCompanySlug}
                mobile={mobile} setMobile={setMobile}
                password={password} setPassword={setPassword}
                loading={loading} handleLogin={handleLogin}
                setView={setView} resetForms={resetForms}
                isBiometricSupported={isBiometricSupported}
                hasSavedCredentials={hasSavedCredentials}
                handleBiometricLogin={handleBiometricLogin}
                useBiometric={useBiometric}
                setUseBiometric={setUseBiometric}
              />
            )}

            {view === "register" && (
              <Register
                companySlug={companySlug} setCompanySlug={setCompanySlug}
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
                companySlug={companySlug} setCompanySlug={setCompanySlug}
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

      <Suspense fallback={null}>
        <AnnouncementModal
          announcement={currentAnnouncement}
          onClose={() => setCurrentAnnouncement(null)}
        />
      </Suspense>

      <Suspense fallback={null}>
        <ChatSection
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          user={user}
          token={token}
          messages={chatMessages}
          users={chatUsers}
          onSendMessage={handleSendMessage}
          onTogglePin={handleTogglePinMessage}
          onMarkRead={handleMarkRead}
          onDeleteMessage={handleDeleteChatMessage}
        />
      </Suspense>

      <div className="max-w-2xl mx-auto px-6 py-12">
        {view === 'admin' ? (
          <Suspense fallback={<div className="p-10 text-center font-bold text-[#68BA7F]">Loading Admin Dashboard...</div>}>
            <AdminDashboard
              onBack={() => setView('dashboard')}
            />
          </Suspense>
        ) : (
          <>
            {user.role === 'superadmin' && availableCompanies.length > 0 && (
              <div className="glass p-4 rounded-2xl mb-8 border-[#68BA7F]/30 bg-white/50 animate-fade-in shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🏢</span>
                    <h4 className="font-black text-[#2E6F40] text-xs uppercase tracking-widest">Global Company View</h4>
                  </div>
                  <select 
                    value={selectedCompanyId} 
                    onChange={(e) => handleCompanyContextChange(e.target.value)}
                    className="bg-white border-[#68BA7F]/30 text-[#253D2C] font-bold text-sm rounded-xl px-4 py-2 outline-none focus:ring-2 ring-[#68BA7F]/20 transition-all min-w-[200px]"
                  >
                    <option value="">My Default Company (N1Solution)</option>
                    {availableCompanies.map(comp => (
                      <option key={comp._id} value={comp._id}>{comp.name} ({comp.slug})</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
            {error && <div className="glass bg-emerald-50/50 text-[#2E6F40] p-4 rounded-xl mb-8 text-center text-sm font-bold border-[#68BA7F]/20">{error}</div>}

            <Stats stats={stats} loading={loading} />

            <RequestForm
              query={query} setQuery={setQuery}
              submitRequest={handleRequestSubmit} loading={loading}
              requestType={requestType} setRequestType={setRequestType}
              startDate={startDate} setStartDate={setStartDate}
              endDate={endDate} setEndDate={setEndDate}
              paidLeaveBalance={user.paidLeaveBalance}
              attachmentUrl={attachmentUrl}
              setAttachmentUrl={setAttachmentUrl}
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
              loading={loading}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default App;