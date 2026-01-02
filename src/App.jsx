import { useState, useEffect, useRef } from 'react'
import { MessageSquare, Users, Settings, Smartphone, Send, Plus, Save, Server, Key, AlertCircle, RefreshCw, X, QrCode as QrIcon, FileUp, Download, Trash2, UsersRound, MessageCircle, User, Webhook, CheckCircle, Phone } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { evolutionApi } from './services/api'
import GroupsTab from './components/GroupsTab'
import ChatsTab from './components/ChatsTab'
import ProfileTab from './components/ProfileTab'
import WebhooksTab from './components/WebhooksTab'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('instances')
  const [apiUrl, setApiUrl] = useState(localStorage.getItem('evo_api_url') || '')
  const [apiKey, setApiKey] = useState(localStorage.getItem('evo_api_key') || '')
  const [instances, setInstances] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Modal State
  const [showQrModal, setShowQrModal] = useState(false)
  const [qrCodeData, setQrCodeData] = useState(null)
  const [selectedInstance, setSelectedInstance] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newInstanceName, setNewInstanceName] = useState('')

  // Bulk Sender State
  const [message, setMessage] = useState('')
  const [numbers, setNumbers] = useState('')
  const [minDelay, setMinDelay] = useState(2)
  const [maxDelay, setMaxDelay] = useState(5)
  const [isSending, setIsSending] = useState(false)
  const [progress, setProgress] = useState({ total: 0, sent: 0, failed: 0 })
  const [logs, setLogs] = useState([])
  const [targetInstance, setTargetInstance] = useState('')
  const [attachment, setAttachment] = useState(null)
  const fileInputRef = useRef(null)
  const isSendingRef = useRef(false)

  // Number Verification
  const [verifyNumbers, setVerifyNumbers] = useState('')
  const [verifiedResults, setVerifiedResults] = useState([])
  const [verifying, setVerifying] = useState(false)

  const navItems = [
    { id: 'instances', icon: Smartphone, label: 'Instances' },
    { id: 'bulk', icon: Send, label: 'Bulk Sender' },
    { id: 'chats', icon: MessageCircle, label: 'Chats' },
    { id: 'groups', icon: UsersRound, label: 'Groups' },
    { id: 'profile', icon: User, label: 'Profile' },
    { id: 'webhooks', icon: Webhook, label: 'Webhooks' },
    { id: 'verify', icon: Phone, label: 'Verify Numbers' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ]

  useEffect(() => {
    if (apiUrl && apiKey) loadInstances()
  }, [])

  const loadInstances = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await evolutionApi.fetchInstances()
      setInstances(data || [])
      if (data?.length > 0 && !targetInstance) setTargetInstance(data[0].name)
    } catch (err) {
      setError('Failed to fetch instances. Check your API settings.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateInstance = async () => {
    if (!newInstanceName) return
    setLoading(true)
    try {
      await evolutionApi.createInstance(newInstanceName)
      setShowCreateModal(false)
      setNewInstanceName('')
      loadInstances()
    } catch (err) {
      alert('Failed to create instance')
    } finally {
      setLoading(false)
    }
  }

  const handleShowQr = async (instName) => {
    setSelectedInstance(instName)
    setShowQrModal(true)
    setQrCodeData(null)
    try {
      const data = await evolutionApi.getQrCode(instName)
      const base64 = data.qrcode?.base64 || data.base64
      const pairingCode = data.qrcode?.pairingCode || data.pairingCode || data.pairCode
      setQrCodeData(base64 || pairingCode || null)
    } catch (err) {
      console.error('Failed to fetch QR', err)
    }
  }

  const handleLogout = async (instName) => {
    if (confirm(`Logout of ${instName}?`)) {
      try {
        await evolutionApi.logoutInstance(instName)
        loadInstances()
      } catch (err) {
        alert('Logout failed')
      }
    }
  }

  const handleDeleteInstance = async (instName) => {
    if (confirm(`Delete instance ${instName}? This cannot be undone.`)) {
      try {
        await evolutionApi.deleteInstance(instName)
        loadInstances()
      } catch (err) {
        alert('Delete failed')
      }
    }
  }

  const handleRestartInstance = async (instName) => {
    try {
      await evolutionApi.restartInstance(instName)
      loadInstances()
    } catch (err) {
      alert('Restart failed')
    }
  }

  const handleStartBulk = async () => {
    const numberList = numbers.split('\n').map(n => n.trim().replace(/[^\d+]/g, '')).filter(n => n.length >= 10)
    if (numberList.length === 0 || (!message && !attachment) || !targetInstance) {
      return alert('Please fill all fields and select an instance.')
    }

    setIsSending(true)
    isSendingRef.current = true
    setProgress({ total: numberList.length, sent: 0, failed: 0 })
    setLogs([{ type: 'info', msg: `Campaign started for ${numberList.length} recipients.` }])

    for (let i = 0; i < numberList.length; i++) {
      if (!isSendingRef.current) break
      const num = numberList[i]
      try {
        if (attachment) {
          const mediatype = attachment.type.startsWith('image/') ? 'image' : attachment.type.startsWith('video/') ? 'video' : attachment.type.startsWith('audio/') ? 'audio' : 'document'
          await evolutionApi.sendMedia(targetInstance, num, attachment.base64, attachment.name, message, mediatype)
        } else {
          await evolutionApi.sendText(targetInstance, num, message)
        }
        setProgress(p => ({ ...p, sent: p.sent + 1 }))
        setLogs(l => [{ type: 'success', msg: `Sent to ${num}` }, ...l])
      } catch {
        setProgress(p => ({ ...p, failed: p.failed + 1 }))
        setLogs(l => [{ type: 'error', msg: `Failed for ${num}` }, ...l])
      }

      if (i < numberList.length - 1) {
        const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1) + minDelay) * 1000
        setLogs(l => [{ type: 'wait', msg: `Waiting ${delay / 1000}s...` }, ...l])
        await new Promise(r => setTimeout(r, delay))
      }
    }

    setIsSending(false)
    isSendingRef.current = false
    setLogs(l => [{ type: 'info', msg: 'Campaign completed.' }, ...l])
  }

  const handleImportContacts = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const phoneRegex = /\+?(\d[\s\-\(\)]?){9,14}\d/g
      const matches = event.target.result.match(phoneRegex) || []
      const uniqueNumbers = [...new Set(matches.map(n => n.replace(/[^\d+]/g, '')))]
      if (uniqueNumbers.length > 0) {
        setNumbers(uniqueNumbers.join('\n'))
        alert(`Imported ${uniqueNumbers.length} numbers.`)
      } else {
        alert('No valid phone numbers found.')
      }
    }
    reader.readAsText(file)
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      setAttachment({ base64: event.target.result, name: file.name, type: file.type })
    }
    reader.readAsDataURL(file)
  }

  const handleVerifyNumbers = async () => {
    const nums = verifyNumbers.split('\n').map(n => n.trim().replace(/[^\d+]/g, '')).filter(n => n.length >= 10)
    if (!nums.length || !targetInstance) return alert('Enter numbers and select instance')
    setVerifying(true)
    try {
      const results = await evolutionApi.checkNumber(targetInstance, nums)
      setVerifiedResults(results || [])
    } catch (err) {
      alert('Verification failed')
    } finally {
      setVerifying(false)
    }
  }

  return (
    <div className="app-container">
      <nav className="sidebar glass">
        <div className="sidebar-logo">
          <MessageSquare className="text-primary" size={32} />
          <span className="gradient-text" style={{ fontSize: '18px' }}>Evolution Bulk</span>
        </div>

        <div className="nav-links">
          {navItems.map((item) => (
            <div key={item.id} className={`nav-item ${activeTab === item.id ? 'active' : ''}`} onClick={() => setActiveTab(item.id)}>
              <item.icon size={20} />
              <span>{item.label}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 'auto', padding: '20px 0' }}>
          <div className="glass" style={{ padding: '12px', borderRadius: '12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: apiUrl ? '#10b981' : '#ef4444' }}></div>
            <span>{apiUrl ? 'API Connected' : 'API Offline'}</span>
          </div>
        </div>
      </nav>

      <main className="main-content">
        <AnimatePresence mode="wait">
          {activeTab === 'instances' && (
            <motion.div key="instances" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                  <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Instances</h1>
                  <p style={{ color: 'rgba(255,255,255,0.6)' }}>Manage your WhatsApp connections</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button className="btn btn-glass" onClick={loadInstances} disabled={loading}><RefreshCw size={18} className={loading ? 'spin' : ''} /></button>
                  <button className="btn btn-primary" style={{ gap: '8px' }} onClick={() => setShowCreateModal(true)}><Plus size={18} /> New Instance</button>
                </div>
              </header>

              {error && <div className="glass" style={{ padding: '16px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #ef4444', display: 'flex', alignItems: 'center', gap: '12px', color: '#f87171' }}><AlertCircle size={20} /><span>{error}</span></div>}

              <div className="card-grid">
                {instances.map((inst) => (
                  <div key={inst.name} className="glass card-animate" style={{ padding: '24px', borderRadius: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'hsl(var(--primary) / 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                          {inst.profilePicUrl ? <img src={inst.profilePicUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Smartphone className="text-primary" />}
                        </div>
                        <div>
                          <h3 style={{ fontSize: '18px' }}>{inst.name}</h3>
                          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>{inst.ownerJid || 'Not logged in'}</p>
                        </div>
                      </div>
                      <span className={`status-badge ${inst.connectionStatus === 'open' ? 'status-online' : 'status-offline'}`}>{inst.connectionStatus}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button className="btn btn-glass" style={{ flex: 1, fontSize: '13px', gap: '6px' }} onClick={() => handleShowQr(inst.name)}><QrIcon size={14} /> QR</button>
                      <button className="btn btn-glass" style={{ flex: 1, fontSize: '13px' }} onClick={() => handleRestartInstance(inst.name)}>Restart</button>
                      <button className="btn btn-glass" style={{ fontSize: '13px', color: '#f87171' }} onClick={() => handleLogout(inst.name)}>Logout</button>
                      <button className="btn btn-glass" style={{ fontSize: '13px', color: '#f87171' }} onClick={() => handleDeleteInstance(inst.name)}><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
                {!loading && instances.length === 0 && !error && (
                  <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '100px', color: 'rgba(255,255,255,0.2)' }}>
                    <Smartphone size={80} style={{ marginBottom: '24px', strokeWidth: 1 }} />
                    <h2 style={{ fontSize: '24px', color: 'rgba(255,255,255,0.4)' }}>No instances found</h2>
                    <p style={{ marginTop: '8px' }}>Create your first WhatsApp connection to start messaging.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'bulk' && (
            <motion.div key="bulk" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <h1 style={{ fontSize: '32px', marginBottom: '32px' }}>Bulk Sender</h1>
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 380px', gap: '24px' }}>
                <div className="glass" style={{ padding: '32px', borderRadius: '24px' }}>
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Select Instance</label>
                    <select value={targetInstance} onChange={(e) => setTargetInstance(e.target.value)} style={{ width: '100%' }}>
                      <option value="">Choose an instance...</option>
                      {instances.map(i => <option key={i.name} value={i.name}>{i.name}</option>)}
                    </select>
                  </div>
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <label style={{ fontSize: '14px' }}>Message Text {attachment && '(Caption)'}</label>
                      {attachment && <button onClick={() => setAttachment(null)} style={{ fontSize: '12px', color: '#f87171', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}><Trash2 size={12} /> Clear</button>}
                    </div>
                    <textarea placeholder={attachment ? "Type caption here..." : "Type your message here..."} rows={6} value={message} onChange={(e) => setMessage(e.target.value)} style={{ width: '100%', resize: 'none' }} />
                  </div>
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Attachment (Optional)</label>
                    {!attachment ? (
                      <div onClick={() => fileInputRef.current.click()} style={{ border: '2px dashed rgba(255,255,255,0.1)', borderRadius: '12px', padding: '20px', textAlign: 'center', cursor: 'pointer' }} className="hover-glow">
                        <FileUp size={24} style={{ marginBottom: '8px', opacity: 0.5 }} />
                        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>Click to upload</p>
                      </div>
                    ) : (
                      <div className="glass" style={{ padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid hsl(var(--primary) / 0.3)' }}>
                        <Download size={20} className="text-primary" />
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                          <p style={{ fontSize: '14px', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{attachment.name}</p>
                        </div>
                      </div>
                    )}
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} hidden />
                  </div>
                  <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
                    <div style={{ flex: 1 }}><label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Min Delay (sec)</label><input type="number" value={minDelay} onChange={(e) => setMinDelay(Number(e.target.value))} style={{ width: '100%' }} /></div>
                    <div style={{ flex: 1 }}><label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Max Delay (sec)</label><input type="number" value={maxDelay} onChange={(e) => setMaxDelay(Number(e.target.value))} style={{ width: '100%' }} /></div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn btn-primary" style={{ flex: 1, padding: '16px', fontSize: '16px', gap: '12px' }} disabled={isSending} onClick={handleStartBulk}>
                      {isSending ? <RefreshCw className="spin" size={20} /> : <Send size={20} />}
                      {isSending ? 'Sending...' : 'Start Campaign'}
                    </button>
                    {isSending && <button className="btn btn-glass" style={{ color: '#f87171' }} onClick={() => { setIsSending(false); isSendingRef.current = false }}>Stop</button>}
                  </div>
                  {isSending && (
                    <div style={{ marginTop: '32px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}><span>Progress</span><span>{Math.round((progress.sent + progress.failed) / progress.total * 100)}%</span></div>
                      <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}><div style={{ height: '100%', background: 'hsl(var(--primary))', width: `${((progress.sent + progress.failed) / progress.total * 100)}%` }}></div></div>
                      <div style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '12px' }}><span style={{ color: '#10b981' }}>Sent: {progress.sent}</span><span style={{ color: '#f87171' }}>Failed: {progress.failed}</span><span style={{ color: 'rgba(255,255,255,0.4)' }}>Total: {progress.total}</span></div>
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div className="glass" style={{ padding: '24px', borderRadius: '24px', flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h3 style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><Users size={18} /> Recipients</h3>
                      <label className="btn btn-glass" style={{ padding: '6px', cursor: 'pointer' }}><FileUp size={14} /><input type="file" hidden accept=".txt,.csv" onChange={handleImportContacts} /></label>
                    </div>
                    <textarea placeholder="Numbers (one per line)..." rows={12} value={numbers} onChange={(e) => setNumbers(e.target.value)} style={{ width: '100%', height: 'calc(100% - 60px)', resize: 'none', background: 'transparent', border: 'none' }} />
                  </div>
                  <div className="glass" style={{ padding: '20px', borderRadius: '20px', height: '200px', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ marginBottom: '12px', fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>Logs</h3>
                    <div style={{ flex: 1, overflowY: 'auto', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {logs.map((log, i) => <div key={i} style={{ color: log.type === 'error' ? '#f87171' : log.type === 'success' ? '#10b981' : log.type === 'wait' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.6)' }}>{log.msg}</div>)}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'chats' && <ChatsTab instances={instances} targetInstance={targetInstance} setTargetInstance={setTargetInstance} />}
          {activeTab === 'groups' && <GroupsTab instances={instances} targetInstance={targetInstance} setTargetInstance={setTargetInstance} />}
          {activeTab === 'profile' && <ProfileTab instances={instances} targetInstance={targetInstance} setTargetInstance={setTargetInstance} />}
          {activeTab === 'webhooks' && <WebhooksTab instances={instances} targetInstance={targetInstance} setTargetInstance={setTargetInstance} />}

          {activeTab === 'verify' && (
            <motion.div key="verify" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <h1 style={{ fontSize: '32px', marginBottom: '32px' }}>Verify Numbers</h1>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', maxWidth: '900px' }}>
                <div className="glass" style={{ padding: '28px', borderRadius: '20px' }}>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Select Instance</label>
                    <select value={targetInstance} onChange={(e) => setTargetInstance(e.target.value)} style={{ width: '100%' }}>
                      <option value="">Choose...</option>
                      {instances.map(i => <option key={i.name} value={i.name}>{i.name}</option>)}
                    </select>
                  </div>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Numbers to Verify (one per line)</label>
                    <textarea value={verifyNumbers} onChange={(e) => setVerifyNumbers(e.target.value)} placeholder="5511999999999" rows={10} style={{ width: '100%', resize: 'none' }} />
                  </div>
                  <button className="btn btn-primary" style={{ width: '100%', gap: '8px' }} onClick={handleVerifyNumbers} disabled={verifying}>
                    {verifying ? <RefreshCw size={18} className="spin" /> : <Phone size={18} />}
                    {verifying ? 'Verifying...' : 'Check WhatsApp Numbers'}
                  </button>
                </div>
                <div className="glass" style={{ padding: '28px', borderRadius: '20px' }}>
                  <h3 style={{ fontSize: '16px', marginBottom: '20px' }}>Results</h3>
                  <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {verifiedResults.map((r, i) => (
                      <div key={i} style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '14px' }}>{r.jid?.split('@')[0] || r.number}</span>
                        <span style={{ color: r.exists ? '#10b981' : '#f87171', fontSize: '12px' }}>{r.exists ? '✓ Valid' : '✗ Invalid'}</span>
                      </div>
                    ))}
                    {verifiedResults.length === 0 && <p style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '40px' }}>Results will appear here</p>}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <h1 style={{ fontSize: '32px', marginBottom: '32px' }}>Settings</h1>
              <div className="glass" style={{ padding: '32px', borderRadius: '24px', maxWidth: '600px' }}>
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}><Server size={16} className="text-primary" /> Evolution API URL</label>
                  <input type="text" placeholder="http://localhost:8080" value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} style={{ width: '100%' }} />
                </div>
                <div style={{ marginBottom: '32px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}><Key size={16} className="text-primary" /> Global API Key</label>
                  <input type="password" placeholder="your-global-api-key" value={apiKey} onChange={(e) => setApiKey(e.target.value)} style={{ width: '100%' }} />
                </div>
                <button className="btn btn-primary" onClick={() => { localStorage.setItem('evo_api_url', apiUrl); localStorage.setItem('evo_api_key', apiKey); alert('Settings saved!'); loadInstances() }} style={{ width: '100%', gap: '10px' }}><Save size={18} /> Save Configuration</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* QR Modal */}
        <AnimatePresence>
          {showQrModal && (
            <div className="modal-overlay" onClick={() => setShowQrModal(false)}>
              <motion.div className="modal-content glass" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}><h2 style={{ fontSize: '20px' }}>Scan QR Code</h2><button onClick={() => setShowQrModal(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X /></button></div>
                <div style={{ background: 'white', padding: '20px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', minHeight: '290px' }}>
                  {qrCodeData ? (qrCodeData.startsWith('data:image') ? <img src={qrCodeData} alt="QR" style={{ width: '250px', height: '250px' }} /> : <div style={{ textAlign: 'center' }}><p style={{ color: '#111', fontWeight: '700', fontSize: '24px', letterSpacing: '4px' }}>{qrCodeData}</p><p style={{ color: '#666', fontSize: '12px', marginTop: '8px' }}>Pairing Code</p></div>) : <RefreshCw className="spin" size={40} style={{ color: '#111' }} />}
                </div>
                <p style={{ textAlign: 'center', fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>Scan with WhatsApp to connect {selectedInstance}.</p>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Create Instance Modal */}
        <AnimatePresence>
          {showCreateModal && (
            <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
              <motion.div className="modal-content glass" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}><h2 style={{ fontSize: '20px' }}>New Instance</h2><button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X /></button></div>
                <div style={{ marginBottom: '24px' }}><label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Instance Name</label><input type="text" placeholder="e.g. FinanceTeam" value={newInstanceName} onChange={e => setNewInstanceName(e.target.value)} style={{ width: '100%' }} /></div>
                <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleCreateInstance} disabled={loading}>{loading ? <RefreshCw className="spin" size={18} /> : 'Create Instance'}</button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `.modal-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.8);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;z-index:1000}.modal-content{width:440px;padding:32px;border-radius:28px;box-shadow:0 25px 50px -12px rgba(0,0,0,0.5)}.spin{animation:spin 1s linear infinite}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}.text-primary{color:hsl(var(--primary))}select{background:var(--glass-bg);color:white;border:1px solid var(--glass-border);padding:12px;border-radius:12px;appearance:none}option{background:#0a0a0c;color:white}.card-animate{transition:transform 0.3s ease,border-color 0.3s ease}.card-animate:hover{transform:translateY(-4px);border-color:hsl(var(--primary)/0.3)}` }} />
    </div>
  )
}

export default App
