(function(){
"use strict";
var $=function(id){return document.getElementById(id);};
var reduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var CONFIG={MP3:"/vigilia-assets/VIGILIA_EP00_Prueba_v1.m4a.mp3",LEADS_ENDPOINT:"/",DEMO:false,GOALS:{leads:50,wtp:40,comp:65,fb:5}};
var ART_FALLBACK="data:image/svg+xml,"+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"><defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a2450"/><stop offset="1" stop-color="#0a0f24"/></linearGradient></defs><rect width="800" height="600" fill="url(#s)"/><circle cx="640" cy="110" r="34" fill="#f3e9d2"/><circle cx="652" cy="102" r="30" fill="#1a2450"/><g fill="#dfe6ff"><circle cx="120" cy="80" r="2"/><circle cx="260" cy="140" r="1.6"/><circle cx="420" cy="70" r="2"/><circle cx="540" cy="180" r="1.4"/><circle cx="720" cy="240" r="1.8"/><circle cx="80" cy="220" r="1.4"/><circle cx="340" cy="200" r="1.2"/></g><path d="M0 470 Q200 430 420 460 T800 450 V600 H0 Z" fill="#241a04"/><g fill="#f3e9d2"><path d="M180 470 l14 -150 h40 l14 150 z"/><path d="M420 460 l16 -180 h46 l16 180 z"/><path d="M640 455 l12 -130 h36 l12 130 z"/></g><g fill="#0a0f24"><path d="M186 320 h56 l-28 -34 z"/><path d="M426 280 h62 l-31 -40 z"/><path d="M646 325 h48 l-24 -30 z"/></g><rect x="440" y="380" width="16" height="22" fill="#e8b64c"/><g stroke="#f3e9d2" stroke-width="6" fill="none"><path d="M452 300 L380 250"/><path d="M452 300 L524 250"/><path d="M452 300 L452 380"/><path d="M452 300 L400 360"/><path d="M452 300 L504 360"/></g><g fill="#0a0f24"><path d="M120 500 q10 -40 30 -44 l6 -26 8 24 q22 4 26 46 z"/><circle cx="150" cy="452" r="8"/><path d="M150 460 l40 -18" stroke="#0a0f24" stroke-width="5"/></g></svg>');
document.querySelectorAll("img.artImg, #heroImg").forEach(function(im){im.addEventListener("error",function(){im.src=ART_FALLBACK;},{once:true});});

/* ---------- base local ---------- */
var KEY="vigilia_okr_v1";
var mem={leads:[],feedback:[],listens:[],settings:{mode:"dormir",speed:1,amb:35,muted:false}};
function load(){try{var r=localStorage.getItem(KEY);if(r){var p=JSON.parse(r);if(p&&typeof p==="object"){mem={leads:Array.isArray(p.leads)?p.leads:[],feedback:Array.isArray(p.feedback)?p.feedback:[],listens:Array.isArray(p.listens)?p.listens:[],settings:Object.assign({mode:"dormir",speed:1,amb:35,muted:false},p.settings||{})};}}}catch(e){}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(mem));}catch(e){}}
function uid(){try{return crypto.randomUUID();}catch(e){return "id-"+Date.now()+"-"+Math.floor(Math.random()*1e6);}}
function daysAgo(n){return new Date(Date.now()-n*86400000).toISOString();}
function seedDemo(){
  mem.leads=mem.leads.filter(function(l){return !l.demo;});
  var seed=[["ana.rios@correo.pe","padre","dormir",3,2],["luis.mena@correo.cl","adulto","pensar",9,3],["sofia.v@correo.mx","estudiante","pensar",0,4],["carlos.d@correo.co","lider","pensar",15,5],["marta.l@correo.es","padre","hijos",3,6],["jorge.p@correo.ar","adulto","dormir",3,8],["elena.r@correo.uy","estudiante","hijos",9,9],["diego.f@correo.pe","lider","otro",0,11]];
  seed.forEach(function(s,i){mem.leads.push({id:"demo-"+i,email:s[0],perfil:s[1],motivo:s[2],precio_usd:s[3],created_at:daysAgo(s[4]),demo:true,source:"demo"});});
  mem.listens=mem.listens.filter(function(l){return !l.demo;});
  [82,91,44,70,100,58].forEach(function(p,i){mem.listens.push({ep:"ep01",pct:p,demo:true,ts:daysAgo(i+1)});});
  mem.feedback=mem.feedback.filter(function(f){return !f.demo;});
  ["dormir","ambos","pensar"].forEach(function(v,i){mem.feedback.push({v:v,demo:true,ts:daysAgo(i+2)});});
  save();
}
load();
if(CONFIG.DEMO&&mem.leads.length===0)seedDemo();

