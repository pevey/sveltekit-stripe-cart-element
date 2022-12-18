<script>
import "../app.css"
import { page } from '$app/stores'
import { loadStripe } from '@stripe/stripe-js'
import { onMount } from 'svelte'
import { PUBLIC_STRIPE_KEY } from '$env/static/public'
import { PUBLIC_CHECKOUT_URL } from '$env/static/public'

let checkout = ($page.url.pathname == '/checkout') ? true : false

onMount(async () => {
    const stripe = await loadStripe(PUBLIC_STRIPE_KEY, {
        betas: ['cart_beta_1'],
    })

    // Fetch cart session and initialize cart element
    const { clientSecret } = await fetch('/api/cart-session').then((res) => res.json())
    const elements = stripe.elements()
    const cartElement = elements.create('cart', { clientSecret })
    cartElement.mount(document.body)

    // Add event listener to open cart
    if (document.getElementById('open-cart-button')) {
        const openCartButton = document.getElementById('open-cart-button')
        openCartButton.addEventListener('click', cartElement.show)
    }

    // Update cart count indicator
    if (document.getElementById('cart-count-indicator')) {
        const cartCountIndicator = document.getElementById('cart-count-indicator')
        const updateCartItemsCount = (cartState) => { 
            cartCountIndicator.textContent = cartState.lineItems.count 
            console.log(cartState)
        }
        cartElement.on('ready', updateCartItemsCount)
        cartElement.on('change', updateCartItemsCount)
    }

    // Add event listener to add to cart button
    if (document.getElementById('add-to-cart-button')) {
        const addBtn = document.getElementById('add-to-cart-button')
        const errMsg = document.getElementById('error-message')
        addBtn.addEventListener('click', async () => {
            if (addBtn.dataset.loading === 'true') { return }
    
            errMsg.innerText = ''
            addBtn.dataset.loading = 'true'
    
            const response = await cartElement.addLineItem({
                //product: addBtn.dataset.productId
                item_details: {
                    external_id: '1',
                    name: 'my product',
                    unit_amount: parseInt(5000),
                }
            })
    
            if (response.error) {
                errMsg.innerText = response.error.message
                cartElement.hide()
            }
    
            addBtn.dataset.loading = 'false'
        })
    }

    // Redirect to checkout page when checkout button is clicked
    cartElement.on('checkout', async () => {
        window.location = PUBLIC_CHECKOUT_URL
    })
})

</script>
  
<slot />