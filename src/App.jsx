import { useState, useEffect, useRef } from 'react'
import { MessageSquare, Users, Settings, Smartphone, Send, Plus, Save, Server, Key, AlertCircle, RefreshCw, X, QrCode as QrIcon, FileUp, Download, Trash2, UsersRound, MessageCircle, User, Webhook, Phone, Bot, Brain, Calendar, FileText, BarChart3, Link2, UserCheck, Workflow } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { evolutionApi } from './services/api'
import { AnalyticsService } from './services/AnalyticsService'
import GroupsTab from './components/GroupsTab'
import ChatsTab from './components/ChatsTab'
import ProfileTab from './components/ProfileTab'
import WebhooksTab from './components/WebhooksTab'
import AutoReplyTab from './components/AutoReplyTab'
import AIChatbotTab from './components/AIChatbotTab'
import SchedulerTab from './components/SchedulerTab'
import SchedulerRunner from './components/SchedulerRunner'
import TemplatesTab from './components/TemplatesTab'
import AnalyticsTab from './components/AnalyticsTab'
import IntegrationsTab from './components/IntegrationsTab'
import ContactsManagerTab from './components/ContactsManagerTab'
import WorkflowsTab from './components/WorkflowsTab'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('instances')
  const [apiUrl, setApiUrl] = useState(localStorage.getItem('evo_api_url') || 'http://localhost:8081')
  const [apiKey, setApiKey] = useState(localStorage.getItem('evo_api_key') || 'B6D711FCDE4D4FD5936544120E713976')
  const [instances, setInstances] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [showQrModal, setShowQrModal] = useState(false)
  const [qrCodeData, setQrCodeData] = useState(null)
  const [selectedInstance, setSelectedInstance] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newInstanceName, setNewInstanceName] = useState('')
  const [integrationType, setIntegrationType] = useState('WHATSAPP-BAILEYS')
  const [instanceToken, setInstanceToken] = useState('')

  const [message, setMessage] = useState('')
  const [numbers, setNumbers] = useState('')
  const [minDelay, setMinDelay] = useState(10)
  const [maxDelay, setMaxDelay] = useState(20)
  const [isSending, setIsSending] = useState(false)
  const [progress, setProgress] = useState({ total: 0, sent: 0, failed: 0 })
  const [logs, setLogs] = useState([])
  const [targetInstance, setTargetInstance] = useState('')
  const [attachment, setAttachment] = useState(null)
  const fileInputRef = useRef(null)
  const isSendingRef = useRef(false)

  const [verifyNumbers, setVerifyNumbers] = useState('')
  const [verifiedResults, setVerifiedResults] = useState([])
  const [verifying, setVerifying] = useState(false)

  const navItems = [
    { id: 'instances', icon: Smartphone, label: 'Instances' },
    { id: 'bulk', icon: Send, label: 'Bulk Sender' },
    { id: 'workflows', icon: Workflow, label: 'Flow Builder' },
    { id: 'chats', icon: MessageCircle, label: 'Chats' },
    { id: 'groups', icon: UsersRound, label: 'Groups' },
    { id: 'contacts', icon: UserCheck, label: 'Contacts' },
    { id: 'templates', icon: FileText, label: 'Templates' },
    { id: 'scheduler', icon: Calendar, label: 'Scheduler' },
    { id: 'autoreply', icon: Bot, label: 'Auto-Reply' },
    { id: 'ai', icon: Brain, label: 'AI Chatbot' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'integrations', icon: Link2, label: 'Integrations' },
    { id: 'profile', icon: User, label: 'Profile' },
    { id: 'webhooks', icon: Webhook, label: 'Webhooks' },
    { id: 'verify', icon: Phone, label: 'Verify' },
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
      await evolutionApi.createInstance(newInstanceName, {
        integration: integrationType,
        token: instanceToken,
        qrcode: integrationType === 'WHATSAPP-BAILEYS'
      })
      setShowCreateModal(false)
      setNewInstanceName('')
      setIntegrationType('WHATSAPP-BAILEYS')
      setInstanceToken('')
      loadInstances()
    } catch (err) {
      console.error(err)
      alert('Failed to create instance: ' + (err.response?.data?.message || err.message))
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
      setQrCodeData(data.qrcode?.base64 || data.base64 || data.qrcode?.pairingCode || data.pairingCode || null)
    } catch (err) {
      console.error('Failed to fetch QR', err)
    }
  }

  const handleLogout = async (instName) => {
    if (confirm(`Logout of ${instName}?`)) {
      try { await evolutionApi.logoutInstance(instName); loadInstances() } catch { alert('Logout failed') }
    }
  }

  const handleDeleteInstance = async (instName) => {
    if (confirm(`Delete ${instName}?`)) {
      try { await evolutionApi.deleteInstance(instName); loadInstances() } catch { alert('Delete failed') }
    }
  }

  const handleStartBulk = async () => {
    const numberList = numbers.split('\n').map(n => n.trim().replace(/[^\d+]/g, '')).filter(n => n.length >= 10)
    if (!numberList.length || (!message && !attachment) || !targetInstance) return alert('Fill all fields')
    setIsSending(true); isSendingRef.current = true
    setProgress({ total: numberList.length, sent: 0, failed: 0 })
    AnalyticsService.addActivity('Bulk Send Started', `${numberList.length} messages`, 'info')
    setLogs([{ type: 'info', msg: `Started for ${numberList.length} recipients.` }])
    for (let i = 0; i < numberList.length; i++) {
      if (!isSendingRef.current) break
      try {
        if (attachment) {
          const mt = attachment.type.startsWith('image/') ? 'image' : attachment.type.startsWith('video/') ? 'video' : attachment.type.startsWith('audio/') ? 'audio' : 'document'
          await evolutionApi.sendMedia(targetInstance, numberList[i], attachment.base64, attachment.name, message, mt, { mimetype: attachment.type })
        } else { await evolutionApi.sendText(targetInstance, numberList[i], message) }

        setProgress(p => ({ ...p, sent: p.sent + 1 }))
        AnalyticsService.trackMessage(targetInstance, 'sent')
        setLogs(l => [{ type: 'success', msg: `Sent to ${numberList[i]}` }, ...l])
      } catch (err) {
        setProgress(p => ({ ...p, failed: p.failed + 1 }))
        AnalyticsService.trackMessage(targetInstance, 'failed')
        const errMsg = err.response?.data?.message || err.message || 'Unknown error';
        console.error('Bulk Send Error:', err);
        setLogs(l => [{ type: 'error', msg: `Failed: ${numberList[i]} - ${errMsg}` }, ...l])
      }
      if (i < numberList.length - 1) {
        const d = Math.floor(Math.random() * (maxDelay - minDelay + 1) + minDelay) * 1000
        setLogs(l => [{ type: 'wait', msg: `Waiting ${d / 1000}s...` }, ...l])
        await new Promise(r => setTimeout(r, d))
      }
    }
    setIsSending(false); isSendingRef.current = false
    AnalyticsService.addActivity('Bulk Send Completed', `Sent: ${progress.sent}, Failed: ${progress.failed}`, 'success')
    setLogs(l => [{ type: 'info', msg: 'Completed.' }, ...l])
  }

  const handleImportContacts = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();

    reader.onload = (ev) => {
      const content = ev.target.result;
      const lines = content.split(/\r?\n/).filter(line => line.trim());

      let rawEntries = [];

      // Check for Google Contacts CSV headers
      // Google headers usually contain "Phone 1 - Value", "Phone 2 - Value" etc.
      const firstLine = lines[0] || '';
      const isCsv = firstLine.includes(',');
      const isGoogleContacts = isCsv && (firstLine.includes('Phone') && firstLine.includes('Value'));

      if (isGoogleContacts) {
        // Parse CSV properly
        const headers = firstLine.split(',');
        const phoneIndices = headers.map((h, i) => h.includes('Phone') && h.includes('Value') ? i : -1).filter(i => i !== -1);

        // Iterate over data lines (skip header)
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          // Simple CSV split (handling quotes would be better but this is a quick implementation)
          // For robust CSV parsing we'd need a library or complex regex, but split(',') is often "good enough" for simple Google exports if no commas in fields
          // To be safer, we can try to respect quotes or just extract from the approximate positions

          // Let's use a regex to split by comma but ignore commas inside quotes
          const parts = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(',');

          phoneIndices.forEach(index => {
            if (parts[index]) {
              // Remove quotes if present
              const val = parts[index].replace(/^"|"$/g, '').trim();
              if (val) rawEntries.push(val);
            }
          });
        }
      } else {
        // Fallback: Treat as simple list (TXT or simple CSV)
        lines.forEach(line => {
          // Split by comma if it looks like clustered data, otherwise just take the line
          const parts = line.split(',');
          parts.forEach(part => rawEntries.push(part.trim()));
        });
      }

      const cleanedNumbers = rawEntries
        .map(raw => {
          // Remove all non-digit characters
          const digits = raw.replace(/\D/g, '');

          if (!digits) return null;

          if (digits.length === 10) {
            return '91' + digits;
          } else if (digits.length > 10) {
            // If starts with 00 (international prefix substitute), strip it
            if (digits.startsWith('00')) return digits.substring(2);
            return digits;
          }
          return null; // Skip invalid lengths
        })
        .filter(n => n !== null);

      // Remove duplicates
      const uniqueNumbers = [...new Set(cleanedNumbers)];

      if (uniqueNumbers.length > 0) {
        setNumbers(uniqueNumbers.join('\n'));
        alert(`Successfully imported ${uniqueNumbers.length} numbers.\n(Skipped ${rawEntries.length - uniqueNumbers.length} duplicates or invalid entries)`);
      } else {
        alert('No valid phone numbers found in the file.');
      }
    };
    reader.readAsText(file);
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setAttachment({ base64: ev.target.result, name: file.name, type: file.type })
    reader.readAsDataURL(file)
  }

  const handleVerifyNumbers = async () => {
    const nums = verifyNumbers.split('\n').map(n => n.trim().replace(/[^\d+]/g, '')).filter(n => n.length >= 10)
    if (!nums.length || !targetInstance) return alert('Enter numbers and select instance')
    setVerifying(true)
    try { setVerifiedResults(await evolutionApi.checkNumber(targetInstance, nums) || []) } catch { alert('Failed') }
    setVerifying(false)
  }

  return (
    <div className="app-container">
      <nav className="sidebar glass">
        <div className="sidebar-logo">
          <MessageSquare className="text-primary" size={28} />
          <span className="gradient-text" style={{ fontSize: '16px' }}>Evolution Pro</span>
        </div>
        <div className="nav-links" style={{ overflowY: 'auto', flex: 1 }}>
          {navItems.map(item => (
            <div key={item.id} className={`nav-item ${activeTab === item.id ? 'active' : ''}`} onClick={() => setActiveTab(item.id)}>
              <item.icon size={18} /><span>{item.label}</span>
            </div>
          ))}
        </div>
        <div style={{ padding: '16px 0' }}>
          <div className="glass" style={{ padding: '10px', borderRadius: '10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: apiUrl ? '#10b981' : '#ef4444' }} />
            <span>{apiUrl ? 'Connected' : 'Offline'}</span>
          </div>
        </div>
      </nav>

      <SchedulerRunner instances={instances} />

      <main className="main-content">
        <AnimatePresence mode="wait">
          {activeTab === 'instances' && (
            <motion.div key="instances" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div><h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Instances</h1><p style={{ color: 'rgba(255,255,255,0.6)' }}>Manage WhatsApp connections</p></div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button className="btn btn-glass" onClick={loadInstances} disabled={loading}><RefreshCw size={18} className={loading ? 'spin' : ''} /></button>
                  <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}><Plus size={18} /> New Instance</button>
                </div>
              </header>
              {error && <div className="glass" style={{ padding: '16px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #ef4444', display: 'flex', alignItems: 'center', gap: '12px', color: '#f87171' }}><AlertCircle size={20} /><span>{error}</span></div>}
              <div className="card-grid">
                {instances.map(inst => (
                  <div key={inst.name} className="glass card-animate" style={{ padding: '24px', borderRadius: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'hsl(var(--primary) / 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                          {inst.profilePicUrl ? <img src={inst.profilePicUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (inst.integration === 'TELEGRAM' ? <Send className="text-primary" /> : <Smartphone className="text-primary" />)}
                        </div>
                        <div><h3 style={{ fontSize: '18px' }}>{inst.name}</h3><p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>{inst.ownerJid || 'Not logged in'}</p></div>
                      </div>
                      <span className={`status-badge ${inst.connectionStatus === 'open' ? 'status-online' : 'status-offline'}`}>{inst.connectionStatus}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button className="btn btn-glass" style={{ flex: 1, fontSize: '13px' }} onClick={() => handleShowQr(inst.name)}><QrIcon size={14} /> QR</button>
                      <button className="btn btn-glass" style={{ fontSize: '13px', color: '#f87171' }} onClick={() => handleLogout(inst.name)}>Logout</button>
                      <button className="btn btn-glass" style={{ fontSize: '13px', color: '#f87171' }} onClick={() => handleDeleteInstance(inst.name)}><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
                {!loading && !instances.length && !error && <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '100px', color: 'rgba(255,255,255,0.2)' }}><Smartphone size={80} style={{ marginBottom: '24px', strokeWidth: 1 }} /><h2 style={{ fontSize: '24px', color: 'rgba(255,255,255,0.4)' }}>No instances found</h2></div>}
              </div>
            </motion.div>
          )}

          {activeTab === 'bulk' && (
            <motion.div key="bulk" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <h1 style={{ fontSize: '32px', marginBottom: '32px' }}>Bulk Sender</h1>
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: '24px' }}>
                <div className="glass" style={{ padding: '28px', borderRadius: '24px' }}>
                  <div style={{ marginBottom: '20px' }}><label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Instance</label><select value={targetInstance} onChange={e => setTargetInstance(e.target.value)} style={{ width: '100%' }}><option value="">Choose...</option>{instances.map(i => <option key={i.name} value={i.name}>{i.name}</option>)}</select></div>
                  <div style={{ marginBottom: '20px' }}><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><label style={{ fontSize: '14px' }}>Message {attachment && '(Caption)'}</label>{attachment && <button onClick={() => setAttachment(null)} style={{ fontSize: '12px', color: '#f87171', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={12} /> Clear</button>}</div><textarea placeholder="Type message..." rows={5} value={message} onChange={e => setMessage(e.target.value)} style={{ width: '100%', resize: 'none' }} /></div>
                  <div style={{ marginBottom: '20px' }}><label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Attachment</label>{!attachment ? <div onClick={() => fileInputRef.current.click()} style={{ border: '2px dashed rgba(255,255,255,0.1)', borderRadius: '12px', padding: '16px', textAlign: 'center', cursor: 'pointer' }}><FileUp size={20} style={{ opacity: 0.5 }} /><p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>Upload file</p></div> : <div className="glass" style={{ padding: '10px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}><Download size={18} className="text-primary" /><span style={{ fontSize: '13px', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{attachment.name}</span></div>}<input type="file" ref={fileInputRef} onChange={handleFileChange} hidden /></div>
                  <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}><div style={{ flex: 1 }}><label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Min Delay (sec)</label><input type="number" min="5" value={minDelay} onChange={e => setMinDelay(+e.target.value)} style={{ width: '100%' }} /></div><div style={{ flex: 1 }}><label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Max Delay (sec)</label><input type="number" min="10" value={maxDelay} onChange={e => setMaxDelay(+e.target.value)} style={{ width: '100%' }} /></div></div>
                  <div style={{ fontSize: '12px', color: '#10b981', marginBottom: '16px', marginTop: '-16px' }}>Recommended: 10-20 seconds to avoid bans.</div>
                  <div style={{ display: 'flex', gap: '12px' }}><button className="btn btn-primary" style={{ flex: 1, padding: '14px', gap: '10px' }} disabled={isSending} onClick={handleStartBulk}>{isSending ? <RefreshCw className="spin" size={18} /> : <Send size={18} />}{isSending ? 'Sending...' : 'Start'}</button>{isSending && <button className="btn btn-glass" style={{ color: '#f87171' }} onClick={() => { setIsSending(false); isSendingRef.current = false }}>Stop</button>}</div>
                  {isSending && <div style={{ marginTop: '24px' }}><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}><span>Progress</span><span>{Math.round((progress.sent + progress.failed) / progress.total * 100)}%</span></div><div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}><div style={{ height: '100%', background: 'hsl(var(--primary))', width: `${(progress.sent + progress.failed) / progress.total * 100}%` }} /></div><div style={{ display: 'flex', gap: '16px', marginTop: '10px', fontSize: '12px' }}><span style={{ color: '#10b981' }}>Sent: {progress.sent}</span><span style={{ color: '#f87171' }}>Failed: {progress.failed}</span></div></div>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="glass" style={{ padding: '20px', borderRadius: '20px', flex: 1 }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}><h3 style={{ fontSize: '14px' }}><Users size={16} style={{ marginRight: '8px' }} />Recipients <span style={{ fontSize: '12px', opacity: 0.5 }}>({numbers ? numbers.split('\n').filter(n => n.trim()).length : 0})</span></h3><div style={{ display: 'flex', gap: '8px' }}><button className="btn btn-glass" onClick={() => { if (confirm('Clear all numbers?')) setNumbers('') }} style={{ padding: '6px', color: '#f87171' }} title="Clear List"><Trash2 size={14} /></button><label className="btn btn-glass" style={{ padding: '6px', cursor: 'pointer' }}><FileUp size={14} /><input type="file" hidden accept=".txt,.csv" onChange={handleImportContacts} /></label></div></div><textarea placeholder="Numbers (one per line)..." rows={10} value={numbers} onChange={e => setNumbers(e.target.value)} style={{ width: '100%', resize: 'none', background: 'transparent', border: 'none', flex: 1 }} /></div>
                  <div className="glass" style={{ padding: '16px', borderRadius: '16px', height: '180px', display: 'flex', flexDirection: 'column' }}><h3 style={{ marginBottom: '10px', fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>Logs</h3><div style={{ flex: 1, overflowY: 'auto', fontSize: '11px' }}>{logs.map((l, i) => <div key={i} style={{ color: l.type === 'error' ? '#f87171' : l.type === 'success' ? '#10b981' : l.type === 'wait' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.6)', marginBottom: '2px' }}>{l.msg}</div>)}</div></div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'workflows' && <WorkflowsTab instances={instances} defaultInstance={targetInstance} />}
          {activeTab === 'chats' && <ChatsTab instances={instances} targetInstance={targetInstance} setTargetInstance={setTargetInstance} />}
          {activeTab === 'groups' && <GroupsTab instances={instances} targetInstance={targetInstance} setTargetInstance={setTargetInstance} />}
          {activeTab === 'contacts' && <ContactsManagerTab />}
          {activeTab === 'templates' && <TemplatesTab />}
          {activeTab === 'scheduler' && <SchedulerTab instances={instances} targetInstance={targetInstance} setTargetInstance={setTargetInstance} />}
          {activeTab === 'autoreply' && <AutoReplyTab instances={instances} targetInstance={targetInstance} setTargetInstance={setTargetInstance} />}
          {activeTab === 'ai' && <AIChatbotTab instances={instances} targetInstance={targetInstance} setTargetInstance={setTargetInstance} />}
          {activeTab === 'analytics' && <AnalyticsTab instances={instances} />}
          {activeTab === 'integrations' && <IntegrationsTab instances={instances} targetInstance={targetInstance} setTargetInstance={setTargetInstance} />}
          {activeTab === 'profile' && <ProfileTab instances={instances} targetInstance={targetInstance} setTargetInstance={setTargetInstance} />}
          {activeTab === 'webhooks' && <WebhooksTab instances={instances} targetInstance={targetInstance} setTargetInstance={setTargetInstance} />}

          {activeTab === 'verify' && (
            <motion.div key="verify" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <h1 style={{ fontSize: '32px', marginBottom: '32px' }}>Verify Numbers</h1>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', maxWidth: '900px' }}>
                <div className="glass" style={{ padding: '24px', borderRadius: '20px' }}>
                  <div style={{ marginBottom: '16px' }}><label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Instance</label><select value={targetInstance} onChange={e => setTargetInstance(e.target.value)} style={{ width: '100%' }}><option value="">Choose...</option>{instances.map(i => <option key={i.name} value={i.name}>{i.name}</option>)}</select></div>
                  <div style={{ marginBottom: '16px' }}><label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Numbers</label><textarea value={verifyNumbers} onChange={e => setVerifyNumbers(e.target.value)} placeholder="One per line" rows={8} style={{ width: '100%', resize: 'none' }} /></div>
                  <button className="btn btn-primary" style={{ width: '100%', gap: '8px' }} onClick={handleVerifyNumbers} disabled={verifying}>{verifying ? <RefreshCw size={16} className="spin" /> : <Phone size={16} />}{verifying ? 'Checking...' : 'Verify'}</button>
                </div>
                <div className="glass" style={{ padding: '24px', borderRadius: '20px' }}><h3 style={{ fontSize: '16px', marginBottom: '16px' }}>Results</h3><div style={{ maxHeight: '350px', overflowY: 'auto' }}>{verifiedResults.map((r, i) => <div key={i} style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: '14px' }}>{r.jid?.split('@')[0] || r.number}</span><span style={{ color: r.exists ? '#10b981' : '#f87171', fontSize: '12px' }}>{r.exists ? '✓ Valid' : '✗ Invalid'}</span></div>)}{!verifiedResults.length && <p style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.3)' }}>Results appear here</p>}</div></div>
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <h1 style={{ fontSize: '32px', marginBottom: '32px' }}>Settings</h1>
              <div className="glass" style={{ padding: '28px', borderRadius: '24px', maxWidth: '550px' }}>
                <div style={{ marginBottom: '20px' }}><label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '14px' }}><Server size={16} className="text-primary" /> API URL</label><input type="text" placeholder="http://localhost:8080" value={apiUrl} onChange={e => setApiUrl(e.target.value)} style={{ width: '100%' }} /></div>
                <div style={{ marginBottom: '28px' }}><label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '14px' }}><Key size={16} className="text-primary" /> API Key</label><input type="password" placeholder="your-api-key" value={apiKey} onChange={e => setApiKey(e.target.value)} style={{ width: '100%' }} /></div>
                <button className="btn btn-primary" onClick={() => { localStorage.setItem('evo_api_url', apiUrl); localStorage.setItem('evo_api_key', apiKey); alert('Saved!'); loadInstances() }} style={{ width: '100%', gap: '10px' }}><Save size={18} /> Save</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showQrModal && <div className="modal-overlay" onClick={() => setShowQrModal(false)}><motion.div className="modal-content glass" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()}><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}><h2 style={{ fontSize: '20px' }}>Scan QR</h2><button onClick={() => setShowQrModal(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X /></button></div><div style={{ background: 'white', padding: '20px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', minHeight: '280px' }}>{qrCodeData ? (qrCodeData.startsWith('data:image') ? <img src={qrCodeData} alt="QR" style={{ width: '240px', height: '240px' }} /> : <div style={{ textAlign: 'center' }}><p style={{ color: '#111', fontWeight: '700', fontSize: '22px', letterSpacing: '3px' }}>{qrCodeData}</p><p style={{ color: '#666', fontSize: '12px', marginTop: '8px' }}>Pairing Code</p></div>) : <RefreshCw className="spin" size={36} style={{ color: '#111' }} />}</div><p style={{ textAlign: 'center', fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>Scan with WhatsApp to connect {selectedInstance}</p></motion.div></div>}
        </AnimatePresence>

        <AnimatePresence>
          {showCreateModal && <div className="modal-overlay" onClick={() => setShowCreateModal(false)}><motion.div className="modal-content glass" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()}><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}><h2 style={{ fontSize: '20px' }}>New Instance</h2><button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X /></button></div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Instance Name</label>
              <input type="text" placeholder="MyInstance" value={newInstanceName} onChange={e => setNewInstanceName(e.target.value)} style={{ width: '100%' }} />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Integration Type</label>
              <select value={integrationType} onChange={e => setIntegrationType(e.target.value)} style={{ width: '100%' }}>
                <option value="WHATSAPP-BAILEYS">WhatsApp (Baileys)</option>
                <option value="TELEGRAM">Telegram</option>
              </select>
            </div>
            {integrationType === 'TELEGRAM' && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Bot Token</label>
                <input type="password" placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11" value={instanceToken} onChange={e => setInstanceToken(e.target.value)} style={{ width: '100%' }} />
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>Get this from @BotFather on Telegram</p>
              </div>
            )}
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleCreateInstance} disabled={loading}>{loading ? <RefreshCw className="spin" size={18} /> : 'Create'}</button></motion.div></div>}
        </AnimatePresence>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `.modal-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.8);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;z-index:1000}.modal-content{width:420px;padding:28px;border-radius:24px;box-shadow:0 25px 50px -12px rgba(0,0,0,0.5)}.spin{animation:spin 1s linear infinite}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}.text-primary{color:hsl(var(--primary))}select{background:var(--glass-bg);color:white;border:1px solid var(--glass-border);padding:12px;border-radius:12px;appearance:none}option{background:#0a0a0c;color:white}.card-animate{transition:transform 0.3s ease,border-color 0.3s ease}.card-animate:hover{transform:translateY(-4px);border-color:hsl(var(--primary)/0.3)}` }} />
    </div>
  )
}

export default App
