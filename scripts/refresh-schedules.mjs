import { parse } from 'acorn';
import { readFile, writeFile, mkdir, appendFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { pathToFileURL } from 'node:url';
import { dirname } from 'node:path';
const run=promisify(execFile);
export const pages=['shugo-festival','spacetime-rift','boss-schedule','server-resets'].map(path=>'https://questlog.gg/aion-2/de/'+path);
const events={shugo:'shugo-festival',rift:'spacetime-rift',kaira:'watcher-kaira',daily:'daily-reset',weekly:'weekly-reset'};
function walk(node,visit){if(!node||typeof node!=='object')return;visit(node);for(const value of Object.values(node)){if(Array.isArray(value))value.forEach(item=>walk(item,visit));else if(value&&typeof value==='object')walk(value,visit)}}
const key=p=>p.key?.name??p.key?.value;
export function extractSchedules(source){
  const ast=parse(source,{ecmaVersion:'latest',sourceType:'module'}),arrays={};let schedule,timezone,client;const helpers={};
  walk(ast,node=>{
    if(node.type==='FunctionDeclaration')helpers[node.id.name]=node;
    if(node.type==='VariableDeclarator'&&node.init?.type==='ArrayExpression'&&node.init.elements.every(e=>e?.type==='Literal'&&Number.isInteger(e.value)))arrays[node.id.name]=node.init.elements.map(e=>e.value);
    if(node.type==='ObjectExpression'){
      const global=node.properties.find(p=>key(p)==='global')?.value;
      if(global?.type!=='ObjectExpression')return;
      if(global.properties.some(p=>key(p)==='shugo-festival')){if(schedule)throw Error('Ambiguous schedules');schedule=global}
      const tz=global.properties.find(p=>key(p)==='timeZone')?.value;if(tz){timezone=literal(tz);client=literal(global.properties.find(p=>key(p)==='client')?.value)}
    }
  });
  if(!schedule||timezone!=='UTC'||client!=='global')throw Error('Missing explicit Global UTC schedules');
  function literal(node){if(node?.type==='Literal')return node.value;if(node?.type==='TemplateLiteral'&&!node.expressions.length)return node.quasis[0].value.cooked;throw Error('Unsupported source literal')}
  function minutes(node){const text=literal(node);if(typeof text!=='string'||!/^([01]\d|2[0-3]):[0-5]\d$/.test(text))throw Error('Invalid source time');return Number(text.slice(0,2))*60+Number(text.slice(3))}
  function helperCall(node,kind){
    const fn=helpers[node.callee?.name];if(!fn)throw Error('Unknown schedule helper');
    const nodes=[];walk(fn.body,item=>nodes.push(item));
    const minute=nodes.some(n=>n.type==='CallExpression'&&n.callee?.property?.name==='split'&&literal(n.arguments[0])===':')&&nodes.some(n=>n.type==='BinaryExpression'&&n.operator==='*'&&n.right?.value===60);
    const repeat=nodes.some(n=>n.type==='ForStatement'&&n.test?.operator==='<'&&n.test.right?.value===1440&&n.update?.operator==='+='&&n.update.right?.name===fn.params[1]?.name)&&nodes.some(n=>n.type==='CallExpression'&&n.callee?.property?.name==='push');
    if(kind==='minute'?!minute:!repeat)throw Error('Unsupported schedule helper semantics');
  }
  function times(node){
    if(node?.type==='ArrayExpression')return node.elements.map(e=>e.type==='CallExpression'&&e.arguments.length===1?(helperCall(e,'minute'),minutes(e.arguments[0])):literal(e));
    if(node?.type==='CallExpression'&&node.arguments.length===2){helperCall(node,'repeat');const start=minutes(node.arguments[0]),step=literal(node.arguments[1]);if(!Number.isInteger(step)||step<30||step>1440)throw Error('Invalid interval');return Array.from({length:Math.ceil((1440-start)/step)},(_,i)=>start+i*step)}
    throw Error('Unsupported schedule format');
  }
  const result={};
  for(const [id,slug] of Object.entries(events)){
    const object=schedule.properties.find(p=>key(p)===slug)?.value;if(object?.type!=='ObjectExpression')throw Error('Missing event '+slug);
    const field=name=>object.properties.find(p=>key(p)===name)?.value;
    result[id]={times:times(field('times'))};
    if(field('durationMinutes'))result[id].durationMinutes=literal(field('durationMinutes'));
    if(field('days')){const days=field('days');result[id].days=days.type==='Identifier'?arrays[days.name]:days.elements.map(literal)}
  }
  return validateSnapshot({version:1,region:'global',timezone:'UTC',checkedAt:new Date().toISOString(),sources:pages,events:result});
}
export function validateSnapshot(data){
  if(data?.version!==1||data.region!=='global'||data.timezone!=='UTC'||!Number.isFinite(Date.parse(data.checkedAt)))throw Error('Invalid schedule metadata');
  for(const id of Object.keys(events)){
    const e=data.events?.[id];if(!e||!Array.isArray(e.times)||!e.times.length||e.times.length>48||e.times.some(t=>!Number.isInteger(t)||t<0||t>=1440)||new Set(e.times).size!==e.times.length||e.times.some((t,i)=>i&&t<=e.times[i-1]))throw Error('Invalid '+id+' times');
    if(e.days!==undefined&&(!Array.isArray(e.days)||!e.days.length||e.days.some(d=>!Number.isInteger(d)||d<0||d>6)))throw Error('Invalid days');
    if(e.durationMinutes!==undefined&&(!Number.isInteger(e.durationMinutes)||e.durationMinutes<1||e.durationMinutes>180))throw Error('Invalid duration');
  }
  return data;
}
async function download(url){const u=new URL(url);if(!['questlog.gg','cdn.questlog.gg'].includes(u.hostname)||u.protocol!=='https:')throw Error('Unexpected source host');const {stdout}=await run('curl',['--fail','--silent','--show-error','--location','--max-time','25',url],{maxBuffer:4*1024*1024});return stdout}
export async function fetchSchedules(fetchText=download){
  const html=await Promise.all(pages.map(fetchText));
  const entries=html.map(text=>text.match(/src="(https:\/\/cdn\.questlog\.gg\/[^" ]+\.js)"/)?.[1]);if(entries.some(e=>!e))throw Error('Missing app entry');
  const cache=new Map();async function get(url){if(!cache.has(url))cache.set(url,fetchText(url));return cache.get(url)}
  const routes=['shugo-festival','spacetime-rift','boss-schedule','server-resets'];const modules=[];
  for(let i=0;i<routes.length;i++){
    const entry=await get(entries[i]),route=routes[i];
    const match=entry.match(new RegExp('name:`'+route+'___de`[\\s\\S]{0,250}?import\\(`([^`]+)`\\)'));if(!match)throw Error('Missing route '+route);
    const routeUrl=new URL(match[1],entries[i]).href,code=await get(routeUrl);
    const imports=[...code.matchAll(/from\s*["'](\.\/[^"']+\.js)["']/g)].map(m=>new URL(m[1],routeUrl).href);
    let found;
    for(const url of imports){const module=await get(url);if(module.includes('"shugo-festival"')&&module.includes('"daily-reset"')){if(found)throw Error('Ambiguous module');found=url}}
    if(!found)throw Error('Missing schedule data for '+route);modules.push(found);
  }
  if(new Set(modules).size!==1)throw Error('Pages disagree on schedule source');
  return extractSchedules(await get(modules[0]));
}
export async function refresh({fetchText=download,cachePath='.cache/questlog-schedule.json',sitePath='site/schedules.js',report=true}={}){
  const bundled=JSON.parse((await readFile(sitePath,'utf8')).replace(/^const QUESTLOG_SCHEDULE = /,'').replace(/;\s*$/,''));let previous=validateSnapshot(bundled);
  try{const cached=validateSnapshot(JSON.parse(await readFile(cachePath,'utf8')));if(Date.parse(cached.checkedAt)>Date.parse(previous.checkedAt))previous=cached}catch{}
  let data=previous,fresh=false;
  try{data=await fetchSchedules(fetchText);fresh=true;await mkdir(dirname(cachePath),{recursive:true});await writeFile(cachePath,JSON.stringify(data));if(report)console.log('QuestLog Global schedule validated across all four pages.')}
  catch(error){if(report)console.warn('::warning::QuestLog schedule check failed; retaining last validated data. '+error.message)}
  await writeFile(sitePath,'const QUESTLOG_SCHEDULE = '+JSON.stringify(data,null,2)+';\n');
  if(report&&process.env.GITHUB_STEP_SUMMARY)await appendFile(process.env.GITHUB_STEP_SUMMARY,`\n### QuestLog schedule check\n${fresh?'Validated all four source pages.':'Source check failed; using the last validated snapshot.'}\nLast validated: ${data.checkedAt}\n`);
  return {fresh,data};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)await refresh();
