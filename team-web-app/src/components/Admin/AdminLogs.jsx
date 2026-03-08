import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import * as api from '../../services/api';
import * as XLSX from 'xlsx';

const AdminLogs = ({ token }) => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [activeSubTab, setActiveSubTab] = useState('requests'); // 'requests' or 'system'
    const [systemLogs, setSystemLogs] = useState([]);

    useEffect(() => {
        if (activeSubTab === 'requests') loadLogs();
        else loadSystemLogs();
    }, [activeSubTab]);

    const loadSystemLogs = async () => {
        setLoading(true);
        try {
            const data = await api.fetchSystemLogs(token);
            setSystemLogs(data);
        } catch (err) {
            toast.error("Failed to fetch system logs");
        } finally {
            setLoading(false);
        }
    };

    const loadLogs = async () => {
        setLoading(true);
        try {
            const data = await api.fetchRequestLogs(token);
            setLogs(data);
        } catch (err) {
            toast.error("Failed to fetch logs");
        } finally {
            setLoading(false);
        }
    };

    const handleExportExcel = () => {
        if (logs.length === 0) return toast.error("No logs to export");

        const dataToExport = logs.map(log => ({
            "Request No": log.requestNo || 'N/A',
            "Raiser Name": log.user?.name || 'N/A',
            "Raiser Email": log.user?.email || 'N/A',
            "Raiser Mobile": log.user?.mobile || 'N/A',
            "Query": log.query,
            "Status": log.status,
            "Admin Remark": log.comment || 'N/A',
            "Handled By": log.actionBy?.name || 'N/A',
            "Created At": new Date(log.createdAt).toLocaleString(),
            "Last Updated": new Date(log.updatedAt).toLocaleString()
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Request Logs");
        XLSX.writeFile(workbook, `Team_Requests_Logs_${new Date().toISOString().split('T')[0]}.xlsx`);
        toast.success("Excel file downloaded!");
    };

    const filteredLogs = logs.filter(log => {
        const matchesSearch =
            (log.requestNo?.toString() || '').includes(searchTerm) ||
            (log.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (log.query || '').toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = filterStatus === 'all' || log.status === filterStatus;

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="animate-fadeIn">
            {/* Sub-tabs for Logs */}
            <div className="flex gap-4 mb-6 border-b border-[#68BA7F]/10 pb-4">
                <button
                    onClick={() => setActiveSubTab('requests')}
                    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'requests' ? 'bg-[#2E6F40] text-white shadow-md' : 'text-[#2E6F40]/60 hover:bg-white'}`}
                >
                    Ticket Logs
                </button>
                <button
                    onClick={() => setActiveSubTab('system')}
                    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'system' ? 'bg-[#2E6F40] text-white shadow-md' : 'text-[#2E6F40]/60 hover:bg-white'}`}
                >
                    System Activity
                </button>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex flex-1 gap-4 max-w-2xl">
                    <div className="relative group flex-1">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#2E6F40]/60 group-focus-within:text-[#2E6F40] transition-colors">🔍</span>
                        <input
                            type="text"
                            placeholder="Search by Request No, Name, or Query..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input-premium pl-12 py-3 bg-white/70 border-[#2E6F40]/30 focus:bg-white"
                        />
                    </div>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="input-premium w-40 py-3 bg-white/70 border-[#2E6F40]/30 font-bold text-xs uppercase tracking-widest cursor-pointer focus:bg-white text-[#253D2C]"
                    >
                        <option value="all">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </div>
                <button
                    onClick={handleExportExcel}
                    className="flex items-center gap-2 px-6 py-3 bg-[#2E6F40] text-white rounded-xl font-bold text-sm hover:bg-[#253D2C] shadow-lg shadow-[#2E6F40]/20 transition-all active:scale-95"
                >
                    📥 Export to Excel
                </button>
            </div>

            <div className="glass-card overflow-hidden border-white/20">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="border-b border-black/5 bg-white/30">
                                <th className="p-5 text-[#2E6F40] font-bold uppercase text-[10px] tracking-widest">No</th>
                                <th className="p-5 text-[#2E6F40] font-bold uppercase text-[10px] tracking-widest">Raiser</th>
                                <th className="p-5 text-[#2E6F40] font-bold uppercase text-[10px] tracking-widest">Query</th>
                                <th className="p-5 text-[#2E6F40] font-bold uppercase text-[10px] tracking-widest">Status</th>
                                <th className="p-5 text-[#2E6F40] font-bold uppercase text-[10px] tracking-widest">Handler</th>
                                <th className="p-5 text-[#2E6F40] font-bold uppercase text-[10px] tracking-widest">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence mode="popLayout">
                                {filteredLogs.length > 0 ? filteredLogs.map((log) => (
                                    <motion.tr
                                        key={log._id}
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="border-b border-black/5 hover:bg-white/50 transition-colors group"
                                    >
                                        <td className="p-5 font-black text-[#2E6F40]">#{log.requestNo || '---'}</td>
                                        <td className="p-5">
                                            <div className="font-bold text-[#253D2C]">{log.user?.name || 'Deleted User'}</div>
                                            <div className="text-[10px] text-[#68BA7F]">{log.user?.email}</div>
                                        </td>
                                        <td className="p-5 max-w-xs">
                                            <p className="text-xs text-[#253D2C]/80 line-clamp-2">{log.query}</p>
                                        </td>
                                        <td className="p-5">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${log.status === 'Pending' ? 'bg-[#68BA7F]/10 text-[#68BA7F]' :
                                                log.status === 'Approved' ? 'bg-[#2E6F40]/10 text-[#2E6F40]' :
                                                    log.status === 'Resolved' ? 'bg-[#253D2C]/10 text-[#253D2C]' :
                                                        'bg-rose-50 text-rose-600'
                                                }`}>
                                                {log.status}
                                            </span>
                                        </td>
                                        <td className="p-5">
                                            {log.actionBy ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-[#2E6F40]"></span>
                                                    <span className="text-xs font-bold text-[#2E6F40]">{log.actionBy.name}</span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">Unassigned</span>
                                            )}
                                        </td>
                                        <td className="p-5">
                                            <div className="text-[10px] font-bold text-[#253D2C]">{new Date(log.createdAt).toLocaleDateString()}</div>
                                            <div className="text-[9px] text-[#68BA7F]">{new Date(log.createdAt).toLocaleTimeString()}</div>
                                        </td>
                                    </motion.tr>
                                )) : !loading && (
                                    <tr>
                                        <td colSpan="6" className="p-10 text-center font-bold text-[#253D2C]/40">No logs matching your criteria</td>
                                    </tr>
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
                {loading && (
                    <div className="p-10 text-center">
                        <div className="animate-spin w-8 h-8 border-4 border-[#2E6F40] border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-sm font-bold text-[#68BA7F]">Loading log history...</p>
                    </div>
                )}
            </div>

            {activeSubTab === 'system' && (
                <div className="glass-card overflow-hidden border-white/20 mt-8">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-black/5 bg-white/30">
                                    <th className="p-5 text-[#2E6F40] font-bold uppercase text-[10px] tracking-widest">User</th>
                                    <th className="p-5 text-[#2E6F40] font-bold uppercase text-[10px] tracking-widest">Action</th>
                                    <th className="p-5 text-[#2E6F40] font-bold uppercase text-[10px] tracking-widest">Type</th>
                                    <th className="p-5 text-[#2E6F40] font-bold uppercase text-[10px] tracking-widest">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody>
                                {systemLogs.map((log) => (
                                    <tr key={log._id} className="border-b border-black/5 hover:bg-white/50 transition-colors">
                                        <td className="p-5">
                                            <div className="font-bold text-[#253D2C]">{log.user?.name || 'Unknown'}</div>
                                            <div className="text-[10px] text-[#68BA7F]">{log.user?.role}</div>
                                        </td>
                                        <td className="p-5">
                                            <p className="text-xs font-medium text-[#253D2C]">{log.action}</p>
                                        </td>
                                        <td className="p-5">
                                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-gray-100 text-gray-600`}>
                                                {log.type}
                                            </span>
                                        </td>
                                        <td className="p-5">
                                            <div className="text-[10px] font-bold text-[#253D2C]">{new Date(log.createdAt).toLocaleDateString()}</div>
                                            <div className="text-[9px] text-[#68BA7F]">{new Date(log.createdAt).toLocaleTimeString()}</div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminLogs;
