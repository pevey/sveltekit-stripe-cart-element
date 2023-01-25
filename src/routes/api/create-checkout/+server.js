import { Stripe } from 'stripe'

import { STRIPE_SECRET_KEY } from '$env/static/private'

const stripe = new Stripe(STRIPE_SECRET_KEY, {
   apiVersion: '2020-03-02; cart_sessions_beta=v1;'
})

export async function POST({ cookies }) {
    const cartSessionCookie = cookies.get('cart-session')

    if (!cartSession) {
        //return new Response('cart not found', { status: 400 })
        throw error(400, 'cart not found')
    }

    // Retrieve the most up to date CartSession (minus the total amount and item details)
    const resource = stripe.StripeResource.extend({
        request: stripe.StripeResource.method({
            method: 'GET',
            path: `cart/sessions/${cartSessionCookie}`,
        }),
    })
    const cartSession = await new resource(stripe).request()

    // Create an order
    // const internalOrder = await db.orders.create({
    //     data: {
    //         cart_session_id: cartSession.id,
    //         cart_session_total_amount: cartSession.total_details.amount,
    //         cart_session_total_amount_currency: cartSession.total_details.currency,
    //         cart_session_total_amount_discount: cartSession.total_details.amount_discount,
    //         cart_session_total_amount_shipping: cartSession.total_details.amount_shipping,
    //         cart_session_total_amount_tax: cartSession.total_details.amount_tax,
    //         cart_session_total_amount_subtotal: cartSession.total_details.amount_subtotal,
    //         cart_session_total_amount_total: cartSession.total_details.amount_total,
    //         cart_session_total_amount_total_discount: cartSession.total_details.amount_total_discount,
    //         cart_session_total_amount_total_shipping: cartSession.total_details.amount_total_shipping,
    //         cart_session_total_amount_total_tax: cartSession.total_details.amount_total_tax,
    //         cart_session_total_amount_total_subtotal: cartSession.total_details.amount_total_subtotal,
    //         cart_session_total_amount_total_total: cartSession.total_details.amount_total_total,
    //     }
    // })

    // Create a PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
        amount: 1000,
        currency: cartSession.currency,
        automatic_payment_methods: { enabled: true }
    })

    return new Response({ paymentIntentClientSecret: paymentIntent.client_secret }, { status: 200 })

    // Create a CheckoutSession



}