import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';

const origin='https://myaiteam-company.vercel.app';
const requested=(process.env.MAPRANEX_SOURCE_URL||'auto').trim();
const historyFile='content-history.json';
const hash=(s)=>crypto.createHash('sha256').update(s).digest('hex').slice(0,20);
const text=(s)=>String(s||'').replace(/\s+/g,' ').trim();
const escaped=(s)=>text(s).slice(0,165);
const excluded=/(\/privacy|\/terms|\/legal|\/contact|\/about|\/cookie|\/login|\/signup|\/404|\/sitemap|\/feed|\/imprint|\/accessibility|\/thank-you)/i;
const relevant=(s)=>/(ai|automation|quality|test|devops|cloud|software|web|digital|engineer|data|api|cv|security|platform|insight|case.stud|service|product)/i.test(s);
function xmlLinks(xml){return [...xml.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/gi)].map(x=>x[1].replace(/&amp;/g,'&'))}
async function loadHistory(){try{let a=JSON.parse(await fs.readFile(historyFile,'utf8'));return Array.isArray(a)?a:[]}catch{return []}}
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try {
 await fs.mkdir('public',{recursive:true});
 const page=await browser.newPage({viewport:{width:1100,height:960},deviceScaleFactor:1});
 let urls=[];
 if(requested!=='auto'){
  let u=new URL(requested);
  if(u.protocol!=='https:'||u.hostname!==new URL(origin).hostname)throw Error('Invalid website hostname');
  urls=[u.href];
 }else{
  const res=await page.request.get(origin+'/sitemap.xml',{timeout:18000});
  if(!res.ok())throw Error('Cannot load website sitemap: '+res.status());
  let discovered=xmlLinks(await res.text());
  // Nested sitemap indexes are supported but capped to protect runner usage.
  for(const entry of discovered.filter(x=>/\.xml(\?|$)/i.test(x)).slice(0,5)){
   try{let sr=await page.request.get(entry,{timeout:10000});if(sr.ok())discovered.push(...xmlLinks(await sr.text()))}catch{}
  }
  urls=[...new Set(discovered.filter(x=>x.startsWith(origin+'/')&&!/\.xml(\?|$)/i.test(x)))];
 }
 const candidates=[];
 for(const url of urls.slice(0,80)){
  const u=new URL(url);
  if(u.hostname!==new URL(origin).hostname||excluded.test(u.pathname))continue;
  try{
   const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:16000});
   if(!response?.ok())continue;
   await page.evaluate(async()=>{await document.fonts.ready});
   const info=await page.evaluate(()=>{
    const h=[...document.querySelectorAll('h1,h2,h3')].map(x=>x.textContent?.trim()).filter(x=>x&&x.length>=12&&x.length<145);
    const description=document.querySelector('meta[name="description"]')?.getAttribute('content')||'';
    return {title:document.title,headings:[...new Set(h)].slice(0,12),description};
   });
   const combined=[info.title,info.description,...info.headings].join(' ');
   if(info.headings.length<2||!relevant(combined)||combined.length<135)continue;
   candidates.push({url,path:u.pathname,...info,wordCount:combined.split(/\s+/).length});
  }catch(e){console.log('Skipping',url,e.message)}
 }
 if(!candidates.length)throw Error('No content-rich relevant pages found. Render refused.');
 const history=await loadHistory();
 const used=new Map();
 for(const h of history){used.set(h.path,(used.get(h.path)||0)+1)}
 candidates.sort((a,b)=>(used.get(a.path)||0)-(used.get(b.path)||0)||b.wordCount-a.wordCount);
 const pick=candidates[0], count=history.length;
 const styles=['product-showcase','technical-explainer','engineering-insight'];
 const style=styles[count%styles.length];
 const headlines=[pick.headings[0],...pick.headings.slice(1,4)];
 const storyKey=hash(JSON.stringify({path:pick.path,headlines,style}));
 if(history.some(h=>h.storyKey===storyKey)){
  // Switch angle where possible rather than repeat identical story.
  const alternate=candidates.find(p=>!history.some(h=>h.storyKey===hash(JSON.stringify({path:p.path,headlines:[p.headings[0],...p.headings.slice(1,4)],style}))));
  if(!alternate)throw Error('No fresh combination available. Refusing duplicate Reel.');
  Object.assign(pick,alternate);
 }
 const finalHeadlines=[pick.headings[0],...pick.headings.slice(1,4)].map(escaped);
 const data={source_url:pick.url,path:pick.path,title:escaped(pick.title),description:escaped(pick.description),
  headlines:finalHeadlines,style,storyKey:hash(JSON.stringify({path:pick.path,headlines:finalHeadlines,style})),created_at:new Date().toISOString(),
  label:style.replace(/-/g,' ').toUpperCase()};
 await page.goto(pick.url,{waitUntil:'domcontentloaded',timeout:30000});
 await page.evaluate(async()=>{await document.fonts.ready});
 await page.screenshot({path:'public/site.png',fullPage:false,animations:'disabled'});
 await fs.writeFile('public/story.json',JSON.stringify(data,null,2));
 await fs.writeFile('public/site.json',JSON.stringify({url:pick.url,title:pick.title},null,2));
 // Update history only after the render succeeds, in the separate workflow step.
 console.log('Selected',JSON.stringify(data));
}finally{await browser.close()}
