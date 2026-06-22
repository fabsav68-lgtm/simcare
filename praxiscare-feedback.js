// ═══════════════════════════════════════
//  PRAXISCARE — Widget Feedback
//  À inclure dans chaque module IFSI
//  <script src="praxiscare-feedback.js"></script>
// ═══════════════════════════════════════

(function(){
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
      border-top: 2px solid #38bdf8;
      animation: slideUp .3s ease;
    }
    @keyframes slideUp {
      from { transform: translateY(40px); opacity: 0; }
      to   { transform: translateY(0);   opacity: 1; }
    }

    #praxis-fb-panel h3 {
      font-family: 'Unbounded', sans-serif;
      font-size: 16px;
      font-weight: 700;
      letter-spacing: -0.5px;
      color: #38bdf8;
      margin-bottom: 4px;
    }
    #praxis-fb-panel .fb-sub {
      font-size: 12px;
      color: #2a3a45;
      margin-bottom: 20px;
      font-family: 'Fira Mono', monospace;
    }

    .fb-question { margin-bottom: 18px; }
    .fb-question label {
      display: block;
      font-size: 13px;
      font-weight: 600;
      color: #e8edf2;
      margin-bottom: 8px;
    }

    /* Étoiles */
    .fb-stars { display: flex; gap: 6px; margin-bottom: 4px; }
    .fb-star {
      font-size: 28px;
      cursor: pointer;
      opacity: .3;
      transition: opacity .15s, transform .1s;
      -webkit-tap-highlight-color: transparent;
    }
    .fb-star.active { opacity: 1; transform: scale(1.1); }
    .fb-star:hover  { opacity: .8; }

    /* Choix */
    .fb-choices { display: flex; flex-wrap: wrap; gap: 7px; }
    .fb-choice {
      padding: 7px 13px;
      border-radius: 20px;
      border: 1.5px solid rgba(255,255,255,.08);
      background: rgba(255,255,255,.03);
      font-size: 12px;
      color: #5a7080;
      cursor: pointer;
      transition: all .15s;
      -webkit-tap-highlight-color: transparent;
    }
    .fb-choice.sel {
      background: rgba(56,189,248,.1);
      border-color: rgba(56,189,248,.4);
      color: #38bdf8;
    }

    /* Textarea */
    .fb-textarea {
      width: 100%;
      min-height: 60px;
      background: rgba(0,0,0,.3);
      border: 1.5px solid rgba(255,255,255,.08);
      border-radius: 8px;
      color: #e8edf2;
      font-size: 13px;
      font-family: 'Karla', sans-serif;
      padding: 10px 12px;
      outline: none;
      resize: vertical;
      line-height: 1.6;
    }
    .fb-textarea:focus { border-color: rgba(56,189,248,.3); }
    .fb-textarea::placeholder { color: rgba(255,255,255,.15); }

    .fb-actions { display: flex; gap: 8px; margin-top: 18px; }
    .fb-btn-send {
      flex: 1;
      padding: 13px;
      border: none;
      border-radius: 8px;
      background: linear-gradient(135deg, #0d6a94, #38bdf8);
      color: #04090f;
      font-family: 'Unbounded', sans-serif;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      transition: opacity .2s;
      -webkit-tap-highlight-color: transparent;
    }
    .fb-btn-send:hover { opacity: .9; }
    .fb-btn-cancel {
      padding: 13px 16px;
      border: 1.5px solid rgba(255,255,255,.08);
      border-radius: 8px;
      background: transparent;
      color: #2a3a45;
      font-size: 12px;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }

    #praxis-fb-thanks {
      text-align: center;
      padding: 20px 0;
      display: none;
    }
    #praxis-fb-thanks .thanks-icon { font-size: 44px; display: block; margin-bottom: 12px; }
    #praxis-fb-thanks .thanks-title {
      font-family: 'Unbounded', sans-serif;
      font-size: 18px;
      font-weight: 800;
      color: #40c878;
      letter-spacing: -0.5px;
      margin-bottom: 6px;
    }
    #praxis-fb-thanks .thanks-sub { font-size: 13px; color: #2a3a45; }
  `;
  document.head.appendChild(style);

  // ── Détecter le module courant ──
  var MODULE_NOM = document.title
    .replace(' · SimVeto','').replace(' · SimCare IFSI','')
    .replace(' · PraxisVeto','').replace(' · PraxisCare','')
    .replace(' · CAFASV','').replace(' · IFSI','')
    .trim() || 'Module';

  // ── HTML ──
  var btn = document.createElement('button');
  btn.id = 'praxis-fb-btn';
  btn.textContent = '💬 Avis';
  document.body.appendChild(btn);

  var overlay = document.createElement('div');
  overlay.id = 'praxis-fb-overlay';
  overlay.innerHTML = `
    <div id="praxis-fb-panel">
      <h3>💬 Votre avis</h3>
      <div class="fb-sub">${MODULE_NOM} · Feedback étudiant</div>

      <div id="praxis-fb-form">
        <!-- Q1 : Note globale -->
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

        <!-- Q2 : Ce qui a aidé -->
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

        <!-- Q3 : Difficulté -->
        <div class="fb-question">
          <label>3. Niveau de difficulté perçu</label>
          <div class="fb-choices" id="fb-diff">
            <div class="fb-choice" data-g="diff">Trop facile</div>
            <div class="fb-choice" data-g="diff">Adapté</div>
            <div class="fb-choice" data-g="diff">Un peu difficile</div>
            <div class="fb-choice" data-g="diff">Trop difficile</div>
          </div>
        </div>

        <!-- Q4 : Commentaire libre -->
        <div class="fb-question">
          <label>4. Un commentaire ou une suggestion ? <span style="color:#2a3a45;font-weight:400">(facultatif)</span></label>
          <textarea class="fb-textarea" id="fb-commentaire" placeholder="Ce que vous avez aimé, ce qui manque, une erreur repérée..."></textarea>
        </div>

        <div class="fb-actions">
          <button class="fb-btn-cancel" onclick="praxisFbClose()">Annuler</button>
          <button class="fb-btn-send" onclick="praxisFbEnvoyer()">Envoyer mon avis →</button>
        </div>
      </div>

      <!-- Confirmation -->
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
      stars.forEach(function(st, i){
        st.classList.toggle('active', i < note);
      });
    });
  });

  // ── Logique choix multiples ──
  overlay.addEventListener('click', function(e){
    var choice = e.target.closest('.fb-choice');
    if(!choice) return;
    var group = choice.getAttribute('data-g');
    if(group === 'diff'){
      // Single select pour difficulté
      overlay.querySelectorAll('[data-g="diff"]').forEach(function(c){c.classList.remove('sel');});
      choice.classList.add('sel');
    } else {
      // Multi select pour aide
      choice.classList.toggle('sel');
    }
  });

  // ── Ouvrir / Fermer ──
  btn.addEventListener('click', function(){
    overlay.classList.add('open');
  });
  overlay.addEventListener('click', function(e){
    if(e.target === overlay) praxisFbClose();
  });

  window.praxisFbClose = function(){
    overlay.classList.remove('open');
    // Reset form
    note = 0;
    stars.forEach(function(s){s.classList.remove('active');});
    overlay.querySelectorAll('.fb-choice').forEach(function(c){c.classList.remove('sel');});
    document.getElementById('fb-commentaire').value = '';
    document.getElementById('praxis-fb-form').style.display = 'block';
    document.getElementById('praxis-fb-thanks').style.display = 'none';
  };

  // ── Envoyer ──
  window.praxisFbEnvoyer = function(){
    var aide = [];
    overlay.querySelectorAll('[data-g="aide"].sel').forEach(function(c){aide.push(c.textContent);});
    var diff = '';
    var diffEl = overlay.querySelector('[data-g="diff"].sel');
    if(diffEl) diff = diffEl.textContent;
    var commentaire = document.getElementById('fb-commentaire').value.trim();

    // Sauvegarder dans localStorage
    var stats = JSON.parse(localStorage.getItem('praxiscare_stats') || '{}');
    if(!stats.feedbacks) stats.feedbacks = [];
    stats.feedbacks.push({
      module: MODULE_NOM,
      date: new Date().toISOString().split('T')[0],
      heure: new Date().toLocaleTimeString('fr-FR'),
      code: sessionStorage.getItem('praxiscare_code') || 'inconnu',
      promo: sessionStorage.getItem('praxiscare_promo') || 'inconnue',
      note: note,
      aide: aide,
      difficulte: diff,
      commentaire: commentaire,
    });
    localStorage.setItem('praxiscare_stats', JSON.stringify(stats));

    // Afficher confirmation
    document.getElementById('praxis-fb-form').style.display = 'none';
    document.getElementById('praxis-fb-thanks').style.display = 'block';

    // Fermer après 2.5s
    setTimeout(function(){ praxisFbClose(); }, 2500);
  };

})();
