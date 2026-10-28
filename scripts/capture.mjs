import {chromium} from 'playwright';
import fs from 'node:fs/promises';
const url=process.env.MAPRANEX_SOURCE_URL || 'https://myaiteam-company.vercel.app/services/cloud-devops/';
const allow=new URL(url);
if(allow.protocol!=='https:'||allow.hostname!=='myaiteam-company.vercel.app') throw new Error('Only Mapranex production is allowed');
await fs.mkdir('public',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try {
 const page=await browser.newPage({viewport:{width:1200,height:1500},deviceScaleFactor:1});
 await page.goto(url,{waitUntil:'domcontentloaded',timeout:45000});
 await page.evaluate(async()=>{await document.fonts.ready});
 await page.screenshot({path:'public/site.png',fullPage:false,animations:'disabled'});
 const title=await page.title();
 const heading=(await page.locator('h1').allTextContents()).map(s=>s.trim()).filter(Boolean)[0]||title;
 await fs.writeFile('public/site.json',JSON.stringify({url,title,heading,generated_at:new Date().toISOString()},null,2));
 console.log('Captured:',url,title,heading);
} finally {await browser.close()}
