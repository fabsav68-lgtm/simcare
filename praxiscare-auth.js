/**
 * praxiscare AUTH CHECK
 * À inclure dans chaque module HTML avant le tag </body>
 *
 * Usage dans un module :
 * <script src="praxiscare-auth.js"></script>
 * <script>
 *   PraxisCareAuth.init('simo2');  // id du module
 * </script>
 */

const PraxisCareAuth = (() => {

  // ── CONFIG ──────────────────────────────────────────────
  // Remplacer par vos valeurs Supabase
  const SUPABASE_URL  = 'VOTRE_PROJECT_URL';
  const SUPABASE_ANON = 'VOTRE_ANON_PUBLIC_KEY';

  // ── ÉTAT ──────────────────────────────────────────────
  let _user        = null;
  let _premium     = false;
  let _moduleId    = null;
  let _sb          = null;

  // ── INIT ──────────────────────────────────────────────
  async function init(moduleId) {
    _moduleId = moduleId;

    // Charger Supabase si pas déjà fait
    if (typeof supabase === 'undefined') {
      await loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2');
    }
    _sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

    // Vérifier la session
    const { data: { session } } = await _sb.auth.getSession();

    if (session?.user) {
      _user = session.user;
      _premium = await checkPremium(session.user.id);
      localStorage.setItem('praxiscare_premium', _premium ? '1' : '0');
      localStorage.setItem('praxiscare_jwt',     session.access_token);
    } else {
      // Fallback localStorage (si déjà connecté sur auth.html)
      _premium = localStorage.getItem('praxiscare_premium') === '1';
    }

    injectStatusBar();
    return { user: _user, premium: _premium };
  }

  // ── VÉRIFIER STATUT PREMIUM ──────────────────────────
  async function checkPremium(userId) {
    const { data } = await _sb
      .from('subscriptions')
      .select('plan, status')
      .eq('user_id', userId)
      .single();

    if (!data) return false;
    return data.status === 'active' &&
      ['monthly', 'annual', 'institution', 'lifetime'].includes(data.plan);
  }

  // ── VÉRIFIER ACCÈS IA ────────────────────────────────
  // Appeler avant chaque analyse IA dans un module
  async function canUseAI() {
    // Rafraîchir le statut premium depuis Supabase
    if (_user) {
      _premium = await checkPremium(_user.id);
    }
    return _premium;
  }

  // ── APPEL API CLAUDE SÉCURISÉ ────────────────────────
  // Remplace l'appel direct dans les modules
  async function callClaude(prompt, maxTokens = 900) {
    if (!await canUseAI()) {
      return { error: 'premium_required', message: 'Abonnement Premium requis.' };
    }

    // Récupérer le JWT frais
    const { data: { session } } = await _sb.auth.getSession();
    if (!session) {
      return { error: 'not_authenticated', message: 'Connectez-vous pour utiliser l\'analyse IA.' };
    }

    try {
      // Appel via proxy sécurisé (à créer à l'étape 4)
      // Pour l'instant : appel direct avec clé masquée côté proxy
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-praxiscare-token': session.access_token, // Vérifié côté proxy
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: maxTokens,
          messages: [{ role: 'user', content: prompt }]
        })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);

      // Logger l'usage
      await logUsage(session.user.id, data.usage?.input_tokens + data.usage?.output_tokens || 0);

      return { text: data.content?.find(b => b.type === 'text')?.text || '' };

    } catch (err) {
      return { error: 'api_error', message: err.message };
    }
  }

  // ── LOGGER L'USAGE IA ────────────────────────────────
  async function logUsage(userId, tokens) {
    if (!_sb || !userId) return;
    await _sb.from('ai_usage').insert({
      user_id:     userId,
      module_id:   _moduleId,
      tokens_used: tokens
    });
  }

  // ── BARRE DE STATUT ──────────────────────────────────
  function injectStatusBar() {
    const bar = document.createElement('div');
    bar.id = 'praxiscare-status-bar';
    bar.style.cssText = `
      position: fixed;
      top: 0; left: 0; right: 0;
      height: 3px;
      background: ${_premium
        ? 'linear-gradient(90deg, #c8922a, #e8b040)'
        : 'rgba(0,0,0,.15)'};
      z-index: 9999;
    `;

    // Bouton discret en haut à droite
    const btn = document.createElement('div');
    btn.style.cssText = `
      position: fixed;
      top: 8px; right: 12px;
      font-family: 'DM Mono', monospace;
      font-size: 10px;
      letter-spacing: 1px;
      padding: 3px 10px;
      border-radius: 20px;
      z-index: 9999;
      cursor: pointer;
      background: ${_premium ? 'rgba(200,146,42,.15)' : 'rgba(0,0,0,.08)'};
      color: ${_premium ? '#a07018' : '#888'};
      border: 1px solid ${_premium ? 'rgba(200,146,42,.3)' : 'rgba(0,0,0,.12)'};
    `;
    btn.textContent = _user
      ? (_premium ? '⭐ Premium' : '→ S\'abonner')
      : '→ Connexion';
    btn.onclick = () => window.location.href = 'auth.html';

    document.body.appendChild(bar);
    document.body.appendChild(btn);
  }

  // ── UTILITAIRE ───────────────────────────────────────
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  // ── ÉCRAN UPGRADE ────────────────────────────────────
  function showUpgradeScreen(container) {
    container.innerHTML = `
    <div style="
      background: rgba(200,146,42,.06);
      border: 1.5px solid rgba(200,146,42,.2);
      border-radius: 10px;
      padding: 24px;
      text-align: center;
      margin-top: 16px;
    ">
      <div style="font-size: 32px; margin-bottom: 12px">🔒</div>
      <div style="font-family:'DM Sans',sans-serif;font-size:17px;font-weight:700;margin-bottom:8px">
        Analyse IA — Accès Premium
      </div>
      <div style="font-size:13px;color:#888;margin-bottom:18px;line-height:1.65">
        Tous les modules PraxisCare sont gratuits.<br>
        L'analyse IA est réservée aux abonnés.
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">
        <div style="border:1.5px solid rgba(200,146,42,.3);border-radius:8px;padding:14px;background:rgba(200,146,42,.07)">
          <div style="font-size:22px;font-weight:700;color:#c8922a">1,99€</div>
          <div style="font-size:11px;color:#888;margin-top:3px">par mois</div>
        </div>
        <div style="border:1.5px solid rgba(200,146,42,.5);border-radius:8px;padding:14px;background:rgba(200,146,42,.1)">
          <div style="font-size:22px;font-weight:700;color:#c8922a">14,99€</div>
          <div style="font-size:11px;color:#888;margin-top:3px">par an — économisez 60%</div>
        </div>
      </div>
      <a href="auth.html" style="
        display:block;padding:12px;border-radius:8px;
        background:linear-gradient(135deg,#a07018,#c8922a);
        color:white;font-weight:700;font-size:14px;text-decoration:none;
      ">S'abonner maintenant →</a>
      <div style="font-size:11px;color:#aaa;margin-top:10px">
        Résiliable à tout moment · Paiement sécurisé Stripe
      </div>
    </div>`;
  }

  // ── API PUBLIQUE ─────────────────────────────────────
  return { init, canUseAI, callClaude, showUpgradeScreen, get user() { return _user; }, get premium() { return _premium; } };

})();
