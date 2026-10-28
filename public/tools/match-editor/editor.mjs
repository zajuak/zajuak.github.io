import {TYPES,ICONS,key,escapeXML as esc,blankMatch,parseDelimited,rowsToRecords,mergeRecords,rosterFor,parseBatch,sortedEvents,calculateScore,playerLabel,renderPoster,playerId,matchNumber,previousNumber,rememberNumber,setMatchNumber,missingNumbers,restoreState,createPlayerEvents,mergeNumberHistories} from './core.mjs';
import {readRosterFile} from './importers.mjs';
const $=id=>document.getElementById(id), storageKey='junkai-match-editor-v1';
let records=[],match=blankMatch(),numberHistory={},lineupSide='home',editingId=null,pendingRecords=null,pendingHistory=null,pendingEvents=null,svg='',icons={},draggedId=null,toastTimer;
try {
  const saved=JSON.parse(localStorage.getItem(storageKey)||'null');
  ({records,match,numberHistory}=restoreState(saved));
} catch { $('save-status').textContent='暂时无法读取本地草稿，可继续编辑。'; }
function save() {
  try{localStorage.setItem(storageKey,JSON.stringify({version:2,records,match,numberHistory}));$('save-status').textContent='名单、比赛草稿与历史号码已保存到当前浏览器';}
  catch{$('save-status').textContent='浏览器存储不可用，请及时导出图片和备份名单。';}
}
function toast(message){clearTimeout(toastTimer);$('toast').textContent=message;$('toast').hidden=false;toastTimer=setTimeout(()=>$('toast').hidden=true,4000);}
const names=()=>[...new Set(records.map(r=>r.tournament))];
const teams=()=>[...new Set(records.filter(r=>r.tournament===match.tournament).map(r=>r.team))];
const option=(value,label,disabled=false)=>`<option value="${esc(value)}"${disabled?' disabled':''}>${esc(label)}</option>`;
function fill(select,items,value,placeholder){select.innerHTML=(placeholder?option('',placeholder):'')+items.map(([v,l,d])=>option(v,l,d)).join('');select.value=value;}
function hasWork(){return match.events.length || match.starters.home.length || match.starters.away.length || Object.values(match.numbers).some(numbers=>Object.values(numbers).some(Boolean));}
function discardMatch(question){return !hasWork() || confirm(question+' 当前比赛的事件、首发与本场号码将清空，报名名单与历史号码会保留。');}
function syncControls(){
  fill($('tournament'),names().map(n=>[n,n]),match.tournament,names().length?'选择赛事':'请先导入赛事名单');
  for(const side of ['home','away'])fill($(`${side}-team`),teams().map(n=>[n,n,n===match[side==='home'?'away':'home']]),match[side],side==='home'?'选择主队':'选择客队');
  $('match-title').value=match.title;$('show-lineups').checked=match.showLineups;
  const current=records.filter(r=>r.tournament===match.tournament);
  $('roster-summary').textContent=current.length?`${teams().length} 支球队 · ${current.length} 名球员 · 可再次导入补充名单`:'支持 Word、Excel、CSV，也可直接粘贴表格。';
  renderLineup();renderEvents();render();
}
function renderLineup(){
  for(const side of ['home','away']){
    $(`${side}-count`).textContent=`${match.starters[side].length} 人`;
    $(`${side}-lineup-tab`).firstChild.textContent=(match[side]|| (side==='home'?'主队':'客队'))+' ';
    $(`${side}-lineup-tab`).classList.toggle('active',lineupSide===side);$(`${side}-lineup-tab`).setAttribute('aria-selected',String(lineupSide===side));
  }
  $('lineup-panel').setAttribute('aria-labelledby',`${lineupSide}-lineup-tab`);
  const roster=rosterFor(records,match,lineupSide),query=$('lineup-search').value.trim().toLowerCase();
  const visible=roster.filter(p=>`${matchNumber(match,lineupSide,p)} ${p.name}`.toLowerCase().includes(query));
  $('lineup-count').textContent=`名单 ${roster.length} 人 / 首发 ${match.starters[lineupSide].length} 人`;
  $('lineup-list').innerHTML=visible.length?visible.map(p=>{
    const id=playerId(p),last=previousNumber(numberHistory,id,match.id),number=matchNumber(match,lineupSide,p);
    return `<div class="player-row"><label class="player-check"><input type="checkbox" value="${esc(id)}" aria-label="${esc(p.name)} 首发"${match.starters[lineupSide].includes(id)?' checked':''}><span>${esc(p.name)}</span></label><div class="number-editor"><input class="match-number" data-player-id="${esc(id)}" aria-label="${esc(p.name)} 本场号码" inputmode="numeric" maxlength="3" placeholder="本场号码" value="${esc(number)}"><div class="last-number"><span>${last?`上次：${esc(last)} 号`:'暂无历史号码'}</span>${last?`<button class="link-button" data-use-last="${esc(id)}" data-number="${esc(last)}" aria-label="${esc(p.name)} 沿用上次 ${esc(last)} 号">沿用</button>`:''}</div></div></div>`;
  }).join(''):`<p class="empty">${roster.length?'未找到匹配的球员':'选择球队后，这里将显示报名名单。'}</p>`;
}
function renderEvents(){
  $('event-count').textContent=`${match.events.length} 个事件`;
  $('events-list').innerHTML=match.events.length?sortedEvents(match.events).map(event=>`<article class="event-item" draggable="true" data-id="${esc(event.id)}"><div class="event-top"><span class="event-time">${esc(event.time)}${event.time==='点'?'':"′"}</span><div class="event-actions"><button data-action="up" aria-label="上移事件">↑</button><button data-action="down" aria-label="下移事件">↓</button><button data-action="edit">编辑</button><button data-action="delete">删除</button></div></div><div class="event-details"><img src="./SMC_files/${ICONS[event.type]}.png" alt=""><span>${esc(event.type)} · ${esc(playerLabel(records,match,event))}</span><small>${esc(match[event.side])}</small></div></article>`).join(''):'<div class="empty">暂无比赛事件<br>从名单选择球员，记录进球、换人和判罚。</div>';
}
function render(){
  const score=calculateScore(match.events);$('score').textContent=`${score.home} : ${score.away}`;
  svg=renderPoster(match,records,icons);$('poster').innerHTML=svg;
}
function changed(){save();render();}
function requireTeams(){if(!match.home || !match.away){toast('请先选择赛事、主队和客队。');return false;}return true;}
function resetForTeams(tournament,home='',away=''){
  const old=match;match={...blankMatch(),id:old.id,tournament,home,away,title:old.title,numbers:{home:old.home===home?old.numbers.home:{},away:old.away===away?old.numbers.away:{}}};syncControls();save();
}
$('tournament').addEventListener('change',event=>{
  if(!discardMatch('切换赛事？')){event.target.value=match.tournament;return;}
  const selected=event.target.value;match=blankMatch();match.tournament=selected;match.title=selected;syncControls();save();
});
for(const side of ['home','away'])$(`${side}-team`).addEventListener('change',event=>{
  if(!discardMatch('更换球队？')){event.target.value=match[side];return;}
  const home=side==='home'?event.target.value:match.home,away=side==='away'?event.target.value:match.away;
  if(home && home===away){toast('主队与客队不能相同。');syncControls();return;}resetForTeams(match.tournament,home,away);
});
$('match-title').addEventListener('input',event=>{match.title=event.target.value;changed();});
$('show-lineups').addEventListener('change',event=>{match.showLineups=event.target.checked;changed();});
for(const side of ['home','away'])$(`${side}-lineup-tab`).addEventListener('click',()=>{lineupSide=side;$('lineup-search').value='';renderLineup();});
$('lineup-search').addEventListener('input',renderLineup);
$('lineup-list').addEventListener('change',event=>{
  if(event.target.matches('.match-number')){updateNumber(event.target.dataset.playerId,event.target.value);return;}
  if(!event.target.matches('input[type=checkbox]'))return;
  const id=event.target.value;match.starters[lineupSide]=event.target.checked?[...match.starters[lineupSide],id]:match.starters[lineupSide].filter(n=>n!==id);renderLineup();changed();
});
function updateNumber(id,value,{renderFields=true,report=true}={}){
  try{const number=setMatchNumber(match,records,lineupSide,id,value);numberHistory=rememberNumber(numberHistory,id,match.id,number);pendingEvents=null;$('confirm-batch').disabled=true;if(renderFields)renderLineup();renderEvents();changed();}
  catch(error){if(report){toast(error.message);renderLineup();}}
}
$('lineup-list').addEventListener('input',event=>{if(event.target.matches('.match-number'))updateNumber(event.target.dataset.playerId,event.target.value,{renderFields:false,report:false});});
$('lineup-list').addEventListener('click',event=>{const button=event.target.closest('[data-use-last]');if(button)updateNumber(button.dataset.useLast,button.dataset.number);});
$('clear-lineup').addEventListener('click',()=>{match.starters[lineupSide]=[];renderLineup();changed();});
$('new-match').addEventListener('click',()=>{if(!confirm('开始新比赛？当前比赛标题、事件、首发与本场号码将清空，赛事报名名单与历史号码会保留。'))return;match={...blankMatch(),tournament:match.tournament};match.title=match.tournament;syncControls();save();});

