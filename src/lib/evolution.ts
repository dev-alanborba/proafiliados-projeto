import axios from 'axios'

const evolutionApi = axios.create({
    baseURL: process.env.EVOLUTION_API_URL,
    headers: {
        'apikey': process.env.EVOLUTION_API_KEY,
        'Content-Type': 'application/json'
    }
})

export const evolution = {
    createInstance: async (instanceName: string) => {
        const { data } = await evolutionApi.post('/instance/create', {
            instanceName,
            token: instanceName,
            qrcode: true
        })
        return data
    },

    getQrCode: async (instanceName: string) => {
        const { data } = await evolutionApi.get(`/instance/connect/${instanceName}`)
        return data
    },

    fetchInstances: async () => {
        const { data } = await evolutionApi.get('/instance/fetchInstances')
        return data
    },

    deleteInstance: async (instanceName: string) => {
        const { data } = await evolutionApi.delete(`/instance/delete/${instanceName}`)
        return data
    },

    logoutInstance: async (instanceName: string) => {
        const { data } = await evolutionApi.delete(`/instance/logout/${instanceName}`)
        return data
    },

    // Method to check connection state
    getConnectionState: async (instanceName: string) => {
        const { data } = await evolutionApi.get(`/instance/connectionState/${instanceName}`)
        return data
    },

    // Method to send basic text
    sendText: async (instanceName: string, number: string, text: string) => {
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
