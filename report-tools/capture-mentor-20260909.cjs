/* 멘토 보고용 실제 화면 수집. 독립 브라우저만 사용하며 사용자의 저장소는 변경하지 않는다. */
const fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),out=path.join(root,'tmp/pdfs/mentor-2026-09-09'),base=((process.env.BASE_URL || 'http://127.0.0.1:4173/').replace(/\/$/, '') + '/');
const shots=[],errors=[],checks=[];
async function main(){
  await fs.mkdir(out,{recursive:true});
  const browser=await chromium.launch({headless:true});
  const context=await browser.newContext({viewport:{width:1440,height:900},deviceScaleFactor:2,reducedMotion:'reduce',locale:'ko-KR',timezoneId:'Asia/Seoul'});
  const page=await context.newPage();
  page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)errors.push(r.status()+' '+r.url());});
  const capture=async(name,selector)=>{
    await page.evaluate(()=>document.fonts.ready);
    await page.waitForTimeout(250);
    const file=path.join(out,name+'.jpg'),target=selector?page.locator(selector):page;
    const bounds=selector?await target.boundingBox():page.viewportSize();
    await target.screenshot({path:file,type:'jpeg',quality:91});
    shots.push({name,file,url:page.url(),selector:selector||'viewport',bounds});
    console.log('캡처: '+name);
  };
  const go=async(route,extra='')=>{
    await page.goto(base+'index.html?ia='+route+'&preview=1&role=OWNER'+extra,{waitUntil:'networkidle'});
    await page.waitForFunction(id=>document.body.dataset.iaScreen===id,route);
    await page.locator('#load-state').waitFor({state:'hidden'});
    await page.evaluate(()=>document.fonts.ready);
  };
  const click=selector=>page.locator(selector).last().click();
  try{
    await go('plaza');await page.locator('[data-action=overview]').click();await capture('village');
    await go('vh1');await capture('town','#building-panel');
    await page.goto(base+'mobile.html?screen=plaza',{waitUntil:'networkidle'});
    await page.waitForFunction(()=>document.querySelector('#mobile-preview')?.contentWindow.GachisupVillage);
    await page.locator('#preview-loading').waitFor({state:'hidden'});await capture('mobile-village','#phone');

    await page.setViewportSize({width:390,height:844});
    for(const activity of ['read','study','rest']){
      await go('fo2','&activity='+activity);
      const actor=activity==='read'?'.avatar-reader':activity==='study'?'#study-actor':'#rest-boat .boat-rig';
      await page.locator(actor+'[data-rig-state=ready]').waitFor({state:'attached'});
      await capture('activity-'+activity);
      checks.push(activity+' 활성 리그 준비 상태 확인');
    }

    await page.clock.setFixedTime(new Date('2026-09-09T20:00:00+09:00'));
    await go('cp1');await capture('project','#building-panel');
    const before=await page.evaluate(()=>({seconds:GachisupVillage.model.placeProject().seconds,sessions:GachisupVillage.model.get().sessions.length,wallet:GachisupIAApp.design.get().wallet}));
    await click('[data-coop=preview]');await page.locator('#village-toast').waitFor({state:'hidden'});
    const after=await page.evaluate(()=>({seconds:GachisupVillage.model.placeProject().seconds,sessions:GachisupVillage.model.get().sessions.length,wallet:GachisupIAApp.design.get().wallet}));
    assert.deepEqual(before,after);checks.push('완성 미리보기: 실제 기여·기록·지갑 변경 없음');
    await click('[data-coop=create]');
    await page.locator('[name=title]').fill('부두에서 함께 보내는 저녁');
    await page.locator('#building-panel .panel-content').evaluate(e=>e.scrollTop=220);
    await capture('meeting-create','#building-panel');
    await click('[form=coop-meeting-form]');await page.locator('#village-toast').waitFor({state:'hidden'});
    await click('[data-coop=join]');await page.locator('#coop-record-tag').selectOption('공부');
    await click('[data-coop=start-meeting]');
    await page.locator('.cooperative-rig[data-rig-state=ready]').waitFor({state:'attached'});
    await capture('gather-portrait');
    // 캡처용 격리 시계만 25분 이동한다. 사용자 실제 기록과 무관하다.
    await page.clock.setFixedTime(new Date('2026-09-09T20:25:00+09:00'));
    await page.waitForFunction(()=>!GachisupVillage.state.session);
    const session=await page.evaluate(()=>GachisupVillage.model.get().sessions.at(-1));
    assert.equal(session.seconds,1500);assert.equal(session.meetingSeconds,1500);assert.equal(session.tag,'공부');
    checks.push('모임 25분: 공부 기록·시간창 인정·결과 화면 연결 확인');
    await click('#building-panel [data-coop=open]');
    await page.locator('.coop-memory').scrollIntoViewIfNeeded();await capture('memory','.coop-memory');
    await capture('return-place','#building-panel');

    await page.setViewportSize({width:1440,height:1000});
    await page.goto(base+'mobile.html?screen=cp1&orientation=landscape',{waitUntil:'networkidle'});
    await page.locator('#preview-loading').waitFor({state:'hidden'});
    const frame=page.frameLocator('#mobile-preview');
    await frame.locator('[data-coop=preview]').click();await frame.locator('[data-coop=create]').click();
    await frame.locator('[data-coop=now]').click();await frame.locator('[form=coop-meeting-form]').click();
    await frame.locator('[data-coop=join]').click();await frame.locator('[data-coop=start-meeting]').click();
    await frame.locator('.cooperative-rig[data-rig-state=ready]').waitFor({state:'attached'});
    await page.locator('#landscape').click();await page.waitForTimeout(500);await capture('gather-landscape','#phone');
    checks.push('공동 낚시: 모바일 가로 베젤 안의 실제 리그 렌더 확인');

    await page.setViewportSize({width:1440,height:1000});
    await go('bd1');await capture('notice','#building-panel');
    await click('[data-feature=compose][data-value=notice]');
    await page.locator('#compose-title').fill('이번 주에는 새 부두에서 만나요');
    await page.locator('#compose-content').fill('멘토 보고용 시연 공지입니다.\n\n오늘 20:00~21:00, 부두에서 각자 25분씩 집중해요.\n현실에서는 공부하고, 섬에서는 한 배에서 낚시해요.\n\n늦게 와도 괜찮아요. 마친 시간은 우리의 기록에 남아요.');
    await page.locator('[name=pinned]').check();
    await page.locator('#building-panel .panel-content').evaluate(e=>e.scrollTop=90);
    await capture('notice-compose','#building-panel');
    await go('vh2');await capture('stats-group','#building-panel');
    await click('[data-feature=tab-stats][data-value=me]');await capture('stats-personal','#building-panel');

    await page.setViewportSize({width:1440,height:1340});
    await page.goto(base+'rig.html?character=golden',{waitUntil:'networkidle'});
    await page.locator('#character-mount[data-rig-state=ready]').waitFor({state:'attached'});await capture('reading-studio');
    await page.goto(base+'walk.html?character=red-panda',{waitUntil:'networkidle'});
    await page.locator('#walk-mount[data-walk-state=ready]').waitFor({state:'attached'});
    await page.locator('button[data-direction=sw]').click();await page.locator('#walk-cycle').fill('0.25');await page.evaluate(()=>scrollTo(0,0));await capture('walking-studio');
    checks.push('골든 독서·레서판다 산책: 실제 작업실 리그 준비 상태 확인');
    assert.equal(errors.length,0,errors.join('\n'));
    await fs.writeFile(path.join(out,'captures.json'),JSON.stringify({date:'2026-09-09',captureScope:'격리 브라우저 · 기록과 시간은 보고용 시연',errors,checks,shots},null,2));
    console.log(JSON.stringify({captures:shots.length,errors,checks},null,2));
  }finally{await browser.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
