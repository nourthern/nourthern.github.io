'use strict';

const fieldPurpose={date:'date',claimType:'claim type',start:'start time',detail:'journey description',end:'end time',from:'starting location',to:'destination',miles:'mileage',passengerMiles:'passenger mileage',miscLabel:'additional expense description',miscAmount:'additional expense amount',mealFrom:'subsistence start time',mealTo:'subsistence end time',mealAmount:'subsistence amount'};
let lastDialogOpener=null,undoAction=null;

function ensureErrorSummary(){
  let summary=$('setupErrorSummary');
  if(!summary){summary=document.createElement('div');summary.id='setupErrorSummary';summary.className='error-summary';summary.setAttribute('role','alert');summary.tabIndex=-1;summary.hidden=true;$('setup').prepend(summary);}
  return summary;
}
clearSetupErrors=function(){
  qsa('#setup .field-error').forEach(el=>{el.classList.remove('field-error');el.removeAttribute('aria-invalid');el.removeAttribute('aria-describedby');});
  qsa('#setup .field-error-message').forEach(el=>el.remove());
  const summary=ensureErrorSummary();summary.hidden=true;summary.replaceChildren();
};
markSetupErrors=function(missing){
  clearSetupErrors();
  for(const item of missing){const el=$(item.id);if(!el)continue;const message=document.createElement('span'),messageId=item.id+'-error';message.id=messageId;message.className='field-error-message';message.textContent=`Enter ${item.label.toLowerCase()} to continue.`;el.classList.add('field-error');el.setAttribute('aria-invalid','true');el.setAttribute('aria-describedby',messageId);el.insertAdjacentElement('afterend',message);}
};
validateSetup=function(){
  const missing=requiredSetupMissing(),digits=String($('personalNumber')?.value||'').replace(/\D/g,'');
  if(!missing.some(item=>item.id==='personalNumber')&&digits.length<8)missing.push({id:'personalNumber',label:'a payroll assignment number containing at least 8 digits'});
  if(!missing.length){clearSetupErrors();return true;}
  markSetupErrors(missing);
  const summary=ensureErrorSummary(),heading=document.createElement('h2'),list=document.createElement('ul');heading.textContent=`Check ${missing.length} Setup ${missing.length===1?'item':'items'}`;
  for(const item of missing){const li=document.createElement('li'),link=document.createElement('a');link.href='#'+item.id;link.textContent=item.label;link.addEventListener('click',event=>{event.preventDefault();$(item.id)?.focus();});li.append(link);list.append(li);}
  summary.append(heading,document.createTextNode('Correct the following information. Your other entries have been kept.'),list);summary.hidden=false;summary.focus();return false;
};

function updateResumeMessage(){
  const message=$('resumeMessage');if(!message)return;
  const month=state.activeMonth||state.selectedMonths?.slice().sort()[0]||'',claim=month&&state.claims?.[month];
  if(!month){message.hidden=true;return;}
  const next=claim?.exportedAt?'open the Expense log':claim?.rows?.length?'check journeys and expenses':'check shifts';
  message.textContent=`Resume ${monthLabel(month)} claim — next: ${next}.`;message.hidden=false;
}

