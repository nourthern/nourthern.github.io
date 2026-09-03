'use strict';

const fieldPurpose={date:'date',claimType:'claim type',start:'start time',detail:'journey description',end:'end time',from:'starting location',to:'destination',miles:'mileage',passengerMiles:'passenger mileage',miscLabel:'additional expense description',miscAmount:'additional expense amount',mealFrom:'subsistence start time',mealTo:'subsistence end time',mealAmount:'subsistence amount'};
let lastDialogOpener=null,undoAction=null;

const requiredSetupMissingBase=requiredSetupMissing;
requiredSetupMissing=function(){return requiredSetupMissingBase().filter(item=>item.id!=='setupSignature');};

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
  const heading=document.createElement('h3');heading.textContent='Journeys and expenses';editor.append(heading);
  rows.forEach((row,index)=>{
    const card=document.createElement('fieldset');card.className='journey-card';const legend=document.createElement('legend');legend.textContent=`Journey ${index+1} — ${displayDate(row.date)}`;card.append(legend);
    const values={date:displayDate(row.date),detail:row.detail,start:parseTimeFromDate(row.start),end:parseTimeFromDate(row.end),from:row.from,to:row.to,miles:row.miles??'',passengerMiles:row.passengerMiles??'',miscLabel:row.miscLabel||'',miscAmount:row.miscAmount??''};
    for(const [field,value] of Object.entries(values)){const label=document.createElement('label'),input=document.createElement('input');label.textContent=fieldPurpose[field]||field;input.className='row-input';input.dataset.month=month;input.dataset.row=String(index);input.dataset.field=field;input.type=['start','end'].includes(field)?'time':(['miles','passengerMiles','miscAmount'].includes(field)?'number':'text');input.value=value;input.setAttribute('aria-label',`${monthLabel(month)}, journey ${index+1}, ${fieldPurpose[field]||field}`);input.addEventListener('input',onStackRowEdit);label.append(input);card.append(label);}
    const remove=document.createElement('button');remove.type='button';remove.className='row-delete';remove.dataset.month=month;remove.dataset.row=String(index);remove.textContent='Delete journey';remove.setAttribute('aria-label',`Delete journey ${index+1} from ${monthLabel(month)}`);card.append(remove);editor.append(card);
  });
  const add=document.createElement('button');add.type='button';add.className='secondary readable-row-add';add.textContent='Add journey';add.addEventListener('click',()=>{state.claims[month].rows.push(blankRow(month));saveState();renderClaimsStack();});editor.append(add);return editor;
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
    const month=card.dataset.month||card.querySelector('.stack-claim-table')?.dataset.month||'',preview=card.querySelector('.form-page-preview');
    if(!preview)return;preview.hidden=true;preview.setAttribute('role','region');preview.setAttribute('aria-label',`Payroll document preview for ${monthLabel(month)}`);preview.tabIndex=0;
    preview.before(readableClaimEditor(month));card.querySelector('.edit-month-table')?.setAttribute('hidden','');
    const button=document.createElement('button');button.type='button';button.className='secondary view-payroll-preview';button.textContent='View payroll document';button.setAttribute('aria-expanded','false');
    button.addEventListener('click',()=>{const opening=preview.hidden;preview.hidden=!opening;button.setAttribute('aria-expanded',String(opening));button.textContent=opening?'Close payroll document':'View payroll document';if(opening)preview.focus();});
    card.querySelector('.claim-month-heading')?.append(button);
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

const display=document.createElement('details');display.className='display-preferences';display.innerHTML='<summary>Display preferences</summary><label><input id="largerTextPreference" type="checkbox"> Larger text</label><label><input id="increasedSpacingPreference" type="checkbox"> Increased spacing</label><label><input id="calmerBackgroundPreference" type="checkbox"> Calmer background</label>';
document.querySelector('.site-footer')?.before(display);
for(const [id,cls] of [['largerTextPreference','pref-large-text'],['increasedSpacingPreference','pref-more-spacing'],['calmerBackgroundPreference','pref-calm']]){$(id)?.addEventListener('change',event=>{document.body.classList.toggle(cls,event.target.checked);});}

function updatePassengerFields(){
  const enabled=$('additionalPassengers')?.checked||!!String(state.settings.passengerNames||state.settings.passengerMiles||'').trim();
  if($('additionalPassengers'))$('additionalPassengers').checked=enabled;
  if($('passengerNamesField'))$('passengerNamesField').hidden=!enabled;
  if($('passengerMilesField'))$('passengerMilesField').hidden=!enabled;
}
$('additionalPassengers')?.addEventListener('change',updatePassengerFields);

const shiftTools=document.querySelector('.shift-view-toolbar');
if(shiftTools){
  const progress=document.createElement('p');progress.id='completeShiftReviewProgress';progress.className='shift-review-totals';progress.setAttribute('role','status');
  const needs=document.createElement('button');needs.id='needsReviewFilter';needs.className='secondary';needs.type='button';needs.textContent='Needs review';
  const next=document.createElement('button');next.id='nextUncheckedShift';next.className='secondary';next.type='button';next.textContent='Next unchecked shift';
  needs.addEventListener('click',()=>{shiftView='list';renderShifts();qsa('#shiftList .shift').forEach(row=>{const item=selectedShiftItems().find(entry=>entry.id===row.dataset.id);row.hidden=!!item?.reviewed;});});
  next.addEventListener('click',()=>{shiftView='list';renderShifts();const item=selectedShiftItems().find(entry=>!entry.reviewed),row=item&&document.querySelector(`.shift[data-id="${CSS.escape(item.id)}"]`);row?.focus();row?.scrollIntoView({block:'center'});});
  shiftTools.append(needs,next,progress);
}

const renderShiftsAccessible=renderShifts;
renderShifts=function(){renderShiftsAccessible();const items=selectedShiftItems(),claimed=items.filter(item=>item.status==='Claim'&&item.reviewed).length,excluded=items.filter(item=>item.status!=='Claim'&&item.reviewed).length,unchecked=items.filter(item=>!item.reviewed).length,progress=$('completeShiftReviewProgress');if(progress)progress.textContent=`${items.length-unchecked} of ${items.length} shifts reviewed · ${claimed} claimed · ${excluded} excluded · ${unchecked} unchecked`;
  let week='';qsa('#shiftList > .shift').forEach(row=>{const date=new Date(`${row.dataset.date}T12:00:00`),day=(date.getDay()+6)%7;date.setDate(date.getDate()-day);const key=date.toISOString().slice(0,10);if(key===week)return;week=key;const heading=document.createElement('h3');heading.className='shift-week-heading';heading.textContent=`Week commencing ${displayDate(key)}`;row.before(heading);});
};

const renderExpenseLogAccessible=renderExpenseLog;
renderExpenseLog=function(){renderExpenseLogAccessible();qsa('.log-delete').forEach(button=>{const item=state.expenseLog.find(entry=>entry.id===button.dataset.id);button.setAttribute('aria-label',`Delete expense-log entry${item?.range?' for '+item.range:''}`);});updateResumeMessage();};

updatePassengerFields();updateResumeMessage();enhanceClaimContent();renderExpenseLog();renderShifts();
