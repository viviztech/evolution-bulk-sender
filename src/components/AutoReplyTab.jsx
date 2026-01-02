import { useState, useEffect } from 'react'
import { Bot, Plus, Trash2, Save, RefreshCw, Power, MessageSquare, X, Clock, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function AutoReplyTab({ instances, targetInstance, setTargetInstance }) {
    const [rules, setRules] = useState(() => {
        const saved = localStorage.getItem('autoReplyRules')
        return saved ? JSON.parse(saved) : []
    })
    const [showModal, setShowModal] = useState(false)
    const [editingRule, setEditingRule] = useState(null)
    const [enabled, setEnabled] = useState(() => localStorage.getItem('autoReplyEnabled') === 'true')

    const [form, setForm] = useState({
        keyword: '',
        matchType: 'contains',
        response: '',
        delay: 1,
        mediaUrl: '',
        active: true
    })

    useEffect(() => {
        localStorage.setItem('autoReplyRules', JSON.stringify(rules))
    }, [rules])

    useEffect(() => {
        localStorage.setItem('autoReplyEnabled', enabled)
    }, [enabled])

    const handleSave = () => {
        if (!form.keyword || !form.response) return alert('Fill keyword and response')
        if (editingRule !== null) {
            setRules(prev => prev.map((r, i) => i === editingRule ? { ...form, id: r.id } : r))
        } else {
            setRules(prev => [...prev, { ...form, id: Date.now() }])
        }
        setShowModal(false)
        setEditingRule(null)
        setForm({ keyword: '', matchType: 'contains', response: '', delay: 1, mediaUrl: '', active: true })
    }

    const handleEdit = (index) => {
        setEditingRule(index)
        setForm(rules[index])
        setShowModal(true)
    }

    const handleDelete = (index) => {
        if (confirm('Delete this rule?')) {
            setRules(prev => prev.filter((_, i) => i !== index))
        }
    }

    const toggleRule = (index) => {
        setRules(prev => prev.map((r, i) => i === index ? { ...r, active: !r.active } : r))
    }

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Auto-Reply</h1>
                    <p style={{ color: 'rgba(255,255,255,0.6)' }}>Automatic responses based on keywords</p>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div
                        onClick={() => setEnabled(!enabled)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px',
                            borderRadius: '12px', cursor: 'pointer',
                            background: enabled ? 'hsl(var(--primary) / 0.15)' : 'rgba(255,255,255,0.05)',
                            border: `1px solid ${enabled ? 'hsl(var(--primary) / 0.4)' : 'rgba(255,255,255,0.1)'}`
                        }}
                    >
                        <Power size={18} className={enabled ? 'text-primary' : ''} />
                        <span>{enabled ? 'Enabled' : 'Disabled'}</span>
                    </div>
                    <button className="btn btn-primary" onClick={() => { setEditingRule(null); setForm({ keyword: '', matchType: 'contains', response: '', delay: 1, mediaUrl: '', active: true }); setShowModal(true) }}>
                        <Plus size={18} /> Add Rule
                    </button>
                </div>
            </header>

            {/* Rules List */}
            <div style={{ display: 'grid', gap: '16px', maxWidth: '900px' }}>
                {rules.map((rule, i) => (
                    <div key={rule.id} className="glass" style={{ padding: '20px', borderRadius: '16px', opacity: rule.active ? 1 : 0.5 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                    <span style={{
                                        padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600',
                                        background: 'hsl(var(--primary) / 0.15)', color: 'hsl(var(--primary))'
                                    }}>
                                        {rule.matchType}
                                    </span>
                                    <span style={{ fontSize: '16px', fontWeight: '500' }}>"{rule.keyword}"</span>
                                </div>
                                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', marginBottom: '8px' }}>{rule.response}</p>
                                <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                                    <span><Clock size={12} style={{ marginRight: '4px' }} />{rule.delay}s delay</span>
                                    {rule.mediaUrl && <span>📎 Has media</span>}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button className="btn btn-glass" style={{ padding: '8px' }} onClick={() => toggleRule(i)}>
                                    <Power size={16} className={rule.active ? 'text-primary' : ''} />
                                </button>
                                <button className="btn btn-glass" style={{ padding: '8px' }} onClick={() => handleEdit(i)}>
                                    <MessageSquare size={16} />
                                </button>
                                <button className="btn btn-glass" style={{ padding: '8px', color: '#f87171' }} onClick={() => handleDelete(i)}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {rules.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255,255,255,0.3)' }}>
                        <Bot size={48} style={{ marginBottom: '16px' }} />
                        <p>No auto-reply rules configured</p>
                        <p style={{ fontSize: '13px', marginTop: '8px' }}>Add rules to automatically respond to incoming messages</p>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="modal-overlay" onClick={() => setShowModal(false)}>
                        <motion.div
                            className="modal-content glass"
                            style={{ maxWidth: '500px' }}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                                <h2>{editingRule !== null ? 'Edit Rule' : 'Add Rule'}</h2>
                                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X /></button>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Trigger Keyword</label>
                                <input
                                    type="text"
                                    value={form.keyword}
                                    onChange={e => setForm({ ...form, keyword: e.target.value })}
                                    placeholder="e.g. hello, price, help"
                                    style={{ width: '100%' }}
                                />
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Match Type</label>
                                <select value={form.matchType} onChange={e => setForm({ ...form, matchType: e.target.value })} style={{ width: '100%' }}>
                                    <option value="contains">Contains</option>
                                    <option value="exact">Exact Match</option>
                                    <option value="startsWith">Starts With</option>
                                    <option value="endsWith">Ends With</option>
                                    <option value="regex">Regex Pattern</option>
                                </select>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Response Message</label>
                                <textarea
                                    value={form.response}
                                    onChange={e => setForm({ ...form, response: e.target.value })}
                                    placeholder="Type your auto-reply message..."
                                    rows={4}
                                    style={{ width: '100%', resize: 'none' }}
                                />
                                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '6px' }}>
                                    Variables: {'{{name}}'}, {'{{number}}'}, {'{{time}}'}
                                </p>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Delay (seconds)</label>
                                    <input type="number" value={form.delay} onChange={e => setForm({ ...form, delay: Number(e.target.value) })} min={0} max={60} style={{ width: '100%' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Media URL (optional)</label>
                                    <input type="url" value={form.mediaUrl} onChange={e => setForm({ ...form, mediaUrl: e.target.value })} placeholder="https://..." style={{ width: '100%' }} />
                                </div>
                            </div>

                            <button className="btn btn-primary" style={{ width: '100%', gap: '8px' }} onClick={handleSave}>
                                <Save size={18} /> Save Rule
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}
