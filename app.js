(async()=>{
'use strict';
const APP_SHELL_VERSION='25';
const parts=['app-parts/app-00.js','app-parts/app-01.js','app-parts/app-02.js','app-parts/app-03.js','app-parts/app-04.js','app-parts/app-05.js'];
for(const src of parts){
  await new Promise((resolve,reject)=>{
    const s=document.createElement('script');
    s.src=src+'?v='+APP_SHELL_VERSION;
    s.async=false;
    s.onload=resolve;
    s.onerror=()=>reject(new Error('Failed to load '+src));
    document.head.appendChild(s);
  });
}
})().catch(err=>{console.error(err);alert('Travel Claims Manager could not start. Please refresh the page.');});
