import { Stripe } from 'stripe'
import { redirect } from '@sveltejs/kit'

import { STRIPE_SECRET_KEY } from '$env/static/private'

const stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: '2022-11-15; cart_sessions_beta=v1;'
})

export async function load({ cookies }) {
    let cartSessionId = cookies.get('cart_session')
    if (!cartSessionId) { 

    }
    const resource = stripe.StripeResource.extend({
        request: stripe.StripeResource.method({
            method: 'GET',
            path: `cart/sessions/${cartSessionId}`,
        }),
    })
    const cartSession = await new resource(stripe).request({expand: ["line_items.data.product"]})
    console.log(cartSession)

    // create an order
    //const internalOrder = buildInternalOrder(cartSession)

    // create a PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
        customer: 'cus_Ku3JtbW2MNgSDE',
        amount: 1000,
        currency: cartSession.currency,
        automatic_payment_methods: {enabled: true},
        setup_future_usage: 'on_session'
    })

    //console.log(paymentIntent)

    // const session = await stripe.checkout.sessions.create({
    //     from_cart_session: cartSessionId,
    //     mode: 'payment',
    //     success_url: 'http://127.0.0.1:5173/success',
    //     cancel_url: 'http://127.0.0.1:5173/cancel'
    // })

    // console.log(session)

    // throw redirect(303, session.url)

    return { clientSecret: paymentIntent.client_secret }

}