/* ---------- métricas ---------- */
function realLeads(){return mem.leads.filter(function(l){return !l.demo;});}
function metrics(){
  var rl=realLeads();
  var wtp=rl.length?Math.round(100*rl.filter(function(l){return +l.precio_usd>=3;}).length/rl.length):0;
  var rlis=mem.listens.filter(function(l){return !l.demo;});
  var comp=rlis.length?Math.round(100*rlis.filter(function(l){return l.pct>=65;}).length/rlis.length):0;
  var fb=mem.feedback.filter(function(f){return !f.demo&&f.v!=="ninguno";}).length;
  var weeks=1;
  return {leads:rl.length,wtp:wtp,comp:comp,fb:fb,weeks:weeks,demoLeads:mem.leads.length-rl.length};
}
function donut(pct,color,center){
  var C=276.46,d=Math.max(0,Math.min(100,pct))/100*C;
  return '<svg viewBox="0 0 120 120" width="110" height="110" role="img" aria-label="'+center+'"><circle cx="60" cy="60" r="44" fill="none" stroke="rgba(238,241,255,.12)" stroke-width="12"/><circle cx="60" cy="60" r="44" fill="none" stroke="'+color+'" stroke-width="12" stroke-linecap="round" stroke-dasharray="'+d+' '+C+'" transform="rotate(-90 60 60)"/><text x="60" y="66" text-anchor="middle" font-size="22" font-family="IBM Plex Mono,monospace" fill="#eef1fb">'+center+'</text></svg>';
}
function bars(data){
  var max=Math.max.apply(null,data.map(function(d){return d.value;}).concat([1]));
  var out='<svg viewBox="0 0 340 150" role="img" aria-label="Gráfico de barras">';
  data.forEach(function(d,i){
    var h=Math.round(d.value/max*92),x=22+i*82,y=112-h;
    out+='<rect x="'+x+'" y="'+y+'" width="56" height="'+h+'" rx="6" fill="'+d.color+'"/>';
    out+='<text x="'+(x+28)+'" y="'+(y-6)+'" text-anchor="middle" font-size="13" font-family="IBM Plex Mono,monospace" fill="#eef1fb">'+d.value+'</text>';
    out+='<text x="'+(x+28)+'" y="132" text-anchor="middle" font-size="11" fill="#aab3d0">'+d.label+'</text>';
  });
  return out+'</svg>';
}
function renderMetrics(){
  var m=metrics(),G=CONFIG.GOALS;
  $("metricsGrid").innerHTML=
   '<div class="metric"><div class="m-head"><b>Leads reales</b><span>meta '+G.leads+'</span></div>'+donut(m.leads/G.leads*100,"var(--gold)",m.leads)+'<p class="m-sub">demo: '+m.demoLeads+' · semana '+m.weeks+'/12</p></div>'+
   '<div class="metric"><div class="m-head"><b>WTP ≥ $3</b><span>meta '+G.wtp+'%</span></div>'+donut(m.wtp,"var(--blue)",m.wtp+'%')+'<p class="m-sub">sobre leads reales</p></div>'+
   '<div class="metric"><div class="m-head"><b>Finalización ≥65%</b><span>meta '+G.comp+'%</span></div>'+donut(m.comp,"var(--teal)",m.comp+'%')+'<p class="m-sub">escuchas reales</p></div>'+
   '<div class="metric"><div class="m-head"><b>Feedback +</b><span>meta '+G.fb+'</span></div>'+donut(m.fb/G.fb*100,"var(--ok)",m.fb)+'<p class="m-sub">dormir / pensar / ambos</p></div>';
  var chip=$("goChip");
  if(m.weeks<6){chip.className="chip warn";chip.textContent="En validación · semana "+m.weeks+"/12";}
  else if(m.leads>=G.leads&&m.wtp>=G.wtp&&m.comp>=G.comp&&m.fb>=G.fb){chip.className="chip ok";chip.textContent="GO · escalar a Fase 2";}
  else if(m.leads>=20||m.wtp>=20){chip.className="chip warn";chip.textContent="PIVOT · ajustar nicho/mensaje";}
  else{chip.className="chip bad";chip.textContent="STOP · reformular propuesta";}
  var pool=mem.leads.filter(function(l){return !l.demo||$("demoToggle").checked;});
  var buckets=[0,3,9,15].map(function(v,i){return {label:"$"+v,value:pool.filter(function(l){return +l.precio_usd===v;}).length,color:["var(--info)","var(--gold)","var(--teal)","var(--violet)"][i]};});
  $("chartWtp").innerHTML=bars(buckets);
  var lp=mem.listens.filter(function(l){return !l.demo||$("demoToggle").checked;});
  var cb=[{label:"<40",value:lp.filter(function(l){return l.pct<40;}).length,color:"var(--bad)"},{label:"40–64",value:lp.filter(function(l){return l.pct>=40&&l.pct<65;}).length,color:"var(--warn)"},{label:"65–89",value:lp.filter(function(l){return l.pct>=65&&l.pct<90;}).length,color:"var(--ok)"},{label:"90–100",value:lp.filter(function(l){return l.pct>=90;}).length,color:"var(--teal)"}];
  $("chartComp").innerHTML=bars(cb);
  $("fbCount").textContent=mem.feedback.filter(function(f){return !f.demo&&f.v!=="ninguno";}).length+" respuestas positivas reales";
}

