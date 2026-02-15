import React from 'react';

const RequestForm = ({ query, setQuery, submitRequest, loading, requestType, setRequestType, startDate, setStartDate, endDate, setEndDate }) => {
    return (
        <div className="glass-card bg-white/60 p-6 mb-8 border-[#68BA7F]/20">
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
                <div className="grid grid-cols-2 gap-4 mb-4 animate-fadeIn">
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
                    className="btn-premium px-8 py-3 bg-[#2E6F40] text-white rounded-xl font-bold text-sm hover:bg-[#253D2C] hover:shadow-xl hover:shadow-[#2E6F40]/20"
                >
                    {loading ? "Submitting..." : "Post Request"}
                </button>
            </div>
        </div>
    );
};

export default RequestForm;
