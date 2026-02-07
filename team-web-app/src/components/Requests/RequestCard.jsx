import React, { useState } from 'react';
import { getImageUrl } from '../../services/api';

const RequestCard = ({ req, user, changeStatus, deleteRequest, formatDate }) => {
    const [isActioning, setIsActioning] = useState(false);
    const [actionType, setActionType] = useState(""); // "Approved" or "Cancelled"
    const [remark, setRemark] = useState("");

    if (!req.user) return null;

    const handleAction = () => {
        if (!actionType) return;
        changeStatus(req._id, actionType, remark);
        setIsActioning(false);
        setRemark("");
        setActionType("");
    }

    return (
        <div className={`glass-card bg-white/70 p-6 border-l-8 ${req.status?.toLowerCase() === 'pending' ? 'border-[#68BA7F]' : req.status?.toLowerCase() === 'approved' ? 'border-[#2E6F40]' : req.status?.toLowerCase() === 'resolved' ? 'border-[#253D2C]' : 'border-[#253D2C]/40'}`}>
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <img
                            src={getImageUrl(req.user.profileImage)}
                            onError={(e) => e.target.src = "https://via.placeholder.com/50?text=USER"}
                            className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                            alt={req.user.name}
                        />
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${req.status?.toLowerCase() === 'pending' ? 'bg-[#68BA7F]' : req.status?.toLowerCase() === 'approved' ? 'bg-[#2E6F40]' : req.status?.toLowerCase() === 'resolved' ? 'bg-[#253D2C]' : 'bg-rose-500'}`}></div>
                    </div>
                    <div>
                        <h3 className="font-bold text-[#253D2C] leading-tight">{req.user.name}</h3>
                        <p className="text-xs text-[#68BA7F] font-bold uppercase tracking-tighter">{formatDate(req.createdAt)}</p>
                    </div>
                </div>
                <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${req.status?.toLowerCase() === 'pending' ? 'bg-[#68BA7F]/10 text-[#68BA7F]' : req.status?.toLowerCase() === 'approved' ? 'bg-[#2E6F40]/10 text-[#2E6F40]' : req.status?.toLowerCase() === 'resolved' ? 'bg-[#253D2C]/10 text-[#253D2C]' : 'bg-rose-50 text-rose-600'}`}>
                    {req.status}
                </span>
            </div>
            <div className="mb-6 pl-2 border-l-2 border-[#68BA7F]/20">
                <p className="text-[#253D2C]/80 leading-relaxed text-sm">{req.query}</p>
                {req.comment && (
                    <div className={`mt-4 p-3 rounded-lg border ${req.status === 'Cancelled' ? 'bg-rose-50 border-rose-100' : 'bg-[#68BA7F]/10 border-[#68BA7F]/20'}`}>
                        <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${req.status === 'Cancelled' ? 'text-rose-400' : 'text-[#68BA7F]'}`}>
                            {req.status === 'Cancelled' ? 'Rejection Reason:' : 'Admin Remark:'}
                        </p>
                        <p className={`text-xs ${req.status === 'Cancelled' ? 'text-rose-700' : 'text-[#253D2C]'}`}>{req.comment}</p>
                    </div>
                )}
                {req.actionBy && req.status !== 'Pending' && (
                    <div className="mt-4 flex items-center gap-1.5 px-3 py-1.5 bg-[#68BA7F]/10 rounded-full w-fit">
                        <span className="text-[10px] font-black text-[#68BA7F] uppercase tracking-tighter">Handled by:</span>
                        <span className="text-[10px] font-bold text-[#2E6F40]">{req.actionBy.name}</span>
                    </div>
                )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-[#68BA7F]/10">
                {user.role === "admin" && req.status === "Pending" && (
                    <div className="w-full sm:w-auto">
                        {!isActioning ? (
                            <div className="flex gap-2 w-full">
                                <button className="btn-premium flex-1 px-4 py-2 bg-[#2E6F40] text-white rounded-lg text-xs font-black uppercase tracking-tight hover:bg-[#253D2C]" onClick={() => { setIsActioning(true); setActionType("Approved"); }}>Accept</button>
                                <button className="btn-premium flex-1 px-4 py-2 bg-[#253D2C]/10 text-[#253D2C] border border-[#253D2C]/20 rounded-lg text-xs font-black uppercase tracking-tight hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200" onClick={() => { setIsActioning(true); setActionType("Cancelled"); }}>Reject</button>
                            </div>
                        ) : (
                            <div className="w-full animate-fadeIn">
                                <textarea
                                    className={`w-full p-3 text-xs bg-white border rounded-lg focus:outline-none mb-2 ${actionType === 'Cancelled' ? 'border-rose-200 focus:border-rose-400 text-rose-800 placeholder:text-rose-300' : 'border-[#68BA7F]/30 focus:border-[#2E6F40] text-[#253D2C] placeholder:#68BA7F/50'}`}
                                    placeholder={actionType === 'Cancelled' ? "Reason for rejection..." : "Add a remark (optional)..."}
                                    value={remark}
                                    onChange={(e) => setRemark(e.target.value)}
                                    autoFocus
                                ></textarea>
                                <div className="flex gap-2">
                                    <button
                                        className={`btn-premium flex-1 px-3 py-1.5 text-white rounded-md text-[10px] font-black uppercase tracking-widest ${actionType === 'Cancelled' ? 'bg-rose-500 hover:bg-rose-600' : 'bg-[#2E6F40] hover:bg-[#253D2C]'}`}
                                        onClick={handleAction}
                                    >
                                        Confirm {actionType === 'Approved' ? 'Approval' : 'Rejection'}
                                    </button>
                                    <button
                                        className="btn-premium px-3 py-1.5 bg-gray-100 text-gray-500 rounded-md text-[10px] font-black uppercase tracking-widest hover:bg-gray-200"
                                        onClick={() => { setIsActioning(false); setRemark(""); setActionType(""); }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {(user.role === "admin" || req.user._id === user._id) && !isRejecting && (
                    <button className="btn-premium text-[#2E6F40] hover:text-[#253D2C] font-bold text-xs uppercase tracking-widest flex items-center gap-1 group" onClick={() => deleteRequest(req._id)}>
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity">✕</span> Delete Request
                    </button>
                )}
            </div>
        </div>
    );
};

export default RequestCard;

