/* ============================================================
   SAFETI — chat assistant of AeroSafety Case (side panel)
   - Talks to /api/ai/chat on the BVLOS Safety Academy site (needs a signed-in site account).
   - SAFETI only PROPOSES actions. Nothing changes in a mission until the user clicks Apply.
   - SAFETI has no action for checklist ticks, safety flags, document validity, control status
     Implemented/Verified, or signing the GO/NO-GO decision. Those stay human.
   ============================================================ */
(function(){
'use strict';

var LS_KEY='safeti_chat_v1', LS_OPEN='safeti_open_v1', LS_DOCS='safeti_docs_v1', SS_HINT='safeti_hint_v1';
var BADGE='AI'; // text on the launcher badge
var SEVNUM={A:5,B:4,C:3,D:2,E:1};
var STEP_LABELS=['General data','Location & map','UAS & crew','Hazards','Mitigations','Checklist','Documents','GO/NO-GO decision','Report'];

var S={
  open:false, messages:[], tools:{}, busy:false, error:null, status:null, statusLoading:false,
  remaining:null, text:'', applying:false, hint:false, docs:[], viewer:{open:false,mode:'list',docId:null}, docCtrl:null, genId:null
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
'.sf-launch{position:fixed;right:22px;bottom:22px;z-index:900;width:68px;height:68px;border-radius:50%;border:2.5px solid var(--navy-800);background:#fff;box-shadow:0 6px 18px rgba(11,35,71,.32);cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;transition:transform .15s,box-shadow .15s;}',
'.sf-launch:hover{transform:scale(1.07);box-shadow:0 8px 24px rgba(11,35,71,.42);}',
'.sf-launch .sf-ai{position:absolute;left:-6px;bottom:-4px;background:#FF9A2E;color:#fff;font-size:12.5px;font-weight:900;letter-spacing:.05em;line-height:1;padding:5px 8px;border-radius:11px;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.25);}',
'.sf-launch .sf-tag{position:absolute;right:76px;top:50%;transform:translateY(-50%);background:var(--navy-900);color:#fff;font-size:12px;font-weight:700;padding:6px 10px;border-radius:7px;white-space:nowrap;opacity:0;pointer-events:none;transition:opacity .15s;}',
'.sf-launch:hover .sf-tag{opacity:1;}',
'.sf-dot{position:absolute;top:2px;right:2px;width:14px;height:14px;border-radius:50%;background:#E5484D;border:2px solid #fff;display:none;}',
'.sf-launch.unread .sf-dot{display:block;}',
'.sf-hint{position:fixed;right:22px;bottom:100px;z-index:899;max-width:250px;background:var(--navy-900);color:#fff;font-size:12.5px;line-height:1.45;padding:11px 30px 11px 13px;border-radius:12px 12px 4px 12px;box-shadow:0 8px 24px rgba(11,35,71,.35);cursor:pointer;animation:sfhint .4s ease-out;}',
'.sf-hint b{color:#FFB866;}',
'.sf-hint .sf-x{position:absolute;top:5px;right:7px;background:none;border:none;color:#b9cbe2;font-size:16px;cursor:pointer;padding:2px 4px;line-height:1;}',
'@keyframes sfhint{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}',
'body.safeti-open .sf-hint{display:none;}',
'body:not(.safeti-open) .toast{bottom:104px!important;}',
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
'@media (max-width:880px){.sf-panel{width:100vw;}.sf-launch{right:16px;bottom:16px;width:60px;height:60px;}.sf-launch .sf-tag{display:none;}.sf-hint{right:16px;bottom:88px;}body:not(.safeti-open) .toast{bottom:90px!important;}}',
'.sf-hbadge{position:absolute;top:-4px;right:-4px;background:#FF9A2E;color:#fff;font-size:9.5px;font-weight:800;border-radius:8px;padding:1px 5px;}',
'.sf-ibtn{position:relative;}',
'#safeti-viewer{position:fixed;inset:0;z-index:1000;background:rgba(8,16,28,.55);display:none;align-items:center;justify-content:center;padding:18px;}',
'#safeti-viewer.on{display:flex;}',
'.sf-vwin{background:#fff;border-radius:12px;width:min(920px,100%);height:min(94vh,1000px);display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,.4);overflow:hidden;font-family:var(--sans);}',
'.sf-vhead{display:flex;align-items:center;gap:8px;padding:10px 14px;background:var(--navy-900);color:#fff;flex-wrap:wrap;}',
'.sf-vhead .sf-vt{flex:1;min-width:160px;}.sf-vhead b{font-size:14px;display:block;}.sf-vhead span{font-size:11px;color:#b9cbe2;}',
'.sf-vhead .sf-btn{background:rgba(255,255,255,.12);color:#fff;border-color:rgba(255,255,255,.25);}.sf-vhead .sf-btn:hover{background:rgba(255,255,255,.25);}',
'.sf-vbody{flex:1;overflow-y:auto;padding:26px 34px;background:#fff;}',
'.sf-vwarn{background:#FFF6E5;border-bottom:1px solid #f0d9a8;color:#7a5a05;font-size:11.5px;padding:7px 14px;}',
'.sf-vdoc{font-size:13.5px;line-height:1.6;color:#0F1D2E;max-width:780px;margin:0 auto;}',
'.sf-vdoc h1{font-size:23px;color:var(--navy-900);margin:0 0 14px;border-bottom:3px solid var(--blue-accent);padding-bottom:8px;}',
'.sf-vdoc h2{font-size:17px;color:var(--navy-800);margin:24px 0 8px;}.sf-vdoc h3{font-size:14.5px;color:var(--navy-800);margin:16px 0 6px;}.sf-vdoc h4{font-size:13.5px;margin:12px 0 4px;}',
'.sf-vdoc p{margin:0 0 9px;}.sf-vdoc ul,.sf-vdoc ol{margin:4px 0 10px;padding-left:22px;}.sf-vdoc li{margin-bottom:3px;}',
'.sf-vdoc table{border-collapse:collapse;width:100%;margin:8px 0 14px;font-size:12px;}.sf-vdoc th,.sf-vdoc td{border:1px solid #b9c4d0;padding:5px 7px;vertical-align:top;text-align:left;}.sf-vdoc th{background:var(--blue-soft);color:var(--navy-800);}',
'.sf-vdoc .ph{background:#FFF2B8;border-radius:3px;padding:0 2px;}.sf-vdoc hr{border:none;border-top:1px solid var(--border);margin:16px 0;}.sf-vdoc code{background:#EEF2F6;padding:0 4px;border-radius:3px;font-size:12px;}',
'.sf-vcursor{display:inline-block;width:8px;height:15px;background:var(--blue-accent);vertical-align:-2px;animation:sfled 1s infinite;}',
'.sf-dlist{max-width:640px;margin:0 auto;}.sf-dli{display:flex;gap:10px;align-items:center;border:1px solid var(--border);border-radius:9px;padding:10px 12px;margin-bottom:8px;}',
'.sf-dli .sf-dt{flex:1;min-width:0;}.sf-dli b{font-size:13px;display:block;}.sf-dli span{font-size:11.5px;color:var(--text-mute);}',
'@media (max-width:880px){.sf-vbody{padding:16px 14px;}#safeti-viewer{padding:0;}.sf-vwin{height:100vh;border-radius:0;}}',
'@media print{#safeti-viewer{display:none!important;}#safeti-root{display:none!important;}body.safeti-open{padding-right:0!important;}}'
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
  create_document:function(i){
    if(S.genId) throw new Error('Another document is being written. Wait for it to finish.');
    return generateDoc(i);
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
  add_hazards:'Add hazards',create_document:'Write a document',add_controls:'Add controls to a hazard',rate_residual:'Set residual risk',open_mission:'Open a mission',navigate:'Go to'};
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
  if(name==='create_document'){
    var d0=app().state.draft;
    var rows=['<b>Language:</b> '+(i.language==='es'?'Spanish':'English')];
    if(i.use_open_mission) rows.push(d0? '<b>Based on the open mission:</b> '+esc(d0.name||d0.code||'(no name)') : '<b>No mission is open</b>: placeholders will be used');
    if(i.notes) rows.push('<b>Facts I will use:</b> <span class="sf-det">'+esc(i.notes.slice(0,240))+(i.notes.length>240?'…':'')+'</span>');
    rows.push('<span class="sf-det">Uses 1 message. Takes 1 to 3 minutes. It is a draft: you complete and review it.</span>');
    return li(rows);
  }
  if(name==='open_mission'){
    var m=app().state.missions.find(function(x){return x.id===i.mission_id;});
    return '<div><b>'+esc(m?(m.name||m.code):'(mission not found)')+'</b></div>';
  }
  if(name==='navigate') return '<div><b>'+esc(i.view)+(i.step?' · step '+i.step+' '+esc(STEP_LABELS[i.step-1]||''):'')+'</b></div>';
  return '';
}
var DOC_TITLES={sms_manual:'SMS Manual',risk_assessment:'Safety Risk Assessment Report',risk_matrix:'Risk Matrix and Acceptance Criteria',conops:'Concept of Operations (ConOps)',
  ops_manual:'UAS Operations Manual',emergency_plan:'Emergency Response and Contingency Plan',training_program:'Crew Training and Currency Programme',
  maintenance_program:'UAS Maintenance and Inspection Programme',waiver_narrative:'BVLOS Waiver Safety Case Narrative',hazard_log:'Hazard Log and Risk Register',
  safety_policy:'Safety Policy and Accountability',incident_reporting:'Occurrence Reporting and Investigation Procedure',checklists:'Flight Checklists Set',
  spi_audit_plan:'Safety Assurance Plan: SPIs and Audits'};
function cardTitle(name,i){
  if(name==='create_document') return 'Write: '+(DOC_TITLES[i.doc_type]||i.doc_type);
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
    h+='<div class="sf-row"><button class="sf-btn pri" '+(S.applying||S.busy?'disabled':'')+' onclick="Safeti.apply(\''+b.id+'\')">'+(b.name==='create_document'?'Generate':'Apply')+'</button>'+
       '<button class="sf-btn" '+(S.applying||S.busy?'disabled':'')+' onclick="Safeti.skip(\''+b.id+'\')">Skip</button></div>';
  }
  if(st.state==='applied' && st.docId && S.docs.some(function(x){return x.id===st.docId;})) h+='<div class="sf-row"><button class="sf-btn pri" onclick="Safeti.openDoc(\''+st.docId+'\')">Open document</button></div>';
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
  c.push({t:'Write my SMS Manual', q:'I want you to write the SMS Manual of my company. Ask me what you need first.'});
  c.push({t:'Which documents does the FAA expect from me?', q:'Which documents do I need to prepare for the FAA as a UAS operator? Ask me for my authorization path and propose a document package.'});
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
      '<p>Your UAS safety <b>'+BADGE+'</b> assistant. I <b>build missions</b> from your data and coordinates, review them, and <b>write documents</b>: SMS manuals, risk analyses, risk matrices and the documents an operator may have to show the FAA. I propose, you decide.</p></div>'+
      '<div class="sf-chips">'+suggestChips().map(function(c,k){ return '<button class="sf-chip" onclick="Safeti.chip('+k+')">'+esc(c.t)+'</button>'; }).join('')+'</div>'+
      '<div class="sf-note">SAFETI uses an AI service (Anthropic). What you type, and the data of the mission open in the app, are sent to it to answer. Do not include personal data you do not need. SAFETI is a draft helper: a qualified person must check everything, and it never ticks checklists, sets safety flags, validates documents or signs a decision. Missions stay in this browser. <a href="/legal/ai-use" target="_blank" rel="noopener">AI Use Policy</a> · <a href="/legal/app-terms" target="_blank" rel="noopener">Terms</a> · <a href="/legal/privacy" target="_blank" rel="noopener">Privacy</a></div>';
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
    (S.hint&&!S.open?'<div class="sf-hint" onclick="Safeti.toggle(true)"><button class="sf-x" aria-label="Close" onclick="event.stopPropagation();Safeti.hideHint()">&times;</button>Hi! I\'m <b>SAFETI</b>, your <b>'+BADGE+'</b> assistant. I can build your missions and write SMS manuals and risk analyses.</div>':'')+
    '<button class="sf-launch'+(S.unread?' unread':'')+'" onclick="Safeti.toggle(true)" aria-label="Open SAFETI, the '+BADGE+' assistant">'+mascot({size:54,mood:'idle'})+'<span class="sf-ai">'+BADGE+'</span><span class="sf-dot"></span><span class="sf-tag">Ask SAFETI, your '+BADGE+' assistant</span></button>'+
    '<aside class="sf-panel" role="complementary" aria-label="SAFETI assistant">'+
      '<div class="sf-head">'+mascot({size:38,mood:S.busy?'think':'idle'})+'<div class="sf-title"><b>SAFETI</b><span>'+esc(sub)+'</span></div>'+
        '<button class="sf-ibtn" title="My documents" aria-label="My documents" onclick="Safeti.docList()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/></svg>'+(S.docs.length?'<span class="sf-hbadge">'+S.docs.length+'</span>':'')+'</button>'+
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
    Promise.resolve(out).then(function(r){
        var msg=(r&&typeof r==='object')?r.msg:r;
        setResult(b.id,'applied',String(msg||'')); if(r&&r.docId){ S.tools[b.id].docId=r.docId; save(); } res(true); },
      function(e){ setResult(b.id,'failed',e&&e.message?e.message:'Could not apply.'); res(false); });
  });
}
function reflow(){ renderPanel(); }

