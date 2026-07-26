/**
 * ═══════════════════════════════════════════════════════
 *  PRAXISCARE — Widget Feedback (connecté Supabase)
 *  v2.0 · 2026 · avec réponse du formateur
 * ═══════════════════════════════════════════════════════
 *
 *  INTÉGRATION (identique à avant, rien à changer côté module) :
 *  <script src="praxiscare-feedback.js"></script>
 *
 *  Pour préciser explicitement l'application (recommandé pour SimVeto/
 *  SimAs/SimAP, la détection automatique par défaut peut se tromper) :
 *  <script>window.PRAXIS_APP = 'SimVeto';</script>
 *  <script src="praxiscare-feedback.js"></script>
 * ═══════════════════════════════════════════════════════
 */

(function(){
  // ── Config Supabase ──
  var SUPABASE_URL  = 'https://fvrfiikrasezlzpaxpqz.supabase.co';
  var SUPABASE_ANON = 'sb_publishable_TNksbociGaWCY53M4wCAXg_faOxEqKt';

  // ── Styles ──
  var style = document.createElement('style');
  style.textContent = `
    #praxis-fb-btn {
      position: fixed;
      bottom: 76px;
      right: 18px;
      z-index: 998;
      background: rgba(56,189,248,.15);
      border: 1.5px solid rgba(56,189,248,.35);
      border-radius: 30px;
      padding: 9px 16px;
      font-family: 'Fira Mono', monospace;
      font-size: 11px;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: #38bdf8;
      cursor: pointer;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      box-shadow: 0 4px 16px rgba(0,0,0,.4);
      transition: all .2s;
      -webkit-tap-highlight-color: transparent;
    }
    #praxis-fb-btn:hover { background: rgba(56,189,248,.25); }
    #praxis-fb-btn .fb-dot {
      display: inline-block; width: 8px; height: 8px; border-radius: 50%;
      background: #f87171; margin-left: 6px; vertical-align: middle;
    }

    #praxis-fb-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,.7);
      z-index: 999;
      display: none;
      align-items: flex-end;
      justify-content: center;
      padding: 0 0 20px;
      backdrop-filter: blur(4px);
    }
    #praxis-fb-overlay.open { display: flex; }

    #praxis-fb-panel {
      background: #04090f;
      border: 1.5px solid rgba(56,189,248,.2);
      border-radius: 20px 20px 16px 16px;
      padding: 28px 24px 24px;
      width: 100%;
      max-width: 480px;
      max-height: 84vh;
      overflow-y: auto;
      border-top: 2px solid #38bdf8;
      animation: slideUp .3s ease;
    }
    @keyframes slideUp {
      from { transform: translateY(40px); opacity: 0; }
      to   { transform: translateY(0);   opacity: 1; }
    }
    #praxis-fb-panel h3 {
      font-family: 'Unbounded', sans-serif;
      font-size: 18px; font-weight: 800; color: #f0ece4;
      letter-spacing: -.5px; margin-bottom: 4px;
    }
    .fb-sub { font-size: 12px; color: #4a6070; margin-bottom: 18px; }

    .fb-reponse-box {
      background: rgba(64,200,120,.08);
      border: 1px solid rgba(64,200,120,.3);
      border-radius: 12px;
      padding: 14px 16px;
      margin-bottom: 18px;
    }
    .fb-reponse-box .fb-reponse-titre {
      font-size: 11px; text-transform: uppercase; letter-spacing: 1px;
      color: #40c878; font-weight: 700; margin-bottom: 6px;
    }
    .fb-reponse-box .fb-reponse-texte {
      font-size: 13.5px; color: #d8e4e8; line-height: 1.6;
    }

    .fb-question { margin-bottom: 18px; }
    .fb-question label {
      display: block; font-size: 13px; color: #d8e4e8; font-weight: 600;
      margin-bottom: 10px;
    }
    .fb-stars { display: flex; gap: 8px; font-size: 26px; }
    .fb-star { opacity: .25; cursor: pointer; transition: opacity .15s; }
    .fb-star.active { opacity: 1; }
    .fb-choices { display: flex; flex-wrap: wrap; gap: 8px; }
    .fb-choice {
      background: rgba(255,255,255,.04); border: 1.5px solid rgba(255,255,255,.08);
      border-radius: 20px; padding: 8px 14px; font-size: 12.5px; color: #a8b8c0;
      cursor: pointer; -webkit-tap-highlight-color: transparent;
    }
    .fb-choice.sel { background: rgba(56,189,248,.15); border-color: rgba(56,189,248,.4); color: #38bdf8; }
    .fb-textarea {
      width: 100%; min-height: 80px; background: rgba(255,255,255,.04);
      border: 1.5px solid rgba(255,255,255,.08); border-radius: 10px;
      color: #f0ece4; padding: 12px; font-size: 13px; resize: vertical;
    }
    .fb-actions { display: flex; gap: 10px; margin-top: 6px; }
    .fb-btn-send {
      flex: 1; background: linear-gradient(135deg,#0284c7,#38bdf8); border: none;
      border-radius: 8px; color: #fff; font-size: 13.5px; font-weight: 700;
      padding: 13px 16px; cursor: pointer; -webkit-tap-highlight-color: transparent;
    }
    .fb-btn-send:hover { opacity: .9; }
    .fb-btn-cancel {
      padding: 13px 16px; border: 1.5px solid rgba(255,255,255,.08); border-radius: 8px;
      background: transparent; color: #a8b8c0; font-size: 12px; cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }

    #praxis-fb-thanks { text-align: center; padding: 20px 0; display: none; }
    #praxis-fb-thanks .thanks-icon { font-size: 44px; display: block; margin-bottom: 12px; }
    #praxis-fb-thanks .thanks-title {
      font-family: 'Unbounded', sans-serif; font-size: 18px; font-weight: 800;
      color: #40c878; letter-spacing: -.5px; margin-bottom: 6px;
    }
    #praxis-fb-thanks .thanks-sub { font-size: 13px; color: #a8b8c0; }
  `;
  document.head.appendChild(style);

  // ── Détecter l'application et le module courant ──
  var titre = document.title;
  var MODULE_NOM = titre
    .replace(' · SimVeto','').replace(' · SimCare IFSI','')
    .replace(' · PraxisVeto','').replace(' · CAFASV','').replace(' · IFSI','')
    .replace(/·.*$/,'').trim() || 'Module';

  var APP_NOM = window.PRAXIS_APP || (function(){
    if(/simveto|praxisveto/i.test(titre)) return 'SimVeto';
    if(/cafasv/i.test(titre)) return 'SimAs';
    if(/simap|deap|puéricult/i.test(titre)) return 'SimAP';
    return 'SimCare';
  })();

  var CODE = sessionStorage.getItem('praxiscare_code') || sessionStorage.getItem(APP_NOM.toLowerCase()+'_code') || 'inconnu';
  var PROMO = sessionStorage.getItem('praxiscare_promo') || 'inconnue';

  // ── Bouton + overlay ──
  var btn = document.createElement('button');
  btn.id = 'praxis-fb-btn';
  btn.innerHTML = '💬 Avis';
  document.body.appendChild(btn);

  var overlay = document.createElement('div');
  overlay.id = 'praxis-fb-overlay';
  overlay.innerHTML = `
    <div id="praxis-fb-panel">
      <h3>💬 Votre avis</h3>
      <div class="fb-sub">${MODULE_NOM} · Feedback étudiant</div>
      <div id="fb-reponses-zone"></div>

      <div id="praxis-fb-form">
        <div class="fb-question">
          <label>1. Note globale du module</label>
          <div class="fb-stars" id="fb-stars">
            <span class="fb-star" data-v="1">⭐</span>
            <span class="fb-star" data-v="2">⭐</span>
            <span class="fb-star" data-v="3">⭐</span>
            <span class="fb-star" data-v="4">⭐</span>
            <span class="fb-star" data-v="5">⭐</span>
          </div>
        </div>
        <div class="fb-question">
          <label>2. Ce qui vous a le plus aidé</label>
          <div class="fb-choices" id="fb-aide">
            <div class="fb-choice" data-g="aide">Les cas cliniques</div>
            <div class="fb-choice" data-g="aide">Les quiz</div>
            <div class="fb-choice" data-g="aide">Les schémas / visuels</div>
            <div class="fb-choice" data-g="aide">L'analyse IA</div>
            <div class="fb-choice" data-g="aide">Les fiches mémo</div>
            <div class="fb-choice" data-g="aide">Les explications texte</div>
          </div>
        </div>
        <div class="fb-question">
          <label>3. Niveau de difficulté perçu</label>
          <div class="fb-choices" id="fb-diff">
            <div class="fb-choice" data-g="diff">Trop facile</div>
            <div class="fb-choice" data-g="diff">Adapté</div>
            <div class="fb-choice" data-g="diff">Un peu difficile</div>
            <div class="fb-choice" data-g="diff">Trop difficile</div>
          </div>
        </div>
        <div class="fb-question">
          <label>4. Un commentaire ou une suggestion ? <span style="color:#4a6070;font-weight:400">(facultatif)</span></label>
          <textarea class="fb-textarea" id="fb-commentaire" placeholder="Ce que vous avez aimé, ce qui manque, une erreur repérée..."></textarea>
        </div>
        <div class="fb-actions">
          <button class="fb-btn-cancel" onclick="praxisFbClose()">Annuler</button>
          <button class="fb-btn-send" onclick="praxisFbEnvoyer()">Envoyer mon avis →</button>
        </div>
      </div>

      <div id="praxis-fb-thanks">
        <span class="thanks-icon">🎉</span>
        <div class="thanks-title">Merci !</div>
        <div class="thanks-sub">Votre retour aide à améliorer PraxisCare.</div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  // ── Logique étoiles ──
  var note = 0;
  var stars = overlay.querySelectorAll('.fb-star');
  stars.forEach(function(s){
    s.addEventListener('click', function(){
      note = parseInt(s.getAttribute('data-v'));
      stars.forEach(function(st, i){ st.classList.toggle('active', i < note); });
    });
  });

  overlay.addEventListener('click', function(e){
    var choice = e.target.closest('.fb-choice');
    if(!choice) return;
    var group = choice.getAttribute('data-g');
    if(group === 'diff'){
      overlay.querySelectorAll('[data-g="diff"]').forEach(function(c){c.classList.remove('sel');});
      choice.classList.add('sel');
    } else {
      choice.classList.toggle('sel');
    }
  });

  btn.addEventListener('click', function(){
    overlay.classList.add('open');
  });
  overlay.addEventListener('click', function(e){
    if(e.target === overlay) praxisFbClose();
  });

  window.praxisFbClose = function(){
    overlay.classList.remove('open');
    note = 0;
    stars.forEach(function(s){s.classList.remove('active');});
    overlay.querySelectorAll('.fb-choice').forEach(function(c){c.classList.remove('sel');});
    document.getElementById('fb-commentaire').value = '';
    document.getElementById('praxis-fb-form').style.display = 'block';
    document.getElementById('praxis-fb-thanks').style.display = 'none';
  };

  // ── Envoyer un avis vers Supabase ──
  window.praxisFbEnvoyer = function(){
    var aide = [];
    overlay.querySelectorAll('[data-g="aide"].sel').forEach(function(c){aide.push(c.textContent);});
    var diff = '';
    var diffEl = overlay.querySelector('[data-g="diff"].sel');
    if(diffEl) diff = diffEl.textContent;
    var commentaire = document.getElementById('fb-commentaire').value.trim();

    var payload = {
      app: APP_NOM, module: MODULE_NOM, code: CODE, promo: PROMO,
      note: note || null, aide: aide, difficulte: diff || null, commentaire: commentaire || null,
    };

    fetch(SUPABASE_URL + '/rest/v1/avis', {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON,
        'Authorization': 'Bearer ' + SUPABASE_ANON,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify(payload),
    }).catch(function(){ /* échec silencieux, pas de blocage pour l'étudiant */ });

    document.getElementById('praxis-fb-form').style.display = 'none';
    document.getElementById('praxis-fb-thanks').style.display = 'block';
    setTimeout(function(){ praxisFbClose(); }, 2500);
  };

  // ── Vérifier s'il existe une réponse du formateur non encore vue ──
  function verifierReponses(){
    if(CODE === 'inconnu') return;
    var url = SUPABASE_URL + '/rest/v1/avis?code=eq.' + encodeURIComponent(CODE)
      + '&app=eq.' + encodeURIComponent(APP_NOM)
      + '&reponse=not.is.null&select=id,module,reponse,reponse_at,commentaire';
    fetch(url, { headers: { 'apikey': SUPABASE_ANON, 'Authorization': 'Bearer ' + SUPABASE_ANON } })
      .then(function(r){ return r.ok ? r.json() : []; })
      .then(function(rows){
        var vues = JSON.parse(localStorage.getItem('praxis_reponses_vues') || '[]');
        var nonVues = rows.filter(function(r){ return vues.indexOf(r.id) === -1; });
        if(nonVues.length > 0){
          btn.innerHTML = '💬 Avis <span class="fb-dot"></span>';
          var zone = document.getElementById('fb-reponses-zone');
          zone.innerHTML = nonVues.map(function(r){
            return '<div class="fb-reponse-box"><div class="fb-reponse-titre">💬 Réponse du formateur — ' + r.module + '</div><div class="fb-reponse-texte">' + r.reponse.replace(/</g,'&lt;') + '</div></div>';
          }).join('');
          btn.addEventListener('click', function marquer(){
            var dejaVues = JSON.parse(localStorage.getItem('praxis_reponses_vues') || '[]');
            nonVues.forEach(function(r){ if(dejaVues.indexOf(r.id)===-1) dejaVues.push(r.id); });
            localStorage.setItem('praxis_reponses_vues', JSON.stringify(dejaVues));
            btn.innerHTML = '💬 Avis';
            btn.removeEventListener('click', marquer);
          }, { once: true });
        }
      })
      .catch(function(){ /* pas de connexion, on ignore silencieusement */ });
  }
  verifierReponses();

})();
     
   
