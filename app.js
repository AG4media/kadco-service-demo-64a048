/* Kadco Systems service platform — click-through demo. Sample data only. */
(function(){
const EXPIRY = new Date('2026-11-22T23:59:59+05:30');
if (new Date() > EXPIRY) { document.getElementById('gate').style.display='grid'; return; }

const $ = (s,el=document)=>el.querySelector(s);
const esc = (s)=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const KEY='kd_demo_v1';
const TODAY = KD.today;
const fmt = (iso)=>{ if(!iso) return '—'; const d=new Date(iso+'T00:00:00'); return d.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}); };
const fmtShort = (iso)=>{ if(!iso) return '—'; const d=new Date(iso+'T00:00:00'); return d.toLocaleDateString('en-GB',{day:'numeric',month:'short'}); };
const nowT = ()=> new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});
const daysBetween = (iso)=> Math.round((new Date(iso+'T00:00:00') - new Date(TODAY.toISOString().slice(0,10)+'T00:00:00'))/86400000);
const inr = (n)=> '₹'+Number(n).toLocaleString('en-IN');
const STATUSES = ['New','Under review','Remote support','Visit planned','Engineer assigned','In progress','Pending – parts','Pending – customer','Rescheduled','Resolved – pending closure','Closed','Cancelled'];
const OPEN = (c)=> !['Closed','Cancelled'].includes(c.status);

let S;
function init(){
  const saved = localStorage.getItem(KEY);
  if (saved) { try { S = JSON.parse(saved); return; } catch(e){} }
  S = { calls: JSON.parse(JSON.stringify(KD.calls)), events:{}, msgs:{}, otp:{}, reports:{}, nextNo:10724, engineer:'E1', curCall:'KS-10712', chat:[] };
  // seed messages for a few calls
  S.calls.forEach(c=>{ S.events[c.id]=[{t:fmt(c.opened)+' 09:12', what:'Call registered', who:'Coordinator'}]; if(c.eng) S.events[c.id].push({t:fmt(c.opened)+' 09:40', what:'Assigned to '+eng(c.eng).name, who:'Coordinator'}); if(c.status==='Closed') S.events[c.id].push({t:fmt(c.closed)+' 16:05', what:c.remote?'Resolved remotely · customer confirmed':'Closed · customer confirmed by OTP', who:'System'}); });
  save();
}
function save(){ localStorage.setItem(KEY, JSON.stringify(S)); }
function reset(){ localStorage.removeItem(KEY); init(); route(); toast('Demo data reset'); }

const machine = (serial)=> KD.machines.find(m=>m.serial===serial);
const cust = (serial)=> { const m=machine(serial); return m? KD.customers.find(c=>c.id===m.cust):null; };
const custById = (id)=> KD.customers.find(c=>c.id===id);
const eng = (id)=> KD.engineers.find(e=>e.id===id)||{name:'—'};
const call = (id)=> S.calls.find(c=>c.id===id);
function cover(m){
  if(!m) return {type:'None',label:'Unknown machine',cls:'r'};
  const wd = daysBetween(m.warrantyEnd);
  if (wd>=0) return {type:'Warranty',label:'Warranty · '+wd+' days left (ends '+fmtShort(m.warrantyEnd)+')',cls:'g',days:wd};
  if (m.amc && daysBetween(m.amc.end)>=0) return {type:'AMC',label:m.amc.plan+' AMC · ends '+fmtShort(m.amc.end)+' · visits '+m.amc.used+'/'+m.amc.visits,cls:'b',days:daysBetween(m.amc.end)};
  return {type:'Chargeable',label:'Out of warranty · no AMC · chargeable',cls:'a'};
}
const statusCls = (s)=> ({'New':'gold','Under review':'','Remote support':'b','Visit planned':'b','Engineer assigned':'b','In progress':'g','Pending – parts':'r','Pending – customer':'a','Rescheduled':'a','Resolved – pending closure':'a','Closed':'g','Cancelled':''}[s]||'');
function logEvent(c, what, who='System'){ (S.events[c.id]=S.events[c.id]||[]).push({t:'Today '+nowT(), what, who}); }
function msg(c, from, text, action){ (S.msgs[c.id]=S.msgs[c.id]||[]).push({from, text, t:nowT(), action}); }
function setStatus(c, st, note){ c.status=st; logEvent(c, 'Status → '+st+(note?' · '+note:''), 'Coordinator'); save(); }
function toast(t){ const el=$('#toast'); el.textContent=t; el.classList.add('on'); setTimeout(()=>el.classList.remove('on'),2200); }

/* ---------- actions ---------- */
function createCall(f){
  const id='KS-'+(S.nextNo++);
  const m=machine(f.serial); const cv=cover(m);
  const c={id, serial:f.serial, type:f.type, status:'New', eng:null, opened:TODAY.toISOString().slice(0,10), due:TODAY.toISOString().slice(0,10), priority:f.priority, problem:f.problem, cover:cv.type==='Chargeable'?'Chargeable':cv.type};
  S.calls.unshift(c); S.events[id]=[]; logEvent(c,'Call registered by phone · '+f.type,'Coordinator');
  const cu=cust(f.serial);
  msg(c,'kadco',`Kadco Systems: your request is registered as ${id}.\nMachine: ${m.model} (serial ${m.serial})\nProblem: ${f.problem}\nCover: ${cv.type==='Chargeable'?'chargeable service':cv.type}.\nWe will try to resolve it by phone first and update you shortly.`);
  S.curCall=id; save(); return c;
}
function resolveRemote(c, note){ c.status='Closed'; c.remote=true; c.closed=TODAY.toISOString().slice(0,10); c.rating=5; logEvent(c,'Resolved remotely · '+note+' · customer confirmed by phone','Coordinator'); msg(c,'kadco',`Kadco Systems: ${c.id} is resolved by phone (${note}). Thank you for confirming. If the problem returns, reply to this message and we will reopen the call.`); save(); }
function visitNeeded(c){ setStatus(c,'Visit planned','remote steps did not resolve'); }
function assign(c, engId, eta){ c.eng=engId; c.status='Engineer assigned'; logEvent(c,'Assigned to '+eng(engId).name+' · ETA '+eta,'Coordinator');
  const cu=cust(c.serial); msg(c,'kadco',`Kadco Systems: engineer ${eng(engId).name} is assigned to ${c.id} and expected at ${cu.site} around ${eta} today. Phone: ${eng(engId).phone}.`); save(); }
function evt(c, key, label){ c.ev=c.ev||{}; if(c.ev[key]) return; c.ev[key]=nowT(); logEvent(c,label+' · '+c.ev[key],eng(c.eng).name); if(key==='arrive'){ c.status='In progress'; } if(key==='start'){ const cu=cust(c.serial); } save(); }
function submitReport(c, r){
  c.report=r; c.status='Resolved – pending closure'; const code=String(1000+Math.floor(Math.random()*9000)); S.otp[c.id]=code; c.ev=c.ev||{}; c.ev.submitted=nowT();
  logEvent(c,'Report submitted · OTP sent to customer',eng(c.eng).name);
  const m=machine(c.serial); const cu=cust(c.serial);
  msg(c,'kadco',`Kadco Systems: your ${m.model} (serial ${m.serial}) was serviced today by ${eng(c.eng).name}, ${c.ev.start||'—'}–${c.ev.finish||'—'}.\nWork: ${r.work}\n${r.parts.length?('Parts: '+r.parts.map(p=>p.name+' × '+p.qty).join(', ')+'\n'):''}Your confirmation code is ${code.split('').join(' ')}. Tell it to the engineer, reply with it here, or tap below.`, {label:'Approve this visit', do:'approve'});
  save(); return code;
}
function approve(c, viaCode){
  c.status='Closed'; c.closed=TODAY.toISOString().slice(0,10); c.rating=5; c.ev.approved=nowT();
  logEvent(c,'Customer confirmed by OTP'+(viaCode?' (code entered)':' (approved on WhatsApp)'),'System');
  const chargeable = c.cover==='Chargeable';
  if (chargeable){ const parts=(c.report.parts||[]).reduce((a,p)=>a+p.qty*p.rate,0); const base=3000+parts; const amt=Math.round(base*1.18); c.invoice={no:'KD-'+(1135+S.nextNo-10724)+'/26-27', amount:amt, paid:0, base, parts}; logEvent(c,'Invoice '+c.invoice.no+' raised · '+inr(amt),'System');
    msg(c,'kadco',`Thank you. Visit confirmed. Service report ${c.id} is attached (PDF).\nThis visit is chargeable: service charge ₹3,000${parts?' + parts ₹'+parts.toLocaleString('en-IN'):''} + 18% GST = ${inr(amt)}.\nInvoice ${c.invoice.no} is attached. Pay by UPI or card:`, {label:'Pay '+inr(amt), do:'pay'}); }
  else { msg(c,'kadco',`Thank you. Visit confirmed. Service report ${c.id} is attached (PDF).\nThis visit was under ${c.cover}: no charge.${c.report.reco?'\nRecommendation: '+c.report.reco:''}`); }
  if (c.report && c.report.reco) logEvent(c,'Recommendation recorded: '+c.report.reco,'System');
  save();
}
function notSatisfied(c){ c.status='In progress'; logEvent(c,'Customer not satisfied · call reopened · service manager alerted','System'); msg(c,'kadco','We are sorry to hear that. The call is reopened and the service manager has been alerted; '+eng(c.eng).name+' will call you within the hour.'); save(); }
function pay(c){ c.invoice.paid=c.invoice.amount; logEvent(c,'Payment received · UPI · '+inr(c.invoice.amount),'System'); msg(c,'kadco',`Payment of ${inr(c.invoice.amount)} received. Receipt for invoice ${c.invoice.no} is attached. Thank you.`); save(); }


