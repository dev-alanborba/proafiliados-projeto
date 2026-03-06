import axios from 'axios'

export interface EvolutionGroup {
    id: string          // JID format: digits@g.us
    subject: string     // Group name
    subjectOwner?: string
    subjectTime?: number
    size?: number       // Member count
    creation?: number
    owner?: string
    desc?: string
    announce?: boolean
    restrict?: boolean
}

// Strips trailing /v2 or slashes just in case the env var was configured with it
const sanitizedBaseUrl = process.env.EVOLUTION_API_URL?.replace(/\/v2\/?$/, '')?.replace(/\/$/, '') || ''

const evolutionApi = axios.create({
    baseURL: sanitizedBaseUrl,
    headers: {
        'apikey': process.env.EVOLUTION_API_KEY,
        'Content-Type': 'application/json'
    },
    timeout: 10_000, // 10s — prevents requests from hanging indefinitely
})

// Only allow alphanumeric, hyphens and underscores to prevent path traversal
const SAFE_INSTANCE_REGEX = /^[a-zA-Z0-9_-]{1,64}$/
function validateInstanceName(name: string): void {
    if (!name || typeof name !== 'string') {
        throw new Error(`Instance name must be a string, got: ${typeof name}`)
    }
    if (!SAFE_INSTANCE_REGEX.test(name)) {
        throw new Error(`Invalid instanceName format: "${name}". Only alphanumeric, hyphens and underscores are allowed (max 64 chars).`)
    }
}

export const evolution = {
    createInstance: async (instanceName: string) => {
        validateInstanceName(instanceName)
        const { data } = await evolutionApi.post('/instance/create', {
            instanceName,
            token: instanceName,
            qrcode: true,
            integration: "WHATSAPP-BAILEYS"
        })
        return data
    },

    getQrCode: async (instanceName: string) => {
        validateInstanceName(instanceName)
        const { data } = await evolutionApi.get(`/instance/connect/${instanceName}`)
        return data
    },

    fetchInstances: async () => {
        const { data } = await evolutionApi.get('/instance/fetchInstances')
        return data
    },

    deleteInstance: async (instanceName: string) => {
        validateInstanceName(instanceName)
        const { data } = await evolutionApi.delete(`/instance/delete/${instanceName}`)
        return data
    },

    logoutInstance: async (instanceName: string) => {
        validateInstanceName(instanceName)
        const { data } = await evolutionApi.delete(`/instance/logout/${instanceName}`)
        return data
    },

    // Method to check connection state
    getConnectionState: async (instanceName: string) => {
        validateInstanceName(instanceName)
        const { data } = await evolutionApi.get(`/instance/connectionState/${instanceName}`)
        return data
    },

    // Method to send basic text
    sendText: async (instanceName: string, number: string, text: string) => {
        validateInstanceName(instanceName)
        const { data } = await evolutionApi.post(`/message/sendText/${instanceName}`, {
            number,
            options: {
                delay: 1200,
                presence: 'composing'
            },
            textMessage: {
                text
            }
        })
        return data
    },

    // Method to fetch all groups for an instance
    getGroups: async (instanceName: string) => {
        validateInstanceName(instanceName)
        const { data } = await evolutionApi.get(`/group/fetchAllGroups/${instanceName}`, {
            params: { getParticipants: false }
        })
        return data as EvolutionGroup[]
    },

    // Method to send media (images/videos)
    sendMedia: async (instanceName: string, number: string, mediaType: 'image' | 'video' | 'document' | 'audio', mediaUrl: string, caption?: string) => {
        validateInstanceName(instanceName)
        const { data } = await evolutionApi.post(`/message/sendMedia/${instanceName}`, {
            number,
            options: {
                delay: 2000,
                presence: mediaType === 'document' ? 'composing' : mediaType === 'video' ? 'recording' : 'composing'
            },
            mediaMessage: {
                mediatype: mediaType,
                caption: caption || '',
                media: mediaUrl
            }
        })
        return data
    },

    // Method to get base64 media from intercepted message
    getBase64Media: async (instanceName: string, messageData: any) => {
        validateInstanceName(instanceName)
        const { data } = await evolutionApi.post(`/chat/getBase64FromMediaMessage/${instanceName}`, {
            message: messageData
        })
        // Evolution API usually returns { base64: "..." }
        return data.base64
    },

    // Method to register Webhook
    setWebhook: async (instanceName: string, url: string) => {
        validateInstanceName(instanceName)
        const payload = {
            webhook: {
                enabled: true,
                url: url,
                webhookByEvents: false,
                webhookBase64: true,
                events: ["MESSAGES_UPSERT"]
            }
        }
        try {
            // Evolution v2 endpoint
            const { data } = await evolutionApi.post(`/webhook/instance/${instanceName}`, payload)
            return data
        } catch (err) {
            // Fallback to v1 endpoint
            const { data } = await evolutionApi.post(`/webhook/set/${instanceName}`, {
                webhook: { ...payload.webhook, base64: true, byEvents: false }
            })
            return data
        }
    }
}
