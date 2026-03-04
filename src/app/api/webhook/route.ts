import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

// Regex for common affiliate platforms
const AFFILIATE_PATTERNS = [
    { name: 'Shopee', pattern: /shopee\.com\.br|shope\.ee/i },
    { name: 'Mercado Livre', pattern: /mercadolivre\.com\.br|mlr\.li|mercadolivre\.com/i },
    { name: 'Amazon', pattern: /amzn\.to|amazon\.com\.br/i },
]

export async function POST(request: Request) {
    // Verify webhook secret to prevent unauthorized access
    const webhookSecret = process.env.WEBHOOK_SECRET
    if (webhookSecret) {
        const authHeader = request.headers.get('x-webhook-secret') || ''
        const url = new URL(request.url)
        const querySecret = url.searchParams.get('secret') || ''

        if (authHeader !== webhookSecret && querySecret !== webhookSecret) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
    }

    const body = await request.json()
    const { event, data } = body

    // We only care about message events
    if (event !== 'messages.upsert') {
        return NextResponse.json({ status: 'ignored' })
    }

    const message = data.message
    const content = message.conversation || message.extendedTextMessage?.text || ''
    const senderName = data.pushName
    const senderNumber = data.key.remoteJid.split('@')[0]
    const groupJid = data.key.remoteJid.includes('@g.us') ? data.key.remoteJid : null
    const instanceName = data.instance

    if (!content) return NextResponse.json({ status: 'empty' })

    // Find links in content
    const urlRegex = /(https?:\/\/[^\s]+)/g
    const links = content.match(urlRegex)

    if (links) {
        const supabase = await createClient()

        // Find session ID based on instance name
        const { data: session } = await supabase
            .from('sessions')
            .select('id')
            .eq('instance_name', instanceName)
            .single()

        if (session) {
            for (const linkUrl of links) {
                // Detect platform
                let platform = 'Other'
                for (const p of AFFILIATE_PATTERNS) {
                    if (p.pattern.test(linkUrl)) {
                        platform = p.name
                        break
                    }
                }

                // Save link if it's considered an affiliate link or we want all
                // For now, let's save all detected links
                await supabase.from('captured_links').insert({
                    session_id: session.id,
                    group_jid: groupJid,
                    sender_name: senderName,
                    sender_number: senderNumber,
                    content: content,
                    link_url: linkUrl,
                    platform: platform,
                    raw_message: data
                })
            }
        }
    }

    return NextResponse.json({ status: 'ok' })
}
