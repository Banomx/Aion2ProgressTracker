import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { Script } from 'node:vm';
import { createHash } from 'node:crypto';
const root=new URL('../dist/',import.meta.url);
const html=await readFile(new URL('index.html',root),'utf8');
assert.match(html,/<title>Aion 2 · Progress Tracker<\/title>/);
assert.match(html,/href="\.\/favicon.svg"/);
for(const asset of ['styles.css','data.js','schedules.js','app.js'])assert.ok(html.includes('./'+asset),asset+' must have a relative path');
for(const asset of ['styles.css','data.js','schedules.js','app.js']){
  const version=createHash('sha256').update(await readFile(new URL(asset,root))).digest('hex').slice(0,12);
  assert.ok(html.includes('./'+asset+'?v='+version+'"'),asset+' must use its current content hash');
}
const sources=await Promise.all(['data.js','schedules.js','app.js'].map(name=>readFile(new URL(name,root),'utf8')));
new Script(sources.join('\n'));
assert.doesNotMatch(html+sources.join('\n'),/\/api\/state|__DATA__/);
for(const name of ['favicon.svg','styles.css','.nojekyll'])assert.ok((await stat(new URL(name,root))).isFile());
console.log('Validated static Pages artifact, relative assets and JavaScript syntax.');
