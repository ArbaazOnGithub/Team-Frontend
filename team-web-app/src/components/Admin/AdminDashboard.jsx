import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import * as api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area, Legend 
} from 'recharts';
import AdminLogs from './AdminLogs';
import ErrorLogs from './ErrorLogs';
import CompanyManagement from './CompanyManagement';
import LeaveCalendar from '../Dashboard/LeaveCalendar';
import AddUserModal from './AddUserModal';
import TeamManagement from './TeamManagement';
import EditUserModal from './EditUserModal';

const AdminDashboard = ({ onBack }) => {
    const { token, user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('analytics');
    const [selectedUserForLeave, setSelectedUserForLeave] = useState(null);
    const [newLeaveBalance, setNewLeaveBalance] = useState(0);
    const [leaveReason, setLeaveReason] = useState("");
    const [announcementMsg, setAnnouncementMsg] = useState("");
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
    const [selectedUserForEdit, setSelectedUserForEdit] = useState(null);

    useEffect(() => {
        if (activeTab === 'users') loadUsers();
        if (activeTab === 'analytics') loadAnalyticsData();
    }, [activeTab]);

    const loadAnalyticsData = async () => {
        setLoading(true);
        try {
            const [usersData, requestsData] = await Promise.all([
                api.fetchAllUsers(),
                api.fetchRequests()
            ]);
            setUsers(usersData);
            setRequests(requestsData);
        } catch (err) {
            toast.error("Failed to load analytics data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedUserForLeave) {
            setNewLeaveBalance(selectedUserForLeave.paidLeaveBalance || 0);
            setLeaveReason("");
        }
    }, [selectedUserForLeave]);

    const handleSendAnnouncement = async () => {
        if (!announcementMsg.trim()) return toast.error("Please enter a message");
        if (!window.confirm("Broadcast this message to ALL users?")) return;

        setLoading(true);
        try {
            await api.sendAnnouncement(announcementMsg);
            toast.success("Announcement broadcasted!");
            setAnnouncementMsg("");
        } catch (err) {
            toast.error(err.response?.data?.error || err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateBalance = async () => {
        if (!leaveReason.trim()) return toast.error("Please provide a reason");
        setLoading(true);
        try {
            await api.updateUserLeaveBalance(selectedUserForLeave._id, newLeaveBalance, leaveReason);
            setUsers(prev => prev.map(u => u._id === selectedUserForLeave._id ? { ...u, paidLeaveBalance: newLeaveBalance } : u));
            toast.success("Leave balance updated!");
            setSelectedUserForLeave(null);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const loadUsers = async () => {
        setLoading(true);
        try {
            const data = await api.fetchAllUsers();
            setUsers(data);
        } catch (err) {
            toast.error("Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    const handleEditUser = (user) => {
        setSelectedUserForEdit(user);
        setIsEditUserModalOpen(true);
    };

    const handleDeleteUser = async (userId) => {
        if (userId === currentUser._id) return toast.error("You cannot delete yourself!");
        if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;

        try {
            await api.deleteUser(userId);
            setUsers(prev => prev.filter(u => u._id !== userId));
            toast.success("User deleted successfully");
        } catch (err) {
            toast.error(err.message);
        }
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.mobile.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-mesh p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <button
                            onClick={onBack}
                            className="flex items-center gap-2 text-[#547792] hover:text-[#94B4C1] font-bold hover:gap-3 transition-all mb-2"
                        >
                            <span>←</span> Back to Dashboard
                        </button>
                        <h1 className="text-3xl font-black text-white">Admin Panel</h1>
                    </div>

                    <div className="flex w-full md:w-auto overflow-x-auto bg-black/30 p-1 rounded-2xl border border-[#547792]/20">
                        <div className="flex min-w-max">
                            <button
                                onClick={() => setActiveTab('analytics')}
                                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'analytics' ? 'bg-[#547792] text-white shadow-lg' : 'text-white/60 hover:text-white'}`}
                            >
                                📊 Analytics
                            </button>
                            <button
                                onClick={() => setActiveTab('users')}
                                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'users' ? 'bg-[#547792] text-white shadow-lg' : 'text-white/60 hover:text-white'}`}
                            >
                                Users
                            </button>
                            <button
                                onClick={() => setActiveTab('logs')}
                                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'logs' ? 'bg-[#547792] text-white shadow-lg' : 'text-white/60 hover:text-white'}`}
                            >
                                Logs
                            </button>
                            <button
                                onClick={() => setActiveTab('calendar')}
                                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'calendar' ? 'bg-[#547792] text-white shadow-lg' : 'text-white/60 hover:text-white'}`}
                            >
                                📅 Leave Calendar
                            </button>
                        {currentUser.role === 'superadmin' && (
                            <>
                                <button
                                    onClick={() => setActiveTab('companies')}
                                    className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'companies' ? 'bg-[#547792] text-white shadow-lg' : 'text-white/60 hover:text-white'}`}
                                >
                                    🏢 Companies
                                </button>
                                <button
                                    onClick={() => setActiveTab('teams')}
                                    className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'teams' ? 'bg-[#547792] text-white shadow-lg' : 'text-white/60 hover:text-white'}`}
                                >
                                    🤝 Teams
                                </button>
                                <button
                                    onClick={() => setActiveTab('error-logs')}
                                    className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'error-logs' ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' : 'text-white/60 hover:text-rose-500'}`}
                                >
                                    ⚠️ Error Logs
                                </button>
                            </>
                        )}
                            <button
                                onClick={() => setActiveTab('announce')}
                                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'announce' ? 'bg-[#547792] text-white shadow-lg' : 'text-white/60 hover:text-white'}`}
                            >
                                📢 Announce
                            </button>
                        </div>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'analytics' ? (
                        <motion.div
                            key="analytics-tab"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="space-y-8"
                        >
                            {/* Summary Cards */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { label: 'Total Team', val: users.length, icon: '👥' },
                                    { label: 'Total Requests', val: requests.length, icon: '📝' },
                                    { label: 'Pending', val: requests.filter(r => r.status === 'Pending').length, icon: '⏳' },
                                    { label: 'Focus', val: currentUser.role === 'superadmin' ? 'Global' : (currentUser.team?.name || 'My Team'), icon: '🎯' }
                                ].map((s, idx) => (
                                    <div key={idx} className="glass-card bg-[#1b2a3a]/40 p-6 border-white/10 hover:bg-[#1b2a3a]/60 hover:scale-[1.02] transition-transform">
                                        <div className="text-2xl mb-1">{s.icon}</div>
                                        <div className="text-[10px] font-black text-brand-300 uppercase tracking-widest">{s.label}</div>
                                        <div className="text-3xl font-black text-white">{s.val}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Chart 1: Request Status Pulse */}
                                <div className="glass-card bg-[#1b2a3a]/80 p-8 border-white/10">
                                    <h3 className="text-sm font-black text-brand-300 uppercase tracking-widest mb-8">Request Pulse</h3>
                                    <div className="h-[300px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={[
                                                { name: 'Pending', count: requests.filter(r => r.status === 'Pending').length },
                                                { name: 'Approved', count: requests.filter(r => r.status === 'Approved').length },
                                                { name: 'Resolved', count: requests.filter(r => r.status === 'Resolved').length },
                                                { name: 'Cancelled', count: requests.filter(r => r.status === 'Cancelled').length },
                                            ]}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#749fb0' }} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#749fb0' }} />
                                                <Tooltip 
                                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                                    contentStyle={{ backgroundColor: '#1b2a3a', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)', fontWeight: 800, color: '#white' }}
                                                />
                                                <Bar dataKey="count" fill="#94B4C1" radius={[4, 4, 0, 0]} barSize={40} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Chart 2: Team Roles */}
                                <div className="glass-card bg-[#1b2a3a]/80 p-8 border-white/10">
                                    <h3 className="text-sm font-black text-brand-300 uppercase tracking-widest mb-8">Team Composition</h3>
                                    <div className="h-[300px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={[
                                                        { name: 'Admins', value: users.filter(u => u.role === 'admin').length },
                                                        { name: 'Employees', value: users.filter(u => u.role === 'user').length },
                                                        { name: 'Superadmin', value: users.filter(u => u.role === 'superadmin').length },
                                                    ]}
                                                    cx="50%" cy="50%"
                                                    innerRadius={60} outerRadius={80}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {[ '#94B4C1', '#547792', '#EAE0CF' ].map((color, idx) => (
                                                        <Cell key={`cell-${idx}`} fill={color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip contentStyle={{ backgroundColor: '#1b2a3a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                                                <Legend iconType="circle" />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>

                            {/* Chart 3: Trends over time */}
                            <div className="glass-card bg-[#1b2a3a]/80 p-8 border-white/10">
                                <h3 className="text-sm font-black text-brand-300 uppercase tracking-widest mb-8">Activity Trends (Last 7 Days)</h3>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={[...Array(7)].map((_, i) => {
                                            const d = new Date();
                                            d.setDate(d.getDate() - (6 - i));
                                            const dateStr = d.toLocaleDateString(undefined, { weekday: 'short' });
                                            const count = requests.filter(r => new Date(r.createdAt).toDateString() === d.toDateString()).length;
                                            return { name: dateStr, count };
                                        })}>
                                            <defs>
                                                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#547792" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#547792" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#749fb0' }} />
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                            <Tooltip contentStyle={{ backgroundColor: '#1b2a3a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                                            <Area type="monotone" dataKey="count" stroke="#94B4C1" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </motion.div>
                    ) : activeTab === 'users' ? (
                        <motion.div
                            key="users-tab"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            {/* Search and Stats Grid for Users */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                                <div className="relative group flex-1 max-w-md">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none text-[#547792]/50 group-focus-within:text-[#EAE0CF] transition-colors">🔍</span>
                                    <input
                                        type="text"
                                        placeholder="Search by name, email, or mobile..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="input-premium pl-12 py-3 bg-black/20 border-[#547792]/30 focus:bg-black/40"
                                    />
                                </div>

                                <div className="glass px-4 py-3 rounded-xl border-white/10 text-center">
                                    <p className="text-[#EAE0CF] font-bold uppercase text-[9px] tracking-widest mb-1">Total</p>
                                    <h3 className="text-xl font-black text-[#EAE0CF]">{users.length}</h3>
                                </div>
                                <div className="glass px-4 py-3 rounded-xl border-white/10 text-center">
                                    <p className="text-[#EAE0CF] font-bold uppercase text-[9px] tracking-widest mb-1">Admins</p>
                                    <h3 className="text-xl font-black text-[#EAE0CF]">{users.filter(u => u.role === 'admin').length}</h3>
                                </div>
                                <div className="glass px-4 py-3 rounded-xl border-white/10 text-center">
                                    <p className="text-[#EAE0CF] font-bold uppercase text-[9px] tracking-widest mb-1">Users</p>
                                    <h3 className="text-xl font-black text-[#EAE0CF]">{users.filter(u => u.role === 'user').length}</h3>
                                </div>
                                <button
                                    onClick={() => setIsAddUserModalOpen(true)}
                                    className="px-6 py-3 rounded-xl bg-[#547792] text-white font-black uppercase tracking-widest text-[10px] hover:bg-[#94B4C1] transition-all flex items-center gap-2 shadow-lg shadow-[#547792]/20"
                                >
                                    <span>➕</span> Add Employee
                                </button>
                            </div>

                            {/* Users Table */}
                            <div className="glass-card overflow-hidden border-white/5">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-black/5 bg-white/5">
                                                <th className="p-5 text-[#EAE0CF] font-bold uppercase text-xs tracking-widest">User</th>
                                                <th className="p-5 text-[#EAE0CF] font-bold uppercase text-xs tracking-widest">Contact</th>
                                                <th className="p-5 text-[#EAE0CF] font-bold uppercase text-xs tracking-widest">Leave Balance</th>
                                                <th className="p-5 text-[#EAE0CF] font-bold uppercase text-xs tracking-widest">Role</th>
                                                <th className="p-5 text-[#EAE0CF] font-bold uppercase text-xs tracking-widest">Joined</th>
                                                <th className="p-5 text-[#EAE0CF] font-bold uppercase text-xs tracking-widest text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <AnimatePresence mode="popLayout">
                                                {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                                                    <motion.tr
                                                        key={user._id}
                                                        layout
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0 }}
                                                        className="border-b border-black/5 hover:bg-black/30 transition-colors group"
                                                    >
                                                        <td className="p-5">
                                                            <div className="flex items-center gap-3">
                                                                <img
                                                                    src={api.getImageUrl(user.profileImage)}
                                                                    onError={(e) => e.target.src = "https://ui-avatars.com/api/?name=User&background=68BA7F&color=fff"}
                                                                    alt={user.name}
                                                                    className="w-10 h-10 rounded-full object-cover border-2 border-[#547792]/20"
                                                                />
                                                                <div>
                                                                    <p className="font-bold text-[#EAE0CF]">{user.name}</p>
                                                                    <p className="text-[10px] text-[#547792] font-mono">{user._id}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="p-5 text-sm text-[#EAE0CF]">
                                                            <p className="font-medium">{user.email}</p>
                                                            <p className="text-xs text-gray-400">{user.mobile}</p>
                                                        </td>
                                                        <td className="p-5">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-black text-[#EAE0CF] bg-[#94B4C1] px-3 py-1 rounded-lg text-xs border border-[#547792]/20">
                                                                    {user.paidLeaveBalance || 0} PL
                                                                </span>
                                                                <button
                                                                    onClick={() => setSelectedUserForLeave(user)}
                                                                    className="p-1.5 hover:bg-[#547792]/10 rounded-lg text-[#EAE0CF] transition-colors"
                                                                    title="Adjust Balance"
                                                                >
                                                                    ✏️
                                                                </button>
                                                            </div>
                                                        </td>
                                                        <td className="p-5">
                                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${user.role === 'admin'
                                                                ? 'bg-[#EAE0CF]/10 text-[#EAE0CF]'
                                                                : 'bg-slate-800 text-slate-300'
                                                                }`}>
                                                                {user.role}
                                                            </span>
                                                        </td>
                                                        <td className="p-5 text-xs text-[#EAE0CF] font-bold">
                                                            {new Date(user.createdAt).toLocaleDateString()}
                                                        </td>
                                                        <td className="p-5 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <button
                                                                    onClick={() => handleEditUser(user)}
                                                                    className="p-2.5 rounded-xl bg-[#EAE0CF]/10 text-[#EAE0CF] hover:bg-[#EAE0CF] hover:text-white transition-all shadow-sm"
                                                                    title="Edit User Permissions"
                                                                >
                                                                    {user.role === 'admin' ? "👑" : "👤"}
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteUser(user._id)}
                                                                    className="p-2.5 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                                                    disabled={user._id === currentUser._id}
                                                                    title="Delete User"
                                                                >
                                                                    🗑️
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </motion.tr>
                                                )) : (
                                                    <tr>
                                                        <td colSpan="6" className="p-10 text-center font-bold text-[#EAE0CF]/40">No users found matching your search</td>
                                                    </tr>
                                                )}
                                            </AnimatePresence>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </motion.div>
                    ) : activeTab === 'logs' ? (
                        <motion.div
                            key="logs-tab"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <AdminLogs />
                        </motion.div>
                    ) : activeTab === 'error-logs' && currentUser.role === 'superadmin' ? (
                        <motion.div
                            key="error-logs-tab"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <ErrorLogs />
                        </motion.div>
                    ) : activeTab === 'companies' && currentUser.role === 'superadmin' ? (
                        <motion.div
                            key="companies-tab"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <CompanyManagement />
                        </motion.div>
                    ) : activeTab === 'teams' && currentUser.role === 'superadmin' ? (
                        <motion.div
                            key="teams-tab"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <TeamManagement />
                        </motion.div>
                    ) : activeTab === 'calendar' ? (
                        <motion.div
                            key="calendar-tab"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <LeaveCalendar />
                        </motion.div>
                    ) : activeTab === 'announce' ? (
                        <motion.div
                            key="announce-tab"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="max-w-2xl mx-auto"
                        >
                            <div className="glass-card p-8 border-white/5">
                                <div className="text-center mb-8">
                                    <div className="w-16 h-16 bg-[#94B4C1] rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 border border-[#547792]/20 shadow-inner">📢</div>
                                    <h2 className="text-2xl font-black text-[#EAE0CF]">Global Announcement</h2>
                                    <p className="text-sm text-gray-400 mt-2">Send a real-time pop-up notification to all registered users.</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-[#EAE0CF] uppercase ml-1 tracking-widest">Your Message</label>
                                        <textarea
                                            placeholder="Write something important to all users..."
                                            value={announcementMsg}
                                            onChange={(e) => setAnnouncementMsg(e.target.value)}
                                            className="input-premium min-h-32 py-4 bg-black/30 border-dashed border-[#547792]/40 focus:border-solid text-lg leading-relaxed"
                                        />
                                    </div>

                                    <button
                                        onClick={handleSendAnnouncement}
                                        disabled={loading || !announcementMsg.trim()}
                                        className="w-full py-5 rounded-2xl bg-[#EAE0CF] text-white font-black uppercase tracking-widest hover:bg-[#EAE0CF] shadow-xl shadow-[#EAE0CF]/20 disabled:opacity-50 transition-all flex items-center justify-center gap-3"
                                    >
                                        {loading ? "Broadcasting..." : (
                                            <>
                                                <span>🚀</span> BROADCAST TO EVERYONE
                                            </>
                                        )}
                                    </button>

                                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-200/50 flex gap-3">
                                        <span className="text-lg">⚠️</span>
                                        <p className="text-[10px] text-amber-800 font-medium leading-relaxed uppercase tracking-tight">
                                            This will trigger a real-time pop-up on all connected user screens and save a record in their notification history. Use responsibly.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : null}
                </AnimatePresence>

                {/* Adjust Balance Modal */}
                <AnimatePresence>
                    {selectedUserForLeave && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setSelectedUserForLeave(null)}
                                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative w-full max-w-md bg-[#1b2a3a] rounded-3xl p-8 shadow-2xl border border-white/10"
                            >
                                <h3 className="text-2xl font-black text-[#EAE0CF] mb-2 text-center">Adjust Leave Balance</h3>
                                <p className="text-sm text-gray-400 text-center mb-6">Updating balance for <span className="text-[#EAE0CF] font-bold">{selectedUserForLeave.name}</span></p>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-[#EAE0CF] uppercase ml-1 tracking-widest">New Balance (Days)</label>
                                        <input
                                            type="number"
                                            value={newLeaveBalance}
                                            onChange={(e) => setNewLeaveBalance(parseFloat(e.target.value))}
                                            className="input-premium py-4 font-black text-xl text-center bg-[#94B4C1]/20 border-[#547792]/30"
                                            step="0.5"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-[#EAE0CF] uppercase ml-1 tracking-widest">Reason for Adjustment</label>
                                        <textarea
                                            placeholder="e.g., Deduction for unlogged leave, corrected month-end balance..."
                                            value={leaveReason}
                                            onChange={(e) => setLeaveReason(e.target.value)}
                                            className="input-premium min-h-24 py-3 bg-white border-dashed border-[#547792]/40"
                                        />
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setSelectedUserForLeave(null)}
                                            className="flex-1 py-4 rounded-2xl font-bold text-white/40 hover:bg-white/5 transition-all border border-white/10"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleUpdateBalance}
                                            disabled={loading || !leaveReason.trim()}
                                            className="flex-[2] py-4 rounded-2xl bg-[#547792] text-white font-bold hover:bg-[#94B4C1] shadow-lg shadow-[#547792]/20 disabled:opacity-50 transition-all"
                                        >
                                            {loading ? "Updating..." : "Confirm Update"}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                <AddUserModal 
                    isOpen={isAddUserModalOpen} 
                    onClose={() => setIsAddUserModalOpen(false)} 
                    onSuccess={loadUsers} 
                />

                <EditUserModal
                    isOpen={isEditUserModalOpen}
                    onClose={() => { setIsEditUserModalOpen(false); setSelectedUserForEdit(null); }}
                    user={selectedUserForEdit}
                    onSuccess={loadUsers}
                />
            </div>
        </div>
    );
};

export default AdminDashboard;
