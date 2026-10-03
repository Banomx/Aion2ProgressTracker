const TIMER_EVENTS=[['shugo','Shugo','✦'],['rift','Rift','ϟ'],['kaira','Watcher Kaira','☠'],['daily','Daily','◷']];
const rewardsById=new Map(DATA.rewardSources.map(reward=>[reward.id,reward]));
function routeRewards(ids){
  return '<dl class="route-rewards">'+ids.map(id=>{
    const reward=rewardsById.get(id);
    return '<div><dt>'+escapeHTML(reward.activity)+'</dt><dd>'+escapeHTML(reward.rewards)+'</dd><dd class="reward-where">Where: '+escapeHTML(reward.where)+'</dd></div>';
  }).join('')+'</dl><button class="smallbtn reward-link" data-reward-target="'+ids[0]+'">Reward details & gear guide</button>';
}
function renderRouteStep(route,index){
  const [title,tag,body,time,id,notes,,rewards,source]=route,done=checked('route',id);
  return `<article id="route-step-${id}" class="step ${done?'done':''}">
    <div class="number">${done?'✓':String(index+1).padStart(2,'0')}</div>
    <div class="panel"><span class="tag">${escapeHTML(tag)}</span><h3>${escapeHTML(title)}</h3>
      <p class="route-source">${escapeHTML(source)}</p><p>${escapeHTML(body)}</p>${routeRewards(rewards)}
      <ul>${notes.map(note=>'<li>'+escapeHTML(note)+'</li>').join('')}</ul>
      <div class="step-foot"><label class="check"><input type="checkbox" data-group="route" data-id="${id}" ${done?'checked':''} ${!ready?'disabled':''}>Milestone complete</label><span class="time">Video context · ${link(time)}</span></div>
    </div></article>`;
}
function renderRoute(){
  let phase='';
  el('content').innerHTML='<div class="note">Follow the dungeon gates and upgrade targets from the player chart, with green quests for early accessories and Splendent Star Dragon Lord as the crafting target throughout: accessories first, then the weapon. Move on once your equipped iLvL meets the next gate. Open <button class="textbtn" data-reward-target="gear">Rewards & gear</button> for contribution tables, locations and source notes. Main-character milestones are shared.</div>'+DATA.route.map((route,index)=>{
    let heading='';
    if(route[6]!==phase){phase=route[6];heading='<h2 class="phase-title">'+escapeHTML(phase)+'</h2>'}
    return heading+renderRouteStep(route,index);
  }).join('');
}
function renderGearStage(stage,index){
  const title=escapeHTML(stage.title);
  return `<details class="gear-stage" ${index===0?'open':''}>
    <summary><span><strong>${title}</strong><span class="gear-gate">${escapeHTML(stage.gate)}</span></span><span class="gear-total">≈ ${stage.chartTotal.toLocaleString('en-US')}<small>original chart total</small></span></summary>
    <div class="gear-table-wrap" role="region" aria-label="${title} item-level breakdown" tabindex="0">
      <table class="gear-table"><caption>${title} · chart reference with reviewed corrections</caption>
        <thead><tr><th scope="col">Activity / upgrade</th><th scope="col">iLvL contribution / gain</th><th scope="col">Reward / target</th></tr></thead>
        <tbody>${stage.rows.map(([activity,gain,note])=>'<tr><th scope="row">'+escapeHTML(activity)+'</th><td>'+(gain===null?'Varies':'+'+gain)+'</td><td>'+escapeHTML(note)+'</td></tr>').join('')}</tbody>
      </table></div></details>`;
}
function renderRewardCard(reward){
  return `<article id="reward-${reward.id}" class="reward-card"><h3>${escapeHTML(reward.activity)}</h3><dl>
    <dt>Where / entry</dt><dd>${escapeHTML(reward.where)}</dd>
    <dt>Rewards</dt><dd class="reward-value">${escapeHTML(reward.rewards)}</dd>
    <dt>How to use it</dt><dd>${escapeHTML(reward.plan)}</dd>
    </dl><p class="reward-source">Source: ${escapeHTML(reward.source)}</p></article>`;
}
function renderRewards(){
  const guide=DATA.gearGuide;
  el('content').innerHTML=`<section class="panel" id="gear-guide"><div class="eyebrow">Global · Season 1 reference</div>
    <h2>Rewards & gear</h2><p>Choose content by the upgrade you need. Green quests supply early accessories. The best-in-slot crafting target for the weapon and every crafted accessory is <strong>Splendent Star Dragon Lord</strong>. Prioritize crafting accessories first (necklace, two earrings and two rings), then the weapon.</p>
    <p class="checklist-sources">Gear chart: ${escapeHTML(guide.title)} · updated ${escapeHTML(guide.updated)}. Reviewed corrections take priority for early accessories and crafting names. Supporting reward notes: reviewed video/text guide, <a href="https://skycoach.gg/blog/aion-2/articles/checklist-guide" target="_blank" rel="noopener">Skycoach</a> and <a href="https://talentbuilds.com/aion2/checklist" target="_blank" rel="noopener">TalentBuilds</a>.</p>
    <div class="note">The totals below preserve the original chart as a reference. Quest and crafting gains vary with the equipment you replace. Complete the same Splendent Star Dragon Lord pieces over time; do not count crafting an owned slot again as another upgrade. Use actual equipped iLvL for entry gates.</div>
    <h3>Gear path · foundation → 2,700</h3><p class="guide-intro">Expand a stage for its rewards and upgrade targets.</p>
    ${guide.stages.map(renderGearStage).join('')}
    <details class="guide-conflicts"><summary>How the chart fits the reviewed route</summary><ul class="reference-list">${guide.notes.map(note=>'<li>'+escapeHTML(note)+'</li>').join('')}</ul></details></section>
    <section class="panel" id="reward-directory"><h2>What drops where?</h2><label class="reward-search-label" for="reward-search">Find content, rewards or a location</label>
    <input id="reward-search" type="search" placeholder="Try Star Dragon Lord, Arcana, armor or Daevanion" autocomplete="off">
    <p id="reward-results" class="field-hint" role="status">${DATA.rewardSources.length} content sources</p>
    <div class="reward-grid">${DATA.rewardSources.map(renderRewardCard).join('')}</div>
    <p id="reward-empty" hidden>No matching content. Try a reward name such as armor, Arcana or energy.</p></section>`;
}
function renderChecklist(){const tasks=DATA[view],n=tasks.filter(t=>checked(view,t[0])).length,groups=view==='daily'?['Daily','Scheduled','Routine','Accumulating']:['Before reset','If subscribed','Throughout week','Late week','Scheduled','Accumulating'];const descriptions={Daily:'Daily priorities; stockpiling entries do not need to be used up each day.',Scheduled:'Join when the event or entry window is available.',Routine:'Ongoing progression; optional later farming can wait.',Accumulating:'Entries regenerate and stockpile. Avoid reaching the cap.','Before reset':'Secure purchases and energy before the weekly reset.','If subscribed':'Only if you have access to the subscription shop.','Throughout week':'Use efficient opportunities as they become available.','Late week':'Improve gear first for stronger performance-based rewards.'};el('content').innerHTML='<div class="panel"><div class="sectionhead"><div><div class="eyebrow">'+escapeHTML(characterName())+'</div><h2>'+(view==='daily'?'Daily':'Weekly')+' checklist · '+n+'/'+tasks.length+'</h2></div><button class="smallbtn" data-reset="'+view+'" '+(!ready?'disabled':'')+'>Reset checklist</button></div><p class="guide-intro">'+(view==='daily'?'Daily → Scheduled → Routine → Accumulating. Early Shugo Festival keys go to the max-level main. Server-wide pools only need one character; the checklist still saves per character.':'Secure reset-limited purchases first. Improve gear before performance runs. Nightmare tickets accumulate rather than reset weekly.')+'</p><p class="checklist-sources">Limits: <a href="https://skycoach.gg/blog/aion-2/articles/checklist-guide" target="_blank" rel="noopener">Skycoach · Sep 30</a>. Reward notes: <a href="https://talentbuilds.com/aion2/checklist" target="_blank" rel="noopener">TalentBuilds</a>. Check current limits in game.</p></div>'+groups.map(group=>{const items=tasks.filter(t=>t[4]===group);if(!items.length)return '';const done=items.filter(t=>checked(view,t[0])).length;return '<section class="panel checklist-group" aria-label="'+group+' tasks"><div class="sectionhead"><h3>'+group+'</h3><span class="task-heading">'+done+' / '+items.length+'</span></div><p class="group-meta">'+descriptions[group]+'</p>'+items.map(t=>'<div class="task '+(checked(view,t[0])?'complete':'')+'"><input id="check-'+t[0]+'" type="checkbox" data-group="'+view+'" data-id="'+t[0]+'" '+(checked(view,t[0])?'checked':'')+' '+(!ready?'disabled':'')+'><div><span class="tag">'+t[4]+'</span><label for="check-'+t[0]+'">'+escapeHTML(t[1])+'</label>'+(t[6]?.limit?'<p class="task-limit">'+escapeHTML(t[6].limit)+'</p>':'')+'<p>'+escapeHTML(t[2])+'</p>'+(t[5]?'<p class="task-reminder">'+escapeHTML(t[5])+'</p>':'')+(t[6]?.rewards?'<details class="reward-details"><summary>Reward notes</summary><p>'+escapeHTML(t[6].rewards)+'</p></details>':'')+'</div><div class="task-links">'+link(t[3])+(t[6]?.source?'<a class="time" href="'+t[6].source+'" target="_blank" rel="noopener">Guide ↗</a>':'')+(t[6]?.rewardTarget?'<button class="textbtn time" data-reward-target="'+t[6].rewardTarget+'">Rewards &amp; source</button>':'')+'</div>'+'</div>').join('')+'</section>'}).join('')}
function renderLaunch(){el('content').innerHTML='<div class="note">The creator’s launch plan uses a main + three alts. The reviewed guide adds a Day-1 level-35 stop for Glory world-boss farming. Your saved roster can be any size; these day targets are a plan, not a deadline.</div>'+DATA.launch.map(d=>'<article class="panel day"><div class="eyebrow">'+escapeHTML(d.day)+'</div><div><h2>'+escapeHTML(d.title)+'</h2><ul>'+d.items.map(t=>'<li>'+escapeHTML(t)+'</li>').join('')+'</ul>'+link(d.time)+'</div></article>').join('')+'<div class="panel"><h2>Spacetime Rifts and overnight crafting</h2><ul class="reference-list"><li>From level 45, watch for Spacetime Rifts every three hours. Prioritize the Rift quests; enemy-side sealed dungeons and strongholds are lower priority for Kina, AP and Enhancement Stones.</li><li>The ten-minute window is conditional on Global matching TW/KR. If it holds, you may fit quests on several characters in one window.</li><li>Use green quests for early accessories. If you train crafting while sleeping or AFK, prepare Handicrafting for Splendent Star Dragon Lord accessories first, then your class’s weapon profession as materials allow.</li></ul></div>'}
function renderNotes(){el('content').innerHTML='<div class="note">Shop priorities and side-content advice combine the video with the reviewed text guide. Conditional claims are labeled; check Global rewards, transfer rules and reset times in game.</div><h2 class="qa-section">Where your currencies go</h2><div class="qa-grid">'+DATA.shops.map(s=>'<article class="panel"><h3>'+escapeHTML(s[0])+'</h3><div class="shop-priority">'+escapeHTML(s[1])+'</div><p>'+escapeHTML(s[2])+'</p></article>').join('')+'</div><h2 class="qa-section">Side-content priorities</h2><div class="qa-grid">'+DATA.side.map(s=>'<article class="panel"><h3>'+escapeHTML(s[0])+'</h3><p>'+escapeHTML(s[1])+'</p></article>').join('')+'</div><h2 class="qa-section">Useful video Q&A</h2><div class="qa-grid">'+DATA.qa.map(q=>'<article class="panel"><h3>'+escapeHTML(q[0])+'</h3><p>'+escapeHTML(q[1])+'</p>'+link(q[2])+'</article>').join('')+'</div>'}