function readableClaimEditor(month){
  const rows=state.claims?.[month]?.rows||[],editor=document.createElement('section');editor.className='readable-claim-editor';editor.setAttribute('aria-label',`Journey editor for ${monthLabel(month)}`);
  const heading=document.createElement('h2');heading.textContent='Journeys and expenses';
  const wrap=document.createElement('div');wrap.className='journey-table-scroll';wrap.setAttribute('role','region');wrap.setAttribute('aria-label',`Editable journeys for ${monthLabel(month)}`);wrap.tabIndex=0;
  const table=document.createElement('table');table.className='journey-edit-table';table.innerHTML='<thead><tr><th><span class="sr-only">Actions</span></th><th>Date</th><th>Journey description</th><th>Start time</th><th>End time</th><th>Starting location</th><th>Destination</th><th>Mileage</th><th>Passenger mileage</th><th>Additional expense description</th><th>Additional expense amount</th></tr></thead><tbody></tbody>';
  const body=table.tBodies[0],fields=['date','detail','start','end','from','to','miles','passengerMiles','miscLabel','miscAmount'];
  rows.forEach((row,index)=>{const tr=document.createElement('tr');tr.className=isHomeboundRow(row)?'return-journey-row':'outbound-journey-row';const action=document.createElement('td'),remove=document.createElement('button');remove.type='button';remove.className='row-delete';remove.dataset.month=month;remove.dataset.row=String(index);remove.textContent='Delete';remove.setAttribute('aria-label',`Delete journey ${index+1} from ${monthLabel(month)}`);action.append(remove);tr.append(action);for(const field of fields){const td=document.createElement('td'),input=document.createElement('input');input.className='row-input';input.dataset.month=month;input.dataset.row=String(index);input.dataset.field=field;input.type=['start','end'].includes(field)?'time':(['miles','passengerMiles','miscAmount'].includes(field)?'number':'text');input.value=field==='date'?displayDate(row.date):(['start','end'].includes(field)?parseTimeFromDate(row[field]):row[field]??'');input.setAttribute('aria-label',`${monthLabel(month)}, journey ${index+1}, ${fieldPurpose[field]||field}`);input.addEventListener('input',onStackRowEdit);td.append(input);tr.append(td);}body.append(tr);});
  const totals=totalsFor(rows),foot=table.createTFoot(),totalRow=foot.insertRow();totalRow.innerHTML=`<th colspan="7" scope="row">Totals</th><td>${fmtNum(totals.miles)}</td><td>${fmtNum(totals.pass)}</td><td><span class="sr-only">Additional expense total</span></td><td>${money(totals.misc)}</td>`;
  wrap.append(table);const actions=document.createElement('div');actions.className='journey-table-actions';const add=document.createElement('button');add.type='button';add.className='secondary readable-row-add';add.textContent='Add entry';add.addEventListener('click',()=>{const rows=state.claims[month].rows,row=blankRow(month);row.detail=rows.length%2===0?'Work bound':'Home bound';rows.push(row);saveState();renderClaimsStack();});actions.append(add);editor.append(heading,wrap,actions);return editor;
}

function enhanceClaimContent(){
  qsa('.stack-claim-table').forEach(table=>{
    const month=table.dataset.month||'',caption=table.querySelector('caption')||document.createElement('caption');
    caption.textContent=`Editable journeys for ${monthLabel(month)}`;if(!caption.parentNode)table.prepend(caption);
    table.closest('.table-scroll')?.setAttribute('aria-label',`Claim editor for ${monthLabel(month)}`);
  });
  qsa('.row-input').forEach(input=>{const row=Number(input.dataset.row)+1,month=input.dataset.month,purpose=fieldPurpose[input.dataset.field]||input.dataset.field;input.setAttribute('aria-label',`${monthLabel(month)}, journey ${row}, ${purpose}`);});
  qsa('.row-delete').forEach(button=>{const row=Number(button.dataset.row)+1;button.setAttribute('aria-label',`Delete journey ${row} from ${monthLabel(button.dataset.month)}`);});
  qsa('.claim-month-card').forEach(card=>{
    if(card.querySelector('.view-payroll-preview'))return;
    const month=card.dataset.month||card.querySelector('.stack-claim-table')?.dataset.month||'';let preview=card.querySelector('.form-page-preview');
    if(!preview)return;preview.hidden=true;preview.setAttribute('role','region');preview.setAttribute('aria-label',`Payroll document preview for ${monthLabel(month)}`);preview.tabIndex=0;
    const editor=readableClaimEditor(month);preview.before(editor);card.querySelector('.edit-month-table')?.setAttribute('hidden','');
    const button=document.createElement('button');button.type='button';button.className='secondary view-payroll-preview';button.textContent='Preview payroll document';button.setAttribute('aria-expanded','false');
    const closePreview=()=>{preview.hidden=true;button.setAttribute('aria-expanded','false');button.focus();};
    button.addEventListener('click',()=>{if(!preview.hidden){closePreview();return;}const template=document.createElement('template');template.innerHTML=claimMonthCard(month);const fresh=template.content.querySelector('.form-page-preview');if(fresh){fresh.hidden=false;fresh.setAttribute('role','region');fresh.setAttribute('aria-label',`Payroll document preview for ${monthLabel(month)}`);fresh.tabIndex=0;const close=document.createElement('button');close.type='button';close.className='icon-btn payroll-preview-close';close.setAttribute('aria-label','Close payroll document preview');close.textContent='×';close.addEventListener('click',closePreview);fresh.prepend(close);preview.replaceWith(fresh);preview=fresh;}button.setAttribute('aria-expanded','true');preview.hidden=false;preview.focus();});
    editor.querySelector('.journey-table-actions')?.append(button);
    document.addEventListener('click',event=>{if(!preview.hidden&&!preview.contains(event.target)&&event.target!==button)closePreview();});
  });
}
const renderClaimsStackAccessible=renderClaimsStack;
renderClaimsStack=function(){renderClaimsStackAccessible();enhanceClaimContent();updateResumeMessage();};

