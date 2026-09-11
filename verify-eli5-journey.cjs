/* 설명 페이지를 격리 브라우저에서 검사한다. 사용자 데이터는 변경하지 않는다. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require('playwright');
(async()=>{
  const browser=await chromium.launch({headless:true}),errors=[];
  let checks=0;
  fs.mkdirSync('tmp/verification/eli5-journey',{recursive:true});
  try{
    for(const width of [1440,768,390,320]){
      const context=await browser.newContext({viewport:{width,height:width===1440?1000:900},reducedMotion:'reduce'});
      const page=await context.newPage();
      page.on('pageerror',e=>errors.push(e.message));
      page.on('response',r=>{if(r.url().startsWith(((process.env.BASE_URL || 'http://127.0.0.1:4173/').replace(/\/$/, '') + '/'))&&r.status()>=400)errors.push(r.status()+' '+r.url());});
      const noOverflow=async()=>{assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);checks++;};
      const waitStep=n=>page.waitForFunction(n=>document.querySelector('#position').textContent.startsWith(n+' /'),n);
      const screenshot=async name=>{
        if(![1440,390].includes(width))return;
        await page.waitForTimeout(100);
        await page.screenshot({path:'tmp/verification/eli5-journey/'+width+'-'+name+'.png',fullPage:true});
      };
      await page.goto(((process.env.BASE_URL || 'http://127.0.0.1:4173/').replace(/\/$/, '') + '/eli5-journey.html'),{waitUntil:'networkidle'});
      for(let i=0;i<8;i++){
        await page.locator('[data-step="'+i+'"]').click();await waitStep(i+1);
        assert.equal(await page.locator('[aria-current=step]').count(),1);checks++;
        await noOverflow();
        if([2,5,6].includes(i)){
          assert.equal(await page.locator('#story-art [data-watercraft="raft"]').count(),1);checks++;
          assert.equal(await page.locator('#story-art image').evaluateAll(es=>es.some(e=>(e.getAttribute('href')||'').includes('boat'))),false);checks++;
        }
        if([0,2,5,7].includes(i))await screenshot('story-'+(i+1));
      }
      await page.locator('[data-step="0"]').click();await waitStep(1);
      await page.locator('[data-route=invite]').click();
      await page.waitForFunction(()=>document.querySelector('[data-route=invite]').getAttribute('aria-pressed')==='true');
      await screenshot('invited');
      await page.locator('#next').click();await waitStep(3);
      await page.locator('#previous').click();await waitStep(1);
      await page.locator('[data-route=create]').click();
      await page.waitForFunction(()=>document.querySelector('[data-route=create]').getAttribute('aria-pressed')==='true');
      await page.locator('#next').click();await waitStep(4);checks+=3;
      await page.locator('[data-step="3"]').focus();await page.keyboard.press('Home');await waitStep(1);
      assert.equal(await page.locator('[data-step="0"]').evaluate(e=>e===document.activeElement),true);checks++;
      await page.keyboard.press('ArrowRight');await waitStep(2);checks++;
      await page.locator('[data-view=map]').click();
      for(const id of ['harbor','post','board','activity','cabin','tower','hall','bag']){
        await page.locator('[data-place='+id+']').click();
        await page.waitForFunction(id=>document.querySelector('[data-place='+id+']').getAttribute('aria-pressed')==='true',id);
        assert.equal(await page.locator('#map-functions li').count(),3);checks++;
        await noOverflow();if(id==='board')await screenshot('map');
      }
      await page.reload();assert.equal(await page.locator('[data-place=bag]').getAttribute('aria-pressed'),'true');checks++;
      await page.goBack();
      assert.equal(await page.locator('[data-place=hall]').getAttribute('aria-pressed'),'true');checks++;
      await page.locator('[data-view=rules]').click();
      await page.waitForFunction(()=>!document.querySelector('#view-rules').hidden);
      await noOverflow();
      assert.equal(await page.evaluate(()=>localStorage.length),0);checks++;
      await screenshot('rules');
      const smallTargets=await page.locator('button:visible, .view-nav a').evaluateAll(es=>es.filter(e=>{const r=e.getBoundingClientRect();return r.width<44||r.height<44;}).map(e=>e.textContent));
      assert.deepEqual(smallTargets,[]);checks++;
      await context.close();
    }
    assert.deepEqual(errors,[]);checks++;
    console.log(checks+'개 검증 통과. 8장면·3개 진입 경로·8개 기능 장소·키보드·히스토리 복원·4개 화면 폭·저장소 미변경·리소스 오류 없음.');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