const STORAGE_KEY='aion2-progress-tracker-v2';
const defaultState=()=>({checks:{},settings:{hour:0,day:3,auto:false},periods:{},timers:{},itemLevels:{},characters:{main:'Main character',altCount:3,alts:['Alt 1','Alt 2','Alt 3']}});
let state=defaultState(),view='route',character='main',ready=false,pendingReset,pendingImport,draftAlts=[],draftLevels={};
const escapeHTML=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const characterName=()=>character==='main'?state.characters.main:state.characters.alts[Number(character.slice(3))-1];
function normalizeState(data){if(!data||typeof data!=='object'||Array.isArray(data)||!data.checks||typeof data.checks!=='object'||Array.isArray(data.checks))throw Error('Invalid checklist data.');const entries=Object.entries(data.checks);if(entries.length>1000||entries.some(([k,v])=>typeof v!=='boolean'||!/^(route:(?:[0-9]|1[01])|(daily|weekly):(main|alt(?:[1-9]|[1-4][0-9]|50)):[a-z-]+)$/.test(k)))throw Error('Invalid checklist entries.');const cfg=data.settings;if(!cfg||!Number.isInteger(cfg.hour)||cfg.hour<0||cfg.hour>23||!Number.isInteger(cfg.day)||cfg.day<0||cfg.day>6||typeof cfg.auto!=='boolean')throw Error('Invalid reset settings.');if(!data.periods||typeof data.periods!=='object'||Array.isArray(data.periods)||Object.entries(data.periods).some(([k,v])=>!['daily','weekly'].includes(k)||typeof v!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(v)))throw Error('Invalid reset dates.');const c=data.characters||defaultState().characters;if(typeof c.main!=='string'||!c.main.trim()||c.main.length>48||!Number.isInteger(c.altCount)||c.altCount<0||c.altCount>50||!Array.isArray(c.alts)||c.alts.length<c.altCount||c.alts.length>50||c.alts.some(n=>typeof n!=='string'||!n.trim()||n.length>48))throw Error('Invalid character names or count.');const levels=data.itemLevels===undefined?{}:data.itemLevels;if(!levels||typeof levels!=='object'||Array.isArray(levels)||Object.entries(levels).some(([id,value])=>!/^(main|alt(?:[1-9]|[1-4][0-9]|50))$/.test(id)||typeof value!=='number'||!Number.isFinite(value)||value<0))throw Error('Invalid item levels.');return{timers:normalizeTimers(data.timers),itemLevels:{...levels},checks:Object.fromEntries(entries),settings:{hour:cfg.hour,day:cfg.day,auto:cfg.auto},periods:{...data.periods},characters:{main:c.main.trim(),altCount:c.altCount,alts:c.alts.map(n=>n.trim())}}}
function syncSettings(){el('reset-hour').value=state.settings.hour;el('reset-day').value=state.settings.day;el('auto-reset').checked=state.settings.auto}

