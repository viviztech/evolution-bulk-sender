import { useState, useEffect } from 'react'
import { User, Camera, Save, RefreshCw, Shield, Eye, EyeOff } from 'lucide-react'
import { motion } from 'framer-motion'
import { evolutionApi } from '../services/api'

export default function ProfileTab({ instances, targetInstance, setTargetInstance }) {
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [profileName, setProfileName] = useState('')
    const [profileStatus, setProfileStatus] = useState('')
    const [privacySettings, setPrivacySettings] = useState({})
    const [presence, setPresence] = useState('available')

    const loadProfile = async () => {
        if (!targetInstance) return
        setLoading(true)
        try {
            const privacy = await evolutionApi.getPrivacySettings(targetInstance)
            setPrivacySettings(privacy || {})
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (targetInstance) loadProfile()
    }, [targetInstance])

    const handleSaveProfile = async () => {
        setSaving(true)
        try {
            if (profileName) await evolutionApi.updateProfileName(targetInstance, profileName)
            if (profileStatus) await evolutionApi.updateProfileStatus(targetInstance, profileStatus)
            alert('Profile updated!')
        } catch (err) {
            alert('Failed to update profile')
        } finally {
            setSaving(false)
        }
    }

    const handleSetPresence = async (p) => {
        try {
            await evolutionApi.setPresence(targetInstance, p)
            setPresence(p)
        } catch (err) {
            console.error(err)
        }
    }

    const handleUpdatePrivacy = async (key, value) => {
        try {
            await evolutionApi.updatePrivacySettings(targetInstance, { [key]: value })
            setPrivacySettings(prev => ({ ...prev, [key]: value }))
        } catch (err) {
            alert('Failed to update privacy')
        }
    }

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Profile</h1>
                    <p style={{ color: 'rgba(255,255,255,0.6)' }}>Manage your WhatsApp profile</p>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <select value={targetInstance} onChange={e => setTargetInstance(e.target.value)} style={{ minWidth: '200px' }}>
                        <option value="">Select instance...</option>
                        {instances.map(i => <option key={i.name} value={i.name}>{i.name}</option>)}
                    </select>
                    <button className="btn btn-glass" onClick={loadProfile} disabled={loading}>
                        <RefreshCw size={18} className={loading ? 'spin' : ''} />
                    </button>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', maxWidth: '900px' }}>
                {/* Profile Info */}
                <div className="glass" style={{ padding: '28px', borderRadius: '20px' }}>
                    <h3 style={{ fontSize: '18px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <User size={20} className="text-primary" /> Profile Information
                    </h3>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Display Name</label>
                        <input type="text" value={profileName} onChange={e => setProfileName(e.target.value)} placeholder="Your name" style={{ width: '100%' }} />
                    </div>
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Status</label>
                        <textarea value={profileStatus} onChange={e => setProfileStatus(e.target.value)} placeholder="Hey there! I'm using WhatsApp" rows={3} style={{ width: '100%', resize: 'none' }} />
                    </div>
                    <button className="btn btn-primary" style={{ width: '100%', gap: '8px' }} onClick={handleSaveProfile} disabled={saving}>
                        {saving ? <RefreshCw size={16} className="spin" /> : <Save size={16} />}
                        Save Changes
                    </button>
                </div>

                {/* Presence */}
                <div className="glass" style={{ padding: '28px', borderRadius: '20px' }}>
                    <h3 style={{ fontSize: '18px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Eye size={20} className="text-primary" /> Presence Status
                    </h3>
                    <div style={{ display: 'grid', gap: '12px' }}>
                        {['available', 'unavailable', 'composing', 'recording', 'paused'].map(p => (
                            <button
                                key={p}
                                className={`btn ${presence === p ? 'btn-primary' : 'btn-glass'}`}
                                onClick={() => handleSetPresence(p)}
                                style={{ textTransform: 'capitalize' }}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Privacy Settings */}
                <div className="glass" style={{ padding: '28px', borderRadius: '20px', gridColumn: '1 / -1' }}>
                    <h3 style={{ fontSize: '18px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Shield size={20} className="text-primary" /> Privacy Settings
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                        {[
                            { key: 'readreceipts', label: 'Read Receipts', options: ['all', 'none'] },
                            { key: 'profile', label: 'Profile Photo', options: ['all', 'contacts', 'none'] },
                            { key: 'status', label: 'Status', options: ['all', 'contacts', 'none'] },
                            { key: 'online', label: 'Online Status', options: ['all', 'match_last_seen'] },
                            { key: 'last', label: 'Last Seen', options: ['all', 'contacts', 'none'] },
                            { key: 'groupadd', label: 'Group Add', options: ['all', 'contacts', 'contact_blacklist'] },
                        ].map(({ key, label, options }) => (
                            <div key={key}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>{label}</label>
                                <select value={privacySettings[key] || 'all'} onChange={e => handleUpdatePrivacy(key, e.target.value)} style={{ width: '100%' }}>
                                    {options.map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
