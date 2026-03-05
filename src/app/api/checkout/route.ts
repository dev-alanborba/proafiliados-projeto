import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { createClient } from '@/lib/supabase-server';

// Initialize the Mercado Pago client
const client = new MercadoPagoConfig({ accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || '' });

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        // if (userError || !user) {
        //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        // }

        const { planId, planName, planPrice, email, firstName, lastName, docNumber } = await request.json();

        if (!planId || !planPrice) {
            return NextResponse.json({ error: 'Faltando dados obrigatórios para gerar o PIX.' }, { status: 400 });
        }

        const payment = new Payment(client);

        // Identificação default se usuário não preencher para testes
        const payerEmail = email || user?.email || 'test_user_123@testuser.com';
        const payerDoc = docNumber ? docNumber.replace(/\D/g, '') : '19119119100'; // CPF fictício que funciona no sandbox se vazio

        const result = await payment.create({
            body: {
                transaction_amount: Number(planPrice),
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
                external_reference: user?.id || `user_guest_${Date.now()}`
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
    } catch (error: any) {
        console.error('Checkout API Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to create PIX payment' }, { status: 500 });
    }
}