/* ---------- guided troubleshooting (Service AI) ---------- */
function identify(text){
  const t=(text||'').toLowerCase(); let best=null;
  KD.faults.forEach(f=>{ const hits=f.kw.filter(k=>t.includes(k)).length; if(hits && (!best||hits>best.hits)) best={f,hits}; });
  if(!best) return null;
  return {fault:best.f, conf: Math.min(96, 60+best.hits*14)};
}
function tsStart(c, faultKey){ const f=KD.faults.find(x=>x.key===faultKey); if(!f) return; c.ts={fault:f.key, step:0, tried:[]}; if(c.status==='New'||c.status==='Under review') c.status='Remote support'; logEvent(c,'Guided troubleshooting started · '+f.name,'Service AI'); save(); }
function tsNext(c, worked, who){ const f=KD.faults.find(x=>x.key===c.ts.fault); const st=f.steps[c.ts.step]; c.ts.tried.push({step:c.ts.step, worked});
  logEvent(c,'Step '+(c.ts.step+1)+' "'+st.do.slice(0,50)+'…" · '+(worked?'worked':'did not work'), who||'Coordinator');
  if(worked){ resolveRemote(c, f.name+' cleared at step '+(c.ts.step+1)); return 'resolved'; }
  c.ts.step++; save(); return c.ts.step>=f.steps.length?'exhausted':'next'; }
function bestEngineer(c, tomorrow){ const cu=cust(c.serial), m=machine(c.serial); const score=(e)=>{ let s=0; if(!tomorrow){ if(e.status==='free') s+=3; if(e.status==='travel') s+=1; } if(e.status==='leave') s-=9; if(m.model.includes('laser')?e.skills.includes('laser'):e.skills.includes('UX')) s+=2; if(e.base===cu.district) s+=3; if(['Palakkad','Thrissur','Ernakulam'].includes(cu.district)&&['Thrissur','Palakkad','Ernakulam'].includes(e.base)) s+=1; if(['Erode','Coimbatore','Nilgiris'].includes(cu.district)&&e.base==='Coimbatore') s+=2; if(cu.district==='Chennai'&&e.base==='Chennai') s+=2; return s; }; return KD.engineers.slice().sort((a,b)=>score(b)-score(a))[0]; }
function botStepText(c){ const f=KD.faults.find(x=>x.key===c.ts.fault); const st=f.steps[c.ts.step]; return `Step ${c.ts.step+1} of ${f.steps.length}: ${st.do}\n${st.check}\nReply YES if it worked, NO if not.`; }
function botHandle(c, text){
  const t=text.toLowerCase();
  if(c.ts && c.status==='Remote support'){
    if(/\b(yes|worked|done|ok|okay|cleared|fixed|solved|printing now|working)\b/.test(t)){ tsNext(c,true,'Customer'); msg(c,'kadco',`Great, that fixed it. Call ${c.id} is closed as resolved by phone. The step is saved on your machine's history. If it comes back, just message here.`); return; }
    if(/\b(no|not|nope|still|same|didn|doesn|nothing)\b/.test(t)){ const r=tsNext(c,false,'Customer'); if(r==='next'){ msg(c,'kadco',`Understood. ${botStepText(c)}`); } else { botSchedule(c); } return; }
    msg(c,'kadco','Please try the step above and reply YES if it worked or NO if it did not. If you cannot try it now, reply LATER and we will call you.'); return;
  }
  const id=identify(text);
  if(id){ tsStart(c,id.fault.key); const f=id.fault; msg(c,'kadco',`I understand: "${f.name}" on your ${machine(c.serial).model} (serial ${c.serial}). Likely cause: ${f.cause}\nLet's try to fix it now, it usually takes a few minutes.\n\n${botStepText(c)}`); return; }
  msg(c,'kadco',`Thank you. Could you tell me what the printer screen shows (the alarm text), or send a photo of the screen? For example "ink viscosity alarm" or "no print".`);
}
function botSchedule(c){ const e=bestEngineer(c,true); c.status='Visit planned'; logEvent(c,'Remote steps exhausted · visit needed','Service AI'); assign(c,e.id,'tomorrow 10:00'); S.msgs[c.id].pop(); msg(c,'kadco',`This needs an engineer on site. I have scheduled a visit: ${e.name} (${e.base}) will come tomorrow around 10:00. Phone: ${e.phone}. Your call number is ${c.id}; the visit is ${c.cover==='Chargeable'?'chargeable (service charge ₹3,000 + GST, parts extra, approval before any work)':'covered by '+c.cover+' at no charge'}. Reply CHANGE if another time suits better.`); save(); }
function botNewChat(text){
  const serial='30557219'; const m=machine(serial); const id=identify(text);
  const c=createCall({serial, type:'Breakdown', priority:'High', problem:text});
  S.msgs[c.id]=[]; msg(c,'cust',text);
  msg(c,'kadco',`Hello ${cust(serial).contact}, Kadco Systems service here. I've registered your request as ${c.id} for the ${m.model} at ${cust(serial).site} (serial ${serial}, ${cover(m).type==='Chargeable'?'out of cover':cover(m).type}).`);
  if(id){ tsStart(c,id.fault.key); msg(c,'kadco',`"${id.fault.name}": likely cause is ${id.fault.cause.toLowerCase()}\nLet's try to fix it now.\n\n${botStepText(c)}`); }
  else msg(c,'kadco','Could you tell me the alarm text on the printer screen, or send a photo of it?');
  S.curCall=c.id; save(); return c;
}

/* ---------- computed ---------- */
function stats(){
  const open=S.calls.filter(OPEN);
  const overdue=open.filter(c=>daysBetween(c.due)<0);
  const todayVisits=S.calls.filter(c=>['Engineer assigned','In progress','Visit planned'].includes(c.status) && daysBetween(c.due)<=0);
  const parts=open.filter(c=>c.status==='Pending – parts');
  const expW=KD.machines.filter(m=>{const d=daysBetween(m.warrantyEnd);return d>=0&&d<=30;});
  const expA=KD.machines.filter(m=>m.amc&&daysBetween(m.amc.end)>=0&&daysBetween(m.amc.end)<=30);
  const inv=S.calls.filter(c=>c.invoice&&c.invoice.paid<c.invoice.amount);
  const outstanding=inv.reduce((a,c)=>a+c.invoice.amount-c.invoice.paid,0);
  return {open,overdue,todayVisits,parts,expW,expA,inv,outstanding};
}

/* ---------- views ---------- */
const NAV=[
  ['dashboard','Dashboard','M3 3h7v7H3zM14 3h7v4h-7zM14 10h7v11h-7zM3 13h7v8H3z'],
  ['calls','Service calls','M4 6h16M4 12h16M4 18h10'],
  ['new','New call','M12 5v14M5 12h14'],
  ['board','Assignment board','M4 4h5v16H4zM10 4h5v10h-5zM16 4h5v7h-5z'],
  ['engineer','Engineer app','M7 2h10a2 2 0 012 2v16a2 2 0 01-2 2H7a2 2 0 01-2-2V4a2 2 0 012-2zM11 18h2'],
  ['customer','Customer WhatsApp','M21 12a9 9 0 01-13.5 7.8L3 21l1.2-4.5A9 9 0 1121 12z'],
  ['machines','Machines & AMC','M3 7h18v10H3zM7 7V4h10v3M8 20h8'],
  ['assistant','Ask the assistant','M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2zM5 16l1 2 2 1-2 1-1 2-1-2-2-1 2-1z']
];
function renderNav(active){
  $('#nav').innerHTML = '<div class="grp">Service desk</div>'+NAV.slice(0,4).map(n=>navBtn(n,active)).join('')+'<div class="grp">Field & customer</div>'+NAV.slice(4,6).map(n=>navBtn(n,active)).join('')+'<div class="grp">Management</div>'+NAV.slice(6).map(n=>navBtn(n,active)).join('');
  $('#nav').querySelectorAll('button').forEach(b=>b.onclick=()=>{location.hash='#'+b.dataset.v;});
}
const navBtn=(n,a)=>`<button data-v="${n[0]}" class="${a===n[0]?'on':''}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="${n[2]}"/></svg>${n[1]}</button>`;

function callRow(c){ const m=machine(c.serial), cu=cust(c.serial); const od=OPEN(c)&&daysBetween(c.due)<0; return `<tr class="row" data-call="${c.id}"><td><b>${c.id}</b><br><small style="color:var(--muted)">${esc(c.type)}</small></td><td>${esc(cu.name)}<br><small style="color:var(--muted)">${esc(cu.site)}</small></td><td>${esc(m.model)}<br><small style="color:var(--muted)">${m.serial}</small></td><td><span class="pill ${statusCls(c.status)}">${c.status}</span></td><td>${c.eng?eng(c.eng).name:'<span style="color:var(--muted)">unassigned</span>'}</td><td class="r" style="${od?'color:var(--red)':''}">${od?'overdue '+(-daysBetween(c.due))+' d':fmtShort(c.due)}</td></tr>`; }
function bindRows(root){ root.querySelectorAll('tr[data-call]').forEach(tr=>tr.onclick=()=>openCall(tr.dataset.call)); root.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>{location.hash='#'+b.dataset.go;}); }

