'use strict';
async function initializePierAccessibility(){
  const nav=document.querySelector('.tabs');
  if(!nav)return;
  const slot=document.createElement('div');slot.className='astral-nav-slot';nav.append(slot);
  const status=document.createElement('span');status.className='hint';status.setAttribute('role','status');status.textContent='Loading accessibility…';slot.append(status);
  try{
    await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='vendor/astral/main.js';script.onload=resolve;script.onerror=reject;document.head.append(script);});
    await window.initializeAstral({enabledFeatures:['Screen Reader','Contrast','Saturation','Bigger Text','Text Spacing','Screen Mask','Line Height'],position:'top-right',toggleColor:'#123047',toggleIconColor:'#ffffff',compact:true,language:'en',customStyles:{position:'relative',top:'auto',right:'auto',bottom:'auto',left:'auto'}});
    const host=document.querySelector('astral-accessibility');
    if(!host)throw new Error('Astral did not initialise');
    slot.replaceChildren(host);
    const enhance=()=>{
      const toggle=host.querySelector('.astral-icon'),panel=host.querySelector('.astral-modal');
      if(!toggle||!panel)return;
      const open=panel.classList.contains('active');
      toggle.type='button';toggle.setAttribute('aria-label',open?'Close accessibility options':'Open accessibility options');toggle.title='Accessibility';toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-controls','astral-options');
      panel.id='astral-options';panel.setAttribute('role','region');panel.setAttribute('aria-label','Accessibility options');panel.inert=!open;
      host.querySelectorAll('svg').forEach(svg=>svg.setAttribute('aria-hidden','true'));
    };
    new MutationObserver(enhance).observe(host,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});enhance();
    const close=()=>{if(host.querySelector('.astral-modal.active'))host.querySelector('.astral-icon')?.click();};
    host.addEventListener('keydown',event=>{if(event.key==='Escape'){close();host.querySelector('.astral-icon')?.focus();event.stopPropagation();}});
    document.addEventListener('pointerdown',event=>{if(!host.contains(event.target))close();});
    host.addEventListener('focusout',event=>{if(event.relatedTarget&&!host.contains(event.relatedTarget))close();});
  }catch(error){
    console.error('Accessibility controls could not load',error);
    status.textContent='Accessibility controls could not load. Reload PIER to retry.';slot.replaceChildren(status);
  }
}
