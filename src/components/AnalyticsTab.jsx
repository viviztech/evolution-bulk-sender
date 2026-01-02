import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Users, Send, CheckCircle, XCircle, Clock, Calendar, RefreshCw } from 'lucide-react'
import { motion } from 'framer-motion'
import { AnalyticsService } from '../services/AnalyticsService'

export default function AnalyticsTab({ instances }) {
    const [stats, setStats] = useState({ summary: { sent: 0, failed: 0, campaigns: 0 }, history: [], activities: [] })
    const [dailyData, setDailyData] = useState([])
    const [instanceStats, setInstanceStats] = useState([])
    const [loading, setLoading] = useState(false)
    const [timeRange, setTimeRange] = useState(7) // Days

    const loadStats = () => {
        setLoading(true)
        try {
            const raw = AnalyticsService.getStats()
            setStats(raw)
            setDailyData(AnalyticsService.getChartData(timeRange))
            setInstanceStats(AnalyticsService.getInstancePerformance(instances))
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadStats()

        const handleUpdate = () => loadStats()
        window.addEventListener('analytics-updated', handleUpdate)
        return () => window.removeEventListener('analytics-updated', handleUpdate)
    }, [timeRange, instances])

    // Derived stats
    const totalSent = stats.summary.sent || 0
    const totalFailed = stats.summary.failed || 0
    // delivered is mocked as (sent - failed) for now, or just same as sent if we assume success = delivered
    const totalDelivered = totalSent
    const deliveryRate = totalSent + totalFailed > 0
        ? ((totalSent / (totalSent + totalFailed)) * 100).toFixed(1)
        : 0

    const statCards = [
        { label: 'Total Sent', value: totalSent.toLocaleString(), icon: Send, color: '#818cf8' },
        { label: 'Delivered', value: totalDelivered.toLocaleString(), icon: CheckCircle, color: '#22c55e' },
        { label: 'Failed', value: totalFailed.toLocaleString(), icon: XCircle, color: '#f87171' },
        { label: 'Total Instances', value: instances.length, icon: Users, color: '#fbbf24' },
        { label: 'Campaigns Run', value: stats.summary.campaigns || 0, icon: Calendar, color: '#06b6d4' },
        { label: 'Success Rate', value: `${deliveryRate}%`, icon: TrendingUp, color: '#10b981' },
    ]

    const maxSent = dailyData.length ? Math.max(...dailyData.map(d => d.sent)) : 10

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Analytics</h1>
                    <p style={{ color: 'rgba(255,255,255,0.6)' }}>Track your messaging performance</p>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <select value={timeRange} onChange={e => setTimeRange(+e.target.value)} style={{ minWidth: '150px' }}>
                        <option value="7">Last 7 Days</option>
                        <option value="15">Last 15 Days</option>
                        <option value="30">Last 30 Days</option>
                    </select>
                    <button className="btn btn-glass" onClick={loadStats} disabled={loading}>
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
                    <div style={{ display: 'flex', gap: '12px', height: '250px', alignItems: 'flex-end' }}>
                        {dailyData.map((day, i) => (
                            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                                    <motion.div
                                        style={{
                                            width: '80%', maxWidth: '30px',
                                            background: 'linear-gradient(180deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.5) 100%)',
                                            borderRadius: '6px 6px 0 0',
                                            minHeight: day.sent > 0 ? '4px' : '0'
                                        }}
                                        initial={{ height: 0 }}
                                        animate={{ height: `${(day.sent / (maxSent || 1)) * 200}px` }}
                                        transition={{ delay: i * 0.05, duration: 0.5 }}
                                    />
                                </div>
                                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%', textAlign: 'center' }}>{day.date}</span>
                            </div>
                        ))}
                        {dailyData.length === 0 && <div style={{ width: '100%', textAlign: 'center', color: 'rgba(255,255,255,0.3)', alignSelf: 'center' }}>No data yet</div>}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="glass" style={{ padding: '24px', borderRadius: '24px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Clock size={18} className="text-primary" /> Recent Activity
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', flex: 1 }}>
                        {stats.activities.map((item) => (
                            <div key={item.id} style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', borderLeft: `3px solid ${item.status === 'success' ? '#22c55e' : item.status === 'error' ? '#f87171' : 'hsl(var(--primary))'}` }}>
                                <p style={{ fontSize: '14px', marginBottom: '4px' }}>{item.action}</p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                                    <span>{item.detail}</span>
                                    <span>{new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            </div>
                        ))}
                        {(!stats.activities || stats.activities.length === 0) && (
                            <p style={{ textAlign: 'center', padding: '20px', color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>No recent activity</p>
                        )}
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
                                <th style={{ textAlign: 'right', padding: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: '500' }}>Failed</th>
                                <th style={{ textAlign: 'right', padding: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: '500' }}>Success Rate</th>
                            </tr>
                        </thead>
                        <tbody>
                            {instanceStats.length > 0 ? instanceStats.map((inst, i) => (
                                <tr key={inst.name} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '14px 12px' }}>{inst.name}</td>
                                    <td style={{ padding: '14px 12px', textAlign: 'right' }}>{inst.sent}</td>
                                    <td style={{ padding: '14px 12px', textAlign: 'right', color: '#f87171' }}>{inst.failed}</td>
                                    <td style={{ padding: '14px 12px', textAlign: 'right', color: +inst.rate > 90 ? '#22c55e' : +inst.rate > 50 ? '#fbbf24' : '#f87171' }}>{inst.rate}%</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>No instances/data found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    )
}