function vDashboard(){
  const st=stats();
  const attention=S.calls.filter(OPEN).sort((a,b)=>daysBetween(a.due)-daysBetween(b.due)).slice(0,7);
  const repeat=KD.machines.filter(m=>S.calls.filter(c=>c.serial===m.serial&&c.type==='Breakdown'&&daysBetween(c.opened)>=-60).length>=2);
  return `<div class="top"><div><h1>Good morning. ${st.open.length} open call${st.open.length==1?'':'s'}, ${st.todayVisits.length} visit${st.todayVisits.length==1?'':'s'} today.</h1><div class="sub">${TODAY.toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'})} · Service & Support, Thrissur</div></div><div class="btns" style="margin:0"><button class="btn p" data-go="new">+ New call</button><button class="btn" data-go="assistant">Ask the assistant</button></div></div>
  <div class="kpis">
    <div class="kpi" data-go="calls"><div class="l">Open calls</div><div class="v">${st.open.length}</div><div class="d" style="color:${st.overdue.length?'var(--red)':'var(--muted)'}">${st.overdue.length} overdue</div></div>
    <div class="kpi" data-go="board"><div class="l">Today's visits</div><div class="v">${st.todayVisits.length}</div><div class="d">${KD.engineers.filter(e=>e.status==='onsite').length} engineers on site</div></div>
    <div class="kpi" data-go="calls"><div class="l">Pending parts</div><div class="v" style="color:var(--amber)">${st.parts.length}</div><div class="d">${st.parts.filter(c=>c.problem.includes('PI')).length} awaiting payment</div></div>
    <div class="kpi" data-go="machines"><div class="l">Expiring · 30 days</div><div class="v">${st.expW.length+st.expA.length}</div><div class="d">${st.expW.length} warranty · ${st.expA.length} AMC</div></div>
    <div class="kpi" data-go="calls"><div class="l">Outstanding</div><div class="v">${(st.outstanding/1000).toFixed(1)}<small>k</small></div><div class="d">${st.inv.length} invoices</div></div>
    <div class="kpi" data-go="calls"><div class="l">Resolved by phone</div><div class="v">${Math.round(100*S.calls.filter(c=>c.remote).length/Math.max(1,S.calls.filter(c=>c.status==='Closed'&&c.type==='Breakdown').length))}<small>%</small></div><div class="d">of closed breakdowns</div></div>
  </div>
  <div class="grid g2">
    <div class="card"><h4>Calls needing attention <span>by resolution target</span></h4><table><tr><th>Call</th><th>Customer</th><th>Machine</th><th>Status</th><th>Engineer</th><th class="r">Due</th></tr>${attention.map(callRow).join('')}</table></div>
    <div>
      <div class="card"><h4>Alerts</h4>
        ${repeat.map(m=>`<div class="alert"><span class="dot" style="background:var(--red)"></span><div>Repeat fault: serial ${m.serial} (${esc(custById(m.cust).name)}), ${S.calls.filter(c=>c.serial===m.serial&&c.type==='Breakdown'&&daysBetween(c.opened)>=-60).length} breakdown calls in 60 days<small>Review recommended</small></div></div>`).join('')}
        <div class="alert"><span class="dot" style="background:var(--amber)"></span><div>${st.expA.length} AMC contract${st.expA.length==1?'':'s'} expire within 30 days<small>${S.calls.filter(c=>c.type==='Warranty / AMC request'&&OPEN(c)).length} renewal quotation sent</small></div></div>
        <div class="alert"><span class="dot" style="background:var(--amber)"></span><div>${st.expW.length} warranties end within 30 days<small>AMC offers to be sent</small></div></div>
        <div class="alert"><span class="dot" style="background:var(--blue)"></span><div>${S.calls.filter(c=>c.status==='Resolved – pending closure').length} report${S.calls.filter(c=>c.status==='Resolved – pending closure').length==1?'':'s'} awaiting customer confirmation<small>OTP sent</small></div></div>
        <div class="alert"><span class="dot" style="background:var(--blue)"></span><div>Low consumables at site: ${KD.machines.filter(m=>m.ink!==null&&m.ink<=1).length} machines with ≤1 ink bottle<small>Consumables orders suggested</small></div></div>
      </div>
      <div class="card" style="margin-top:12px"><h4>Ask the assistant</h4><div class="ask"><input id="askq" placeholder="How many services are due this week?"><button class="btn p" id="askgo">Ask</button></div><div class="chips">${['How many services are due this week?','Which AMCs expire next month?','Where is Faisal now?','What is outstanding?'].map(q=>`<button data-q="${esc(q)}">${esc(q)}</button>`).join('')}</div><div class="chat" id="miniChat"></div></div>
    </div>
  </div>`;
}

function vCalls(filter){
  const f=filter||'open';
  const list=S.calls.filter(c=> f==='open'?OPEN(c): f==='all'?true: f==='closed'?!OPEN(c): c.status===f);
  const filters=['open','all','closed',...STATUSES.filter(s=>S.calls.some(c=>c.status===s))];
  return `<div class="top"><div><h1>Service calls</h1><div class="sub">${list.length} calls · click a call to open it</div></div><button class="btn p" data-go="new">+ New call</button></div>
  <div class="status-bar">${filters.map(s=>`<span class="${s===f?'on':''}" data-f="${s}">${s==='open'?'Open':s==='all'?'All':s==='closed'?'Closed':s}</span>`).join('')}</div>
  <div class="card"><table><tr><th>Call</th><th>Customer</th><th>Machine</th><th>Status</th><th>Engineer</th><th class="r">Due</th></tr>${list.map(callRow).join('')||'<tr><td colspan="6" style="color:var(--muted)">No calls</td></tr>'}</table></div>`;
}

function vNew(){
  const opts=KD.machines.map(m=>`<option value="${m.serial}">${m.serial} · ${m.model} · ${esc(custById(m.cust).name)}</option>`).join('');
  return `<div class="top"><div><h1>Register a call</h1><div class="sub">Type the serial number first: the cover and history decide everything else.</div></div></div>
  <div class="grid g2"><div class="card"><div class="form">
    <div class="full"><label>Machine serial number</label><input id="f_serial" list="serials" placeholder="Type or scan the serial…" autocomplete="off"><datalist id="serials">${opts}</datalist></div>
    <div><label>Request type</label><select id="f_type"><option>Breakdown</option><option>Consumables order</option><option>Spare parts enquiry</option><option>Technical support</option><option>Installation / trial</option><option>Warranty / AMC request</option></select></div>
    <div><label>Priority</label><select id="f_prio"><option>High</option><option selected>Normal</option><option>Low</option></select></div>
    <div class="full"><label>Problem reported by the customer (type it as the customer says it)</label><textarea id="f_problem" rows="3" placeholder='e.g. the printer shows "ink drop charge too high" and the line has stopped'></textarea><div id="f_ai" class="note" style="margin-top:6px">Service AI: identifies the fault as you type and prepares the step-by-step fix.</div></div>
    <div><label>Channel</label><select><option>Phone</option><option>WhatsApp</option><option>Email</option></select></div>
    <div><label>Production impact</label><select><option>Line stopped</option><option>Running with defects</option><option>No impact</option></select></div>
  </div><div class="btns"><button class="btn p" id="f_go">Register call</button><button class="btn" data-go="dashboard">Cancel</button></div></div>
  <div class="card" id="mcard"><h4>Machine</h4><div class="note">Enter a serial number to see the machine, its cover and history.</div></div></div>`;
}
function machineCard(m, withHistory=true){
  if(!m) return '<h4>Machine</h4><div class="note" style="color:var(--red)">Serial not found. Register it as a new machine, or check the label photo.</div>';
  const cu=custById(m.cust); const cv=cover(m);
  const hist=S.calls.filter(c=>c.serial===m.serial).sort((a,b)=>b.opened.localeCompare(a.opened)).slice(0,4);
  return `<h4>${esc(m.model)} <span>serial ${m.serial}</span></h4>
  <div class="field"><span>Customer</span><b>${esc(cu.name)}</b><em>${esc(cu.site)}</em></div>
  <div class="field"><span>Contact</span><b>${esc(cu.contact)}</b><em>${cu.phone}</em></div>
  <div class="field"><span>Installed</span><b>${fmt(m.installed)} · ${esc(m.line)}</b><em>${m.hours.toLocaleString('en-IN')} h</em></div>
  <div class="field"><span>Cover</span><b>${cv.label}</b><em class="${cv.type==='Chargeable'?'w':''}">${cv.type==='Chargeable'?'chargeable':'not chargeable'}</em></div>
  ${m.ink!==null?`<div class="field"><span>Consumables</span><b>Ink ${m.ink} · makeup ${m.makeup} at site</b><em class="${m.ink<=1?'w':''}">${m.ink<=1?'order suggested':'ok'}</em></div>`:''}
  ${withHistory?`<div class="field" style="border:0;display:block"><span>History</span>${hist.map(h=>`<div style="font-size:12px;margin-top:4px"><b>${h.id}</b> · ${fmtShort(h.opened)} · ${esc(h.problem.slice(0,70))}${h.problem.length>70?'…':''} <span class="pill ${statusCls(h.status)}">${h.status}</span></div>`).join('')||'<div class="note">No previous calls</div>'}</div>`:''}`;
}

function vBoard(){
  const unassigned=S.calls.filter(c=>OPEN(c)&&!c.eng&&['New','Under review','Visit planned','Remote support'].includes(c.status));
  const sel=S.curCall&&call(S.curCall)&&!call(S.curCall).eng?call(S.curCall):unassigned[0];
  const selCu=sel?cust(sel.serial):null;
  const score=(e)=>{ if(!sel) return 0; let s=0; if(e.status==='free') s+=3; if(e.status==='travel') s+=1; if(e.status==='leave') s-=9; const m=machine(sel.serial); if(m.model.includes('laser')?e.skills.includes('laser'):e.skills.includes('UX')) s+=2; if(selCu&&e.base.includes(selCu.district.split(',')[0])) s+=2; if(selCu&&['Palakkad','Thrissur'].includes(selCu.district)&&['Thrissur','Palakkad'].includes(e.base)) s+=1; return s; };
  const best=sel?KD.engineers.slice().sort((a,b)=>score(b)-score(a))[0]:null;
  return `<div class="top"><div><h1>Assignment board</h1><div class="sub">Select an unassigned call, then assign it to an engineer. The suggested engineer is highlighted.</div></div></div>
  <div class="grid" style="grid-template-columns:260px 1fr">
    <div class="card"><h4>Unassigned <span>${unassigned.length}</span></h4>${unassigned.map(c=>`<div class="ticket ${sel&&sel.id===c.id?'sel':''}" data-sel="${c.id}"><b>${c.id} · ${esc(c.type)}</b>${esc(cust(c.serial).name)}<small>${esc(cust(c.serial).site)} · ${c.priority} · ${c.cover}</small></div>`).join('')||'<div class="note">Nothing waiting.</div>'}
    ${sel?`<div class="note" style="margin-top:10px"><b style="color:var(--text)">${sel.id}</b>: ${esc(sel.problem)}</div>`:''}</div>
    <div class="board">${KD.engineers.map(e=>{const mine=S.calls.filter(c=>OPEN(c)&&c.eng===e.id); const isBest=best&&best.id===e.id&&e.status!=='leave'; return `<div class="col ${isBest?'suggest':''}"><h5>${e.name} <span class="pill ${e.status==='free'?'g':e.status==='leave'?'':'a'}">${e.status==='free'?'free':e.status==='onsite'?'on site':e.status==='travel'?'travelling':'leave'}</span></h5><div class="where">${esc(e.loc)} · ${e.base} · ${e.skills.join(' / ')}${e.status!=='free'?' · free '+e.free:''}</div>${mine.map(c=>`<div class="ticket"><b>${c.id}</b>${esc(cust(c.serial).name)}<small>${c.status} · due ${fmtShort(c.due)}</small></div>`).join('')}${sel&&e.status!=='leave'?`<button class="btn ${isBest?'p':''} sm" style="width:100%;justify-content:center;margin-top:6px" data-assign="${e.id}">${isBest?'Assign (suggested) · ETA 14:10':'Assign'}</button>`:''}</div>`;}).join('')}</div>
  </div>`;
}

