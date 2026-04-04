import React, { useState } from 'react';
import { getImageUrl } from '../../services/api';

const RequestCard = ({ req, user, changeStatus, deleteRequest, formatDate }) => {
    const [isActioning, setIsActioning] = useState(false);
    const [actionType, setActionType] = useState("");
    const [remark, setRemark] = useState("");

    if (!req.user) return null;

    const handleAction = () => {
        if (!actionType) return;
        changeStatus(req._id, actionType, remark);
        setIsActioning(false);
        setRemark("");
        setActionType("");
    }

    const statusConfig = {
        pending: { dot: 'bg-amber-400', badge: 'bg-amber-400/10 text-amber-600', border: 'border-amber-400/30' },
        approved: { dot: 'bg-emerald-500', badge: 'bg-emerald-500/10 text-emerald-600', border: 'border-emerald-500/30' },
        resolved: { dot: 'bg-brand-500', badge: 'bg-brand-500/10 text-brand-600', border: 'border-brand-500/30' },
        cancelled: { dot: 'bg-rose-500', badge: 'bg-rose-500/10 text-rose-600', border: 'border-rose-500/30' }
    };

    const currentStatus = req.status?.toLowerCase() || 'pending';
    const config = statusConfig[currentStatus] || statusConfig.pending;

    return (
        <div className={`glass-card p-6 border-l-[6px] mb-6 ${config.border}`}>
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <img
                            src={getImageUrl(req.user.profileImage)}
                            onError={(e) => e.target.src = "https://ui-avatars.com/api/?name=User&background=68BA7F&color=fff"}
                            className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-md transition-transform hover:scale-110"
                            alt={req.user.name}
                        />
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${config.dot}`}></div>
                    </div>
                    <div>
                        <h3 className="font-black text-brand-600 leading-tight tracking-tight">{req.user.name}</h3>
                        <p className="text-[10px] text-brand-400 font-bold uppercase tracking-widest mt-0.5">{formatDate(req.createdAt)}</p>
                    </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.15em] border ${config.badge}`}>
                    {req.status}
                </span>
            </div>

            <div className="mb-6 pl-4 border-l border-brand-100">
                <p className="text-brand-600/80 leading-relaxed text-sm font-medium">{req.query}</p>
                
                {req.requestType === 'Leave' && (
                    <div className="mt-4 flex flex-wrap gap-2">
                        <div className="px-3 py-1.5 bg-brand-50 text-brand-600 rounded-xl text-[10px] font-bold flex items-center gap-2 border border-brand-100 shadow-sm">
                            <span className="text-base leading-none">🗓️</span>
                            <span>{new Date(req.startDate).toLocaleDateString()} — {new Date(req.endDate).toLocaleDateString()}</span>
                        </div>
                        <div className="px-3 py-1.5 bg-brand-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-500/20">
                            {req.daysCount} Days
                        </div>
                    </div>
                )}

                {req.attachmentUrl && (
                    <div className="mt-5">
                        <div className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-400 mb-3 ml-1">Evidence / Attachment</div>
                        <a 
                            href={req.attachmentUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-block relative group/img"
                        >
                            {req.attachmentUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                                <div className="relative overflow-hidden rounded-2xl border-2 border-white shadow-xl">
                                    <img 
                                        src={req.attachmentUrl} 
                                        alt="Attachment" 
                                        className="max-w-[180px] transition-all duration-500 group-hover/img:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                        <span className="text-white text-xs font-black">VIEW FULL</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="px-5 py-3 bg-white/80 border border-brand-100 rounded-2xl text-[10px] font-black text-brand-600 uppercase tracking-widest flex items-center gap-3 hover:bg-brand-50 transition-all shadow-sm">
                                    <span className="text-xl">📄</span> View Document
                                </div>
                            )}
                        </a>
                    </div>
                )}

                {(req.comment || (req.actionBy && req.status !== 'Pending')) && (
                    <div className={`mt-6 p-4 rounded-2xl border backdrop-blur-md shadow-lg shadow-white/10 ${req.status === 'Cancelled' ? 'bg-rose-500/10 border-rose-500/20' : 'bg-black/20 border-white/10'}`}>
                        <div className="flex items-center justify-between mb-2">
                             <p className={`text-[9px] font-black uppercase tracking-widest ${req.status === 'Cancelled' ? 'text-rose-500' : 'text-brand-400'}`}>
                                {req.status === 'Cancelled' ? 'Rejection Reason' : 'Admin Resolution'}
                            </p>
                            {req.actionBy && (
                                <div className="flex items-center gap-1 opacity-40">
                                    <span className="text-[8px] font-black uppercase">by {req.actionBy.name}</span>
                                </div>
                            )}
                        </div>
                        <p className={`text-xs leading-relaxed font-medium ${req.status === 'Cancelled' ? 'text-rose-700' : 'text-brand-600'}`}>{req.comment || "Processed without additional remarks."}</p>
                    </div>
                )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-brand-50">
                {user.role === "admin" && req.status === "Pending" && (
                    <div className="w-full sm:w-auto">
                        {!isActioning ? (
                            <div className="flex gap-3 w-full">
                                <button className="btn-premium flex-1 px-6 py-2.5 bg-brand-500 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand-500/20" onClick={() => { setIsActioning(true); setActionType("Approved"); }}>✔ Approve</button>
                                <button className="btn-premium flex-1 px-6 py-2.5 bg-white text-rose-500 border border-rose-100 text-[10px] font-black uppercase tracking-widest" onClick={() => { setIsActioning(true); setActionType("Cancelled"); }}>✖ Reject</button>
                            </div>
                        ) : (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="w-full"
                            >
                                <textarea
                                    className={`w-full p-4 text-xs bg-black/30 backdrop-blur-md border rounded-2xl focus:outline-none mb-3 transition-all shadow-inner ${actionType === 'Cancelled' ? 'border-rose-500/30 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/5' : 'border-white/10 focus:border-[#547792] focus:ring-4 focus:ring-[#547792]/5'}`}
                                    placeholder={actionType === 'Cancelled' ? "Reason for rejection..." : "Add a remark (optional)..."}
                                    value={remark}
                                    onChange={(e) => setRemark(e.target.value)}
                                    autoFocus
                                ></textarea>
                                <div className="flex gap-2">
                                    <button
                                        className={`btn-premium flex-2 px-4 py-2 text-white text-[10px] font-black uppercase tracking-widest ${actionType === 'Cancelled' ? 'bg-rose-500 shadow-rose-500/20' : 'bg-brand-500 shadow-brand-500/20'}`}
                                        onClick={handleAction}
                                    >
                                        Confirm {actionType === 'Approved' ? 'Approval' : 'Rejection'}
                                    </button>
                                    <button
                                        className="btn-premium flex-1 px-4 py-2 bg-slate-800 text-slate-500 text-[10px] font-black uppercase tracking-widest"
                                        onClick={() => { setIsActioning(false); setRemark(""); setActionType(""); }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </div>
                )}

                {(user.role === "admin" || req.user._id === user._id) && !isActioning && (
                    <button className="flex items-center gap-2 group ml-auto" onClick={() => deleteRequest(req._id)}>
                        <span className="text-rose-200 group-hover:text-rose-500 transition-colors text-lg">🗑️</span>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 group-hover:text-rose-500 transition-colors">Delete</span>
                    </button>
                )}
            </div>
        </div>
    );
};

export default RequestCard;

