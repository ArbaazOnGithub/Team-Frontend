import React from 'react';

const RequestForm = ({ query, setQuery, submitRequest, loading, requestType, setRequestType, startDate, setStartDate, endDate, setEndDate, paidLeaveBalance }) => {

    // Calculate preview of days
    const getDaysCount = () => {
        if (!startDate || !endDate) return 0;
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (end < start) return 0;
        const diffTime = Math.abs(end - start);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    };

    const daysCount = getDaysCount();
    const isOverBalance = requestType === 'Leave' && daysCount > (paidLeaveBalance || 0);

    return (
        <div className={`glass-card bg-white/60 p-6 mb-8 border-2 transition-colors ${isOverBalance ? 'border-rose-300' : 'border-[#68BA7F]/20'}`}>
            <div className="flex gap-4 mb-4">
                <button
                    onClick={() => setRequestType('General')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${requestType === 'General' ? 'bg-[#2E6F40] text-white' : 'bg-white/50 text-[#253D2C]/60 hover:bg-white'}`}
                >
                    💬 General Query
                </button>
                <button
                    onClick={() => setRequestType('Leave')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${requestType === 'Leave' ? 'bg-[#2E6F40] text-white' : 'bg-white/50 text-[#253D2C]/60 hover:bg-white'}`}
                >
                    📅 Leave Request
                </button>
            </div>

            {requestType === 'Leave' && (
                <div className="mb-4 animate-fadeIn">
                    <div className="flex justify-between items-center mb-4 px-2">
                        <span className="text-[10px] font-black uppercase text-[#68BA7F]">Leave Balance</span>
                        <span className="text-xs font-black text-[#2E6F40] bg-[#CFFFDC] px-3 py-1 rounded-full border border-[#68BA7F]/30 shadow-sm">
                            {paidLeaveBalance || 0} Days Available
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-[#2E6F40] uppercase ml-1">From Date</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="input-premium py-2 bg-white/70 border-[#68BA7F]/30"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-[#2E6F40] uppercase ml-1">To Date</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="input-premium py-2 bg-white/70 border-[#68BA7F]/30"
                            />
                        </div>
                    </div>

                    {daysCount > 0 && (
                        <div className={`flex items-center justify-between p-3 rounded-xl mb-4 border ${isOverBalance ? 'bg-rose-50 border-rose-200' : 'bg-[#CFFFDC]/40 border-[#68BA7F]/20'}`}>
                            <div className="flex items-center gap-2">
                                <span className="text-lg">{isOverBalance ? '⚠️' : '✅'}</span>
                                <span className={`text-[10px] font-black uppercase tracking-wider ${isOverBalance ? 'text-rose-600' : 'text-[#2E6F40]'}`}>
                                    {daysCount} Days Requested
                                </span>
                            </div>
                            {isOverBalance && (
                                <span className="text-[9px] font-bold text-rose-500 max-w-[150px] text-right leading-tight">
                                    Exceeds availability. Approval might be rejected.
                                </span>
                            )}
                        </div>
                    )}
                </div>
            )}

            <textarea
                placeholder={requestType === 'General' ? "How can we help you today?" : "Reason for leave..."}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="input-premium min-h-24 mb-4 text-[#253D2C] placeholder:text-[#253D2C]/90 border-dashed border-[#68BA7F]/40"
                maxLength={1000}
            />
            <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-black/40 uppercase tracking-widest">{query.length} / 1000 characters</span>
                <button
                    onClick={submitRequest}
                    disabled={loading || !query.trim()}
                    className={`btn-premium px-8 py-3 rounded-xl font-bold text-sm transition-all shadow-lg ${isOverBalance ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-200 text-white' : 'bg-[#2E6F40] hover:bg-[#253D2C] shadow-[#2E6F40]/20 text-white'}`}
                >
                    {loading ? "Submitting..." : isOverBalance ? "Submit Anyway" : "Post Request"}
                </button>
            </div>
        </div>
    );
};

export default RequestForm;