/* ---------- tabla leads ---------- */
var selIds={},lastRemoved=[],drawerId=null,toastTimer=null;
function filtered(){
  var q=($("q").value||"").toLowerCase(),f=$("fPerfil").value,s=$("sortBy").value;
  var arr=mem.leads.filter(function(l){return (!f||l.perfil===f)&&(!q||(l.email+" "+l.perfil+" "+l.motivo).toLowerCase().indexOf(q)>=0);});
  arr.sort(function(a,b){
    if(s==="precio-desc")return b.precio_usd-a.precio_usd;
    if(s==="precio-asc")return a.precio_usd-b.precio_usd;
    if(s==="fecha-asc")return a.created_at<b.created_at?-1:1;
    return a.created_at>b.created_at?-1:1;
  });
  return arr;
}
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
function renderTable(){
  var arr=filtered();
  $("leadsBody").innerHTML=arr.map(function(l){
    return '<tr data-id="'+l.id+'"><td><input type="checkbox" class="rowSel" data-id="'+l.id+'" '+(selIds[l.id]?"checked":"")+' aria-label="Seleccionar '+esc(l.email)+'"></td><td>'+esc(l.email)+'</td><td>'+esc(l.perfil)+'</td><td>'+esc(l.motivo)+'</td><td>$'+esc(l.precio_usd)+'</td><td>'+esc((l.created_at||"").slice(0,10))+'</td><td>'+(l.demo?'<span class="demo-tag">demo</span>':'<span class="real-tag">real</span>')+'</td><td><button class="row-btn rowDel" data-id="'+l.id+'">eliminar</button></td></tr>';
  }).join("")||'<tr><td colspan="8">Sin registros que coincidan.</td></tr>';
  $("leadsCount").textContent=arr.length+" registros visibles · "+mem.leads.length+" totales · "+realLeads().length+" reales";
  $("bulkDel").disabled=!Object.keys(selIds).some(function(k){return selIds[k];});
}
function toast(msg,undoable){
  $("toastMsg").textContent=msg;
  $("toastUndo").style.display=undoable?"":"none";
  $("toast").classList.add("show");
  clearTimeout(toastTimer);
  toastTimer=setTimeout(function(){$("toast").classList.remove("show");},6000);
}
function removeIds(ids){
  lastRemoved=mem.leads.filter(function(l){return ids.indexOf(l.id)>=0;});
  mem.leads=mem.leads.filter(function(l){return ids.indexOf(l.id)<0;});
  ids.forEach(function(i){delete selIds[i];});
  save();renderTable();renderMetrics();
  toast(lastRemoved.length+" registro(s) eliminado(s).",true);
}
$("toastUndo").addEventListener("click",function(){mem.leads=mem.leads.concat(lastRemoved);lastRemoved=[];save();renderTable();renderMetrics();$("toast").classList.remove("show");});
$("leadsBody").addEventListener("click",function(e){
  var del=e.target.closest(".rowDel");
  if(del){removeIds([del.dataset.id]);return;}
  if(e.target.classList.contains("rowSel")){selIds[e.target.dataset.id]=e.target.checked;renderTable();return;}
  var tr=e.target.closest("tr[data-id]");
  if(tr)openDrawer(tr.dataset.id);
});
$("selAll").addEventListener("change",function(){var arr=filtered();arr.forEach(function(l){selIds[l.id]=this.checked;},this);renderTable();});
$("bulkDel").addEventListener("click",function(){removeIds(Object.keys(selIds).filter(function(k){return selIds[k];}));});
["q","fPerfil","sortBy"].forEach(function(id){$(id).addEventListener("input",renderTable);});
$("demoToggle").addEventListener("change",renderMetrics);
$("resetDemo").addEventListener("click",function(){if(confirm("¿Restablecer los datos demo? Los registros reales se conservan.")){seedDemo();renderTable();renderMetrics();toast("Datos demo restablecidos.",false);}});
function openDrawer(id){
  var l=mem.leads.filter(function(x){return x.id===id;})[0];if(!l)return;
  drawerId=id;
  $("drawerBody").innerHTML=[["Correo",l.email],["Perfil",l.perfil],["Motivo",l.motivo],["Precio","$"+l.precio_usd],["Fecha",(l.created_at||"").replace("T"," ").slice(0,16)],["Origen",l.demo?"demo":"real"],["ID",l.id]].map(function(r){return "<div><dt>"+r[0]+"</dt><dd>"+esc(r[1])+"</dd></div>";}).join("");
  $("drawer").classList.add("open");$("drawerClose").focus();
}
function closeDrawer(){$("drawer").classList.remove("open");drawerId=null;}
$("drawerClose").addEventListener("click",closeDrawer);
$("drawerDel").addEventListener("click",function(){if(drawerId){removeIds([drawerId]);closeDrawer();}});
document.addEventListener("keydown",function(e){if(e.key==="Escape"){closeDrawer();if(!$("playerFull").hidden)closePF();}});
function download(name,text,type){var b=new Blob([text],{type:type});var a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove();},400);}
$("expCsv").addEventListener("click",function(){
  var rows=[["id","email","perfil","motivo","precio_usd","created_at","origen"]];
  filtered().forEach(function(l){rows.push([l.id,l.email,l.perfil,l.motivo,l.precio_usd,l.created_at,l.demo?"demo":"real"]);});
  download("vigilia_leads.csv",rows.map(function(r){return r.map(function(c){c=String(c==null?"":c);if(/^[=+\-@]/.test(c))c="'"+c;if(/[",\n]/.test(c))c='"'+c.replace(/"/g,'""')+'"';return c;}).join(",");}).join("\n"),"text/csv");
});
$("expJson").addEventListener("click",function(){download("vigilia_leads.json",JSON.stringify(filtered(),null,2),"application/json");});
$("footPanel").addEventListener("click",function(){document.getElementById("panel").scrollIntoView({behavior:reduce?"auto":"smooth"});});

/* ---------- feedback ---------- */
document.querySelectorAll(".fb").forEach(function(b){b.addEventListener("click",function(){mem.feedback.push({v:b.dataset.v,demo:false,ts:new Date().toISOString()});save();renderMetrics();toast("Gracias. Tu respuesta alimenta el OKR de feedback.",false);});});

/* ---------- fondo / nav / reveal ---------- */
var cielo=$("cielo");
if(!reduce){for(var i=0;i<70;i++){var s=document.createElement("span");s.className="star";s.style.left=(Math.random()*100)+"%";s.style.top=(Math.random()*80)+"%";s.style.animationDelay=(Math.random()*4).toFixed(2)+"s";s.style.opacity=(0.15+Math.random()*0.6).toFixed(2);cielo.appendChild(s);}}
var rev=document.querySelectorAll(".reveal");
if("IntersectionObserver" in window&&!reduce){var io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){en.target.classList.add("on");io.unobserve(en.target);}});},{threshold:.12});rev.forEach(function(el){io.observe(el);});}else rev.forEach(function(el){el.classList.add("on");});
var spyLinks=document.querySelectorAll("a[data-spy]");
if("IntersectionObserver" in window){var spy=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){spyLinks.forEach(function(a){a.setAttribute("aria-current",a.dataset.spy===en.target.id?"true":"false");});}});},{rootMargin:"-40% 0px -55% 0px"});["escuchar","metodo","calendario","panel","espera"].forEach(function(id){var el=$(id);if(el)spy.observe(el);});}
if(!reduce){var heroArt=$("heroArt"),tick=false;window.addEventListener("scroll",function(){if(tick)return;tick=true;requestAnimationFrame(function(){var y=Math.min(window.scrollY,600);heroArt.style.transform="translateY("+(y*0.06)+"px)";tick=false;});},{passive:true});}