qsa('.tabs [role="tab"]').forEach((tab,index,tabs)=>{
  tab.addEventListener('keydown',event=>{let next;if(event.key==='ArrowRight')next=(index+1)%tabs.length;else if(event.key==='ArrowLeft')next=(index-1+tabs.length)%tabs.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=tabs.length-1;else return;event.preventDefault();tabs[next].focus();navigate(tabs[next].dataset.tab);});
});
$('restoreButton')?.addEventListener('click',()=>$('restoreInput')?.click());

document.addEventListener('click',event=>{
  const deleteRow=event.target.closest('.row-delete'),deleteLog=event.target.closest('.log-delete'),deleteShift=event.target.closest('.shift .delete');
  if(deleteRow){event.preventDefault();event.stopImmediatePropagation();const month=deleteRow.dataset.month,index=Number(deleteRow.dataset.row),row=state.claims[month]?.rows?.[index];if(!row)return;state.claims[month].rows.splice(index,1);undoAction=()=>{state.claims[month].rows.splice(index,0,row);saveState();renderClaimsStack();};showUndo('Journey deleted.');saveState();renderClaimsStack();return;}
  if(deleteLog){event.preventDefault();event.stopImmediatePropagation();const index=state.expenseLog.findIndex(item=>item.id===deleteLog.dataset.id),item=state.expenseLog[index];if(!item)return;state.expenseLog.splice(index,1);undoAction=()=>{state.expenseLog.splice(index,0,item);saveState();renderExpenseLog();};showUndo('Expense-log entry deleted.');saveState();renderExpenseLog();}
  if(deleteShift){event.preventDefault();event.stopImmediatePropagation();const id=deleteShift.closest('.shift')?.dataset.id,eventIndex=state.events.findIndex(item=>item.id===id),manualIndex=state.manualEvents.findIndex(item=>item.id===id),item=eventIndex>=0?state.events[eventIndex]:state.manualEvents[manualIndex];if(!item)return;if(eventIndex>=0)state.events.splice(eventIndex,1);if(manualIndex>=0)state.manualEvents.splice(manualIndex,1);undoAction=()=>{if(eventIndex>=0)state.events.splice(eventIndex,0,item);if(manualIndex>=0)state.manualEvents.splice(manualIndex,0,item);saveState();renderAll();};showUndo(`Shift on ${fmtDateTime(item.start).split(' ')[0]} deleted.`);saveState();renderAll();}
},true);