const el=id=>document.getElementById(id);const stamp=s=>Math.floor(s/60)+':'+String(s%60).padStart(2,'0');const link=s=>'<a class="time" target="_blank" rel="noopener" href="https://www.youtube.com/watch?v=9r4nDbBxRxk&t='+s+'s">'+stamp(s)+' ↗</a>';const key=(group,id)=>group==='route'?'route:'+id:group+':'+character+':'+id;const checked=(group,id)=>!!state.checks[key(group,id)];
function periods(now=new Date()){let d=new Date(now.getTime()-state.settings.hour*3600000);let daily=d.toISOString().slice(0,10);d.setUTCDate(d.getUTCDate()-((d.getUTCDay()-state.settings.day+7)%7));return{daily,weekly:d.toISOString().slice(0,10)}}
function applyResets(){if(!state.settings.auto)return false;let p=periods(),changed=false;for(let group of ['daily','weekly']){if(state.periods[group]&&state.periods[group]!==p[group]){Object.keys(state.checks).filter(k=>k.startsWith(group+':')).forEach(k=>delete state.checks[k]);changed=true}state.periods[group]=p[group]}return changed}
function render(){if(character!=='main'&&Number(character.slice(3))>state.characters.altCount)character='main';el('character').innerHTML='<option value="main">'+escapeHTML(state.characters.main)+' · Main</option>'+state.characters.alts.slice(0,state.characters.altCount).map((name,i)=>'<option value="alt'+(i+1)+'">'+escapeHTML(name)+' · Alt '+(i+1)+'</option>').join('');el('character').value=character;el('character-ilvl').value=state.itemLevels[character]??'';el('character-ilvl').disabled=!ready;['manage-characters','export-data','import-data'].forEach(id=>el(id).disabled=!ready);let count=DATA.route.filter(r=>checked('route',r[4])).length;el('route-count').textContent=count+' / '+DATA.route.length;const next=DATA.route.find(r=>!checked('route',r[4]));el('next-step').textContent=next?next[0]:'All route milestones complete';el('route-bar').style.width=count/DATA.route.length*100+'%';el('route-progress').setAttribute('aria-valuenow',count);el('route-progress').setAttribute('aria-valuemax',DATA.route.length);for(const group of ['daily','weekly']){const tasks=DATA[group],done=tasks.filter(t=>checked(group,t[0])).length,next=tasks.find(t=>!checked(group,t[0]));el(group+'-count').textContent=done+' / '+tasks.length;el(group+'-character').textContent=characterName();el(group+'-bar').style.width=(tasks.length?done/tasks.length*100:0)+'%';el(group+'-progress').setAttribute('aria-valuenow',done);el(group+'-progress').setAttribute('aria-valuemax',tasks.length);el(group+'-next').textContent=next?next[1]:'All '+group+' tasks complete';el('open-'+group).disabled=!ready;}el('content').setAttribute('aria-labelledby','tab-'+view);document.querySelectorAll('[data-view]').forEach(b=>{b.setAttribute('aria-selected',b.dataset.view===view);b.tabIndex=b.dataset.view===view?0:-1});el('character').disabled=!ready;el('reset-info').textContent=state.settings.auto?'Automatic resets enabled · '+state.settings.hour+':00 UTC.':'Manual resets only.';
renderTimers();if(view==='route')renderRoute();else if(view==='daily'||view==='weekly')renderChecklist();else if(view==='launch')renderLaunch();else if(view==='rewards')renderRewards();else renderNotes()}

