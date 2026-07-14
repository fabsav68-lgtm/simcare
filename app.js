let state={screen:"login",user:null,mission:null,qIndex:0,selected:null,showFeedback:false,score:0,qStart:null,sim:null,simIndex:0,simScore:0,chronomode:"libre",chronoRestant:null,chronoTimer:null};
const now=()=>new Date().toISOString(),load=(k,f)=>JSON.parse(localStorage.getItem(k)||JSON.stringify(f)),save=(k,d)=>localStorage.setItem(k,JSON.stringify(d));
const events=()=>load("praxis_events",[]),profile=()=>load("praxis_profile",{xp:0,streak:1,buddyMode:"none",buddyName:"",passport:{Observer:50,Analyser:50,Prioriser:50,Decider:50,"Se professionnaliser":50}});
const CHRONO_MODES={libre:{label:"Entrainement",duree:null,color:"#38bdf8"},concours:{label:"Concours",duree:90,color:"#e8a030"},express:{label:"Express",duree:45,color:"#e84040"}};

function addEvent(t,d={}){let e=events();e.push({id:"evt_"+Date.now(),at:now(),type:t,userCode:state.user?.code||null,role:state.user?.role||null,...d});save("praxis_events",e)}
function saveProfile(p){save("praxis_profile",p)}
function upd(cap,ok){let p=profile();p.passport[cap]=Math.max(0,Math.min(100,(p.passport[cap]||50)+(ok?4:-1)));saveProfile(p)}
function xp(n){let p=profile();p.xp+=n;saveProfile(p);addEvent("xp_awarded",{xp:n,total:p.xp})}
function tryLogin(){let code=document.getElementById("code").value.trim().toUpperCase(),u=ACCESS_CODES.find(x=>x.code===code&&x.active);if(!u){document.getElementById("loginError").innerText="Code invalide.";return}state.user=u;save("praxis_current_user",u);addEvent("login",{group:u.group});state.screen=u.role==="student"?"home":"admin";render()}
function logout(){addEvent("logout");localStorage.removeItem("praxis_current_user");state={screen:"login",user:null};render()}
function setScreen(s){state.screen=s;addEvent("screen_view",{screen:s});render()}
function qs(){return QUESTIONS.filter(q=>q.mission===state.mission)}

function setChronomode(mode){
  state.chronomode=mode;
  stopChrono();
  render();
}

function startChrono(){
  stopChrono();
  var mode=CHRONO_MODES[state.chronomode];
  if(!mode.duree) return;
  state.chronoRestant=mode.duree;
  state.chronoTimer=setInterval(function(){
    state.chronoRestant--;
    var el=document.getElementById("chrono-display");
    if(el){
      el.textContent=state.chronoRestant+"s";
      if(state.chronoRestant<=10) el.style.color="#e84040";
      else if(state.chronoRestant<=20) el.style.color="#e8a030";
    }
    if(state.chronoRestant<=0){
      stopChrono();
      if(!state.showFeedback) tempsEcoule();
    }
  },1000);
}

function stopChrono(){
  if(state.chronoTimer) clearInterval(state.chronoTimer);
  state.chronoTimer=null;
}

function tempsEcoule(){
  if(state.selected===null){
    var q=qs()[state.qIndex];
    upd(q.capability,false);
    addEvent("question_answer",{questionId:q.id,missionId:q.mission,capability:q.capability,selected:-1,correct:q.correct,isCorrect:false,timeSec:CHRONO_MODES[state.chronomode].duree,timeout:true});
    state.showFeedback=true;
    render();
  }
}

function startMission(id){
  state.mission=id;state.qIndex=0;state.selected=null;state.showFeedback=false;state.score=0;state.qStart=Date.now();
  addEvent("mission_start",{missionId:id,chronomode:state.chronomode});
  state.screen="quiz";
  render();
  if(!state.showFeedback) startChrono();
}

function selectAnswer(i){state.selected=i;render()}

function validateAnswer(){
  if(state.selected===null){alert("Choisissez une reponse.");return}
  stopChrono();
  var q=qs()[state.qIndex],ok=state.selected===q.correct;
  if(ok)state.score++;
  upd(q.capability,ok);
  var timeSec=Math.round((Date.now()-state.qStart)/1000);
  addEvent("question_answer",{questionId:q.id,missionId:q.mission,capability:q.capability,selected:state.selected,correct:q.correct,isCorrect:ok,timeSec:timeSec});
  state.showFeedback=true;
  render();
}

