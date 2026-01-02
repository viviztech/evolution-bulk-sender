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
    // =============================================
    // INSTANCE MANAGEMENT
    // =============================================

    fetchInstances: async () => {
        const response = await api.get(`${getBaseUrl()}/instance/fetchInstances`, {
            headers: getHeaders()
        });
        return response.data;
    },

    createInstance: async (instanceName, options = {}) => {
        const response = await api.post(`${getBaseUrl()}/instance/create`, {
            instanceName,
            token: options.token || '',
            qrcode: options.qrcode !== false,
            integration: options.integration || 'WHATSAPP-BAILEYS',
            number: options.number || '',
            webhook: options.webhook || null,
            webhookByEvents: options.webhookByEvents || false,
            websocketEnabled: options.websocketEnabled || false,
            chatwootAccountId: options.chatwootAccountId || null,
            chatwootToken: options.chatwootToken || null,
            chatwootUrl: options.chatwootUrl || null,
            chatwootSignMsg: options.chatwootSignMsg || false,
            chatwootReopenConversation: options.chatwootReopenConversation || false,
            chatwootConversationPending: options.chatwootConversationPending || false,
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

    getInstanceInfo: async (instanceName) => {
        const response = await api.get(`${getBaseUrl()}/instance/connectionState/${instanceName}`, {
            headers: getHeaders()
        });
        return response.data;
    },

    restartInstance: async (instanceName) => {
        const response = await api.put(`${getBaseUrl()}/instance/restart/${instanceName}`, {}, {
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

    deleteInstance: async (instanceName) => {
        const response = await api.delete(`${getBaseUrl()}/instance/delete/${instanceName}`, {
            headers: getHeaders()
        });
        return response.data;
    },

    setPresence: async (instanceName, presence) => {
        // presence: 'available', 'unavailable', 'composing', 'recording', 'paused'
        const response = await api.post(`${getBaseUrl()}/instance/setPresence/${instanceName}`, {
            presence
        }, {
            headers: getHeaders()
        });
        return response.data;
    },

    // =============================================
    // MESSAGING - TEXT
    // =============================================

    sendText: async (instanceName, number, text, options = {}) => {
        const response = await api.post(`${getBaseUrl()}/message/sendText/${instanceName}`, {
            number,
            text,
            delay: options.delay || 1200,
            linkPreview: options.linkPreview !== false,
            mentionsEveryOne: options.mentionsEveryOne || false,
            mentioned: options.mentioned || []
        }, {
            headers: getHeaders()
        });
        return response.data;
    },

    // =============================================
    // MESSAGING - MEDIA
    // =============================================

    sendMedia: async (instanceName, number, media, fileName, caption, mediatype = 'image') => {
        const response = await api.post(`${getBaseUrl()}/message/sendMedia/${instanceName}`, {
            number,
            media,
            mediatype, // image, video, audio, document
            caption,
            fileName
        }, {
            headers: getHeaders()
        });
        return response.data;
    },

    sendImage: async (instanceName, number, imageUrl, caption = '') => {
        const response = await api.post(`${getBaseUrl()}/message/sendMedia/${instanceName}`, {
            number,
            media: imageUrl,
            mediatype: 'image',
            caption
        }, {
            headers: getHeaders()
        });
        return response.data;
    },

    sendVideo: async (instanceName, number, videoUrl, caption = '') => {
        const response = await api.post(`${getBaseUrl()}/message/sendMedia/${instanceName}`, {
            number,
            media: videoUrl,
            mediatype: 'video',
            caption
        }, {
            headers: getHeaders()
        });
        return response.data;
    },

    sendAudio: async (instanceName, number, audioUrl, ptt = true) => {
        const response = await api.post(`${getBaseUrl()}/message/sendWhatsAppAudio/${instanceName}`, {
            number,
            audio: audioUrl,
            encoding: true
        }, {
            headers: getHeaders()
        });
        return response.data;
    },

    sendDocument: async (instanceName, number, documentUrl, fileName, caption = '') => {
        const response = await api.post(`${getBaseUrl()}/message/sendMedia/${instanceName}`, {
            number,
            media: documentUrl,
            mediatype: 'document',
            fileName,
            caption
        }, {
            headers: getHeaders()
        });
        return response.data;
    },

    sendSticker: async (instanceName, number, stickerUrl) => {
        const response = await api.post(`${getBaseUrl()}/message/sendSticker/${instanceName}`, {
            number,
            sticker: stickerUrl
        }, {
            headers: getHeaders()
        });
        return response.data;
    },

    // =============================================
    // MESSAGING - SPECIAL TYPES
    // =============================================

    sendLocation: async (instanceName, number, latitude, longitude, name = '', address = '') => {
        const response = await api.post(`${getBaseUrl()}/message/sendLocation/${instanceName}`, {
            number,
            name,
            address,
            latitude,
            longitude
        }, {
            headers: getHeaders()
        });
        return response.data;
    },

    sendContact: async (instanceName, number, contacts) => {
        // contacts: [{ fullName: '', wuid: '', phoneNumber: '' }]
        const response = await api.post(`${getBaseUrl()}/message/sendContact/${instanceName}`, {
            number,
            contact: contacts
        }, {
            headers: getHeaders()
        });
        return response.data;
    },

    sendPoll: async (instanceName, number, name, options, selectableCount = 1) => {
        const response = await api.post(`${getBaseUrl()}/message/sendPoll/${instanceName}`, {
            number,
            name,
            selectableCount,
            values: options
        }, {
            headers: getHeaders()
        });
        return response.data;
    },

    sendList: async (instanceName, number, title, description, buttonText, footerText, sections) => {
        // sections: [{ title: '', rows: [{ title: '', description: '', rowId: '' }] }]
        const response = await api.post(`${getBaseUrl()}/message/sendList/${instanceName}`, {
            number,
            title,
            description,
            buttonText,
            footerText,
            sections
        }, {
            headers: getHeaders()
        });
        return response.data;
    },

    sendButtons: async (instanceName, number, title, description, footerText, buttons) => {
        // buttons: [{ buttonId: '', buttonText: { displayText: '' } }]
        const response = await api.post(`${getBaseUrl()}/message/sendButtons/${instanceName}`, {
            number,
            title,
            description,
            footer: footerText,
            buttons
        }, {
            headers: getHeaders()
        });
        return response.data;
    },

    sendReaction: async (instanceName, messageId, emoji) => {
        const response = await api.post(`${getBaseUrl()}/message/sendReaction/${instanceName}`, {
            key: messageId,
            reaction: emoji
        }, {
            headers: getHeaders()
        });
        return response.data;
    },

    // =============================================
    // CHAT MANAGEMENT
    // =============================================

    checkNumber: async (instanceName, numbers) => {
        // numbers: array of phone numbers
        const response = await api.post(`${getBaseUrl()}/chat/whatsappNumbers/${instanceName}`, {
            numbers: Array.isArray(numbers) ? numbers : [numbers]
        }, {
            headers: getHeaders()
        });
        return response.data;
    },

    markAsRead: async (instanceName, remoteJid, messageId) => {
        const response = await api.post(`${getBaseUrl()}/chat/markMessageAsRead/${instanceName}`, {
            readMessages: [{ remoteJid, id: messageId }]
        }, {
            headers: getHeaders()
        });
        return response.data;
    },

    archiveChat: async (instanceName, remoteJid, archive = true) => {
        const response = await api.post(`${getBaseUrl()}/chat/archiveChat/${instanceName}`, {
            chat: remoteJid,
            archive
        }, {
            headers: getHeaders()
        });
        return response.data;
    },

    deleteMessage: async (instanceName, remoteJid, messageId, onlyMe = false) => {
        const response = await api.delete(`${getBaseUrl()}/chat/deleteMessage/${instanceName}`, {
            data: {
                remoteJid,
                messageId,
                onlyMe
            },
            headers: getHeaders()
        });
        return response.data;
    },

    getChats: async (instanceName) => {
        const response = await api.get(`${getBaseUrl()}/chat/findChats/${instanceName}`, {
            headers: getHeaders()
        });
        return response.data;
    },

    getMessages: async (instanceName, remoteJid, count = 20) => {
        const response = await api.post(`${getBaseUrl()}/chat/findMessages/${instanceName}`, {
            where: { key: { remoteJid } },
            limit: count
        }, {
            headers: getHeaders()
        });
        return response.data;
    },

    getContacts: async (instanceName) => {
        const response = await api.get(`${getBaseUrl()}/chat/findContacts/${instanceName}`, {
            headers: getHeaders()
        });
        return response.data;
    },

    getProfilePicture: async (instanceName, number) => {
        const response = await api.post(`${getBaseUrl()}/chat/fetchProfilePictureUrl/${instanceName}`, {
            number
        }, {
            headers: getHeaders()
        });
        return response.data;
    },

    getBusinessProfile: async (instanceName, number) => {
        const response = await api.post(`${getBaseUrl()}/chat/fetchBusinessProfile/${instanceName}`, {
            number
        }, {
            headers: getHeaders()
        });
        return response.data;
    },

    // =============================================
    // PROFILE MANAGEMENT
    // =============================================

    updateProfileName: async (instanceName, name) => {
        const response = await api.post(`${getBaseUrl()}/chat/updateProfileName/${instanceName}`, {
            name
        }, {
            headers: getHeaders()
        });
        return response.data;
    },

    updateProfileStatus: async (instanceName, status) => {
        const response = await api.post(`${getBaseUrl()}/chat/updateProfileStatus/${instanceName}`, {
            status
        }, {
            headers: getHeaders()
        });
        return response.data;
    },

    updateProfilePicture: async (instanceName, pictureUrl) => {
        const response = await api.post(`${getBaseUrl()}/chat/updateProfilePicture/${instanceName}`, {
            picture: pictureUrl
        }, {
            headers: getHeaders()
        });
        return response.data;
    },

    removeProfilePicture: async (instanceName) => {
        const response = await api.delete(`${getBaseUrl()}/chat/removeProfilePicture/${instanceName}`, {
            headers: getHeaders()
        });
        return response.data;
    },

    getPrivacySettings: async (instanceName) => {
        const response = await api.get(`${getBaseUrl()}/chat/fetchPrivacySettings/${instanceName}`, {
            headers: getHeaders()
        });
        return response.data;
    },

    updatePrivacySettings: async (instanceName, settings) => {
        // settings: { readreceipts: 'all'|'none', profile: 'all'|'contacts'|'contact_blacklist'|'none', 
        //             status: 'all'|'contacts'|'contact_blacklist'|'none', online: 'all'|'match_last_seen',
        //             last: 'all'|'contacts'|'contact_blacklist'|'none', groupadd: 'all'|'contacts'|'contact_blacklist' }
        const response = await api.put(`${getBaseUrl()}/chat/updatePrivacySettings/${instanceName}`, settings, {
            headers: getHeaders()
        });
        return response.data;
    },

    // =============================================
    // GROUP MANAGEMENT
    // =============================================

    createGroup: async (instanceName, groupName, participants) => {
        // participants: array of phone numbers
        const response = await api.post(`${getBaseUrl()}/group/create/${instanceName}`, {
            subject: groupName,
            participants
        }, {
            headers: getHeaders()
        });
        return response.data;
    },

    getGroups: async (instanceName, getParticipants = false) => {
        const response = await api.get(`${getBaseUrl()}/group/fetchAllGroups/${instanceName}?getParticipants=${getParticipants}`, {
            headers: getHeaders()
        });
        return response.data;
    },

    getGroupInfo: async (instanceName, groupJid) => {
        const response = await api.get(`${getBaseUrl()}/group/findGroupInfos/${instanceName}?groupJid=${groupJid}`, {
            headers: getHeaders()
        });
        return response.data;
    },

    getGroupParticipants: async (instanceName, groupJid) => {
        const response = await api.get(`${getBaseUrl()}/group/participants/${instanceName}?groupJid=${groupJid}`, {
            headers: getHeaders()
        });
        return response.data;
    },

    updateGroupName: async (instanceName, groupJid, name) => {
        const response = await api.put(`${getBaseUrl()}/group/updateGroupSubject/${instanceName}`, {
            groupJid,
            subject: name
        }, {
            headers: getHeaders()
        });
        return response.data;
    },

    updateGroupDescription: async (instanceName, groupJid, description) => {
        const response = await api.put(`${getBaseUrl()}/group/updateGroupDescription/${instanceName}`, {
            groupJid,
            description
        }, {
            headers: getHeaders()
        });
        return response.data;
    },

    updateGroupPicture: async (instanceName, groupJid, pictureUrl) => {
        const response = await api.put(`${getBaseUrl()}/group/updateGroupPicture/${instanceName}`, {
            groupJid,
            image: pictureUrl
        }, {
            headers: getHeaders()
        });
        return response.data;
    },

    addGroupParticipants: async (instanceName, groupJid, participants) => {
        const response = await api.post(`${getBaseUrl()}/group/updateParticipant/${instanceName}`, {
            groupJid,
            action: 'add',
            participants
        }, {
            headers: getHeaders()
        });
        return response.data;
    },

    removeGroupParticipants: async (instanceName, groupJid, participants) => {
        const response = await api.post(`${getBaseUrl()}/group/updateParticipant/${instanceName}`, {
            groupJid,
            action: 'remove',
            participants
        }, {
            headers: getHeaders()
        });
        return response.data;
    },

    promoteGroupParticipants: async (instanceName, groupJid, participants) => {
        const response = await api.post(`${getBaseUrl()}/group/updateParticipant/${instanceName}`, {
            groupJid,
            action: 'promote',
            participants
        }, {
            headers: getHeaders()
        });
        return response.data;
    },

    demoteGroupParticipants: async (instanceName, groupJid, participants) => {
        const response = await api.post(`${getBaseUrl()}/group/updateParticipant/${instanceName}`, {
            groupJid,
            action: 'demote',
            participants
        }, {
            headers: getHeaders()
        });
        return response.data;
    },

    leaveGroup: async (instanceName, groupJid) => {
        const response = await api.delete(`${getBaseUrl()}/group/leaveGroup/${instanceName}?groupJid=${groupJid}`, {
            headers: getHeaders()
        });
        return response.data;
    },

    getGroupInviteCode: async (instanceName, groupJid) => {
        const response = await api.get(`${getBaseUrl()}/group/inviteCode/${instanceName}?groupJid=${groupJid}`, {
            headers: getHeaders()
        });
        return response.data;
    },

    revokeGroupInviteCode: async (instanceName, groupJid) => {
        const response = await api.put(`${getBaseUrl()}/group/revokeInviteCode/${instanceName}`, {
            groupJid
        }, {
            headers: getHeaders()
        });
        return response.data;
    },

    joinGroupByCode: async (instanceName, inviteCode) => {
        const response = await api.post(`${getBaseUrl()}/group/acceptInviteCode/${instanceName}`, {
            inviteCode
        }, {
            headers: getHeaders()
        });
        return response.data;
    },

    updateGroupSettings: async (instanceName, groupJid, settings) => {
        // settings: { announcement: true/false, restrict: true/false }
        const response = await api.put(`${getBaseUrl()}/group/updateSetting/${instanceName}`, {
            groupJid,
            ...settings
        }, {
            headers: getHeaders()
        });
        return response.data;
    },

    toggleEphemeralMessages: async (instanceName, groupJid, expiration = 86400) => {
        // expiration: 0 (off), 86400 (24h), 604800 (7d), 7776000 (90d)
        const response = await api.post(`${getBaseUrl()}/group/toggleEphemeral/${instanceName}`, {
            groupJid,
            expiration
        }, {
            headers: getHeaders()
        });
        return response.data;
    },

    // =============================================
    // WEBHOOK MANAGEMENT
    // =============================================

    setWebhook: async (instanceName, webhookUrl, events = []) => {
        const response = await api.post(`${getBaseUrl()}/webhook/set/${instanceName}`, {
            url: webhookUrl,
            webhookByEvents: events.length > 0,
            webhookBase64: false,
            events: events.length > 0 ? events : [
                'QRCODE_UPDATED',
                'CONNECTION_UPDATE',
                'MESSAGES_UPSERT',
                'MESSAGES_UPDATE',
                'MESSAGES_DELETE',
                'SEND_MESSAGE',
                'CONTACTS_UPSERT',
                'CONTACTS_UPDATE',
                'PRESENCE_UPDATE',
                'CHATS_UPDATE',
                'CHATS_DELETE',
                'GROUPS_UPSERT',
                'GROUPS_UPDATE',
                'GROUP_PARTICIPANTS_UPDATE',
                'CALL'
            ]
        }, {
            headers: getHeaders()
        });
        return response.data;
    },

    getWebhook: async (instanceName) => {
        const response = await api.get(`${getBaseUrl()}/webhook/find/${instanceName}`, {
            headers: getHeaders()
        });
        return response.data;
    },

    // =============================================
    // LABELS (Business)
    // =============================================

    getLabels: async (instanceName) => {
        const response = await api.get(`${getBaseUrl()}/label/findLabels/${instanceName}`, {
            headers: getHeaders()
        });
        return response.data;
    },

    addLabelToChat: async (instanceName, chatId, labelId) => {
        const response = await api.post(`${getBaseUrl()}/label/handleLabel/${instanceName}`, {
            chatId,
            labelId,
            action: 'add'
        }, {
            headers: getHeaders()
        });
        return response.data;
    },

    removeLabelFromChat: async (instanceName, chatId, labelId) => {
        const response = await api.post(`${getBaseUrl()}/label/handleLabel/${instanceName}`, {
            chatId,
            labelId,
            action: 'remove'
        }, {
            headers: getHeaders()
        });
        return response.data;
    },

    // =============================================
    // UTILITIES
    // =============================================

    getBase64FromMediaMessage: async (instanceName, messageId, remoteJid) => {
        const response = await api.post(`${getBaseUrl()}/chat/getBase64FromMediaMessage/${instanceName}`, {
            message: { key: { remoteJid, id: messageId } },
            convertToMp4: false
        }, {
            headers: getHeaders()
        });
        return response.data;
    },

    // Health check
    healthCheck: async () => {
        try {
            const response = await api.get(`${getBaseUrl()}/`);
            return { status: 'ok', data: response.data };
        } catch (error) {
            return { status: 'error', error: error.message };
        }
    }
};
