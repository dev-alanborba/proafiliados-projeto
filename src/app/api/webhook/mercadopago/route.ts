import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { createClient } from '@supabase/supabase-js';

// Initializes the Mercado Pago client
const client = new MercadoPagoConfig({ accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || '' });

// Initializes Supabase Admin Client to bypass RLS in the Webhook Context
// Note: Webhooks run server-side without an active User auth session
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for the Mercado Pago webhook handler.');
}

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request: Request) {
    try {
        const url = new URL(request.url);
        const action = url.searchParams.get('type') || url.searchParams.get('topic');
        const id = url.searchParams.get('data.id') || url.searchParams.get('id');

        if (!id || (action !== 'payment' && action !== 'merchant_order')) {
            return NextResponse.json({ status: 'ignored' });
        }

        // Verify payment true data via SDK
        const paymentClient = new Payment(client);
        const paymentData = await paymentClient.get({ id });

        // Payment has been definitively approved
        if (paymentData.status === 'approved') {
            const userId = paymentData.external_reference; // We passed this during Checkout preference creation
            const planItem = paymentData.additional_info?.items?.[0]; // Usually has the id/title
            const newPlanId = planItem?.id || 'pro';

            // Validate userId is a proper UUID to prevent arbitrary updates
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
            if (!userId || !uuidRegex.test(userId)) {
                console.error('Webhook Error: Payment Approved but external_reference is missing or not a valid UUID.', paymentData.id);
                return NextResponse.json({ error: 'Invalid External Reference' }, { status: 400 });
            }

            // Automatically Upgrade User's Subscription using Database Function or direct UPDATE
            // Ensure the "users" or "profiles" table has 'subscription_status' and 'plan_type'
            const { error } = await supabaseAdmin
                .from('profiles') // Adjust based on the actual table name (users/profiles/subscriptions)
                .update({
                    subscription_status: 'active',
                    plan_type: newPlanId,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId);

            if (error) {
                console.error('Webhook Error: Failed to update Supabase DB', error);
                return NextResponse.json({ error: 'Failed DB Update' }, { status: 500 });
            }

            console.log(`💲 Acesso VIP Liberado [Plano: ${newPlanId}] para ID ${userId} - Ref de Pagamento MP: ${paymentData.id}`);
        }

        // Acknowledge Mercado Pago we received it (200 OK)
        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Mercado Pago Webhook Error:', error);
        return NextResponse.json({ error: 'Webhook Handler Failed' }, { status: 500 });
    }
}