function showUndo(message){
  let region=$('undoRegion');if(!region){region=document.createElement('div');region.id='undoRegion';region.className='undo-region';region.setAttribute('role','status');document.body.append(region);}
  region.replaceChildren(document.createTextNode(message+' '));const button=document.createElement('button');button.type='button';button.className='secondary';button.textContent='Undo';button.addEventListener('click',()=>{undoAction?.();undoAction=null;region.hidden=true;});region.append(button);region.hidden=false;
}

function configureDialogs(){
  qsa('dialog').forEach((dialog,index)=>{const title=dialog.querySelector('h2,h3,h4');if(title){if(!title.id)title.id=`dialog-title-${index+1}`;dialog.setAttribute('aria-labelledby',title.id);}dialog.setAttribute('aria-modal','true');dialog.querySelectorAll('.icon-btn,[data-close-dialog]').forEach(button=>{if(!button.getAttribute('aria-label'))button.setAttribute('aria-label',`Close ${title?.textContent||'dialog'}`);});});
}
configureDialogs();
document.addEventListener('click',event=>{const opener=event.target.closest('[id^="open"],#setupSignature');if(opener)lastDialogOpener=opener;},true);
document.addEventListener('close',event=>{if(event.target.matches('dialog')&&lastDialogOpener?.isConnected){lastDialogOpener.focus();lastDialogOpener=null;}},true);
document.addEventListener('keydown',event=>{const dialog=qsa('dialog[open]')[0];if(!dialog||event.key!=='Tab')return;const focusable=qsa('a[href],button:not([disabled]),input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])').filter(el=>dialog.contains(el)&&!el.hidden),first=focusable[0],last=focusable.at(-1);if(!first)return;if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}});

document.addEventListener('click',event=>{const button=event.target.closest('.edit-month-table');if(!button)return;queueMicrotask(()=>{const first=qsa(`.row-input[data-month="${button.dataset.month}"]`)[0],replacement=qsa(`.edit-month-table[data-month="${button.dataset.month}"]`)[0];(first||replacement)?.focus();});},true);

const display=document.createElement('details');display.className='display-preferences';display.innerHTML='<summary>Display &amp; accessibility</summary><div class="display-preferences-options"><label><input id="largerTextPreference" type="checkbox"> Larger text</label><label><input id="extraSpacingPreference" type="checkbox"> Extra spacing</label><label><input id="reduceColourPreference" type="checkbox"> Reduce colour</label><label><input id="highContrastPreference" type="checkbox"> High contrast</label><label><input id="underlineLinksPreference" type="checkbox"> Underline links</label></div>';
document.querySelector('.tabs')?.append(display);
for(const [id,cls] of [['largerTextPreference','pref-large-text'],['extraSpacingPreference','pref-more-spacing'],['reduceColourPreference','pref-reduce-colour'],['highContrastPreference','pref-high-contrast'],['underlineLinksPreference','pref-underline-links']]){$(id)?.addEventListener('change',event=>{document.body.classList.toggle(cls,event.target.checked);});}

function updatePassengerFields(){
  const enabled=$('additionalPassengers')?.checked||!!String(state.settings.passengerNames||state.settings.passengerMiles||'').trim();
  if($('additionalPassengers'))$('additionalPassengers').checked=enabled;
  if($('passengerNamesField'))$('passengerNamesField').hidden=!enabled;
  if($('passengerMilesField'))$('passengerMilesField').hidden=!enabled;
}
$('additionalPassengers')?.addEventListener('change',updatePassengerFields);