function status(text,error=false){el('status').textContent=text;el('status').className=error?'error':'';el('retry').hidden=!error}
function save(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));status('Saved in this browser');return true}catch{status('Browser storage is unavailable or full. Changes remain on screen; export a backup or retry.',true);return false}}
function change(){render();save()}
function load(){try{const local=localStorage.getItem(STORAGE_KEY);state=local===null?defaultState():normalizeState(JSON.parse(local));ready=true;syncSettings();const reset=applyResets();render();if(local===null||reset)save();else status('Progress loaded from this browser')}catch{status('Could not read saved data. Use a valid backup to restore it; existing browser data has been kept.',true);ready=false;render();el('import-data').disabled=false}}
function drawAltNames(){const input=el('alt-count'),count=Number(input.value);if(!Number.isInteger(count)||count<0||count>50)return;el('alt-names').querySelectorAll('[data-alt-name]').forEach((field,i)=>draftAlts[i]=field.value);el('alt-names').querySelectorAll('[data-alt-level]').forEach(field=>{if(field.value==='')delete draftLevels[field.dataset.altLevel];else if(field.validity.valid)draftLevels[field.dataset.altLevel]=Number(field.value)});while(draftAlts.length<count)draftAlts.push('Alt '+(draftAlts.length+1));el('alt-names').innerHTML=draftAlts.slice(0,count).map((name,i)=>'<div class="alt-fields"><label class="setting">Alt '+(i+1)+' name<input id="alt-name-'+(i+1)+'" data-alt-name value="'+escapeHTML(name)+'" maxlength="48" required></label><label class="setting">iLvL<input id="alt-ilvl-'+(i+1)+'" data-alt-level="alt'+(i+1)+'" value="'+(draftLevels['alt'+(i+1)]??'')+'" type="number" min="0" step="any" inputmode="decimal" placeholder="Not set"></label></div>').join('')}
el('manage-characters').onclick=()=>{el('main-name').value=state.characters.main;el('main-ilvl').value=state.itemLevels.main??'';draftLevels={...state.itemLevels};el('alt-count').value=state.characters.altCount;draftAlts=[...state.characters.alts];el('alt-names').innerHTML='';drawAltNames();el('characters-dialog').showModal()};el('alt-count').addEventListener('input',drawAltNames);el('cancel-characters').onclick=()=>el('characters-dialog').close();el('characters-form').addEventListener('submit',event=>{event.preventDefault();if(!el('characters-form').reportValidity())return;drawAltNames();const main=el('main-name').value.trim(),count=Number(el('alt-count').value);if(!main||draftAlts.slice(0,count).some(n=>!n.trim()))return;state.characters={main,altCount:count,alts:draftAlts.map((n,i)=>n.trim()||'Alt '+(i+1))};if(el('main-ilvl').value==='')delete draftLevels.main;else draftLevels.main=Number(el('main-ilvl').value);state.itemLevels={...draftLevels};el('characters-dialog').close();change()});
function exportBackup(){const data={format:'aion2-progress-tracker',version:2,exportedAt:new Date().toISOString(),state};const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='aion2-progress-'+new Date().toISOString().slice(0,10)+'.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
el('export-data').onclick=exportBackup;el('import-data').onclick=()=>{el('import-file').value='';el('import-file').click()};el('import-file').addEventListener('change',async event=>{const file=event.target.files[0];if(!file)return;try{if(file.size>1024*1024)throw Error('Backup is too large (maximum 1 MB).');const backup=JSON.parse(await file.text());if(backup.format!=='aion2-progress-tracker'||backup.version!==2)throw Error('Select an Aion 2 Progress Tracker version-2 backup.');pendingImport=normalizeState(backup.state);el('import-summary').textContent=pendingImport.characters.main+' and '+pendingImport.characters.altCount+' alt(s), with '+Object.values(pendingImport.checks).filter(Boolean).length+' completed entries.';el('import-dialog').showModal()}catch(error){pendingImport=null;status('Import rejected: '+(error.message||'Invalid backup.'),true)}});el('cancel-import').onclick=()=>{pendingImport=null;el('import-dialog').close()};el('confirm-import').onclick=()=>{if(!pendingImport)return;const previous=state;state=pendingImport;if(!save()){state=previous;return}pendingImport=null;ready=true;character='main';syncSettings();applyResets();save();render();el('import-dialog').close();status('Backup imported into this browser')};
document.querySelector('.tabs').addEventListener('click',e=>{let b=e.target.closest('[data-view]');if(b){view=b.dataset.view;render()}});document.querySelector('.tabs').addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();let bs=[...document.querySelectorAll('[data-view]')],i=bs.indexOf(document.activeElement);i=e.key==='Home'?0:e.key==='End'?bs.length-1:(i+(e.key==='ArrowRight'?1:-1)+bs.length)%bs.length;view=bs[i].dataset.view;render();bs[i].focus()});el('character').addEventListener('change',e=>{character=e.target.value;render()});el('content').addEventListener('change',e=>{if(e.target.dataset.group){state.checks[key(e.target.dataset.group,e.target.dataset.id)]=e.target.checked;change()}});el('content').addEventListener('click',e=>{let b=e.target.closest('[data-reset]');if(b){pendingReset=b.dataset.reset;el('reset-message').textContent='Clear '+pendingReset+' tasks for '+characterName()+'? Route milestones will stay as they are.';el('reset-dialog').showModal()}});el('cancel-reset').onclick=()=>el('reset-dialog').close();el('confirm-reset').onclick=()=>{Object.keys(state.checks).filter(k=>k.startsWith(pendingReset+':'+character+':')).forEach(k=>delete state.checks[k]);el('reset-dialog').close();change()};['reset-hour','reset-day','auto-reset'].forEach(id=>el(id).addEventListener('change',()=>{if(!ready)return;const hour=Number(el('reset-hour').value);if(!Number.isInteger(hour)||hour<0||hour>23){el('reset-hour').value=state.settings.hour;return}state.settings={hour,day:Number(el('reset-day').value),auto:el('auto-reset').checked};state.periods=periods();change()}));el('retry').onclick=()=>ready?save():load();document.addEventListener('visibilitychange',()=>{if(!document.hidden&&ready&&applyResets())change()});setInterval(()=>{if(ready&&applyResets())change()},60000);window.addEventListener('storage',event=>{if(event.key!==STORAGE_KEY)return;try{state=event.newValue?normalizeState(JSON.parse(event.newValue)):defaultState();ready=true;syncSettings();applyResets();render();status('Updated from another tab')}catch{status('Another tab saved unreadable data. Your current view has been kept.',true)}});render();load();