function vEngineer(){
  const e=eng(S.engineer); const mine=S.calls.filter(c=>OPEN(c)&&c.eng===e.id).sort((a,b)=>a.due.localeCompare(b.due));
  const cur=S.curCall&&call(S.curCall)&&call(S.curCall).eng===e.id&&OPEN(call(S.curCall))?call(S.curCall):null;
  return `<div class="top"><div><h1>Engineer app</h1><div class="sub">What the engineer sees on the phone. Installable, works offline, uploads when the signal returns.</div></div><div><label class="note" style="margin:0 0 4px">Logged in as</label><select id="engsel" style="width:200px">${KD.engineers.map(x=>`<option value="${x.id}" ${x.id===e.id?'selected':''}>${x.name} · ${x.base}</option>`).join('')}</select></div></div>
  <div class="phones"><div class="phone"><div class="screen"><div class="hd"><div><b>${cur?cur.id:'Today'}</b><span>${e.name} · ${e.base}${cur?' · '+esc(cust(cur.serial).name):''}</span></div>${cur?'<button class="btn sm" id="backJobs">Jobs</button>':`<span>${nowT()}</span>`}</div><div class="bd" id="phoneBody">${cur?jobScreen(cur):jobList(mine,e)}</div></div></div>
  <div><div class="card"><h4>What is happening</h4><ul class="timeline">${(cur?S.events[cur.id]:[]).slice(-8).reverse().map(x=>`<li>${esc(x.what)}<small>${x.t} · ${esc(x.who)}</small></li>`).join('')||'<li>Select a job on the phone.<small>Then tap through the visit.</small></li>'}</ul></div>
  <div class="card" style="margin-top:12px"><h4>Attendance today <span>GPS stamped</span></h4><div class="field"><span>Punched in</span><b>08:58 · Thrissur office</b><em>10.52°N 76.21°E</em></div><div class="field"><span>Site 1</span><b>${cur?esc(cust(cur.serial).site):'—'}</b><em>${cur&&cur.ev&&cur.ev.arrive?cur.ev.arrive+' – '+(cur.ev.journeyEnd||'…'):'—'}</em></div><div class="field" style="border:0"><span>Punched out</span><b>—</b><em class="w">on duty</em></div></div></div></div>`;
}
function jobList(mine,e){ return `<div class="note" style="margin:0 0 8px">${mine.length} jobs today · tap to open</div>`+(mine.map(c=>`<div class="jobcard" data-open="${c.id}"><b>${c.id} · ${esc(cust(c.serial).name)}</b><small>${esc(cust(c.serial).site)}</small><small>${esc(machine(c.serial).model)} · ${c.cover} · <span class="pill ${statusCls(c.status)}">${c.status}</span></small></div>`).join('')||'<div class="note">No jobs assigned. Assign one on the board.</div>')+`<button class="ghost" id="punch">Punch out · 18:00</button>`; }
function jobScreen(c){
  const m=machine(c.serial), cu=cust(c.serial), cv=cover(m); c.ev=c.ev||{};
  const steps=[['journey','Journey start'],['arrive','Arrived at customer'],['start','Work started'],['finish','Work finished'],['journeyEnd','Journey end']];
  const submitted=c.status==='Resolved – pending closure'||c.status==='Closed';
  if(submitted) return `<div class="srow"><span>Status</span><b><span class="pill ${statusCls(c.status)}">${c.status}</span></b></div><div class="srow"><span>Customer</span><b>${esc(cu.name)}</b></div><div class="srow"><span>Work</span><b>${esc(c.report.work)}</b></div><div class="srow"><span>OTP</span><b>${c.status==='Closed'?'<span style="color:var(--green)">confirmed '+(c.ev.approved||'')+'</span>':'sent to '+cu.phone}</b></div>
   ${c.status!=='Closed'?`<div class="note" style="margin-top:12px">The customer received a 4-digit code. If they tell it to you, enter it here.</div><input id="otpIn" placeholder="Customer's code" maxlength="4" style="margin-top:8px;text-align:center;font-size:18px;letter-spacing:.4em"><button class="big" id="otpGo">Confirm with code</button><div class="note">Or the customer approves on WhatsApp (see Customer WhatsApp).</div>`:`<button class="big" data-go="report/${c.id}">Open service report</button>`}`;
  return `<div class="srow"><span>Machine</span><b>${esc(m.model)}<br><small style="color:var(--muted)">${m.serial} · ${esc(m.line)}</small></b></div>
  <div class="srow"><span>Cover</span><b><span class="pill ${cv.cls}">${cv.type}</span></b></div>
  <div class="srow"><span>Problem</span><b style="text-align:left;flex:1">${esc(c.problem)}</b></div>
  <div style="margin-top:10px"><b style="font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)">Visit times</b>${steps.map(([k,l],i)=>`<div class="ev"><div>${l}<br><small>${c.ev[k]?c.ev[k]+' · GPS stamped':'—'}</small></div><button class="${c.ev[k]?'done':''}" data-ev="${k}" data-l="${l}" ${c.ev[k]||(i>0&&!c.ev[steps[i-1][0]])?'disabled':''}>${c.ev[k]?'✓':'Tap'}</button></div>`).join('')}</div>
  ${c.ev.start?`<div style="margin-top:12px"><b style="font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)">Report</b>
    <label class="note">Fault found</label><input id="r_fault" value="${esc(c.id==='KS-10712'||/drop charge/i.test(c.problem)?'Charge plate contaminated; main ink tank over-full':'')}" placeholder="Fault observed">
    <label class="note">Work done</label><textarea id="r_work" rows="3" placeholder="Work done">${esc(/drop charge/i.test(c.problem)?'Print head and charge plates cleaned, 50 ml ink drained from main tank, ink stream alignment and excitation value adjusted, ink circulation run, test print taken; printer OK.':'')}</textarea>
    <label class="note">Parts used (replaced / consumed)</label><select id="r_part"><option value="">None</option><option value="Filter set|1|2800">Filter set · ₹2,800</option><option value="MV8 valve|1|6500">MV8 valve · ₹6,500</option><option value="Ink 1067K|1|5000">Ink 1067K (consumed) · ₹5,000</option></select>
    <label class="note">Hours · ink · makeup at site</label><div style="display:flex;gap:6px"><input id="r_hours" value="${m.hours+16}" style="width:40%"><input id="r_ink" value="${m.ink===null?'':m.ink}" style="width:30%"><input id="r_makeup" value="${m.makeup===null?'':m.makeup}" style="width:30%"></div>
    <label class="note">Checklist</label><div class="chk">${KD.checklist.slice(0,8).map((it,i)=>`<div>${it}</div><select data-chk="${i}"><option>Good</option><option>Satisfactory</option><option ${i===1&&/drop charge/i.test(c.problem)?'selected':''}>Needs attention</option><option>N/A</option></select>`).join('')}</div>
    <label class="note">Recommendation</label><input id="r_reco" value="${esc(/drop charge/i.test(c.problem)?'Filter set replacement at the next preventive visit':'')}">
    <button class="ghost">📷 Add photos (before / after)</button>
    <button class="big" id="submitRep" ${c.ev.finish?'':'disabled'}>Submit report · send OTP to customer</button>
    <button class="ghost" id="incompleteBtn">Mark incomplete (parts / customer)</button></div>`:''}`;
}

function vCustomer(){
  if(S.curCall==='NEW') return vCustomerNew();
  const c=S.curCall&&call(S.curCall)?call(S.curCall):S.calls[0]; const cu=cust(c.serial);
  const msgs=S.msgs[c.id]||[];
  return `<div class="top"><div><h1>Customer's WhatsApp</h1><div class="sub">What ${esc(cu.contact)} at ${esc(cu.name)} receives for call ${c.id}. Pick another call below.</div></div><select id="custCall" style="width:300px"><option value="NEW">＋ New chat: a customer writes in</option>${S.calls.filter(x=>S.msgs[x.id]&&S.msgs[x.id].length||x.id===c.id).map(x=>`<option value="${x.id}" ${x.id===c.id?'selected':''}>${x.id} · ${esc(cust(x.serial).name)}</option>`).join('')}</select></div>
  <div class="phones"><div class="phone"><div class="wa"><div class="hd"><i>K</i><div><b>Kadco Systems Service</b><span>WhatsApp Business · usually replies in minutes</span></div></div><div class="bd" id="waBody">${msgs.map((m,i)=>`<div class="m ${m.from==='cust'?'me':''}">${esc(m.text)}${m.action?`<div class="act" data-act="${m.action.do}">${esc(m.action.label)}</div>`:''}<span class="t">${m.t}</span></div>`).join('')||'<div class="note" style="text-align:center;margin-top:40px">No messages yet for this call.<br>Register or assign the call to see the customer\'s side.</div>'}</div>
  <div class="in"><input id="waIn" placeholder="${S.otp[c.id]&&c.status!=='Closed'?'Reply with the 4-digit code…':c.ts&&c.status==='Remote support'?'Reply YES or NO…':'Type as the customer…'}"><button id="waSend">➤</button></div></div></div>
  <div><div class="card"><h4>Behind this chat</h4><div class="field"><span>Call</span><b>${c.id}</b><em><span class="pill ${statusCls(c.status)}">${c.status}</span></em></div><div class="field"><span>Customer</span><b>${esc(cu.name)} · ${esc(cu.contact)}</b><em>${cu.phone}</em></div><div class="field"><span>Engineer</span><b>${c.eng?eng(c.eng).name:'—'}</b><em>${c.eng?eng(c.eng).phone:''}</em></div><div class="field" style="border:0"><span>Code</span><b>${S.otp[c.id]?(c.status==='Closed'?'verified · stored as a hash only':'sent · expires in 24 h'):'not sent yet'}</b><em>${S.otp[c.id]&&c.status!=='Closed'?'(demo: '+S.otp[c.id]+')':''}</em></div>
  <div class="note" style="margin-top:10px">Every message here is sent automatically by the platform through the WhatsApp Business API. The customer can also tap "Not resolved", which reopens the call and alerts the service manager.</div>${c.status==='Resolved – pending closure'?'<div class="btns"><button class="btn danger" id="notSat">Simulate "Not resolved"</button></div>':''}</div>
  <div class="card" style="margin-top:12px"><h4>Daily brief to the owner <span>every morning 08:30</span></h4><div class="m" style="max-width:100%">${esc(dailyBrief())}</div></div></div></div>`;
}

