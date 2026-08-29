'use strict';

const APP_VERSION='25';
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

for(const [button,dialog] of [['openPrivacy','privacyDialog'],['footerOpenPrivacy','privacyDialog'],['openCalendarHelp','calendarHelpDialog'],['openHelp','helpDialog'],['openAbout','aboutDialog'],['footerOpenBugReport','bugReportDialog']]){
  $(button)?.addEventListener('click',()=>{
    if(dialog==='bugReportDialog')prepareBugReport();
    if(dialog==='aboutDialog')loadAboutStats();
    openDialog(dialog);
  });
}
qsa('[data-close-dialog]').forEach(button=>button.addEventListener('click',()=>closeDialog(button.dataset.closeDialog)));
qsa('dialog').forEach(dialog=>dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();}));
$('helpOpenBugReport')?.addEventListener('click',()=>{closeDialog('helpDialog');prepareBugReport();openDialog('bugReportDialog');});

function showReminderView(view='menu'){
  const menu=$('reminderMenu'),calendar=$('calendarReminderPanel'),push=$('pushReminderPanel');
  if(menu)menu.hidden=view!=='menu';if(calendar)calendar.hidden=view!=='calendar';if(push)push.hidden=view!=='push';
}
function openNotificationSettings(view='menu'){showReminderView(view);openDialog('notificationSettingsDialog');}
$('openNotifications')?.addEventListener('click',()=>openNotificationSettings('menu'));
$('openDashboard')?.addEventListener('click',()=>showToast('The private telemetry dashboard is coming in the next beta update.'));
qsa('[data-open-reminder]').forEach(button=>button.addEventListener('click',()=>openNotificationSettings(button.dataset.openReminder)));
qsa('[data-reminder-view]').forEach(button=>button.addEventListener('click',()=>showReminderView(button.dataset.reminderView)));
qsa('.reminder-back').forEach(button=>button.addEventListener('click',()=>showReminderView('menu')));
$('notificationSettingsDialog')?.addEventListener('close',()=>{state.reminders.notificationPromptReviewed=true;saveState();updatePushUi();});

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
  const colour=$('colourBlindMode')?.checked?'purple':'orange';
  if(count)alertBox.innerHTML=`<strong>${count} study-related calendar event${count===1?' was':'s were'} found.</strong> Review the shifts highlighted in <span id="studyHighlightColour">${colour}</span> before creating your claim.`;
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
exportPdfForMonth=async function(key){const pages=await exportPdfForMonthBase(key);state.telemetry.lastPdfCreatedAt=new Date().toISOString();incrementTelemetry('pdfsCreated');return pages;};
$('backupBtn')?.addEventListener('click',()=>incrementTelemetry('backupsCreated'));
$('enablePush')?.addEventListener('click',()=>setTimeout(()=>{if(state.reminders?.pushEnabled)incrementTelemetry('notificationSetups');},1200));

function claimedLastThreeMonthsPence(){
  const cutoff=new Date();cutoff.setMonth(cutoff.getMonth()-3);
  const total=state.expenseLog.filter(item=>new Date(item.submitted)>=cutoff).reduce((sum,item)=>sum+num(item.total),0);
  return Math.max(0,Math.round(total*100));
}

function claimedLastTwelveMonthsPence(){const cutoff=new Date();cutoff.setMonth(cutoff.getMonth()-12);const total=state.expenseLog.filter(item=>new Date(item.submitted)>=cutoff).reduce((sum,item)=>sum+num(item.total),0);return Math.max(0,Math.round(total*100));}