for(const group of ['daily','weekly'])el('open-'+group).onclick=()=>{view=group;render();el('tab-'+group).focus()};

el('character-ilvl').addEventListener('change',event=>{if(!ready)return;const input=event.target;if(!input.reportValidity()){input.value=state.itemLevels[character]??'';return}if(input.value==='')delete state.itemLevels[character];else state.itemLevels[character]=Number(input.value);change()});

// Minute-of-day schedules are stored in UTC; no server phase is guessed.
function normalizeTimers(value){
  if(value===undefined)return {};
  if(!value||typeof value!=='object'||Array.isArray(value))throw Error('Invalid timer schedules.');
  const result={};
  for(const [id,times] of Object.entries(value)){
    if(!TIMER_EVENTS.some(event=>event[0]===id)||!Array.isArray(times)||times.length>48||times.some(time=>!Number.isInteger(time)||time<0||time>=1440))throw Error('Invalid timer schedule.');
    result[id]=[...new Set(times)].sort((a,b)=>a-b);
  }
  return result;
}
function parseTimerTimes(text){
  const parts=text.split(/[,;\n]/).map(part=>part.trim()).filter(Boolean);
  if(parts.length>48)throw Error('Use at most 48 times.');
  const times=parts.map(part=>{
    const match=part.match(/^(\d{1,2})(?:\s*:\s*(\d{1,2}))?$/);
    if(!match||Number(match[1])>23||Number(match[2]||0)>59)throw Error('“'+part+'” is not a valid time. Use hours 0–23 and minutes 0–59, for example 1:00,2:30.');
    return Number(match[1])*60+Number(match[2]||0);
  });
  return [...new Set(times)].sort((a,b)=>a-b);
}
function defaultTimerSchedule(id){return id==='daily'?{times:[DATA.dailyReset.utcMinutes]}:QUESTLOG_SCHEDULE.events[id]}
function germanyDailyResetTime(now=new Date()){const at=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate(),0,DATA.dailyReset.utcMinutes));return at.toLocaleTimeString('en-GB',{timeZone:DATA.dailyReset.germanyTimeZone,hour:'2-digit',minute:'2-digit',timeZoneName:'short',hourCycle:'h23'})}
function timerTime(minutes){return String(Math.floor(minutes/60)).padStart(2,'0')+':'+String(minutes%60).padStart(2,'0')}
function nextTimerTimes(times,now=new Date()){
  if(!times.length)return [];
  const start=Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate());
  const upcoming=[];
  for(let day=0;day<4;day++)for(const minute of times){const at=start+day*86400000+minute*60000;if(at>=now.getTime())upcoming.push(at)}
  return upcoming.slice(0,3);
}
function timerCountdown(at,now){const seconds=Math.max(0,Math.ceil((at-now.getTime())/1000)),h=Math.floor(seconds/3600),m=Math.floor(seconds%3600/60),s=seconds%60;return (h?h+'h ':'')+(m?m+'m ':'')+s+'s'}
function renderTimers(){
  const container=el('spawn-timers');
  if(!container.children.length)container.innerHTML=TIMER_EVENTS.map(([id,name,icon])=>'<details class="spawn-timer timer-'+id+'"><summary><span class="timer-icon" aria-hidden="true">'+icon+'</span> <span class="timer-label">'+name+' <span id="timer-count-'+id+'">Set time</span></span><span class="timer-chevron" aria-hidden="true">⌄</span></summary><div class="timer-popup"><h3>'+name+'</h3><p class="timer-schedule" id="timer-schedule-'+id+'"></p><ul id="timer-next-'+id+'"></ul><button class="smallbtn" data-timer-edit="'+id+'">Edit schedule</button></div></details>').join('');
  el('configure-timers').disabled=!ready;
  document.querySelectorAll('[data-timer-edit]').forEach(button=>button.disabled=!ready);
  if(!el('timer-panels')){const panels=document.createElement('div');panels.id='timer-panels';panels.hidden=true;document.querySelector('header').append(panels);for(const [id] of TIMER_EVENTS){const popup=document.querySelector('.timer-'+id+' .timer-popup');popup.id='timer-panel-'+id;popup.hidden=true;panels.append(popup);const summary=document.querySelector('.timer-'+id+' summary');summary.setAttribute('aria-controls',popup.id)}}
  updateTimers();
}
function updateTimers(now=new Date()){
  el('daily-reset-reference').textContent='Daily reset: '+timerTime(DATA.dailyReset.utcMinutes)+' UTC · '+germanyDailyResetTime(now)+' in Germany. Automatic checklist resets use your configured UTC hour below.';
  for(const [id] of TIMER_EVENTS){
    const custom=Object.hasOwn(state.timers,id),schedule=defaultTimerSchedule(id),times=custom?state.timers[id]:schedule.times,next=nextTimerTimes(times,now),count=el('timer-count-'+id);
    const current=custom?null:activeTimerWindow(schedule,now);
    if(!count)continue;
    count.textContent=current?'ends in '+timerCountdown(current.end,now):(next.length?'in '+timerCountdown(next[0],now):'· Set time');
    el('timer-schedule-'+id).textContent=(custom?'Custom · ':id==='daily'?'In-game daily reset · ':'QuestLog Global · ')+'UTC: '+times.map(timerTime).join(', ');
    el('timer-next-'+id).innerHTML=next.map(at=>'<li>'+escapeHTML(new Date(at).toLocaleString(undefined,{weekday:'short',hour:'2-digit',minute:'2-digit',timeZoneName:'short'}))+'</li>').join('')+(id==='daily'?'<li>Weekly (QuestLog): '+escapeHTML(nextWeeklyReset(now).toLocaleString(undefined,{weekday:'short',hour:'2-digit',minute:'2-digit',timeZoneName:'short'}))+'</li>':'');
    let info=el('timer-info-'+id);if(!info){info=document.createElement('p');info.id='timer-info-'+id;el('timer-next-'+id).after(info)}info.textContent=(id==='rift'?'Portal opens for 10 minutes; event lasts one hour. ':'')+(custom?'Manual override. ':id==='daily'?'Confirmed in game on '+DATA.dailyReset.confirmedAt+'. Germany: 09:00 CEST / 08:00 CET. ':'Checked '+new Date(QUESTLOG_SCHEDULE.checkedAt).toLocaleString()+'. '+(now.getTime()-Date.parse(QUESTLOG_SCHEDULE.checkedAt)>7200000?'Source check is overdue. ':''));
  }
}
function activeTimerWindow(schedule,now){
  if(!schedule.durationMinutes)return null;
  const midnight=Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate());
  for(const day of [-1,0])for(const minute of schedule.times){const start=midnight+day*86400000+minute*60000,end=start+schedule.durationMinutes*60000;if(start<=now.getTime()&&now.getTime()<end)return{start,end}}return null;
}
function nextWeeklyReset(now){const schedule=QUESTLOG_SCHEDULE.events.weekly,midnight=Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate());for(let day=0;day<8;day++){const date=new Date(midnight+day*86400000);if(!schedule.days.includes(date.getUTCDay()))continue;for(const minute of schedule.times){const at=date.getTime()+minute*60000;if(at>now.getTime())return new Date(at)}}}
function timerFieldFeedback(id,normalize=false){
  const input=el('schedule-'+id),hint=el('schedule-hint-'+id);
  try{
    const custom=parseTimerTimes(input.value),times=custom.length?custom:defaultTimerSchedule(id).times;
    if(normalize&&custom.length)input.value=custom.map(timerTime).join(', ');
    input.removeAttribute('aria-invalid');hint.classList.remove('field-error');
    const today=new Date();
    const local=times.slice(0,3).map(minute=>new Date(Date.UTC(today.getUTCFullYear(),today.getUTCMonth(),today.getUTCDate(),0,minute)));
    hint.textContent=(custom.length?'Custom: ':id==='daily'?'In-game daily reset: ':'QuestLog default: ')+times.slice(0,3).map(timerTime).join(', ')+(times.length>3?' + '+(times.length-3)+' more':'')+' UTC · Your time: '+local.map(date=>date.toLocaleTimeString(undefined,{hour:'2-digit',minute:'2-digit'})).join(', ');
    return true;
  }catch(error){input.setAttribute('aria-invalid','true');hint.classList.add('field-error');hint.textContent=error.message;return false}
}
function openTimers(id){
  el('timer-fields').innerHTML=TIMER_EVENTS.map(([key,name])=>'<div class="timer-field"><div class="timer-field-heading"><label for="schedule-'+key+'">'+name+'</label><button class="smallbtn" type="button" data-timer-default="'+key+'">Use default</button></div><input id="schedule-'+key+'" name="'+key+'" autocomplete="off" spellcheck="false" aria-describedby="schedule-hint-'+key+'" placeholder="Default schedule" value="'+(state.timers[key]||[]).map(timerTime).join(', ')+'"><p class="field-hint" id="schedule-hint-'+key+'"></p></div>').join('');
  TIMER_EVENTS.forEach(([key])=>timerFieldFeedback(key));
  el('timer-error').textContent='';el('timers-dialog').showModal();if(id)el('schedule-'+id).focus();
}
el('configure-timers').onclick=()=>openTimers();
document.querySelector('header').addEventListener('click',event=>{const button=event.target.closest('[data-timer-edit]');if(button)openTimers(button.dataset.timerEdit)});
el('timer-fields').addEventListener('input',event=>{const id=event.target.name;if(TIMER_EVENTS.some(([key])=>key===id)){el('timer-error').textContent='';timerFieldFeedback(id)}});
el('timer-fields').addEventListener('focusout',event=>{const id=event.target.name;if(TIMER_EVENTS.some(([key])=>key===id))timerFieldFeedback(id,true)});
el('timer-fields').addEventListener('click',event=>{const button=event.target.closest('[data-timer-default]');if(button){const id=button.dataset.timerDefault;el('schedule-'+id).value='';timerFieldFeedback(id);el('timer-error').textContent=''}});
el('timers-use-defaults').onclick=()=>{for(const [id] of TIMER_EVENTS){el('schedule-'+id).value='';timerFieldFeedback(id)}el('timer-error').textContent=''};
el('cancel-timers').onclick=()=>el('timers-dialog').close();
el('timers-form').addEventListener('submit',event=>{
  event.preventDefault();if(!ready)return;
  const schedules={};let invalid;
  for(const [id,name] of TIMER_EVENTS){if(!timerFieldFeedback(id,true)){if(!invalid)invalid={id,name};continue}const times=parseTimerTimes(el('schedule-'+id).value);if(times.length)schedules[id]=times;}
  if(invalid){el('timer-error').textContent='Check the '+invalid.name+' time highlighted above.';el('schedule-'+invalid.id).focus();return;}
  state.timers=schedules;el('timers-dialog').close();change();
});
// Expanded timers share a grid below the bar, so several can stay open together.
function syncTimerPanels(){let open=false;for(const [id] of TIMER_EVENTS){const shown=document.querySelector('.timer-'+id).open;el('timer-panel-'+id).hidden=!shown;open=open||shown}el('timer-panels').hidden=!open}
document.addEventListener('toggle',event=>{if(event.target.matches?.('.spawn-timer'))syncTimerPanels()},true);
function closeTimerPanels(){document.querySelectorAll('.spawn-timer[open]').forEach(timer=>timer.open=false);syncTimerPanels()}
document.addEventListener('click',event=>{if(!event.target.closest('.spawn-timer, #timer-panels'))closeTimerPanels()});
document.addEventListener('keydown',event=>{if(event.key==='Escape')closeTimerPanels()});
setInterval(()=>{if(ready)updateTimers()},1000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&ready)updateTimers()});

// Header wraps on smaller screens; measure it so sticky cards stay below it.
if(typeof ResizeObserver!=='undefined'){const header=document.querySelector('header');new ResizeObserver(()=>document.documentElement.style.setProperty('--header-height',header.getBoundingClientRect().height+'px')).observe(header)}

// Reference navigation does not write to the user's saved tracker state.
el('content').addEventListener('click',event=>{
  const button=event.target.closest('[data-reward-target]');if(!button)return;
  view='rewards';render();
  const target=button.dataset.rewardTarget;
  const section=el(target==='gear'?'gear-guide':'reward-'+target);
  section?.scrollIntoView?.({block:'start',behavior:'smooth'});
  el('tab-rewards').focus({preventScroll:true});
});
el('content').addEventListener('input',event=>{
  if(event.target.id!=='reward-search')return;
  const query=event.target.value.trim().toLowerCase();let count=0;
  document.querySelectorAll('.reward-card').forEach(card=>{card.hidden=!card.textContent.toLowerCase().includes(query);if(!card.hidden)count++});
  el('reward-results').textContent=count+' of '+DATA.rewardSources.length+' content sources';
  el('reward-empty').hidden=count>0;
});
