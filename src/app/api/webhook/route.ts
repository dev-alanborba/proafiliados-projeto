import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

import { evolution } from '@/lib/evolution'

// Create a global admin client to bypass RLS for webhook background processing
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

// Regex for common affiliate platforms
const AFFILIATE_PATTERNS = [
    { name: 'Shopee', pattern: /shopee\.com\.br|shope\.ee/i },
    { name: 'Mercado Livre', pattern: /mercadolivre\.com\.br|mlr\.li|mercadolivre\.com/i },
    { name: 'Amazon', pattern: /amzn\.to|amazon\.com\.br/i },
]

// Simulador de conversão local do robô
function converteLinkParaAfiliado(urlOriginal: string, config: any, plataforma: string): string {
    try {
        const url = new URL(urlOriginal.startsWith('http') ? urlOriginal : `https://${urlOriginal}`)

        if (plataforma === 'Shopee' && config.shopee_app_id) {
            // Em uma integração real da Shopee usa-se a API Open Platform para gerar shortlink
            // Aqui fazemos fallback anexando o ID para demonstração
            url.searchParams.set('aff_id', config.shopee_app_id)
        } else if (plataforma === 'Amazon' && config.amazon_tag) {
            url.searchParams.set('tag', config.amazon_tag)
        } else if (plataforma === 'Mercado Livre' && config.mercadolivre_id) {
            url.searchParams.set('seller_id', config.mercadolivre_id)
        } else {
            url.searchParams.set('utm_source', 'proafiliados_bot')
        }

        return url.toString()
    } catch {
        return urlOriginal
    }
}

