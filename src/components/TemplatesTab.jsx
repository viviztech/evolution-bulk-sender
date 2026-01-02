import { useState, useEffect } from 'react'
import { FileText, Plus, Trash2, Copy, Edit, Save, X, Search, Image, Video, FileUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function TemplatesTab() {
    const [templates, setTemplates] = useState(() => {
        const saved = localStorage.getItem('messageTemplates')
        return saved ? JSON.parse(saved) : [
            { id: 1, name: 'Welcome Message', category: 'greeting', content: 'Hello! Thank you for contacting us. How can we help you today?', mediaUrl: '' },
            { id: 2, name: 'Business Hours', category: 'info', content: 'Our business hours are Monday to Friday, 9 AM to 6 PM. We will respond to your message during working hours.', mediaUrl: '' },
            { id: 3, name: 'Thank You', category: 'greeting', content: 'Thank you for your message! We appreciate your business and will get back to you shortly.', mediaUrl: '' }
        ]
    })
    const [showModal, setShowModal] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [search, setSearch] = useState('')
    const [filterCategory, setFilterCategory] = useState('all')

    const [form, setForm] = useState({
        name: '',
        category: 'general',
        content: '',
        mediaUrl: ''
    })

    useEffect(() => {
        localStorage.setItem('messageTemplates', JSON.stringify(templates))
    }, [templates])

    const categories = ['greeting', 'info', 'promotion', 'support', 'general']

    const handleSave = () => {
        if (!form.name || !form.content) return alert('Fill name and content')
        if (editingId) {
            setTemplates(prev => prev.map(t => t.id === editingId ? { ...form, id: editingId } : t))
        } else {
            setTemplates(prev => [...prev, { ...form, id: Date.now() }])
        }
        setShowModal(false)
        setEditingId(null)
        setForm({ name: '', category: 'general', content: '', mediaUrl: '' })
    }

    const handleEdit = (template) => {
        setEditingId(template.id)
        setForm({ name: template.name, category: template.category, content: template.content, mediaUrl: template.mediaUrl || '' })
        setShowModal(true)
    }

    const handleDelete = (id) => {
        if (confirm('Delete this template?')) {
            setTemplates(prev => prev.filter(t => t.id !== id))
        }
    }

    const handleCopy = (content) => {
        navigator.clipboard.writeText(content)
        alert('Template copied to clipboard!')
    }

    const filteredTemplates = templates.filter(t => {
        const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.content.toLowerCase().includes(search.toLowerCase())
        const matchesCategory = filterCategory === 'all' || t.category === filterCategory
        return matchesSearch && matchesCategory
    })

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Templates</h1>
                    <p style={{ color: 'rgba(255,255,255,0.6)' }}>Manage message templates for quick replies</p>
                </div>
                <button className="btn btn-primary" onClick={() => { setEditingId(null); setForm({ name: '', category: 'general', content: '', mediaUrl: '' }); setShowModal(true) }}>
                    <Plus size={18} /> New Template
                </button>
            </header>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search templates..." style={{ width: '100%', paddingLeft: '40px' }} />
                </div>
                <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={{ minWidth: '150px' }}>
                    <option value="all">All Categories</option>
                    {categories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
            </div>

            {/* Templates Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                {filteredTemplates.map(template => (
                    <div key={template.id} className="glass card-animate" style={{ padding: '20px', borderRadius: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                            <div>
                                <h3 style={{ fontSize: '16px', marginBottom: '6px' }}>{template.name}</h3>
                                <span style={{
                                    padding: '3px 8px', borderRadius: '4px', fontSize: '11px',
                                    background: 'hsl(var(--primary) / 0.1)', color: 'hsl(var(--primary))'
                                }}>
                                    {template.category}
                                </span>
                            </div>
                            <div style={{ display: 'flex', gap: '4px' }}>
                                <button className="btn btn-glass" style={{ padding: '6px' }} onClick={() => handleCopy(template.content)}>
                                    <Copy size={14} />
                                </button>
                                <button className="btn btn-glass" style={{ padding: '6px' }} onClick={() => handleEdit(template)}>
                                    <Edit size={14} />
                                </button>
                                <button className="btn btn-glass" style={{ padding: '6px', color: '#f87171' }} onClick={() => handleDelete(template.id)}>
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.6' }}>
                            {template.content.substring(0, 120)}{template.content.length > 120 ? '...' : ''}
                        </p>
                        {template.mediaUrl && (
                            <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                                <Image size={12} /> Has media attachment
                            </div>
                        )}
                    </div>
                ))}

                {filteredTemplates.length === 0 && (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', color: 'rgba(255,255,255,0.3)' }}>
                        <FileText size={48} style={{ marginBottom: '16px' }} />
                        <p>No templates found</p>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="modal-overlay" onClick={() => setShowModal(false)}>
                        <motion.div
                            className="modal-content glass"
                            style={{ maxWidth: '550px' }}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                                <h2>{editingId ? 'Edit Template' : 'New Template'}</h2>
                                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X /></button>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Template Name</label>
                                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Welcome Message" style={{ width: '100%' }} />
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Category</label>
                                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={{ width: '100%' }}>
                                    {categories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                                </select>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Message Content</label>
                                <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="Type your template message..." rows={6} style={{ width: '100%', resize: 'none' }} />
                                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '6px' }}>
                                    Variables: {'{{name}}'}, {'{{company}}'}, {'{{date}}'}, {'{{time}}'}
                                </p>
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Media URL (optional)</label>
                                <input type="url" value={form.mediaUrl} onChange={e => setForm({ ...form, mediaUrl: e.target.value })} placeholder="https://example.com/image.jpg" style={{ width: '100%' }} />
                            </div>

                            <button className="btn btn-primary" style={{ width: '100%', gap: '8px' }} onClick={handleSave}>
                                <Save size={18} /> Save Template
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}
