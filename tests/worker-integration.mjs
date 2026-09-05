import assert from 'node:assert/strict';
import fs from 'node:fs';
import {pathToFileURL} from 'node:url';

const miniflareDirectory=fs.readdirSync('node_modules/.pnpm').find(name=>name.startsWith('miniflare@'));
assert.ok(miniflareDirectory,'Miniflare was not found in the Wrangler dependencies.');
const {Miniflare}=await import(pathToFileURL(`${process.cwd()}/node_modules/.pnpm/${miniflareDirectory}/node_modules/miniflare/dist/src/index.js`));
const modules={
  'worker.js':{type:'esm',contents:fs.readFileSync('cloudflare-worker/worker.js','utf8')}
};
const mf=new Miniflare({
  workers:[{config:{
    name:'pier',type:'worker',compatibilityDate:'2026-08-24',compatibilityFlags:['nodejs_compat'],
    manifest:{mainModule:'worker.js',modulesRoot:process.cwd(),modules},
    env:{
      APP_CHANNEL:{type:'text',value:'live'},
      ALLOWED_ORIGIN:{type:'text',value:'https://pier.bynour.uk'},
      DASHBOARD_PASSWORD:{type:'text',value:'test-password'},
      DB:{type:'d1',name:'test',id:'test'}
    }
  }}],
  telemetry:{enabled:false},logRequests:false
});

try{
  const workerOrigin='https://travel-claims-ics.n-e-alwaa.workers.dev',auth='Basic '+Buffer.from('pier:test-password').toString('base64'),headers={Origin:workerOrigin,Authorization:auth};
  const db=await mf.getD1Database('DB');
  const schema=fs.readFileSync('cloudflare-worker/schema.sql','utf8').replace(/^--.*$/gm,'');
  for(const statement of schema.split(';').map(value=>value.trim()).filter(Boolean))await db.prepare(statement).run();
  await db.prepare("INSERT INTO telemetry_installations (installation_id,channel,token_hash,app_version,first_seen_at,last_seen_at) VALUES ('delete-me','live','hash','27',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)").run();

  let response=await mf.dispatchFetch(workerOrigin+'/',{headers:{Origin:workerOrigin}});
  assert.equal(response.status,200,'The Worker must accept its own dashboard origin.');
  response=await mf.dispatchFetch(workerOrigin+'/',{headers:{Origin:'https://not-allowed.example'}});
  assert.equal(response.status,403,'An unrelated origin must still be rejected.');

  response=await mf.dispatchFetch(workerOrigin+'/api/dashboard/telemetry/live/delete-me',{method:'DELETE',headers});
  assert.equal(response.status,200);assert.equal((await response.json()).deleted,true);
  assert.equal(await db.prepare("SELECT COUNT(*) AS count FROM telemetry_installations WHERE installation_id='delete-me'").first('count'),0);
  assert.equal(await db.prepare("SELECT COUNT(*) AS count FROM telemetry_suppressions WHERE installation_id='delete-me' AND channel='live'").first('count'),1);
  response=await mf.dispatchFetch(workerOrigin+'/api/dashboard/telemetry/live/delete-me',{method:'DELETE',headers});
  assert.equal(response.status,404,'Deleting a missing row must report that no row changed.');

  response=await mf.dispatchFetch(workerOrigin+'/api/dashboard/config',{method:'POST',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify({channel:'live',config:{text:{tabSetup:'Begin'}}})});
  assert.equal(response.status,200);const draft=await response.json();assert.ok(draft.previewToken);
  const banner=fs.readFileSync('icons/pier-sunset-hero.jpg'),boundary='pier-test-boundary',multipart=Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="channel"\r\n\r\nlive\r\n--${boundary}\r\nContent-Disposition: form-data; name="banner"; filename="banner.jpg"\r\nContent-Type: image/jpeg\r\n\r\n`),
    banner,
    Buffer.from(`\r\n--${boundary}--\r\n`)
  ]);
  response=await mf.dispatchFetch(workerOrigin+'/api/dashboard/banner',{method:'POST',headers:{...headers,'Content-Type':`multipart/form-data; boundary=${boundary}`},body:multipart});
  assert.equal(response.status,200,await response.clone().text());
  response=await mf.dispatchFetch(workerOrigin+`/api/site-assets/banner?channel=live&preview=${encodeURIComponent(draft.previewToken)}`,{headers:{Origin:workerOrigin}});
  assert.equal(response.status,200);assert.equal((await response.arrayBuffer()).byteLength,banner.byteLength);
  response=await mf.dispatchFetch(workerOrigin+'/api/dashboard/config/publish',{method:'POST',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify({channel:'live'})});
  assert.equal(response.status,200);
  response=await mf.dispatchFetch(workerOrigin+'/api/site-config',{headers:{Origin:workerOrigin}});
  assert.equal(response.status,200);const published=await response.json();assert.equal(published.config.text.tabSetup,'Begin');assert.equal(published.hasBanner,true);
  console.log('Worker integration checks passed.');
}finally{
  await mf.dispose();
}
