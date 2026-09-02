'use strict';
function requiredSetupMissing(){
  const fields=[['fullName','Full name'],['baseSite','Base site'],['designation','Job title'],['personalNumber','Payroll assignment no.'],['homeAddress','Home address'],['vehicleReg','Vehicle registration'],['engineCc','Engine cc'],['claimableMiles','Claimable miles per one-way journey'],['commuteMinutes','Average commute time']];
  const missing=fields.filter(([id])=>!String($(id)?.value??'').trim()).map(([id,label])=>({id,label}));
  const passengerMiles=String($('passengerMiles')?.value||'').trim(),passengerNames=String($('passengerNames')?.value||'').trim();
  if(passengerMiles&&!passengerNames)missing.push({id:'passengerNames',label:'Passenger names'});
  if(passengerNames&&!passengerMiles)missing.push({id:'passengerMiles',label:'Passenger miles per journey'});
  const expense=String($('commuteType')?.value||'none');
  if(expense!=='none'&&!String(state.settings.commuteCost||'').trim())missing.push({id:'commuteCost',label:'Cost'});
  if(String($('otherExpenseType')?.value||'')&&!String(state.settings.otherExpenseCost||'').trim())missing.push({id:'otherExpenseCost',label:'Other additional expense cost'});
  if(!state.signature)missing.push({id:'setupSignature',label:'Sample signature'});
  return missing;
}
function clearSetupErrors(){qsa('#setup .field-error').forEach(el=>el.classList.remove('field-error'));}
function markSetupErrors(missing){clearSetupErrors();for(const item of missing){const el=$(item.id);if(el)el.classList.add('field-error');}}
function validateSetup(){const missing=requiredSetupMissing();if(missing.length){markSetupErrors(missing);showToast('Complete the required Setup fields first.');alert('Please complete the following required Setup items before continuing:\n\n• '+missing.map(item=>item.label).join('\n• '));return false}const digits=String($('personalNumber').value||'').replace(/\D/g,'');if(digits.length<8){$('personalNumber').classList.add('field-error');alert('Payroll assignment no. must contain at least 8 digits.');return false}clearSetupErrors();return true;}
$('shiftsContinue').addEventListener('click',e=>{e.preventDefault();if(!state.selectedMonths.length){showToast('Select at least one claim month first.');$('shiftsContinueHint').textContent='Select at least one claim month first.';return}state.activeMonth=state.selectedMonths.slice().sort()[0];prepareSelectedClaims();renderClaimsStack();saveState();navigate('claim');});
$('claimContinue').addEventListener('click',e=>{e.preventDefault();if(!state.activeMonth||!state.claims[state.activeMonth]){showToast('Generate a claim first.');return}navigate('log');});
const APP_TIME_ZONE='Europe/London';
const LONDON_PARTS_FORMATTER=new Intl.DateTimeFormat('en-GB',{timeZone:APP_TIME_ZONE,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});
function londonParts(value){const parts={};for(const part of LONDON_PARTS_FORMATTER.formatToParts(new Date(value)))if(part.type!=='literal')parts[part.type]=Number(part.value);return {year:parts.year,month:parts.month,day:parts.day,hour:parts.hour,minute:parts.minute,second:parts.second};}
function londonDateFromParts(year,month,day,hour=0,minute=0,second=0){const wanted=Date.UTC(year,month-1,day,hour,minute,second);let instant=wanted;for(let i=0;i<3;i++){const p=londonParts(instant),shown=Date.UTC(p.year,p.month-1,p.day,p.hour,p.minute,p.second),difference=wanted-shown;if(!difference)break;instant+=difference;}return new Date(instant);}
function londonDateKey(value){const p=londonParts(value);return `${p.year}-${String(p.month).padStart(2,'0')}-${String(p.day).padStart(2,'0')}`;}
function londonTimeMinutes(value){const p=londonParts(value);return p.hour*60+p.minute;}
function londonDateTime(dateValue,timeValue='00:00'){const [year,month,day]=String(dateValue).split('-').map(Number),[hour,minute]=String(timeValue).split(':').map(Number);return londonDateFromParts(year,month,day,hour||0,minute||0);}
function addLondonCalendar(value,{days=0,months=0}={}){const p=londonParts(value),wall=new Date(Date.UTC(p.year,p.month-1+months,p.day+days,p.hour,p.minute,p.second));return londonDateFromParts(wall.getUTCFullYear(),wall.getUTCMonth()+1,wall.getUTCDate(),wall.getUTCHours(),wall.getUTCMinutes(),wall.getUTCSeconds());}
function offsetLondonDateKey(dateValue,days){return londonDateKey(addLondonCalendar(londonDateTime(dateValue,'12:00'),{days}));}
function monthKey(date){return londonDateKey(date).slice(0,7);}
function monthLabel(key){const [y,m]=key.split('-').map(Number);return new Date(Date.UTC(y,m-1,1)).toLocaleDateString(undefined,{timeZone:'UTC',month:'long',year:'numeric'});}
function fmtDateTime(dt){const d=new Date(dt);return d.toLocaleDateString(undefined,{timeZone:APP_TIME_ZONE,day:'2-digit',month:'2-digit'})+' '+d.toLocaleTimeString([], {timeZone:APP_TIME_ZONE,hour:'2-digit',minute:'2-digit'});}
function displayDate(d){const p=londonParts(d);return String(p.day).padStart(2,'0')+'/'+String(p.month).padStart(2,'0');}
function parseTimeFromDate(d){return new Date(d).toLocaleTimeString([], {timeZone:APP_TIME_ZONE,hour:'2-digit',minute:'2-digit',hour12:false});}
function addMinutes(d,n){return new Date(new Date(d).getTime()+n*60000);}
function num(v){return Number(v)||0;}function fmtNum(v){const n=Number(v);return n?String(Number(n.toFixed(1))):'';}function money(v){const n=Number(v)||0;return n?'£'+n.toFixed(2):'';}
function escapeHtml(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function escapeAttr(s){return escapeHtml(s).replace(/`/g,'&#96;');}
function getPostcode(addr){const m=String(addr||'').match(/[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}/i);return m?m[0].toUpperCase():String(addr||'').split(/\n|,/).map(x=>x.trim()).filter(Boolean).slice(-1)[0]||'';}
function formatPersonalNumber(v){const raw=String(v||'').trim();const digits=raw.replace(/\D/g,'');if(digits.length<8)return raw;const first=digits.slice(0,8).match(/.{1,2}/g).join('/');const extra=digits.slice(8);return first+(extra?'-'+extra:'');}
function formatAddressLines(v){let parts=String(v||'').split(/\r?\n|,/).map(x=>x.trim()).filter(Boolean);if(!parts.length)return [];const pc=getPostcode(v);if(pc){parts=parts.map(x=>x.replace(new RegExp(pc.replace(' ','\\s*'),'i'),'').trim()).filter(Boolean);parts.push(pc);}return parts.slice(0,5);}
function updateSetupFieldStates(){qsa('#setup input:not([type="file"]):not([type="checkbox"]):not([type="hidden"]),#setup select,#setup textarea').forEach(el=>el.classList.toggle('has-value',String(el.value||'').trim()!==''));}
function updateAdditionalExpenseUi(){
  const passengerUsed=!!(String($('passengerNames')?.value||'').trim()||String($('passengerMiles')?.value||'').trim()),busRailOption=$('busRailOption'),typeSelect=$('commuteType');
  if(busRailOption){busRailOption.hidden=passengerUsed;busRailOption.disabled=passengerUsed;}
  if(passengerUsed&&typeSelect?.value==='busrail'){typeSelect.value='none';state.settings.commuteType='none';state.settings.commuteCost='0';state.settings.expenseFrequency='journey';}
  const type=typeSelect?.value||'none',hasExpense=type!=='none'&&type!=='';
  if(type==='none'&&state.settings.commuteCost!=='0'){state.settings.commuteCost='0';if($('commuteCost'))$('commuteCost').value='£0.00';}
  if($('commuteCostRequiredMark'))$('commuteCostRequiredMark').hidden=!hasExpense;
  const showOther=type==='humber'||type==='parking',otherTypeSelect=$('otherExpenseType'),otherHumber=$('otherHumberOption'),otherParking=$('otherParkingOption');if($('otherExpenseFields'))$('otherExpenseFields').hidden=!showOther;
  if(otherHumber){otherHumber.hidden=type==='humber';otherHumber.disabled=type==='humber';}if(otherParking){otherParking.hidden=type==='parking';otherParking.disabled=type==='parking';}
  if(showOther&&otherTypeSelect?.value===type){otherTypeSelect.value='';state.settings.otherExpenseType='';state.settings.otherExpenseCost='';state.settings.otherExpenseFrequency='journey';if($('otherExpenseCost'))$('otherExpenseCost').value='';}
  if(!showOther&&state.settings.otherExpenseType){state.settings.otherExpenseType='';state.settings.otherExpenseCost='';state.settings.otherExpenseFrequency='journey';if(otherTypeSelect)otherTypeSelect.value='';if($('otherExpenseCost'))$('otherExpenseCost').value='';}
  const otherType=otherTypeSelect?.value||'',otherChosen=showOther&&!!otherType;if($('otherExpenseCostRequiredMark'))$('otherExpenseCostRequiredMark').hidden=!otherChosen;
  const frequencyEnabled=type==='parking'||type==='busrail',frequency=$('expenseFrequency'),journeyOption=$('perJourneyFrequencyOption');if(journeyOption){journeyOption.hidden=type==='parking';journeyOption.disabled=type==='parking';}if(frequency){frequency.disabled=!frequencyEnabled;if(type==='parking'&&!['daily','weekly','monthly'].includes(frequency.value)){frequency.value='daily';state.settings.expenseFrequency='daily';}else if(!frequencyEnabled){frequency.value='journey';state.settings.expenseFrequency='journey';}}
  const otherFrequency=$('otherExpenseFrequency'),otherJourney=$('otherPerJourneyFrequencyOption'),otherFrequencyEnabled=otherType==='parking';if(otherJourney){otherJourney.hidden=otherFrequencyEnabled;otherJourney.disabled=otherFrequencyEnabled;}if(otherFrequency){otherFrequency.disabled=!otherFrequencyEnabled;if(otherFrequencyEnabled&&!['daily','weekly','monthly'].includes(otherFrequency.value)){otherFrequency.value='daily';state.settings.otherExpenseFrequency='daily';}else if(!otherFrequencyEnabled){otherFrequency.value='journey';state.settings.otherExpenseFrequency='journey';}}
  if($('expenseFrequencyAdvice'))$('expenseFrequencyAdvice').hidden=!(type==='busrail'&&state.settings.expenseFrequency!=='journey');
  updateSetupFieldStates();
}
function bindMoneyField(id,key,rebind){const el=$(id);if(!el)return;el.value=state.settings[key]!==''?'£'+Number(state.settings[key]||0).toFixed(2):'';if(!rebind&&!el.dataset.bound){el.addEventListener('focus',()=>{el.value=state.settings[key]??'';});el.addEventListener('input',()=>{state.settings[key]=el.value.replace(/[^0-9.]/g,'');el.classList.remove('field-error');updateAdditionalExpenseUi();saveState();});el.addEventListener('blur',()=>{const n=Number(state.settings[key]);el.value=state.settings[key]!==''&&Number.isFinite(n)?'£'+n.toFixed(2):'';updateSetupFieldStates();});el.dataset.bound='1';}}
function bindSettings(rebind=false){
  const ids=['fullName','baseSite','designation','personalNumber','homeAddress','vehicleReg','engineCc','claimableMiles','passengerMiles','passengerNames','commuteMinutes','mileageRate','commuteType','otherExpenseType','expenseFrequency','otherExpenseFrequency'];
  ids.forEach(id=>{const el=$(id);if(!el)return;el.value=id==='vehicleReg'?String(state.settings[id]??'').toUpperCase():(state.settings[id]??'');if(id==='vehicleReg')state.settings[id]=el.value;if(!rebind&&!el.dataset.bound){const save=()=>{if(id==='vehicleReg')el.value=el.value.toUpperCase();state.settings[id]=el.value;if(id==='baseSite')state.settings.baseSiteConfirmed=!!el.value;el.classList.remove('field-error');updateWorkflowHints();saveState();};el.addEventListener('input',save);el.addEventListener('change',save);el.dataset.bound='1';}});
  bindMoneyField('commuteCost','commuteCost',rebind);bindMoneyField('otherExpenseCost','otherExpenseCost',rebind);
  $('icsUrl').value=state.icsUrl||'';state.workerUrl=BAKED_WORKER_URL;
  {const el=$('icsUrl');if(!rebind&&!el.dataset.bound){const save=()=>{state.icsUrl=el.value.trim();if(state.icsUrl){state.icsFileUpdatedAt='';state.usingExampleData=false;}el.classList.remove('field-error');renderCalendarSource();updateSetupFieldStates();saveState();};el.addEventListener('input',save);el.addEventListener('change',save);el.dataset.bound='1';}}
  updateAdditionalExpenseUi();updateSetupFieldStates();
}

function ensureReminderIdentity(){
  const r=state.reminders||(state.reminders=clone(DEFAULT_STATE.reminders));
  if(!r.installationId)r.installationId=(crypto.randomUUID?crypto.randomUUID():Array.from(crypto.getRandomValues(new Uint8Array(16)),b=>b.toString(16).padStart(2,'0')).join(''));
  if(!r.deviceToken){const bytes=crypto.getRandomValues(new Uint8Array(24));r.deviceToken=btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
  return r;
}
function bindReminderSettings(rebind=false){
  const r=ensureReminderIdentity();
  const defs=[['calendarReminderDay','calendarDay','number'],['calendarReminderTime','calendarTime','text'],['pushMonthly','pushMonthly','check'],['pushDeadline','pushDeadline','check'],['pushRota','pushRota','check'],['pushUnfinished','pushUnfinished','check'],['pushReminderTime','pushReminderTime','text'],['pushDeadlineDays','pushDeadlineDays','number'],['pushUnfinishedDay','pushUnfinishedDay','number']];
  defs.forEach(([id,key,kind])=>{const el=$(id);if(!el)return;if(kind==='check')el.checked=!!r[key];else el.value=r[key]??'';if(!rebind&&!el.dataset.bound){const save=()=>{r[key]=kind==='check'?el.checked:(kind==='number'?Number(el.value):el.value);saveState();if(r.pushEnabled)syncPushRegistration().catch(markPushFailure);};el.addEventListener('change',save);el.addEventListener('input',save);el.dataset.bound='1';}});
  updatePushUi();
}
