import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import * as api from '../../services/api';

const ChatSection = ({ isOpen, onClose, user, token, messages, onSendMessage, onTogglePin }) => {
    const [newMessage, setNewMessage] = useState("");
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        onSendMessage(newMessage);
        setNewMessage("");
    };

    const pinnedMessages = messages.filter(m => m.isPinned);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[150]"
                    />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-[160] flex flex-col border-l border-[#68BA7F]/20"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-[#68BA7F]/10 flex items-center justify-between bg-mesh-light">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">💬</span>
                                <div>
                                    <h3 className="text-xl font-black text-[#253D2C]">Team Chat</h3>
                                    <p className="text-[10px] text-[#2E6F40] font-bold uppercase tracking-widest">Real-time sync</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-rose-50 rounded-xl text-rose-500 transition-colors">✕</button>
                        </div>

                        {/* Pinned Messages Area */}
                        {pinnedMessages.length > 0 && (
                            <div className="bg-[#CFFFDC]/30 p-4 border-b border-[#68BA7F]/20">
                                <p className="text-[9px] font-black text-[#2E6F40] uppercase tracking-widest mb-2 flex items-center gap-1">
                                    📌 Pinned Messages ({pinnedMessages.length})
                                </p>
                                <div className="space-y-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                                    {pinnedMessages.map(msg => (
                                        <div key={msg._id} className="bg-white/80 p-2 rounded-lg border border-[#68BA7F]/30 text-xs shadow-sm flex justify-between items-start gap-3">
                                            <p className="text-[#253D2C] leading-snug"><span className="font-bold">{msg.user?.name}:</span> {msg.content}</p>
                                            <button onClick={() => onTogglePin(msg._id)} className="text-[10px] opacity-40 hover:opacity-100 transition-opacity">📍</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Messages List */}
                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[#F8FAF9]"
                        >
                            {messages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                                    <span className="text-5xl mb-4">🍃</span>
                                    <p className="font-bold text-[#253D2C]">Start the conversation!</p>
                                </div>
                            ) : (
                                messages.map((msg, idx) => {
                                    const isMe = msg.user?._id === user._id;
                                    return (
                                        <div key={msg._id || idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                            <div className={`flex items-end gap-2 max-w-[85%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                                <img
                                                    src={api.getImageUrl(msg.user?.profileImage)}
                                                    onError={(e) => e.target.src = "https://ui-avatars.com/api/?name=User&background=68BA7F&color=fff"}
                                                    className="w-7 h-7 rounded-full object-cover border border-[#68BA7F]/20 shadow-sm"
                                                    alt={msg.user?.name}
                                                />
                                                <div className="space-y-1">
                                                    {!isMe && <p className="text-[10px] font-bold text-[#2E6F40] ml-1">{msg.user?.name}</p>}
                                                    <div className={`p-4 rounded-2xl text-sm leading-relaxed relative group ${isMe
                                                            ? 'bg-[#2E6F40] text-white rounded-tr-none'
                                                            : 'bg-white text-[#253D2C] border border-[#68BA7F]/10 rounded-tl-none shadow-sm'
                                                        }`}>
                                                        {msg.content}

                                                        {/* Pin Action */}
                                                        <button
                                                            onClick={() => onTogglePin(msg._id)}
                                                            className={`absolute top-0 ${isMe ? '-left-8' : '-right-8'} p-1.5 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 ${msg.isPinned ? 'opacity-100' : ''}`}
                                                            title={msg.isPinned ? "Unpin" : "Pin"}
                                                        >
                                                            {msg.isPinned ? '📍' : '📌'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-[8px] text-gray-400 mt-1 uppercase font-bold tracking-tighter">
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSend} className="p-6 bg-white border-t border-[#68BA7F]/10">
                            <div className="relative group">
                                <input
                                    type="text"
                                    placeholder="Type your message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    className="input-premium py-4 pr-14 bg-[#F8FAF9] border-[#68BA7F]/20 focus:bg-white"
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-[#2E6F40] text-white rounded-xl shadow-lg shadow-[#2E6F40]/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                                >
                                    🚀
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ChatSection;
