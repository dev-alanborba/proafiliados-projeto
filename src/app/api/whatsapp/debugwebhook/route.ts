import { evolution } from '@/lib/evolution'
import { NextResponse } from 'next/server'
import axios from 'axios'
import { createClient } from '@/lib/supabase-server'

export async function GET() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: session } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', user.id)
        .single()

    if (!session?.instance_name) {
        return NextResponse.json({ error: 'No instance' })
    }

    const sanitizedBaseUrl = process.env.EVOLUTION_API_URL?.replace(/\/v2\/?$/, '')?.replace(/\/$/, '') || ''
    const webhookSecret = process.env.WEBHOOK_SECRET || ''
    const webhookUrl = `https://proafiliados-projeto-ww21.vercel.app/api/webhook?secret=${webhookSecret}`

    try {
        const evolutionApi = axios.create({
            baseURL: sanitizedBaseUrl,
            headers: {
                'apikey': process.env.EVOLUTION_API_KEY,
                'Content-Type': 'application/json'
            }
        })

        // Set webhook for the instance
        const { data } = await evolutionApi.post(`/webhook/set/${session.instance_name}`, {
            webhook: {
                enabled: true,
                url: webhookUrl,
                byEvents: false,
                base64: true,
                events: [
                    "APPLICATION_STARTUP",
                    "QRCODE_UPDATED",
                    "MESSAGES_UPSERT",
                    "MESSAGES_UPDATE",
                    "SEND_MESSAGE",
                    "CONNECTION_UPDATE"
                ]
            }
        })

        return NextResponse.json({ success: true, urlSet: webhookUrl, result: data })
    } catch (err: any) {
        return NextResponse.json({ error: err.message, response: err.response?.data })
    }
}