function vCustomerNew(){
  const cu=custById('C5'); const m=machine('30557219');
  return `<div class="top"><div><h1>Customer's WhatsApp</h1><div class="sub">${esc(cu.contact)} at ${esc(cu.name)} writes to Kadco's service number. The Service AI replies, tries to fix it in chat, and schedules an engineer if it cannot.</div></div><select id="custCall" style="width:300px"><option value="NEW" selected>＋ New chat: a customer writes in</option>${S.calls.filter(x=>S.msgs[x.id]&&S.msgs[x.id].length).map(x=>`<option value="${x.id}">${x.id} · ${esc(cust(x.serial).name)}</option>`).join('')}</select></div>
  <div class="phones"><div class="phone"><div class="wa"><div class="hd"><i>K</i><div><b>Kadco Systems Service</b><span>WhatsApp Business · usually replies in minutes</span></div></div><div class="bd" id="waBody"><div class="note" style="text-align:center;margin-top:40px">Type as the customer, for example:<br><br>"My printer is showing ink viscosity alarm and stopped"<br>"No print coming on the bottles"<br>"Ink is leaking from the head"</div></div>
  <div class="in"><input id="waIn" placeholder="Type as the customer…"><button id="waSend">➤</button></div></div></div>
  <div><div class="card"><h4>Behind this chat</h4><div class="field"><span>Number</span><b>${cu.phone}</b><em>known customer</em></div><div class="field"><span>Customer</span><b>${esc(cu.name)} · ${esc(cu.contact)}</b><em>${esc(cu.site)}</em></div><div class="field" style="border:0"><span>Machine</span><b>${esc(m.model)} · ${m.serial}</b><em>${cover(m).type}</em></div>
  <div class="note" style="margin-top:10px">The number is matched to the customer and the machine. The Service AI registers the call, identifies the fault from the message, walks the customer through the fix one step at a time, and closes the call if it works. If the steps run out it schedules a visit and assigns the nearest free engineer, then tells the customer who is coming and when. Every step is saved on the call and the machine's history. A person can take over the chat at any moment.</div></div>
  <div class="card" style="margin-top:12px"><h4>Faults it can handle today <span>sample knowledge base</span></h4>${KD.faults.map(f=>`<div class="alert"><span class="dot" style="background:var(--gold)"></span><div>${esc(f.name)}<small>${f.steps.length} steps · ${esc(f.cause.slice(0,70))}…</small></div></div>`).join('')}</div></div></div>`;
}

function dailyBrief(){ const st=stats(); const closedY=S.calls.filter(c=>c.status==='Closed'&&daysBetween(c.closed)>=-1).length; return `Good morning. Yesterday: ${Math.max(closedY,3)} calls closed, ${S.calls.filter(c=>c.remote&&daysBetween(c.closed)>=-1).length||1} resolved by phone. Today: ${st.todayVisits.length} visit${st.todayVisits.length==1?'':'s'}, ${st.todayVisits.filter(c=>!c.eng).length} unassigned. Overdue: ${st.overdue.length} call${st.overdue.length==1?'':'s'}, ${st.inv.length} invoices (${inr(st.outstanding)}). Expiring in 7 days: ${KD.machines.filter(m=>daysBetween(m.warrantyEnd)>=0&&daysBetween(m.warrantyEnd)<=7).length} warranty, ${KD.machines.filter(m=>m.amc&&daysBetween(m.amc.end)>=0&&daysBetween(m.amc.end)<=7).length} AMC.`; }

function vMachines(){
  const rows=KD.machines.map(m=>{const cu=custById(m.cust), cv=cover(m); return `<tr class="row" data-m="${m.serial}"><td><b>${m.serial}</b><br><small style="color:var(--muted)">${esc(m.model)}</small></td><td>${esc(cu.name)}<br><small style="color:var(--muted)">${esc(cu.site)}</small></td><td>${fmtShort(m.installed)}</td><td><span class="pill ${cv.cls}">${cv.type}</span><br><small style="color:var(--muted)">${cv.type==='Warranty'?'ends '+fmtShort(m.warrantyEnd):cv.type==='AMC'?m.amc.plan+' · ends '+fmtShort(m.amc.end):'warranty ended '+fmtShort(m.warrantyEnd)}</small></td><td class="r">${m.hours.toLocaleString('en-IN')}</td><td class="r">${m.ink===null?'—':m.ink+' / '+m.makeup}</td><td class="r">${S.calls.filter(c=>c.serial===m.serial).length}</td></tr>`;}).join('');
  const alerts=[...KD.machines.filter(m=>daysBetween(m.warrantyEnd)>=0&&daysBetween(m.warrantyEnd)<=90).map(m=>({m,kind:'Warranty ends',when:m.warrantyEnd})),...KD.machines.filter(m=>m.amc&&daysBetween(m.amc.end)>=0&&daysBetween(m.amc.end)<=90).map(m=>({m,kind:'AMC ends',when:m.amc.end}))].sort((a,b)=>a.when.localeCompare(b.when));
  return `<div class="top"><div><h1>Machines, warranty and AMC</h1><div class="sub">${KD.machines.length} machines · ${KD.machines.filter(m=>cover(m).type==='Warranty').length} under warranty · ${KD.machines.filter(m=>cover(m).type==='AMC').length} under AMC · ${KD.machines.filter(m=>cover(m).type==='Chargeable').length} uncovered</div></div></div>
  <div class="grid g2"><div class="card"><table><tr><th>Serial</th><th>Customer</th><th>Installed</th><th>Cover</th><th class="r">Hours</th><th class="r">Ink / makeup</th><th class="r">Calls</th></tr>${rows}</table></div>
  <div><div class="card"><h4>Expiry alerts <span>next 90 days</span></h4>${alerts.map(a=>`<div class="alert"><span class="dot" style="background:${daysBetween(a.when)<=30?'var(--red)':'var(--amber)'}"></span><div>${a.kind} in ${daysBetween(a.when)} days: ${a.m.serial} · ${esc(custById(a.m.cust).name)}<small>${a.kind==='AMC ends'?'Renewal quotation '+(daysBetween(a.when)<=30?'sent':'due at 60 days'):'AMC offer to be sent'}</small></div></div>`).join('')}</div>
  <div class="card" style="margin-top:12px"><h4>AMC plans <span>Kadco edits these</span></h4><table><tr><th>Plan</th><th>Covers</th><th class="r">Visits / yr</th><th class="r">Response</th><th class="r">Price / yr</th></tr><tr><td>Comprehensive</td><td>Labour, travel, parts, print head, filters</td><td class="r">4</td><td class="r">24 h</td><td class="r">₹60,000</td></tr><tr><td>Non-comprehensive</td><td>Labour and travel; parts charged</td><td class="r">2</td><td class="r">48 h</td><td class="r">₹36,000</td></tr><tr><td>Preventive only</td><td>Scheduled visits only</td><td class="r">2</td><td class="r">—</td><td class="r">₹24,000</td></tr></table><div class="note">Exclusions per Hitachi terms: earthing, flood, lightning, mishandling, consumables, non-approved inks.</div></div></div></div>`;
}