function milesClaimedSince(months){const cutoff=new Date();cutoff.setMonth(cutoff.getMonth()-months);const total=state.expenseLog.filter(item=>new Date(item.submitted)>=cutoff).reduce((sum,item)=>sum+num(item.miles),0);return Math.max(0,Math.round(total*10));}

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
    claimedLastTwelveMonthsPence:claimedLastTwelveMonthsPence(),
    claimedCurrentYearPence:claimedLastTwelveMonthsPence(),
    milesLastThreeMonthsTenths:milesClaimedSince(3),
    milesLastTwelveMonthsTenths:milesClaimedSince(12),
    lastPdfCreatedAt:telemetry.lastPdfCreatedAt||'',
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
    $('aboutClaimedYear').textContent=new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP',maximumFractionDigits:0}).format(Number(stats.claimedLastTwelveMonthsPence??stats.claimedCurrentYearPence??0)/100);
    $('aboutMiles').textContent=new Intl.NumberFormat('en-GB',{maximumFractionDigits:0}).format(Number(stats.milesLastThreeMonthsTenths||0)/10);
    $('aboutMilesYear').textContent=new Intl.NumberFormat('en-GB',{maximumFractionDigits:0}).format(Number(stats.milesLastTwelveMonthsTenths||0)/10);
    status.textContent='Aggregated figures contain no names or individual claim records.';
  }catch(error){
    $('aboutUsers').textContent='Unavailable';$('aboutClaimed').textContent='Unavailable';$('aboutClaimedYear').textContent='Unavailable';$('aboutMiles').textContent='Unavailable';$('aboutMilesYear').textContent='Unavailable';
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

let preparedScreenshot=null,screenshotPreviewUrl='';
function clearPreparedScreenshot(){preparedScreenshot=null;if(screenshotPreviewUrl)URL.revokeObjectURL(screenshotPreviewUrl);screenshotPreviewUrl='';if($('bugScreenshot'))$('bugScreenshot').value='';if($('screenshotPreviewWrap'))$('screenshotPreviewWrap').hidden=true;if($('screenshotPreview'))$('screenshotPreview').removeAttribute('src');}
async function compressScreenshot(file){
  if(!/^image\/(png|jpeg|webp)$/i.test(file.type))throw new Error('Choose a PNG, JPEG or WebP screenshot.');
  let source,revokeUrl='';
  if('createImageBitmap' in window)source=await createImageBitmap(file);
  else source=await new Promise((resolve,reject)=>{const image=new Image();revokeUrl=URL.createObjectURL(file);image.onload=()=>resolve(image);image.onerror=()=>reject(new Error('The screenshot could not be opened.'));image.src=revokeUrl;});
  const maxDimension=1600,scale=Math.min(1,maxDimension/Math.max(source.width,source.height)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(source.width*scale));canvas.height=Math.max(1,Math.round(source.height*scale));canvas.getContext('2d').drawImage(source,0,0,canvas.width,canvas.height);source.close?.();if(revokeUrl)URL.revokeObjectURL(revokeUrl);
  let quality=.82,blob=null;for(let attempt=0;attempt<4;attempt++){blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',quality));if(blob&&blob.size<=1400*1024)break;quality-=.14;}if(!blob||blob.size>1500*1024)throw new Error('The screenshot is still too large after resizing. Please crop it and try again.');return blob;
}

{const privacyAggregateItem=qsa('#privacyDialog li').find(item=>item.textContent.includes('current calendar year'));if(privacyAggregateItem)privacyAggregateItem.textContent=privacyAggregateItem.textContent.replace('the current calendar year','the last 12 months on record');}
function prepareBugReport(){
  $('bugDescription').value='';$('includeTechnicalDetails').checked=true;
  $('technicalDetails').textContent=JSON.stringify(technicalSnapshot(),null,2);
  $('bugReportFeedback').textContent='';clearPreparedScreenshot();
}

$('bugScreenshot')?.addEventListener('change',async event=>{const file=event.target.files?.[0];if(!file){clearPreparedScreenshot();return}const feedback=$('bugReportFeedback');try{feedback.textContent='Preparing screenshot…';preparedScreenshot=await compressScreenshot(file);if(screenshotPreviewUrl)URL.revokeObjectURL(screenshotPreviewUrl);screenshotPreviewUrl=URL.createObjectURL(preparedScreenshot);$('screenshotPreview').src=screenshotPreviewUrl;$('screenshotPreviewWrap').hidden=false;feedback.textContent='Screenshot ready. Check that it contains no personal or claim information.';}catch(error){clearPreparedScreenshot();feedback.textContent=error.message||'The screenshot could not be prepared.';}});
$('removeScreenshot')?.addEventListener('click',clearPreparedScreenshot);

$('includeTechnicalDetails')?.addEventListener('change',event=>{$('technicalDetails').hidden=!event.target.checked;});
$('bugReportForm')?.addEventListener('submit',async event=>{
  event.preventDefault();
  const button=$('submitBugReport'),feedback=$('bugReportFeedback'),description=$('bugDescription').value.trim();
  if(!description)return;
  try{
    button.disabled=true;feedback.textContent='Submitting report…';
    const form=new FormData();form.append('description',description);if($('includeTechnicalDetails').checked)form.append('technicalDetails',JSON.stringify(technicalSnapshot()));if(preparedScreenshot)form.append('screenshot',preparedScreenshot,'screenshot.jpg');
    const response=await fetch(BAKED_WORKER_URL.replace(/\/+$/,'')+'/api/bug-report',{method:'POST',body:form,cache:'no-store'});let data={};try{data=await response.json();}catch{}if(!response.ok)throw new Error(data.error||`Feedback service returned HTTP ${response.status}.`);
    feedback.textContent=`Report submitted. Your one-off report ID is ${data.reportId}.`;
    $('bugDescription').value='';clearPreparedScreenshot();
  }catch(error){feedback.textContent='The report could not be submitted. Please try again when you are online.';rememberRuntimeError(error);}
  finally{button.disabled=false;}
});

queueTelemetrySync(true);

const colourBlindToggle=$('colourBlindMode');
if(colourBlindToggle){colourBlindToggle.checked=!!state.accessibility?.colourBlindMode;document.body.classList.toggle('colour-blind-mode',colourBlindToggle.checked);updateStudyReviewAlert();colourBlindToggle.addEventListener('change',()=>{state.accessibility.colourBlindMode=colourBlindToggle.checked;document.body.classList.toggle('colour-blind-mode',colourBlindToggle.checked);updateStudyReviewAlert();saveState();});}

const betaTools=/^(?:beta\.pier\.bynour\.uk|pier-beta\.n-e-alwaa\.workers\.dev)$/i.test(location.hostname)||['localhost','127.0.0.1'].includes(location.hostname);
if($('prefillExampleData'))$('prefillExampleData').hidden=!betaTools;
document.querySelector('.dev-reminder')?.toggleAttribute('hidden',!betaTools);

$('prefillExampleData')?.addEventListener('click',()=>{
  const hasExisting=!!String(state.settings.fullName||'').trim()||state.events.length>0;if(hasExisting&&!confirm('Replace the current Setup details and imported shifts with example testing data?'))return;
  const now=new Date(),key=monthKey(now),events=[];for(let i=0;i<22;i++){const day=i+1,start=new Date(now.getFullYear(),now.getMonth(),day,i%5===0?20:8,0),end=new Date(start);end.setHours(i%5===0?8:17);if(end<=start)end.setDate(end.getDate()+1);const uid=`example-${key}-${String(day).padStart(2,'0')}`;events.push({id:uid,uid,summary:i%5===0?'Example night shift':'Example day shift',description:'Synthetic testing data',start:start.toISOString(),end:end.toISOString(),status:'Claim',category:'work',source:'Example data'});}
  state.settings={...state.settings,fullName:'Alex Example',baseSite:'DPOW',baseSiteConfirmed:true,designation:'Example clinician',personalNumber:'12345678',homeAddress:'1 Example Street\nGrimsby\nDN31 1AA',vehicleReg:'TEST 123',engineCc:'1598',claimableMiles:'16.5',passengerNames:'Jamie Example',passengerMiles:'16.5',commuteMinutes:30,mileageRate:0.30,commuteType:'busrail',commuteCost:'4.50',otherExpenseType:'',otherExpenseCost:'',expenseFrequency:'daily',otherExpenseFrequency:'journey'};
  const sigCanvas=document.createElement('canvas');sigCanvas.width=420;sigCanvas.height=100;const sigCtx=sigCanvas.getContext('2d');sigCtx.fillStyle='#fff';sigCtx.fillRect(0,0,420,100);sigCtx.fillStyle='#111';sigCtx.font='italic 42px cursive';sigCtx.fillText('Alex Example',20,65);state.signature=sigCanvas.toDataURL('image/png');state.signatureDate='';state.icsUrl='';state.icsFileUpdatedAt=new Date().toISOString();state.usingExampleData=true;state.events=events;state.manualEvents=[];state.selectedMonths=[key];state.activeMonth=key;state.claims={};bindSettings(true);renderAll();saveState();showToast('Example Setup data and 22 synthetic shifts added.');
});

window.addEventListener('focus',()=>{if(state.reminders?.pushEnabled)refreshPushHealth();});
if(state.reminders?.pushEnabled)setTimeout(()=>refreshPushHealth(),1200);