// Native dialogs provide Escape dismissal, focus trapping and focus restoration.
document.querySelectorAll('[data-close]').forEach(button=>button.addEventListener('click',()=>button.closest('dialog').close()));
document.querySelectorAll('dialog').forEach(dialog=>dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left || event.clientX>rect.right || event.clientY<rect.top || event.clientY>rect.bottom)dialog.close();}));
function openRosters(){renderLibrary();$('roster-dialog').showModal();}
$('manage-rosters').addEventListener('click',openRosters);$('import-shortcut').addEventListener('click',openRosters);
function renderLibrary(){
  $('library-list').innerHTML=names().length?names().map(name=>{const group=records.filter(r=>r.tournament===name);return `<div class="library-item"><div>${esc(name)}<small>${new Set(group.map(r=>r.team)).size} 支球队 · ${group.length} 名球员</small></div><button data-tournament="${esc(name)}">删除赛事</button></div>`;}).join(''):'<p class="empty">还没有名单，导入后可在这里管理。</p>';
}
$('library-list').addEventListener('click',event=>{
  const tournament=event.target.dataset.tournament;if(!tournament)return;
  if(!confirm(`删除“${tournament}”的所有报名名单？${match.tournament===tournament?'当前比赛也会清空。':''}`))return;
  const removed=records.filter(r=>r.tournament===tournament).map(playerId);records=records.filter(r=>r.tournament!==tournament);for(const id of removed)delete numberHistory[id];if(match.tournament===tournament)match=blankMatch();renderLibrary();syncControls();save();invalidateImport();
});
let importRevision=0;
function invalidateImport(){importRevision++;pendingRecords=null;pendingHistory=null;$('confirm-import').disabled=true;$('import-preview').classList.remove('error');$('import-preview').textContent='内容已更新，请重新预览确认。';}
for(const id of ['import-tournament','import-team','roster-text'])$(id).addEventListener('input',()=>{if(id==='roster-text'){$('roster-file').value='';$('sheet-picker').hidden=true;}invalidateImport();});
function showSheets(sheets,selected){$('sheet-picker').hidden=sheets.length<2;fill($('import-sheet'),sheets.map(s=>[s,s]),selected);}
async function previewImport(){
  const revision=++importRevision;pendingRecords=null;$('confirm-import').disabled=true;
  $('import-preview').textContent='正在读取报名表…';$('import-preview').classList.remove('error');
  const defaults={tournament:$('import-tournament').value,team:$('import-team').value};
  try{
    const file=$('roster-file').files[0];
    const result=file?await readRosterFile(file,defaults,$('import-sheet').value):{records:rowsToRecords(parseDelimited($('roster-text').value),defaults),sheets:[]};
    if(revision!==importRevision)return;
    showSheets(result.sheets,result.selected);pendingRecords=result.records;pendingHistory=result.numberHistory;
    $('import-preview').innerHTML=`<strong>识别 ${new Set(pendingRecords.map(r=>r.tournament)).size} 个赛事、${new Set(pendingRecords.map(r=>key(r.tournament,r.team))).size} 支球队、${pendingRecords.length} 名球员</strong><table><thead><tr><th>赛事</th><th>球队</th><th>姓名</th></tr></thead><tbody>${pendingRecords.slice(0,30).map(r=>`<tr>${['tournament','team','name'].map(k=>`<td>${esc(r[k])}</td>`).join('')}</tr>`).join('')}</tbody></table>${pendingRecords.length>30?'<p>仅预览前 30 行；确认后导入全部名单。</p>':''}${result.skipped?`<p>跳过 ${result.skipped} 个不含名单表头或没有球员的表格。</p>`:''}`;
    $('confirm-import').disabled=false;
  }catch(error){if(revision!==importRevision)return;if(error.sheets)showSheets(error.sheets,error.selected);$('import-preview').classList.add('error');$('import-preview').textContent=error.message;}
}
$('preview-import').addEventListener('click',previewImport);
$('roster-file').addEventListener('change',()=>{$('import-sheet').innerHTML='';$('roster-text').value='';invalidateImport();if($('roster-file').files.length)previewImport();});
$('import-sheet').addEventListener('change',previewImport);
$('confirm-import').addEventListener('click',()=>{
  if(!pendingRecords)return;const count=pendingRecords.length;
  try{records=mergeRecords(records,pendingRecords);}catch(error){toast(error.message);return;}
  if(pendingHistory)numberHistory=mergeNumberHistories(numberHistory,pendingHistory,records);
  if(!match.tournament){match.tournament=pendingRecords[0].tournament;match.title=match.tournament;}
  syncControls();save();$('roster-dialog').close();pendingRecords=null;$('confirm-import').disabled=true;toast(`已导入 ${count} 名球员，请选择主客队与首发。`);
});
function download(blob,name){const link=document.createElement('a'),url=URL.createObjectURL(blob);link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
$('export-rosters').addEventListener('click',()=>{if(!records.length){toast('还没有可备份的名单。');return;}download(new Blob([JSON.stringify({version:2,records,numberHistory},null,2)],{type:'application/json'}),'赛事名单与号码记录备份.json');});
$('load-demo').addEventListener('click',()=>{
  if(!discardMatch('载入示例比赛？'))return;
  const tournament='示例杯（演示数据）',demo=[];
  for(const team of ['示例红队','示例蓝队'])for(let i=1;i<=13;i++)demo.push({tournament,team,number:String(i),name:`${team==='示例红队'?'红':'蓝'}队球员${i}`});
  records=mergeRecords(records,demo);match={...blankMatch(),tournament,home:'示例红队',away:'示例蓝队',title:'示例杯 · 小组赛（演示数据）'};
  for(const side of ['home','away']){const roster=rosterFor(records,match,side);match.starters[side]=roster.slice(0,11).map(playerId);for(const p of roster){match.numbers[side][playerId(p)]=p.number;numberHistory=rememberNumber(numberHistory,playerId(p),'demo-previous-match',p.number);numberHistory=rememberNumber(numberHistory,playerId(p),match.id,p.number);}}
  match.events=[...createPlayerEvents('进球','12','home',[playerId(rosterFor(records,match,'home')[6])],match,records),...createPlayerEvents('黄牌','40+2','away',[playerId(rosterFor(records,match,'away')[9])],match,records)];syncControls();save();toast('已载入演示数据，包含上次号码参考。');
});

const typeOptions=[...TYPES,'换人'].map(type=>[type,type==='乌龙'?'乌龙球':type==='两黄'?'两黄转红':type==='换人'?'换人（成对）':type]);
fill($('event-type'),typeOptions,'进球');fill($('batch-type'),typeOptions,'进球');
function fillPlayers(selected='',incoming=''){
  const side=$('event-side').value,roster=rosterFor(records,match,side),items=roster.map(p=>[playerId(p),`${matchNumber(match,side,p)||'待填号码'}  ${p.name}${match.starters[side].includes(playerId(p))?' · 首发':''}`]);
  fill($('event-player'),items,selected,'选择球员');fill($('event-player-in'),items,incoming,'选择换上球员');updateEventFields();
}
function updateEventFields(){const substitution=$('event-type').value==='换人';$('substitution-field').hidden=!substitution;$('event-player-in').required=substitution;$('event-player-label').textContent=substitution?'换下球员':'球员';$('event-hint').textContent=$('event-type').value==='乌龙'?'选择造成乌龙的球员及其所属队伍，分数会自动计入对方球队。':'可以选择报名名单中的所有球员，包括替补。';}
function openEvent(event=null){
  if(!requireTeams())return;editingId=event?.id||null;$('event-dialog-title').textContent=event?'编辑事件':'添加事件';$('event-type').value=event?.type||'进球';$('event-time').value=event?.time||'';
  fill($('event-side'),[['home',match.home],['away',match.away]],event?.side||'home');fillPlayers(event?.playerId||'');$('event-error').textContent='';$('event-dialog').showModal();
}
$('add-event').addEventListener('click',()=>openEvent());$('event-side').addEventListener('change',()=>fillPlayers());$('event-type').addEventListener('change',updateEventFields);
$('event-form').addEventListener('submit',event=>{
  event.preventDefault();$('event-error').textContent='';
  const side=$('event-side').value,type=$('event-type').value,time=$('event-time').value.trim(),number=$('event-player').value,incoming=$('event-player-in').value;
  try{
    const events=createPlayerEvents(type,time,side,[number,...(type==='换人'?[incoming]:[])],match,records);
    if(editingId){const index=match.events.findIndex(e=>e.id===editingId);if(index<0)throw new Error('原事件已不存在。');events[0].id=editingId;match.events.splice(index,1,...events);}else match.events.push(...events);
    renderEvents();changed();$('event-dialog').close();toast('事件已保存。');
  }catch(error){$('event-error').textContent=error.message;}
});
function reorder(id,targetId){
  const from=match.events.findIndex(e=>e.id===id),to=match.events.findIndex(e=>e.id===targetId);if(from<0 || to<0 || from===to)return;
  if(match.events[from].time!==match.events[to].time){toast('只能调整同一时间的事件顺序。');return;}
  const [event]=match.events.splice(from,1);match.events.splice(to,0,event);renderEvents();changed();
}
$('events-list').addEventListener('click',event=>{
  const action=event.target.dataset.action,row=event.target.closest('[data-id]');if(!action || !row)return;
  const current=match.events.find(e=>e.id===row.dataset.id);if(!current)return;
  if(action==='edit'){openEvent(current);return;}
  if(action==='delete'){match.events=match.events.filter(e=>e.id!==current.id);renderEvents();changed();return;}
  const same=match.events.filter(e=>e.time===current.time),index=same.findIndex(e=>e.id===current.id),target=same[index+(action==='up'?-1:1)];if(target)reorder(current.id,target.id);
});
$('events-list').addEventListener('dragstart',event=>{const row=event.target.closest('[data-id]');if(!row)return;draggedId=row.dataset.id;event.dataTransfer.setData('text/plain',draggedId);row.classList.add('dragging');});
$('events-list').addEventListener('dragover',event=>{if(event.target.closest('[data-id]'))event.preventDefault();});
$('events-list').addEventListener('drop',event=>{event.preventDefault();const target=event.target.closest('[data-id]');if(target && draggedId)reorder(draggedId,target.dataset.id);draggedId=null;});
$('events-list').addEventListener('dragend',()=>{draggedId=null;document.querySelectorAll('.dragging').forEach(el=>el.classList.remove('dragging'));});
$('batch-events').addEventListener('click',()=>{if(!requireTeams())return;pendingEvents=null;$('batch-input').value='';$('batch-preview').textContent='预览通过后可一次性添加。';$('batch-preview').classList.remove('error');$('confirm-batch').disabled=true;$('batch-dialog').showModal();});
for(const id of ['batch-type','batch-input'])$(id).addEventListener(id==='batch-type'?'change':'input',()=>{pendingEvents=null;$('confirm-batch').disabled=true;$('batch-preview').textContent='内容已更新，请重新预览。';});
$('preview-batch').addEventListener('click',()=>{
  $('batch-preview').classList.remove('error');
  try{pendingEvents=parseBatch($('batch-input').value,$('batch-type').value,match,records);$('batch-preview').innerHTML=`<strong>${pendingEvents.length} 个有效事件</strong><br>`+pendingEvents.map(e=>`${esc(e.time)} · ${esc(match[e.side])} · ${esc(playerLabel(records,match,e))} · ${esc(e.type)}`).join('<br>');$('confirm-batch').disabled=false;}
  catch(error){pendingEvents=null;$('confirm-batch').disabled=true;$('batch-preview').classList.add('error');$('batch-preview').textContent=error.message;}
});
$('confirm-batch').addEventListener('click',()=>{if(!pendingEvents)return;match.events.push(...pendingEvents);renderEvents();changed();$('batch-dialog').close();pendingEvents=null;toast('批量事件已添加。');});

const fileName=()=>(match.title||'比赛赛果').replace(/[\\/:*?"<>|]/g,'-').slice(0,80);
function canExport(){const missing=missingNumbers(match,records);if(!missing.length)return true;toast(`请先填写首发与事件球员的本场号码：${missing.slice(0,3).join('、')}${missing.length>3?'等':''}。`);return false;}
$('download-svg').addEventListener('click',()=>{if(canExport())download(new Blob([svg],{type:'image/svg+xml;charset=utf-8'}),`${fileName()}.svg`);});
$('download-png').addEventListener('click',async()=>{
  if(!canExport())return;
  const button=$('download-png');button.disabled=true;const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml;charset=utf-8'}));
  try{
    await document.fonts.ready;const image=new Image();image.src=url;await image.decode();
    const scale=Math.min(2,16384/image.naturalHeight),canvas=document.createElement('canvas');canvas.width=Math.round(image.naturalWidth*scale);canvas.height=Math.round(image.naturalHeight*scale);
    const context=canvas.getContext('2d');if(!context)throw new Error('浏览器不支持图片导出。');context.drawImage(image,0,0,canvas.width,canvas.height);
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw new Error('图片过大，请减少事件或使用 SVG 导出。');download(blob,`${fileName()}.png`);toast('PNG 图片已导出。');
  }catch(error){toast(error.message||'图片导出失败，请使用 SVG 导出。');}
  finally{URL.revokeObjectURL(url);button.disabled=false;}
});
syncControls();
// Embed local icons in exported SVGs to keep downloads independent of the site.
await Promise.all(Object.entries(ICONS).map(async([type,file])=>{
  try{const response=await fetch(`./SMC_files/${file}.png`);if(!response.ok)throw new Error('icon');const blob=await response.blob();icons[type]=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(blob);});}catch{}
}));
render();
