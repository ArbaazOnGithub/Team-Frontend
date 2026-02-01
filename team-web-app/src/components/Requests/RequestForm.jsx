import React from 'react';

const RequestForm = ({ query, setQuery, submitRequest, loading }) => {
    return (
        <div className="glass-card bg-white/60 p-6 mb-8 border-[#68BA7F]/20">
            <textarea
                placeholder="How can we help you today?"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="input-premium min-h-32 mb-4 text-[#253D2C] placeholder:text-[#253D2C]/90 border-dashed border-[#68BA7F]/40"
                maxLength={1000}
            />
            <div className="flex justify-between items-center">
                <span className="text-[12px] font-bold text-black/80 uppercase tracking-widest">{query.length} / 1000 characters</span>
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
