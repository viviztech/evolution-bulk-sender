import axios from 'axios';

const api = axios.create();

// Helper to get headers
const getHeaders = () => {
    const apiKey = localStorage.getItem('evo_api_key');
    return {
        'Content-Type': 'application/json',
        'apikey': apiKey
    };
};

const getBaseUrl = () => {
    return localStorage.getItem('evo_api_url') || 'http://localhost:8080';
};

export const evolutionApi = {
    // Instance Management
    fetchInstances: async () => {
        const response = await api.get(`${getBaseUrl()}/instance/fetchInstances`, {
            headers: getHeaders()
        });
        return response.data;
    },

    createInstance: async (instanceName) => {
        const response = await api.post(`${getBaseUrl()}/instance/create`, {
            instanceName,
            token: '',
            qrcode: true,
            integration: 'WHATSAPP-BAILEYS'
        }, {
            headers: getHeaders()
        });
        return response.data;
    },

    getQrCode: async (instanceName) => {
        const response = await api.get(`${getBaseUrl()}/instance/connect/${instanceName}`, {
            headers: getHeaders()
        });
        return response.data;
    },

    logoutInstance: async (instanceName) => {
        const response = await api.delete(`${getBaseUrl()}/instance/logout/${instanceName}`, {
            headers: getHeaders()
        });
        return response.data;
    },

    // Messaging
    sendText: async (instanceName, number, text) => {
        const response = await api.post(`${getBaseUrl()}/message/sendText/${instanceName}`, {
            number,
            text,
            delay: 1200,
            linkPreview: true
        }, {
            headers: getHeaders()
        });
        return response.data;
    },

    sendMedia: async (instanceName, number, media, fileName, caption, mediatype = 'image') => {
        const response = await api.post(`${getBaseUrl()}/message/sendMedia/${instanceName}`, {
            number,
            media,
            mediatype,
            caption,
            fileName
        }, {
            headers: getHeaders()
        });
        return response.data;
    }
};
