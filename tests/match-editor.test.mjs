import test from 'node:test';
import assert from 'node:assert/strict';
import {parseDelimited,rowsToRecords,mergeRecords,compareTimes,parseBatch,calculateScore,renderPoster,blankMatch,playerLabel,playerId,matchNumber,setMatchNumber,previousNumber,rememberNumber,restoreState,missingNumbers,mergeNumberHistories,createPlayerEvents} from '../public/tools/match-editor/core.mjs';
import {tablesToRecords,readRosterFile} from '../public/tools/match-editor/importers.mjs';
const rows=[['赛事','球队','姓名'],['杯赛','红队','张三'],['','红队','李四'],['','蓝队','王五']];
const records=mergeRecords([],rowsToRecords(rows));
const [zhang,li,wang]=records.map(playerId);
function readyMatch(){const match={...blankMatch(),tournament:'杯赛',home:'红队',away:'蓝队'};setMatchNumber(match,records,'home',zhang,'1');setMatchNumber(match,records,'home',li,'7');setMatchNumber(match,records,'away',wang,'10');return match;}
test('CSV supports quoted fields, BOM and Excel clipboard',()=>{
  assert.deepEqual(parseDelimited('\uFEFF赛事,球队,姓名\r\n杯赛,"院,队","张""三"'),[['赛事','球队','姓名'],['杯赛','院,队','张"三']]);
  assert.deepEqual(parseDelimited('姓名\n张三'),[['姓名'],['张三']]);
  assert.throws(()=>parseDelimited('姓名\n"张三'),/双引号/);
});
test('name-only registration supports defaults and vertically merged cells',()=>{
  assert.equal(records[1].tournament,'杯赛');assert.equal(records[0].number,'');
  assert.equal(rowsToRecords([['姓名'],['门将']],{tournament:'比赛',team:'队伍'})[0].team,'队伍');
  assert.throws(()=>rowsToRecords([['姓名'],['球员']]),/缺少赛事/);
  assert.throws(()=>rowsToRecords([...rows,['杯赛','红队','张三']]),/重复姓名/);
});
test('Word table processing accepts no-number tables and skips unrelated tables',()=>{
  const result=tablesToRecords([[['赛程','日期'],['比赛','今天']],[['姓名'],['张三']]],{tournament:'杯赛',team:'红队'});
  assert.equal(result.records[0].name,'张三');assert.equal(result.skipped,1);
});
test('reimport merges by player identity and retains current assignments and history',()=>{
  const match=readyMatch(),history=rememberNumber({},zhang,'old','11');
  const merged=mergeRecords(records,rowsToRecords(rows));
  assert.equal(merged.length,3);assert.equal(playerId(merged[0]),zhang);
  assert.equal(matchNumber(match,'home',merged[0]),'1');assert.equal(previousNumber(history,zhang,match.id),'11');
});
test('numbers are per-match, permit zero, and reject duplicate or invalid numbers within a team',()=>{
  const match=readyMatch();
  assert.throws(()=>setMatchNumber(match,records,'home',li,'1'),/已有球员/);
  assert.equal(matchNumber(match,'home',li),'7');
  assert.equal(setMatchNumber(match,records,'home',li,'000'),'0');
  assert.equal(setMatchNumber(match,records,'away',wang,'1'),'1');
  assert.throws(()=>setMatchNumber(match,records,'home',zhang,'-1'),/整数/);
  assert.throws(()=>setMatchNumber(match,records,'home',zhang,'1.2'),/整数/);
});
test('last-used hint excludes the current match and new matches always start with blank numbers',()=>{
  const first=readyMatch(),second=readyMatch();let history=rememberNumber({},zhang,first.id,'7');
  assert.equal(previousNumber(history,zhang,second.id),'7');
  history=rememberNumber(history,zhang,second.id,'9');
  assert.equal(previousNumber(history,zhang,second.id),'7');
  history=rememberNumber(history,zhang,second.id,'11');
  assert.equal(previousNumber(history,zhang,second.id),'7');
  const next=blankMatch();assert.equal(matchNumber(next,'home',zhang),'');assert.equal(previousNumber(history,zhang,next.id),'11');
  history=rememberNumber(history,zhang,second.id,'');assert.equal(previousNumber(history,zhang,next.id),'7');
});
test('numbers and history stay isolated between tournaments and teams',()=>{
  const other=mergeRecords([],[{tournament:'另一杯赛',team:'红队',name:'张三'},{tournament:'杯赛',team:'蓝队',name:'张三'}]);
  const history=rememberNumber({},zhang,'old','7');
  for(const player of other)assert.equal(previousNumber(history,playerId(player),'new'),'');
});
test('changing a number keeps events and starters attached to the same player',()=>{
  const match=readyMatch();match.starters.home=[zhang];match.events=parseBatch('12,红队,1','进球',match,records);
  setMatchNumber(match,records,'home',zhang,'9');setMatchNumber(match,records,'home',li,'1');
  assert.equal(playerLabel(records,match,match.events[0]),'9 张三');assert.deepEqual(match.starters.home,[zhang]);
  const svg=renderPoster(match,records);assert.ok(svg.includes('9 张三'));assert.ok(svg.includes('>9</text>'));
});
test('batch resolves only current numbers, supports names before assigning numbers, and validates all rows',()=>{
  const match=readyMatch();assert.equal(parseBatch('12,红队,7','进球',match,records)[0].playerId,li);
  setMatchNumber(match,records,'home',li,'');assert.throws(()=>parseBatch('12,红队,7','进球',match,records),/不在/);
  assert.equal(parseBatch('12,红队,李四','进球',match,records)[0].playerId,li);
  assert.throws(()=>parseBatch('12,红队,张三\nabc,蓝队,王五','进球',match,records),/第 2 行/);
  assert.throws(()=>parseBatch('12,红队,张三,张三','换人',match,records),/不能相同/);
  assert.deepEqual(createPlayerEvents('换人','40+2','home',[zhang,li],match,records).map(e=>e.type),['换下','换上']);
});
test('exports identify missing numbers only for visible starters and event participants',()=>{
  const match=readyMatch();match.starters.home=[zhang];setMatchNumber(match,records,'home',zhang,'');
  assert.deepEqual(missingNumbers(match,records),['红队 · 张三']);
  match.showLineups=false;assert.deepEqual(missingNumbers(match,records),[]);
  match.events=createPlayerEvents('黄牌','12','home',[zhang],match,records);assert.deepEqual(missingNumbers(match,records),['红队 · 张三']);
});
test('v1 migration preserves old numbers, starters, events and same-name players',()=>{
  const saved={version:1,records:[{tournament:'杯赛',team:'红队',number:'01',name:'张三'},{tournament:'杯赛',team:'红队',number:'7',name:'张三'}],match:{tournament:'杯赛',home:'红队',away:'蓝队',starters:{home:['7'],away:[]},events:[{id:'old-event',time:'12',side:'home',number:'1',type:'进球'}]}};
  const migrated=restoreState(saved),first=migrated.records[0],second=migrated.records[1];
  assert.notEqual(first.id,second.id);assert.deepEqual(migrated.match.starters.home,[second.id]);
  assert.equal(playerLabel(migrated.records,migrated.match,migrated.match.events[0]),'1 张三');
  assert.equal(previousNumber(migrated.numberHistory,second.id,'next-match'),'7');
});
test('v2 state survives serialization, including the prior hint during a current number change',()=>{
  const match=readyMatch();let history=rememberNumber({},zhang,'previous','7');history=rememberNumber(history,zhang,match.id,'1');
  const restored=restoreState(JSON.parse(JSON.stringify({version:2,records,match,numberHistory:history})));
  assert.equal(matchNumber(restored.match,'home',zhang),'1');assert.equal(previousNumber(restored.numberHistory,zhang,restored.match.id),'7');
});
test('JSON roster backups accept missing numbers and restore history without replacing newer entries',async()=>{
  const numberHistory={[zhang]:[{matchId:'old',number:'7',usedAt:'2026-10-27T10:00:00.000Z'}]};
  const data=new TextEncoder().encode(JSON.stringify({version:2,records,numberHistory}));
  const result=await readRosterFile({name:'backup.json',size:data.length,arrayBuffer:async()=>data.buffer},{});
  const merged=mergeNumberHistories({[zhang]:[{matchId:'old',number:'9',usedAt:'2026-10-28T10:00:00.000Z'}]},result.numberHistory,records);
  assert.equal(merged[zhang][0].number,'9');
});
test('stoppage sorting, scoring and poster escaping remain correct',()=>{
  assert.deepEqual(['点','41','40+100','40+2','40'].sort(compareTimes),['40','40+2','40+100','41','点']);
  assert.deepEqual(calculateScore([{type:'进球',side:'home',time:'1'},{type:'乌龙',side:'home',time:'2'},{type:'点球',side:'away',time:'点'}]),{home:1,away:1,shootout:{home:0,away:1}});
  const match=readyMatch();match.title='<script>&';match.starters={home:[li,zhang],away:[wang]};
  const svg=renderPoster(match,records);assert.ok(svg.includes('&lt;script&gt;&amp;'));assert.ok(!svg.includes('<script>'));
  assert.ok(svg.indexOf('>7</text>',svg.indexOf('首发阵容'))<svg.indexOf('>1</text>',svg.indexOf('首发阵容')));
});
