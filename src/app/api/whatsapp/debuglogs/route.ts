import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || '',
            process.env.SUPABASE_SERVICE_ROLE_KEY || ''
        )

        const { data: links, error } = await supabase
            .from('captured_links')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10)

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ logs: links })
    } catch (err: any) {
        return NextResponse.json({ error: err.message, stack: err.stack }, { status: 500 })
    }
}