/* ---------- catálogo ---------- */
var EPISODES=[
{id:"ep01",week:1,obra:"Quijote I, 8",titulo:"Los molinos de viento",autor:"Cervantes",antidoto:"Verificar antes de pelear"},
{id:"ep02",week:2,obra:"Soneto preventivo",titulo:"Contra los que quieren gobernar el mundo",autor:"Quevedo",antidoto:"Primero tu casa, luego el mundo"},
{id:"ep03",week:3,obra:"Odisea · regreso",titulo:"El regreso de Ulises",autor:"Homero",antidoto:"La paciencia contra la ansiedad"},
{id:"ep04",week:4,obra:"Ilíada · cólera",titulo:"La cólera de Aquiles",autor:"Homero",antidoto:"El precio de la ira"},
{id:"ep05",week:5,obra:"Inferno V",titulo:"Paolo y Francesca",autor:"Dante",antidoto:"Nombrar los lentes del deseo"},
{id:"ep06",week:6,obra:"Quijote II · Duques",titulo:"Los gigantes de utilería",autor:"Cervantes",antidoto:"Reconocer la ficción que te gobierna"},
{id:"ep07",week:7,obra:"¡Adiós, Cordera!",titulo:"La vaca y el tren",autor:"Clarín",antidoto:"Tocar la pérdida sin quimeras"},
{id:"ep08",week:8,obra:"Soneto de la patria",titulo:"Miré los muros",autor:"Quevedo",antidoto:"Ordenar la casa antes del juicio"},
{id:"ep09",week:9,obra:"Odisea · sirenas",titulo:"El canto que no obliga",autor:"Homero",antidoto:"Atarse al mástil del criterio"},
{id:"ep10",week:10,obra:"Ilíada VI",titulo:"Héctor y Andrómaca",autor:"Homero",antidoto:"El deber que se despide"},
{id:"ep11",week:11,obra:"Inferno III",titulo:"La puerta y los tibios",autor:"Dante",antidoto:"Decidir es materia, no vértigo"},
{id:"ep12",week:12,obra:"Quijote · muerte",titulo:"Alonso Quijano recobra el juicio",autor:"Cervantes",antidoto:"Quitar los lentes a tiempo"}];
var GUIONES_ADICIONALES={};
function weekNow(){return 1;}
function epDate(){return "sin fecha anunciada";}
function guionDe(id){if(id==="ep01")return $("guion_ep01").textContent;return GUIONES_ADICIONALES[id]||null;}
function norm(t){t=t.trim();if(/^qujiote$/i.test(t))return"Quijote";if(/^narrador\s+qujiote$/i.test(t))return"Narrador Quijote";if(/^narrador\s+quijote$/i.test(t))return"Narrador Quijote";if(/^sancho$/i.test(t))return"Sancho";if(/^narrador\s+vigilia$/i.test(t))return"Narrador Vigilia";return t;}
function chunks(t){var p=t.match(/[^.!?…]+[.!?…]+|[^.!?…]+$/g)||[t];var out=[],b="";p.forEach(function(x){x=x.trim();if(!x)return;if((b+" "+x).length>170){if(b)out.push(b);b=x;}else b=(b?b+" ":"")+x;});if(b)out.push(b);return out;}
function parse(raw){var segs=[],cur="Narrador Vigilia",re=/\[([^\]]+)\]/g,m,last=0;
while((m=re.exec(raw))){var before=raw.slice(last,m.index).replace(/\s+/g," ").trim();if(before)chunks(before).forEach(function(c){segs.push({sp:cur,text:c});});var tag=m[1].trim();if(/^pausa/i.test(tag)){var s2=parseInt(tag.replace(/[^\d]/g,""),10)||3;segs.push({sp:"PAUSA",secs:s2,text:"Pausa de "+s2+" segundos"});}else cur=norm(tag);last=re.lastIndex;}
var tail=raw.slice(last).replace(/\s+/g," ").trim();if(tail)chunks(tail).forEach(function(c){segs.push({sp:cur,text:c});});return segs;}

