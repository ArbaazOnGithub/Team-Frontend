import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getImageUrl } from '../../services/api';

const ProfileModal = ({ user, isOpen, onClose, onUpdate, loading }) => {
    const [name, setName] = useState(user.name);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(getImageUrl(user.profileImage));

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("name", name);
        if (imageFile) formData.append("profileImage", imageFile);
        onUpdate(formData);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="glass bg-[#CFFFDC]/90 p-8 w-full max-w-sm rounded-3xl relative z-10 border-[#68BA7F]/30 shadow-2xl"
                    >
                        <button onClick={onClose} className="absolute top-6 right-6 text-[#253D2C]/40 hover:text-[#2E6F40] font-bold">✕</button>
                        <h2 className="text-2xl font-black text-[#253D2C] mb-8">Edit Profile</h2>

                        <form onSubmit={handleSubmit} className="flex flex-col items-center">
                            <div className="relative group mb-8">
                                <img src={imagePreview} className="w-28 h-28 rounded-full object-cover border-4 border-[#2E6F40] shadow-lg" alt="Profile" />
                                <label htmlFor="modal-image" className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <span className="text-white text-xs font-bold uppercase">Change</span>
                                </label>
                                <input id="modal-image" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                            </div>

                            <div className="w-full mb-8">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[#68BA7F] mb-2 block ml-1">Full Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="input-premium"
                                    placeholder="Your Name"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn-premium py-4 bg-[#2E6F40] text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-[#253D2C] shadow-xl shadow-[#2E6F40]/30"
                            >
                                {loading ? "Updating..." : "Save Changes"}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ProfileModal;
