import {parseDelimited,rowsToRecords,validateRecords} from './core.mjs';
const WORD='http://schemas.openxmlformats.org/wordprocessingml/2006/main';

export function wordTables(xml) {
  const doc=new DOMParser().parseFromString(xml,'application/xml');
  if(doc.getElementsByTagName('parsererror').length)throw new Error('Word 文档内容损坏，无法读取。');
  return [...doc.getElementsByTagNameNS(WORD,'tbl')].map(table=>[...table.children].filter(n=>n.localName==='tr').map(row=>[...row.children].filter(n=>n.localName==='tc').flatMap(cell=>{
    const value=[...cell.getElementsByTagNameNS(WORD,'p')].map(p=>[...p.getElementsByTagNameNS(WORD,'t')].map(t=>t.textContent).join('')).join(' ').trim();
    const span=Number(cell.getElementsByTagNameNS(WORD,'gridSpan')[0]?.getAttributeNS(WORD,'val')||1);
    return [value,...Array(Math.max(0,Math.min(span,100)-1)).fill('')];
  })));
}
export function tablesToRecords(tables,defaults) {
  let records=[], skipped=0;
  for(const rows of tables) {
    try {records.push(...rowsToRecords(rows,defaults));}
    catch(error){if(error.message.startsWith('未找到表头') || error.message==='表格中没有球员名单。')skipped++;else throw error;}
  }
  if(!records.length)throw new Error('未找到可导入的名单表格。请使用包含“姓名”表头的表格，并填写赛事、球队名称；不需要号码列。');
  validateRecords(records);
  return {records,skipped};
}
export async function readRosterFile(file,defaults,sheetName) {
  if(file.size>5*1024*1024)throw new Error('文件超过 5 MB，请拆分后导入。');
  const ext=file.name.split('.').pop().toLowerCase();
  if(ext==='doc')throw new Error('旧版 .doc 暂不支持，请在 Word 中另存为 .docx。');
  const data=new Uint8Array(await file.arrayBuffer());
  if(ext==='docx') {
    if(!globalThis.fflate)throw new Error('Word 解析组件未能加载，请刷新页面重试。');
    const files=globalThis.fflate.unzipSync(data,{filter:file=>file.name==='word/document.xml' && file.originalSize<10*1024*1024});
    if(!files['word/document.xml'])throw new Error('不是有效的 .docx 文档，或文档内容过大。');
    const result=tablesToRecords(wordTables(new TextDecoder().decode(files['word/document.xml'])),defaults);
    return {...result,sheets:[]};
  }
  if(ext==='json') {
    const parsed=JSON.parse(new TextDecoder().decode(data));
    if(![1,2].includes(parsed.version) || !Array.isArray(parsed.records))throw new Error('请选择本编辑器导出的名单备份。');
    const records=parsed.records.map(r=>({...(typeof r.id==='string'?{id:r.id}:{}),tournament:String(r.tournament??''),team:String(r.team??''),number:String(r.number??''),name:String(r.name??'')}));
    if(!records.length)throw new Error('备份中没有名单。');
    validateRecords(records);return {records,sheets:[],numberHistory:parsed.version===2?parsed.numberHistory:undefined};
  }
  if(['csv','tsv'].includes(ext)) {
    let text=new TextDecoder().decode(data);
    if(text.includes('\uFFFD'))text=new TextDecoder('gb18030').decode(data);
    return {records:rowsToRecords(parseDelimited(text),defaults),sheets:[]};
  }
  if(['xlsx','xls'].includes(ext)) {
    if(!globalThis.XLSX)throw new Error('Excel 解析组件未能加载，请刷新重试或先另存为 CSV。');
    const workbook=globalThis.XLSX.read(data,{type:'array',sheetRows:10002});
    if(!workbook.SheetNames.length)throw new Error('工作簿中没有工作表。');
    const selected=sheetName && workbook.SheetNames.includes(sheetName)?sheetName:workbook.SheetNames[0];
    const rows=globalThis.XLSX.utils.sheet_to_json(workbook.Sheets[selected],{header:1,defval:'',raw:false});
    try{if(rows.length>10001)throw new Error('每张工作表最多读取 10000 名球员，请拆分后导入。');return {records:rowsToRecords(rows,defaults),sheets:workbook.SheetNames,selected};}
    catch(error){error.sheets=workbook.SheetNames;error.selected=selected;throw error;}
  }
  throw new Error('请选择 .docx、.xlsx、.xls、.csv、.tsv 或名单备份 .json。');
}
