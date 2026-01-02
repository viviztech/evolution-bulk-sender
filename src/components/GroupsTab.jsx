import { useState, useEffect } from 'react'
import { Users, UserPlus, UserMinus, Crown, Link, RefreshCw, X, Plus, Settings, MessageSquare } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { evolutionApi } from '../services/api'

export default function GroupsTab({ instances, targetInstance, setTargetInstance }) {
    const [groups, setGroups] = useState([])
    const [loading, setLoading] = useState(false)
    const [selectedGroup, setSelectedGroup] = useState(null)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showGroupModal, setShowGroupModal] = useState(false)
    const [newGroupName, setNewGroupName] = useState('')
    const [newGroupParticipants, setNewGroupParticipants] = useState('')
    const [groupParticipants, setGroupParticipants] = useState([])
    const [inviteLink, setInviteLink] = useState('')

    const loadGroups = async () => {
        if (!targetInstance) return
        setLoading(true)
        try {
            const data = await evolutionApi.getGroups(targetInstance, true)
            setGroups(data || [])
        } catch (err) {
            console.error('Failed to load groups', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (targetInstance) loadGroups()
    }, [targetInstance])

    const handleCreateGroup = async () => {
        if (!newGroupName || !targetInstance) return
        const participants = newGroupParticipants.split('\n').map(n => n.trim()).filter(n => n)
        try {
            await evolutionApi.createGroup(targetInstance, newGroupName, participants)
            setShowCreateModal(false)
            setNewGroupName('')
            setNewGroupParticipants('')
            loadGroups()
        } catch (err) {
            alert('Failed to create group')
        }
    }

    const handleViewGroup = async (group) => {
        setSelectedGroup(group)
        setShowGroupModal(true)
        try {
            const participants = await evolutionApi.getGroupParticipants(targetInstance, group.id)
            setGroupParticipants(participants || [])
            const invite = await evolutionApi.getGroupInviteCode(targetInstance, group.id)
            setInviteLink(invite?.inviteUrl || invite?.code || '')
        } catch (err) {
            console.error(err)
        }
    }

    const handleLeaveGroup = async (groupJid) => {
        if (!confirm('Leave this group?')) return
        try {
            await evolutionApi.leaveGroup(targetInstance, groupJid)
            setShowGroupModal(false)
            loadGroups()
        } catch (err) {
            alert('Failed to leave group')
        }
    }

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Groups</h1>
                    <p style={{ color: 'rgba(255,255,255,0.6)' }}>Manage WhatsApp groups</p>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <select value={targetInstance} onChange={e => setTargetInstance(e.target.value)} style={{ minWidth: '200px' }}>
                        <option value="">Select instance...</option>
                        {instances.map(i => <option key={i.name} value={i.name}>{i.name}</option>)}
                    </select>
                    <button className="btn btn-glass" onClick={loadGroups} disabled={loading}>
                        <RefreshCw size={18} className={loading ? 'spin' : ''} />
                    </button>
                    <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                        <Plus size={18} /> New Group
                    </button>
                </div>
            </header>

            <div className="card-grid">
                {groups.map(group => (
                    <div key={group.id} className="glass card-animate" style={{ padding: '20px', borderRadius: '16px', cursor: 'pointer' }} onClick={() => handleViewGroup(group)}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'hsl(var(--primary) / 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Users className="text-primary" size={24} />
                            </div>
                            <div style={{ flex: 1, overflow: 'hidden' }}>
                                <h3 style={{ fontSize: '16px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{group.subject}</h3>
                                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{group.size || '?'} participants</p>
                            </div>
                        </div>
                    </div>
                ))}
                {!loading && groups.length === 0 && (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', color: 'rgba(255,255,255,0.3)' }}>
                        <Users size={48} style={{ marginBottom: '16px' }} />
                        <p>No groups found. Select an instance or create a new group.</p>
                    </div>
                )}
            </div>

            {/* Create Group Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                        <motion.div className="modal-content glass" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                                <h2>Create Group</h2>
                                <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X /></button>
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Group Name</label>
                                <input type="text" value={newGroupName} onChange={e => setNewGroupName(e.target.value)} placeholder="My Group" style={{ width: '100%' }} />
                            </div>
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Participants (one per line)</label>
                                <textarea value={newGroupParticipants} onChange={e => setNewGroupParticipants(e.target.value)} placeholder="5511999999999" rows={5} style={{ width: '100%', resize: 'none' }} />
                            </div>
                            <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleCreateGroup}>Create Group</button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Group Details Modal */}
            <AnimatePresence>
                {showGroupModal && selectedGroup && (
                    <div className="modal-overlay" onClick={() => setShowGroupModal(false)}>
                        <motion.div className="modal-content glass" style={{ maxWidth: '500px' }} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                                <h2>{selectedGroup.subject}</h2>
                                <button onClick={() => setShowGroupModal(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X /></button>
                            </div>
                            {inviteLink && (
                                <div className="glass" style={{ padding: '12px', borderRadius: '12px', marginBottom: '16px', fontSize: '12px', wordBreak: 'break-all' }}>
                                    <strong><Link size={12} /> Invite:</strong> {inviteLink}
                                </div>
                            )}
                            <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '16px' }}>
                                <h4 style={{ fontSize: '14px', marginBottom: '12px', color: 'rgba(255,255,255,0.6)' }}>Participants ({groupParticipants.length})</h4>
                                {groupParticipants.map((p, i) => (
                                    <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {p.admin && <Crown size={14} style={{ color: '#fbbf24' }} />}
                                        <span style={{ fontSize: '13px' }}>{p.id?.split('@')[0] || p}</span>
                                    </div>
                                ))}
                            </div>
                            <button className="btn btn-glass" style={{ width: '100%', color: '#f87171' }} onClick={() => handleLeaveGroup(selectedGroup.id)}>Leave Group</button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}
