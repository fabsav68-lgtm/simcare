<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Avis — Dashboard formateur PraxisCare</title>
<style>
:root{
  --bg:#070c14; --bg2:#0c1420; --card:rgba(255,255,255,.035); --bdr:rgba(255,255,255,.09);
  --txt:#eef2f6; --txt2:#8a99a8; --em:#38bdf8; --green:#40c878; --amber:#e8a840; --red:#e85050;
}
*{box-sizing:border-box;margin:0;padding:0}
body{background:linear-gradient(160deg,var(--bg),var(--bg2));color:var(--txt);font-family:-apple-system,'Segoe UI',sans-serif;min-height:100vh;padding:20px 16px 60px}
.wrap{max-width:680px;margin:0 auto}
h1{font-size:22px;font-weight:800;margin-bottom:4px}
.sub{color:var(--txt2);font-size:13px;margin-bottom:20px}
.filters{display:flex;gap:8px;overflow-x:auto;margin-bottom:16px;padding-bottom:4px}
.filter{flex-shrink:0;background:rgba(255,255,255,.04);border:1px solid var(--bdr);color:var(--txt2);padding:8px 14px;border-radius:20px;font-size:12.5px;font-weight:600;cursor:pointer;white-space:nowrap}
.filter.active{background:rgba(56,189,248,.15);border-color:rgba(56,189,248,.4);color:var(--em)}
.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:20px}
.stat{background:var(--card);border:1px solid var(--bdr);border-radius:10px;padding:12px;text-align:center}
.stat-v{font-size:20px;font-weight:800;color:var(--em);display:block}
.stat-l{font-size:10.5px;color:var(--txt2);margin-top:2px}
.avis-card{background:var(--card);border:1px solid var(--bdr);border-radius:14px;padding:16px;margin-bottom:12px}
.avis-card.non-lu{border-color:rgba(232,168,64,.4)}
.avis-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;gap:10px}
.avis-meta{font-size:11px;color:var(--txt2);font-family:'Fira Mono',monospace}
.avis-app{display:inline-block;background:rgba(56,189,248,.12);color:var(--em);padding:2px 8px;border-radius:8px;font-size:10px;font-weight:700;margin-right:6px}
.avis-stars{font-size:13px;flex-shrink:0}
.avis-tags{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0}
.avis-tag{background:rgba(255,255,255,.05);border:1px solid var(--bdr);color:var(--txt2);font-size:10.5px;padding:3px 9px;border-radius:12px}
.avis-tag.diff{background:rgba(232,168,64,.1);border-color:rgba(232,168,64,.3);color:var(--amber)}
.avis-comment{font-size:13.5px;color:var(--txt);line-height:1.6;margin:10px 0;padding:10px 12px;background:rgba(0,0,0,.2);border-radius:10px}
.avis-reponse-existante{font-size:13px;color:var(--green);line-height:1.6;margin:10px 0;padding:10px 12px;background:rgba(64,200,120,.08);border:1px solid rgba(64,200,120,.25);border-radius:10px}
.avis-reponse-existante b{display:block;font-size:10.5px;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px}
.reply-zone textarea{width:100%;min-height:60px;background:rgba(255,255,255,.04);border:1.5px solid var(--bdr);border-radius:8px;color:var(--txt);padding:10px;font-size:13px;resize:vertical;margin-top:8px}
.reply-actions{display:flex;gap:8px;margin-top:8px}
.btn-reply{background:linear-gradient(135deg,#0284c7,var(--em));border:none;border-radius:8px;color:#fff;font-size:12.5px;font-weight:700;padding:9px 16px;cursor:pointer}
.btn-lu{background:transparent;border:1px solid var(--bdr);border-radius:8px;color:var(--txt2);font-size:12px;padding:9px 14px;cursor:pointer}
.empty{text-align:center;padding:40px 20px;color:var(--txt2);font-size:13.5px}
.loading{text-align:center;padding:30px;color:var(--txt2);font-size:13px}
.config-warn{background:rgba(232,80,80,.1);border:1px solid rgba(232,80,80,.35);color:var(--red);border-radius:10px;padding:14px 16px;font-size:13px;margin-bottom:16px}
</style>
</head>
<body>
<div class="wrap">
  <h1>💬 Avis étudiants</h1>
  <div class="sub">Toutes applications Praxis confondues — consulter et répondre</div>
  <div id="stats-zone"></div>
  <div class="filters" id="filters"></div>
  <div id="liste"></div>
</div>

<script>
const SUPABASE_URL  = 'https://fvrfiikrasezlzpaxpqz.supabase.co';
const SUPABASE_ANON = 'sb_publishable_TNksbociGaWCY53M4wCAXg_faOxEqKt';

let AVIS = [];
let FILTRE_APP = 'tous';

function esc(s){ return (s||'').toString().replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

async function charger(){
  document.getElementById('liste').innerHTML = '<div class="loading">Chargement des avis…</div>';
  try{
    const res = await fetch(SUPABASE_URL + '/rest/v1/avis?select=*&order=created_at.desc', {
      headers: { 'apikey': SUPABASE_ANON, 'Authorization': 'Bearer ' + SUPABASE_ANON }
    });
    if(!res.ok) throw new Error('HTTP ' + res.status);
    AVIS = await res.json();
    render();
  } catch(e){
    document.getElementById('liste').innerHTML = '<div class="config-warn">⚠️ Impossible de charger les avis (' + esc(e.message) + '). Vérifie que la table "avis" existe bien dans Supabase et que les policies RLS autorisent la lecture anonyme.</div>';
  }
}

function render(){
  const apps = ['tous', ...new Set(AVIS.map(a => a.app))];
  document.getElementById('filters').innerHTML = apps.map(a =>
    `<button class="filter ${FILTRE_APP===a?'active':''}" onclick="setFiltre('${a}')">${a==='tous'?'Toutes les apps':a}</button>`
  ).join('');

  const visibles = FILTRE_APP==='tous' ? AVIS : AVIS.filter(a => a.app === FILTRE_APP);
  const nonLus = visibles.filter(a => !a.lu).length;
  const avecCommentaire = visibles.filter(a => a.commentaire).length;
  const moyenneNote = visibles.filter(a=>a.note).length
    ? (visibles.filter(a=>a.note).reduce((s,a)=>s+a.note,0) / visibles.filter(a=>a.note).length).toFixed(1)
    : '—';

  document.getElementById('stats-zone').innerHTML = `
    <div class="stats">
      <div class="stat"><span class="stat-v">${visibles.length}</span><span class="stat-l">Avis reçus</span></div>
      <div class="stat"><span class="stat-v">${nonLus}</span><span class="stat-l">Non lus</span></div>
      <div class="stat"><span class="stat-v">${moyenneNote}★</span><span class="stat-l">Note moyenne</span></div>
    </div>`;

  if(visibles.length === 0){
    document.getElementById('liste').innerHTML = '<div class="empty">Aucun avis pour le moment.</div>';
    return;
  }

  document.getElementById('liste').innerHTML = visibles.map(a => `
    <div class="avis-card ${a.lu?'':'non-lu'}">
      <div class="avis-top">
        <div class="avis-meta">
          <span class="avis-app">${esc(a.app)}</span>${esc(a.module)}<br>
          ${esc(a.code||'?')} · ${esc(a.promo||'?')} · ${new Date(a.created_at).toLocaleString('fr-FR')}
        </div>
        <div class="avis-stars">${a.note ? '⭐'.repeat(a.note) : '—'}</div>
      </div>
      ${(a.aide && a.aide.length) || a.difficulte ? `
        <div class="avis-tags">
          ${(a.aide||[]).map(t=>`<span class="avis-tag">${esc(t)}</span>`).join('')}
          ${a.difficulte ? `<span class="avis-tag diff">${esc(a.difficulte)}</span>` : ''}
        </div>` : ''}
      ${a.commentaire ? `<div class="avis-comment">${esc(a.commentaire)}</div>` : ''}
      ${a.reponse ? `<div class="avis-reponse-existante"><b>Votre réponse</b>${esc(a.reponse)}</div>` : `
        <div class="reply-zone">
          <textarea id="reply-${a.id}" placeholder="Écrire une réponse visible par l'étudiant à sa prochaine visite…"></textarea>
          <div class="reply-actions">
            <button class="btn-reply" onclick="repondre('${a.id}')">Envoyer la réponse</button>
            ${!a.lu ? `<button class="btn-lu" onclick="marquerLu('${a.id}')">Marquer comme lu</button>` : ''}
          </div>
        </div>`}
    </div>
  `).join('');
}

function setFiltre(app){ FILTRE_APP = app; render(); }

async function repondre(id){
  const texte = document.getElementById('reply-'+id).value.trim();
  if(!texte) return;
  await fetch(SUPABASE_URL + '/rest/v1/avis?id=eq.' + id, {
    method: 'PATCH',
    headers: {
      'apikey': SUPABASE_ANON, 'Authorization': 'Bearer ' + SUPABASE_ANON,
      'Content-Type': 'application/json', 'Prefer': 'return=minimal',
    },
    body: JSON.stringify({ reponse: texte, reponse_at: new Date().toISOString(), lu: true }),
  });
  const a = AVIS.find(x => x.id === id);
  if(a){ a.reponse = texte; a.lu = true; }
  render();
}

async function marquerLu(id){
  await fetch(SUPABASE_URL + '/rest/v1/avis?id=eq.' + id, {
    method: 'PATCH',
    headers: {
      'apikey': SUPABASE_ANON, 'Authorization': 'Bearer ' + SUPABASE_ANON,
      'Content-Type': 'application/json', 'Prefer': 'return=minimal',
    },
    body: JSON.stringify({ lu: true }),
  });
  const a = AVIS.find(x => x.id === id);
  if(a) a.lu = true;
  render();
}

charger();
</script>
</body>
</html>
