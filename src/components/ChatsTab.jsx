import { useState, useEffect } from 'react'
import { MessageCircle, RefreshCw, Search, User, Check, CheckCheck } from 'lucide-react'
import { motion } from 'framer-motion'
import { evolutionApi } from '../services/api'

export default function ChatsTab({ instances, targetInstance, setTargetInstance }) {
    const [chats, setChats] = useState([])
    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState('')
    const [selectedChat, setSelectedChat] = useState(null)
    const [messages, setMessages] = useState([])
    const [loadingMessages, setLoadingMessages] = useState(false)

    const loadChats = async () => {
        if (!targetInstance) return
        setLoading(true)
        try {
            const data = await evolutionApi.getChats(targetInstance)
            setChats(data || [])
        } catch (err) {
            console.error('Failed to load chats', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (targetInstance) loadChats()
    }, [targetInstance])

    const handleSelectChat = async (chat) => {
        setSelectedChat(chat)
        setLoadingMessages(true)
        try {
            const msgs = await evolutionApi.getMessages(targetInstance, chat.id, 50)
            setMessages(msgs?.messages?.records || msgs || [])
        } catch (err) {
            console.error(err)
        } finally {
            setLoadingMessages(false)
        }
    }

    const filteredChats = chats.filter(c =>
        (c.name || c.id || '').toLowerCase().includes(search.toLowerCase())
    )

    const formatTime = (timestamp) => {
        if (!timestamp) return ''
        const date = new Date(timestamp * 1000)
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Chats</h1>
                    <p style={{ color: 'rgba(255,255,255,0.6)' }}>View conversation history</p>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <select value={targetInstance} onChange={e => setTargetInstance(e.target.value)} style={{ minWidth: '200px' }}>
                        <option value="">Select instance...</option>
                        {instances.map(i => <option key={i.name} value={i.name}>{i.name}</option>)}
                    </select>
                    <button className="btn btn-glass" onClick={loadChats} disabled={loading}>
                        <RefreshCw size={18} className={loading ? 'spin' : ''} />
                    </button>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '24px', height: 'calc(100vh - 200px)' }}>
                {/* Chat List */}
                <div className="glass" style={{ borderRadius: '20px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                            <input type="text" placeholder="Search chats..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: '100%', paddingLeft: '36px' }} />
                        </div>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {filteredChats.map(chat => (
                            <div
                                key={chat.id}
                                onClick={() => handleSelectChat(chat)}
                                style={{
                                    padding: '14px 16px',
                                    borderBottom: '1px solid rgba(255,255,255,0.03)',
                                    cursor: 'pointer',
                                    background: selectedChat?.id === chat.id ? 'hsl(var(--primary) / 0.1)' : 'transparent',
                                    transition: 'background 0.2s'
                                }}
                            >
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'hsl(var(--primary) / 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <User size={18} className="text-primary" />
                                    </div>
                                    <div style={{ flex: 1, overflow: 'hidden' }}>
                                        <p style={{ fontSize: '14px', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {chat.name || chat.id?.split('@')[0]}
                                        </p>
                                        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {chat.lastMessage?.message?.conversation || chat.lastMessage?.message?.extendedTextMessage?.text || '...'}
                                        </p>
                                    </div>
                                    {chat.unreadCount > 0 && (
                                        <span style={{ background: 'hsl(var(--primary))', color: '#000', fontSize: '11px', padding: '2px 6px', borderRadius: '10px', fontWeight: '600' }}>
                                            {chat.unreadCount}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                        {!loading && filteredChats.length === 0 && (
                            <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
                                <MessageCircle size={32} style={{ marginBottom: '12px' }} />
                                <p>No chats found</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Messages */}
                <div className="glass" style={{ borderRadius: '20px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    {selectedChat ? (
                        <>
                            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'hsl(var(--primary) / 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <User size={16} className="text-primary" />
                                </div>
                                <div>
                                    <p style={{ fontWeight: '500' }}>{selectedChat.name || selectedChat.id?.split('@')[0]}</p>
                                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{selectedChat.id}</p>
                                </div>
                            </div>
                            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column-reverse', gap: '8px' }}>
                                {loadingMessages ? (
                                    <div style={{ textAlign: 'center', padding: '40px' }}><RefreshCw className="spin" size={24} /></div>
                                ) : messages.length > 0 ? (
                                    messages.map((msg, i) => {
                                        const isMe = msg.key?.fromMe
                                        const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '[Media]'
                                        return (
                                            <div key={i} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                                                <div style={{
                                                    maxWidth: '70%',
                                                    padding: '10px 14px',
                                                    borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                                    background: isMe ? 'hsl(var(--primary))' : 'rgba(255,255,255,0.08)',
                                                    color: isMe ? '#000' : '#fff'
                                                }}>
                                                    <p style={{ fontSize: '14px', wordBreak: 'break-word' }}>{text}</p>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', marginTop: '4px' }}>
                                                        <span style={{ fontSize: '10px', opacity: 0.7 }}>{formatTime(msg.messageTimestamp)}</span>
                                                        {isMe && (msg.status === 'READ' ? <CheckCheck size={12} /> : <Check size={12} />)}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })
                                ) : (
                                    <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>No messages</div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)' }}>
                            <div style={{ textAlign: 'center' }}>
                                <MessageCircle size={48} style={{ marginBottom: '16px' }} />
                                <p>Select a chat to view messages</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    )
}
