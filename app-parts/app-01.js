'use strict';
function requiredSetupMissing(){const fields=[['fullName','Full name'],['baseSite','Base site'],['designation','Designation / job title'],['personalNumber','Personal number'],['homeAddress','Home address'],['vehicleReg','Vehicle registration'],['engineCc','Engine cc'],['claimableMiles','Claimable miles per one-way journey'],['commuteMinutes','Average commute time to work']];const missing=fields.filter(([id])=>!String($(id).value??'').trim()).map(x=>x[1]);if(Number($('passengerMiles')?.value||0)>0&&!String($('passengerNames')?.value||'').trim())missing.push('Passenger names');if(!state.signature)missing.push('Sample signature');return missing;}
function validateSetup(){const missing=requiredSetupMissing();if(missing.length){showToast('Complete the required Setup fields first.');alert('Please complete the following required Setup items before continuing:\n\n• '+missing.join('\n• '));return false}const digits=String($('personalNumber').value||'').replace(/\D/g,'');if(digits.length<8){alert('Personal number must contain at least 8 digits.');return false}return true;}
$('shiftsContinue').addEventListener('click',e=>{e.preventDefault();if(!state.selectedMonths.length){showToast('Select at least one claim month first.');$('shiftsContinueHint').textContent='Select at least one claim month first.';return}state.activeMonth=state.selectedMonths.slice().sort()[0];prepareSelectedClaims();renderClaimsStack();saveState();navigate('claim');});
$('claimContinue').addEventListener('click',e=>{e.preventDefault();if(!state.activeMonth||!state.claims[state.activeMonth]){showToast('Generate a claim first.');return}navigate('log');});
function monthKey(date){const d=new Date(date);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');}
function monthLabel(key){const [y,m]=key.split('-').map(Number);return new Date(y,m-1,1).toLocaleDateString(undefined,{month:'long',year:'numeric'});}
function fmtDateTime(dt){const d=new Date(dt);return d.toLocaleDateString(undefined,{day:'2-digit',month:'2-digit'})+' '+d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});}
function displayDate(d){const x=new Date(d);return String(x.getDate()).padStart(2,'0')+'/'+String(x.getMonth()+1).padStart(2,'0');}
function parseTimeFromDate(d){return new Date(d).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit',hour12:false});}
function addMinutes(d,n){return new Date(new Date(d).getTime()+n*60000);}
function num(v){return Number(v)||0;}function fmtNum(v){const n=Number(v);return n?String(Number(n.toFixed(1))):'';}function money(v){const n=Number(v)||0;return n?'£'+n.toFixed(2):'';}
function escapeHtml(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function escapeAttr(s){return escapeHtml(s).replace(/`/g,'&#96;');}
function getPostcode(addr){const m=String(addr||'').match(/[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}/i);return m?m[0].toUpperCase():String(addr||'').split(/\n|,/).map(x=>x.trim()).filter(Boolean).slice(-1)[0]||'';}
function formatPersonalNumber(v){const raw=String(v||'').trim();const digits=raw.replace(/\D/g,'');if(digits.length<8)return raw;const first=digits.slice(0,8).match(/.{1,2}/g).join('/');const extra=digits.slice(8);return first+(extra?'-'+extra:'');}
function formatAddressLines(v){let parts=String(v||'').split(/\r?\n|,/).map(x=>x.trim()).filter(Boolean);if(!parts.length)return [];const pc=getPostcode(v);if(pc){parts=parts.map(x=>x.replace(new RegExp(pc.replace(' ','\\s*'),'i'),'').trim()).filter(Boolean);parts.push(pc);}return parts.slice(0,5);}
function bindSettings(rebind=false){
  const ids=['fullName','baseSite','designation','personalNumber','homeAddress','vehicleReg','engineCc','claimableMiles','passengerMiles','passengerNames','commuteMinutes','mileageRate','commuteType'];
  ids.forEach(id=>{const el=$(id);el.value=id==='vehicleReg'?String(state.settings[id]??'').toUpperCase():(state.settings[id]??'');if(id==='vehicleReg')state.settings[id]=el.value;if(!rebind&&!el.dataset.bound){const save=()=>{if(id==='vehicleReg')el.value=el.value.toUpperCase();state.settings[id]=el.value;if(id==='baseSite')state.settings.baseSiteConfirmed=!!el.value;updateWorkflowHints();saveState();};el.addEventListener('input',save);el.addEventListener('change',save);el.dataset.bound='1';}});
  const costEl=$('commuteCost');if(costEl){costEl.value=state.settings.commuteCost!==''?'£'+Number(state.settings.commuteCost||0).toFixed(2):'';if(!rebind&&!costEl.dataset.bound){costEl.addEventListener('focus',()=>{costEl.value=state.settings.commuteCost??'';});costEl.addEventListener('input',()=>{state.settings.commuteCost=costEl.value.replace(/[^0-9.]/g,'');saveState();});costEl.addEventListener('blur',()=>{const n=Number(state.settings.commuteCost);costEl.value=state.settings.commuteCost!==''&&Number.isFinite(n)?'£'+n.toFixed(2):'';});costEl.dataset.bound='1';}}
  $('icsUrl').value=state.icsUrl||'';state.workerUrl=BAKED_WORKER_URL;
  {const el=$('icsUrl');if(!rebind&&!el.dataset.bound){const save=()=>{state.icsUrl=el.value.trim();saveState();};el.addEventListener('input',save);el.addEventListener('change',save);el.dataset.bound='1';}}
}

function ensureReminderIdentity(){
  const r=state.reminders||(state.reminders=clone(DEFAULT_STATE.reminders));
  if(!r.installationId)r.installationId=(crypto.randomUUID?crypto.randomUUID():Array.from(crypto.getRandomValues(new Uint8Array(16)),b=>b.toString(16).padStart(2,'0')).join(''));
  if(!r.deviceToken){const bytes=crypto.getRandomValues(new Uint8Array(24));r.deviceToken=btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
  return r;
}
function bindReminderSettings(rebind=false){
  const r=ensureReminderIdentity();
  const defs=[['calendarReminderDay','calendarDay','number'],['calendarReminderTime','calendarTime','text'],['pushMonthly','pushMonthly','check'],['pushDeadline','pushDeadline','check'],['pushRota','pushRota','check'],['pushUnfinished','pushUnfinished','check'],['pushReminderTime','pushReminderTime','text'],['pushMonthlyDay','pushMonthlyDay','number'],['pushDeadlineDays','pushDeadlineDays','number'],['pushUnfinishedDay','pushUnfinishedDay','number'],['pushDeadlineToday','pushDeadlineToday','check']];
  defs.forEach(([id,key,kind])=>{const el=$(id);if(!el)return;if(kind==='check')el.checked=!!r[key];else el.value=r[key]??'';if(!rebind&&!el.dataset.bound){const save=()=>{r[key]=kind==='check'?el.checked:(kind==='number'?Number(el.value):el.value);saveState();if(r.pushEnabled)syncPushRegistration().catch(()=>{});};el.addEventListener('change',save);el.addEventListener('input',save);el.dataset.bound='1';}});
  updatePushUi();
}