const renderShiftsAccessible=renderShifts;
function removeCalendarAddBubble(){document.querySelector('.calendar-add-bubble')?.remove();}
function showCalendarAddBubble(day,event){removeCalendarAddBubble();const date=day.dataset.date,bubble=document.createElement('div'),add=document.createElement('button');bubble.className='calendar-add-bubble';bubble.setAttribute('role','group');bubble.setAttribute('aria-label',`Actions for ${displayDate(date)}`);add.type='button';add.textContent='Add unscheduled day';add.addEventListener('click',buttonEvent=>{buttonEvent.stopPropagation();removeCalendarAddBubble();$('addManualShift').click();$('manualDate').value=date;});bubble.append(add);document.body.append(bubble);const rect=day.getBoundingClientRect(),x=Math.min(innerWidth-bubble.offsetWidth-12,Math.max(12,event?.clientX||rect.left)),y=Math.min(innerHeight-bubble.offsetHeight-12,Math.max(12,rect.bottom+6));bubble.style.left=x+'px';bubble.style.top=y+'px';add.focus();}
const renderShiftCalendarAccessible=renderShiftCalendar;
renderShiftCalendar=function(items){let migrated=false;items.forEach(item=>{if(item.category!=='study'&&!item.reviewed){item.status='Do not claim';item.reviewed=true;migrated=true;}});if(migrated)saveState();renderShiftCalendarAccessible(items);qsa('#shiftCalendar .calendar-day.claim').forEach(day=>{const status=day.querySelector('.calendar-status'),marker=day.querySelector('.calendar-marker');if(status)status.textContent='Claim';if(marker&&!day.classList.contains('night'))marker.textContent='✓';});qsa('#shiftCalendar .calendar-day.no-claim,#shiftCalendar .calendar-day.study').forEach(day=>{const status=day.querySelector('.calendar-status'),marker=day.querySelector('.calendar-marker');if(status?.textContent==='Do not claim'&&marker)marker.textContent='×';});qsa('#shiftCalendar .calendar-day.blank').forEach(day=>{const button=document.createElement('button'),date=day.closest('.shift-month-card')?.querySelector('h4')?.id?.replace('shift-month-','')+'-'+String(day.querySelector('b')?.textContent||'').padStart(2,'0');button.type='button';button.className=day.className;button.dataset.date=date;button.innerHTML=day.innerHTML;button.setAttribute('aria-label',`${displayDate(date)}, no shifts. Add an unscheduled day`);button.addEventListener('click',event=>showCalendarAddBubble(button,event));day.replaceWith(button);});};
shiftRowMarkup=function(item,{popup=false}={}){const start=new Date(item.start),end=new Date(item.end||item.start),date=fmtDateTime(item.start).split(' ')[0],weekday=start.toLocaleDateString('en-GB',{timeZone:APP_TIME_ZONE,weekday:'long'}),cat=['study','leave','work'].includes(item.category)?item.category:'work',status=item.status==='Claim'?'Claim':'Do not claim',summary=item.category==='study'?'Study':item.summary||'Unscheduled travel',label=`${date}, ${summary}`,review=item.category==='study'?`<label class="study-reviewed"><input type="checkbox" ${item.reviewed?'checked':''}> Study day checked</label>`:'',startTime=parseTimeFromDate(start),endTime=parseTimeFromDate(end);return `<div class="shift shift-${cat} status-${status==='Claim'?'claim':'no-claim'} ${item.source==='manual'?'manual':''} ${popup?'popup-shift':''}" data-id="${escapeAttr(item.id)}" data-date="${shiftDateKey(item.start)}" tabindex="-1"><div class="date"><span class="shift-weekday">${weekday}</span><span class="shift-date-value">${date}</span></div><div><div class="summary">${escapeHtml(summary)}</div><div class="shift-time-editor"><label>Start <input class="shift-time" data-field="start" type="time" value="${startTime}" aria-label="Start time for ${escapeAttr(label)}"></label><span aria-hidden="true">→</span><label>End <input class="shift-time" data-field="end" type="time" value="${endTime}" aria-label="End time for ${escapeAttr(label)}"></label></div>${review}</div>${shiftStatusOptionsMarkup(item,label,popup?'popup':'list')}<button class="delete" type="button" title="Delete shift" aria-label="Delete shift on ${escapeAttr(date)}">×</button></div>`;};
bindShiftRows=function(scope,items,{popupDate=''}={}){scope.querySelectorAll('.shift').forEach(row=>{const id=row.dataset.id,item=items.find(candidate=>candidate.id===id)||allEventItems().find(candidate=>candidate.id===id);if(!item)return;row.querySelectorAll('input.shift-status').forEach(choice=>choice.addEventListener('change',()=>{if(!choice.checked)return;item.status=choice.value;if(item.category==='study'){item.reviewed=true;const reviewBox=row.querySelector('.study-reviewed input');if(reviewBox)reviewBox.checked=true;}row.classList.toggle('status-claim',choice.value==='Claim');row.classList.toggle('status-no-claim',choice.value!=='Claim');refreshShiftViews();saveState();}));row.querySelectorAll('.shift-time').forEach(input=>input.addEventListener('change',()=>{applyShiftTime(item,input.dataset.field,input.value);refreshShiftViews();if(popupDate)renderShiftDayDialog(popupDate);}));row.querySelector('.study-reviewed input')?.addEventListener('change',event=>{item.reviewed=event.target.checked;refreshShiftViews();saveState();});row.querySelector('.delete').addEventListener('click',()=>{state.events=state.events.filter(candidate=>candidate.id!==id);state.manualEvents=state.manualEvents.filter(candidate=>candidate.id!==id);if(popupDate){refreshShiftViews();const remaining=selectedShiftItems().filter(candidate=>shiftDateKey(candidate.start)===popupDate);if(remaining.length)renderShiftDayDialog(popupDate);else $('shiftDayDialog').close();}else renderAll();saveState();});});};
renderShifts=function(){let migrated=false;selectedShiftItems().forEach(item=>{if(item.category!=='study'&&!item.reviewed){item.status='Do not claim';item.reviewed=true;migrated=true;}});if(migrated)saveState();renderShiftsAccessible();
  let week='';qsa('#shiftList > .shift').forEach(row=>{const date=new Date(`${row.dataset.date}T12:00:00`),day=(date.getDay()+6)%7;date.setDate(date.getDate()-day);const key=date.toISOString().slice(0,10);if(key===week)return;week=key;const heading=document.createElement('h3');heading.className='shift-week-heading';heading.textContent=`Week commencing ${displayDate(key)}`;row.before(heading);});
};