/* ---------- audio: voces + ambiente + mute ---------- */
var synth=window.speechSynthesis,voices=[],voiceMap={};
var ROLES={"Narrador Vigilia":{rate:.92,pitch:1},"Narrador Quijote":{rate:.95,pitch:.95},"Quijote":{rate:1.02,pitch:1.18},"Sancho":{rate:.9,pitch:.78}};
var WHO={"Narrador Vigilia":"who-nv","Narrador Quijote":"who-nq","Quijote":"who-q","Sancho":"who-s","PAUSA":"who-p"};
function assignVoices(){voices=synth?(synth.getVoices()||[]):[];var es=voices.filter(function(v){return /^es/i.test(v.lang);});var pool=es.length?es:voices;["Narrador Vigilia","Narrador Quijote","Quijote","Sancho"].forEach(function(r,i){voiceMap[r]=pool.length?pool[i%pool.length]:null;});}
if(synth){assignVoices();synth.onvoiceschanged=assignVoices;}
var ambCtx=null,ambGain=null,ambSrc=null,ambLfo=null;
function ensureAmb(){
  if(ambCtx)return;
  var AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
  ambCtx=new AC();
  var len=2*ambCtx.sampleRate,buf=ambCtx.createBuffer(1,len,ambCtx.sampleRate),d=buf.getChannelData(0),last=0;
  for(var i=0;i<len;i++){var w=Math.random()*2-1;last=(last+0.02*w)/1.02;d[i]=last*3.5;}
  ambSrc=ambCtx.createBufferSource();ambSrc.buffer=buf;ambSrc.loop=true;
  var filt=ambCtx.createBiquadFilter();filt.type="lowpass";filt.frequency.value=420;
  ambLfo=ambCtx.createOscillator();ambLfo.frequency.value=0.07;
  var lg=ambCtx.createGain();lg.gain.value=140;ambLfo.connect(lg);lg.connect(filt.frequency);
  ambGain=ambCtx.createGain();ambGain.gain.value=0;
  ambSrc.connect(filt);filt.connect(ambGain);ambGain.connect(ambCtx.destination);
  ambSrc.start();ambLfo.start();
}
function ambLevel(){
  var on=playing&&!paused&&!mem.settings.muted;
  var target=on?(mem.settings.amb/100)*0.22:0;
  if(ambGain&&ambCtx)ambGain.gain.setTargetAtTime(target,ambCtx.currentTime,0.5);
  $("windDot").classList.toggle("on",target>0);
  document.querySelectorAll(".windDot2").forEach(function(w){w.style.cssText=target>0?"width:.6rem;height:.6rem;border-radius:50%;background:var(--teal);box-shadow:0 0 .6rem var(--teal)":"width:.6rem;height:.6rem;border-radius:50%;background:var(--overlay)";});
}
function setMuted(m){
  mem.settings.muted=m;save();
  $("muteBtn").setAttribute("aria-pressed",m?"true":"false");
  $("muteIcoOn").style.display=m?"none":"";
  $("muteIcoOff").style.display=m?"":"none";
  $("muteTxt").textContent=m?"Silencio":"Sonido";
  if(synth&&playing){if(m){synth.pause();}else if(!userPaused){synth.resume();}}
  ambLevel();
}
$("muteBtn").addEventListener("click",function(){setMuted(!mem.settings.muted);});

