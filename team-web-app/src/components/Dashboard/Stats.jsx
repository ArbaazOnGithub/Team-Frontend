import React from 'react';
import Skeleton from '../Common/Skeleton';

const Stats = ({ stats, loading }) => {
    const totalRequests = Object.values(stats).reduce((acc, curr) => acc + (typeof curr === 'number' ? curr : 0), 0);

    const cards = [
        { label: 'Total', value: totalRequests, color: 'text-slate-800', bg: 'bg-slate-800', icon: '📁' },
        { label: 'Pending', value: stats['Pending'] || 0, color: 'text-brand-500', bg: 'bg-brand-500', icon: '⏳' },
        { label: 'Approved', value: stats['Approved'] || 0, color: 'text-brand-400', bg: 'bg-brand-400', icon: '✅' },
        { label: 'Cancelled', value: stats['Cancelled'] || 0, color: 'text-rose-500', bg: 'bg-rose-500', icon: '❌' }
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {cards.map((card, index) => (
                <div key={index} className="glass-card card-highlight p-6 text-center group">
                    <div className="text-2xl mb-2 opacity-50 group-hover:opacity-100 transition-opacity duration-300">{card.icon}</div>
                    <div className={`text-4xl font-black transition-all mb-1 group-hover:scale-110 duration-500 ${card.color}`}>
                        {loading ? <Skeleton className="h-10 w-12 mx-auto" /> : card.value}
                    </div>
                    <div className="text-[10px] text-[#68BA7F]/60 uppercase font-black tracking-[0.2em]">{card.label}</div>
                    <div className={`h-1.5 w-8 group-hover:w-16 transition-all duration-500 mx-auto mt-4 rounded-full ${card.bg} opacity-20 group-hover:opacity-100`}></div>
                </div>
            ))}
        </div>
    );
};

export default Stats;
