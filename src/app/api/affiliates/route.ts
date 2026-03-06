import { createClient } from '@/lib/supabase-server'
import { NextResponse, NextRequest } from 'next/server'

export async function GET() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: config, error } = await supabase
        .from('affiliate_configs')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ config: config || {} })
}

export async function POST(request: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body;
    try {
        body = await request.json()
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const { shopee_app_id, shopee_app_secret, amazon_tag, mercadolivre_id } = body;

    const { error } = await supabase
        .from('affiliate_configs')
        .upsert(
            {
                user_id: user.id,
                shopee_app_id: shopee_app_id ?? null,
                shopee_app_secret: shopee_app_secret ?? null,
                amazon_tag: amazon_tag ?? null,
                mercadolivre_id: mercadolivre_id ?? null,
                updated_at: new Date().toISOString()
            },
            { onConflict: 'user_id' }
        )

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}
