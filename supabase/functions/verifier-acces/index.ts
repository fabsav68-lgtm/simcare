import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { code, app } = await req.json()

    if (!code) {
      return new Response(
        JSON.stringify({ valide: false, message: 'Code manquant' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Chercher le code dans la table abonnements
    const { data, error } = await supabase
      .from('abonnements')
      .select('annee_formation, statut, date_debut, date_fin, app, temps_cumule_minutes, temps_max_minutes')
      .eq('email_etudiant', code)  // fallback
      .or(`notes.like.%${code}%`)
      .eq('statut', 'active')
      .single()

    // Recherche plus directe par notes (code ambassadeur ou démo)
    const { data: byNotes } = await supabase
      .from('abonnements')
      .select('annee_formation, statut, date_debut, date_fin, app, temps_cumule_minutes, temps_max_minutes')
      .like('notes', `${code}%`)
      .eq('statut', 'active')
      .maybeSingle()

    // Recherche par nom_etablissement (codes PRAXIS-A1/A2/A3)
    const { data: byCode } = await supabase
      .from('abonnements')
      .select('annee_formation, statut, date_debut, date_fin, app, temps_cumule_minutes, temps_max_minutes')
      .ilike('notes', `${code}%`)
      .in('statut', ['active'])
      .maybeSingle()

    const row = byNotes || byCode || data

    if (!row) {
      return new Response(
        JSON.stringify({ valide: false, message: 'Code non reconnu ou inactif' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Vérifier la date de fin
    const now = new Date()
    if (row.date_fin && new Date(row.date_fin) < now) {
      return new Response(
        JSON.stringify({ valide: false, message: 'Abonnement expiré' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        valide: true,
        annee: row.annee_formation || 'A3',
        temps_cumule: row.temps_cumule_minutes || 0,
        temps_max: row.temps_max_minutes || null,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    return new Response(
      JSON.stringify({ valide: false, message: 'Erreur serveur' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
