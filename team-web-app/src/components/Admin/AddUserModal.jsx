import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import * as api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const AddUserModal = ({ isOpen, onClose, onSuccess }) => {
    const { user: currentUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile: '',
        password: '',
        companyId: currentUser?.company || '',
        teamId: currentUser?.team?._id || currentUser?.team || ''
    });
    const [teams, setTeams] = useState([]);
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    useEffect(() => {
        if (isOpen && (currentUser?.company || formData.companyId)) {
            const loadTeams = async () => {
                const compId = currentUser?.company || formData.companyId;
                try {
                    const data = await api.fetchTeamsByCompany(compId);
                    setTeams(data);
                    
                    // Auto-select if admin
                    if (currentUser?.role === 'admin' && currentUser?.team) {
                        const tId = currentUser.team._id || currentUser.team;
                        setFormData(prev => ({ ...prev, teamId: tId }));
                    }
                } catch (err) {
                    console.error("Failed to load teams", err);
                }
            };
            loadTeams();
        }
    }, [isOpen, currentUser, formData.companyId]);

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.mobile || !formData.password || !formData.teamId) {
            return toast.error("Please fill all required fields, including Team");
        }

        setLoading(true);
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => data.append(key, formData[key]));
            if (image) data.append('profileImage', image);

            await api.registerUser(data);
            toast.success("Employee registered successfully!");
            onSuccess();
            onClose();
            setFormData({ 
                name: '', 
                email: '', 
                mobile: '', 
                password: '', 
                companyId: currentUser?.company || '', 
                teamId: currentUser?.team?._id || currentUser?.team || '' 
            });
            setImage(null);
            setImagePreview(null);
        } catch (err) {
            toast.error(err.response?.data?.error || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
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
                            <h2 className="text-3xl font-black text-white tracking-tight mb-2">Register Employee</h2>
                            <p className="text-slate-400 text-sm">Add a new member to your company team.</p>
                        </div>

                        <form onSubmit={handleRegister} className="space-y-5">
                            <div className="flex justify-center mb-6">
                                <div className="relative group w-24 h-24">
                                    <img 
                                        src={imagePreview || "https://ui-avatars.com/api/?name=User&background=547792&color=fff&size=150"} 
                                        className="w-full h-full rounded-full object-cover border-4 border-slate-800 shadow-xl" 
                                        alt="Preview" 
                                    />
                                    <label htmlFor="modal-file-upload" className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                        <span className="text-white text-[10px] font-black uppercase">Upload</span>
                                    </label>
                                    <input id="modal-file-upload" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="input-premium bg-black/20 border-white/5"
                                />
                                <input
                                    type="email"
                                    placeholder="Email Address"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="input-premium bg-black/20 border-white/5"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    type="tel"
                                    placeholder="Mobile Number"
                                    value={formData.mobile}
                                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                    className="input-premium bg-black/20 border-white/5"
                                    maxLength={10}
                                />
                                <input
                                    type="password"
                                    placeholder="Temporary Password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="input-premium bg-black/20 border-white/5"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-2">Assign Team</label>
                                <div className="relative">
                                    <select
                                        value={formData.teamId}
                                        onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}
                                        disabled={currentUser?.role === 'admin'}
                                        className="input-premium bg-black/20 border-white/5 w-full appearance-none cursor-pointer disabled:opacity-50 pr-10"
                                    >
                                        <option value="" disabled>Select Team</option>
                                        {teams.map(team => (
                                            <option key={team._id} value={team._id} className="bg-slate-900">{team.name}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

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
                                    {loading ? "Registering..." : "Create Account"}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default AddUserModal;
