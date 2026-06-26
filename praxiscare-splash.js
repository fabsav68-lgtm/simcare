// ═══════════════════════════════════════════════════════
//  PRAXISCARE — Système de Splash Cinématique
//  Style inspiré de Up (Pixar) : situation → tension → question
//  Une micro-histoire par module · 5 secondes · bouton Passer
//
//  Usage : <script src="praxiscare-splash.js"></script>
//  Le script détecte automatiquement le module via document.title
// ═══════════════════════════════════════════════════════

(function(){

// ── MICRO-HISTOIRES PAR MODULE ──────────────────────────
var HISTOIRES = {

  // Détection par mots-clés dans document.title ou id passé manuellement
  'o2': {
    icon: '🫁',
    couleur: '#38bdf8',
    scenes: [
      { texte: '3h du matin.', sous: 'Chambre 14.' },
      { texte: 'M. Bertrand, 71 ans.', sous: 'BPCO. Il dort encore.' },
      { texte: 'SpO₂ : 88%.', sous: 'Vous avez 30 secondes.' },
      { texte: 'Quelle FiO₂\npour lui ?', sous: '', question: true },
    ]
  },

  'perf': {
    icon: '💉',
    couleur: '#d4a853',
    scenes: [
      { texte: 'La poche de 500 mL\nvient d\'être posée.', sous: '' },
      { texte: 'Prescription : 125 mL/h.', sous: 'Pas de pompe.' },
      { texte: 'Vous regardez\nle perfuseur.', sous: '' },
      { texte: 'Combien de gouttes\npar minute ?', sous: '', question: true },
    ]
  },

  'gluco': {
    icon: '🩸',
    couleur: '#5ecb7a',
    scenes: [
      { texte: 'Mme Chen, 58 ans.', sous: 'Diabétique.' },
      { texte: 'Glycémie : 0,42 g/L.', sous: 'Consciente. Elle vous regarde.' },
      { texte: 'Son insuline a été\ninjectée il y a 2h.', sous: '' },
      { texte: 'Que faites-vous\nmaintenant ?', sous: '', question: true },
    ]
  },

  'contention': {
    icon: '🩺',
    couleur: '#b8a0e8',
    scenes: [
      { texte: 'M. Dupont, 83 ans.', sous: 'Post-AVC.' },
      { texte: 'Il glisse vers le bas\ndu lit depuis ce matin.', sous: '' },
      { texte: 'Mollets rouges.\nLe médecin demande une éval.', sous: '' },
      { texte: 'Quelle contention,\npour quel risque ?', sous: '', question: true },
    ]
  },

  'almanach': {
    icon: '📰',
    couleur: '#c0392b',
    scenes: [
      { texte: 'Pause café.\nUne collègue parle.', sous: '' },
      { texte: 'Nouveau décret.\nÉtude Cochrane publiée hier.', sous: '' },
      { texte: 'Vous n\'en avez\npas entendu parler.', sous: '' },
      { texte: 'Le soignant qui sait\nsoigne mieux.', sous: '', question: true },
    ]
  },

  'douleur': {
    icon: '🌡️',
    couleur: '#e8604a',
    scenes: [
      { texte: 'Lucas, 7 ans.', sous: 'Appendicite.' },
      { texte: '"Ça va"\ndisait-il. Il ne bouge plus.', sous: '' },
      { texte: 'L\'échelle EN\nest inutilisable.', sous: 'Sa mère vous supplie du regard.' },
      { texte: 'Comment évaluer\nsa douleur ?', sous: '', question: true },
    ]
  },

  'constantes': {
    icon: '📊',
    couleur: '#40b0f8',
    scenes: [
      { texte: 'Première journée\nde stage.', sous: '' },
      { texte: 'FC 110. PA 88/54.\nFR 24.', sous: '' },
      { texte: 'L\'infirmière attend\nvotre interprétation.', sous: '' },
      { texte: 'Ces constantes\nvous parlent-elles ?', sous: '', question: true },
    ]
  },

  'revision': {
    icon: '📚',
    couleur: '#a060ff',
    scenes: [
      { texte: 'Dans 3 semaines :\nles écrits.', sous: '' },
      { texte: '47 pages. 3 UE.\n12 compétences.', sous: '' },
      { texte: 'Il est 23h.', sous: '' },
      { texte: 'Par où\ncommencer ?', sous: '', question: true },
    ]
  },

  'environnement': {
    icon: '🌿',
    couleur: '#7ecb50',
    scenes: [
      { texte: 'Un patient revient\npour la 3ème fois.', sous: '' },
      { texte: 'Asthme. Même quartier.\nMême saison.', sous: '' },
      { texte: 'Vous pensez\nà son appartement.', sous: 'À l\'air qu\'il respire dehors.' },
      { texte: 'Et si le problème\nn\'était pas lui ?', sous: '', question: true },
    ]
  },

  'consultation': {
    icon: '📋',
    couleur: '#d4a853',
    scenes: [
      { texte: 'Mme Favre, 64 ans.', sous: 'Sort de l\'hôpital.' },
      { texte: 'Cinq médicaments.\nUn régime. Un suivi.', sous: 'Elle est seule chez elle.' },
      { texte: 'Vous avez\n20 minutes.', sous: '' },
      { texte: 'Que cherchez-vous\nà savoir en premier ?', sous: '', question: true },
    ]
  },

  'psy': {
    icon: '🧠',
    couleur: '#9b8fd4',
    scenes: [
      { texte: 'M. Karim, 34 ans.', sous: 'Agité en salle d\'attente.' },
      { texte: 'Il parle fort.\nIl pleure. Il rit.', sous: 'Les autres patients s\'écartent.' },
      { texte: 'Vous êtes seule.', sous: '' },
      { texte: 'Comment approcher\nsans braquer ?', sous: '', question: true },
    ]
  },

  'pediatrie': {
    icon: '👶',
    couleur: '#4cb8e8',
    scenes: [
      { texte: 'Théo, 18 mois.', sous: 'Fièvre à 39,8°C.' },
      { texte: 'Il crie. Refuse\nle thermomètre.', sous: 'Sa mère est épuisée.' },
      { texte: 'Le médecin\nn\'est pas encore là.', sous: '' },
      { texte: 'Normes, évaluation,\net après ?', sous: '', question: true },
    ]
  },

  'taca-theorie': {
    icon: '📖',
    couleur: '#58a6ff',
    scenes: [
      { texte: 'Semestre 3.', sous: '70 heures de travail autonome.' },
      { texte: 'Personne ne vous\ndit quoi faire.', sous: 'Personne ne vérifie.' },
      { texte: 'Juste vous,\nvotre agenda et vos objectifs.', sous: '' },
      { texte: 'Comment transformer\nce temps en compétence ?', sous: '', question: true },
    ]
  },

  'taca-stage': {
    icon: '🏥',
    couleur: '#3fb950',
    scenes: [
      { texte: 'Mi-stage.', sous: 'L\'infirmière référente vous regarde.' },
      { texte: '"Racontez-moi une situation\nqui vous a marquée."', sous: '' },
      { texte: 'Vous pensez à mardi matin.', sous: 'M. Girard. La chute. La famille.' },
      { texte: 'Comment en faire\nun apprentissage ?', sous: '', question: true },
    ]
  },

  'lead': {
    icon: '⚡',
    couleur: '#f0a030',
    scenes: [
      { texte: 'Urgence.', sous: 'Trois soignants autour du lit.' },
      { texte: 'Tout le monde\nfait quelque chose.', sous: 'Personne ne coordonne.' },
      { texte: 'Le médecin\nn\'est pas encore arrivé.', sous: '' },
      { texte: 'Qui prend la parole\nen premier ?', sous: '', question: true },
    ]
  },

  'pico': {
    icon: '🔬',
    couleur: '#00c8a0',
    scenes: [
      { texte: 'Votre infirmière référente\nvous pose la question.', sous: '' },
      { texte: '"Pourquoi on fait comme ça\net pas autrement ?"', sous: '' },
      { texte: 'Vous cherchez\ndans vos cours.', sous: 'Rien de récent. Rien de sourcé.' },
      { texte: 'Comment chercher\nla bonne réponse ?', sous: '', question: true },
    ]
  },

  'prevention': {
    icon: '🏡',
    couleur: '#e8a840',
    scenes: [
      { texte: 'Mme Torres, 72 ans.', sous: 'Consultation de suivi.' },
      { texte: 'Tension. Cholestérol.\nVaccins à jour.', sous: '' },
      { texte: 'Elle repart\navec ses ordonnances.', sous: 'Personne ne lui a demandé comment elle mange.' },
      { texte: 'La prévention\ncommence où ?', sous: '', question: true },
    ]
  },

  'numerique': {
    icon: '💻',
    couleur: '#38c8ff',
    scenes: [
      { texte: 'Vous ouvrez\nle dossier patient.', sous: '' },
      { texte: 'Trois logiciels différents.\nDonnées éparpillées.', sous: '' },
      { texte: 'Une alerte médicament\nclignote.', sous: 'A-t-elle déjà été vue ?' },
      { texte: 'Le numérique,\nallié ou obstacle ?', sous: '', question: true },
    ]
  },

  'ipa': {
    icon: '🎓',
    couleur: '#c8a060',
    scenes: [
      { texte: 'Vous êtes en S6.', sous: 'Dans 6 mois, diplômée.' },
      { texte: 'Une collègue parle\nde Master IPA.', sous: 'Une autre dit que ça ne sert à rien.' },
      { texte: 'Vous ne savez pas\nce que c\'est vraiment.', sous: '' },
      { texte: 'Jusqu\'où peut aller\nune infirmière ?', sous: '', question: true },
    ]
  },

  'urgences': {
    icon: '🚨',
    couleur: '#e83030',
    scenes: [
      { texte: 'Sonnerie.\nChambre 8.', sous: '' },
      { texte: 'M. Simon, 67 ans.\nNe répond plus.', sous: '' },
      { texte: 'Pas de pouls.\nPas de respiration.', sous: 'Vous êtes seule. Il est 6h12.' },
      { texte: 'Les prochaines\n4 minutes comptent.', sous: '', question: true },
    ]
  },
};

// ── DÉTECTION DU MODULE ──────────────────────────────────
function detecterModule(){
  var title = (document.title || '').toLowerCase();
  var url   = (window.location.href || '').toLowerCase();
  var combined = title + ' ' + url;

  if(/taca.*stage|stage.*taca/.test(combined)) return 'taca-stage';
  if(/taca.*th[eé]orie|th[eé]orie.*taca|taca/.test(combined)) return 'taca-theorie';
  if(/o2|oxyg/.test(combined))           return 'o2';
  if(/perf|perfusion/.test(combined))    return 'perf';
  if(/gluco|glyc/.test(combined))        return 'gluco';
  if(/contention/.test(combined))        return 'contention';
  if(/almanach/.test(combined))          return 'almanach';
  if(/douleur/.test(combined))           return 'douleur';
  if(/constante/.test(combined))         return 'constantes';
  if(/r[eé]vision/.test(combined))       return 'revision';
  if(/environnement/.test(combined))     return 'environnement';
  if(/consultation/.test(combined))      return 'consultation';
  if(/psy/.test(combined))               return 'psy';
  if(/p[eé]diatrie/.test(combined))      return 'pediatrie';
  if(/lead/.test(combined))              return 'lead';
  if(/pico/.test(combined))              return 'pico';
  if(/pr[eé]vention/.test(combined))     return 'prevention';
  if(/num[eé]rique/.test(combined))      return 'numerique';
  if(/ipa/.test(combined))               return 'ipa';
  if(/urgence/.test(combined))           return 'urgences';
  return null;
}

// ── CSS INJECTÉ ──────────────────────────────────────────
function injecterCSS(){
  var style = document.createElement('style');
  style.textContent = `
    #praxis-splash {
      position: fixed;
      inset: 0;
      z-index: 9999;
      background: #04090f;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 32px 24px;
      font-family: 'Georgia', 'Times New Roman', serif;
      overflow: hidden;
    }

    #praxis-splash::before {
      content: '';
      position: absolute;
      inset: 0;
      background:
        repeating-linear-gradient(0deg, rgba(255,255,255,.012) 0, rgba(255,255,255,.012) 1px, transparent 1px, transparent 60px),
        repeating-linear-gradient(90deg, rgba(255,255,255,.012) 0, rgba(255,255,255,.012) 1px, transparent 1px, transparent 60px);
      pointer-events: none;
    }

    .splash-icon {
      font-size: 64px;
      display: block;
      margin-bottom: 32px;
      opacity: 0;
      transform: scale(0.8);
      transition: opacity .6s ease, transform .6s ease;
    }
    .splash-icon.show {
      opacity: 1;
      transform: scale(1);
    }

    .splash-scene {
      text-align: center;
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 28px;
      opacity: 0;
      transition: opacity .5s ease;
      pointer-events: none;
    }
    .splash-scene.active {
      opacity: 1;
      pointer-events: auto;
    }

    .splash-texte {
      font-size: clamp(22px, 5vw, 32px);
      font-weight: 400;
      color: #e8edf2;
      line-height: 1.45;
      text-align: center;
      white-space: pre-line;
      letter-spacing: -0.3px;
      margin-bottom: 12px;
      font-style: italic;
    }
    .splash-texte.question {
      font-style: normal;
      font-weight: 700;
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      letter-spacing: -0.5px;
    }

    .splash-sous {
      font-size: 14px;
      color: #304050;
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-style: normal;
      letter-spacing: 0.5px;
      text-align: center;
      line-height: 1.6;
    }

    .splash-progress {
      position: absolute;
      bottom: 0;
      left: 0;
      height: 3px;
      background: var(--splash-color, #38bdf8);
      width: 0;
      transition: width linear;
      opacity: 0.7;
    }

    .splash-passer {
      position: absolute;
      top: 16px;
      right: 16px;
      background: rgba(255,255,255,.05);
      border: 1px solid rgba(255,255,255,.1);
      border-radius: 20px;
      padding: 6px 14px;
      font-size: 11px;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #304050;
      cursor: pointer;
      font-family: 'Fira Mono', 'Courier New', monospace;
      transition: color .2s, border-color .2s;
      -webkit-tap-highlight-color: transparent;
    }
    .splash-passer:hover { color: #e8edf2; border-color: rgba(255,255,255,.25); }

    .splash-commencer {
      position: absolute;
      bottom: 32px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--splash-color, #38bdf8);
      border: none;
      border-radius: 30px;
      padding: 14px 36px;
      font-size: 14px;
      font-weight: 700;
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      letter-spacing: -0.3px;
      color: #04090f;
      cursor: pointer;
      opacity: 0;
      transition: opacity .4s ease, transform .2s ease;
      -webkit-tap-highlight-color: transparent;
      white-space: nowrap;
    }
    .splash-commencer.show {
      opacity: 1;
    }
    .splash-commencer:hover { transform: translateX(-50%) translateY(-2px); }
    .splash-commencer:active { transform: translateX(-50%) scale(.97); }

    .splash-points {
      position: absolute;
      bottom: 90px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 8px;
      opacity: 0;
      transition: opacity .4s;
    }
    .splash-points.show { opacity: 1; }
    .splash-point {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: rgba(255,255,255,.15);
      transition: background .3s;
    }
    .splash-point.active { background: var(--splash-color, #38bdf8); }

    #praxis-splash.fade-out {
      opacity: 0;
      transition: opacity .5s ease;
    }
  `;
  document.head.appendChild(style);
}

// ── LANCER LE SPLASH ─────────────────────────────────────
function lancerSplash(moduleKey){
  var histoire = HISTOIRES[moduleKey];
  if(!histoire) return;

  injecterCSS();

  var couleur = histoire.couleur;
  var scenes  = histoire.scenes;

  // Créer le conteneur
  var el = document.createElement('div');
  el.id = 'praxis-splash';
  el.style.setProperty('--splash-color', couleur);

  // Bouton passer
  var btnPasser = document.createElement('button');
  btnPasser.className = 'splash-passer';
  btnPasser.textContent = 'Passer →';
  btnPasser.onclick = fermer;
  el.appendChild(btnPasser);

  // Créer les scènes
  var sceneEls = scenes.map(function(scene, i){
    var div = document.createElement('div');
    div.className = 'splash-scene';

    var p = document.createElement('p');
    p.className = 'splash-texte' + (scene.question ? ' question' : '');
    p.style.color = scene.question ? couleur : '#e8edf2';
    p.textContent = scene.texte;
    div.appendChild(p);

    if(scene.sous){
      var s = document.createElement('p');
      s.className = 'splash-sous';
      s.textContent = scene.sous;
      div.appendChild(s);
    }
    return div;
  });
  sceneEls.forEach(function(s){ el.appendChild(s); });

  // Points de navigation
  var pointsWrap = document.createElement('div');
  pointsWrap.className = 'splash-points';
  var pointEls = scenes.map(function(_, i){
    var d = document.createElement('div');
    d.className = 'splash-point';
    return d;
  });
  pointEls.forEach(function(p){ pointsWrap.appendChild(p); });
  el.appendChild(pointsWrap);

  // Bouton commencer (dernière scène)
  var btnCommencer = document.createElement('button');
  btnCommencer.className = 'splash-commencer';
  btnCommencer.textContent = 'Commencer →';
  btnCommencer.onclick = fermer;
  el.appendChild(btnCommencer);

  // Barre de progression
  var progress = document.createElement('div');
  progress.className = 'splash-progress';
  el.appendChild(progress);

  document.body.appendChild(el);

  // ── SÉQUENCEMENT ──
  var sceneIdx = 0;
  var DUREE_SCENE = 1500; // ms par scène
  var DUREE_TOTAL = scenes.length * DUREE_SCENE;
  var timer;

  function afficherScene(idx){
    sceneEls.forEach(function(s, i){
      s.classList.toggle('active', i === idx);
    });
    pointEls.forEach(function(p, i){
      p.classList.toggle('active', i === idx);
    });
    pointsWrap.classList.add('show');

    // Dernière scène → montrer bouton commencer
    if(idx === scenes.length - 1){
      btnCommencer.classList.add('show');
      btnPasser.style.display = 'none';
    }
  }

  function avancer(){
    if(sceneIdx < scenes.length){
      afficherScene(sceneIdx);
      sceneIdx++;
      if(sceneIdx < scenes.length){
        timer = setTimeout(avancer, DUREE_SCENE);
      }
    }
  }

  function fermer(){
    clearTimeout(timer);
    el.classList.add('fade-out');
    setTimeout(function(){ el.remove(); }, 500);
  }

  // Barre progression
  progress.style.transition = 'width ' + DUREE_TOTAL + 'ms linear';
  setTimeout(function(){ progress.style.width = '100%'; }, 50);

  // Démarrer
  avancer();

  // Auto-fermeture si pas d'interaction (après toutes les scènes + 2s)
  setTimeout(function(){
    if(document.getElementById('praxis-splash')){
      fermer();
    }
  }, DUREE_TOTAL + 2000);
}

// ── INIT ─────────────────────────────────────────────────
function init(){
  // Ne pas afficher si l'étudiant revient (sessionStorage)
  var cle = 'splash_' + window.location.pathname;
  if(sessionStorage.getItem(cle)) return;
  sessionStorage.setItem(cle, '1');

  var moduleKey = detecterModule();
  if(!moduleKey) return;

  // Attendre que le DOM soit prêt
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){ lancerSplash(moduleKey); });
  } else {
    lancerSplash(moduleKey);
  }
}

init();

})();
