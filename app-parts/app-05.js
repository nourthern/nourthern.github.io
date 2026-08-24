'use strict';

const APP_VERSION='13';
const runtimeErrors=[];
let telemetryTimer=null;

function sanitizeDiagnostic(value){
  return String(value||'')
    .replace(/https?:\/\/\S+/gi,'[URL removed]')
    .replace(/[0-9a-f]{8}-[0-9a-f-]{20,}/gi,'[identifier removed]')
    .slice(0,300);
}

function rememberRuntimeError(value){
  const message=sanitizeDiagnostic(value?.message||value);
  if(message){runtimeErrors.push(message);if(runtimeErrors.length>3)runtimeErrors.shift();}
}

window.addEventListener('error',event=>rememberRuntimeError(event.error||event.message));
window.addEventListener('unhandledrejection',event=>rememberRuntimeError(event.reason));

function openDialog(id){const dialog=$(id);if(dialog&&!dialog.open)dialog.showModal();}
function closeDialog(id){const dialog=$(id);if(dialog?.open)dialog.close();}

for(const [button,dialog] of [['openPrivacy','privacyDialog'],['openCalendarHelp','calendarHelpDialog'],['openHelp','helpDialog'],['openAbout','aboutDialog'],['openBugReport','bugReportDialog']]){
  $(button)?.addEventListener('click',()=>{
    if(dialog==='bugReportDialog')prepareBugReport();
    if(dialog==='aboutDialog')loadAboutStats();
    openDialog(dialog);
  });
}
qsa('[data-close-dialog]').forEach(button=>button.addEventListener('click',()=>closeDialog(button.dataset.closeDialog)));
qsa('dialog').forEach(dialog=>dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();}));

