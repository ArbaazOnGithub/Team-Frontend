import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import * as api from '../../services/api';

const AdminDashboard = ({ token, user: currentUser, onBack }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadUsers();
    }, []);

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
                        <h1 className="text-3xl font-black text-[#253D2C]">User Management</h1>
                    </div>

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
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="glass p-6 rounded-2xl border-white/40">
                        <p className="text-[#68BA7F] font-bold uppercase text-xs tracking-widest mb-1">Total Users</p>
                        <h3 className="text-3xl font-black text-[#253D2C]">{users.length}</h3>
                    </div>
                    <div className="glass p-6 rounded-2xl border-white/40">
                        <p className="text-[#68BA7F] font-bold uppercase text-xs tracking-widest mb-1">Admins</p>
                        <h3 className="text-3xl font-black text-[#253D2C]">{users.filter(u => u.role === 'admin').length}</h3>
                    </div>
                    <div className="glass p-6 rounded-2xl border-white/40">
                        <p className="text-[#68BA7F] font-bold uppercase text-xs tracking-widest mb-1">Standard Users</p>
                        <h3 className="text-3xl font-black text-[#253D2C]">{users.filter(u => u.role === 'user').length}</h3>
                    </div>
                </div>

                {/* Users Table */}
                <div className="glass-card overflow-hidden border-white/20">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-black/5">
                                    <th className="p-5 text-[#68BA7F] font-bold uppercase text-xs tracking-widest">User</th>
                                    <th className="p-5 text-[#68BA7F] font-bold uppercase text-xs tracking-widest">Contact</th>
                                    <th className="p-5 text-[#68BA7F] font-bold uppercase text-xs tracking-widest">Role</th>
                                    <th className="p-5 text-[#68BA7F] font-bold uppercase text-xs tracking-widest">Joined</th>
                                    <th className="p-5 text-[#68BA7F] font-bold uppercase text-xs tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence mode="popLayout">
                                    {filteredUsers.map((user) => (
                                        <motion.tr
                                            key={user._id}
                                            layout
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="border-b border-black/5 hover:bg-white/30 transition-colors group"
                                        >
                                            <td className="p-5">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={api.getImageUrl(user.profileImage)}
                                                        alt={user.name}
                                                        className="w-10 h-10 rounded-full object-cover border-2 border-[#68BA7F]/20"
                                                    />
                                                    <div>
                                                        <p className="font-bold text-[#253D2C]">{user.name}</p>
                                                        <p className="text-xs text-[#68BA7F]">{user._id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-5 text-sm text-[#253D2C]">
                                                <p>{user.email}</p>
                                                <p>{user.mobile}</p>
                                            </td>
                                            <td className="p-5">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${user.role === 'admin'
                                                        ? 'bg-blue-100 text-blue-600'
                                                        : 'bg-slate-100 text-slate-600'
                                                    }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="p-5 text-sm text-[#253D2C]">
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="p-5 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleToggleRole(user._id, user.role)}
                                                        className="p-2 rounded-lg bg-brand-400/10 text-brand-600 hover:bg-brand-500 hover:text-white transition-all text-sm font-bold"
                                                        title={user.role === 'admin' ? "Make User" : "Make Admin"}
                                                    >
                                                        {user.role === 'admin' ? "👑" : "👤"}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteUser(user._id)}
                                                        className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-600 hover:text-white transition-all text-sm font-bold"
                                                        disabled={user._id === currentUser._id}
                                                        title="Delete User"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                    {filteredUsers.length === 0 && !loading && (
                        <div className="p-10 text-center">
                            <p className="text-xl font-bold text-[#253D2C]/40">No users found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
