import React, { useState, useRef, useEffect } from 'react';
import * as api from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import io from 'socket.io-client';

const Header = ({ user, handleLogout, setView }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const dropdownRef = useRef(null);
    const notifRef = useRef(null);

    const token = localStorage.getItem("team_token");

    // Socket for notifications
    useEffect(() => {
        if (!token || !user) return;
        const socket = io(api.BACKEND_URL, { auth: { token } });

        socket.on('notification_received', (notif) => {
            setNotifications(prev => [notif, ...prev]);
        });

        loadNotifications();

        return () => socket.disconnect();
    }, [token, user]);

    const loadNotifications = async () => {
        try {
            const data = await api.fetchNotifications(token);
            setNotifications(data);
        } catch (err) {
            console.error("Failed to load notifications", err);
        }
    };

    const handleMarkRead = async () => {
        if (notifications.filter(n => !n.isRead).length === 0) return;
        try {
            await api.markNotificationsAsRead(token);
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (err) {
            console.error(err);
        }
    };

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setIsNotifOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <header className="glass bg-[#1b2a3a]/90 px-6 py-4 flex justify-between items-center sticky top-0 z-50 border-b border-white/10">
            <div className="flex items-center gap-2">
               <div className="w-8 h-8 bg-brand-500 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20">
                    <span className="text-white text-lg">📁</span>
               </div>
               <h1
                   className="text-xl font-black bg-gradient-to-r from-brand-500 to-brand-200 bg-clip-text text-transparent cursor-pointer tracking-tight"
                   onClick={() => setView('dashboard')}
               >
                   TeamQueries <span className="text-[10px] text-brand-300 font-black ml-1">v4.2</span>
               </h1>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
                {/* Chat Toggle Button */}
                <button
                    onClick={() => window.dispatchEvent(new Event('open-chat'))}
                    className="p-2.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 shadow-sm hover:shadow-md transition-all text-xl"
                    title="Team Chat"
                >
                    💬
                </button>

                {/* Notifications Bell */}
                <div className="relative" ref={notifRef}>
                    <button
                        onClick={() => {
                            setIsNotifOpen(!isNotifOpen);
                            if (!isNotifOpen) handleMarkRead();
                        }}
                        className="p-2.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 shadow-sm hover:shadow-md transition-all text-xl relative"
                    >
                        🔔
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full shadow-lg shadow-rose-500/30 animate-pulse">
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    <AnimatePresence>
                        {isNotifOpen && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                className="absolute right-0 mt-4 w-80 glass-card bg-[#1b2a3a] border border-white/10 overflow-hidden z-[60]"
                            >
                                <div className="p-4 bg-white/5 border-b border-white/10 flex justify-between items-center">
                                    <span className="text-[10px] font-black uppercase text-brand-500 tracking-[0.2em]">Notifications</span>
                                    {unreadCount > 0 && (
                                        <span className="text-[9px] bg-brand-500 text-white px-2 py-0.5 rounded-full font-bold">
                                            {unreadCount} NEW
                                        </span>
                                    )}
                                </div>
                                <div className="max-h-96 overflow-y-auto scroll-premium">
                                    {notifications.length > 0 ? (
                                        notifications.map((n) => (
                                            <div key={n._id} className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors ${!n.isRead ? 'bg-white/5' : ''}`}>
                                                <div className="flex gap-3">
                                                    <span className="text-xl">{n.type === 'leave_update' ? '📅' : '📝'}</span>
                                                    <div className="flex-1">
                                                        <p className="text-xs text-brand-500 leading-relaxed font-bold">{n.message}</p>
                                                        <p className="text-[10px] text-white/30 mt-1">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center text-brand-600/30 font-bold italic text-xs">
                                            All caught up!
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="relative" ref={dropdownRef}>
                    {/* User Profile Trigger */}
                    <div
                        className="flex items-center gap-3 cursor-pointer group/profile p-1.5 rounded-2xl hover:bg-white/5 transition-all"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                        <div className="relative">
                            <img
                                src={api.getImageUrl(user.profileImage)}
                                onError={(e) => e.target.src = "https://ui-avatars.com/api/?name=User&background=68BA7F&color=fff"}
                                className="w-10 h-10 rounded-2xl object-cover border-2 border-white/10 shadow-md transition-all group-hover/profile:scale-105 group-hover/profile:shadow-lg"
                                alt="Profile"
                            />
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-[#1b2a3a] rounded-full shadow-sm"></div>
                        </div>
                        <div className="hidden md:block mr-2 text-left">
                            <div className="font-black text-sm text-brand-500 leading-tight tracking-tight flex items-center gap-1">
                                {user.name.split(' ')[0]}
                            </div>
                            <div className="text-[9px] font-black uppercase text-brand-400 tracking-widest">{user.role}</div>
                        </div>
                    </div>

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                        {isDropdownOpen && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                className="absolute right-0 mt-4 w-64 glass-card bg-[#1b2a3a] border border-white/10 overflow-hidden z-[60]"
                            >
                                <div className="p-5 border-b border-white/5 bg-white/5">
                                    <div className="font-black text-brand-300 tracking-tight">{user.name}</div>
                                    <div className="text-[10px] text-brand-200 font-bold uppercase tracking-widest mt-0.5">{user.role}</div>
                                    
                                    <div className="mt-4 flex gap-2">
                                        <div className="flex-1 bg-[#547792] text-white p-2 rounded-xl text-center">
                                            <div className="text-[8px] font-black uppercase tracking-widest opacity-70">Leave Balance</div>
                                            <div className="text-sm font-black">{user.paidLeaveBalance || 0}d</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="py-2">
                                    <button
                                        className="w-full text-left px-5 py-3 text-sm text-brand-500 hover:bg-white/5 transition-colors flex items-center gap-4 group"
                                        onClick={() => {
                                            window.dispatchEvent(new CustomEvent('open-profile'));
                                            setIsDropdownOpen(false);
                                        }}
                                    >
                                        <span className="text-lg opacity-50 group-hover:scale-110 transition-all">👤</span>
                                        <span className="font-black tracking-tight">Edit Profile</span>
                                    </button>

                                    {['admin', 'superadmin'].includes(user.role) && (
                                        <button
                                            className="w-full text-left px-5 py-3 text-sm text-brand-500 hover:bg-white/5 transition-colors flex items-center gap-4 group"
                                            onClick={() => {
                                                setView('admin');
                                                setIsDropdownOpen(false);
                                            }}
                                        >
                                            <span className="text-lg opacity-50 group-hover:scale-110 transition-all">🛡️</span>
                                            <span className="font-black tracking-tight">Admin Console</span>
                                        </button>
                                    )}

                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-5 py-4 text-sm text-rose-500 font-black hover:bg-rose-500/10 transition-colors border-t border-white/5 flex items-center gap-4 mt-2"
                                    >
                                        <span className="text-lg">🚪</span>
                                        <span className="tracking-widest uppercase">Logout</span>
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    );
};

export default Header;


