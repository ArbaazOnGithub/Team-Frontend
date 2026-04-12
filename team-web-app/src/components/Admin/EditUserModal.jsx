import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import * as api from '../../services/api';

const EditUserModal = ({ isOpen, onClose, user, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [teams, setTeams] = useState([]);
    const [formData, setFormData] = useState({
        role: 'user',
        teamId: '',
        managedTeams: []
    });

    useEffect(() => {
        if (isOpen && user) {
            setFormData({
                role: user.role || 'user',
                teamId: user.team?._id || user.team || '',
                managedTeams: (user.managedTeams || []).map(t => t._id || t)
            });
            loadTeams();
        }
    }, [isOpen, user]);

    const loadTeams = async () => {
        try {
            const data = await api.fetchTeamsByCompany(user.company);
            setTeams(data);
        } catch (err) {
            console.error("Failed to load teams", err);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.updateUserRole(user._id, formData.role, formData.teamId, formData.managedTeams);
            toast.success("User updated successfully!");
            onSuccess();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.error || "Update failed");
        } finally {
            setLoading(false);
        }
    };

    const toggleManagedTeam = (teamId) => {
        setFormData(prev => ({
            ...prev,
            managedTeams: prev.managedTeams.includes(teamId)
                ? prev.managedTeams.filter(id => id !== teamId)
                : [...prev.managedTeams, teamId]
        }));
    };

    return (
        <AnimatePresence>
            {isOpen && user && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 30 }}
                        className="relative w-full max-w-lg bg-slate-900 rounded-[2.5rem] p-10 shadow-2xl border border-white/10"
                    >
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-black text-white tracking-tight mb-2">Edit Member</h2>
                            <p className="text-slate-400 text-sm">Update permissions for {user.name}</p>
                        </div>

                        <form onSubmit={handleUpdate} className="space-y-6">
                            {/* Role Selection */}
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-2">User Role</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="input-premium bg-black/20 border-white/5 w-full appearance-none cursor-pointer"
                                >
                                    <option value="user" className="bg-slate-900">User (Employee)</option>
                                    <option value="admin" className="bg-slate-900">Company Admin</option>
                                </select>
                            </div>

                            {/* Primary Team */}
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-2">Primary Team</label>
                                <select
                                    value={formData.teamId}
                                    onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}
                                    className="input-premium bg-black/20 border-white/5 w-full appearance-none cursor-pointer"
                                    required
                                >
                                    <option value="" disabled>Select Team</option>
                                    {teams.map(t => (
                                        <option key={t._id} value={t._id} className="bg-slate-900">{t.name}</option>
                                    ))}
                                </select>
                                <p className="text-[9px] text-slate-500 mt-1 ml-2">This is the team for their own chat and leave requests.</p>
                            </div>

                            {/* Managed Teams (Only for Admin) */}
                            {formData.role === 'admin' && (
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-2">Managed Teams</label>
                                    <div className="bg-black/20 rounded-2xl p-4 border border-white/5 max-h-40 overflow-y-auto space-y-2">
                                        {teams.map(t => (
                                            <label key={t._id} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-xl cursor-pointer transition-colors">
                                                <input 
                                                    type="checkbox" 
                                                    checked={formData.managedTeams.includes(t._id)}
                                                    onChange={() => toggleManagedTeam(t._id)}
                                                    className="w-4 h-4 rounded border-white/10 bg-slate-800 text-[#547792] focus:ring-offset-slate-900"
                                                />
                                                <span className="text-sm text-slate-300 font-bold">{t.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                    <p className="text-[9px] text-slate-500 mt-2 ml-2 italic">Admins can approve requests and see logs for all teams checked above.</p>
                                </div>
                            )}

                            <div className="pt-4 flex gap-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 py-4 px-6 bg-slate-800 text-slate-400 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-700 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-[2] py-4 px-6 bg-[#547792] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-[#547792]/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {loading ? "Updating..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default EditUserModal;