/* ---------- documents: markdown to HTML, viewer, download ---------- */
function docInline(t){
  var h=esc(t);
  h=h.replace(/`([^`]+)`/g,'<code>$1</code>');
  h=h.replace(/\*\*([^*]+)\*\*/g,'<b>$1</b>').replace(/(^|[^*])\*([^*\s][^*]*)\*/g,'$1<i>$2</i>');
  h=h.replace(/\[(?:to be completed|por completar|pendiente|a completar)[^\]]*\]/gi,function(m){ return '<span class="ph">'+m+'</span>'; });
  return h;
}
function splitRow(l){ return l.trim().replace(/^\|/,'').replace(/\|$/,'').split('|').map(function(c){ return c.trim(); }); }
function docMd(text){
  var lines=String(text||'').replace(/\r/g,'').split('\n'), out='', i=0, list=null;
  function close(){ if(list){ out+='</'+list+'>'; list=null; } }
  while(i<lines.length){
    var l=lines[i], m;
    if(/^\s*\|/.test(l) && i+1<lines.length && /^\s*\|?\s*:?-{2,}/.test(lines[i+1])){
      close();
      var head=splitRow(l); i+=2; var rows=[];
      while(i<lines.length && /^\s*\|/.test(lines[i])){ rows.push(splitRow(lines[i])); i++; }
      out+='<table><thead><tr>'+head.map(function(c){return '<th>'+docInline(c)+'</th>';}).join('')+'</tr></thead><tbody>'+
        rows.map(function(r){ return '<tr>'+head.map(function(_,k){ return '<td>'+docInline(r[k]||'')+'</td>'; }).join('')+'</tr>'; }).join('')+'</tbody></table>';
      continue;
    }
    if((m=l.match(/^(#{1,4})\s+(.*)$/))){ close(); var n=m[1].length; out+='<h'+n+'>'+docInline(m[2])+'</h'+n+'>'; i++; continue; }
    if(/^\s*(?:---+|\*\*\*+)\s*$/.test(l)){ close(); out+='<hr>'; i++; continue; }
    if((m=l.match(/^\s*([-*•]|\d+[.)])\s+(.*)$/))){
      var tag=/\d/.test(m[1])?'ol':'ul';
      if(list!==tag){ close(); out+='<'+tag+'>'; list=tag; }
      out+='<li>'+docInline(m[2])+'</li>'; i++; continue;
    }
    if(!l.trim()){ close(); i++; continue; }
    close(); out+='<p>'+docInline(l)+'</p>'; i++;
  }
  close(); return out;
}
var DOC_CSS='body{font-family:Calibri,Arial,sans-serif;font-size:11pt;line-height:1.5;color:#111;margin:0;}h1{font-size:20pt;color:#0B2347;border-bottom:2px solid #1E88C9;padding-bottom:4pt;}h2{font-size:14pt;color:#142C56;margin-top:16pt;}h3{font-size:12pt;color:#142C56;}h4{font-size:11pt;}table{border-collapse:collapse;width:100%;margin:6pt 0 10pt;font-size:9.5pt;}th,td{border:1px solid #888;padding:3pt 5pt;vertical-align:top;text-align:left;}th{background:#E9F2FB;}.ph{background:#FFF2B8;}code{font-family:Consolas,monospace;}hr{border:0;border-top:1px solid #aaa;}';
function docHtmlPage(doc,forPrint){
  var title=esc(doc.title||'Document');
  return '<!DOCTYPE html><html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><title>'+title+'</title><style>'+DOC_CSS+(forPrint?'@page{margin:18mm 16mm;}body{margin:0;}':'')+'</style></head><body>'+docMd(doc.text)+
    '<hr><p style="font-size:8.5pt;color:#555;">Draft prepared with SAFETI (AI), AeroSafety Case, BVLOS Safety Academy. Not approved or reviewed by the FAA. Must be completed and reviewed by a qualified person.</p></body></html>';
}
function slug(t){ return String(t||'document').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,60)||'document'; }
function wordCount(t){ return (String(t||'').match(/\S+/g)||[]).length; }
function saveDocs(){
  // keep the 8 newest documents; if storage is full, drop the oldest until it fits
  var list=S.docs.slice(0,8);
  for(var k=0;k<8;k++){
    try{ window.localStorage.setItem(LS_DOCS,JSON.stringify(list)); return; }catch(e){ list=list.slice(0,Math.max(0,list.length-1)); if(!list.length) return; }
  }
}
function loadDocs(){
  try{ var d=JSON.parse(lsGet(LS_DOCS)||'[]'); if(Array.isArray(d)) S.docs=d.filter(function(x){ return x&&x.id&&typeof x.text==='string'; }); }catch(e){ S.docs=[]; }
}
function getDoc(id){ return S.docs.find(function(x){ return x.id===id; }); }

function viewerEl(){
  var v=$('safeti-viewer');
  if(!v){ v=document.createElement('div'); v.id='safeti-viewer'; document.body.appendChild(v); }
  return v;
}
function renderViewer(onlyBody){
  var v=viewerEl(), vw=S.viewer;
  if(!vw.open){ v.className=''; v.innerHTML=''; return; }
  v.className='on';
  if(vw.mode==='doc'){
    var doc=getDoc(vw.docId);
    if(!doc){ vw.mode='list'; return renderViewer(); }
    var streaming=(S.genId===doc.id);
    var html=docMd(doc.text)+(streaming?'<span class="sf-vcursor"></span>':'');
    if(onlyBody){ var body=$('sf-vdoc'); if(body){ var scroller=$('sf-vbody'); var atEnd=scroller.scrollHeight-scroller.scrollTop-scroller.clientHeight<120; body.innerHTML=html; if(atEnd&&streaming) scroller.scrollTop=scroller.scrollHeight; var st=$('sf-vstat'); if(st) st.textContent=(streaming?'Writing… ':'')+wordCount(doc.text).toLocaleString()+' words'; return; } }
    v.innerHTML='<div class="sf-vwin" role="dialog" aria-label="Document">'+
      '<div class="sf-vhead"><div class="sf-vt"><b>'+esc(doc.title||'Document')+'</b><span id="sf-vstat">'+(streaming?'Writing… ':'')+wordCount(doc.text).toLocaleString()+' words</span></div>'+
        (streaming?'<button class="sf-btn" onclick="Safeti.stopDoc()">Stop</button>':
          '<button class="sf-btn" onclick="Safeti.copyDoc()">Copy</button><button class="sf-btn" onclick="Safeti.downloadDoc()">Word (.doc)</button><button class="sf-btn" onclick="Safeti.printDoc()">PDF / Print</button>')+
        '<button class="sf-btn" onclick="Safeti.docList()">My documents</button><button class="sf-btn" onclick="Safeti.closeViewer()">Close</button></div>'+
      '<div class="sf-vwarn">AI-generated draft. Not approved or reviewed by the FAA. Fill in the <span class="ph" style="background:#FFF2B8;padding:0 3px;">[highlighted]</span> items, check every fact and regulation, and have a qualified person approve it.'+(doc.truncated?' <b>The text was cut because it reached the length limit.</b>':'')+(doc.partial?' <b>This document is incomplete.</b>':'')+'</div>'+
      '<div class="sf-vbody" id="sf-vbody"><div class="sf-vdoc" id="sf-vdoc">'+html+'</div></div></div>';
    var sc=$('sf-vbody'); if(sc&&streaming) sc.scrollTop=sc.scrollHeight;
  } else {
    v.innerHTML='<div class="sf-vwin" role="dialog" aria-label="My documents"><div class="sf-vhead"><div class="sf-vt"><b>My documents</b><span>Saved in this browser only. Download them to keep them.</span></div><button class="sf-btn" onclick="Safeti.closeViewer()">Close</button></div>'+
      '<div class="sf-vbody"><div class="sf-dlist">'+(S.docs.length? S.docs.map(function(d){
        return '<div class="sf-dli"><div class="sf-dt"><b>'+esc(d.title||'Document')+'</b><span>'+esc(new Date(d.created).toLocaleString())+' · '+wordCount(d.text).toLocaleString()+' words'+(d.partial?' · incomplete':'')+'</span></div>'+
          '<button class="sf-btn pri" onclick="Safeti.openDoc(\''+d.id+'\')">Open</button><button class="sf-btn" onclick="Safeti.delDoc(\''+d.id+'\')">Delete</button></div>';
      }).join('') : '<div style="text-align:center;color:var(--text-mute);padding:30px 0;">No documents yet. Ask SAFETI to write one, for example an SMS Manual.</div>')+'</div></div></div>';
  }
}
var _vt=null;
function renderViewerSoon(){ if(_vt) return; _vt=setTimeout(function(){ _vt=null; renderViewer(true); },180); }

function orgForDoc(){
  var o=app().state.org||{}, out={};
  if(o.name && o.name!=='Aerial Risk Solutions') out.name=o.name;
  if(o.operatorNumber && o.operatorNumber!=='EU-UAS-00231') out.operatorNumber=o.operatorNumber;
  return out;
}
function generateDoc(input){
  return new Promise(function(resolve,reject){
    var id=uid(), doc={id:id, type:input.doc_type, title:DOC_TITLES[input.doc_type]||'Document', lang:input.language, created:Date.now(), text:'', partial:false, truncated:false};
    S.docs.unshift(doc); S.genId=id; S.viewer={open:true,mode:'doc',docId:id}; renderViewer(); renderPanel();
    var ctrl=new AbortController(); S.docCtrl=ctrl;
    var mission=(input.use_open_mission&&app().state.draft)? missionContext(app().state.draft) : null;
    var finish=function(err,keep){
      S.docCtrl=null; S.genId=null;
      if(!doc.text.trim()){ S.docs=S.docs.filter(function(x){return x.id!==id;}); S.viewer={open:false,mode:'list',docId:null}; }
      else { var h=doc.text.match(/^#\s+(.+)$/m); if(h) doc.title=h[1].trim().slice(0,120); if(err) doc.partial=true; }
      saveDocs(); renderViewer(); renderPanel();
      if(err) reject(new Error(err)); else resolve({msg:'Document "'+doc.title+'" written ('+wordCount(doc.text)+' words) and shown in the viewer. The user can copy it, download it for Word or print it as PDF. Placeholders in square brackets are still to be completed by the user.'+(doc.truncated?' The text reached the length limit and was cut.':''), docId:id});
    };
    fetch('/api/ai/doc',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},signal:ctrl.signal,
      body:JSON.stringify({doc_type:input.doc_type, lang:input.language, notes:input.notes||'', mission:mission, org:orgForDoc()})})
    .then(function(r){
      if(!r.ok) return r.json().catch(function(){return {};}).then(function(d){
        if(d.error==='auth') S.status={signedIn:false,configured:true};
        if(d.error==='quota') S.remaining=0;
        throw new Error(errorText(d));
      });
      var rem=r.headers.get('x-remaining'); if(rem!==null && rem!=='') S.remaining=Number(rem);
      var reader=r.body.getReader(), dec=new TextDecoder(), acc='';
      function pump(){
        return reader.read().then(function(x){
          if(x.done){
            var cut=acc.indexOf('\u0000'), tail='';
            if(cut>=0){ tail=acc.slice(cut+1); acc=acc.slice(0,cut); }
            doc.text=acc;
            if(tail.indexOf('TRUNC')===0) doc.truncated=true;
            if(tail.indexOf('ERR:')===0){
              var code=tail.slice(4);
              return finish(code==='interrupted'?'The document was interrupted. A partial version was kept in My documents.':'SAFETI could not write the document. Please try again. This attempt was not counted.');
            }
            return finish(null);
          }
          acc+=dec.decode(x.value,{stream:true});
          var c=acc.indexOf('\u0000'); doc.text=c>=0?acc.slice(0,c):acc;
          renderViewerSoon(); return pump();
        });
      }
      return pump();
    })
    .catch(function(e){
      if(e&&e.name==='AbortError'){ return finish('Stopped. '+(doc.text.trim()?'The partial text was kept in My documents.':'No document was kept.')); }
      if(doc.text.trim()) return finish('The connection was lost. A partial version was kept in My documents.');
      finish(e&&e.message?e.message:'Could not reach SAFETI.');
    });
  });
}

var Safeti={
  toggle:function(on){
    S.open=(on===undefined)?!S.open:!!on; lsSet(LS_OPEN,S.open?'1':'0');
    if(S.open){ S.unread=false; if(!S.status) Safeti.loadStatus(); }
    renderPanel(false);
    try{ window.dispatchEvent(new Event('resize')); }catch(e){}
    if(S.open) setTimeout(function(){ var t=$('sf-input'); if(t&&!t.disabled) t.focus(); },50);
  },
  hideHint:function(){ S.hint=false; try{ window.sessionStorage.setItem(SS_HINT,'1'); }catch(e){} renderPanel(false); },
  docList:function(){ S.viewer={open:true,mode:'list',docId:null}; renderViewer(); },
  openDoc:function(id){ if(!getDoc(id)) return; S.viewer={open:true,mode:'doc',docId:id}; renderViewer(); },
  closeViewer:function(){ S.viewer.open=false; renderViewer(); },
  delDoc:function(id){ if(S.genId===id) return; S.docs=S.docs.filter(function(x){return x.id!==id;}); saveDocs(); renderViewer(); renderPanel(); },
  stopDoc:function(){ if(S.docCtrl) S.docCtrl.abort(); },
  copyDoc:function(){
    var d=getDoc(S.viewer.docId); if(!d) return;
    try{ navigator.clipboard.writeText(d.text).then(function(){ app().showToast('Document copied (Markdown text).'); }); }catch(e){ app().showToast('Select the text and copy it manually.'); }
  },
  downloadDoc:function(){
    var d=getDoc(S.viewer.docId); if(!d) return;
    var blob=new Blob(['\ufeff'+docHtmlPage(d,false)],{type:'application/msword'});
    var a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=slug(d.title)+'.doc';
    document.body.appendChild(a); a.click(); setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); },500);
  },
  printDoc:function(){
    var d=getDoc(S.viewer.docId); if(!d) return;
    var w=window.open('','_blank');
    if(!w){ app().showToast('Allow pop-ups to print, or download the Word file.'); return; }
    w.document.open(); w.document.write(docHtmlPage(d,true)); w.document.close();
    w.focus(); setTimeout(function(){ try{ w.print(); }catch(e){} },400);
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
  load(); loadDocs();
  S.open=(lsGet(LS_OPEN)==='1');
  try{ if(!S.open && !window.sessionStorage.getItem(SS_HINT)) setTimeout(function(){ if(!S.open&&app()&&app().state&&app().state.user){ S.hint=true; renderPanel(false); setTimeout(function(){ if(S.hint){ S.hint=false; renderPanel(false); } },14000); } },2500); }catch(e){}
  renderPanel(false);
  if(S.open) Safeti.loadStatus();
  Safeti.sync();
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start); else start();
})();
