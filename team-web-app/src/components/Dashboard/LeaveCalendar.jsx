import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as api from '../../services/api';
import toast from 'react-hot-toast';

const LeaveCalendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

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
            cells.push(<div key={`empty-${i}`} className="h-32 bg-transparent"></div>);
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
                    className={`h-32 glass-card bg-[#1b2a3a]/20 border-white/5 p-2 overflow-y-auto relative hover:bg-[#1b2a3a]/40 transition-colors group ${
                        new Date().toDateString() === currDateObj.toDateString() ? 'border-brand-500/50 bg-brand-500/5' : ''
                    }`}
                >
                    <span className={`text-xs font-black ${
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

                    {dayRequests.length > 3 && (
                        <div className="absolute bottom-1 right-2 text-[8px] font-black text-slate-600">
                            +{dayRequests.length - 3} more
                        </div>
                    )}
                </motion.div>
            );
        }

        return <div className="grid grid-cols-7 gap-2">{cells}</div>;
    };

    return (
        <div className="glass-card bg-[#1b2a3a]/40 p-8 border-white/10">
            {renderHeader()}
            {loading ? (
                <div className="h-96 flex items-center justify-center text-white/40 font-black animate-pulse">
                    LOADING CALENDAR DATA...
                </div>
            ) : (
                <>
                    {renderDays()}
                    {renderCells()}
                </>
            )}

            <div className="mt-8 flex gap-6 text-[10px] font-black uppercase tracking-widest border-t border-white/5 pt-6">
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
        </div>
    );
};

export default LeaveCalendar;
