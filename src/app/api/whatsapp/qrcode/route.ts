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
        } catch (err) {
            console.error(`[WhatsApp] Failed to create instance ${instanceName}:`, err)
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
        return NextResponse.json(qrData)
    } catch (err: any) {
        // If Evolution API returns 404 for the instance, it means it doesn't exist there
        // even though it's in our Supabase DB. We should recreate it.
        if (err.response?.status === 404) {
            console.log(`[WhatsApp] Instance ${instanceName} not found on server. Recreating...`)
            try {
                await evolution.createInstance(instanceName)
                console.log(`[WhatsApp] Instance ${instanceName} recreated successfully. Fetching QR again.`)
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
