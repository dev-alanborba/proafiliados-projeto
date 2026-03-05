import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { createClient } from '@/lib/supabase-server';

// Initialize the Mercado Pago client
const client = new MercadoPagoConfig({ accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || '' });

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { planId, planName, planPrice, email, firstName, lastName, docNumber } = body;

        // Validate planId against allowed values
        const ALLOWED_PLAN_IDS = ['starter', 'professional', 'enterprise'];
        if (!planId || !ALLOWED_PLAN_IDS.includes(planId)) {
            return NextResponse.json({ error: 'Plano inválido.' }, { status: 400 });
        }

        // Validate price is a positive number
        const price = Number(planPrice);
        if (!planPrice || isNaN(price) || price <= 0) {
            return NextResponse.json({ error: 'Valor de plano inválido.' }, { status: 400 });
        }

        // Email must come from authenticated user — no test fallbacks
        const payerEmail = email || user?.email;
        if (!payerEmail) {
            return NextResponse.json({ error: 'Email do pagador é obrigatório.' }, { status: 400 });
        }

        // CPF must be explicitly provided — no fictitious fallback
        const payerDoc = docNumber ? docNumber.replace(/\D/g, '') : null;
        if (!payerDoc || payerDoc.length !== 11) {
            return NextResponse.json({ error: 'CPF do pagador é obrigatório e deve ter 11 dígitos.' }, { status: 400 });
        }

        const payment = new Payment(client);

        const result = await payment.create({
            body: {
                transaction_amount: price,
                description: `ProAfiliados - ${planName || 'Plano'}`,
                payment_method_id: 'pix',
                payer: {
                    email: payerEmail,
                    first_name: firstName || 'Usuário',
                    last_name: lastName || 'ProAfiliados',
                    identification: {
                        type: 'CPF',
                        number: payerDoc,
                    }
                },
                external_reference: user.id
            }
        });

        const qrCode = result.point_of_interaction?.transaction_data?.qr_code;
        const qrCodeBase64 = result.point_of_interaction?.transaction_data?.qr_code_base64;

        if (!qrCode || !qrCodeBase64) {
            throw new Error('QR Code não retornado pela API do Mercado Pago');
        }

        return NextResponse.json({
            id: result.id,
            qr_code: qrCode,
            qr_code_base64: qrCodeBase64
        });
    } catch (error) {
        console.error('Checkout API Error:', error);
        const message = error instanceof Error ? error.message : 'Failed to create PIX payment';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