function vAssistant(){
  const chips=['How many services are due this week?','Which AMCs expire next month?','Which warranties end soon?','Where is Faisal now?','How many open calls do we have?','What is outstanding?','Which machines have repeat faults?','Which sites need consumables?','What is pending parts?','Service revenue this month?'];
  return `<div class="top"><div><h1>Ask the assistant</h1><div class="sub">Plain questions, answered from live data. Also available on WhatsApp for the owner and managers.</div></div></div>
  <div class="card"><div class="ask"><input id="askq" placeholder="Ask anything about calls, machines, AMCs, engineers or money…"><button class="btn p" id="askgo">Ask</button></div><div class="chips">${chips.map(q=>`<button data-q="${esc(q)}">${esc(q)}</button>`).join('')}</div><div class="chat" id="chat">${S.chat.map(x=>`<div class="q">${esc(x.q)}</div><div class="a">${esc(x.a)}${x.go?`<br><button class="btn sm" data-go="${x.go}">Open the list</button>`:''}</div>`).join('')}</div></div>`;
}
function answer(qRaw){
  const q=qRaw.toLowerCase(); const st=stats();
  const within=(days)=>KD.due.filter(x=>daysBetween(x.date)>=0&&daysBetween(x.date)<=days);
  let a, go;
  if(/where is (\w+)/.test(q)){ const n=q.match(/where is (\w+)/)[1]; const e=KD.engineers.find(x=>x.name.toLowerCase()===n); if(e){ const cur=S.calls.find(c=>OPEN(c)&&c.eng===e.id&&c.status==='In progress'); const next=S.calls.filter(c=>OPEN(c)&&c.eng===e.id&&c.status!=='In progress')[0]; a=`${e.name}: ${e.loc}${cur?' (call '+cur.id+', '+cust(cur.serial).name+')':''}.${next?' Next: '+cust(next.serial).name+', '+next.id+', due '+fmtShort(next.due)+'.':''}${e.status!=='free'?' Free from '+e.free+'.':' Free now.'}`; go='board'; } else a='I do not know an engineer by that name. Engineers: '+KD.engineers.map(e=>e.name).join(', ')+'.'; }
  else if(/(service|visit|preventive).*(due|week|today)|due.*(week|today|service)/.test(q)){ const n=/today/.test(q)?0:/month/.test(q)?30:7; const l=within(n); const un=l.filter(x=>!x.eng); const amc=l.filter(x=>x.kind==='AMC').length; const dist={}; un.forEach(x=>{const d=cust(x.serial).district; dist[d]=(dist[d]||0)+1;}); const top=Object.entries(dist).sort((a,b)=>b[1]-a[1])[0]; a=`${l.length} preventive visits are due ${n===0?'today':n===7?'this week':'in the next 30 days'}: ${amc} under AMC, ${l.length-amc} under warranty. ${un.length} not yet assigned${top?', '+top[1]+' of them in '+top[0]+' district':''}.`+(l.length?'\n\n'+l.map(x=>'• '+fmtShort(x.date)+' · '+cust(x.serial).name+' · '+x.serial+' · '+x.kind+(x.eng?' · '+eng(x.eng).name:' · unassigned')).join('\n'):''); go='board'; }
  else if(/amc.*(expir|renew|end)|(expir|renew).*amc/.test(q)){ const n=/month/.test(q)?60:30; const l=KD.machines.filter(m=>m.amc&&daysBetween(m.amc.end)>=0&&daysBetween(m.amc.end)<=n); const val=l.reduce((s,m)=>s+m.amc.price,0); const sent=l.filter(m=>daysBetween(m.amc.end)<=30).length; a=`${l.length} AMC contract${l.length==1?'':'s'} expire within ${n} days, total value ${inr(val)}. Quotations have gone to ${sent}; ${l.length-sent} still need one.`+(l.length?'\n\n'+l.map(m=>'• '+custById(m.cust).name+' · '+m.serial+' · '+m.amc.plan+' · ends '+fmtShort(m.amc.end)+' · '+inr(m.amc.price)).join('\n'):'')+(l.length-sent>0?'\n\nShall I send the remaining quotations now?':''); go='machines'; }
  else if(/warrant.*(expir|end|soon)|(expir|end).*warrant/.test(q)){ const l=KD.machines.filter(m=>daysBetween(m.warrantyEnd)>=0&&daysBetween(m.warrantyEnd)<=90).sort((x,y)=>x.warrantyEnd.localeCompare(y.warrantyEnd)); a=`${l.length} warranties end within 90 days. Each is an AMC opportunity.`+(l.length?'\n\n'+l.map(m=>'• '+custById(m.cust).name+' · '+m.serial+' · ends '+fmtShort(m.warrantyEnd)+' ('+daysBetween(m.warrantyEnd)+' days)').join('\n'):''); go='machines'; }
  else if(/open call|how many call|calls open|status/.test(q)){ const by={}; st.open.forEach(c=>by[c.status]=(by[c.status]||0)+1); a=`${st.open.length} open calls, ${st.overdue.length} overdue.\n\n`+Object.entries(by).map(([k,v])=>'• '+k+': '+v).join('\n'); go='calls'; }
  else if(/outstanding|unpaid|overdue invoice|collection|owe/.test(q)){ a=`Outstanding: ${inr(st.outstanding)} across ${st.inv.length} invoice${st.inv.length==1?'':'s'}.`+(st.inv.length?'\n\n'+st.inv.map(c=>'• '+c.invoice.no+' · '+cust(c.serial).name+' · '+inr(c.invoice.amount-c.invoice.paid)+' · '+(daysBetween(c.closed)<-7?'overdue':'due')).join('\n')+'\n\nReminders go out automatically by WhatsApp and email.':''); go='calls'; }
  else if(/pending parts|waiting.*part|awaiting part/.test(q)){ a=`${st.parts.length} call${st.parts.length==1?'':'s'} pending parts.`+(st.parts.length?'\n\n'+st.parts.map(c=>'• '+c.id+' · '+cust(c.serial).name+' · '+c.problem).join('\n'):''); go='calls/Pending – parts'; }
  else if(/repeat|recurring|again/.test(q)){ const l=KD.machines.filter(m=>S.calls.filter(c=>c.serial===m.serial&&c.type==='Breakdown'&&daysBetween(c.opened)>=-60).length>=2); a=`${l.length} machine${l.length==1?'':'s'} with two or more breakdown calls in 60 days.`+(l.length?'\n\n'+l.map(m=>'• '+m.serial+' · '+custById(m.cust).name+' · '+S.calls.filter(c=>c.serial===m.serial&&c.type==='Breakdown'&&daysBetween(c.opened)>=-60).map(c=>c.problem.split(';')[0]).join(' / ')).join('\n')+'\n\nA root-cause review is recommended; the history is on each machine page.':''); go='machines'; }
  else if(/consumable|ink|makeup/.test(q)){ const l=KD.machines.filter(m=>m.ink!==null&&m.ink<=1); a=`${l.length} site${l.length==1?'':'s'} with one or no ink bottle in stock, based on the last visit.`+(l.length?'\n\n'+l.map(m=>'• '+custById(m.cust).name+' · '+m.serial+' · ink '+m.ink+', makeup '+m.makeup+' · '+m.hours.toLocaleString('en-IN')+' h').join('\n')+'\n\nShall I send consumables order prompts to these customers?':''); go='machines'; }
  else if(/revenue|invoiced|collected|billing/.test(q)){ const inv=S.calls.filter(c=>c.invoice); const tot=inv.reduce((s,c)=>s+c.invoice.amount,0), paid=inv.reduce((s,c)=>s+c.invoice.paid,0); a=`Service and parts invoiced this month: ${inr(tot)} across ${inv.length} invoices; collected ${inr(paid)}; outstanding ${inr(tot-paid)}. AMC contracts active: ${KD.machines.filter(m=>cover(m).type==='AMC').length}, yearly value ${inr(KD.machines.filter(m=>cover(m).type==='AMC').reduce((s,m)=>s+m.amc.price,0))}.`; go='calls'; }
  else if(/today|visits/.test(q)){ a=`${st.todayVisits.length} visits today.\n\n`+st.todayVisits.map(c=>'• '+c.id+' · '+cust(c.serial).name+' · '+(c.eng?eng(c.eng).name:'unassigned')+' · '+c.status).join('\n'); go='board'; }
  else { a='I can answer questions about services due, AMC and warranty expiry, open calls and their status, pending parts, outstanding payments, revenue, repeat faults, consumables at sites, and where each engineer is. Try one of the suggestions.'; }
  return {a, go};
}

function vReport(id){
  const c=call(id); if(!c) return '<div class="note">Call not found.</div>';
  const m=machine(c.serial), cu=cust(c.serial), cv=cover(m); const r=c.report||{fault:c.problem, work:'—', parts:[], chk:[], hours:m.hours, ink:m.ink, makeup:m.makeup};
  const parts=(r.parts||[]); const base=c.cover==='Chargeable'?3000:0; const sub=base+parts.reduce((s,p)=>s+p.qty*p.rate,0); const gst=Math.round(sub*0.18);
  return `<div class="top"><div><h1>Service report ${c.id}</h1><div class="sub">Generated by the platform in Kadco's AMC / Service Report layout. Emailed and sent on WhatsApp to the customer; saved to the machine's history.</div></div><div class="btns" style="margin:0"><button class="btn" onclick="window.print()">Print / PDF</button><button class="btn" data-go="calls">Back</button></div></div>
  <div class="report">
    <div class="rh"><div><div style="font-weight:700;font-size:13px">KADCO SYSTEMS</div><small>26/2101/4,5,6, Kadavy's Kadco Tower, Kadavy Sector, Cheerachi, Ollur P.O., Thrissur-680 306, Kerala-India</small><small>Ph: 0487-2440679 · service@kadcosystems.com · www.kadcoindia.com</small></div><div style="text-align:right"><div class="lg">Kadco</div><small>EMPOWERING THE NEXT GENERATION</small></div></div>
    <div style="display:flex;justify-content:space-between;align-items:center"><div><b>No: KS</b> <span style="color:#c00;font-weight:700;font-size:14px">${c.id.replace('KS-','')}</span></div><div class="ttl">AMC / Service Report</div><div><b>Date:</b> ${fmt(c.closed||c.opened)}</div></div>
    <table><tr><th style="width:26%">Name of the Customer</th><td>${esc(cu.name)}</td><th style="width:22%">Periodic Visit No OR Visit / Call</th><td>${c.type==='Preventive visit'?'Periodic visit':'Call'}</td></tr>
    <tr><th>Factory Address</th><td>${esc(cu.site)}</td><th>Warranty or out of warranty</th><td>${cv.type==='Chargeable'?'Out of warranty':cv.type}</td></tr>
    <tr><th>Contact Person &amp; Mobile No.</th><td>${esc(cu.contact)} · ${cu.phone}</td><th>Machine &amp; Model &amp; Serial No.</th><td>${esc(m.model)} · ${m.serial}</td></tr>
    <tr><th>Complaint Given by</th><td colspan="3">${esc(cu.contact)}: ${esc(c.problem)}</td></tr>
    <tr><th>Fault Observed by Service Engineer</th><td colspan="3">${esc(r.fault||'—')}</td></tr>
    <tr><th>Job done by Service Engineer</th><td colspan="3">${esc(r.work||'—')}</td></tr>
    <tr><th>Consumables Stock Position</th><td>Ink: ${r.ink??'—'} · Makeup: ${r.makeup??'—'} · Cleaning: ½</td><th>Cumulative Working Hours</th><td>${Number(r.hours||m.hours).toLocaleString('en-IN')}</td></tr>
    <tr><th>Visit times</th><td colspan="3">${c.ev?['journey','arrive','start','finish','journeyEnd'].map((k,i)=>['Journey start','Arrival','Work start','Work finish','Journey end'][i]+' '+(c.ev[k]||'—')).join(' · '):'—'}</td></tr>
    <tr><th>Checklist</th><td colspan="3">${(r.chk&&r.chk.length?r.chk:KD.checklist.slice(0,8).map(x=>x+': Good')).map(x=>esc(x)).join(' · ')}</td></tr>
    <tr><th>Recommendation</th><td colspan="3">${esc(r.reco||'—')}</td></tr></table>
    <table><tr><th>Spares Changed (Description)</th><th style="width:14%">Rate (Rs.)</th><th style="width:10%">Qty (Nos.)</th><th style="width:16%">Total (Rs.)</th></tr>
    ${base?`<tr><td>1) Service charge</td><td>3000 + 18%</td><td>1</td><td>3540/-</td></tr>`:''}${parts.map((p,i)=>`<tr><td>${base?i+2:i+1}) ${esc(p.name)}</td><td>${p.rate.toLocaleString('en-IN')} + 18%</td><td>${p.qty}</td><td>${Math.round(p.qty*p.rate*1.18).toLocaleString('en-IN')}/-</td></tr>`).join('')}${!base&&!parts.length?'<tr><td colspan="4">No charge · covered by '+cv.type+'</td></tr>':''}
    <tr><td colspan="3" style="text-align:right"><b>Total</b></td><td><b>${(sub+gst).toLocaleString('en-IN')}/-</b></td></tr></table>
    <div class="sig"><div><b>Service Engineer Name &amp; Sign.</b><br>${c.eng?eng(c.eng).name:'—'} · e-signed</div><div><b>For Customer</b><br>${esc(cu.contact)} · ${c.status==='Closed'?'<span class="ok">Confirmed by OTP '+(c.ev&&c.ev.approved?c.ev.approved:'')+'</span>':'awaiting confirmation'}</div></div>
  </div>`;
}


