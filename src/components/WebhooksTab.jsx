import { useState, useEffect } from 'react'
import { Webhook, Save, RefreshCw, Plus, Trash2, Check, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { evolutionApi } from '../services/api'

const ALL_EVENTS = [
    'QRCODE_UPDATED', 'CONNECTION_UPDATE', 'MESSAGES_UPSERT', 'MESSAGES_UPDATE',
    'MESSAGES_DELETE', 'SEND_MESSAGE', 'CONTACTS_UPSERT', 'CONTACTS_UPDATE',
    'PRESENCE_UPDATE', 'CHATS_UPDATE', 'CHATS_DELETE', 'GROUPS_UPSERT',
    'GROUPS_UPDATE', 'GROUP_PARTICIPANTS_UPDATE', 'CALL'
]

export default function WebhooksTab({ instances, targetInstance, setTargetInstance }) {
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [webhookUrl, setWebhookUrl] = useState('')
    const [selectedEvents, setSelectedEvents] = useState([])
    const [currentWebhook, setCurrentWebhook] = useState(null)

    const loadWebhook = async () => {
        if (!targetInstance) return
        setLoading(true)
        try {
            const data = await evolutionApi.getWebhook(targetInstance)
            setCurrentWebhook(data)
            setWebhookUrl(data?.url || '')
            setSelectedEvents(data?.events || [])
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (targetInstance) loadWebhook()
    }, [targetInstance])

    const handleSaveWebhook = async () => {
        if (!webhookUrl) return alert('Enter a webhook URL')
        setSaving(true)
        try {
            await evolutionApi.setWebhook(targetInstance, webhookUrl, selectedEvents)
            alert('Webhook saved!')
            loadWebhook()
        } catch (err) {
            alert('Failed to save webhook')
        } finally {
            setSaving(false)
        }
    }

    const toggleEvent = (event) => {
        setSelectedEvents(prev =>
            prev.includes(event) ? prev.filter(e => e !== event) : [...prev, event]
        )
    }

    const selectAllEvents = () => setSelectedEvents([...ALL_EVENTS])
    const clearAllEvents = () => setSelectedEvents([])

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Webhooks</h1>
                    <p style={{ color: 'rgba(255,255,255,0.6)' }}>Configure event notifications</p>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <select value={targetInstance} onChange={e => setTargetInstance(e.target.value)} style={{ minWidth: '200px' }}>
                        <option value="">Select instance...</option>
                        {instances.map(i => <option key={i.name} value={i.name}>{i.name}</option>)}
                    </select>
                    <button className="btn btn-glass" onClick={loadWebhook} disabled={loading}>
                        <RefreshCw size={18} className={loading ? 'spin' : ''} />
                    </button>
                </div>
            </header>

            <div className="glass" style={{ padding: '32px', borderRadius: '24px', maxWidth: '800px' }}>
                <div style={{ marginBottom: '28px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontSize: '14px', fontWeight: '500' }}>
                        <Webhook size={18} className="text-primary" /> Webhook URL
                    </label>
                    <input
                        type="url"
                        value={webhookUrl}
                        onChange={e => setWebhookUrl(e.target.value)}
                        placeholder="https://your-server.com/webhook"
                        style={{ width: '100%' }}
                    />
                </div>

                <div style={{ marginBottom: '28px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <label style={{ fontSize: '14px', fontWeight: '500' }}>Events to Subscribe</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="btn btn-glass" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={selectAllEvents}>Select All</button>
                            <button className="btn btn-glass" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={clearAllEvents}>Clear All</button>
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                        {ALL_EVENTS.map(event => (
                            <div
                                key={event}
                                onClick={() => toggleEvent(event)}
                                style={{
                                    padding: '10px 14px',
                                    borderRadius: '10px',
                                    background: selectedEvents.includes(event) ? 'hsl(var(--primary) / 0.15)' : 'rgba(255,255,255,0.03)',
                                    border: `1px solid ${selectedEvents.includes(event) ? 'hsl(var(--primary) / 0.4)' : 'rgba(255,255,255,0.05)'}`,
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {selectedEvents.includes(event) ? <Check size={14} className="text-primary" /> : <div style={{ width: '14px' }} />}
                                {event}
                            </div>
                        ))}
                    </div>
                </div>

                <button className="btn btn-primary" style={{ width: '100%', gap: '10px' }} onClick={handleSaveWebhook} disabled={saving}>
                    {saving ? <RefreshCw size={18} className="spin" /> : <Save size={18} />}
                    Save Webhook Configuration
                </button>

                {currentWebhook?.url && (
                    <div className="glass" style={{ marginTop: '24px', padding: '16px', borderRadius: '12px', fontSize: '13px' }}>
                        <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>Current Configuration:</p>
                        <p><strong>URL:</strong> {currentWebhook.url}</p>
                        <p><strong>Events:</strong> {currentWebhook.events?.length || 'All'}</p>
                    </div>
                )}
            </div>
        </motion.div>
    )
}
