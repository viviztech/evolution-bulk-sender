import { useState, useEffect } from 'react'
import { Users, Plus, Trash2, Edit, Save, Search, Tag, Upload, Download, X, Phone, User, Mail } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ContactsManagerTab() {
    const [contacts, setContacts] = useState(() => {
        const saved = localStorage.getItem('contactsList')
        return saved ? JSON.parse(saved) : []
    })
    const [showModal, setShowModal] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [search, setSearch] = useState('')
    const [filterTag, setFilterTag] = useState('all')

    const [form, setForm] = useState({
        name: '',
        phone: '',
        email: '',
        tags: '',
        notes: ''
    })

    useEffect(() => {
        localStorage.setItem('contactsList', JSON.stringify(contacts))
    }, [contacts])

    const allTags = [...new Set(contacts.flatMap(c => c.tags ? c.tags.split(',').map(t => t.trim()) : []))]

    const handleSave = () => {
        if (!form.phone) return alert('Phone number is required')
        if (editingId) {
            setContacts(prev => prev.map(c => c.id === editingId ? { ...form, id: editingId } : c))
        } else {
            setContacts(prev => [...prev, { ...form, id: Date.now() }])
        }
        setShowModal(false)
        setEditingId(null)
        setForm({ name: '', phone: '', email: '', tags: '', notes: '' })
    }

    const handleEdit = (contact) => {
        setEditingId(contact.id)
        setForm({ name: contact.name, phone: contact.phone, email: contact.email || '', tags: contact.tags || '', notes: contact.notes || '' })
        setShowModal(true)
    }

    const handleDelete = (id) => {
        if (confirm('Delete this contact?')) {
            setContacts(prev => prev.filter(c => c.id !== id))
        }
    }

    const handleImport = (e) => {
        const file = e.target.files[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = (event) => {
            const lines = event.target.result.split('\n').filter(l => l.trim())
            const imported = lines.map((line, i) => {
                const parts = line.split(',').map(p => p.trim())
                return {
                    id: Date.now() + i,
                    phone: parts[0] || '',
                    name: parts[1] || '',
                    email: parts[2] || '',
                    tags: parts[3] || '',
                    notes: ''
                }
            }).filter(c => c.phone.length >= 10)
            setContacts(prev => [...prev, ...imported])
            alert(`Imported ${imported.length} contacts`)
        }
        reader.readAsText(file)
        e.target.value = ''
    }

    const handleExport = () => {
        const csv = contacts.map(c => `${c.phone},${c.name || ''},${c.email || ''},${c.tags || ''}`).join('\n')
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'contacts.csv'
        a.click()
    }

    const filteredContacts = contacts.filter(c => {
        const matchesSearch = (c.name || '').toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
        const matchesTag = filterTag === 'all' || (c.tags || '').toLowerCase().includes(filterTag.toLowerCase())
        return matchesSearch && matchesTag
    })

    const copyNumbers = () => {
        const numbers = filteredContacts.map(c => c.phone).join('\n')
        navigator.clipboard.writeText(numbers)
        alert(`Copied ${filteredContacts.length} numbers to clipboard!`)
    }

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Contacts</h1>
                    <p style={{ color: 'rgba(255,255,255,0.6)' }}>Manage your contact database</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <label className="btn btn-glass" style={{ cursor: 'pointer', gap: '8px' }}>
                        <Upload size={16} /> Import
                        <input type="file" hidden accept=".csv,.txt" onChange={handleImport} />
                    </label>
                    <button className="btn btn-glass" style={{ gap: '8px' }} onClick={handleExport} disabled={contacts.length === 0}>
                        <Download size={16} /> Export
                    </button>
                    <button className="btn btn-primary" onClick={() => { setEditingId(null); setForm({ name: '', phone: '', email: '', tags: '', notes: '' }); setShowModal(true) }}>
                        <Plus size={18} /> Add Contact
                    </button>
                </div>
            </header>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or phone..." style={{ width: '100%', paddingLeft: '40px' }} />
                </div>
                <select value={filterTag} onChange={e => setFilterTag(e.target.value)} style={{ minWidth: '150px' }}>
                    <option value="all">All Tags</option>
                    {allTags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
                </select>
                <button className="btn btn-glass" style={{ gap: '6px' }} onClick={copyNumbers}>
                    <Phone size={14} /> Copy Numbers ({filteredContacts.length})
                </button>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                <div className="glass" style={{ padding: '16px 24px', borderRadius: '12px' }}>
                    <p style={{ fontSize: '24px', fontWeight: '700' }}>{contacts.length}</p>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Total Contacts</p>
                </div>
                <div className="glass" style={{ padding: '16px 24px', borderRadius: '12px' }}>
                    <p style={{ fontSize: '24px', fontWeight: '700' }}>{allTags.length}</p>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Tags</p>
                </div>
                <div className="glass" style={{ padding: '16px 24px', borderRadius: '12px' }}>
                    <p style={{ fontSize: '24px', fontWeight: '700' }}>{contacts.filter(c => c.email).length}</p>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>With Email</p>
                </div>
            </div>

            {/* Contacts Table */}
            <div className="glass" style={{ borderRadius: '20px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                            <th style={{ textAlign: 'left', padding: '14px 20px', color: 'rgba(255,255,255,0.5)', fontWeight: '500' }}>Name</th>
                            <th style={{ textAlign: 'left', padding: '14px 20px', color: 'rgba(255,255,255,0.5)', fontWeight: '500' }}>Phone</th>
                            <th style={{ textAlign: 'left', padding: '14px 20px', color: 'rgba(255,255,255,0.5)', fontWeight: '500' }}>Email</th>
                            <th style={{ textAlign: 'left', padding: '14px 20px', color: 'rgba(255,255,255,0.5)', fontWeight: '500' }}>Tags</th>
                            <th style={{ textAlign: 'right', padding: '14px 20px', color: 'rgba(255,255,255,0.5)', fontWeight: '500' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredContacts.map(contact => (
                            <tr key={contact.id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '14px 20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'hsl(var(--primary) / 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <User size={14} className="text-primary" />
                                        </div>
                                        {contact.name || '-'}
                                    </div>
                                </td>
                                <td style={{ padding: '14px 20px' }}>{contact.phone}</td>
                                <td style={{ padding: '14px 20px', color: 'rgba(255,255,255,0.6)' }}>{contact.email || '-'}</td>
                                <td style={{ padding: '14px 20px' }}>
                                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                        {contact.tags && contact.tags.split(',').map((tag, i) => (
                                            <span key={i} style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', background: 'hsl(var(--primary) / 0.1)', color: 'hsl(var(--primary))' }}>
                                                {tag.trim()}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                                    <button className="btn btn-glass" style={{ padding: '6px', marginRight: '6px' }} onClick={() => handleEdit(contact)}><Edit size={14} /></button>
                                    <button className="btn btn-glass" style={{ padding: '6px', color: '#f87171' }} onClick={() => handleDelete(contact.id)}><Trash2 size={14} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredContacts.length === 0 && (
                    <div style={{ padding: '60px', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
                        <Users size={40} style={{ marginBottom: '12px' }} />
                        <p>No contacts found</p>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="modal-overlay" onClick={() => setShowModal(false)}>
                        <motion.div className="modal-content glass" style={{ maxWidth: '500px' }} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                                <h2>{editingId ? 'Edit Contact' : 'Add Contact'}</h2>
                                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X /></button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Name</label>
                                    <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="John Doe" style={{ width: '100%' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Phone *</label>
                                    <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="5511999999999" style={{ width: '100%' }} />
                                </div>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Email</label>
                                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="john@example.com" style={{ width: '100%' }} />
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Tags (comma separated)</label>
                                <input type="text" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="customer, vip, newsletter" style={{ width: '100%' }} />
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Notes</label>
                                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Additional notes..." rows={3} style={{ width: '100%', resize: 'none' }} />
                            </div>

                            <button className="btn btn-primary" style={{ width: '100%', gap: '8px' }} onClick={handleSave}>
                                <Save size={18} /> Save Contact
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}
