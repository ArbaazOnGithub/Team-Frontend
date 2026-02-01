import React from 'react';
import { getImageUrl } from '../../services/api';

const Header = ({ user, handleLogout }) => {
    return (
        <header className="glass bg-[#CFFFDC]/90 px-6 py-4 flex justify-between items-center sticky top-0 z-50 border-b border-[#68BA7F]/30">
            <h1 className="text-2xl font-black bg-gradient-to-r from-[#2E6F40] to-[#68BA7F] bg-clip-text text-transparent">Team Queries</h1>
            <div className="flex items-center gap-4">
                <div
                    className="flex items-center gap-3 pr-4 border-r border-[#68BA7F]/20 cursor-pointer group/profile"
                    onClick={() => window.dispatchEvent(new CustomEvent('open-profile'))}
                >
                    <img src={getImageUrl(user.profileImage)} className="w-10 h-10 rounded-full object-cover border-2 border-[#2E6F40] shadow-sm transition-transform group-hover/profile:scale-110" alt="Profile" />
                    <div className="hidden sm:block">
                        <div className="font-bold text-sm text-[#253D2C] leading-tight">{user.name}</div>
                        <div className="text-[10px] bg-[#68BA7F]/20 text-[#2E6F40] px-2 py-0.5 rounded-full font-black w-fit uppercase tracking-tighter">{user.role}</div>
                    </div>
                </div>
                <button onClick={handleLogout} className="btn-premium px-5 py-2 bg-[#253D2C] text-white rounded-xl text-xs font-bold hover:bg-[#2E6F40] shadow-lg shadow-[#253D2C]/20">Logout</button>
            </div>
        </header>
    );
};

export default Header;
