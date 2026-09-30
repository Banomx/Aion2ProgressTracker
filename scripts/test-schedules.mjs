import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { extractSchedules, fetchSchedules, refresh, validateSnapshot, pages } from './refresh-schedules.mjs';
const source='function minute(text){const [h,m]=text.split(`:`).map(Number);return h*60+m}function repeat(text,step){const values=[];for(let t=minute(text);t<1440;t+=step)values.push(t);return values}var regions={global:{client:`global`,timeZone:`UTC`}},schedule={global:{"shugo-festival":{times:repeat(`00:00`,60),durationMinutes:10},"spacetime-rift":{times:repeat(`02:00`,180),durationMinutes:60},"watcher-kaira":{times:repeat(`01:00`,180)},"daily-reset":{times:[minute(`16:00`)]},"weekly-reset":{days:[3],times:[minute(`16:00`)]}}};';
const snapshot=extractSchedules(source);assert.deepEqual(snapshot.events.rift.times,[120,300,480,660,840,1020,1200,1380]);assert.deepEqual(snapshot.events.weekly.days,[3]);
assert.throws(()=>extractSchedules(source.replace('`UTC`','`Asia/Seoul`')));assert.throws(()=>extractSchedules(source.replace('`16:00`','`25:00`')));assert.throws(()=>extractSchedules(source.replace('repeat(`00:00`,60)','dangerous()')));assert.throws(()=>validateSnapshot({...snapshot,events:{...snapshot.events,shugo:{times:[1,1]}}}));
const base='https://cdn.questlog.gg/test/',entry=base+'entry.js';let requests=[];
async function mock(url){requests.push(url);if(pages.includes(url))return '<script src="'+entry+'"></script>';if(url===entry)return pages.map((page,i)=>'name:`'+page.split('/').at(-1)+'___de`,component:()=>import(`./route'+i+'.js`)').join(';');if(/route[0-3]\.js$/.test(url))return 'import {times} from "./shared.js";';if(url===base+'shared.js')return source;throw Error('Unexpected URL '+url)}
assert.deepEqual((await fetchSchedules(mock)).events,snapshot.events);assert.ok(pages.every(page=>requests.includes(page)));assert.equal(requests.filter(url=>url===base+'shared.js').length,1);
const folder=await mkdtemp(join(tmpdir(),'aion-schedule-test-'));try{
 const sitePath=join(folder,'schedules.js'),cachePath=join(folder,'cache/snapshot.json');await writeFile(sitePath,'const QUESTLOG_SCHEDULE = '+JSON.stringify(snapshot)+';\n');
 const fresh=await refresh({fetchText:mock,sitePath,cachePath});assert.equal(fresh.fresh,true);
 const saved=await readFile(cachePath,'utf8');const failed=await refresh({fetchText:async()=>{throw Error('source unavailable')},sitePath,cachePath});assert.equal(failed.fresh,false);assert.deepEqual(failed.data,fresh.data);assert.equal(await readFile(cachePath,'utf8'),saved);
 assert.match(await readFile(sitePath,'utf8'),/QUESTLOG_SCHEDULE/);
}finally{await rm(folder,{recursive:true,force:true})}
console.log('Passed: source discovery, Global UTC extraction, validation and last-good fallback.');
