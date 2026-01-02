import { useState, useEffect } from 'react'
import { Calendar, Plus, Trash2, Play, Pause, Clock, Send, RefreshCw, X, FileUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function SchedulerTab({ instances, targetInstance, setTargetInstance }) {
    const [campaigns, setCampaigns] = useState(() => {
        const saved = localStorage.getItem('scheduledCampaigns')
        return saved ? JSON.parse(saved) : []
    })
    const [showModal, setShowModal] = useState(false)
    const [form, setForm] = useState({
        name: '',
        message: '',
        numbers: '',
        scheduledAt: '',
        repeat: 'none',
        status: 'scheduled'
    })

    useEffect(() => {
        localStorage.setItem('scheduledCampaigns', JSON.stringify(campaigns))
    }, [campaigns])

    const handleSave = () => {
        if (!form.name || !form.message || !form.numbers || !form.scheduledAt) {
            return alert('Fill all required fields')
        }
        setCampaigns(prev => [...prev, {
            ...form,
            id: Date.now(),
            instance: targetInstance,
            createdAt: new Date().toISOString()
        }])
        setShowModal(false)
        setForm({ name: '', message: '', numbers: '', scheduledAt: '', repeat: 'none', status: 'scheduled' })
    }

    const handleDelete = (id) => {
        if (confirm('Delete this scheduled campaign?')) {
            setCampaigns(prev => prev.filter(c => c.id !== id))
        }
    }

    const toggleStatus = (id) => {
        setCampaigns(prev => prev.map(c =>
            c.id === id ? { ...c, status: c.status === 'scheduled' ? 'paused' : 'scheduled' } : c
        ))
    }

    const formatDateTime = (dateStr) => {
        return new Date(dateStr).toLocaleString('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short'
        })
    }

    const getNumberCount = (numbersStr) => {
        return numbersStr.split('\n').filter(n => n.trim().length >= 10).length
    }

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Campaign Scheduler</h1>
                    <p style={{ color: 'rgba(255,255,255,0.6)' }}>Schedule bulk messages for later</p>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <select value={targetInstance} onChange={e => setTargetInstance(e.target.value)} style={{ minWidth: '200px' }}>
                        <option value="">Select instance...</option>
                        {instances.map(i => <option key={i.name} value={i.name}>{i.name}</option>)}
                    </select>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        <Plus size={18} /> Schedule Campaign
                    </button>
                </div>
            </header>

            {/* Campaigns List */}
            <div style={{ display: 'grid', gap: '16px' }}>
                {campaigns.map(campaign => (
                    <div key={campaign.id} className="glass" style={{ padding: '24px', borderRadius: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                    <h3 style={{ fontSize: '18px' }}>{campaign.name}</h3>
                                    <span style={{
                                        padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '600',
                                        background: campaign.status === 'scheduled' ? 'hsl(142 76% 36% / 0.15)' :
                                            campaign.status === 'completed' ? 'hsl(var(--primary) / 0.15)' : 'rgba(255,255,255,0.05)',
                                        color: campaign.status === 'scheduled' ? '#22c55e' :
                                            campaign.status === 'completed' ? 'hsl(var(--primary))' : 'rgba(255,255,255,0.5)'
                                    }}>
                                        {campaign.status.toUpperCase()}
                                    </span>
                                </div>
                                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: '12px', maxWidth: '600px' }}>
                                    {campaign.message.substring(0, 150)}{campaign.message.length > 150 ? '...' : ''}
                                </p>
                                <div style={{ display: 'flex', gap: '24px', fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Calendar size={14} /> {formatDateTime(campaign.scheduledAt)}
                                    </span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Send size={14} /> {getNumberCount(campaign.numbers)} recipients
                                    </span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Clock size={14} /> {campaign.repeat === 'none' ? 'One-time' : `Repeat ${campaign.repeat}`}
                                    </span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    className="btn btn-glass"
                                    style={{ padding: '10px' }}
                                    onClick={() => toggleStatus(campaign.id)}
                                    disabled={campaign.status === 'completed'}
                                >
                                    {campaign.status === 'scheduled' ? <Pause size={16} /> : <Play size={16} />}
                                </button>
                                <button
                                    className="btn btn-glass"
                                    style={{ padding: '10px', color: '#f87171' }}
                                    onClick={() => handleDelete(campaign.id)}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {campaigns.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '80px', color: 'rgba(255,255,255,0.3)' }}>
                        <Calendar size={48} style={{ marginBottom: '16px' }} />
                        <p>No scheduled campaigns</p>
                        <p style={{ fontSize: '13px', marginTop: '8px' }}>Schedule messages to be sent at a specific time</p>
                    </div>
                )}
            </div>

            {/* Schedule Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="modal-overlay" onClick={() => setShowModal(false)}>
                        <motion.div
                            className="modal-content glass"
                            style={{ maxWidth: '600px' }}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                                <h2>Schedule Campaign</h2>
                                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X /></button>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Campaign Name</label>
                                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. New Year Promotion" style={{ width: '100%' }} />
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Message</label>
                                <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Type your message..." rows={4} style={{ width: '100%', resize: 'none' }} />
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Recipients (one per line)</label>
                                <textarea value={form.numbers} onChange={e => setForm({ ...form, numbers: e.target.value })} placeholder="5511999999999" rows={4} style={{ width: '100%', resize: 'none' }} />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Schedule Date & Time</label>
                                    <input type="datetime-local" value={form.scheduledAt} onChange={e => setForm({ ...form, scheduledAt: e.target.value })} style={{ width: '100%' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Repeat</label>
                                    <select value={form.repeat} onChange={e => setForm({ ...form, repeat: e.target.value })} style={{ width: '100%' }}>
                                        <option value="none">No Repeat</option>
                                        <option value="daily">Daily</option>
                                        <option value="weekly">Weekly</option>
                                        <option value="monthly">Monthly</option>
                                    </select>
                                </div>
                            </div>

                            <button className="btn btn-primary" style={{ width: '100%', gap: '8px' }} onClick={handleSave}>
                                <Calendar size={18} /> Schedule Campaign
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}