function nextQuestion(){
  stopChrono();
  state.qIndex++;state.selected=null;state.showFeedback=false;state.qStart=Date.now();
  if(state.qIndex>=qs().length){
    let pct=Math.round(state.score/qs().length*100);
    addEvent("quiz_end",{missionId:state.mission,scorePct:pct,chronomode:state.chronomode});
    if(pct>=60)xp(10);
    state.screen="reflection";
  }
  render();
  if(state.screen==="quiz" && !state.showFeedback) startChrono();
}

function saveReflection(){addEvent("reflection",{missionId:state.mission,understood:document.getElementById("r1").value,difficult:document.getElementById("r2").value,next:document.getElementById("r3").value});state.screen="result";render()}
function startSim(id){state.sim=SIMS.find(s=>s.id===id);state.simIndex=0;state.simScore=0;addEvent("sim_start",{simId:id});state.screen="sim";render()}
function answerSim(i){let st=state.sim.steps[state.simIndex],ok=i===st[2];if(ok)state.simScore++;upd(ok?"Prioriser":"Analyser",ok);addEvent("sim_answer",{simId:state.sim.id,step:state.simIndex,selected:i,correct:st[2],isCorrect:ok});alert(ok?"Bonne reponse.":"Reponse a retravailler.");state.simIndex++;if(state.simIndex>=state.sim.steps.length){let pct=Math.round(state.simScore/state.sim.steps.length*100);addEvent("sim_end",{simId:state.sim.id,scorePct:pct});if(pct>=60)xp(15)}render()}
function chooseBuddy(m){let p=profile();p.buddyMode=m;p.buddyName=m==="real"?(document.getElementById("buddyName").value||"Binome reel"):m==="praxis"?"Binome Praxis":"";saveProfile(p);addEvent("buddy_mode",{mode:m,buddyName:p.buddyName});render()}
function exportData(){document.getElementById("exportBox").value=JSON.stringify({exportedAt:now(),profile:profile(),events:events()},null,2)}
function resetData(){if(confirm("Effacer les statistiques locales ?")){localStorage.removeItem("praxis_events");localStorage.removeItem("praxis_profile");render()}}
function stats(){let ev=events(),a=ev.filter(e=>e.type==="question_answer");return{logins:ev.filter(e=>e.type==="login").length,answers:a.length,sims:ev.filter(e=>e.type==="sim_end").length,missions:ev.filter(e=>e.type==="quiz_end").length,reflections:ev.filter(e=>e.type==="reflection").length,avgTime:a.length?Math.round(a.reduce((x,y)=>x+(y.timeSec||0),0)/a.length):0}}
function qstats(){return QUESTIONS.map(q=>{let a=events().filter(e=>e.questionId===q.id);return{id:q.id,mission:q.mission,answers:a.length,fail:a.filter(e=>!e.isCorrect).length}})}

function render(){
  if(!state.user){let u=load("praxis_current_user",null);if(u){state.user=u;state.screen=u.role==="student"?"home":"admin"}}
  document.getElementById("app").innerHTML=`<div class="phone"><div class="header"><div class="logo">P</div><h1>Praxis Academy</h1><p>V3 Pilote 50 etudiants - UE 2.1</p></div><div class="content">${screen()}</div>${state.user?nav():""}</div>`
}

function nav(){return`<div class="nav"><button onclick="setScreen('home')">Accueil</button><button onclick="setScreen('missions')">Missions</button><button onclick="setScreen('passport')">Passeport</button><button onclick="setScreen('chrono')">Chrono</button><button onclick="setScreen('admin')">Stats</button><button onclick="logout()">Sortir</button></div>`}

function screen(){
  if(!state.user)return login();
  if(state.screen==="missions")return missions();
  if(state.screen==="passport")return passport();
  if(state.screen==="buddy")return buddy();
  if(state.screen==="chrono")return chronoScreen();
  if(state.screen==="quiz")return quiz();
  if(state.screen==="reflection")return reflection();
  if(state.screen==="result")return result();
  if(state.screen==="sim")return sim();
  if(state.screen==="admin")return admin();
  return home();
}

function login(){return`<div class="card"><span class="badge">Pilote securise</span><h2>Acces Praxis Academy</h2><p class="small">Entrez votre code personnel.</p><input id="code" placeholder="PRAXIS-A2-001"><button class="btn" onclick="tryLogin()">Entrer</button><p id="loginError" class="danger"></p><p class="small">Codes : PRAXIS-A2-001 a 050, PRAXIS-FORM-01</p></div>`}

