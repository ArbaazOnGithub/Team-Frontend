import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import * as api from '../../services/api';

const ErrorLogs = ({ token }) => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedLog, setSelectedLog] = useState(null);

    useEffect(() => {
        loadLogs();
    }, []);

    const loadLogs = async () => {
        setLoading(true);
        try {
            const data = await api.fetchSystemErrorLogs(token);
            setLogs(data);
        } catch (err) {
            toast.error("Failed to fetch system error logs.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-card p-6 border-rose-200">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-rose-600 flex items-center gap-2">
                    <span>⚠️</span> Global Error Logs
                </h3>
                <button
                    onClick={loadLogs}
                    disabled={loading}
                    className="btn-premium px-4 py-2 bg-rose-50 text-rose-600 rounded-lg text-xs font-bold hover:bg-rose-100"
                >
                    {loading ? "Refreshing..." : "Refresh"}
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-rose-100 bg-rose-50/50">
                            <th className="p-4 text-rose-800 font-bold uppercase text-xs tracking-widest">Time</th>
                            <th className="p-4 text-rose-800 font-bold uppercase text-xs tracking-widest">Method</th>
                            <th className="p-4 text-rose-800 font-bold uppercase text-xs tracking-widest">Endpoint</th>
                            <th className="p-4 text-rose-800 font-bold uppercase text-xs tracking-widest">Message</th>
                            <th className="p-4 text-rose-800 font-bold uppercase text-xs tracking-widest text-right">Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence>
                            {logs.length > 0 ? logs.map(log => (
                                <motion.tr
                                    key={log._id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="border-b border-rose-50 hover:bg-rose-50/30 transition-colors"
                                >
                                    <td className="p-4 text-xs font-medium text-slate-600">
                                        {new Date(log.createdAt).toLocaleString()}
                                    </td>
                                    <td className="p-4">
                                        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-black uppercase">
                                            {log.method || 'UKNWN'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-xs font-mono text-slate-700">
                                        {log.endpoint || '/system'}
                                    </td>
                                    <td className="p-4 text-sm font-bold text-rose-700 max-w-xs truncate">
                                        {log.message}
                                    </td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => setSelectedLog(log)}
                                            className="px-3 py-1 bg-rose-100 text-rose-600 rounded-lg text-[10px] font-black uppercase hover:bg-rose-200 transition-colors"
                                        >
                                            Inspect
                                        </button>
                                    </td>
                                </motion.tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-sm font-bold text-slate-400">
                                        No errors tracked recently. System is healthy!
                                    </td>
                                </tr>
                            )}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>

            {/* Error Detail Modal */}
            <AnimatePresence>
                {selectedLog && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedLog(null)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900 rounded-3xl p-8 shadow-2xl border border-rose-500/30"
                        >
                            <div className="flex justify-between items-start mb-6 border-b border-slate-700 pb-4">
                                <div>
                                    <h3 className="text-xl font-black text-rose-400 font-mono mb-2">{selectedLog.message}</h3>
                                    <div className="flex gap-3 text-xs font-mono">
                                        <span className="text-slate-400">🕒 {new Date(selectedLog.createdAt).toLocaleString()}</span>
                                        <span className="text-emerald-400">🌐 {selectedLog.method} {selectedLog.endpoint}</span>
                                        {selectedLog.user && (
                                            <span className="text-indigo-400">👤 {selectedLog.user.name} ({selectedLog.user.email})</span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedLog(null)}
                                    className="p-2 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-xl transition-all"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="bg-black/50 p-6 rounded-xl overflow-x-auto border border-slate-800">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 select-none">Stack Trace</h4>
                                <pre className="text-xs text-rose-200/80 font-mono leading-relaxed whitespace-pre-wrap word-break">
                                    {selectedLog.stackTrace || 'No stack trace available.'}
                                </pre>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ErrorLogs;