document.addEventListener('pointerdown',event=>{if(!event.target.closest('.calendar-add-bubble,.calendar-day.blank'))removeCalendarAddBubble();});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&document.querySelector('.calendar-add-bubble')){removeCalendarAddBubble();event.preventDefault();}});
addEventListener('resize',removeCalendarAddBubble);
addEventListener('scroll',removeCalendarAddBubble,true);
const calendarHelpFile=$('calendarHelpFile');if(calendarHelpFile){calendarHelpFile.hidden=false;calendarHelpFile.classList.add('visually-hidden-file');}

const fetchTextWithExistingFallbacks=fetchText;
fetchText=async function(url){if(!IS_BETA_DEPLOYMENT)return fetchTextWithExistingFallbacks(url);const normalized=normalizeUrl(url);try{const text=await fetchWithTimeout(location.origin.replace(/\/+$/,'')+'/ics',15000,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url:normalized})});if(isIcs(text))return {text,source:'PIER secure Worker'};}catch{}return fetchTextWithExistingFallbacks(normalized);};

const renderExpenseLogAccessible=renderExpenseLog;
renderExpenseLog=function(){renderExpenseLogAccessible();qsa('.log-delete').forEach(button=>{const item=state.expenseLog.find(entry=>entry.id===button.dataset.id);button.setAttribute('aria-label',`Delete expense-log entry${item?.range?' for '+item.range:''}`);});updateResumeMessage();};

$('footerOpenAccessibility')?.addEventListener('click',event=>{lastDialogOpener=event.currentTarget;$('accessibilityDialog')?.showModal();});
updatePassengerFields();updateResumeMessage();enhanceClaimContent();renderExpenseLog();renderShifts();
