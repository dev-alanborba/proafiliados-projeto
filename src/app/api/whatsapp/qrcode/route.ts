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

        // Create instance in Evolution API
        try {
            await evolution.createInstance(instanceName)
        } catch {
            // Instance might already exist
        }

        // Save session in Supabase
        await supabase.from('sessions').insert({
            user_id: user.id,
            instance_name: instanceName,
            status: 'disconnected'
        })
    }

    try {
        const qrData = await evolution.getQrCode(instanceName)
        return NextResponse.json(qrData)
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 })
    }
}
