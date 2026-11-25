/* ============================================================
   SAFETI — chat assistant of AeroSafety Case (side panel)
   - Talks to /api/ai/chat on the BVLOS Safety Academy site (needs a signed-in site account).
   - SAFETI only PROPOSES actions. Nothing changes in a mission until the user clicks Apply.
   - SAFETI has no action for checklist ticks, safety flags, document validity, control status
     Implemented/Verified, or signing the GO/NO-GO decision. Those stay human.
   ============================================================ */
(function(){
'use strict';

var LS_KEY='safeti_chat_v1', LS_OPEN='safeti_open_v1';
var SEVNUM={A:5,B:4,C:3,D:2,E:1};
var STEP_LABELS=['General data','Location & map','UAS & crew','Hazards','Mitigations','Checklist','Documents','GO/NO-GO decision','Report'];

var S={
  open:false, messages:[], tools:{}, busy:false, error:null, status:null, statusLoading:false,
  remaining:null, text:'', applying:false
};

/* ---------- small helpers ---------- */
function esc(s){ return (typeof escapeHtml==='function')? escapeHtml(s) : String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
function $(id){ return document.getElementById(id); }
function lsGet(k){ try{ return window.localStorage.getItem(k); }catch(e){ return null; } }
function lsSet(k,v){ try{ window.localStorage.setItem(k,v); }catch(e){} }
function app(){ return window.App; }
function uid(){ return 'x'+Date.now().toString(36)+Math.random().toString(36).slice(2,7); }

/* ---------- the mascot: SAFETI, a little drone-bot (original design) ---------- */
function mascot(opts){
  opts=opts||{};
  var size=opts.size||40, mood=opts.mood||'idle', body=!!opts.body;
  var vb=body?'0 0 80 98':'0 4 80 64';
  var h=body? Math.round(size*98/80) : Math.round(size*64/80);
  var eyes;
  if(mood==='happy'){
    eyes='<path d="M29 46 q5 -6 10 0" fill="none" stroke="#5FD0FF" stroke-width="3" stroke-linecap="round"/>'+
         '<path d="M41 46 q5 -6 10 0" fill="none" stroke="#5FD0FF" stroke-width="3" stroke-linecap="round"/>';
  } else {
    var dy=mood==='think'?-2:0;
    eyes='<g class="sf-eyes"><ellipse cx="34" cy="'+(47+dy)+'" rx="4.2" ry="5.4" fill="#5FD0FF"/><ellipse cx="46" cy="'+(47+dy)+'" rx="4.2" ry="5.4" fill="#5FD0FF"/>'+
         '<circle cx="35.4" cy="'+(45+dy)+'" r="1.4" fill="#fff"/><circle cx="47.4" cy="'+(45+dy)+'" r="1.4" fill="#fff"/></g>';
  }
  var mouth= mood==='happy' ? '<path d="M36.5 51.5 q3.5 3 7 0" fill="none" stroke="#5FD0FF" stroke-width="2" stroke-linecap="round"/>' : '';
  var torso= body ?
    '<path d="M27 70 h26 v13 q0 9 -13 13 q-13 -4 -13 -13 z" fill="#1E88C9" stroke="#142C56" stroke-width="2.4" stroke-linejoin="round"/>'+
    '<path d="M34 81 l4.5 4.5 l8 -9" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>'+
    '<circle cx="22" cy="78" r="4.2" fill="#F4F8FD" stroke="#142C56" stroke-width="2.2"/><circle cx="58" cy="78" r="4.2" fill="#F4F8FD" stroke="#142C56" stroke-width="2.2"/>' : '';
  return '<svg class="sf-svg sf-'+mood+'" viewBox="'+vb+'" width="'+size+'" height="'+h+'" role="img" aria-label="SAFETI" xmlns="http://www.w3.org/2000/svg" style="width:'+size+'px;height:'+h+'px;flex-shrink:0;">'+
    '<line x1="40" y1="22" x2="40" y2="12" stroke="#142C56" stroke-width="2.6" stroke-linecap="round"/>'+
    '<circle class="sf-led" cx="40" cy="9.5" r="3.6" fill="#FF9A2E" stroke="#142C56" stroke-width="1.6"/>'+
    '<line x1="22" y1="32" x2="12" y2="24" stroke="#142C56" stroke-width="2.6" stroke-linecap="round"/>'+
    '<line x1="58" y1="32" x2="68" y2="24" stroke="#142C56" stroke-width="2.6" stroke-linecap="round"/>'+
    '<ellipse class="sf-rotor" cx="11" cy="22.5" rx="9" ry="2.3" fill="#1E88C9" stroke="#142C56" stroke-width="1.6"/>'+
    '<ellipse class="sf-rotor" cx="69" cy="22.5" rx="9" ry="2.3" fill="#1E88C9" stroke="#142C56" stroke-width="1.6"/>'+
    torso+
    '<circle cx="40" cy="44" r="22" fill="#F4F8FD" stroke="#142C56" stroke-width="2.6"/>'+
    '<path d="M22 40 q3 -16 18 -18" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".9"/>'+
    '<rect x="25" y="35" width="30" height="21" rx="10.5" fill="#0B2347"/>'+
    eyes+mouth+
    '<circle cx="23.5" cy="52" r="2.6" fill="#FF9A2E" opacity=".35"/><circle cx="56.5" cy="52" r="2.6" fill="#FF9A2E" opacity=".35"/>'+
  '</svg>';
}

/* ---------- styles ---------- */
var CSS=[
'#safeti-root{font-family:var(--sans);}',
'.sf-launch{position:fixed;right:14px;top:50%;transform:translateY(-50%);z-index:900;width:62px;height:62px;border-radius:50%;border:2px solid var(--navy-800);background:#fff;box-shadow:0 6px 18px rgba(11,35,71,.28);cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;transition:transform .15s,box-shadow .15s;}',
'.sf-launch:hover{transform:translateY(-50%) scale(1.06);box-shadow:0 8px 22px rgba(11,35,71,.38);}',
'.sf-launch .sf-tag{position:absolute;right:68px;top:50%;transform:translateY(-50%);background:var(--navy-900);color:#fff;font-size:12px;font-weight:700;padding:6px 10px;border-radius:7px;white-space:nowrap;opacity:0;pointer-events:none;transition:opacity .15s;}',
'.sf-launch:hover .sf-tag{opacity:1;}',
'.sf-dot{position:absolute;top:3px;right:3px;width:13px;height:13px;border-radius:50%;background:#FF9A2E;border:2px solid #fff;display:none;}',
'.sf-launch.unread .sf-dot{display:block;}',
'body.safeti-open .sf-launch{display:none;}',
'.sf-panel{position:fixed;top:0;right:0;height:100vh;width:400px;max-width:100vw;background:#fff;border-left:1px solid var(--border);box-shadow:-8px 0 28px rgba(11,35,71,.14);z-index:950;display:none;flex-direction:column;}',
'body.safeti-open .sf-panel{display:flex;}',
'@media (min-width:1100px){body.safeti-open{padding-right:400px;}}',
'.sf-head{display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--navy-900);color:#fff;}',
'.sf-head .sf-title{flex:1;min-width:0;}',
'.sf-head b{font-size:15px;letter-spacing:.06em;display:block;}',
'.sf-head span{font-size:11px;color:#b9cbe2;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
'.sf-ibtn{background:rgba(255,255,255,.1);border:none;color:#fff;width:30px;height:30px;border-radius:7px;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;}',
'.sf-ibtn:hover{background:rgba(255,255,255,.22);}',
'.sf-ibtn svg{width:16px;height:16px;}',
'.sf-body{flex:1;overflow-y:auto;padding:14px 12px;background:#F7F9FC;}',
'.sf-msg{margin-bottom:12px;display:flex;gap:8px;align-items:flex-start;}',
'.sf-msg.user{justify-content:flex-end;}',
'.sf-bubble{max-width:88%;font-size:13px;line-height:1.5;padding:9px 12px;border-radius:12px;word-wrap:break-word;overflow-wrap:anywhere;}',
'.sf-msg.user .sf-bubble{background:var(--navy-800);color:#fff;border-bottom-right-radius:3px;white-space:pre-wrap;}',
'.sf-msg.bot .sf-bubble{background:#fff;border:1px solid var(--border);border-bottom-left-radius:3px;}',
'.sf-bubble p{margin:0 0 6px;}.sf-bubble p:last-child{margin-bottom:0;}',
'.sf-bubble .ai-h{font-weight:800;font-size:13px;margin:8px 0 4px;color:var(--navy-800);}',
'.sf-bubble .ai-ul{margin:4px 0 6px;padding-left:18px;}.sf-bubble .ai-ul li{margin-bottom:3px;}',
'.sf-bot-col{flex:1;min-width:0;display:flex;flex-direction:column;gap:8px;}',
'.sf-card{background:#fff;border:1px solid #b9d6ee;border-left:4px solid var(--blue-accent);border-radius:9px;padding:9px 11px;font-size:12.3px;}',
'.sf-card.applied{border-color:#bfe0cb;border-left-color:var(--risk-low);background:#F6FBF8;}',
'.sf-card.skipped{opacity:.65;border-left-color:#9aa8b6;}',
'.sf-card.failed{border-color:#f0c3c0;border-left-color:var(--risk-crit);background:#FFF8F7;}',
'.sf-card h4{margin:0 0 4px;font-size:12.5px;color:var(--navy-800);display:flex;justify-content:space-between;gap:8px;}',
'.sf-card h4 em{font-style:normal;font-size:11px;font-weight:700;color:var(--text-mute);white-space:nowrap;}',
'.sf-card.applied h4 em{color:var(--risk-low);}.sf-card.failed h4 em{color:var(--risk-crit);}',
'.sf-card ul{margin:2px 0 0;padding-left:16px;}.sf-card li{margin-bottom:2px;}',
'.sf-card .sf-det{color:var(--text-mute);}',
'.sf-card .sf-row{display:flex;gap:6px;margin-top:8px;}',
'.sf-btn{border:1px solid var(--border);background:#fff;color:var(--text);font-size:12px;font-weight:700;border-radius:7px;padding:6px 11px;cursor:pointer;}',
'.sf-btn:hover{background:var(--bg);}',
'.sf-btn.pri{background:var(--navy-900);color:#fff;border-color:var(--navy-900);}.sf-btn.pri:hover{background:var(--navy-700);}',
'.sf-btn:disabled{opacity:.5;cursor:default;}',
'.sf-badge{display:inline-block;font-size:10.5px;font-weight:800;padding:1px 6px;border-radius:5px;margin-left:3px;}',
'.sf-badge.low{background:var(--risk-low-bg);color:var(--risk-low);}.sf-badge.med{background:var(--risk-med-bg);color:var(--risk-med);}.sf-badge.crit{background:var(--risk-crit-bg);color:var(--risk-crit);}.sf-badge.neutral{background:#E8EEF5;color:var(--text-mute);}',
'.sf-welcome{text-align:center;padding:10px 6px 4px;}',
'.sf-welcome h3{margin:8px 0 4px;font-size:17px;color:var(--navy-800);}',
'.sf-welcome p{margin:0 auto 10px;font-size:12.6px;color:var(--text-mute);max-width:310px;line-height:1.5;}',
'.sf-chips{display:flex;flex-direction:column;gap:7px;margin:12px 0;}',
'.sf-chip{text-align:left;background:#fff;border:1px solid var(--border);border-radius:9px;padding:9px 11px;font-size:12.6px;font-weight:600;color:var(--navy-800);cursor:pointer;}',
'.sf-chip:hover{border-color:var(--blue-accent);background:var(--blue-soft);}',
'.sf-note{font-size:10.8px;color:var(--text-mute);line-height:1.5;text-align:left;border-top:1px solid var(--border);padding-top:9px;margin-top:6px;}',
'.sf-note a{text-decoration:underline;}',
'.sf-err{background:var(--risk-crit-bg);color:var(--risk-crit);border:1px solid #f0c3c0;border-radius:8px;padding:8px 10px;font-size:12px;margin-bottom:10px;}',
'.sf-info{background:var(--blue-soft);border:1px solid #b9d6ee;border-radius:8px;padding:10px 12px;font-size:12.3px;margin-bottom:10px;}',
'.sf-info .sf-row{display:flex;gap:7px;margin-top:8px;flex-wrap:wrap;}',
'.sf-info a.sf-btn{display:inline-block;}',
'.sf-foot{border-top:1px solid var(--border);padding:9px 10px 8px;background:#fff;}',
'.sf-foot textarea{width:100%;resize:none;border:1px solid var(--border);border-radius:9px;padding:8px 10px;font:inherit;font-size:13px;min-height:42px;max-height:130px;outline:none;}',
'.sf-foot textarea:focus{border-color:var(--blue-accent);}',
'.sf-foot .sf-bar{display:flex;align-items:center;justify-content:space-between;margin-top:6px;gap:8px;}',
'.sf-foot .sf-meta{font-size:10.8px;color:var(--text-mute);}',
'.sf-send{display:flex;align-items:center;gap:5px;}',
'.sf-send svg{width:14px;height:14px;}',
'.sf-typing{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--text-mute);margin-bottom:10px;}',
'.sf-typing i{display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--blue-accent);margin-right:3px;animation:sfdot 1s infinite;}',
'.sf-typing i:nth-child(2){animation-delay:.15s}.sf-typing i:nth-child(3){animation-delay:.3s}',
'@keyframes sfdot{0%,80%,100%{opacity:.25}40%{opacity:1}}',
'@keyframes sfblink{0%,92%,100%{transform:scaleY(1)}96%{transform:scaleY(.1)}}',
'@keyframes sfrotor{0%{transform:scaleX(1)}50%{transform:scaleX(.35)}100%{transform:scaleX(1)}}',
'@keyframes sfled{0%,100%{opacity:1}50%{opacity:.35}}',
'@keyframes sfbob{0%,100%{transform:translateY(0)}50%{transform:translateY(-2px)}}',
'.sf-svg{animation:sfbob 3.2s ease-in-out infinite;}',
'.sf-svg .sf-eyes{transform-box:fill-box;transform-origin:center;animation:sfblink 4.5s infinite;}',
'.sf-svg .sf-rotor{transform-box:fill-box;transform-origin:center;animation:sfrotor 1.4s linear infinite;}',
'.sf-svg.sf-think .sf-rotor{animation-duration:.25s;}',
'.sf-svg .sf-led{animation:sfled 1.6s ease-in-out infinite;}',
'@media (prefers-reduced-motion:reduce){.sf-svg,.sf-svg *{animation:none!important;}}',
'@media (max-width:880px){.sf-panel{width:100vw;}.sf-launch{top:auto;bottom:84px;transform:none;width:54px;height:54px;}.sf-launch:hover{transform:none;}.sf-launch .sf-tag{display:none;}}',
'@media print{#safeti-root{display:none!important;}body.safeti-open{padding-right:0!important;}}'
].join('\n');

/* ---------- persistence ---------- */
function save(){
  var m=S.messages.slice(-40);
  lsSet(LS_KEY, JSON.stringify({messages:m, tools:S.tools}));
}
function load(){
  try{
    var raw=lsGet(LS_KEY); if(!raw) return;
    var d=JSON.parse(raw);
    if(Array.isArray(d.messages)) S.messages=d.messages.filter(function(m){ return m&&(m.role==='user'||m.role==='assistant')&&Array.isArray(m.content); });
    if(d.tools&&typeof d.tools==='object') S.tools=d.tools;
    // History must start with a plain user message.
    while(S.messages.length && !(S.messages[0].role==='user' && !hasType(S.messages[0],'tool_result'))) S.messages.shift();
  }catch(e){ S.messages=[]; S.tools={}; }
}
function hasType(m,t){ return m.content.some(function(b){ return b&&b.type===t; }); }

/* ---------- context sent with every message ---------- */
function missionContext(d){
  var ev={decision:'',reasons:[]};
  try{ var e=evaluateMission(d); ev={decision:e.decision, reasons:e.reasons.map(function(r){return r.text;})}; }catch(x){}
  var cl=d.checklist||{};
  var loc=d.location||{};
  return {
    id:d.id, code:d.code, name:d.name, status:d.status, date:d.date, startTime:d.startTime, endTime:d.endTime,
    operationType:d.operationType, category:d.category, scenario:d.scenario, description:d.description, criticality:d.criticality,
    crewAssigned:{responsible:!!d.responsible, safetyManager:!!d.safetyManager, pilot:!!d.pilot, observers:!!d.observers},
    location:{name:loc.name, country:loc.country, city:loc.city, env:loc.env, lat:loc.lat, lng:loc.lng, takeoff:loc.takeoff, landing:loc.landing, area:loc.areaPath||[]},
    uas:d.uas,
    hazards:(d.hazards||[]).map(function(h){
      var rI=h.riskInitial, rR=(h.riskResidual!=null?h.riskResidual:h.riskInitial);
      return {id:h.id, name:h.name, category:h.category, initial:riskCode(rI), initialLevel:riskLevel(rI).label, residual:riskCode(rR), residualLevel:riskLevel(rR).label,
        lat:h.lat, lng:h.lng, controls:(h.mitigations||[]).map(function(x){ return {desc:x.desc,type:x.type,status:x.status}; })};
    }),
    checklist:{done:PRECHECK_ITEMS.filter(function(it){return cl[it.id];}).length, total:PRECHECK_ITEMS.length},
    documents:(d.documents||[]).map(function(x){ return {type:x.type, provided:!!x.name, expired:!!(x.expiry&&new Date(x.expiry)<new Date())}; }),
    flags:d.flags||{}, engine:ev
  };
}
function buildContext(){
  var A=app(), st=A.state;
  return {
    view:st.view, step:st.view==='wizard'?st.wizardStep:null, today:new Date().toISOString().slice(0,10),
    mission: st.draft? missionContext(st.draft) : null,
    missions:(st.missions||[]).map(function(m){ return {id:m.id, code:m.code, name:m.name, status:m.status}; })
  };
}

/* ---------- history for the request ---------- */
function historyForRequest(extra){
  var msgs=S.messages.concat([extra]);
  var MAX=24;
  if(msgs.length>MAX){
    msgs=msgs.slice(msgs.length-MAX);
    // the first message must be a user message without tool_result blocks
    if(msgs[0].role==='assistant') msgs.shift();
    if(msgs[0] && msgs[0].role==='user'){
      msgs[0]={role:'user', content:msgs[0].content.filter(function(b){ return b.type!=='tool_result'; })};
      if(!msgs[0].content.length) msgs.shift();
    }
  }
  return msgs;
}

/* ---------- tool executors (run in the browser, after the user clicks Apply) ---------- */
function needDraft(){ var d=app().state.draft; if(!d) throw new Error('No mission is open. Create or open a mission first.'); return d; }
function zoomFor(pts){
  if(!pts.length) return 15;
  var la=pts.map(function(p){return p.lat;}), ln=pts.map(function(p){return p.lng;});
  var ext=Math.max(Math.max.apply(null,la)-Math.min.apply(null,la), Math.max.apply(null,ln)-Math.min.apply(null,ln));
  return ext>0.5?9: ext>0.2?10: ext>0.1?11: ext>0.05?12: ext>0.02?13: ext>0.01?14: ext>0.004?15: 16;
}
function applyMissionFields(d,i){
  var map={name:'name',client:'client',date:'date',start_time:'startTime',end_time:'endTime',operation_type:'operationType',category:'category',
    criticality:'criticality',scenario:'scenario',description:'description',responsible:'responsible',safety_manager:'safetyManager',pilot:'pilot',observers:'observers'};
  var n=0;
  Object.keys(map).forEach(function(k){ if(i[k]!=null && i[k]!==''){ d[map[k]]=i[k]; n++; } });
  return n;
}
function persistDraft(){ try{ app().saveDraft(); }catch(e){} }
// Before another mission replaces the open one, keep the open one if it has content or already exists.
function keepCurrent(){
  var A=app(), d=A.state.draft; if(!d) return;
  var exists=A.state.missions.some(function(m){ return m.id===d.id; });
  if(exists || d.name || (d.hazards&&d.hazards.length) || (d.location&&d.location.name)) persistDraft();
}

var EXEC={
  create_mission:function(i){
    var A=app();
    keepCurrent();
    A.newDraft();
    var n=applyMissionFields(A.state.draft,i);
    persistDraft(); A.render();
    return 'Mission created ('+A.state.draft.code+', id '+A.state.draft.id+'), '+n+' field(s) filled.';
  },
  update_mission:function(i){
    var d=needDraft(); var n=applyMissionFields(d,i);
    persistDraft(); app().render();
    return n+' field(s) updated.';
  },
  set_location:function(i){
    var d=needDraft(), loc=d.location, A=app();
    if(i.name) loc.name=i.name; if(i.country) loc.country=i.country; if(i.city) loc.city=i.city; if(i.env) loc.env=i.env;
    if(i.takeoff) loc.takeoff={lat:i.takeoff.lat,lng:i.takeoff.lng};
    if(i.landing) loc.landing={lat:i.landing.lat,lng:i.landing.lng};
    if(i.area) loc.areaPath=i.area.map(function(p){ return {lat:p.lat,lng:p.lng}; });
    var pts=[];
    if(i.lat!=null && i.lng!=null){ loc.lat=i.lat; loc.lng=i.lng; pts.push({lat:i.lat,lng:i.lng}); }
    if(loc.areaPath&&loc.areaPath.length) pts=pts.concat(loc.areaPath);
    if(loc.takeoff) pts.push(loc.takeoff); if(loc.landing) pts.push(loc.landing);
    if(i.lat==null && i.search==null && pts.length){
      var c=pts.reduce(function(a,p){ return {lat:a.lat+p.lat/pts.length,lng:a.lng+p.lng/pts.length}; },{lat:0,lng:0});
      loc.lat=c.lat; loc.lng=c.lng;
    }
    if(pts.length) loc.zoom=zoomFor(pts);
    var finish=function(extra){
      persistDraft();
      A.state.wizardStep=2; if(A.state.view!=='wizard') A.state.view='wizard';
      A.render();
      return 'Location updated'+(extra?' ('+extra+')':'')+'. Centre: '+(loc.lat!=null?(+loc.lat).toFixed(5)+', '+(+loc.lng).toFixed(5):'not set')+'.';
    };
    if(i.search && i.lat==null){
      return fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&q='+encodeURIComponent(i.search))
        .then(function(r){ return r.json(); })
        .then(function(res){
          if(!res||!res.length) throw new Error('The place "'+i.search+'" was not found. Ask the user for coordinates.');
          loc.lat=parseFloat(res[0].lat); loc.lng=parseFloat(res[0].lon); loc.zoom=loc.zoom||15;
          return finish('found "'+String(res[0].display_name||i.search).slice(0,80)+'"; the user must check it on the map');
        });
    }
    return finish('');
  },
  set_uas:function(i){
    var d=needDraft(), u=d.uas, n=0;
    ['manufacturer','model','serial','type','mtom','payload'].forEach(function(k){ if(i[k]){ u[k]=i[k]; n++; } });
    ['rth','geofence','failsafe'].forEach(function(k){ if(typeof i[k]==='boolean'){ u[k]=i[k]; n++; } });
    persistDraft(); app().render();
    return n+' UAS field(s) updated.';
  },
  add_hazards:function(i){
    var d=needDraft(); d.hazards=d.hazards||[];
    var added=[], skipped=[];
    i.hazards.forEach(function(h){
      var dup=d.hazards.some(function(x){ return String(x.name||'').toLowerCase()===h.name.toLowerCase(); });
      if(dup){ skipped.push(h.name); return; }
      var si=SEVNUM[h.severity], pi=h.likelihood, r=encodeRisk(si,pi);
      var hz={id:'H-'+Date.now()+Math.random().toString(36).slice(2,6), name:h.name, category:h.category,
        severityInitial:si, probabilityInitial:pi, riskInitial:r,
        mitigations:(h.controls||[]).map(function(c){ return {id:'MIT-'+Math.random().toString(36).slice(2,8), desc:c.desc, type:c.type, responsible:'', status:'Proposed', due:''}; }),
        severityResidual:si, probabilityResidual:pi, riskResidual:r};
      if(h.lat!=null){ hz.lat=h.lat; hz.lng=h.lng; }
      d.hazards.push(hz); added.push(h.name);
    });
    persistDraft(); app().render();
    return added.length+' hazard(s) added'+(skipped.length?'; skipped existing: '+skipped.join(', '):'')+'. Residual risk equals initial risk until rated; controls are Proposed.';
  },
  add_controls:function(i){
    var d=needDraft(); var h=(d.hazards||[]).find(function(x){ return x.id===i.hazard_id; });
    if(!h) throw new Error('Hazard not found in the open mission.');
    h.mitigations=h.mitigations||[];
    i.controls.forEach(function(c){ h.mitigations.push({id:'MIT-'+Math.random().toString(36).slice(2,8), desc:c.desc, type:c.type, responsible:'', status:'Proposed', due:''}); });
    persistDraft(); app().render();
    return i.controls.length+' control(s) added to "'+h.name+'" as Proposed.';
  },
  rate_residual:function(i){
    var d=needDraft(); var h=(d.hazards||[]).find(function(x){ return x.id===i.hazard_id; });
    if(!h) throw new Error('Hazard not found in the open mission.');
    var si=SEVNUM[i.severity], pi=i.likelihood;
    h.severityResidual=si; h.probabilityResidual=pi; h.riskResidual=encodeRisk(si,pi);
    persistDraft(); app().render();
    return 'Residual risk of "'+h.name+'" set to '+riskCode(h.riskResidual)+' ('+riskLevel(h.riskResidual).label+').';
  },
  open_mission:function(i){
    var A=app(); var m=A.state.missions.find(function(x){ return x.id===i.mission_id; });
    if(!m) throw new Error('Mission not found in the saved list.');
    keepCurrent();
    A.openMission(m.id);
    return 'Mission "'+(m.name||m.code)+'" opened.';
  },
  navigate:function(i){
    var A=app();
    if(i.view==='wizard'){ needDraft(); if(i.step) A.state.wizardStep=i.step; }
    A.go(i.view);
    return 'Moved to '+i.view+(i.step?' step '+i.step:'')+'.';
  }
};

/* ---------- tool cards ---------- */
var TITLES={create_mission:'Create a new mission',update_mission:'Update mission data',set_location:'Set location & map',set_uas:'Set aircraft (UAS) data',
  add_hazards:'Add hazards',add_controls:'Add controls to a hazard',rate_residual:'Set residual risk',open_mission:'Open a mission',navigate:'Go to'};
var FIELD_LABELS={name:'Name',client:'Client',date:'Date',start_time:'Start',end_time:'End',operation_type:'Operation type',category:'Category',criticality:'Criticality',
  scenario:'Scenario',description:'Description',responsible:'Responsible',safety_manager:'Safety manager',pilot:'Pilot',observers:'Observers',
  manufacturer:'Manufacturer',model:'Model',serial:'Serial',type:'Type',mtom:'MTOM',payload:'Payload'};
function badge(s,p){
  var r=encodeRisk(SEVNUM[s],p), lv=riskLevel(r);
  return '<span class="sf-badge '+lv.cls+'">'+esc(riskCode(r))+' · '+esc(lv.label)+'</span>';
}
function hazardName(id){
  var d=app().state.draft; var h=d&&(d.hazards||[]).find(function(x){return x.id===id;});
  return h? h.name : '(hazard not found)';
}
function pt(p){ return (+p.lat).toFixed(5)+', '+(+p.lng).toFixed(5); }
function cardDetail(name,i){
  var li=function(a){ return '<ul>'+a.map(function(x){return '<li>'+x+'</li>';}).join('')+'</ul>'; };
  if(name==='create_mission'||name==='update_mission'||name==='set_uas'){
    var rows=Object.keys(i).map(function(k){
      var v=i[k]; if(typeof v==='boolean') v=v?'Yes':'No';
      return '<b>'+esc(FIELD_LABELS[k]||({rth:'RTH configured',geofence:'Geofence active',failsafe:'Failsafe documented'}[k])||k)+':</b> '+esc(String(v).slice(0,160));
    });
    return rows.length? li(rows) : '<div class="sf-det">No data.</div>';
  }
  if(name==='set_location'){
    var r=[];
    if(i.name) r.push('<b>Site:</b> '+esc(i.name));
    if(i.country||i.city) r.push('<b>Place:</b> '+esc([i.city,i.country].filter(Boolean).join(', ')));
    if(i.env) r.push('<b>Environment:</b> '+esc(i.env));
    if(i.lat!=null) r.push('<b>Map centre:</b> '+pt(i));
    if(i.search&&i.lat==null) r.push('<b>Look up on the map:</b> '+esc(i.search));
    if(i.takeoff) r.push('<b>Take-off:</b> '+pt(i.takeoff));
    if(i.landing) r.push('<b>Landing:</b> '+pt(i.landing));
    if(i.area) r.push('<b>Operational area:</b> '+i.area.length+' points<br><span class="sf-det">'+i.area.map(pt).map(esc).join(' &rarr; ')+'</span>');
    return li(r);
  }
  if(name==='add_hazards'){
    return li(i.hazards.map(function(h){
      return '<b>'+esc(h.name)+'</b> '+badge(h.severity,h.likelihood)+'<br><span class="sf-det">'+esc(h.category)+' · '+(h.controls||[]).length+' control(s)'+
        ((h.controls||[]).length? ': '+esc(h.controls.map(function(c){return c.desc;}).join(' · ').slice(0,260)):'')+'</span>';
    }));
  }
  if(name==='add_controls') return '<div class="sf-det">For <b>'+esc(hazardName(i.hazard_id))+'</b>:</div>'+li(i.controls.map(function(c){ return esc(c.desc)+' <span class="sf-det">('+esc(c.type)+')</span>'; }));
  if(name==='rate_residual') return '<div><b>'+esc(hazardName(i.hazard_id))+'</b> '+badge(i.severity,i.likelihood)+'</div>';
  if(name==='open_mission'){
    var m=app().state.missions.find(function(x){return x.id===i.mission_id;});
    return '<div><b>'+esc(m?(m.name||m.code):'(mission not found)')+'</b></div>';
  }
  if(name==='navigate') return '<div><b>'+esc(i.view)+(i.step?' · step '+i.step+' '+esc(STEP_LABELS[i.step-1]||''):'')+'</b></div>';
  return '';
}
function cardTitle(name,i){
  if(name==='add_hazards') return 'Add '+i.hazards.length+' hazard'+(i.hazards.length>1?'s':'');
  if(name==='add_controls') return 'Add '+i.controls.length+' control'+(i.controls.length>1?'s':'');
  return TITLES[name]||name;
}
function cardHtml(b){
  var st=S.tools[b.id]||{state:'pending'};
  var cls=st.state==='applied'?'applied':st.state==='skipped'?'skipped':st.state==='failed'?'failed':'';
  var tag=st.state==='applied'?'Applied':st.state==='skipped'?'Skipped':st.state==='failed'?'Not applied':'';
  var h='<div class="sf-card '+cls+'"><h4><span>'+esc(cardTitle(b.name,b.input))+'</span>'+(tag?'<em>'+tag+'</em>':'')+'</h4>'+cardDetail(b.name,b.input);
  if(st.state==='failed') h+='<div class="sf-det" style="margin-top:4px;color:var(--risk-crit);">'+esc(st.msg||'')+'</div>';
  if(st.state==='pending' && isLastAssistant(b.id)){
    h+='<div class="sf-row"><button class="sf-btn pri" '+(S.applying||S.busy?'disabled':'')+' onclick="Safeti.apply(\''+b.id+'\')">Apply</button>'+
       '<button class="sf-btn" '+(S.applying||S.busy?'disabled':'')+' onclick="Safeti.skip(\''+b.id+'\')">Skip</button></div>';
  }
  return h+'</div>';
}
function isLastAssistant(toolId){
  var last=S.messages[S.messages.length-1];
  return !!(last && last.role==='assistant' && last.content.some(function(b){ return b.type==='tool_use' && b.id===toolId; }));
}
function pendingTools(){
  var last=S.messages[S.messages.length-1];
  if(!last||last.role!=='assistant') return [];
  return last.content.filter(function(b){ return b.type==='tool_use' && (S.tools[b.id]||{state:'pending'}).state==='pending'; });
}

/* ---------- rendering ---------- */
function bubbleHtml(m){
  if(m.role==='user'){
    var t=m.content.filter(function(b){return b.type==='text';}).map(function(b){return b.text;}).join('\n');
    return '<div class="sf-msg user"><div class="sf-bubble">'+esc(t)+'</div></div>';
  }
  var parts='';
  m.content.forEach(function(b){
    if(b.type==='text') parts+='<div class="sf-bubble">'+(typeof aiMarkdown==='function'?aiMarkdown(b.text):esc(b.text))+'</div>';
    else if(b.type==='tool_use') parts+=cardHtml(b);
  });
  var pend=pendingTools();
  if(m===S.messages[S.messages.length-1] && pend.length>1)
    parts+='<div class="sf-row" style="display:flex;gap:6px;"><button class="sf-btn pri" '+(S.applying||S.busy?'disabled':'')+' onclick="Safeti.applyAll()">Apply all ('+pend.length+')</button>'+
           '<button class="sf-btn" '+(S.applying||S.busy?'disabled':'')+' onclick="Safeti.skipAll()">Skip all</button></div>';
  return '<div class="sf-msg bot">'+mascot({size:30,mood:'idle'})+'<div class="sf-bot-col">'+parts+'</div></div>';
}
function errorText(d){
  var map={
    auth:'Please sign in to the website to chat with SAFETI.',
    quota:'You have used your free messages ('+(d.limit||'')+'). Contact us to get more access.',
    capacity:'SAFETI has reached its daily limit. Please try again tomorrow.',
    not_configured:'SAFETI is not configured yet on this site.',
    busy:'The AI service is busy. Please try again in a minute.',
    timeout:'SAFETI took too long to answer. Please try again.',
    empty:'SAFETI returned no answer. Please try again. This attempt was not counted.',
    upstream_auth:'The AI service key is not valid. The site administrator must check it.',
    no_credit:'The AI service has no credit left. The site administrator must add credit.',
    too_large:'The conversation is too large. Start a new chat with the + button.',
    bad_request:'The request could not be processed.'
  };
  var t=map[d.error]||'SAFETI had a problem. Please try again. This attempt was not counted.';
  if(d.detail) t+=' ['+d.detail+']';
  return t;
}
function metaText(){
  var s=S.status;
  if(!s||!s.signedIn) return '';
  if(s.admin) return 'Admin: unlimited';
  if(S.remaining!=null) return S.remaining+' free message'+(S.remaining===1?'':'s')+' left';
  if(s.remaining!=null) return s.remaining+' free message'+(s.remaining===1?'':'s')+' left';
  return '';
}
function suggestChips(){
  var A=app(), d=A.state.draft;
  var c=[{t:'Help me build a mission step by step', q:'Help me build a new mission. Ask me for what you need.'}];
  if(d) c.push({t:'Review my open mission', q:'Review my open mission: what is missing or looks wrong, and what should I do next?'});
  c.push({t:'I will give you the data and coordinates', q:'I want to give you the data of my operation and the coordinates, and you fill in the mission.'});
  c.push({t:'How does the GO / NO-GO decision work?', q:'How does the GO / NO-GO decision work in this app?'});
  return c;
}
function bodyHtml(){
  var s=S.status, h='';
  if(S.statusLoading && !s) return '<div class="sf-typing">'+mascot({size:30,mood:'think'})+'<span>Connecting…</span></div>';
  if(s && s.offline) h+='<div class="sf-info"><b>SAFETI needs the BVLOS Safety Academy website.</b> Open this tool from the website, with an internet connection, to chat.</div>';
  else if(s && !s.signedIn){
    var cb=encodeURIComponent('/tools/aerosafety-case/index.html');
    h+='<div class="sf-info"><b>Sign in to chat with SAFETI.</b> Registered users get a free sample of messages.<div class="sf-row"><a class="sf-btn pri" href="/login?callbackUrl='+cb+'">Sign in</a><a class="sf-btn" href="/register">Create a free account</a></div></div>';
  } else if(s && !s.configured) h+='<div class="sf-info">SAFETI is not configured yet on this site.</div>';
  if(!S.messages.length){
    h+='<div class="sf-welcome">'+mascot({size:92,mood:'happy',body:true})+
      '<h3>Hi, I\'m SAFETI</h3>'+
      '<p>Your UAS safety assistant. Give me the data and coordinates of your operation and I will help you <b>build the mission</b>, review it, and answer any question about the app. I propose, you decide.</p></div>'+
      '<div class="sf-chips">'+suggestChips().map(function(c,k){ return '<button class="sf-chip" onclick="Safeti.chip('+k+')">'+esc(c.t)+'</button>'; }).join('')+'</div>'+
      '<div class="sf-note">SAFETI uses an AI service (Anthropic). What you type, and the data of the mission open in the app, are sent to it to answer. Do not include personal data you do not need. SAFETI is a draft helper: a qualified person must check everything, and it never ticks checklists, sets safety flags, validates documents or signs a decision. Missions stay in this browser. <a href="/legal/privacy" target="_blank" rel="noopener">Privacy</a></div>';
  } else {
    S.messages.forEach(function(m){ h+=bubbleHtml(m); });
  }
  if(S.busy) h+='<div class="sf-typing">'+mascot({size:30,mood:'think'})+'<span>SAFETI is thinking<i></i><i></i><i></i></span></div>';
  if(S.error) h+='<div class="sf-err">'+esc(S.error)+'</div>';
  return h;
}
function chatReady(){ var s=S.status; return !!(s&&s.signedIn&&s.configured); }
function outOfQuota(){ var s=S.status; return !!(s&&s.signedIn&&!s.admin&&((S.remaining!=null?S.remaining:s.remaining)===0)); }

function renderPanel(keepScroll){
  var root=$('safeti-root'); if(!root) return;
  var body=$('sf-body'), prevTop=body?body.scrollTop:0, wasBottom=body?(body.scrollHeight-body.scrollTop-body.clientHeight<60):true;
  var ta=$('sf-input'); var hadFocus=ta&&document.activeElement===ta; var val=S.text;
  var d=app().state.draft;
  var sub= d && d.name ? 'Mission: '+d.name : (d? 'Mission open' : 'UAS safety assistant');
  var disabled=!chatReady()||S.busy||outOfQuota();
  root.innerHTML=
    '<button class="sf-launch'+(S.unread?' unread':'')+'" onclick="Safeti.toggle(true)" aria-label="Open SAFETI, the assistant">'+mascot({size:50,mood:'idle'})+'<span class="sf-dot"></span><span class="sf-tag">Ask SAFETI</span></button>'+
    '<aside class="sf-panel" role="complementary" aria-label="SAFETI assistant">'+
      '<div class="sf-head">'+mascot({size:38,mood:S.busy?'think':'idle'})+'<div class="sf-title"><b>SAFETI</b><span>'+esc(sub)+'</span></div>'+
        '<button class="sf-ibtn" title="New chat" aria-label="New chat" onclick="Safeti.reset()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></button>'+
        '<button class="sf-ibtn" title="Close" aria-label="Close SAFETI" onclick="Safeti.toggle(false)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>'+
      '</div>'+
      '<div class="sf-body" id="sf-body">'+bodyHtml()+'</div>'+
      '<div class="sf-foot"><textarea id="sf-input" rows="2" maxlength="3000" placeholder="'+(chatReady()?'Write to SAFETI… (Enter to send)':'Sign in to chat')+'" '+(disabled?'disabled':'')+' oninput="Safeti.onInput(this)" onkeydown="Safeti.onKey(event)">'+esc(val)+'</textarea>'+
        '<div class="sf-bar"><span class="sf-meta">'+esc(metaText())+'</span><button class="sf-btn pri sf-send" '+(disabled?'disabled':'')+' onclick="Safeti.send()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>Send</button></div></div>'+
    '</aside>';
  document.body.classList.toggle('safeti-open', S.open);
  var nb=$('sf-body'); if(nb) nb.scrollTop = (keepScroll===false||wasBottom)? nb.scrollHeight : prevTop;
  if(hadFocus && !disabled){ var nt=$('sf-input'); if(nt){ nt.focus(); try{ nt.setSelectionRange(nt.value.length,nt.value.length); }catch(e){} } }
}

/* ---------- actions ---------- */
function setResult(id,state,msg){ S.tools[id]={state:state,msg:msg}; save(); }
function findTool(id){
  var last=S.messages[S.messages.length-1]; if(!last||last.role!=='assistant') return null;
  return last.content.find(function(b){ return b.type==='tool_use'&&b.id===id; })||null;
}
function runOne(b){
  return new Promise(function(res){
    var out;
    try{ out=EXEC[b.name](b.input); }
    catch(e){ setResult(b.id,'failed',e&&e.message?e.message:'Could not apply.'); return res(false); }
    Promise.resolve(out).then(function(msg){ setResult(b.id,'applied',String(msg||'')); res(true); },
      function(e){ setResult(b.id,'failed',e&&e.message?e.message:'Could not apply.'); res(false); });
  });
}
function reflow(){ renderPanel(); }

var Safeti={
  toggle:function(on){
    S.open=(on===undefined)?!S.open:!!on; lsSet(LS_OPEN,S.open?'1':'0');
    if(S.open){ S.unread=false; if(!S.status) Safeti.loadStatus(); }
    renderPanel(false);
    try{ window.dispatchEvent(new Event('resize')); }catch(e){}
    if(S.open) setTimeout(function(){ var t=$('sf-input'); if(t&&!t.disabled) t.focus(); },50);
  },
  loadStatus:function(){
    S.statusLoading=true; renderPanel();
    return fetch('/api/ai',{credentials:'same-origin'}).then(function(r){ return r.json(); })
      .then(function(d){ S.status=d; S.remaining=d&&d.remaining!=null?d.remaining:null; })
      .catch(function(){ S.status={offline:true}; })
      .then(function(){ S.statusLoading=false; renderPanel(false); });
  },
  onInput:function(el){ S.text=el.value; el.style.height='auto'; el.style.height=Math.min(130,el.scrollHeight)+'px'; },
  onKey:function(e){ if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){ e.preventDefault(); Safeti.send(); } },
  chip:function(k){ var c=suggestChips()[k]; if(c) Safeti.send(c.q); },
  reset:function(){
    if(S.busy) return;
    S.messages=[]; S.tools={}; S.error=null; S.text=''; save(); renderPanel(false);
  },
  apply:function(id){
    var b=findTool(id); if(!b||S.applying) return;
    S.applying=true; reflow();
    runOne(b).then(function(){ S.applying=false; reflow(); });
  },
  skip:function(id){ if(!findTool(id)) return; setResult(id,'skipped',''); reflow(); },
  applyAll:function(){
    if(S.applying) return;
    var list=pendingTools(); S.applying=true; reflow();
    // in order; stop at the first failure so later steps do not run on a broken state
    list.reduce(function(p,b){ return p.then(function(ok){ return ok? runOne(b) : false; }); }, Promise.resolve(true))
      .then(function(){ S.applying=false; reflow(); });
  },
  skipAll:function(){ pendingTools().forEach(function(b){ S.tools[b.id]={state:'skipped',msg:''}; }); save(); reflow(); },

  send:function(textOverride){
    if(S.busy||S.applying) return;
    if(!chatReady()||outOfQuota()) return;
    var ta=$('sf-input');
    var text=String(textOverride!=null?textOverride:(ta?ta.value:S.text)).trim();
    if(!text) return;
    S.error=null;
    // Close the proposals of the last answer: each tool call gets its result (applied / skipped / failed).
    var blocks=[], pendingIds=[];
    var last=S.messages[S.messages.length-1];
    if(last&&last.role==='assistant'){
      last.content.forEach(function(b){
        if(b.type!=='tool_use') return;
        var st=S.tools[b.id]||{state:'pending'};
        var r= st.state==='applied'? 'Applied by the user. '+(st.msg||'') : st.state==='failed'? 'Could not be applied: '+(st.msg||'error') : 'Not applied (skipped by the user).';
        if(st.state==='pending') pendingIds.push(b.id);
        blocks.push({type:'tool_result', tool_use_id:b.id, content:r.slice(0,380)});
      });
    }
    blocks.push({type:'text', text:text.slice(0,3000)});
    var userMsg={role:'user', content:blocks};
    var payload=historyForRequest(userMsg);
    S.messages.push(userMsg); S.text=''; S.busy=true; save(); renderPanel(false);
    var ctx; try{ ctx=buildContext(); }catch(e){ ctx={view:app().state.view}; }
    fetch('/api/ai/chat',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:payload,context:ctx})})
      .then(function(r){ return r.json().catch(function(){return {};}).then(function(d){ return {ok:r.ok,d:d}; }); })
      .then(function(x){
        S.busy=false;
        if(!x.ok){
          // The answer failed: take the user's message back so the conversation stays consistent.
          S.messages.pop(); S.text=text;
          if(x.d.error==='auth'){ S.status={signedIn:false,configured:true}; }
          if(x.d.error==='bad_history'){ S.messages=[]; S.tools={}; S.error='The conversation was out of sync, so I started a new one. Please send your message again.'; }
          else S.error=errorText(x.d);
          if(x.d.error==='quota'){ S.remaining=0; }
        } else {
          pendingIds.forEach(function(id){ S.tools[id]={state:'skipped',msg:''}; });
          S.messages.push({role:'assistant', content:x.d.content});
          if(x.d.truncated) S.error='The answer was cut because it was too long. Ask SAFETI to continue.';
          if(x.d.remaining!==undefined) S.remaining=x.d.remaining;
          if(!S.open) S.unread=true;
        }
        save(); renderPanel(false);
      })
      .catch(function(){
        S.busy=false; S.messages.pop(); S.text=text;
        S.error='Could not reach SAFETI. It works only on the BVLOS Safety Academy website, with an internet connection.';
        save(); renderPanel(false);
      });
  },

  // Called by the app after each render: show the button only after the app login.
  sync:function(){
    var root=$('safeti-root'); if(!root) return;
    var show=!!(app()&&app().state&&app().state.user);
    root.style.display=show?'':'none';
    document.body.classList.toggle('safeti-open', show&&S.open);
    // keep the header line (mission name) fresh without rebuilding the chat
    if(show){
      var d=app().state.draft, el=document.querySelector('.sf-head .sf-title span');
      if(el) el.textContent= d&&d.name ? 'Mission: '+d.name : (d? 'Mission open' : 'UAS safety assistant');
    }
  }
};
window.Safeti=Safeti;

/* ---------- start ---------- */
function start(){
  if($('safeti-root')) return;
  var st=document.createElement('style'); st.id='safeti-css'; st.textContent=CSS; document.head.appendChild(st);
  var root=document.createElement('div'); root.id='safeti-root'; document.body.appendChild(root);
  load();
  S.open=(lsGet(LS_OPEN)==='1');
  renderPanel(false);
  if(S.open) Safeti.loadStatus();
  Safeti.sync();
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start); else start();
})();
