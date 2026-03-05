import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';
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

        const { planId, planName, planPrice } = await request.json();

        if (!planId || !planName || !planPrice) {
            return NextResponse.json({ error: 'Missing plan details' }, { status: 400 });
        }

        const preference = new Preference(client);

        const result = await preference.create({
            body: {
                items: [
                    {
                        id: planId,
                        title: `ProAfiliados - ${planName}`,
                        quantity: 1,
                        unit_price: Number(planPrice),
                        currency_id: 'BRL',
                    }
                ],
                payer: {
                    email: user.email,
                },
                external_reference: user.id, // Important: We use this in the webhook to know WHO paid
                back_urls: {
                    success: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?payment=success`,
                    failure: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/checkout?payment=failure`,
                    pending: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/checkout?payment=pending`,
                },
                auto_return: 'approved',
            }
        });

        return NextResponse.json({ init_point: result.init_point });
    } catch (error) {
        console.error('Checkout API Error:', error);
        return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
    }
}
