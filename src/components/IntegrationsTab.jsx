import { useState, useEffect } from 'react'
import { Link2, Plus, Trash2, Save, RefreshCw, Power, ExternalLink, X, Copy, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function IntegrationsTab({ instances, targetInstance, setTargetInstance }) {
    const [integrations, setIntegrations] = useState(() => {
        const saved = localStorage.getItem('integrations')
        return saved ? JSON.parse(saved) : {
            typebot: { enabled: false, url: '', publicId: '', expire: 20 },
            chatwoot: { enabled: false, accountId: '', token: '', url: '', signMsg: true, reopenConversation: true, conversationPending: false },
            n8n: { enabled: false, webhookUrl: '' },
            make: { enabled: false, webhookUrl: '' },
            zapier: { enabled: false, webhookUrl: '' }
        }
    })
    const [activeIntegration, setActiveIntegration] = useState(null)
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        localStorage.setItem('integrations', JSON.stringify(integrations))
    }, [integrations])

    const handleSave = () => {
        localStorage.setItem('integrations', JSON.stringify(integrations))
        alert('Integration settings saved!')
        setActiveIntegration(null)
    }

    const copyWebhookUrl = () => {
        const webhookUrl = `${localStorage.getItem('evo_api_url') || 'http://localhost:8080'}/webhook/${targetInstance}`
        navigator.clipboard.writeText(webhookUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const integrationList = [
        {
            id: 'typebot',
            name: 'Typebot',
            description: 'Visual chatbot flow builder',
            logo: '🤖',
            color: '#0042DA'
        },
        {
            id: 'chatwoot',
            name: 'Chatwoot',
            description: 'Customer support platform',
            logo: '💬',
            color: '#1F93FF'
        },
        {
            id: 'n8n',
            name: 'N8N',
            description: 'Workflow automation',
            logo: '⚡',
            color: '#FF6D5A'
        },
        {
            id: 'make',
            name: 'Make (Integromat)',
            description: 'No-code automation',
            logo: '🔮',
            color: '#6D00CC'
        },
        {
            id: 'zapier',
            name: 'Zapier',
            description: 'App integrations',
            logo: '⚡',
            color: '#FF4A00'
        }
    ]

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Integrations</h1>
                    <p style={{ color: 'rgba(255,255,255,0.6)' }}>Connect with third-party platforms</p>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <select value={targetInstance} onChange={e => setTargetInstance(e.target.value)} style={{ minWidth: '200px' }}>
                        <option value="">Select instance...</option>
                        {instances.map(i => <option key={i.name} value={i.name}>{i.name}</option>)}
                    </select>
                </div>
            </header>

            {/* Webhook URL Card */}
            <div className="glass" style={{ padding: '20px 24px', borderRadius: '16px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <p style={{ fontSize: '14px', marginBottom: '4px' }}>Your Webhook URL (for receiving events)</p>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                        {localStorage.getItem('evo_api_url') || 'http://localhost:8080'}/webhook/{targetInstance || '{instance}'}
                    </p>
                </div>
                <button className="btn btn-glass" style={{ gap: '8px' }} onClick={copyWebhookUrl}>
                    {copied ? <Check size={16} className="text-primary" /> : <Copy size={16} />}
                    {copied ? 'Copied!' : 'Copy'}
                </button>
            </div>

            {/* Integrations Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {integrationList.map(integration => (
                    <div
                        key={integration.id}
                        className="glass card-animate"
                        style={{ padding: '24px', borderRadius: '20px', cursor: 'pointer' }}
                        onClick={() => setActiveIntegration(integration.id)}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                            <div style={{
                                width: '48px', height: '48px', borderRadius: '12px',
                                background: `${integration.color}20`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '24px'
                            }}>
                                {integration.logo}
                            </div>
                            <div style={{
                                padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600',
                                background: integrations[integration.id]?.enabled ? 'hsl(142 76% 36% / 0.15)' : 'rgba(255,255,255,0.05)',
                                color: integrations[integration.id]?.enabled ? '#22c55e' : 'rgba(255,255,255,0.4)'
                            }}>
                                {integrations[integration.id]?.enabled ? 'Connected' : 'Disabled'}
                            </div>
                        </div>
                        <h3 style={{ fontSize: '18px', marginBottom: '6px' }}>{integration.name}</h3>
                        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>{integration.description}</p>
                    </div>
                ))}
            </div>

            {/* Integration Config Modal */}
            <AnimatePresence>
                {activeIntegration && (
                    <div className="modal-overlay" onClick={() => setActiveIntegration(null)}>
                        <motion.div
                            className="modal-content glass"
                            style={{ maxWidth: '550px' }}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                                <h2>Configure {integrationList.find(i => i.id === activeIntegration)?.name}</h2>
                                <button onClick={() => setActiveIntegration(null)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X /></button>
                            </div>

                            {/* Enable Toggle */}
                            <div
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '16px', borderRadius: '12px', marginBottom: '24px',
                                    background: integrations[activeIntegration]?.enabled ? 'hsl(var(--primary) / 0.1)' : 'rgba(255,255,255,0.03)',
                                    border: `1px solid ${integrations[activeIntegration]?.enabled ? 'hsl(var(--primary) / 0.3)' : 'rgba(255,255,255,0.1)'}`,
                                    cursor: 'pointer'
                                }}
                                onClick={() => setIntegrations(prev => ({ ...prev, [activeIntegration]: { ...prev[activeIntegration], enabled: !prev[activeIntegration].enabled } }))}
                            >
                                <span style={{ fontSize: '14px' }}>Enable Integration</span>
                                <Power size={20} className={integrations[activeIntegration]?.enabled ? 'text-primary' : ''} />
                            </div>

                            {/* Typebot Config */}
                            {activeIntegration === 'typebot' && (
                                <>
                                    <div style={{ marginBottom: '20px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Typebot URL</label>
                                        <input type="url" value={integrations.typebot.url} onChange={e => setIntegrations(prev => ({ ...prev, typebot: { ...prev.typebot, url: e.target.value } }))} placeholder="https://typebot.io" style={{ width: '100%' }} />
                                    </div>
                                    <div style={{ marginBottom: '20px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Public ID (Bot ID)</label>
                                        <input type="text" value={integrations.typebot.publicId} onChange={e => setIntegrations(prev => ({ ...prev, typebot: { ...prev.typebot, publicId: e.target.value } }))} placeholder="my-bot-id" style={{ width: '100%' }} />
                                    </div>
                                    <div style={{ marginBottom: '24px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Session Expire (minutes)</label>
                                        <input type="number" value={integrations.typebot.expire} onChange={e => setIntegrations(prev => ({ ...prev, typebot: { ...prev.typebot, expire: parseInt(e.target.value) } }))} style={{ width: '100%' }} />
                                    </div>
                                </>
                            )}

                            {/* Chatwoot Config */}
                            {activeIntegration === 'chatwoot' && (
                                <>
                                    <div style={{ marginBottom: '20px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Chatwoot URL</label>
                                        <input type="url" value={integrations.chatwoot.url} onChange={e => setIntegrations(prev => ({ ...prev, chatwoot: { ...prev.chatwoot, url: e.target.value } }))} placeholder="https://app.chatwoot.com" style={{ width: '100%' }} />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Account ID</label>
                                            <input type="text" value={integrations.chatwoot.accountId} onChange={e => setIntegrations(prev => ({ ...prev, chatwoot: { ...prev.chatwoot, accountId: e.target.value } }))} style={{ width: '100%' }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>API Token</label>
                                            <input type="password" value={integrations.chatwoot.token} onChange={e => setIntegrations(prev => ({ ...prev, chatwoot: { ...prev.chatwoot, token: e.target.value } }))} style={{ width: '100%' }} />
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                            <input type="checkbox" checked={integrations.chatwoot.signMsg} onChange={e => setIntegrations(prev => ({ ...prev, chatwoot: { ...prev.chatwoot, signMsg: e.target.checked } }))} />
                                            <span style={{ fontSize: '14px' }}>Sign messages with agent name</span>
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                            <input type="checkbox" checked={integrations.chatwoot.reopenConversation} onChange={e => setIntegrations(prev => ({ ...prev, chatwoot: { ...prev.chatwoot, reopenConversation: e.target.checked } }))} />
                                            <span style={{ fontSize: '14px' }}>Reopen conversation on new message</span>
                                        </label>
                                    </div>
                                </>
                            )}

                            {/* Webhook-based integrations (N8N, Make, Zapier) */}
                            {['n8n', 'make', 'zapier'].includes(activeIntegration) && (
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Webhook URL</label>
                                    <input type="url" value={integrations[activeIntegration].webhookUrl} onChange={e => setIntegrations(prev => ({ ...prev, [activeIntegration]: { ...prev[activeIntegration], webhookUrl: e.target.value } }))} placeholder="https://..." style={{ width: '100%' }} />
                                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '8px' }}>
                                        Events will be forwarded to this URL when messages are received
                                    </p>
                                </div>
                            )}

                            <button className="btn btn-primary" style={{ width: '100%', gap: '8px' }} onClick={handleSave}>
                                <Save size={18} /> Save Configuration
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}
