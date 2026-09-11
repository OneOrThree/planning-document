const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch(),errors=[];let count=0;
 const out=path.join(__dirname,'tmp/verification','eli5');fs.mkdirSync(out,{recursive:true});
 try{
  for(const width of [1440,390,320]){
   const context=await browser.newContext({viewport:{width,height:width===1440?1000:844},reducedMotion:'reduce'});
   const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
   page.on('response',r=>{if(r.url().startsWith((process.env.BASE_URL || 'http://127.0.0.1:4173/').replace(/\/$/, ''))&&r.status()>=400)errors.push(r.status()+' '+r.url());});
   await page.goto(((process.env.BASE_URL || 'http://127.0.0.1:4173/').replace(/\/$/, '') + '/eli5.html'),{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
   for(let i=0;i<4;i++){
    await page.locator('#step-'+i).click();await page.waitForTimeout(150);
    assert.equal(await page.locator('[role=tab][aria-selected=true]').count(),1);count++;
    assert.equal(await page.locator('#story').getAttribute('aria-labelledby'),'step-'+i);count++;
    assert.equal(await page.locator('#position').textContent(),(i+1)+' / 4');count++;
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);count++;
    assert.ok(await page.locator('#picture').getAttribute('aria-label'));count++;
    await page.screenshot({path:path.join(out,width+'-step-'+(i+1)+'.png'),fullPage:true});
   }
   await page.locator('#step-3').focus();await page.keyboard.press('Home');
   assert.equal(await page.locator('#step-0').evaluate(e=>e===document.activeElement),true);count++;
   await page.keyboard.press('ArrowRight');assert.equal(await page.locator('#step-1').getAttribute('aria-selected'),'true');count++;
   await page.reload();assert.equal(await page.locator('#position').textContent(),'2 / 4');count++;
   assert.equal(await page.locator('[role=tab]').evaluateAll(es=>es.every(e=>{const r=e.getBoundingClientRect();return r.width>=44&&r.height>=44})),true);count++;
   assert.equal(await page.evaluate(()=>localStorage.length),0);count++;
   await context.close();
  }
  assert.deepEqual(errors,[]);count++;
  console.log(count+'개 ELI5 설명 페이지 검증 통과');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