export async function POST(request: Request) {
    // Webhook secret is required
    const webhookSecret = process.env.WEBHOOK_SECRET
    if (!webhookSecret) {
        console.error('WEBHOOK_SECRET não está definido. Rejeitando todas as requisições.')
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const authQuery = url.searchParams.get('secret') || ''
    const authHeader = request.headers.get('x-webhook-secret') || ''

    if (authHeader !== webhookSecret && authQuery !== webhookSecret) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body: Record<string, unknown>
    try {
        body = await request.json()
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const { event, data } = body as { event?: string; data?: Record<string, unknown> }

    // DEBUG TELEMETRY: Log incoming payloads to Supabase to debug
    try {
        await supabase.from('captured_links').insert({
            link_url: 'DEBUG_PAYLOAD',
            raw_message: body,
            content: `Event: ${event}`
        })
    } catch (e) { console.error('Error logging telemetry:', e) }

    // We only care about message events
    if (event !== 'messages.upsert') {
        return NextResponse.json({ status: 'ignored' })
    }

    // Validate required fields before accessing nested properties
    if (!data || typeof data !== 'object') {
        return NextResponse.json({ status: 'ignored_no_data' })
    }

    const messageData = data as {
        message?: { conversation?: string; extendedTextMessage?: { text?: string }; imageMessage?: unknown; videoMessage?: unknown; documentMessage?: unknown }
        pushName?: string
        key?: { remoteJid?: string }
        instance?: string
    }

    const message = messageData.message
    if (!message || !messageData.key?.remoteJid) {
        return NextResponse.json({ status: 'ignored_malformed' })
    }

    const content = message.conversation ||
        message.extendedTextMessage?.text ||
        (message.imageMessage as any)?.caption ||
        (message.videoMessage as any)?.caption ||
        (message.documentMessage as any)?.caption ||
        '';
    const senderName = messageData.pushName ?? 'unknown'
    const senderNumber = messageData.key.remoteJid.split('@')[0]
    const groupJid = messageData.key.remoteJid.includes('@g.us') ? messageData.key.remoteJid : null
    const instanceName = messageData.instance

    if (!content || !instanceName) return NextResponse.json({ status: 'empty' })

    // Find links in content
    const urlRegex = /(https?:\/\/[^\s]+)/g
    const links = content.match(urlRegex)

    // Localiza de qual sessão veio este webhook
    const { data: session, error: sessionErr } = await supabase
        .from('sessions')
        .select('id, user_id')
        .eq('instance_name', instanceName)
        .single()

    if (session) {
        // 1. O grupo que enviou a mensagem é um Grupo Origem (is_destination = false && is_monitored = true)?
        const { data: originGroup } = await supabase
            .from('groups')
            .select('id')
            .eq('session_id', session.id)
            .eq('group_jid', groupJid)
            .eq('is_monitored', true)
            .eq('is_destination', false)
            .single()

        // Se não for origem, ignoramos completamente
        if (!originGroup) return NextResponse.json({ status: 'ignored_not_origin' })

        // Busca as configurações de afiliado do usuário
        const { data: config } = await supabase
            .from('affiliate_configs')
            .select('*')
            .eq('user_id', session.user_id)
            .maybeSingle()

        const userConfigs = config || {}

        // 2. Transforma (Clona) a Mensagem Original
        let mensagemConvertida = content
        let encontrouOferta = false
        let plataformaDetectada = 'Other'

        for (const linkUrl of links) {
            // Descobre a plataforma
            for (const p of AFFILIATE_PATTERNS) {
                if (p.pattern.test(linkUrl)) {
                    plataformaDetectada = p.name
                    encontrouOferta = true
                    break
                }
            }

            // Troca o Link (Motor de Clonagem) - replaceAll para cobrir múltiplas ocorrências do mesmo link
            const novoLink = converteLinkParaAfiliado(linkUrl, userConfigs, plataformaDetectada)
            mensagemConvertida = mensagemConvertida.replaceAll(linkUrl, novoLink)
        }

        // Apenas repassamos se de fato tinha um link de oferta reconhecido
        if (encontrouOferta) {
            // 3. Salva a Captura para as métricas do cliente
            await supabase.from('captured_links').insert({
                session_id: session.id,
                group_jid: groupJid,
                sender_name: senderName,
                sender_number: senderNumber,
                content: mensagemConvertida, // Salva o texto que foi alterado!
                link_url: links[0], // O link base que foi detectado
                platform: plataformaDetectada,
                raw_message: messageData
            })

            // 4. MANDA PARA OS DESTINOS (OS GRUPOS VIP DO CLIENTE)
            const { data: destinationGroups } = await supabase
                .from('groups')
                .select('group_jid')
                .eq('session_id', session.id)
                .eq('is_monitored', true)
                .eq('is_destination', true)

            if (destinationGroups && destinationGroups.length > 0) {
                // Prepara o disparo de imagem se houver
                const isImage = !!message.imageMessage
                const isVideo = !!message.videoMessage
                const isMedia = isImage || isVideo || !!message.documentMessage

                let base64Media: string | null = null;
                if (isMedia) {
                    try {
                        base64Media = await evolution.getBase64Media(instanceName, message)
                    } catch (err) {
                        console.error('Falha ao baixar mídia da mensagem original:', err)
                    }
                }

                for (const dest of destinationGroups) {
                    const destJid = dest.group_jid
                    if (!destJid) continue
                    try {
                        if (base64Media) {
                            // Evolution API precisa do Media Base64 no formato mime
                            // O getBase64Media da Evolution v2 costuma retornar a string em base64 pura ou prefixada com data:mime
                            const prefix = base64Media.startsWith('data:') ? '' :
                                isImage ? 'data:image/jpeg;base64,' :
                                    isVideo ? 'data:video/mp4;base64,' : 'data:application/octet-stream;base64,';

                            const mediaUrl = prefix + base64Media
                            const mediaType = isImage ? 'image' : isVideo ? 'video' : 'document'

                            await evolution.sendMedia(instanceName, destJid, mediaType, mediaUrl, mensagemConvertida)
                        } else {
                            // Envio de Tráfego de Link normal (sem mídia)
                            await evolution.sendText(instanceName, destJid, mensagemConvertida)
                        }
                    } catch (err) {
                        console.error('Falha ao retransmitir para destino VIP:', err)
                    }
                }
            }
        }
    }

    return NextResponse.json({ status: 'ok' })
}