/* ---------- motor de reproducción ---------- */
var segments=[],totalEst=0,idx=0,session=0,playing=false,paused=false,userPaused=false,finished=false,errCount=0,pauseTimer=null,speed=mem.settings.speed||1,curEp="ep01",maxPct=0,listenLogged=false;
function estSec(sg){return sg.sp==="PAUSA"?sg.secs:(sg.text.trim().split(/\s+/).length)/2.6+0.4;}
function elapsed(){var t=0;for(var i=0;i<idx&&i<segments.length;i++)t+=estSec(segments[i]);return t;}
function fmt(t){t=Math.round(t);var m=Math.floor(t/60),s=t%60;return m+":"+(s<10?"0":"")+s;}
function setStatus(t){$("status").textContent=t;}
function setIcons(on){
  var lbl=on?"Pausar":(finished?"Repetir desde el inicio":"Reproducir");
  ["playBtn","pfPlay"].forEach(function(id){var b=$(id);b.setAttribute("aria-label",lbl);b.setAttribute("aria-pressed",on?"true":"false");});
  ["icoPlay","icoPlay2"].forEach(function(id){$(id).style.display=on?"none":"block";});
  ["icoPause","icoPause2"].forEach(function(id){$(id).style.display=on?"block":"none";});
}
function updateUI(){
  var pct=segments.length?Math.round(idx/segments.length*100):0,vt="≈ "+fmt(elapsed())+" / "+fmt(totalEst);
  $("barFill").style.width=pct+"%";$("pfBarFill").style.width=pct+"%";
  ["bar","pfBar"].forEach(function(id){var el=$(id);el.setAttribute("aria-valuenow",pct);el.setAttribute("aria-valuetext",vt);});
  $("timeTxt").textContent=vt;$("pfTime").textContent=vt;
}
function highlight(i){var p=$("transcript").querySelector(".segline.now");if(p)p.classList.remove("now");var el=$("seg-"+i);if(el){el.classList.add("now");el.scrollIntoView({block:"nearest",behavior:reduce?"auto":"smooth"});}}
function logListen(){if(maxPct>0&&!listenLogged){mem.listens.push({ep:curEp,pct:maxPct,demo:false,ts:new Date().toISOString()});listenLogged=true;save();renderMetrics();}maxPct=0;listenLogged=false;}
function speakNext(){
  var s=session;
  if(idx>=segments.length){playing=false;paused=false;finished=true;errCount=0;setIcons(false);updateUI();ambLevel();logListen();setStatus("Fin del episodio completo. Tu escucha quedó registrada en el panel OKR.");return;}
  var sg=segments[idx];highlight(idx);updateUI();
  maxPct=Math.max(maxPct,Math.round(idx/segments.length*100));
  if(sg.sp==="PAUSA"){setStatus("Pausa…");pauseTimer=setTimeout(function(){if(s!==session)return;idx++;speakNext();},sg.secs*1000);return;}
  setStatus("Sonando: "+sg.sp+" · "+(idx+1)+" / "+segments.length);
  var u=new SpeechSynthesisUtterance(sg.text);var r=ROLES[sg.sp]||{rate:1,pitch:1};
  u.rate=r.rate*speed;u.pitch=r.pitch;u.volume=mem.settings.muted?0:1;
  var v=voiceMap[sg.sp];if(v){u.voice=v;u.lang=v.lang;}else u.lang="es-ES";
  u.onend=function(){if(s!==session)return;errCount=0;idx++;speakNext();};
  u.onerror=function(){if(s!==session)return;errCount++;if(errCount>3){playing=false;paused=false;setIcons(false);ambLevel();setStatus("Varios errores de síntesis. Usa el Modo productor (SSML) con tu TTS.");return;}setStatus("Reintentando segmento "+(idx+1)+"…");idx++;speakNext();};
  synth.speak(u);
}
function play(){
  if(!segments.length){setStatus("Este episodio aún no tiene guion cargado.");return;}
  if(!synth){setStatus("Tu navegador no soporta síntesis de voz; usa el Modo productor (SSML).");return;}
  ensureAmb();if(ambCtx&&ambCtx.state==="suspended")ambCtx.resume();
  if(playing&&paused){synth.resume();paused=false;userPaused=false;setIcons(true);ambLevel();setStatus("Reanudando…");return;}
  if(playing)return;
  if(finished){idx=0;finished=false;}
  session++;synth.cancel();playing=true;paused=false;userPaused=false;errCount=0;listenLogged=false;setIcons(true);ambLevel();speakNext();
}
function pauseToggle(){
  if(!playing)return;
  if(paused){synth.resume();paused=false;userPaused=false;setIcons(true);setStatus("Reanudando…");}
  else if(synth.speaking){synth.pause();paused=true;userPaused=true;setIcons(false);setStatus("En pausa.");}
  ambLevel();
}
function stopAll(){session++;playing=false;paused=false;userPaused=false;finished=false;errCount=0;clearTimeout(pauseTimer);if(synth)synth.cancel();idx=0;setIcons(false);var p=$("transcript").querySelector(".segline.now");if(p)p.classList.remove("now");updateUI();ambLevel();logListen();}
function jumpTo(n){session++;if(synth)synth.cancel();clearTimeout(pauseTimer);idx=Math.max(0,Math.min(segments.length,n));finished=false;if(playing){paused=false;userPaused=false;setIcons(true);speakNext();}else{updateUI();highlight(Math.min(idx,Math.max(0,segments.length-1)));}}
function skip(sec){if(!segments.length)return;var acc=0,i=idx;
if(sec>0){while(i<segments.length&&acc<sec){acc+=estSec(segments[i]);i++;}}
else{var tg=Math.abs(sec);while(i>0&&acc<tg){i--;acc+=estSec(segments[i]);}}
jumpTo(i);}
["playBtn","pfPlay"].forEach(function(id){$(id).addEventListener("click",function(){if(playing&&!paused)pauseToggle();else if(playing&&paused)pauseToggle();else play();});});
["back5","pfBack"].forEach(function(id){$(id).addEventListener("click",function(){skip(-5);});});
["fwd5","pfFwd"].forEach(function(id){$(id).addEventListener("click",function(){skip(5);});});
["stopBtn","pfStop"].forEach(function(id){$(id).addEventListener("click",function(){stopAll();setStatus("Detenido.");});});
function makeSlider(el){
  el.addEventListener("click",function(e){if(!segments.length)return;var r=el.getBoundingClientRect();jumpTo(Math.round((e.clientX-r.left)/r.width*segments.length));});
  el.addEventListener("keydown",function(e){var k=e.key;
    if(k==="ArrowRight"||k==="ArrowUp"){e.preventDefault();skip(5);}
    else if(k==="ArrowLeft"||k==="ArrowDown"){e.preventDefault();skip(-5);}
    else if(k==="Home"){e.preventDefault();jumpTo(0);}
    else if(k==="End"){e.preventDefault();jumpTo(segments.length);}
    else if(k===" "||k==="Enter"){e.preventDefault();if(playing&&!paused)pauseToggle();else if(playing&&paused)pauseToggle();else play();}});
}
makeSlider($("bar"));makeSlider($("pfBar"));
function setSpeed(v){speed=v;mem.settings.speed=v;save();document.querySelectorAll(".spd").forEach(function(b){b.setAttribute("aria-pressed",String(parseFloat(b.dataset.speed)===v));});if(playing){session++;if(synth)synth.cancel();clearTimeout(pauseTimer);paused=false;userPaused=false;setIcons(true);speakNext();}}
document.querySelectorAll(".spd").forEach(function(b){b.addEventListener("click",function(){setSpeed(parseFloat(b.dataset.speed));setStatus("Velocidad "+b.dataset.speed+"×.");});});
document.querySelectorAll(".ambVol").forEach(function(inp){inp.value=mem.settings.amb;inp.addEventListener("input",function(){mem.settings.amb=+inp.value;save();document.querySelectorAll(".ambVol").forEach(function(o){o.value=inp.value;});ambLevel();});});
function setMode(m){
  document.documentElement.dataset.mode=m;mem.settings.mode=m;save();
  document.querySelectorAll(".modeBtn").forEach(function(b){b.setAttribute("aria-pressed",String(b.dataset.mode===m));});
  setSpeed(m==="dormir"?0.8:1);
}
document.querySelectorAll(".modeBtn").forEach(function(b){b.addEventListener("click",function(){setMode(b.dataset.mode);setStatus(b.dataset.mode==="dormir"?"Modo Dormir (0.8×, ámbar).":"Modo Pensar (1×, azul).");});});

