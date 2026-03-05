import axios from 'axios'

const evolutionApi = axios.create({
    baseURL: process.env.EVOLUTION_API_URL,
    headers: {
        'apikey': process.env.EVOLUTION_API_KEY,
        'Content-Type': 'application/json'
    },
    timeout: 10_000, // 10s — prevents requests from hanging indefinitely
})

// Only allow alphanumeric, hyphens and underscores to prevent path traversal
const SAFE_INSTANCE_REGEX = /^[a-zA-Z0-9_-]{1,64}$/
function validateInstanceName(name: string): void {
    if (!SAFE_INSTANCE_REGEX.test(name)) {
        throw new Error(`Invalid instanceName: "${name}"`)
    }
}

export const evolution = {
    createInstance: async (instanceName: string) => {
        validateInstanceName(instanceName)
        const { data } = await evolutionApi.post('/instance/create', {
            instanceName,
            token: instanceName,
            qrcode: true
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

    // Method to send media (images/videos)
    sendMedia: async (instanceName: string, number: string, mediaType: 'image' | 'video' | 'document', mediaUrl: string, caption?: string) => {
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
    }
}
