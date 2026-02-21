import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import * as api from '../../services/api';
import AdminLogs from './AdminLogs';

const AdminDashboard = ({ token, user: currentUser, onBack }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('users'); // 'users' or 'logs'
    const [selectedUserForLeave, setSelectedUserForLeave] = useState(null);
    const [newLeaveBalance, setNewLeaveBalance] = useState(0);
    const [leaveReason, setLeaveReason] = useState("");

    useEffect(() => {
        if (activeTab === 'users') loadUsers();
    }, [activeTab]);

    useEffect(() => {
        if (selectedUserForLeave) {
            setNewLeaveBalance(selectedUserForLeave.paidLeaveBalance || 0);
            setLeaveReason("");
        }
    }, [selectedUserForLeave]);

    const handleUpdateBalance = async () => {
        if (!leaveReason.trim()) return toast.error("Please provide a reason");
        setLoading(true);
        try {
            await api.updateUserLeaveBalance(token, selectedUserForLeave._id, newLeaveBalance, leaveReason);
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
            const data = await api.fetchAllUsers(token);
            setUsers(data);
        } catch (err) {
            toast.error("Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleRole = async (userId, currentRole) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;

        try {
            await api.updateUserRole(token, userId, newRole);
            setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
            toast.success("Role updated successfully");
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (userId === currentUser._id) return toast.error("You cannot delete yourself!");
        if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;

        try {
            await api.deleteUser(token, userId);
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
                            className="flex items-center gap-2 text-[#2E6F40] font-bold hover:gap-3 transition-all mb-2"
                        >
                            <span>←</span> Back to Dashboard
                        </button>
                        <h1 className="text-3xl font-black text-[#253D2C]">Admin Panel</h1>
                    </div>

                    <div className="flex bg-white/50 p-1 rounded-2xl border border-[#68BA7F]/20">
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'users' ? 'bg-[#2E6F40] text-white shadow-lg' : 'text-[#253D2C]/60 hover:text-[#2E6F40]'}`}
                        >
                            Users
                        </button>
                        <button
                            onClick={() => setActiveTab('logs')}
                            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'logs' ? 'bg-[#2E6F40] text-white shadow-lg' : 'text-[#253D2C]/60 hover:text-[#2E6F40]'}`}
                        >
                            Logs
                        </button>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'users' ? (
                        <motion.div
                            key="users-tab"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            {/* Search and Stats Grid for Users */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                                <div className="relative group flex-1 max-w-md">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#68BA7F]/50 group-focus-within:text-[#2E6F40] transition-colors">🔍</span>
                                    <input
                                        type="text"
                                        placeholder="Search by name, email, or mobile..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="input-premium pl-12 py-3 bg-white/70 border-[#68BA7F]/30 focus:bg-white"
                                    />
                                </div>

                                <div className="glass px-4 py-3 rounded-xl border-white/40 text-center">
                                    <p className="text-[#2E6F40] font-bold uppercase text-[9px] tracking-widest mb-1">Total</p>
                                    <h3 className="text-xl font-black text-[#253D2C]">{users.length}</h3>
                                </div>
                                <div className="glass px-4 py-3 rounded-xl border-white/40 text-center">
                                    <p className="text-[#2E6F40] font-bold uppercase text-[9px] tracking-widest mb-1">Admins</p>
                                    <h3 className="text-xl font-black text-[#253D2C]">{users.filter(u => u.role === 'admin').length}</h3>
                                </div>
                                <div className="glass px-4 py-3 rounded-xl border-white/40 text-center">
                                    <p className="text-[#2E6F40] font-bold uppercase text-[9px] tracking-widest mb-1">Users</p>
                                    <h3 className="text-xl font-black text-[#253D2C]">{users.filter(u => u.role === 'user').length}</h3>
                                </div>
                            </div>

                            {/* Users Table */}
                            <div className="glass-card overflow-hidden border-white/20">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-black/5 bg-white/30">
                                                <th className="p-5 text-[#2E6F40] font-bold uppercase text-xs tracking-widest">User</th>
                                                <th className="p-5 text-[#2E6F40] font-bold uppercase text-xs tracking-widest">Contact</th>
                                                <th className="p-5 text-[#2E6F40] font-bold uppercase text-xs tracking-widest">Leave Balance</th>
                                                <th className="p-5 text-[#2E6F40] font-bold uppercase text-xs tracking-widest">Role</th>
                                                <th className="p-5 text-[#2E6F40] font-bold uppercase text-xs tracking-widest">Joined</th>
                                                <th className="p-5 text-[#2E6F40] font-bold uppercase text-xs tracking-widest text-right">Actions</th>
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
                                                        className="border-b border-black/5 hover:bg-white/50 transition-colors group"
                                                    >
                                                        <td className="p-5">
                                                            <div className="flex items-center gap-3">
                                                                <img
                                                                    src={api.getImageUrl(user.profileImage)}
                                                                    onError={(e) => e.target.src = "https://ui-avatars.com/api/?name=User&background=68BA7F&color=fff"}
                                                                    alt={user.name}
                                                                    className="w-10 h-10 rounded-full object-cover border-2 border-[#68BA7F]/20"
                                                                />
                                                                <div>
                                                                    <p className="font-bold text-[#253D2C]">{user.name}</p>
                                                                    <p className="text-[10px] text-[#68BA7F] font-mono">{user._id}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="p-5 text-sm text-[#253D2C]">
                                                            <p className="font-medium">{user.email}</p>
                                                            <p className="text-xs text-gray-500">{user.mobile}</p>
                                                        </td>
                                                        <td className="p-5">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-black text-[#2E6F40] bg-[#CFFFDC] px-3 py-1 rounded-lg text-xs border border-[#68BA7F]/20">
                                                                    {user.paidLeaveBalance || 0} PL
                                                                </span>
                                                                <button
                                                                    onClick={() => setSelectedUserForLeave(user)}
                                                                    className="p-1.5 hover:bg-[#68BA7F]/10 rounded-lg text-[#2E6F40] transition-colors"
                                                                    title="Adjust Balance"
                                                                >
                                                                    ✏️
                                                                </button>
                                                            </div>
                                                        </td>
                                                        <td className="p-5">
                                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${user.role === 'admin'
                                                                ? 'bg-[#2E6F40]/10 text-[#2E6F40]'
                                                                : 'bg-slate-100 text-slate-600'
                                                                }`}>
                                                                {user.role}
                                                            </span>
                                                        </td>
                                                        <td className="p-5 text-xs text-[#253D2C] font-bold">
                                                            {new Date(user.createdAt).toLocaleDateString()}
                                                        </td>
                                                        <td className="p-5 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <button
                                                                    onClick={() => handleToggleRole(user._id, user.role)}
                                                                    className="p-2.5 rounded-xl bg-[#2E6F40]/10 text-[#2E6F40] hover:bg-[#2E6F40] hover:text-white transition-all shadow-sm"
                                                                    title={user.role === 'admin' ? "Make User" : "Make Admin"}
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
                                                        <td colSpan="6" className="p-10 text-center font-bold text-[#253D2C]/40">No users found matching your search</td>
                                                    </tr>
                                                )}
                                            </AnimatePresence>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="logs-tab"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <AdminLogs token={token} />
                        </motion.div>
                    )}
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
                                className="relative w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl border border-[#68BA7F]/20"
                            >
                                <h3 className="text-2xl font-black text-[#253D2C] mb-2 text-center">Adjust Leave Balance</h3>
                                <p className="text-sm text-gray-500 text-center mb-6">Updating balance for <span className="text-[#2E6F40] font-bold">{selectedUserForLeave.name}</span></p>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-[#2E6F40] uppercase ml-1 tracking-widest">New Balance (Days)</label>
                                        <input
                                            type="number"
                                            value={newLeaveBalance}
                                            onChange={(e) => setNewLeaveBalance(parseFloat(e.target.value))}
                                            className="input-premium py-4 font-black text-xl text-center bg-[#CFFFDC]/20 border-[#68BA7F]/30"
                                            step="0.5"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-[#2E6F40] uppercase ml-1 tracking-widest">Reason for Adjustment</label>
                                        <textarea
                                            placeholder="e.g., Deduction for unlogged leave, corrected month-end balance..."
                                            value={leaveReason}
                                            onChange={(e) => setLeaveReason(e.target.value)}
                                            className="input-premium min-h-24 py-3 bg-white border-dashed border-[#68BA7F]/40"
                                        />
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setSelectedUserForLeave(null)}
                                            className="flex-1 py-4 rounded-2xl font-bold text-gray-400 hover:bg-gray-50 transition-all border border-gray-100"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleUpdateBalance}
                                            disabled={loading || !leaveReason.trim()}
                                            className="flex-[2] py-4 rounded-2xl bg-[#2E6F40] text-white font-bold hover:bg-[#253D2C] shadow-lg shadow-[#2E6F40]/20 disabled:opacity-50 transition-all"
                                        >
                                            {loading ? "Updating..." : "Confirm Update"}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AdminDashboard;
