<script>
import { loadStripe } from '@stripe/stripe-js'
import { onMount } from 'svelte'
import { PUBLIC_STRIPE_KEY } from '$env/static/public'

export let data
const { clientSecret } = data

onMount(async () => {
    const stripe = await loadStripe(PUBLIC_STRIPE_KEY, {
        betas: ['cart_beta_1'],
    })

    const appearance = {
        theme: 'stripe',
    }

    const elements = stripe.elements({ appearance, clientSecret })

    const paymentElement = elements.create('payment')
    paymentElement.mount("#payment-element")

    const paymentRequest = stripe.paymentRequest({
  country: 'US',
  currency: 'usd',
  total: {
    label: 'Demo total',
    amount: 1099,
  },
  requestPayerName: true,
  requestPayerEmail: true,
});

    const prButton = elements.create('paymentRequestButton', {
  paymentRequest,
});

(async () => {
  // Check the availability of the Payment Request API first.
  const result = await paymentRequest.canMakePayment();
  if (result) {
    prButton.mount('#payment-request-button');
  } else {
    document.getElementById('payment-request-button').style.display = 'none';
  }
})();

})


</script>

<div id="payment-request-button">
    <!-- A Stripe Element will be inserted here. -->
  </div>

<form id="payment-form">
    <div id="payment-element">
      <!--Stripe.js injects the Payment Element-->
    </div>
    <button id="submit">
      <div class="spinner hidden" id="spinner"></div>
      <span id="button-text">Pay now</span>
    </button>
    <div id="payment-message" class="hidden"></div>
  </form>