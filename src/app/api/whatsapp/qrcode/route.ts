import { createClient } from '@/lib/supabase-server'
import { evolution } from '@/lib/evolution'
import { NextResponse } from 'next/server'

export async function GET() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user already has an instance in our DB
    const { data: session } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', user.id)
        .single()

    let instanceName = session?.instance_name

    if (!instanceName) {
        // Create new instance name based on user ID
        instanceName = `user_${user.id.split('-')[0]}`
        console.log(`[WhatsApp] Creating new instance: ${instanceName}`)

        try {
            // Create instance in Evolution API
            await evolution.createInstance(instanceName)
            console.log(`[WhatsApp] Instance ${instanceName} created in Evolution API`)

            // Set Webhook for the instance
            const webhookSecret = process.env.WEBHOOK_SECRET || ''
            const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}` || 'http://localhost:3000'
            const webhookUrl = `${appUrl}/api/webhook?secret=${webhookSecret}`
            await evolution.setWebhook(instanceName, webhookUrl)
            console.log(`[WhatsApp] Webhook configured for instance ${instanceName}`)
        } catch (err) {
            console.error(`[WhatsApp] Failed to create instance or set webhook ${instanceName}:`, err)
            // Instance might already exist, so we continue
        }

        // Save session in Supabase
        const { error: insertError } = await supabase.from('sessions').insert({
            user_id: user.id,
            instance_name: instanceName,
            status: 'disconnected'
        })

        if (insertError) {
            console.error(`[WhatsApp] Failed to save session to DB:`, insertError)
            return NextResponse.json({ error: 'Erro ao salvar sessão no banco de dados' }, { status: 500 })
        }
    }

    try {
        console.log(`[WhatsApp] Fetching QR Code for instance: ${instanceName}`)
        const qrData = await evolution.getQrCode(instanceName)

        // If Evolution v2 returns connected state, update Supabase session status
        if (qrData?.instance?.state === 'open' || qrData?.instance?.status === 'open') {
            await supabase.from('sessions').update({ status: 'connected' }).eq('user_id', user.id)
            return NextResponse.json({ ...qrData, status: 'connected' })
        }

        return NextResponse.json(qrData)
    } catch (err: unknown) {
        // If Evolution API returns 404 for the instance, it means it doesn't exist there
        // even though it's in our Supabase DB. We should recreate it.
        if ((err as { response?: { status?: number } }).response?.status === 404) {
            console.log(`[WhatsApp] Instance ${instanceName} not found on server. Recreating...`)
            try {
                await evolution.createInstance(instanceName)
                const webhookSecret = process.env.WEBHOOK_SECRET || ''
                const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}` || 'http://localhost:3000'
            const webhookUrl = `${appUrl}/api/webhook?secret=${webhookSecret}`
                await evolution.setWebhook(instanceName, webhookUrl)
                console.log(`[WhatsApp] Instance ${instanceName} recreated and webhook set. Fetching QR again.`)
                const newQrData = await evolution.getQrCode(instanceName)
                return NextResponse.json(newQrData)
            } catch (createErr) {
                console.error(`[WhatsApp] Failed to recreate instance ${instanceName}:`, createErr)
                return NextResponse.json({
                    error: 'Failed to recreate instance',
                    details: (createErr as Error).message
                }, { status: 500 })
            }
        }

        console.error(`[WhatsApp] Error fetching QR Code for ${instanceName}:`, err)
        return NextResponse.json({
            error: (err as Error).message,
            details: 'Certifique-se que o servidor Evolution API está rodando e a API Key está correta.'
        }, { status: 500 })
    }
}