function home(){
  let p=profile();
  let mode=CHRONO_MODES[state.chronomode];
  return`<div class="card"><span class="badge">${state.user.role}</span><h2>Bonjour ${state.user.name}</h2><div class="grid2"><div class="mini"><span class="small">XP Praxis</span><strong>${p.xp}</strong></div><div class="mini"><span class="small">Mode</span><strong style="color:${mode.color}">${mode.label}</strong></div></div></div><div class="card mission"><h3>Mission du jour</h3><p>UE 2.1 : Atomes et bases du vivant.</p><button class="btn" onclick="startMission('M1')">Commencer</button></div>`
}

function chronoScreen(){
  var mode=CHRONO_MODES[state.chronomode];
  return`<div class="card">
    <h2>Mode Chrono</h2>
    <p class="small">Choisissez vos conditions d'entrainement.</p>
    <div style="margin-top:16px">
      <div class="card ${state.chronomode==='libre'?'em':''}" style="margin-bottom:8px;cursor:pointer;border:2px solid ${state.chronomode==='libre'?'#38bdf8':'rgba(255,255,255,.08)'}" onclick="setChronomode('libre')">
        <h3 style="color:#38bdf8">Entrainement libre</h3>
        <p class="small">Pas de limite de temps - apprenez a votre rythme</p>
      </div>
      <div class="card ${state.chronomode==='concours'?'em':''}" style="margin-bottom:8px;cursor:pointer;border:2px solid ${state.chronomode==='concours'?'#e8a030':'rgba(255,255,255,.08)'}" onclick="setChronomode('concours')">
        <h3 style="color:#e8a030">Mode Concours</h3>
        <p class="small">90 secondes par question - conditions reelles IFSI</p>
      </div>
      <div class="card ${state.chronomode==='express'?'em':''}" style="cursor:pointer;border:2px solid ${state.chronomode==='express'?'#e84040':'rgba(255,255,255,.08)'}" onclick="setChronomode('express')">
        <h3 style="color:#e84040">Mode Express</h3>
        <p class="small">45 secondes par question - challenge maximum</p>
      </div>
    </div>
    <div style="margin-top:16px;padding:12px;background:rgba(255,255,255,.04);border-radius:8px;text-align:center">
      <p class="small">Mode actif : <strong style="color:${mode.color}">${mode.label}</strong>${mode.duree?` - ${mode.duree} sec/question`:' - Illimite'}</p>
    </div>
    <button class="btn" style="margin-top:12px" onclick="setScreen('missions')">Choisir une mission</button>
  </div>`
}

function quiz(){
  let list=qs(),q=list[state.qIndex],good=state.selected===q.correct;
  var mode=CHRONO_MODES[state.chronomode];
  var chronoHtml="";
  if(mode.duree && !state.showFeedback){
    var restant=state.chronoRestant!==null?state.chronoRestant:mode.duree;
    var pct=Math.round(restant/mode.duree*100);
    var couleur=restant<=10?"#e84040":restant<=20?"#e8a030":mode.color;
    chronoHtml=`<div style="margin-bottom:12px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
        <span class="small" style="color:${mode.color}">${mode.label}</span>
        <span id="chrono-display" style="font-size:20px;font-weight:700;color:${couleur}">${restant}s</span>
      </div>
      <div style="height:4px;background:rgba(255,255,255,.08);border-radius:2px">
        <div style="height:100%;width:${pct}%;background:${couleur};border-radius:2px;transition:width .5s"></div>
      </div>
    </div>`;
  }
  var timeoutMsg=state.selected===-1?`<div class="feedback error"><h3>Temps ecoule !</h3><p>${q.explanation}</p><button class="btn secondary" onclick="nextQuestion()">Continuer</button></div>`:"";
  return`<div class="card">${chronoHtml}<span class="badge">${q.id} - ${q.capability}</span><p class="small">Question ${state.qIndex+1}/${list.length}</p><h2>${q.text}</h2>${q.answers.map((a,i)=>`<button class="answer ${state.selected===i?'selected':''}" onclick="selectAnswer(${i})">${String.fromCharCode(65+i)}. ${a}</button>`).join("")}${!state.showFeedback?`<button class="btn" onclick="validateAnswer()">Valider</button>`:""}</div>${state.showFeedback&&state.selected!==-1?`<div class="feedback ${good?'':'error'}"><h3>${good?'Bonne reponse':'Reponse a retravailler'}</h3><p>${q.explanation}</p><button class="btn secondary" onclick="nextQuestion()">Continuer</button></div>`:""}${timeoutMsg}`
}

