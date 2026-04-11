import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as api from '../../services/api';
import toast from 'react-hot-toast';

const LeaveCalendar = ({ showHeader = true }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await api.fetchRequests();
            // Filter only leave requests
            setRequests(data.filter(r => r.requestType === 'Leave'));
        } catch (err) {
            toast.error("Failed to load leave data");
        } finally {
            setLoading(false);
        }
    };

    const daysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

    const renderHeader = () => {
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        return (
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-white">
                    {monthNames[currentDate.getMonth()]} <span className="text-[#547792]">{currentDate.getFullYear()}</span>
                </h2>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
                        className="p-2 bg-black/20 hover:bg-black/40 text-white rounded-xl border border-white/5 transition-all"
                    >
                        ← Previous
                    </button>
                    <button 
                        onClick={() => loadData()}
                        className="p-2 bg-[#547792]/20 hover:bg-[#547792]/40 text-[#94B4C1] rounded-xl border border-[#547792]/20 transition-all font-black uppercase text-[10px] px-4"
                    >
                        Refresh
                    </button>
                    <button 
                        onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
                        className="p-2 bg-black/20 hover:bg-black/40 text-white rounded-xl border border-white/5 transition-all"
                    >
                        Next →
                    </button>
                </div>
            </div>
        );
    };

    const renderDays = () => {
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        return (
            <div className="grid grid-cols-7 gap-2 mb-2">
                {days.map(d => (
                    <div key={d} className="text-center text-[10px] font-black uppercase tracking-widest text-[#547792] py-2">
                        {d}
                    </div>
                ))}
            </div>
        );
    };

    const renderCells = () => {
        const month = currentDate.getMonth();
        const year = currentDate.getFullYear();
        const totalDays = daysInMonth(month, year);
        const firstDay = firstDayOfMonth(month, year);
        const cells = [];

        // Padding for first day
        for (let i = 0; i < firstDay; i++) {
            cells.push(<div key={`empty-${i}`} className="h-20 md:h-24 bg-transparent"></div>);
        }

        for (let d = 1; d <= totalDays; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const currDateObj = new Date(year, month, d);
            
            // Find requests that overlap with this day
            const dayRequests = requests.filter(r => {
                if (!r.startDate || !r.endDate) return false;
                const start = new Date(r.startDate);
                const end = new Date(r.endDate);
                // Set hours to 0 for accurate comparison
                start.setHours(0,0,0,0);
                end.setHours(0,0,0,0);
                const check = new Date(year, month, d);
                check.setHours(0,0,0,0);
                return check >= start && check <= end;
            });

            cells.push(
                <motion.div 
                    key={d}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: d * 0.01 }}
                    onClick={() => setSelectedDay({ day: d, requests: dayRequests, date: currDateObj })}
                    className={`h-20 md:h-24 glass-card bg-[#1b2a3a]/20 border-white/5 p-1 md:p-1.5 overflow-hidden relative hover:bg-[#1b2a3a]/40 transition-colors group cursor-pointer ${
                        new Date().toDateString() === currDateObj.toDateString() ? 'border-brand-500/50 bg-brand-500/5' : ''
                    }`}
                >
                    <span className={`text-[9px] md:text-xs font-black ${
                        new Date().toDateString() === currDateObj.toDateString() ? 'text-brand-400' : 'text-slate-500'
                    }`}>
                        {d}
                    </span>
                    
                    <div className="mt-2 space-y-1">
                        {dayRequests.map((req, idx) => (
                            <div 
                                key={idx} 
                                className={`text-[9px] p-1 rounded font-bold truncate ${
                                    req.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/10' :
                                    req.status === 'Pending' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/10' :
                                    'bg-rose-500/20 text-rose-400 border border-rose-500/10'
                                }`}
                                title={`${req.user?.name}: ${req.query}`}
                            >
                                {req.user?.name}
                            </div>
                        ))}
                    </div>

                    {dayRequests.length > 2 && (
                        <div className="absolute bottom-1 right-2 text-[7px] md:text-[8px] font-black text-slate-600">
                            +{dayRequests.length - 2} more
                        </div>
                    )}
                </motion.div>
            );
        }

        return <div className="grid grid-cols-7 gap-2">{cells}</div>;
    };

    return (
        <div className="relative">
            {showHeader && renderHeader()}
            {loading ? (
                <div className="h-96 flex items-center justify-center text-white/40 font-black animate-pulse">
                    LOADING CALENDAR DATA...
                </div>
            ) : (
                <div className="relative">
                    {renderDays()}
                    {renderCells()}
                </div>
            )}

            <div className="mt-8 flex flex-wrap gap-4 md:gap-6 text-[10px] font-black uppercase tracking-widest border-t border-white/5 pt-6">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-emerald-500/20 border border-emerald-500/30 rounded"></div>
                    <span className="text-emerald-500">Approved</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-amber-500/20 border border-amber-500/30 rounded"></div>
                    <span className="text-amber-500">Pending</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-rose-500/20 border border-rose-500/30 rounded"></div>
                    <span className="text-rose-500">Canceled</span>
                </div>
            </div>

            {/* Day Detail Popup */}
            <AnimatePresence>
                {selectedDay && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedDay(null)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-sm glass-card bg-[#1b2a3a] p-6 shadow-2xl border border-white/10"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-xl font-black text-white">
                                        {selectedDay.day} {currentDate.toLocaleString('default', { month: 'long' })}
                                    </h3>
                                    <p className="text-[10px] text-brand-400 font-black uppercase tracking-widest mt-1">Leave Details</p>
                                </div>
                                <button 
                                    onClick={() => setSelectedDay(null)}
                                    className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-white hover:bg-rose-500/20 transition-all"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-3 max-h-64 overflow-y-auto pr-2 scroll-premium">
                                {selectedDay.requests.length > 0 ? (
                                    selectedDay.requests.map((req, idx) => (
                                        <div key={idx} className="p-3 bg-white/5 rounded-2xl border border-white/5">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-black text-white">{req.user?.name}</span>
                                                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                                                    req.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-400' :
                                                    req.status === 'Pending' ? 'bg-amber-500/20 text-amber-400' :
                                                    'bg-rose-500/20 text-rose-400'
                                                }`}>
                                                    {req.status}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-white/50 leading-relaxed italic">"{req.query}"</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-6 text-white/20 font-bold text-xs">
                                        No leave records for this day
                                    </div>
                                )}
                            </div>

                            <button 
                                onClick={() => setSelectedDay(null)}
                                className="w-full mt-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/10"
                            >
                                Close Details
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LeaveCalendar;