/* ---------- expandido ---------- */
var pf=$("playerFull");
function openPF(){pf.hidden=false;document.body.style.overflow="hidden";$("pfClose").focus();}
function closePF(){pf.hidden=true;document.body.style.overflow="";$("expandBtn").focus();}
$("expandBtn").addEventListener("click",openPF);
$("pfClose").addEventListener("click",closePF);

/* ---------- carga de episodio ---------- */
function loadEpisode(id){
  stopAll();curEp=id;var g=guionDe(id);segments=g?parse(g):[];totalEst=segments.reduce(function(a,b){return a+estSec(b);},0);
  var ep=EPISODES.filter(function(e){return e.id===id;})[0];
  $("pTitle").textContent="Episodio "+ep.week+" · "+ep.titulo;
  $("pSub").textContent=ep.obra+" · "+ep.autor+" · "+(segments.length?segments.length+" segmentos":"en producción");
  $("pfMeta").innerHTML="<strong>Episodio "+ep.week+" · "+esc(ep.titulo)+"</strong>"+esc(ep.obra)+" · "+esc(ep.autor)+" · Antídoto: "+esc(ep.antidoto);
  $("transcript").innerHTML=segments.length?segments.map(function(sg,i){return '<p class="segline" id="seg-'+i+'"><span class="who '+(WHO[sg.sp]||"who-p")+'">'+esc(sg.sp)+"</span>"+esc(sg.text)+"</p>";}).join(""):'<p class="segline">Guion en producción. Se publicará cuando esté disponible.</p>';
  updateUI();setStatus(segments.length?"Listo. Reproducir, ±5 s, velocidad y viento; expandir para la vista completa.":"Episodio en producción.");
  renderScroller();
}
function renderScroller(){
  var wn=weekNow(),box=$("epScroll");box.innerHTML="";
  EPISODES.forEach(function(e){
    var un=e.week<=wn,g=!!guionDe(e.id);
    var b=document.createElement("button");b.className="ep-mini";b.type="button";b.disabled=!un;b.setAttribute("role","tab");b.setAttribute("aria-current",e.id===curEp?"true":"false");
    var tag=un?(g?'<span class="tag tag-ok">Disponible · semana '+e.week+"</span>":'<span class="tag tag-wip">En producción · semana '+e.week+"</span>"):'<span class="tag tag-lock">Disponible próximamente · '+epDate(e.week)+"</span>";
    b.innerHTML=tag+"<h3>"+esc(e.titulo)+"</h3><p>Semana "+e.week+" · "+epDate(e.week)+" · "+esc(e.autor)+"</p>";
    b.setAttribute("aria-label","Episodio "+e.week+": "+e.titulo+". "+(un?(g?"Disponible ahora.":"En producción."):"Disponible próximamente."));
    b.addEventListener("click",function(){loadEpisode(e.id);document.getElementById("escuchar").scrollIntoView({behavior:reduce?"auto":"smooth"});});
    box.appendChild(b);
  });
}

