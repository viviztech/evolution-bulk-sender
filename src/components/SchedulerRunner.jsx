import { useEffect } from 'react'
import { evolutionApi } from '../services/api'
import { AnalyticsService } from '../services/AnalyticsService'

export default function SchedulerRunner({ instances }) {
    useEffect(() => {
        const checkInterval = setInterval(async () => {
            const campaigns = JSON.parse(localStorage.getItem('scheduledCampaigns') || '[]')
            const now = new Date()

            // Find a campaign that is scheduled and due
            const dueCampaign = campaigns.find(c =>
                c.status === 'scheduled' &&
                new Date(c.scheduledAt) <= now
            )

            if (dueCampaign) {
                await processCampaign(dueCampaign)
            }
        }, 10000) // Check every 10 seconds

        return () => clearInterval(checkInterval)
    }, [instances])

    const processCampaign = async (campaign) => {
        console.log(`Starting scheduled campaign: ${campaign.name}`)
        AnalyticsService.addActivity('Campaign Started', campaign.name, 'info')

        // 1. Mark as processing
        updateCampaignStatus(campaign.id, 'processing')

        const instanceName = campaign.instance
        const numberList = campaign.numbers.split('\n')
            .map(n => n.trim().replace(/[^\d+]/g, ''))
            .filter(n => n.length >= 10)

        const message = campaign.message

        const minDelay = 10000
        const maxDelay = 20000

        let sentCount = 0
        let failedCount = 0

        for (let i = 0; i < numberList.length; i++) {
            const number = numberList[i]

            // Re-fetch campaign to check status
            const currentCampaigns = JSON.parse(localStorage.getItem('scheduledCampaigns') || '[]')
            const currentCampaign = currentCampaigns.find(c => c.id === campaign.id)
            if (!currentCampaign || currentCampaign.status === 'paused' || currentCampaign.status === 'getting_deleted') {
                console.log('Campaign paused or deleted provided')
                AnalyticsService.addActivity('Campaign Paused', `${campaign.name} stopped by user`, 'error')
                return // Stop processing
            }

            try {
                await evolutionApi.sendText(instanceName, number, message)
                sentCount++
                AnalyticsService.trackMessage(instanceName, 'sent')
                console.log(`[Scheduler] Sent to ${number}`)
            } catch (err) {
                console.error(`[Scheduler] Failed to ${number}`, err)
                AnalyticsService.trackMessage(instanceName, 'failed')
                failedCount++
            }

            if (i < numberList.length - 1) {
                const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1) + minDelay)
                await new Promise(r => setTimeout(r, delay))
            }
        }

        // 2. Mark as completed or reschedule
        AnalyticsService.trackCampaign(1)
        AnalyticsService.addActivity('Campaign Completed', `${campaign.name} (Sent: ${sentCount})`, 'success')

        if (campaign.repeat && campaign.repeat !== 'none') {
            rescheduleCampaign(campaign)
        } else {
            updateCampaignStatus(campaign.id, 'completed')
        }

        console.log(`Campaign ${campaign.name} finished. Sent: ${sentCount}, Failed: ${failedCount}`)
    }

    const updateCampaignStatus = (id, status) => {
        const campaigns = JSON.parse(localStorage.getItem('scheduledCampaigns') || '[]')
        const updated = campaigns.map(c => c.id === id ? { ...c, status } : c)
        localStorage.setItem('scheduledCampaigns', JSON.stringify(updated))
        window.dispatchEvent(new Event('campaigns-updated'))
    }

    const rescheduleCampaign = (campaign) => {
        const nextDate = new Date(campaign.scheduledAt)
        if (campaign.repeat === 'daily') nextDate.setDate(nextDate.getDate() + 1)
        if (campaign.repeat === 'weekly') nextDate.setDate(nextDate.getDate() + 7)
        if (campaign.repeat === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1)

        const campaigns = JSON.parse(localStorage.getItem('scheduledCampaigns') || '[]')
        const updated = campaigns.map(c =>
            c.id === campaign.id ? {
                ...c,
                status: 'scheduled',
                scheduledAt: nextDate.toISOString()
            } : c
        )
        localStorage.setItem('scheduledCampaigns', JSON.stringify(updated))
        window.dispatchEvent(new Event('campaigns-updated'))
    }

    return null
}
