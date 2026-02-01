import React from 'react';

const Stats = ({ stats }) => {
    // Calculate total from all keys in stats object
    const totalRequests = Object.values(stats).reduce((acc, curr) => acc + (typeof curr === 'number' ? curr : 0), 0);

    const cards = [
        { label: 'Total', value: totalRequests, color: 'text-slate-700', bg: 'bg-slate-700' },
        { label: 'Pending', value: stats['Pending'] || 0, color: 'text-[#68BA7F]', bg: 'bg-[#68BA7F]' },
        { label: 'Accepted', value: stats['Approved'] || 0, color: 'text-[#2E6F40]', bg: 'bg-[#2E6F40]' },
        { label: 'Rejected', value: stats['Cancelled'] || 0, color: 'text-rose-600', bg: 'bg-rose-600' }
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {cards.map((card, index) => (
                <div key={index} className={`glass-card bg-white/95 p-6 text-center group border border-[#68BA7F]/30`}>
                    <div className={`text-4xl font-black transition-transform group-hover:scale-110 duration-300 ${card.color}`}>
                        {card.value}
                    </div>
                    <div className="text-xs text-[#253D2C] uppercase font-black tracking-widest mt-2">{card.label}</div>
                    <div className={`h-1 w-0 group-hover:w-full transition-all duration-300 mx-auto mt-3 rounded-full ${card.bg}`}></div>
                </div>
            ))}
        </div>
    );
};

export default Stats;
