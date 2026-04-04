import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import * as api from '../../services/api';

const ChatSection = ({ isOpen, onClose, user, token, messages, users, onSendMessage, onTogglePin, onMarkRead, onDeleteMessage }) => {
    const [newMessage, setNewMessage] = useState("");
    const [uploading, setUploading] = useState(false);
    const [activeMenuId, setActiveMenuId] = useState(null);
    const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
    const scrollRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    // Track seen messages
    useEffect(() => {
        if (isOpen && messages.length > 0) {
            messages.forEach(msg => {
                const isReadByMe = msg.readBy?.some(r => (r._id || r) === user._id);
                if (!isReadByMe && msg.user?._id !== user._id) {
                    onMarkRead(msg._id);
                }
            });
        }
    }, [isOpen, messages, user._id, onMarkRead]);

    useEffect(() => {
        const handleClickOutside = () => setActiveMenuId(null);
        if (activeMenuId) {
            window.addEventListener('click', handleClickOutside);
        }
        return () => window.removeEventListener('click', handleClickOutside);
    }, [activeMenuId]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        onSendMessage(newMessage);
        setNewMessage("");
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const data = await api.uploadChatMessageFile(file);
            onSendMessage({
                content: file.name,
                fileUrl: data.fileUrl,
                fileType: data.fileType
            });
            toast.success("File shared!");
        } catch (err) {
            toast.error("Upload failed");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
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
                        className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#213448] shadow-2xl z-[160] flex flex-col border-l border-white/10"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#1b2a3a]">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">💬</span>
                                <div>
                                    <h3 className="text-xl font-black text-[#EAE0CF]">Team Chat</h3>
                                    <p className="text-[10px] text-[#EAE0CF] font-bold uppercase tracking-widest">Real-time sync • {users.length} members</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-rose-50 rounded-xl text-rose-500 transition-colors">✕</button>
                        </div>

                        {/* Pinned Messages Area */}
                        {pinnedMessages.length > 0 && (
                            <div className="bg-[#547792]/20 p-4 border-b border-white/10">
                                <p className="text-[9px] font-black text-[#94B4C1] uppercase tracking-widest mb-2 flex items-center gap-1">
                                    📌 Pinned Messages ({pinnedMessages.length})
                                </p>
                                <div className="space-y-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                                    {pinnedMessages.map(msg => (
                                        <div key={msg._id} className="bg-black/30 backdrop-blur-md p-2 rounded-lg border border-white/10 text-xs shadow-lg shadow-brand-400/10 flex justify-between items-start gap-3">
                                            <p className="text-[#EAE0CF] leading-snug"><span className="font-bold">{msg.user?.name}:</span> {msg.content}</p>
                                            <button onClick={() => onTogglePin(msg._id)} className="text-[10px] opacity-40 hover:opacity-100 transition-opacity whitespace-nowrap">📍</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Messages List */}
                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[#172432]"
                        >
                            {messages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                                    <span className="text-5xl mb-4">🍃</span>
                                    <p className="font-bold text-[#EAE0CF]">Start the conversation!</p>
                                </div>
                            ) : (
                                messages.map((msg, idx) => {
                                    const isMe = msg.user?._id === user._id;
                                    const readBy = msg.readBy || [];
                                    const unreadBy = users.filter(u =>
                                        u._id !== msg.user?._id &&
                                        !readBy.some(r => (r._id || r) === u._id)
                                    );

                                    return (
                                        <div key={msg._id || idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                            <div className={`flex items-end gap-2 max-w-[85%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                                <img
                                                    src={api.getImageUrl(msg.user?.profileImage)}
                                                    onError={(e) => e.target.src = "https://ui-avatars.com/api/?name=User&background=68BA7F&color=fff"}
                                                    className="w-7 h-7 rounded-full object-cover border border-[#547792]/20 shadow-sm"
                                                    alt={msg.user?.name}
                                                />
                                                <div className="space-y-1">
                                                    {!isMe && <p className="text-[10px] font-bold text-[#EAE0CF] ml-1">{msg.user?.name}</p>}
                                                    <div className={`p-4 rounded-2xl text-sm leading-relaxed relative group backdrop-blur-md shadow-lg ${isMe
                                                        ? 'bg-[#94B4C1]/90 text-[#213448] rounded-tr-none shadow-white/20'
                                                        : 'bg-[#2e435a]/80 text-[#EAE0CF] border border-white/10 rounded-tl-none shadow-brand-400/10'
                                                        }`}>
                                                        {msg.fileUrl ? (
                                                            <div className="space-y-2">
                                                                {msg.fileType === 'image' ? (
                                                                    <img
                                                                        src={api.getImageUrl(msg.fileUrl)}
                                                                        className="max-w-full rounded-lg border border-white/5 shadow-inner cursor-pointer hover:scale-[1.02] transition-transform"
                                                                        alt="shared"
                                                                        onClick={() => window.open(api.getImageUrl(msg.fileUrl), '_blank')}
                                                                    />
                                                                ) : (
                                                                    <a
                                                                        href={api.getImageUrl(msg.fileUrl)}
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                        className={`flex items-center gap-3 p-3 rounded-xl border ${isMe ? 'bg-black/20 border-white/5' : 'bg-black/40 border-white/5'} hover:bg-opacity-80 transition-all`}
                                                                    >
                                                                        <span className="text-xl">📄</span>
                                                                        <div className="flex-1 overflow-hidden font-bold">
                                                                            <p className={`truncate text-[11px] ${isMe ? 'text-white' : 'text-[#EAE0CF]'}`}>{msg.content || 'Document'}</p>
                                                                            <p className="text-[9px] opacity-60 uppercase font-black tracking-widest">Download File</p>
                                                                        </div>
                                                                    </a>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            msg.content
                                                        )}

                                                        {(isMe || ['admin', 'superadmin'].includes(user.role)) && (
                                                            <div className={`absolute top-0 ${isMe ? '-left-8' : '-right-8'}`}>
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        if (activeMenuId === msg._id) {
                                                                            setActiveMenuId(null);
                                                                        } else {
                                                                            const rect = e.currentTarget.getBoundingClientRect();
                                                                            setMenuPos({ top: rect.bottom + 4, left: isMe ? rect.right - 144 : rect.left, msgId: msg._id });
                                                                            setActiveMenuId(msg._id);
                                                                        }
                                                                    }}
                                                                    className="p-1.5 text-gray-400 hover:text-[#EAE0CF] transition-colors rounded-lg hover:bg-black/5"
                                                                >
                                                                    ⋮
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className={`mt-1 flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                                <div className="flex items-center gap-1.5 px-1">
                                                    <p className="text-[8px] text-gray-400 uppercase font-bold tracking-tighter">
                                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                    {readBy.length > 0 && (
                                                        <div className="flex items-center -space-x-1 ml-1 group/receipt relative">
                                                            {readBy.slice(0, 3).map((r, i) => (
                                                                <img
                                                                    key={r._id || i}
                                                                    src={api.getImageUrl(r.profileImage)}
                                                                    className="w-3 h-3 rounded-full border border-white ring-1 ring-gray-100"
                                                                    title={r.name}
                                                                />
                                                            ))}
                                                            {readBy.length > 3 && (
                                                                <span className="w-3 h-3 rounded-full bg-gray-100 text-[6px] flex items-center justify-center font-bold text-gray-400 border border-white">
                                                                    +{readBy.length - 3}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSend} className="p-6 bg-[#1b2a3a] border-t border-white/10">
                            <div className="relative group flex items-center gap-2">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    onChange={handleFileChange}
                                    accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
                                />
                                <button
                                    type="button"
                                    disabled={uploading}
                                    onClick={() => fileInputRef.current.click()}
                                    className="p-3 bg-white/5 text-[#94B4C1] rounded-xl hover:bg-white/10 transition-all border border-white/10 disabled:opacity-50"
                                >
                                    {uploading ? "⏳" : "📎"}
                                </button>
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        placeholder="Type your message..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        className="input-premium py-4 pr-14 bg-[#547792]/30 border-[#547792]/10 focus:bg-[#547792]/50"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim() || uploading}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-[#94B4C1] text-[#213448] rounded-xl shadow-lg shadow-white/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-0"
                                    >
                                        🚀
                                    </button>
                                </div>
                            </div>
                        </form>

                        <AnimatePresence>
                            {activeMenuId && (() => {
                                const activeMsg = messages.find(m => m._id === activeMenuId);
                                if (!activeMsg) return null;
                                return (
                                    <motion.div
                                        key={activeMenuId}
                                        initial={{ opacity: 0, scale: 0.9, y: -6 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9, y: -6 }}
                                        style={{ position: 'fixed', top: menuPos.top, left: menuPos.left, zIndex: 9999 }}
                                        className="bg-[#1b2a3a] border border-white/10 rounded-xl shadow-2xl min-w-[144px] overflow-hidden"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => { onTogglePin(activeMenuId); setActiveMenuId(null); }}
                                            className="w-full px-4 py-2.5 text-left text-[11px] font-bold text-[#EAE0CF] hover:bg-white/5 flex items-center gap-3 transition-colors border-b border-white/5"
                                        >
                                            <span className="text-base">{activeMsg.isPinned ? '📍' : '📌'}</span>
                                            {activeMsg.isPinned ? 'Unpin' : 'Pin Message'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => { if (window.confirm("Delete this message?")) onDeleteMessage(activeMenuId); setActiveMenuId(null); }}
                                            className="w-full px-4 py-2.5 text-left text-[11px] font-bold text-rose-500 hover:bg-rose-50 flex items-center gap-3 transition-colors"
                                        >
                                            <span className="text-base">🗑️</span>
                                            Delete
                                        </button>
                                    </motion.div>
                                );
                            })()}
                        </AnimatePresence>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ChatSection;
