// ═══════════════════════════════════════════════════════════
//  SUPABASE EDGE FUNCTIONS — SimCare
//  Déployer via : supabase functions deploy
//
//  2 fonctions à créer dans Supabase Dashboard :
//  1. create-checkout  → crée une session Stripe Checkout
//  2. stripe-webhook   → reçoit les events Stripe
//
//  INSTRUCTIONS DE DÉPLOIEMENT :
//  ─────────────────────────────
//  1. Installer Supabase CLI : npm install -g supabase
//  2. supabase login
//  3. supabase link --project-ref VOTRE_PROJECT_REF
//  4. supabase secrets set STRIPE_SECRET_KEY=sk_live_xxx
//  5. supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx
//  6. supabase functions deploy create-checkout
//  7. supabase functions deploy stripe-webhook
// ═══════════════════════════════════════════════════════════


// ─────────────────────────────────────────────────────────
//  FONCTION 1 : create-checkout
//  Fichier : supabase/functions/create-checkout/index.ts
// ─────────────────────────────────────────────────────────
/*
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@12.0.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
})

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Vérifier l'authentification Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Non autorisé' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Récupérer les données de la requête
    const { priceId, successUrl, cancelUrl } = await req.json()

    // Récupérer ou créer le customer Stripe
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    let customerId = sub?.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id }
      })
      customerId = customer.id

      // Sauvegarder le customer ID
      await supabase
        .from('subscriptions')
        .update({ stripe_customer_id: customerId })
        .eq('user_id', user.id)
    }

    // Créer la session Checkout Stripe
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url:  cancelUrl,
      subscription_data: {
        metadata: { supabase_user_id: user.id }
      },
      locale: 'fr',
      allow_promotion_codes: true,
    })

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
*/


// ─────────────────────────────────────────────────────────
//  FONCTION 2 : stripe-webhook
//  Fichier : supabase/functions/stripe-webhook/index.ts
// ─────────────────────────────────────────────────────────
/*
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@12.0.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
})
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')!
  const body      = await req.text()

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // ── GÉRER LES ÉVÉNEMENTS STRIPE ──────────────────────
  switch (event.type) {

    // Abonnement créé ou mis à jour
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const userId = sub.metadata?.supabase_user_id

      if (!userId) {
        // Récupérer via customer ID
        const { data: profile } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', sub.customer as string)
          .single()
        if (!profile) break
      }

      // Déterminer le plan selon l'interval
      const item     = sub.items.data[0]
      const interval = item?.plan?.interval
      const planMap: Record<string, string> = {
        'month': 'monthly',
        'year':  'annual',
      }
      const plan = planMap[interval] || 'monthly'

      await supabase
        .from('subscriptions')
        .update({
          stripe_subscription_id: sub.id,
          plan,
          status:                sub.status === 'active' ? 'active' : sub.status,
          current_period_start:  new Date(sub.current_period_start * 1000).toISOString(),
          current_period_end:    new Date(sub.current_period_end   * 1000).toISOString(),
          cancel_at_period_end:  sub.cancel_at_period_end,
          updated_at:            new Date().toISOString(),
        })
        .eq('stripe_customer_id', sub.customer as string)

      break
    }

    // Abonnement annulé
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription

      await supabase
        .from('subscriptions')
        .update({
          status:     'cancelled',
          plan:       'free',
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', sub.id)

      break
    }

    // Paiement échoué
    case 'invoice.payment_failed': {
      const invoice  = event.data.object as Stripe.Invoice
      const subId    = invoice.subscription as string

      await supabase
        .from('subscriptions')
        .update({
          status:     'past_due',
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', subId)

      break
    }

    // Paiement réussi (renouvellement)
    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice
      const subId   = invoice.subscription as string

      await supabase
        .from('subscriptions')
        .update({
          status:     'active',
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', subId)

      break
    }

    default:
      console.log(`Événement non géré : ${event.type}`)
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
*/


// ═══════════════════════════════════════════════════════════
//  INSTRUCTIONS STRIPE DASHBOARD
//  (à faire sur dashboard.stripe.com)
// ═══════════════════════════════════════════════════════════

/*
  1. CRÉER LES PRODUITS ET PRIX :

  Produit 1 : "SimCare Étudiant"
  ─────────────────────────────
  - Prix mensuel  : 1,99 € / mois   → noter le Price ID (price_xxx)
  - Prix annuel   : 14,99 € / an    → noter le Price ID (price_xxx)

  Produit 2 : "SimCare Formateur"
  ────────────────────────────────
  - Prix mensuel  : 4,99 € / mois   → noter le Price ID
  - Prix annuel   : 39,99 € / an    → noter le Price ID

  2. CONFIGURER LE WEBHOOK :
  ──────────────────────────
  Stripe Dashboard → Developers → Webhooks → Add endpoint

  Endpoint URL :
  https://VOTRE_PROJECT_REF.supabase.co/functions/v1/stripe-webhook

  Événements à écouter :
  - customer.subscription.created
  - customer.subscription.updated
  - customer.subscription.deleted
  - invoice.payment_succeeded
  - invoice.payment_failed

  → Copier le "Signing secret" (whsec_xxx) pour STRIPE_WEBHOOK_SECRET

  3. CONFIGURER LES SECRETS SUPABASE :
  ──────────────────────────────────────
  Dans le terminal :

  supabase secrets set STRIPE_SECRET_KEY=sk_live_xxx
  supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx

  4. METTRE À JOUR abonnement.html :
  ────────────────────────────────────
  Remplacer les STRIPE_PRICES par vos vrais Price IDs :

  const STRIPE_PRICES = {
    student_monthly:   'price_VOTRE_ID_ETUDIANT_MENSUEL',
    student_annual:    'price_VOTRE_ID_ETUDIANT_ANNUEL',
    formateur_monthly: 'price_VOTRE_ID_FORMA_MENSUEL',
    formateur_annual:  'price_VOTRE_ID_FORMA_ANNUEL',
  };
*/
