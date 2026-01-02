import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Users, Send, CheckCircle, XCircle, Clock, Calendar, RefreshCw } from 'lucide-react'
import { motion } from 'framer-motion'

export default function AnalyticsTab({ instances }) {
    const [stats, setStats] = useState(() => {
        const saved = localStorage.getItem('messagingStats')
        return saved ? JSON.parse(saved) : {
            totalSent: 1247,
            totalDelivered: 1189,
            totalFailed: 58,
            totalContacts: 3456,
            campaignsRun: 23,
            avgDeliveryRate: 95.3
        }
    })

    const [dailyData, setDailyData] = useState(() => {
        // Generate sample data for the last 7 days
        return Array.from({ length: 7 }, (_, i) => {
            const date = new Date()
            date.setDate(date.getDate() - (6 - i))
            return {
                date: date.toLocaleDateString('en-US', { weekday: 'short' }),
                sent: Math.floor(Math.random() * 200) + 50,
                delivered: Math.floor(Math.random() * 180) + 40,
                failed: Math.floor(Math.random() * 20) + 2
            }
        })
    })

    const [timeRange, setTimeRange] = useState('7d')
    const [loading, setLoading] = useState(false)

    const statCards = [
        { label: 'Total Sent', value: stats.totalSent.toLocaleString(), icon: Send, color: '#818cf8' },
        { label: 'Delivered', value: stats.totalDelivered.toLocaleString(), icon: CheckCircle, color: '#22c55e' },
        { label: 'Failed', value: stats.totalFailed.toLocaleString(), icon: XCircle, color: '#f87171' },
        { label: 'Contacts', value: stats.totalContacts.toLocaleString(), icon: Users, color: '#fbbf24' },
        { label: 'Campaigns', value: stats.campaignsRun, icon: Calendar, color: '#06b6d4' },
        { label: 'Delivery Rate', value: `${stats.avgDeliveryRate}%`, icon: TrendingUp, color: '#10b981' },
    ]

    const maxSent = Math.max(...dailyData.map(d => d.sent))

    const handleRefresh = () => {
        setLoading(true)
        // Simulate refresh
        setTimeout(() => {
            setDailyData(Array.from({ length: 7 }, (_, i) => {
                const date = new Date()
                date.setDate(date.getDate() - (6 - i))
                return {
                    date: date.toLocaleDateString('en-US', { weekday: 'short' }),
                    sent: Math.floor(Math.random() * 200) + 50,
                    delivered: Math.floor(Math.random() * 180) + 40,
                    failed: Math.floor(Math.random() * 20) + 2
                }
            }))
            setLoading(false)
        }, 1000)
    }

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Analytics</h1>
                    <p style={{ color: 'rgba(255,255,255,0.6)' }}>Track your messaging performance</p>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <select value={timeRange} onChange={e => setTimeRange(e.target.value)} style={{ minWidth: '150px' }}>
                        <option value="7d">Last 7 Days</option>
                        <option value="30d">Last 30 Days</option>
                        <option value="90d">Last 90 Days</option>
                    </select>
                    <button className="btn btn-glass" onClick={handleRefresh} disabled={loading}>
                        <RefreshCw size={18} className={loading ? 'spin' : ''} />
                    </button>
                </div>
            </header>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                {statCards.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        className="glass"
                        style={{ padding: '24px', borderRadius: '20px' }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '12px',
                                background: `${stat.color}20`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <stat.icon size={20} style={{ color: stat.color }} />
                            </div>
                        </div>
                        <p style={{ fontSize: '28px', fontWeight: '700', marginBottom: '4px' }}>{stat.value}</p>
                        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                {/* Chart */}
                <div className="glass" style={{ padding: '28px', borderRadius: '24px' }}>
                    <h3 style={{ fontSize: '18px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <BarChart3 size={20} className="text-primary" /> Messages Overview
                    </h3>
                    <div style={{ display: 'flex', gap: '24px', height: '250px', alignItems: 'flex-end' }}>
                        {dailyData.map((day, i) => (
                            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                                    <motion.div
                                        style={{
                                            width: '100%', maxWidth: '40px',
                                            background: 'linear-gradient(180deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.5) 100%)',
                                            borderRadius: '8px 8px 0 0'
                                        }}
                                        initial={{ height: 0 }}
                                        animate={{ height: `${(day.sent / maxSent) * 200}px` }}
                                        transition={{ delay: i * 0.1, duration: 0.5 }}
                                    />
                                </div>
                                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{day.date}</span>
                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '20px', fontSize: '13px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'hsl(var(--primary))' }} />
                            Sent
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#22c55e' }} />
                            Delivered
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#f87171' }} />
                            Failed
                        </span>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="glass" style={{ padding: '24px', borderRadius: '24px' }}>
                    <h3 style={{ fontSize: '16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Clock size={18} className="text-primary" /> Recent Activity
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {[
                            { action: 'Campaign completed', detail: '156 messages sent', time: '2 min ago', status: 'success' },
                            { action: 'New instance created', detail: 'Marketing Team', time: '1 hour ago', status: 'info' },
                            { action: 'Bulk send started', detail: '500 recipients', time: '3 hours ago', status: 'info' },
                            { action: 'Auto-reply triggered', detail: '12 responses', time: '5 hours ago', status: 'success' },
                            { action: 'Campaign failed', detail: 'API error', time: '1 day ago', status: 'error' },
                        ].map((item, i) => (
                            <div key={i} style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', borderLeft: `3px solid ${item.status === 'success' ? '#22c55e' : item.status === 'error' ? '#f87171' : 'hsl(var(--primary))'}` }}>
                                <p style={{ fontSize: '14px', marginBottom: '4px' }}>{item.action}</p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                                    <span>{item.detail}</span>
                                    <span>{item.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Instance Stats */}
            <div className="glass" style={{ marginTop: '24px', padding: '28px', borderRadius: '24px' }}>
                <h3 style={{ fontSize: '18px', marginBottom: '24px' }}>Instance Performance</h3>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                <th style={{ textAlign: 'left', padding: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: '500' }}>Instance</th>
                                <th style={{ textAlign: 'right', padding: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: '500' }}>Sent</th>
                                <th style={{ textAlign: 'right', padding: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: '500' }}>Delivered</th>
                                <th style={{ textAlign: 'right', padding: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: '500' }}>Failed</th>
                                <th style={{ textAlign: 'right', padding: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: '500' }}>Rate</th>
                            </tr>
                        </thead>
                        <tbody>
                            {instances.length > 0 ? instances.map((inst, i) => (
                                <tr key={inst.name} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '14px 12px' }}>{inst.name}</td>
                                    <td style={{ padding: '14px 12px', textAlign: 'right' }}>{Math.floor(Math.random() * 500) + 100}</td>
                                    <td style={{ padding: '14px 12px', textAlign: 'right', color: '#22c55e' }}>{Math.floor(Math.random() * 480) + 90}</td>
                                    <td style={{ padding: '14px 12px', textAlign: 'right', color: '#f87171' }}>{Math.floor(Math.random() * 20)}</td>
                                    <td style={{ padding: '14px 12px', textAlign: 'right', color: 'hsl(var(--primary))' }}>{(Math.random() * 5 + 94).toFixed(1)}%</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>No instances to display</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    )
}