function tsPanel(c){
  const id=c.ts?{fault:KD.faults.find(x=>x.key===c.ts.fault),conf:null}:identify(c.problem);
  const sel=`<select id="tsFault" style="width:auto;padding:4px 8px;font-size:11.5px">${KD.faults.map(f=>`<option value="${f.key}" ${id&&id.fault.key===f.key?'selected':''}>${esc(f.name)}</option>`).join('')}</select>`;
  if(!c.ts){
    return `<h4 style="margin-top:12px">Guided troubleshooting <span>Service AI · from Kadco's resolved calls and the Hitachi manuals</span></h4>
    <label class="note">What the customer says (edit if needed)</label><textarea id="tsText" rows="2">${esc(c.problem)}</textarea>
    <div class="note" id="tsId" style="margin-top:6px">${id?`<span style="color:var(--gold-2)">Likely fault:</span> <b style="color:var(--text)">${esc(id.fault.name)}</b> · ${id.conf}% match · ${esc(id.fault.cause)}`:'No clear match yet. Ask for the alarm text on the screen, or choose the fault:'}</div>
    <div style="margin-top:8px;display:flex;gap:8px;align-items:center;flex-wrap:wrap">${sel}<button class="btn p sm" id="tsGo">Start the steps</button><button class="btn sm" id="dVisit">Skip: visit needed</button></div>`;
  }
  const f=id.fault; const st=f.steps[c.ts.step]; const done=c.ts.step>=f.steps.length;
  return `<h4 style="margin-top:12px">Guided troubleshooting <span>${esc(f.name)} · step ${Math.min(c.ts.step+1,f.steps.length)} of ${f.steps.length}</span></h4>
  <div class="note" style="margin-bottom:8px">Likely cause: ${esc(f.cause)}</div>
  ${c.ts.tried.map(t=>`<div class="alert"><span class="dot" style="background:${t.worked?'var(--green)':'var(--red)'}"></span><div>Step ${t.step+1}: ${esc(f.steps[t.step].do)}<small>${t.worked?'worked':'did not work'}</small></div></div>`).join('')}
  ${done?`<div class="card" style="margin-top:8px;border-color:rgba(245,181,68,.5)"><b>No remote fix.</b> All ${f.steps.length} steps tried. This needs an engineer on site: schedule the visit and assign.<div class="btns"><button class="btn p" id="tsSchedule">Schedule a visit · suggested ${esc(bestEngineer(c).name)}</button></div></div>`:
  `<div class="card" style="margin-top:8px;border-color:rgba(201,169,110,.5)"><div class="field"><span>Ask</span><b>${esc(st.ask)}</b><em></em></div><div class="field"><span>Tell them to</span><b>${esc(st.do)}</b><em></em></div><div class="field" style="border:0"><span>Then check</span><b>${esc(st.check)}</b><em></em></div>
  <div class="btns"><button class="btn p" id="tsYes">Worked · close as resolved by phone</button><button class="btn" id="tsNo">Did not work · next step</button><button class="btn" id="dVisit">Stop · visit needed</button></div></div>`}`;
}

/* ---------- call drawer ---------- */
function openCall(id){
  const c=call(id); if(!c) return; S.curCall=id; save();
  const m=machine(c.serial), cu=cust(c.serial), cv=cover(m);
  const body=`<div class="tag">${esc(c.type)} · ${c.priority}</div><h1 style="margin:8px 0 2px">${c.id}</h1><div class="sub">${esc(cu.name)} · ${esc(cu.site)} · opened ${fmt(c.opened)}</div>
  <div class="status-bar" style="margin-top:12px">${STATUSES.filter(s=>!['Cancelled','Rescheduled','Under review'].includes(s)).map(s=>`<span class="${s===c.status?'on':STATUSES.indexOf(s)<STATUSES.indexOf(c.status)?'done':''}">${s}</span>`).join('')}</div>
  <div class="card" style="padding:10px 14px">${machineCard(m,false)}</div>
  <div class="card" style="margin-top:10px"><h4>Problem reported</h4><div>${esc(c.problem)}</div>${['New','Remote support','Under review'].includes(c.status)?tsPanel(c):''}
  ${c.status==='Visit planned'||c.status==='New'?`<div class="btns"><button class="btn p" data-go="board">Assign an engineer</button></div>`:''}
  ${c.status==='Engineer assigned'||c.status==='In progress'?`<div class="note">Assigned to <b style="color:var(--text)">${eng(c.eng).name}</b>. Continue in the Engineer app.</div><div class="btns"><button class="btn p" data-go="engineer">Open engineer app</button><button class="btn" data-go="customer">Customer WhatsApp</button></div>`:''}
  ${c.status==='Resolved – pending closure'?`<div class="note">Report submitted; OTP sent to ${cu.phone}. Waiting for the customer.</div><div class="btns"><button class="btn p" data-go="customer">Customer WhatsApp</button><button class="btn" data-go="engineer">Engineer app</button></div>`:''}
  ${c.status==='Closed'?`<div class="btns"><button class="btn p" data-go="report/${c.id}">Service report</button>${c.invoice?`<button class="btn" data-go="customer">Invoice ${c.invoice.no} · ${c.invoice.paid>=c.invoice.amount?'paid':'unpaid'}</button>`:''}</div>`:''}
  ${['Pending – parts','Pending – customer'].includes(c.status)?`<div class="note" style="margin-top:8px"><b style="color:var(--text)">Incomplete work record</b><br>Reason: ${esc(c.problem)}<br>Approved to stop by: Service manager · Pending work: part replacement · Attends next: ${c.eng?eng(c.eng).name:'to assign'} · Scheduled: after payment / customer readiness</div>`:''}</div>
  <div class="card" style="margin-top:10px"><h4>History of this call</h4><ul class="timeline">${(S.events[c.id]||[]).slice().reverse().map(x=>`<li>${esc(x.what)}<small>${x.t} · ${esc(x.who)}</small></li>`).join('')}</ul></div>`;
  $('#drawerBody').innerHTML=body; $('#drawer').classList.add('open');
  bindRows($('#drawerBody'));
  const tt=$('#tsText'); if(tt) tt.oninput=()=>{ const id=identify(tt.value); $('#tsId').innerHTML=id?`<span style="color:var(--gold-2)">Likely fault:</span> <b style="color:var(--text)">${esc(id.fault.name)}</b> · ${id.conf}% match · ${esc(id.fault.cause)}`:'No clear match yet. Ask for the alarm text on the screen, or choose the fault:'; if(id) $('#tsFault').value=id.fault.key; };
  const tg=$('#tsGo'); if(tg) tg.onclick=()=>{ if(tt&&tt.value.trim()) c.problem=tt.value.trim(); tsStart(c,$('#tsFault').value); openCall(c.id); };
  const ty=$('#tsYes'); if(ty) ty.onclick=()=>{ tsNext(c,true); toast(c.id+' closed · resolved by phone'); closeDrawer(); route(); };
  const tn=$('#tsNo'); if(tn) tn.onclick=()=>{ const r=tsNext(c,false); openCall(c.id); if(r==='exhausted') toast('All steps tried · schedule a visit'); };
  const tsc=$('#tsSchedule'); if(tsc) tsc.onclick=()=>{ visitNeeded(c); toast('Visit needed · suggested engineer highlighted'); location.hash='#board'; closeDrawer(); };
  const dv=$('#dVisit'); if(dv) dv.onclick=()=>{ visitNeeded(c); toast('Visit needed · go to the board'); location.hash='#board'; closeDrawer(); };
}
function closeDrawer(){ $('#drawer').classList.remove('open'); }

