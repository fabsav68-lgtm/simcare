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

    let row = null

    // 1. Nouveau système : code individuel (acces_etudiants) lié à son abonnement
    const { data: acces } = await supabase
      .from('acces_etudiants')
      .select(`
        actif,
        abonnements (
          annee_formation, statut, date_debut, date_fin, app,
          temps_cumule_minutes, temps_max_minutes
        )
      `)
      .eq('code_acces', code)
      .eq('actif', true)
      .maybeSingle()

    if (acces && acces.abonnements) {
      row = acces.abonnements
    }

    // 2. Ancien système (repli) : code stocké dans abonnements.notes, ou email_etudiant
    if (!row) {
      const { data: byNotes } = await supabase
        .from('abonnements')
        .select('annee_formation, statut, date_debut, date_fin, app, temps_cumule_minutes, temps_max_minutes')
        .ilike('notes', `${code}%`)
        .eq('statut', 'active')
        .maybeSingle()

      const { data: byEmail } = await supabase
        .from('abonnements')
        .select('annee_formation, statut, date_debut, date_fin, app, temps_cumule_minutes, temps_max_minutes')
        .eq('email_etudiant', code)
        .eq('statut', 'active')
        .maybeSingle()

      row = byNotes || byEmail
    }

    if (!row || row.statut !== 'active') {
      return new Response(
        JSON.stringify({ valide: false, message: 'Code non reconnu ou inactif' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Vérifie que le code correspond bien à l'appli qui le demande
    // (seulement si les deux valeurs sont renseignées, pour ne pas bloquer les anciens
    // enregistrements où le champ app n'a jamais été rempli)
    if (app && row.app && row.app !== app) {
      return new Response(
        JSON.stringify({ valide: false, message: "Ce code n'est pas valable pour cette application" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Vérifie la date de fin
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
