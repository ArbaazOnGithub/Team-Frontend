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
        <header className="glass bg-[#CFFFDC]/90 px-6 py-4 flex justify-between items-center sticky top-0 z-50 border-b border-[#68BA7F]/30">
            <h1
                className="text-2xl font-black bg-gradient-to-r from-[#2E6F40] to-[#68BA7F] bg-clip-text text-transparent cursor-pointer"
                onClick={() => setView('dashboard')}
            >
                Team Queries <span className="text-[10px] bg-[#2E6F40] text-white px-2 py-0.5 rounded-full align-middle ml-1">v3.1</span>
            </h1>

            <div className="flex items-center gap-3 sm:gap-6">
                {/* Notifications Bell */}
                <div className="relative" ref={notifRef}>
                    <button
                        onClick={() => {
                            setIsNotifOpen(!isNotifOpen);
                            if (!isNotifOpen) handleMarkRead();
                        }}
                        className="p-2.5 rounded-xl bg-white/50 border border-[#68BA7F]/20 hover:bg-white transition-all text-xl relative"
                    >
                        🔔
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full shadow-lg animate-bounce">
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    <AnimatePresence>
                        {isNotifOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute right-0 mt-3 w-80 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-[#68BA7F]/20 overflow-hidden z-[60]"
                            >
                                <div className="p-4 bg-[#CFFFDC]/30 border-b border-[#68BA7F]/10 flex justify-between items-center">
                                    <span className="text-xs font-black uppercase text-[#2E6F40] tracking-widest">Notifications</span>
                                    {unreadCount > 0 && (
                                        <span className="text-[9px] bg-[#2E6F40] text-white px-2 py-0.5 rounded-full font-bold">
                                            {unreadCount} NEW
                                        </span>
                                    )}
                                </div>
                                <div className="max-h-96 overflow-y-auto">
                                    {notifications.length > 0 ? (
                                        notifications.map((n) => (
                                            <div key={n._id} className={`p-4 border-b border-[#68BA7F]/5 hover:bg-[#CFFFDC]/20 transition-colors ${!n.isRead ? 'bg-[#CFFFDC]/10' : ''}`}>
                                                <div className="flex gap-3">
                                                    <span className="text-lg">{n.type === 'leave_update' ? '📅' : '📝'}</span>
                                                    <div className="flex-1">
                                                        <p className="text-xs text-[#253D2C] leading-relaxed font-bold">{n.message}</p>
                                                        <p className="text-[9px] text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center">
                                            <p className="text-gray-400 text-xs font-bold italic">No notifications yet</p>
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
                        className="flex items-center gap-3 cursor-pointer group/profile p-1 rounded-full hover:bg-[#68BA7F]/10 transition-colors"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                        <img
                            src={api.getImageUrl(user.profileImage)}
                            onError={(e) => e.target.src = "https://ui-avatars.com/api/?name=User&background=68BA7F&color=fff"}
                            className="w-10 h-10 rounded-full object-cover border-2 border-[#2E6F40] shadow-sm transition-transform group-hover/profile:scale-105"
                            alt="Profile"
                        />
                        <div className="hidden sm:block mr-2">
                            <div className="font-bold text-sm text-[#253D2C] leading-tight flex items-center gap-1">
                                {user.name}
                                <span className={`text-[8px] transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}>▼</span>
                            </div>
                            <div className="flex gap-1 mt-0.5">
                                <div className="text-[9px] bg-[#68BA7F]/20 text-[#2E6F40] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">{user.role}</div>
                                <div className="hidden md:block text-[9px] bg-[#2E6F40] text-white px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">
                                    PL: {user.paidLeaveBalance || 0}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                        {isDropdownOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-[#68BA7F]/20 overflow-hidden z-[60]"
                            >
                                {/* Mobile Header Info */}
                                <div className="p-4 border-b border-[#68BA7F]/10 bg-[#CFFFDC]/30 sm:hidden">
                                    <div className="font-bold text-[#253D2C]">{user.name}</div>
                                    <div className="text-[10px] text-[#2E6F40] font-black uppercase">{user.role}</div>
                                </div>

                                <div className="py-2">
                                    {/* Stats (Visible on Mobile/Tablet if hidden in header) */}
                                    <div className="px-4 py-3 border-b border-[#68BA7F]/10 md:hidden">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-[#2E6F40] font-bold">Paid Leave Balance</span>
                                            <span className="bg-[#2E6F40] text-white px-2 py-1 rounded-lg font-black">{user.paidLeaveBalance || 0} Days</span>
                                        </div>
                                    </div>

                                    {/* Action items */}
                                    <button
                                        className="w-full text-left px-4 py-3 text-sm text-[#253D2C] hover:bg-[#CFFFDC] transition-colors flex items-center gap-3 group"
                                        onClick={() => {
                                            window.dispatchEvent(new CustomEvent('open-profile'));
                                            setIsDropdownOpen(false);
                                        }}
                                    >
                                        <span className="text-lg opacity-60 group-hover:scale-110 transition-transform">👤</span>
                                        <span className="font-bold">Edit Profile</span>
                                    </button>

                                    {user.role === 'admin' && (
                                        <button
                                            className="w-full text-left px-4 py-3 text-sm text-[#253D2C] hover:bg-[#CFFFDC] transition-colors flex items-center gap-3 group"
                                            onClick={() => {
                                                setView('admin');
                                                setIsDropdownOpen(false);
                                            }}
                                        >
                                            <span className="text-lg opacity-60 group-hover:scale-110 transition-transform">🛡️</span>
                                            <span className="font-bold">Admin Panel</span>
                                        </button>
                                    )}

                                    {/* About Section */}
                                    <div className="px-4 py-3 border-t border-[#68BA7F]/10">
                                        <div className="text-[10px] font-black uppercase text-[#68BA7F] mb-1">About</div>
                                        <p className="text-[10px] text-[#253D2C]/60 leading-tight">
                                            Team Queries v3.0 - Managed leave and request system for streamlined team operations.
                                        </p>
                                    </div>

                                    {/* Help Section */}
                                    <div className="px-4 py-3 border-t border-[#68BA7F]/10">
                                        <div className="text-[10px] font-black uppercase text-[#68BA7F] mb-1">Support</div>
                                        <a
                                            href="mailto:mohd.arbaaz.job@gmail.com?subject=Team%20Queries%20Support%20Request"
                                            className="text-xs font-bold text-[#2E6F40] hover:underline flex items-center gap-2"
                                        >
                                            <span>✉️</span> Get Help / Report Issue
                                        </a>
                                    </div>

                                    {/* Logout */}
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-4 text-sm text-rose-600 font-black hover:bg-rose-50 transition-colors border-t border-[#68BA7F]/10 flex items-center gap-3"
                                    >
                                        <span>🚪</span> LOGOUT
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Desktop Logout (Quick access for Admin Dashboard or Desktop) */}
                <div className="hidden sm:flex lg:flex items-center gap-2">
                    <button
                        onClick={handleLogout}
                        className="btn-premium px-5 py-2 bg-[#253D2C] text-white rounded-xl text-xs font-bold hover:bg-[#2E6F40] shadow-lg shadow-[#253D2C]/20"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;


