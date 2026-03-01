import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AnnouncementModal = ({ announcement, onClose }) => {
    if (!announcement) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 40 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 40 }}
                    className="glass bg-white p-10 w-full max-w-lg rounded-[2.5rem] relative z-20 border-[#68BA7F]/40 shadow-2xl text-center"
                >
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-[#CFFFDC] rounded-3xl flex items-center justify-center text-4xl shadow-xl border border-[#68BA7F]/30 animate-bounce">
                        📢
                    </div>

                    <div className="mt-8 mb-4">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#68BA7F] bg-[#CFFFDC]/50 px-4 py-1 rounded-full">
                            Admin Announcement
                        </span>
                    </div>

                    <h2 className="text-3xl font-black text-[#253D2C] mb-6 leading-tight">
                        Message from {announcement.senderName || 'Admin'}
                    </h2>

                    <div className="bg-[#CFFFDC]/20 p-8 rounded-3xl border border-dashed border-[#68BA7F]/30 mb-8 max-h-64 overflow-y-auto">
                        <p className="text-lg text-[#253D2C] leading-relaxed font-medium">
                            {announcement.message}
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full py-5 bg-[#2E6F40] text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-[#253D2C] shadow-2xl shadow-[#2E6F40]/30 transition-all active:scale-95"
                    >
                        Understood, Proceed
                    </button>

                    <p className="text-[10px] text-gray-400 mt-6 font-bold flex items-center justify-center gap-2">
                        <span>🕒</span> {new Date(announcement.createdAt).toLocaleString()}
                    </p>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default AnnouncementModal;
