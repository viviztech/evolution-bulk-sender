
const STORAGE_KEY = 'evolution_analytics_v1';

const getStore = () => {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
            summary: { sent: 0, failed: 0, campaigns: 0 },
            history: [], // { date: 'YYYY-MM-DD', sent: 0, failed: 0, instance: 'name' }
            activities: [] // { action, detail, time: ISOString, status }
        };
    } catch {
        return { summary: { sent: 0, failed: 0, campaigns: 0 }, history: [], activities: [] };
    }
};

const saveStore = (store) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    window.dispatchEvent(new Event('analytics-updated'));
};

export const AnalyticsService = {
    getStats: () => {
        const store = getStore();
        // Calculate dynamic aggregates if needed, or just return store
        return store;
    },

    trackMessage: (instanceName, status = 'sent') => { // status: 'sent' | 'failed'
        const store = getStore();
        const today = new Date().toISOString().split('T')[0];

        // Update Summary
        if (status === 'sent') store.summary.sent++;
        if (status === 'failed') store.summary.failed++;

        // Update History (Daily per instance)
        let dayEntry = store.history.find(h => h.date === today && h.instance === instanceName);
        if (!dayEntry) {
            dayEntry = { date: today, instance: instanceName, sent: 0, failed: 0 };
            store.history.push(dayEntry);
        }

        if (status === 'sent') dayEntry.sent++;
        if (status === 'failed') dayEntry.failed++;

        saveStore(store);
    },

    trackCampaign: (count) => {
        const store = getStore();
        store.summary.campaigns++;
        saveStore(store);
    },

    addActivity: (action, detail, status = 'info') => {
        const store = getStore();
        const activity = {
            id: Date.now(),
            action,
            detail,
            time: new Date().toISOString(),
            status
        };
        store.activities.unshift(activity);
        if (store.activities.length > 50) store.activities = store.activities.slice(0, 50); // Keep last 50
        saveStore(store);
    },

    // Helper to get last 7 days data for chart
    getChartData: (days = 7) => {
        const store = getStore();
        const result = [];
        // Map last N days
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const displayDate = date.toLocaleDateString('en-US', { weekday: 'short' });

            // Sum up all instances for this day
            const dayStats = store.history.filter(h => h.date === dateStr).reduce((acc, curr) => ({
                sent: acc.sent + curr.sent,
                failed: acc.failed + curr.failed
            }), { sent: 0, failed: 0 });

            result.push({
                date: displayDate,
                fullDate: dateStr,
                sent: dayStats.sent,
                failed: dayStats.failed,
                delivered: Math.floor(dayStats.sent * 0.98) // Mock delivery rate for now as we don't strictly track delivery receipts yet
            });
        }
        return result;
    },

    getInstancePerformance: (instances) => {
        const store = getStore();
        return instances.map(inst => {
            // Aggregate all history for this instance
            const instStats = store.history.filter(h => h.instance === inst.name).reduce((acc, curr) => ({
                sent: acc.sent + curr.sent,
                failed: acc.failed + curr.failed
            }), { sent: 0, failed: 0 });

            const total = instStats.sent + instStats.failed;
            const rate = total > 0 ? ((instStats.sent / total) * 100).toFixed(1) : 0;

            return {
                name: inst.name,
                sent: instStats.sent,
                failed: instStats.failed,
                rate: rate
            };
        });
    }
};
