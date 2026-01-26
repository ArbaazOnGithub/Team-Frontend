import { useState, useEffect } from 'react';
import io from 'socket.io-client';

const API_URL = "http://localhost:5000/api";

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  
  // Views: 'login', 'register', 'forgot-password', 'reset-password'
  const [view, setView] = useState("login");

  // Form States
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState(""); // <--- NEW STATE
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  // Forgot Password States
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Dashboard States
  const [query, setQuery] = useState("");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState(""); // <--- NEW STATE for success messages
  const [filterStatus, setFilterStatus] = useState("all");
  const [stats, setStats] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  // --- SOCKET CONNECTION ---
  useEffect(() => {
    let socket = null;
    if (token && user) {
       socket = io("http://localhost:5000", { auth: { token } });
       socket.on("connect", () => console.log("Connected to Socket"));
       socket.on("new_request", (data) => {
         if (user.role === 'admin' || data.user._id === user._id) {
            setRequests((prev) => [data, ...prev]);
            fetchStats();
         }
       });
       socket.on("status_update", (updatedItem) => {
         setRequests((prev) => prev.map((item) => (item._id === updatedItem._id ? updatedItem : item)));
         fetchStats();
       });
       socket.on("request_deleted", (data) => {
         setRequests((prev) => prev.filter(item => item._id !== data.id));
         fetchStats();
       });
    }
    return () => { if (socket) socket.disconnect(); };
  }, [token, user]);

  // --- INITIAL DATA FETCH ---
  useEffect(() => {
    if (user && token) {
      fetchRequests();
      fetchStats();
    }
  }, [user, token]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/requests`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setRequests(data.requests || data);
    } catch (err) { setError("Failed to load requests"); } finally { setLoading(false); }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/stats`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setStats(data);
    } catch (err) { console.error("Stats error:", err); }
  };

  // --- AUTH HANDLERS ---
  const handleRegister = async (e) => {
    e.preventDefault();
    setError(""); setSuccessMsg("");

    if (!mobile || !password || !name || !email || !imageFile) return setError("Please fill all fields!");
    if (!/^[0-9]{10}$/.test(mobile)) return setError("Mobile must be 10 digits");
    if (password.length < 6) return setError("Password must be at least 6 characters");

    const formData = new FormData();
    formData.append("mobile", mobile);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("name", name);
    formData.append("profileImage", imageFile);

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/register`, { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      
      setUser(data.user);
      setToken(data.token);
      resetForms();
    } catch (err) { setError(err.message || "Registration Failed"); } finally { setLoading(false); }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); setSuccessMsg("");
    if (!mobile || !password) return setError("Please enter credentials");

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      
      setUser(data.user);
      setToken(data.token);
      resetForms();
    } catch (err) { setError(err.message || "Login Failed"); } finally { setLoading(false); }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError(""); setSuccessMsg("");
    if (!email) return setError("Please enter your registered email");

    setLoading(true);
    try {
        const res = await fetch(`${API_URL}/forgot-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });
        const data = await res.json();
        if(!res.ok) throw new Error(data.error || "Failed to send OTP");
        
        setSuccessMsg(data.message);
        // Switch to OTP entry view
        setTimeout(() => setView("reset-password"), 1500);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const handleResetPassword = async (e) => {
      e.preventDefault();
      setError(""); setSuccessMsg("");
      if(!otp || !newPassword) return setError("Please enter OTP and new password");

      setLoading(true);
      try {
          const res = await fetch(`${API_URL}/reset-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, otp, newPassword })
          });
          const data = await res.json();
          if(!res.ok) throw new Error(data.error || "Reset failed");

          setSuccessMsg("Password reset successfully! Redirecting to login...");
          setTimeout(() => {
              setView("login");
              resetForms();
          }, 2000);
      } catch (err) { setError(err.message); } finally { setLoading(false); }
  }

  const handleLogout = () => {
    setUser(null); setToken(null); setRequests([]); setStats({}); setView("login");
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
  const submitRequest = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ query: query.trim() })
      });
      if (!res.ok) throw new Error("Failed");
      setQuery(""); setError("");
    } catch (err) { setError("Failed to submit"); } finally { setLoading(false); }
  };

  const changeStatus = async (id, newStatus) => {
    try { await fetch(`${API_URL}/requests/${id}`, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ status: newStatus }) }); } 
    catch (err) { setError("Failed to update"); }
  };

  const deleteRequest = async (id) => {
    if (!window.confirm("Delete?")) return;
    try { await fetch(`${API_URL}/requests/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }); } 
    catch (err) { setError("Failed to delete"); }
  };

  const getImageUrl = (path) => {
    if (!path) return "https://via.placeholder.com/50";
    let cleanPath = path.replace(/\\/g, "/");
    if (cleanPath.startsWith("/")) cleanPath = cleanPath.substring(1);
    return `http://localhost:5000/${cleanPath}`;
  };

  const filteredRequests = requests.filter(req => 
    (filterStatus === "all" || req.status === filterStatus) &&
    (req.query.toLowerCase().includes(searchQuery.toLowerCase()) || (req.user?.name || "").toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatDate = (date) => new Date(date).toLocaleDateString();

  // --- RENDER ---
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-5 bg-gradient-to-br from-purple-600 to-purple-900">
        <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md">
          <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
            {view === "login" ? "Team Login" : 
             view === "register" ? "Create Account" : 
             view === "forgot-password" ? "Forgot Password" : "Reset Password"}
          </h2>
          
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-center text-sm">{error}</div>}
          {successMsg && <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-4 text-center text-sm">{successMsg}</div>}

          {/* LOGIN VIEW */}
          {view === "login" && (
            <div>
              <input type="tel" placeholder="Mobile Number" value={mobile} onChange={(e) => setMobile(e.target.value)} className="w-full p-3 mb-4 border-2 border-gray-200 rounded-lg" maxLength={10} />
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleLogin(e)} className="w-full p-3 mb-4 border-2 border-gray-200 rounded-lg" />
              <button onClick={handleLogin} disabled={loading} className="w-full p-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition disabled:opacity-50">
                {loading ? "Logging in..." : "Login"}
              </button>
              <div className="flex justify-between mt-5 text-sm">
                <span onClick={() => { setView("register"); resetForms(); }} className="text-purple-600 cursor-pointer font-bold underline">Register</span>
                <span onClick={() => { setView("forgot-password"); resetForms(); }} className="text-gray-500 cursor-pointer hover:text-gray-700">Forgot Password?</span>
              </div>
            </div>
          )}

          {/* REGISTER VIEW */}
          {view === "register" && (
            <div>
              <div className="flex flex-col items-center mb-5">
                {imagePreview ? <img src={imagePreview} className="w-24 h-24 rounded-full object-cover mb-3 border-4 border-purple-600" /> : <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center text-4xl mb-3">📷</div>}
                <label htmlFor="file-upload" className="px-5 py-2 bg-gray-100 rounded-lg cursor-pointer text-sm">Select Image</label>
                <input id="file-upload" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </div>
              <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3 mb-3 border-2 border-gray-200 rounded-lg" />
              <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 mb-3 border-2 border-gray-200 rounded-lg" />
              <input type="tel" placeholder="Mobile (10 digits)" value={mobile} onChange={(e) => setMobile(e.target.value)} className="w-full p-3 mb-3 border-2 border-gray-200 rounded-lg" maxLength={10} />
              <input type="password" placeholder="Password (min 6 chars)" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 mb-4 border-2 border-gray-200 rounded-lg" />
              <button onClick={handleRegister} disabled={loading} className="w-full p-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition disabled:opacity-50">Register Now</button>
              <p className="text-center mt-5 text-sm text-gray-600">Have an account? <span onClick={() => { setView("login"); resetForms(); }} className="text-purple-600 cursor-pointer font-bold underline">Login</span></p>
            </div>
          )}

          {/* FORGOT PASSWORD VIEW */}
          {view === "forgot-password" && (
            <div>
                <p className="text-gray-600 mb-4 text-center">Enter your registered email to receive an OTP.</p>
                <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 mb-4 border-2 border-gray-200 rounded-lg" />
                <button onClick={handleForgotPassword} disabled={loading} className="w-full p-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50">
                    {loading ? "Sending OTP..." : "Send OTP"}
                </button>
                <p className="text-center mt-4 text-sm text-gray-500 cursor-pointer hover:text-gray-700" onClick={() => setView("login")}>Back to Login</p>
            </div>
          )}

          {/* RESET PASSWORD VIEW */}
          {view === "reset-password" && (
             <div>
                <p className="text-gray-600 mb-4 text-center">Enter the OTP sent to <b>{email}</b></p>
                <input type="text" placeholder="Enter 6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full p-3 mb-3 border-2 border-gray-200 rounded-lg text-center tracking-widest font-bold" maxLength={6} />
                <input type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full p-3 mb-4 border-2 border-gray-200 rounded-lg" />
                <button onClick={handleResetPassword} disabled={loading} className="w-full p-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition disabled:opacity-50">
                    {loading ? "Updating..." : "Set New Password"}
                </button>
             </div>
          )}
        </div>
      </div>
    );
  }

  // --- DASHBOARD ---
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white px-6 py-4 flex justify-between items-center shadow-sm sticky top-0 z-50">
        <h1 className="text-2xl font-bold text-gray-800">Team Queries</h1>
        <div className="flex items-center gap-3">
          <img src={getImageUrl(user.profileImage)} className="w-11 h-11 rounded-full object-cover border-2 border-gray-200" />
          <div><div className="font-bold text-sm text-gray-800">{user.name}</div><div className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full font-bold w-fit uppercase">{user.role}</div></div>
          <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700">Logout</button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-5">
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-5 text-center">{error}</div>}

        <div className="grid grid-cols-4 gap-4 mb-6">
           {['Pending', 'Approved', 'Resolved', 'Cancelled'].map(s => (
             <div key={s} className={`bg-white p-5 rounded-xl text-center shadow-sm border-t-4 ${s==='Pending'?'border-yellow-500':s==='Approved'?'border-green-600':s==='Resolved'?'border-blue-600':'border-red-600'}`}>
               <div className="text-4xl font-bold text-gray-800">{stats[s]||0}</div><div className="text-xs text-gray-600 uppercase font-semibold mt-1">{s}</div>
             </div>
           ))}
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm mb-6">
          <textarea placeholder="Type your request..." value={query} onChange={(e) => setQuery(e.target.value)} className="w-full min-h-24 p-3 border-2 border-gray-200 rounded-lg mb-2 focus:outline-none focus:border-purple-500" maxLength={1000} />
          <div className="flex justify-between items-center"><span className="text-xs text-gray-400">{query.length}/1000</span><button onClick={submitRequest} disabled={loading || !query.trim()} className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold text-sm hover:bg-purple-700 disabled:opacity-50">Submit Request</button></div>
        </div>

        <div className="flex gap-3 mb-6">
          <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1 p-3 border-2 border-gray-200 rounded-lg text-sm" />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="p-3 border-2 border-gray-200 rounded-lg text-sm bg-white"><option value="all">All</option><option value="Pending">Pending</option><option value="Approved">Approved</option><option value="Resolved">Resolved</option><option value="Cancelled">Cancelled</option></select>
        </div>

        <div className="flex flex-col gap-4 pb-8">
            {filteredRequests.map(req => (
              req.user && <div key={req._id} className={`bg-white rounded-xl p-5 shadow-sm border-l-4 ${req.status==='Pending'?'border-yellow-500':req.status==='Approved'?'border-green-600':req.status==='Resolved'?'border-blue-600':'border-red-600'}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3"><img src={getImageUrl(req.user.profileImage)} className="w-12 h-12 rounded-full object-cover" /><div><h3 className="font-semibold text-gray-800">{req.user.name}</h3><span className="text-xs text-gray-400">{formatDate(req.createdAt)}</span></div></div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${req.status==='Pending'?'bg-yellow-50 text-yellow-600':req.status==='Approved'?'bg-green-50 text-green-600':req.status==='Resolved'?'bg-blue-50 text-blue-600':'bg-red-50 text-red-600'}`}>{req.status}</span>
                  </div>
                  <p className="text-gray-700 leading-relaxed ml-15 mb-4 pl-14">{req.query}</p>
                  {user.role === "admin" && (
                    <div className="flex gap-3 pt-4 border-t border-gray-100 pl-14">
                      <button className="flex-1 py-2.5 bg-green-600 text-white rounded-lg text-xs font-bold uppercase shadow-md hover:bg-green-700" onClick={() => changeStatus(req._id, "Approved")}>✓ Accept</button>
                      <button className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-xs font-bold uppercase shadow-md hover:bg-blue-700" onClick={() => changeStatus(req._id, "Resolved")}>✓ Done</button>
                      <button className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-xs font-bold uppercase shadow-md hover:bg-red-700" onClick={() => changeStatus(req._id, "Cancelled")}>✕ Reject</button>
                    </div>
                  )}
                  {(user.role === "admin" || req.user._id === user._id) && <button className="mt-3 px-4 py-2 bg-gray-400 text-white rounded-lg text-xs hover:bg-gray-500 ml-[3.5rem]" onClick={() => deleteRequest(req._id)}>Delete</button>}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default App;