$('importCopiedLink')?.addEventListener('click',async()=>{
  const feedback=$('clipboardFeedback');
  try{
    if(!navigator.clipboard?.readText)throw new Error('Clipboard import is unavailable here. Paste the link into the ICS calendar URL field instead.');
    const copied=normalizeUrl((await navigator.clipboard.readText()).trim());
    const url=new URL(copied);
    if(url.protocol!=='https:'||!/\/ical\//i.test(url.pathname))throw new Error('The clipboard does not contain a recognised HTTPS ICS calendar link.');
    state.icsUrl=copied;
    $('icsUrl').value=copied;
    saveState();
    closeDialog('calendarHelpDialog');
    showToast('Calendar link imported and saved locally.');
  }catch(error){
    feedback.textContent=error.message||'The copied link could not be imported.';
  }
});

function updateStudyReviewAlert(){
  const alertBox=$('studyReviewAlert');
  if(!alertBox)return;
  const count=state.events.filter(event=>event.category==='study').length;
  alertBox.hidden=count===0;
  if(count)alertBox.innerHTML=`<strong>${count} study-related calendar event${count===1?' was':'s were'} found.</strong> Review the shifts highlighted in orange before creating your claim.`;
}

const applyCalendarTextBase=applyCalendarText;
applyCalendarText=function(text,source){
  const result=applyCalendarTextBase(text,source);
  updateStudyReviewAlert();
  incrementTelemetry('calendarImports');
  return result;
};
updateStudyReviewAlert();

function removeEditBubble(){document.querySelector('.edit-bubble')?.remove();}
document.addEventListener('click',event=>{
  const preview=event.target.closest?.('.form-page-preview');
  if(!preview||event.target.closest('input,button,a,select,textarea'))return;
  const card=preview.closest('.claim-month-card'),month=card?.dataset.month;
  if(!month)return;
  removeEditBubble();
  const bubble=document.createElement('div');
  bubble.className='edit-bubble';
  const button=document.createElement('button');
  button.type='button';
  button.textContent=editingMonths.has(month)?'Finish editing':'Edit cells?';
  bubble.appendChild(button);
  document.body.appendChild(bubble);
  const x=Math.min(window.innerWidth-140,Math.max(12,event.clientX-45));
  const y=Math.min(window.innerHeight-58,Math.max(12,event.clientY-50));
  bubble.style.left=x+'px';bubble.style.top=y+'px';
  button.addEventListener('click',buttonEvent=>{
    buttonEvent.stopPropagation();
    editingMonths.has(month)?editingMonths.delete(month):editingMonths.add(month);
    removeEditBubble();
    renderClaimsStack();
    if(editingMonths.has(month))setTimeout(()=>document.querySelector(`.claim-month-card[data-month="${CSS.escape(month)}"] .stack-claim-table`)?.scrollIntoView({behavior:'smooth',block:'center'}),30);
  });
},{passive:true});
document.addEventListener('scroll',removeEditBubble,{passive:true});

function incrementTelemetry(key,amount=1){
  const telemetry=state.telemetry||(state.telemetry=clone(DEFAULT_STATE.telemetry));
  telemetry.counts[key]=(Number(telemetry.counts[key])||0)+amount;
  saveState();
  queueTelemetrySync();
}

const exportPdfForMonthBase=exportPdfForMonth;
exportPdfForMonth=async function(key){const pages=await exportPdfForMonthBase(key);incrementTelemetry('pdfsCreated');return pages;};
$('backupBtn')?.addEventListener('click',()=>incrementTelemetry('backupsCreated'));
$('enablePush')?.addEventListener('click',()=>setTimeout(()=>{if(state.reminders?.pushEnabled)incrementTelemetry('notificationSetups');},1200));

function claimedLastThreeMonthsPence(){
  const cutoff=new Date();cutoff.setMonth(cutoff.getMonth()-3);
  const total=state.expenseLog.filter(item=>new Date(item.submitted)>=cutoff).reduce((sum,item)=>sum+num(item.total),0);
  return Math.max(0,Math.round(total*100));
}

async function telemetryRequest(path,init={}){
  const response=await fetch(BAKED_WORKER_URL.replace(/\/+$/,'')+path,{cache:'no-store',...init,headers:{'Content-Type':'application/json',...(init.headers||{})}});
  let data={};try{data=await response.json();}catch{}
  if(!response.ok)throw new Error(data.error||`Telemetry service returned HTTP ${response.status}.`);
  return data;
}

async function syncTelemetry(){
  const telemetry=state.telemetry||(state.telemetry=clone(DEFAULT_STATE.telemetry));
  if(!telemetry.enabled)return;
  const identity=ensureReminderIdentity();
  await telemetryRequest('/api/telemetry',{method:'POST',body:JSON.stringify({
    installationId:identity.installationId,
    deviceToken:identity.deviceToken,
    appVersion:APP_VERSION,
    claimedLastThreeMonthsPence:claimedLastThreeMonthsPence(),
    counts:telemetry.counts
  })});
  telemetry.lastSyncedAt=new Date().toISOString();
  saveStateBase();
}

function queueTelemetrySync(immediate=false){
  if(!state.telemetry?.enabled)return;
  clearTimeout(telemetryTimer);
  telemetryTimer=setTimeout(()=>syncTelemetry().catch(rememberRuntimeError),immediate?50:2500);
}

const saveStateBase=saveState;
saveState=function(){saveStateBase();queueTelemetrySync();};

const telemetryToggle=$('telemetryEnabled');
if(telemetryToggle){
  telemetryToggle.checked=state.telemetry?.enabled!==false;
  telemetryToggle.addEventListener('change',async()=>{
    const feedback=$('telemetryFeedback'),identity=ensureReminderIdentity();
    state.telemetry.enabled=telemetryToggle.checked;
    saveStateBase();
    try{
      if(telemetryToggle.checked){await syncTelemetry();feedback.textContent='Privacy-preserving usage data sharing is on.';}
      else{
        await telemetryRequest('/api/telemetry',{method:'DELETE',headers:{'X-Device-Token':identity.deviceToken},body:JSON.stringify({installationId:identity.installationId})});
        feedback.textContent='Usage telemetry is off and this installation’s telemetry record was removed.';
      }
    }catch(error){feedback.textContent=telemetryToggle.checked?'Usage data will retry automatically when the service is available.':'Telemetry is off locally; the remote removal could not be confirmed yet.';rememberRuntimeError(error);}
  });
}

async function loadAboutStats(){
  const status=$('aboutStatsStatus');
  try{
    const stats=await telemetryRequest('/api/stats',{method:'GET',headers:{}});
    $('aboutUsers').textContent=Number(stats.users||0).toLocaleString('en-GB');
    $('aboutClaimed').textContent=new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP',maximumFractionDigits:0}).format(Number(stats.claimedLastThreeMonthsPence||0)/100);
    status.textContent='Aggregated figures contain no names or individual claim records.';
  }catch(error){
    $('aboutUsers').textContent='Unavailable';$('aboutClaimed').textContent='Unavailable';
    status.textContent='Aggregated figures could not be loaded at the moment.';
  }
}

function browserFamily(){const ua=navigator.userAgent;if(/Edg\//.test(ua))return 'Edge';if(/CriOS|Chrome\//.test(ua))return 'Chrome';if(/FxiOS|Firefox\//.test(ua))return 'Firefox';if(/Safari\//.test(ua))return 'Safari';return 'Other';}
function osFamily(){const ua=navigator.userAgent;if(/iPhone|iPad|iPod/.test(ua))return 'iOS/iPadOS';if(/Android/.test(ua))return 'Android';if(/Windows/.test(ua))return 'Windows';if(/Mac OS/.test(ua))return 'macOS';if(/Linux/.test(ua))return 'Linux';return 'Other';}
function technicalSnapshot(){
  return {
    appVersion:APP_VERSION,
    browser:browserFamily(),
    operatingSystem:osFamily(),
    installedApp:window.matchMedia('(display-mode: standalone)').matches,
    online:navigator.onLine,
    activeSection:parseRouteHash().tab,
    serviceWorker:'serviceWorker' in navigator,
    notifications:'Notification' in window?Notification.permission:'unavailable',
    localStorageAvailable:(()=>{try{return !!window.localStorage;}catch{return false;}})(),
    recentErrors:[...runtimeErrors]
  };
}

function prepareBugReport(){
  $('bugDescription').value='';$('includeTechnicalDetails').checked=true;
  $('technicalDetails').textContent=JSON.stringify(technicalSnapshot(),null,2);
  $('bugReportFeedback').textContent='';
}

$('includeTechnicalDetails')?.addEventListener('change',event=>{$('technicalDetails').hidden=!event.target.checked;});
$('bugReportForm')?.addEventListener('submit',async event=>{
  event.preventDefault();
  const button=$('submitBugReport'),feedback=$('bugReportFeedback'),description=$('bugDescription').value.trim();
  if(!description)return;
  try{
    button.disabled=true;feedback.textContent='Submitting report…';
    const data=await telemetryRequest('/api/bug-report',{method:'POST',body:JSON.stringify({description,technicalDetails:$('includeTechnicalDetails').checked?technicalSnapshot():null})});
    feedback.textContent=`Report submitted. Your one-off report ID is ${data.reportId}.`;
    $('bugDescription').value='';
  }catch(error){feedback.textContent='The report could not be submitted. Please try again when you are online.';rememberRuntimeError(error);}
  finally{button.disabled=false;}
});

queueTelemetrySync(true);
