import { cp, mkdir, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=join(dirname(fileURLToPath(import.meta.url)),'..');
const out=join(root,'site-dist');
const files=['index.html','accessibility.html','styles.css','app.js','manifest.json','sw.js','icalendar-page-guide.jpg'];
const directories=['app-parts','icons','template','vendor','dashboard-assets'];

await rm(out,{recursive:true,force:true});
await mkdir(out,{recursive:true});
for(const file of files)await cp(join(root,file),join(out,file));
for(const directory of directories)await cp(join(root,directory),join(out,directory),{recursive:true});
