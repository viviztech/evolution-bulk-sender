import { useState, useEffect } from 'react'
import { Brain, Settings, Save, RefreshCw, Power, MessageSquare, Sparkles, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

export default function AIChatbotTab({ instances, targetInstance, setTargetInstance }) {
    const [config, setConfig] = useState(() => {
        const saved = localStorage.getItem('aiChatbotConfig')
        return saved ? JSON.parse(saved) : {
            enabled: false,
            provider: 'gemini',
            apiKey: '',
            model: 'gemini-pro',
            systemPrompt: 'You are a helpful customer service assistant. Be friendly and professional. Keep responses concise.',
            temperature: 0.7,
            maxTokens: 500,
            triggerKeywords: ['ai', 'help', 'assistant'],
            excludeGroups: true,
            responsePrefix: '',
            responseSuffix: ''
        }
    })

    const [testMessage, setTestMessage] = useState('')
    const [testResponse, setTestResponse] = useState('')
    const [testing, setTesting] = useState(false)

    useEffect(() => {
        localStorage.setItem('aiChatbotConfig', JSON.stringify(config))
    }, [config])

    const handleSave = () => {
        localStorage.setItem('aiChatbotConfig', JSON.stringify(config))
        alert('AI Chatbot configuration saved!')
    }

    const handleTest = async () => {
        if (!testMessage || !config.apiKey) return alert('Enter message and API key')
        setTesting(true)
        setTestResponse('')

        try {
            if (config.provider === 'gemini') {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${config.apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: `${config.systemPrompt}\n\nUser: ${testMessage}\nAssistant:` }] }],
                        generationConfig: { temperature: config.temperature, maxOutputTokens: config.maxTokens }
                    })
                })
                const data = await response.json()
                setTestResponse(data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response')
            } else if (config.provider === 'openai') {
                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${config.apiKey}` },
                    body: JSON.stringify({
                        model: config.model,
                        messages: [
                            { role: 'system', content: config.systemPrompt },
                            { role: 'user', content: testMessage }
                        ],
                        temperature: config.temperature,
                        max_tokens: config.maxTokens
                    })
                })
                const data = await response.json()
                setTestResponse(data.choices?.[0]?.message?.content || 'No response')
            }
        } catch (err) {
            setTestResponse('Error: ' + err.message)
        } finally {
            setTesting(false)
        }
    }

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>AI Chatbot</h1>
                    <p style={{ color: 'rgba(255,255,255,0.6)' }}>Intelligent automated responses with AI</p>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <select value={targetInstance} onChange={e => setTargetInstance(e.target.value)} style={{ minWidth: '200px' }}>
                        <option value="">Select instance...</option>
                        {instances.map(i => <option key={i.name} value={i.name}>{i.name}</option>)}
                    </select>
                    <div
                        onClick={() => setConfig({ ...config, enabled: !config.enabled })}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px',
                            borderRadius: '12px', cursor: 'pointer',
                            background: config.enabled ? 'hsl(var(--primary) / 0.15)' : 'rgba(255,255,255,0.05)',
                            border: `1px solid ${config.enabled ? 'hsl(var(--primary) / 0.4)' : 'rgba(255,255,255,0.1)'}`
                        }}
                    >
                        <Power size={18} className={config.enabled ? 'text-primary' : ''} />
                        <span>{config.enabled ? 'Active' : 'Inactive'}</span>
                    </div>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '24px' }}>
                {/* Configuration */}
                <div className="glass" style={{ padding: '28px', borderRadius: '20px' }}>
                    <h3 style={{ fontSize: '18px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Settings size={20} className="text-primary" /> Configuration
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>AI Provider</label>
                            <select value={config.provider} onChange={e => setConfig({ ...config, provider: e.target.value, model: e.target.value === 'gemini' ? 'gemini-pro' : 'gpt-3.5-turbo' })} style={{ width: '100%' }}>
                                <option value="gemini">Google Gemini</option>
                                <option value="openai">OpenAI GPT</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Model</label>
                            <select value={config.model} onChange={e => setConfig({ ...config, model: e.target.value })} style={{ width: '100%' }}>
                                {config.provider === 'gemini' ? (
                                    <>
                                        <option value="gemini-pro">Gemini Pro</option>
                                        <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                                        <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                                    </>
                                ) : (
                                    <>
                                        <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                                        <option value="gpt-4">GPT-4</option>
                                        <option value="gpt-4-turbo">GPT-4 Turbo</option>
                                    </>
                                )}
                            </select>
                        </div>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>API Key</label>
                        <input type="password" value={config.apiKey} onChange={e => setConfig({ ...config, apiKey: e.target.value })} placeholder={config.provider === 'gemini' ? 'AIza...' : 'sk-...'} style={{ width: '100%' }} />
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>System Prompt (Bot Personality)</label>
                        <textarea value={config.systemPrompt} onChange={e => setConfig({ ...config, systemPrompt: e.target.value })} rows={4} style={{ width: '100%', resize: 'none' }} placeholder="Define how the AI should behave..." />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Temperature ({config.temperature})</label>
                            <input type="range" min="0" max="1" step="0.1" value={config.temperature} onChange={e => setConfig({ ...config, temperature: parseFloat(e.target.value) })} style={{ width: '100%' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                                <span>Precise</span><span>Creative</span>
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Max Tokens</label>
                            <input type="number" value={config.maxTokens} onChange={e => setConfig({ ...config, maxTokens: parseInt(e.target.value) })} min={50} max={4000} style={{ width: '100%' }} />
                        </div>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Trigger Keywords (comma separated)</label>
                        <input type="text" value={config.triggerKeywords.join(', ')} onChange={e => setConfig({ ...config, triggerKeywords: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} placeholder="ai, help, bot, assistant" style={{ width: '100%' }} />
                        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '6px' }}>Leave empty to respond to all messages</p>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                            <input type="checkbox" checked={config.excludeGroups} onChange={e => setConfig({ ...config, excludeGroups: e.target.checked })} />
                            <span style={{ fontSize: '14px' }}>Exclude group messages</span>
                        </label>
                    </div>

                    <button className="btn btn-primary" style={{ width: '100%', gap: '8px' }} onClick={handleSave}>
                        <Save size={18} /> Save Configuration
                    </button>
                </div>

                {/* Test Panel */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="glass" style={{ padding: '24px', borderRadius: '20px' }}>
                        <h3 style={{ fontSize: '16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Sparkles size={18} className="text-primary" /> Test AI Response
                        </h3>
                        <div style={{ marginBottom: '16px' }}>
                            <textarea value={testMessage} onChange={e => setTestMessage(e.target.value)} placeholder="Type a test message..." rows={3} style={{ width: '100%', resize: 'none' }} />
                        </div>
                        <button className="btn btn-glass" style={{ width: '100%', gap: '8px' }} onClick={handleTest} disabled={testing}>
                            {testing ? <RefreshCw size={16} className="spin" /> : <Zap size={16} />}
                            {testing ? 'Generating...' : 'Test Response'}
                        </button>
                        {testResponse && (
                            <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', fontSize: '14px', lineHeight: '1.6' }}>
                                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginBottom: '8px' }}>AI Response:</p>
                                {testResponse}
                            </div>
                        )}
                    </div>

                    <div className="glass" style={{ padding: '24px', borderRadius: '20px' }}>
                        <h3 style={{ fontSize: '16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Brain size={18} className="text-primary" /> Quick Tips
                        </h3>
                        <ul style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: '2' }}>
                            <li>• Use detailed system prompts for better responses</li>
                            <li>• Lower temperature = more consistent answers</li>
                            <li>• Add trigger keywords to avoid spam</li>
                            <li>• Test thoroughly before enabling</li>
                            <li>• Monitor usage to control API costs</li>
                        </ul>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