/* ---------- productor / offline ---------- */
function voiceNameFor(r){var v=voiceMap[r];return v?v.name:(r==="Quijote"?"es-ES-AlvaroNeural":r==="Sancho"?"es-ES-DarioNeural":r==="Narrador Quijote"?"es-ES-JorgeNeural":"es-ES-ElviraNeural");}
$("expSSML").addEventListener("click",function(){if(!segments.length)return;var out=['<?xml version="1.0" encoding="UTF-8"?>','<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="es-ES">'];segments.forEach(function(sg){if(sg.sp==="PAUSA")out.push('<break time="'+sg.secs+'s"/>');else out.push('<voice name="'+esc(voiceNameFor(sg.sp))+'">'+esc(sg.text)+"</voice>");});out.push("</speak>");download(curEp+"_vigilia.ssml",out.join("\n"),"application/ssml+xml");});
$("expJSON").addEventListener("click",function(){if(!segments.length)return;download(curEp+"_vigilia.json",JSON.stringify({episodio:curEp,roles:ROLES,velocidad:speed,segments:segments},null,2),"application/json");});
(function(){var btn=$("dlOffline"),note=$("dlNote");var a=new Audio(CONFIG.MP3);
a.addEventListener("loadedmetadata",function(){btn.disabled=false;note.textContent="MP3 detectado: descarga disponible para escuchar sin conexión.";});
a.addEventListener("error",function(){btn.disabled=true;});
btn.addEventListener("click",function(){var l=document.createElement("a");l.href=CONFIG.MP3;l.download=CONFIG.MP3;document.body.appendChild(l);l.click();l.remove();});})();

/* ---------- formulario ---------- */
var form=$("leadForm"),fStatus=$("formStatus"),emailIn=$("email"),emailErr=$("emailError");
function showStatus(m,ok){fStatus.textContent=m;fStatus.className="status "+(ok?"ok":"bad");}
form.addEventListener("submit",function(ev){
  ev.preventDefault();
  var val=(emailIn.value||"").trim().toLowerCase();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val)){emailErr.textContent="Escribe un correo válido, por ejemplo: nombre@correo.com";emailErr.hidden=false;emailIn.setAttribute("aria-invalid","true");showStatus("Revisa el campo de correo.",false);emailIn.focus();return;}
  emailErr.hidden=true;emailIn.removeAttribute("aria-invalid");
  if(mem.leads.some(function(l){return l.email===val&&!l.demo;})){showStatus("Este correo ya está en la lista. Gracias por volver.",true);return;}
  var lead={id:uid(),email:val,motivo:(form.querySelector("input[name=motivo]:checked")||{}).value||"otro",perfil:(form.querySelector("input[name=perfil]:checked")||{}).value||"padre",precio_usd:+((form.querySelector("input[name=precio]:checked")||{}).value||0),created_at:new Date().toISOString(),demo:false,source:"landing"};
  if(!CONFIG.LEADS_ENDPOINT){
    showStatus("La página aún no tiene un servidor configurado. Tu correo no fue enviado ni registrado.",false);
    return;
  }
  var submitBtn=form.querySelector("[type=submit]");
  submitBtn.disabled=true;
  var formData=new URLSearchParams();
  formData.set("form-name","vigilia-lista");
  formData.set("email",lead.email);
  formData.set("motivo",lead.motivo);
  formData.set("perfil",lead.perfil);
  formData.set("precio",String(lead.precio_usd));
  formData.set("created_at",lead.created_at);
  fetch("/",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:formData.toString()}).then(function(r){if(!r.ok)throw new Error("HTTP "+r.status);mem.leads.push(lead);save();renderTable();renderMetrics();showStatus("✓ Registro guardado. Ya cuentas en el OKR de leads y disposición a pagar.",true);form.reset();}).catch(function(){showStatus("No pudimos guardar el registro. Inténtalo de nuevo.",false);}).finally(function(){submitBtn.disabled=false;});
});

/* ---------- CTA hero ---------- */
$("ctaPlay").addEventListener("click",function(){document.getElementById("escuchar").scrollIntoView({behavior:reduce?"auto":"smooth"});setTimeout(play,reduce?0:450);});

/* ---------- init ---------- */
setMuted(!!mem.settings.muted);
document.querySelectorAll(".modeBtn").forEach(function(b){b.setAttribute("aria-pressed",String(b.dataset.mode===(mem.settings.mode||"dormir")));});
document.documentElement.dataset.mode=mem.settings.mode||"dormir";
document.querySelectorAll(".spd").forEach(function(b){b.setAttribute("aria-pressed",String(parseFloat(b.dataset.speed)===speed));});
renderMetrics();renderTable();renderScroller();loadEpisode("ep01");
})();
