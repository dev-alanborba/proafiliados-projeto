import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

import { evolution } from '@/lib/evolution'

// Regex for common affiliate platforms
const AFFILIATE_PATTERNS = [
    { name: 'Shopee', pattern: /shopee\.com\.br|shope\.ee/i },
    { name: 'Mercado Livre', pattern: /mercadolivre\.com\.br|mlr\.li|mercadolivre\.com/i },
    { name: 'Amazon', pattern: /amzn\.to|amazon\.com\.br/i },
]

// Simulador de conversão local do robô
// Numa integração real, bateríamos na API de Afiliados do cliente
function converteLinkParaAfiliado(urlOriginal: string, clienteId: string): string {
    const url = new URL(urlOriginal.startsWith('http') ? urlOriginal : `https://${urlOriginal}`)
    // Insere rastreio / deep link
    url.searchParams.set('utm_source', 'proafiliados_bot')
    url.searchParams.set('aff_id', clienteId)
    return url.toString()
}

export async function POST(request: Request) {
    // Webhook secret is required — validate via header only (never via query string)
    const webhookSecret = process.env.WEBHOOK_SECRET
    if (!webhookSecret) {
        console.error('WEBHOOK_SECRET não está definido. Rejeitando todas as requisições.')
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const authHeader = request.headers.get('x-webhook-secret') || ''
    if (authHeader !== webhookSecret) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body: Record<string, unknown>
    try {
        body = await request.json()
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const { event, data } = body as { event?: string; data?: Record<string, unknown> }

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

    const content = message.conversation || message.extendedTextMessage?.text || ''
    const senderName = messageData.pushName ?? 'unknown'
    const senderNumber = messageData.key.remoteJid.split('@')[0]
    const groupJid = messageData.key.remoteJid.includes('@g.us') ? messageData.key.remoteJid : null
    const instanceName = messageData.instance

    if (!content || !instanceName) return NextResponse.json({ status: 'empty' })

    // Find links in content
    const urlRegex = /(https?:\/\/[^\s]+)/g
    const links = content.match(urlRegex)

    if (links) {
        const supabase = await createClient()

        // Localiza de qual sessão veio este webhook
        const { data: session } = await supabase
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
                const novoLink = converteLinkParaAfiliado(linkUrl, session.user_id)
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
                    const isMedia = message.imageMessage || message.videoMessage || message.documentMessage

                    for (const dest of destinationGroups) {
                        const destJid = dest.group_jid
                        if (!destJid) continue
                        try {
                            if (isMedia) {
                                // Evolution API precisa do Media Message convertido e baixado,
                                // o que em produção pede que você baixe o Base64 que vem no payload,
                                // enviando via 'sendMedia'. Como fallback de segurança, manda em texto puro:
                                await evolution.sendText(instanceName, destJid, `📸 [Imagem Anexada]\n\n${mensagemConvertida}`)
                            } else {
                                // Envio de Tráfego de Link normal
                                await evolution.sendText(instanceName, destJid, mensagemConvertida)
                            }
                        } catch (err) {
                            console.error('Falha ao retransmitir para destino VIP:', err)
                        }
                    }
                }
            }
        }
    }

    return NextResponse.json({ status: 'ok' })
}
