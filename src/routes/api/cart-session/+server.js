import { Stripe } from 'stripe'

import { STRIPE_SECRET_KEY } from '$env/static/private'

const stripe = new Stripe(STRIPE_SECRET_KEY, {
   apiVersion: '2022-11-15; cart_sessions_beta=v1;'
})

export async function GET({ cookies }) {
    const cartSessionId = cookies.get('cart_session')

    let cartSession

    if (cartSessionId) {
        const resource = stripe.StripeResource.extend({
            request: stripe.StripeResource.method({
                method: 'GET',
                path: `cart/sessions/${cartSessionId}`,
            }),
        })

        cartSession = await new resource(stripe).request()
    }

    if (!cartSession) {
        const resource = stripe.StripeResource.extend({
            request: stripe.StripeResource.method({
                method: 'POST',
                path: `cart/sessions`,
            }),
        })
      
        cartSession = await new resource(stripe).request({
            currency: 'usd',
            settings: {
                allow_promotion_codes: true,
            },
        })
    }

    cookies.set('cart_session', cartSessionId || cartSession.id, {
        path: "/",
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1 week
    })

   return new Response(JSON.stringify({ clientSecret: cartSession.client_secret }), { status: 200 })
}