function missions(){return`<div class="card"><h2>Missions Praxis UE 2.1</h2><p class="small" style="margin-bottom:12px">Mode actif : <strong style="color:${CHRONO_MODES[state.chronomode].color}">${CHRONO_MODES[state.chronomode].label}</strong> - <a onclick="setScreen('chrono')" style="color:#38bdf8;cursor:pointer">changer</a></p>${MISSIONS.map(m=>`<div class="card mission"><span class="badge">${m.xp} XP</span><h3>${m.title}</h3><p>${m.subtitle}</p><button class="btn" onclick="startMission('${m.id}')">Lancer</button></div>`).join("")}</div><div class="card"><h3>Praxis Sim</h3>${SIMS.map(s=>`<button class="btn light" onclick="startSim('${s.id}')">${s.title}</button>`).join("")}</div>`}

function passport(){let pp=profile().passport;return`<div class="card"><h2>Passeport Praxis</h2>${Object.entries(pp).map(([k,v])=>`<div class="skill"><span>${k}</span><div class="progress"><span style="width:${v}%"></span></div><strong>${v}%</strong></div>`).join("")}</div>`}
function buddy(){let p=profile();return`<div class="card"><h2>Binome Praxis</h2><div class="card"><h3>Binome reel</h3><input id="buddyName" placeholder="Prenom"><button class="btn" onclick="chooseBuddy('real')">Activer</button></div><div class="card"><h3>Binome Praxis</h3><button class="btn secondary" onclick="chooseBuddy('praxis')">Activer</button></div><button class="btn light" onclick="chooseBuddy('none')">Solo</button><p class="small">Statut : ${p.buddyMode} ${p.buddyName}</p></div>`}
function reflection(){return`<div class="card"><h2>Reflexion Praxis</h2><p class="small">Carnet de raisonnement guide.</p><label>Ce que j'ai compris</label><textarea id="r1"></textarea><label>Ce qui reste difficile</label><textarea id="r2"></textarea><label>Ce que je veux retravailler</label><textarea id="r3"></textarea><button class="btn" onclick="saveReflection()">Enregistrer</button></div>`}
function result(){return`<div class="card"><h2>Mission terminee</h2><h1>${Math.round(state.score/qs().length*100)}%</h1><p>${state.score} bonnes reponses.</p><p class="success">Passeport et statistiques mis a jour.</p><button class="btn" onclick="setScreen('passport')">Voir Passeport</button></div>`}
function sim(){let st=state.sim.steps[state.simIndex];if(!st)return`<div class="card"><h2>Praxis Sim terminee</h2><h1>${Math.round(state.simScore/state.sim.steps.length*100)}%</h1><button class="btn" onclick="state.simIndex=0;state.simScore=0;render()">Recommencer</button></div>`;return`<div class="card"><span class="badge">${state.sim.id}</span><h2>${state.sim.title}</h2><p class="small">Etape ${state.simIndex+1}/${state.sim.steps.length}</p><h3>${st[0]}</h3>${st[1].map((a,i)=>`<button class="answer" onclick="answerSim(${i})">${String.fromCharCode(65+i)}. ${a}</button>`).join("")}</div>`}
function admin(){let s=stats();return`<div class="card"><h2>Tableau pilote</h2><div class="stat"><span>Connexions</span><strong>${s.logins}</strong></div><div class="stat"><span>Reponses</span><strong>${s.answers}</strong></div><div class="stat"><span>Missions</span><strong>${s.missions}</strong></div><div class="stat"><span>Reflexions</span><strong>${s.reflections}</strong></div><div class="stat"><span>Praxis Sim</span><strong>${s.sims}</strong></div><div class="stat"><span>Temps moyen/question</span><strong>${s.avgTime}s</strong></div></div><div class="card"><h3>Questions</h3><div class="row"><strong>ID</strong><strong>Reponses</strong><strong>Echecs</strong></div>${qstats().map(q=>`<div class="row"><span>${q.id}<br><small>${q.mission}</small></span><span>${q.answers}</span><span>${q.fail}</span></div>`).join("")}</div><div class="card"><h3>Export pilote</h3><button class="btn" onclick="exportData()">Generer export JSON</button><button class="btn light" onclick="resetData()">Reinitialiser</button><textarea id="exportBox"></textarea></div>`}
render();
