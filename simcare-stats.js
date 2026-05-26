/**
 * ═══════════════════════════════════════════════════════
 *  SIMCARE STATS — Couche de tracking pédagogique
 *  v1.0 · 2026 · fabsav68-lgtm.github.io/simcare
 * ═══════════════════════════════════════════════════════
 *
 *  INTÉGRATION dans un module HTML (3 lignes) :
 *  ─────────────────────────────────────────────
 *  <script src="simcare-stats.js"></script>
 *  <script>
 *    SimStats.init('simgluco');   // id du module
 *  </script>
 *
 *  USAGE dans le code du module :
 *  ─────────────────────────────
 *  SimStats.track('onglet', 'Prescription')
 *  SimStats.track('quiz', { q: 2, correct: true, ms: 8200 })
 *  SimStats.track('ia_question', { module: 'simgluco', chars: 142 })
 *  SimStats.track('scenario_etape', { etape: 3, label: 'Prescription' })
 *  SimStats.setStudent('Marie D.')   // si l'étudiant saisit son prénom
 * ═══════════════════════════════════════════════════════
 */

const SimStats = (() => {

  // ── CONFIG ──────────────────────────────────────────
  const VERSION    = '1.0';
  const LS_KEY     = 'simcare_stats_v1';
  const LS_STUDENT = 'simcare_student_id';
  const MAX_EVENTS = 2000;     // Max events stockés localement

  // Supabase (optionnel — rempli si disponible)
  const SUPABASE_URL  = 'VOTRE_PROJECT_URL';
  const SUPABASE_ANON = 'VOTRE_ANON_PUBLIC_KEY';

  // ── ÉTAT INTERNE ─────────────────────────────────────
  let _moduleId    = null;
  let _sessionId   = null;
  let _studentId   = null;
  let _startTime   = null;
  let _lastOnglet  = null;
  let _ongletStart = null;
  let _initialized = false;
  let _sb          = null;

  // ── UTILITAIRES ──────────────────────────────────────
  function now()    { return Date.now(); }
  function ts()     { return new Date().toISOString(); }
  function uid()    { return Math.random().toString(36).slice(2, 10); }
  function device() {
    const ua = navigator.userAgent;
    if (/iPhone|iPad/.test(ua)) return 'ios';
    if (/Android/.test(ua))     return 'android';
    if (/Mac/.test(ua))         return 'mac';
    return 'desktop';
  }

  // ── STOCKAGE LOCAL ───────────────────────────────────
  function loadStore() {
    try { return JSON.parse(localStorage.getItem(LS_KEY)) || { sessions: [], events: [] }; }
    catch(e) { return { sessions: [], events: [] }; }
  }

  function saveStore(data) {
    try {
      // Limiter la taille
      if (data.events.length > MAX_EVENTS) {
        data.events = data.events.slice(-MAX_EVENTS);
      }
      localStorage.setItem(LS_KEY, JSON.stringify(data));
    } catch(e) {
      console.warn('[SimStats] localStorage full');
    }
  }

  function addEvent(type, payload = {}) {
    const store = loadStore();
    const event = {
      id:        uid(),
      session:   _sessionId,
      module:    _moduleId,
      student:   _studentId,
      type,
      payload,
      ts:        ts(),
      device:    device(),
    };
    store.events.push(event);
    saveStore(store);

    // Tenter d'envoyer à Supabase si disponible
    _sendToSupabase(event);

    return event;
  }

  // ── SUPABASE (OPTIONNEL) ─────────────────────────────
  async function _initSupabase() {
    if (SUPABASE_URL === 'VOTRE_PROJECT_URL') return;
    if (typeof supabase === 'undefined') return;
    try {
      _sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
    } catch(e) {}
  }

  async function _sendToSupabase(event) {
    if (!_sb) return;
    try {
      await _sb.from('stats_events').insert({
        session_id: event.session,
        module_id:  event.module,
        student_id: event.student,
        event_type: event.type,
        payload:    event.payload,
        device:     event.device,
        created_at: event.ts,
      });
    } catch(e) {}
  }

  async function _syncPending() {
    if (!_sb) return;
    const store = loadStore();
    const unsynced = store.events.filter(e => !e.synced);
    for (const event of unsynced.slice(-50)) { // Max 50 à la fois
      try {
        await _sb.from('stats_events').upsert({
          id:         event.id,
          session_id: event.session,
          module_id:  event.module,
          student_id: event.student,
          event_type: event.type,
          payload:    event.payload,
          device:     event.device,
          created_at: event.ts,
        });
        event.synced = true;
      } catch(e) { break; }
    }
    saveStore(store);
  }

  // ── API PUBLIQUE ─────────────────────────────────────

  /**
   * Initialiser le tracking pour un module
   * @param {string} moduleId — ex: 'simgluco', 'simuurgences'
   */
  function init(moduleId) {
    _moduleId   = moduleId;
    _sessionId  = uid();
    _startTime  = now();
    _studentId  = localStorage.getItem(LS_STUDENT) || null;
    _initialized = true;

    // Enregistrer la session
    const store = loadStore();
    store.sessions.push({
      id:       _sessionId,
      module:   _moduleId,
      student:  _studentId,
      start:    ts(),
      device:   device(),
      referrer: document.referrer || 'direct',
    });
    saveStore(store);

    // Event d'ouverture
    addEvent('module_open', {
      module:  _moduleId,
      url:     location.href,
      device:  device(),
    });

    // Tracker la durée de session à la fermeture
    window.addEventListener('beforeunload', _onClose);
    document.addEventListener('visibilitychange', _onVisibility);

    // Tenter sync Supabase
    _initSupabase().then(() => _syncPending());

    console.log(`[SimStats] Init · module=${moduleId} · session=${_sessionId}`);
  }

  /**
   * Définir l'identifiant étudiant
   * @param {string} name — prénom ou code
   */
  function setStudent(name) {
    _studentId = name;
    localStorage.setItem(LS_STUDENT, name);
    addEvent('student_identified', { name });
  }

  /**
   * Tracker un événement quelconque
   * @param {string} type — type d'événement
   * @param {object} payload — données associées
   */
  function track(type, payload = {}) {
    if (!_initialized) return;
    return addEvent(type, payload);
  }

  /**
   * Tracker un changement d'onglet / étape
   * Calcule automatiquement le temps passé sur l'onglet précédent
   */
  function trackOnglet(label) {
    if (!_initialized) return;

    // Temps passé sur l'onglet précédent
    if (_lastOnglet && _ongletStart) {
      const duree = Math.round((now() - _ongletStart) / 1000);
      addEvent('onglet_quitte', {
        onglet: _lastOnglet,
        duree_sec: duree,
      });
    }

    _lastOnglet  = label;
    _ongletStart = now();

    addEvent('onglet_ouvert', { onglet: label });
  }

  /**
   * Tracker une réponse au quiz
   */
  function trackQuiz(opts = {}) {
    addEvent('quiz_reponse', {
      module:   _moduleId,
      question: opts.question || 0,
      correct:  opts.correct  || false,
      temps_ms: opts.temps_ms || 0,
      annee:    opts.annee    || null,
    });
  }

  /**
   * Tracker une question posée à l'IA
   */
  function trackIA(opts = {}) {
    addEvent('ia_question', {
      module:      _moduleId,
      chars_input: opts.chars || 0,
      premium:     opts.premium || false,
    });
  }

  /**
   * Tracker la complétion d'un module
   */
  function trackComplete(opts = {}) {
    const duree = Math.round((now() - _startTime) / 1000);
    addEvent('module_complete', {
      module:    _moduleId,
      duree_sec: duree,
      score:     opts.score || null,
      total:     opts.total || null,
    });
  }

  // ── ÉVÉNEMENTS SYSTÈME ───────────────────────────────
  function _onClose() {
    const duree = Math.round((now() - _startTime) / 1000);
    // Utiliser sendBeacon pour être sûr que l'event part
    const event = {
      id:      uid(),
      session: _sessionId,
      module:  _moduleId,
      student: _studentId,
      type:    'module_close',
      payload: { duree_sec: duree },
      ts:      ts(),
      device:  device(),
    };
    const store = loadStore();
    store.events.push(event);
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(store));
    } catch(e) {}
  }

  function _onVisibility() {
    if (document.hidden) {
      addEvent('tab_hidden', { duree_sec: Math.round((now() - _startTime) / 1000) });
    } else {
      addEvent('tab_visible', {});
    }
  }

  // ── LECTURE DES DONNÉES ──────────────────────────────

  /**
   * Obtenir toutes les données brutes (pour le dashboard)
   */
  function getData() {
    return loadStore();
  }

  /**
   * Calculer les statistiques agrégées
   */
  function getStats() {
    const store = loadStore();
    const events   = store.events;
    const sessions = store.sessions;

    // Sessions par module
    const byModule = {};
    sessions.forEach(s => {
      if (!byModule[s.module]) byModule[s.module] = { sessions: 0, students: new Set() };
      byModule[s.module].sessions++;
      if (s.student) byModule[s.module].students.add(s.student);
    });

    // Temps moyen par module
    const closedEvents = events.filter(e => e.type === 'module_close');
    const durByModule  = {};
    closedEvents.forEach(e => {
      if (!durByModule[e.module]) durByModule[e.module] = [];
      durByModule[e.module].push(e.payload.duree_sec || 0);
    });

    // Quiz stats
    const quizEvents = events.filter(e => e.type === 'quiz_reponse');
    const quizStats  = {
      total:    quizEvents.length,
      correct:  quizEvents.filter(e => e.payload.correct).length,
      avgTemps: quizEvents.length
        ? Math.round(quizEvents.reduce((s, e) => s + (e.payload.temps_ms || 0), 0) / quizEvents.length / 1000)
        : 0,
    };

    // IA stats
    const iaEvents = events.filter(e => e.type === 'ia_question');

    // Appareils
    const devices = {};
    sessions.forEach(s => { devices[s.device] = (devices[s.device] || 0) + 1; });

    // Étudiants uniques
    const allStudents = new Set(sessions.filter(s => s.student).map(s => s.student));

    return {
      totalSessions:   sessions.length,
      totalStudents:   allStudents.size,
      totalEvents:     events.length,
      totalIAQuestions: iaEvents.length,
      byModule,
      durByModule,
      quizStats,
      devices,
      students:        [...allStudents],
      firstSession:    sessions[0]?.start || null,
      lastSession:     sessions[sessions.length - 1]?.start || null,
    };
  }

  /**
   * Exporter en CSV
   */
  function exportCSV() {
    const store = loadStore();
    const rows  = [
      ['id', 'session', 'module', 'student', 'type', 'payload', 'ts', 'device'],
      ...store.events.map(e => [
        e.id, e.session, e.module || '', e.student || '',
        e.type, JSON.stringify(e.payload || {}), e.ts, e.device || '',
      ]),
    ];
    const csv  = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `simcare-stats-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Réinitialiser toutes les données (avec confirmation)
   */
  function reset(confirm = false) {
    if (!confirm) {
      console.warn('[SimStats] Passez reset(true) pour confirmer la suppression');
      return false;
    }
    localStorage.removeItem(LS_KEY);
    localStorage.removeItem(LS_STUDENT);
    console.log('[SimStats] Données supprimées');
    return true;
  }

  // ── EXPORT ───────────────────────────────────────────
  return {
    init,
    setStudent,
    track,
    trackOnglet,
    trackQuiz,
    trackIA,
    trackComplete,
    getData,
    getStats,
    exportCSV,
    reset,
    get sessionId() { return _sessionId; },
    get studentId()  { return _studentId; },
    get moduleId()   { return _moduleId;  },
  };

})();

// Rendre global
window.SimStats = SimStats;