/* ---------- router & bindings ---------- */
function route(){
  const h=(location.hash||'#dashboard').slice(1); const [v,arg]=h.split('/'); const main=$('#main');
  renderNav(v);
  if(v==='dashboard') main.innerHTML=vDashboard();
  else if(v==='calls') main.innerHTML=vCalls(arg?decodeURIComponent(arg):'open');
  else if(v==='new') main.innerHTML=vNew();
  else if(v==='board') main.innerHTML=vBoard();
  else if(v==='engineer') main.innerHTML=vEngineer();
  else if(v==='customer') main.innerHTML=vCustomer();
  else if(v==='machines') main.innerHTML=vMachines();
  else if(v==='assistant') main.innerHTML=vAssistant();
  else if(v==='report') main.innerHTML=vReport(arg);
  else main.innerHTML=vDashboard();
  bindRows(main); bindView(v); window.scrollTo(0,0);
}
function bindView(v){
  const main=$('#main');
  main.querySelectorAll('[data-q]').forEach(b=>b.onclick=()=>ask(b.dataset.q));
  const ag=$('#askgo'); if(ag) ag.onclick=()=>ask($('#askq').value); const aq=$('#askq'); if(aq) aq.onkeydown=(e)=>{ if(e.key==='Enter') ask(aq.value); };
  if(v==='calls') main.querySelectorAll('[data-f]').forEach(s=>s.onclick=()=>{location.hash='#calls/'+encodeURIComponent(s.dataset.f);});
  if(v==='new'){ const si=$('#f_serial'); si.oninput=()=>{ $('#mcard').innerHTML=machineCard(machine(si.value.trim())); }; $('#f_problem').oninput=()=>{ const id=identify($('#f_problem').value); $('#f_ai').innerHTML=id?`<span style="color:var(--gold-2)">Service AI:</span> likely fault <b style="color:var(--text)">${esc(id.fault.name)}</b> (${id.conf}% match) · ${esc(id.fault.cause)} · <b style="color:var(--text)">${id.fault.steps.length} remote steps ready</b>`:'Service AI: identifies the fault as you type and prepares the step-by-step fix.'; }; $('#f_go').onclick=()=>{ const m=machine(si.value.trim()); if(!m){toast('Enter a valid serial number');return;} const c=createCall({serial:m.serial,type:$('#f_type').value,priority:$('#f_prio').value,problem:$('#f_problem').value||'Fault reported by customer'}); const id=identify(c.problem); if(id) tsStart(c,id.fault.key); toast(c.id+' registered · customer notified'); location.hash='#calls'; setTimeout(()=>openCall(c.id),50); }; }
  if(v==='board'){ main.querySelectorAll('[data-sel]').forEach(t=>t.onclick=()=>{S.curCall=t.dataset.sel; save(); route();}); main.querySelectorAll('[data-assign]').forEach(b=>b.onclick=()=>{ const c=call(S.curCall); if(!c||c.eng){toast('Select an unassigned call first');return;} assign(c,b.dataset.assign,'14:10'); S.engineer=b.dataset.assign; toast(c.id+' assigned to '+eng(b.dataset.assign).name+' · customer and engineer notified'); route(); }); }
  if(v==='engineer'){ $('#engsel').onchange=(e)=>{S.engineer=e.target.value; S.curCall=null; save(); route();}; main.querySelectorAll('[data-open]').forEach(j=>j.onclick=()=>{S.curCall=j.dataset.open; save(); route();}); const bj=$('#backJobs'); if(bj) bj.onclick=()=>{S.curCall=null; save(); route();};
    const c=S.curCall&&call(S.curCall); if(c){ main.querySelectorAll('[data-ev]').forEach(b=>b.onclick=()=>{ evt(c,b.dataset.ev,b.dataset.l); if(b.dataset.ev==='journey') msg(c,'kadco',`Kadco Systems: ${eng(c.eng).name} has started the journey to ${cust(c.serial).site}. Track the arrival: kadco.in/t/${c.id.toLowerCase()}`); if(b.dataset.ev==='arrive') msg(c,'kadco',`Kadco Systems: ${eng(c.eng).name} has arrived at your site (${c.ev.arrive}).`); save(); route(); });
      const sr=$('#submitRep'); if(sr) sr.onclick=()=>{ const pv=$('#r_part').value; const parts=pv?[{name:pv.split('|')[0],qty:+pv.split('|')[1],rate:+pv.split('|')[2]}]:[]; const chk=[...main.querySelectorAll('[data-chk]')].map((s,i)=>KD.checklist[i]+': '+s.value); const code=submitReport(c,{fault:$('#r_fault').value,work:$('#r_work').value||'Service completed',parts,chk,hours:$('#r_hours').value,ink:$('#r_ink').value,makeup:$('#r_makeup').value,reco:$('#r_reco').value}); toast('Report uploaded · OTP sent to the customer'); route(); };
      const ib=$('#incompleteBtn'); if(ib) ib.onclick=()=>{ setStatus(c,'Pending – parts','MV8 valve damaged; PI shared; '+eng(c.eng).name+' attends after payment'); msg(c,'kadco',`Kadco Systems: during the visit ${eng(c.eng).name} found a damaged part (MV8 valve). A proforma invoice is attached; the replacement is scheduled as soon as payment is received.`); toast('Marked incomplete · PI sent'); route(); };
      const og=$('#otpGo'); if(og) og.onclick=()=>{ if($('#otpIn').value.trim()===S.otp[c.id]){ approve(c,true); toast('Code accepted · call closed · report sent'); route(); } else toast('Wrong code'); }; }
    const pu=$('#punch'); if(pu) pu.onclick=()=>toast('Punched out 18:00 · GPS stamped · 9 h 02 m on duty'); }
  if(v==='customer'){ $('#custCall').onchange=(e)=>{S.curCall=e.target.value; save(); route();};
    if(S.curCall==='NEW'){ const send=()=>{ const t=$('#waIn').value.trim(); if(!t) return; botNewChat(t); toast('Call registered from WhatsApp · Service AI replied'); route(); }; $('#waSend').onclick=send; $('#waIn').onkeydown=(e)=>{ if(e.key==='Enter') send(); }; $('#waIn').focus(); return; }
    const c=call(S.curCall)||S.calls[0];
    main.querySelectorAll('[data-act]').forEach(a=>a.onclick=()=>{ if(a.dataset.act==='approve'&&c.status==='Resolved – pending closure'){ msg(c,'cust','Approved ✓'); approve(c,false); toast('Customer approved · call closed'); route(); } else if(a.dataset.act==='pay'&&c.invoice&&c.invoice.paid<c.invoice.amount){ msg(c,'cust','Paid via UPI'); pay(c); toast('Payment received · receipt sent'); route(); } });
    $('#waSend').onclick=()=>{ const t=$('#waIn').value.trim(); if(!t) return; msg(c,'cust',t); if(c.status==='Resolved – pending closure'&&t.replace(/\s/g,'')===S.otp[c.id]){ approve(c,false); toast('Code matched · call closed'); } else if(c.status==='Resolved – pending closure'&&/^\d{4}$/.test(t)) msg(c,'kadco','That code does not match. Please check the message above or tell the code to the engineer.'); else if(['New','Under review','Remote support'].includes(c.status)) botHandle(c,t); else if(/\bchange\b/i.test(t)&&c.status==='Engineer assigned') msg(c,'kadco','No problem. Which day and time suits you? The coordinator will confirm the new slot.'); else msg(c,'kadco','Thank you. Your message is logged on call '+c.id+'; the coordinator will reply shortly.'); save(); route(); };
    $('#waIn').onkeydown=(e)=>{ if(e.key==='Enter') $('#waSend').onclick(); };
    const ns=$('#notSat'); if(ns) ns.onclick=()=>{ msg(c,'cust','Not resolved – the alarm came back after an hour.'); notSatisfied(c); toast('Call reopened · manager alerted'); route(); };
    const wb=$('#waBody'); if(wb) wb.scrollTop=wb.scrollHeight; }
  if(v==='machines'){ main.querySelectorAll('tr[data-m]').forEach(tr=>tr.onclick=()=>{ const m=machine(tr.dataset.m); $('#drawerBody').innerHTML=`<div class="tag">Machine</div><h1 style="margin:8px 0 2px">${m.serial}</h1><div class="sub">${esc(m.model)}</div><div class="card" style="margin-top:12px;padding:10px 14px">${machineCard(m,true)}</div><div class="card" style="margin-top:10px"><h4>Warranty &amp; AMC</h4><div class="field"><span>Warranty</span><b>${fmt(m.installed)} – ${fmt(m.warrantyEnd)}</b><em class="${daysBetween(m.warrantyEnd)<0?'r':''}">${daysBetween(m.warrantyEnd)<0?'ended':daysBetween(m.warrantyEnd)+' days left'}</em></div><div class="field"><span>AMC</span><b>${m.amc?m.amc.plan+' · '+fmt(m.amc.start)+' – '+fmt(m.amc.end)+' · '+inr(m.amc.price)+'/yr':'None'}</b><em class="${m.amc&&daysBetween(m.amc.end)<=30?'w':''}">${m.amc?'visits '+m.amc.used+'/'+m.amc.visits:''}</em></div><div class="field" style="border:0"><span>Next due</span><b>${(KD.due.find(x=>x.serial===m.serial)||{}).date?fmt(KD.due.find(x=>x.serial===m.serial).date)+' · preventive':'—'}</b><em>by hours: ${(Math.ceil(m.hours/3000)*3000).toLocaleString('en-IN')} h</em></div><div class="btns"><button class="btn sm">Installation report PDF</button><button class="btn sm">Warranty certificate PDF</button><button class="btn sm">Print QR label</button>${!m.amc||daysBetween(m.amc.end)<=60?'<button class="btn sm p">Send AMC quotation</button>':''}</div></div>`; $('#drawer').classList.add('open'); }); }
  if(v==='assistant'){ const ch=$('#chat'); if(ch) ch.scrollTop=ch.scrollHeight; }
}
function ask(q){ if(!q||!q.trim()) return; const r=answer(q); S.chat.push({q,a:r.a,go:r.go}); if(S.chat.length>12) S.chat.shift(); save();
  const mini=$('#miniChat'); if(mini){ mini.innerHTML=`<div class="q">${esc(q)}</div><div class="a">${esc(r.a)}${r.go?`<br><button class="btn sm" data-go="${r.go}">Open the list</button>`:''}</div>`; bindRows(mini); $('#askq').value=''; }
  else route(); }

init();
$('#drawerX').onclick=closeDrawer;
$('#reset').onclick=reset;
window.addEventListener('hashchange',route);
document.addEventListener('keydown',e=>{ if(e.key==='Escape') closeDrawer(); });
route();
})();
