/* 실행: node verify-focus.cjs — 브라우저별 임시 저장소만 사용한다. */
const assert=require('node:assert/strict');
const path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.VILLAGE_URL||(process.env.BASE_URL || 'http://127.0.0.1:4173/').replace(/\/$/, '');
const screenshots=path.join(__dirname,'tmp/verification');
const errors=[],failures=[];
let passed=0;
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
function ok(value,label){assert.ok(value,label);console.log('✓ '+label);passed++;}
const stored=page=>page.evaluate(()=>JSON.parse(localStorage.getItem(GachisupStore.KEY)));
const ready=async page=>{await page.locator('#load-state').waitFor({state:'hidden'});await page.locator('.avatar-walker[data-walk-state=ready]').waitFor({state:'attached'});};
const inside=(rect,width,height)=>rect&&rect.x>=-.5&&rect.y>=-.5&&rect.x+rect.width<=width+.5&&rect.y+rect.height<=height+.5;
async function layout(page,width,height,label){
  ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),label+' 가로 넘침 없음');
  const hud=await page.locator('#session-hud').boundingBox(),footer=await page.locator('#focus-footer').boundingBox();
  ok(inside(hud,width,height)&&inside(footer,width,height),label+' 타이머와 집중 제어 영역 화면 안에 배치');
  for(const action of ['sound','finish']){
    const button=page.locator('#focus-footer [data-action='+action+']'),rect=await button.boundingBox();
    ok(inside(rect,width,height)&&rect.height>=44&&rect.width>=44,label+' '+action+' 버튼 터치 영역 44px 이상');
  }
  const activity=await page.locator('#village-app').getAttribute('data-activity');
  const actorSelector=activity==='study'?'#study-actor':activity==='rest'?'#rest-boat':'.avatar-reader,.resident-cat';
  const actors=await page.locator(actorSelector).evaluateAll(elements=>elements.map(e=>{const b=e.getBoundingClientRect();return {x:b.x,y:b.y,width:b.width,height:b.height};}));
  ok(actors.length===(activity==='read'?4:1)&&actors.every(rect=>inside(rect,width,height)&&rect.y>=hud.y+hud.height-2&&rect.y+rect.height<=footer.y+2),label+' 나와 친구들이 타이머·버튼 사이 무대 안에 배치');
  const visual=await page.evaluate(()=>{
    const layer=document.querySelector('#map-layer'),veil=document.querySelector('.focus-softener'),rect=veil.getBoundingClientRect();
    const style=getComputedStyle(veil),before=getComputedStyle(document.querySelector('#village-app'),'::before');
    const id=document.querySelector('#village-app').dataset.activity;
    const actors=[...document.querySelectorAll(id==='study'?'#study-actor':id==='rest'?'#rest-boat':'.resident-cat,#avatar-position')];
    return {rect:{x:rect.x,y:rect.y,width:rect.width,height:rect.height},before:before.content,veilZ:Number(style.zIndex),actorZ:actors.map(e=>Number(getComputedStyle(e).zIndex)),attached:veil.parentElement===layer,filter:actors.map(e=>getComputedStyle(e).filter)};
  });
  ok(visual.attached&&Math.abs(visual.rect.x)<1&&Math.abs(visual.rect.y)<1&&Math.abs(visual.rect.width-width)<1&&Math.abs(visual.rect.height-height)<1,label+' 배경 페이드가 카메라 배율과 무관하게 화면 전체에 고정');
  ok(visual.actorZ.every(z=>z>visual.veilZ)&&['none','normal'].includes(visual.before)&&visual.filter.every(f=>f==='none'),label+' 캐릭터 위를 덮는 페이드·필터 없음');
}
(async()=>{
  const browser=await chromium.launch();
  try{
    for(const [width,height,tag,minutes,heading] of [[320,640,'독서',25,'책에'],[390,844,'공부',50,'배움에'],[768,844,'작업',90,'할 일에'],[1440,1000,'독서',25,'책에']]){
      const context=await browser.newContext({viewport:{width,height}}),page=await context.newPage();
      const label=width+'×'+height,prefix='focus-'+width+'x'+height;
      let shot=0;
      const snap=async name=>page.screenshot({path:path.join(screenshots,prefix+'-'+String(++shot).padStart(2,'0')+'-'+name+'.png')});
      const action=async(name,fn)=>{await snap(name+'-before');await fn();await sleep(480);await snap(name+'-after');};
      page.on('pageerror',error=>errors.push(label+': '+error.message));
      await page.addInitScript(()=>{const key='focus.qa.clock';if(!sessionStorage.getItem(key))sessionStorage.setItem(key,String(Date.parse('2026-09-08T10:00:00+09:00')));Date.now=()=>Number(sessionStorage.getItem(key));window.advanceFocusClock=seconds=>sessionStorage.setItem(key,String(Date.now()+seconds*1000));});
      try{
        await page.goto(base);await ready(page);await snap('initial');
        ok(await page.evaluate(()=>localStorage.getItem(GachisupStore.KEY)===null),label+' 기존 사용자 기록과 고립된 새 브라우저 저장소');
        const source=await page.locator('#map-image').getAttribute('src');
        await page.evaluate(()=>window.focusOriginalMap=document.querySelector('#map-image'));
        await action('open-camp',()=>page.locator('.dock-building[data-select=camp]').click());
        await action('select-task',async()=>{await page.locator('#focus-task').selectOption(tag);await page.locator('[data-duration="'+minutes+'"]').click();});
        ok(await page.locator('#focus-task').inputValue()===tag&&await page.locator('[data-duration="'+minutes+'"]').getAttribute('aria-pressed')==='true',label+' '+tag+' 태그와 '+minutes+'분 선택 유지');
        await action('start',()=>page.locator('[data-action=start]').click());
        if(await page.locator('[data-action=skip-entry]').isVisible())await page.locator('[data-action=skip-entry]').click();
        await page.waitForFunction(()=>document.querySelector('#village-app').dataset.phase==='settled');
        await page.locator(tag==='독서'?'.avatar-reader[data-rig-state=ready]':'#study-actor[data-rig-state=ready]').waitFor();
        await sleep(550);
        const session=(await stored(page)).activeSession;
        ok(session.tag===tag&&session.duration===minutes*60&&session.islandId==='home',label+' 선택한 태그·시간·섬으로 activeSession 저장');
        ok((await page.locator('#session-hud h2').innerText()).includes(heading)&&await page.locator('#session-timer').innerText()===minutes+':00',label+' 태그 제목과 남은 시간 반영');
        ok(await page.evaluate(()=>window.focusOriginalMap===document.querySelector('#map-image'))&&await page.locator('#map-image').getAttribute('src')===source,label+' 시작 시 기존 배경 DOM·src 유지');
        ok(await page.locator('#map-viewport').evaluate(e=>e.inert)&&await page.locator('#village-app').getAttribute('data-activity')===(tag==='독서'?'read':'study'),label+' 집중 중 지도 inert·활동별 포즈');
        await layout(page,width,height,label);
        if(width===1440){
          for(const [nextWidth,nextHeight] of [[768,844],[320,640],[1440,1000]]){
            await action('resize-'+nextWidth,()=>page.setViewportSize({width:nextWidth,height:nextHeight}));
            await layout(page,nextWidth,nextHeight,'집중 중 '+nextWidth+'×'+nextHeight+'로 크기 변경');
          }
        }
        const camera=await page.locator('#map-layer').getAttribute('style'),avatar=await page.locator('#avatar-position').getAttribute('style');
        await action('map-input',async()=>{await page.mouse.move(width*.25,height*.55);await page.mouse.down();await page.mouse.move(width*.4,height*.6,{steps:4});await page.mouse.up();await page.mouse.wheel(0,-150);await page.keyboard.press('ArrowLeft');});
        ok(camera===await page.locator('#map-layer').getAttribute('style')&&avatar===await page.locator('#avatar-position').getAttribute('style'),label+' 집중 중 드래그·휠·방향키로 지도나 모모 이동하지 않음');
        await action('elapsed',async()=>{await page.evaluate(()=>advanceFocusClock(125));await page.waitForFunction(()=>document.querySelector('#session-elapsed').textContent.includes('2분 5초'));});
        ok(await page.locator('#session-timer').innerText()===String(minutes-3).padStart(2,'0')+':55',label+' 125초 실제 경과를 남은 시간에 반영');
        const progress=await page.locator('#session-progress-fill').evaluate(e=>parseFloat(e.style.width));
        ok(Math.abs(progress-125/(minutes*60)*100)<.001,label+' 진행률을 시작 시각과 현재 시각 차이로 계산');
        await action('reload',async()=>{await page.reload();await ready(page);await page.locator('#session-hud').waitFor({state:'visible'});});
        ok((await stored(page)).activeSession.id===session.id&&(await stored(page)).sessions.length===0&&await page.locator('#session-timer').innerText()===String(minutes-3).padStart(2,'0')+':55',label+' 새로고침 후 같은 세션과 경과 시간 복원·완료 중복 없음');
        ok(await page.locator('#map-image').getAttribute('src')===source&&await page.locator('#map-viewport').evaluate(e=>e.inert),label+' 복원 후 같은 배경과 지도 잠금 유지');
        await action('finish-open',()=>page.locator('[data-action=finish]').click());
        ok(await page.locator('#village-dialog').evaluate(e=>e.open)&&inside(await page.locator('#village-dialog').boundingBox(),width,height),label+' 종료 확인 대화상자가 화면 안에 표시');
        await action('finish-cancel',()=>page.getByRole('button',{name:'조금 더 하기',exact:true}).click());
        ok((await stored(page)).activeSession.id===session.id&&(await stored(page)).sessions.length===0&&await page.locator('#session-hud').isVisible(),label+' 종료 취소 시 기록 없이 계속 집중');
        await action('finish-confirm',async()=>{await page.locator('[data-action=finish]').click();await page.locator('[data-action=confirm-finish]').click();});
        let data=await stored(page);
        ok(data.activeSession===null&&data.sessions.length===1&&data.sessions[0].seconds===125&&data.sessions[0].tag===tag&&data.sessions[0].id===session.id,label+' 확정 종료는 실제 125초를 동일 태그로 한 번 기록');
        ok(!await page.locator('#map-viewport').evaluate(e=>e.inert)&&await page.locator('#avatar-position').getAttribute('data-mode')==='walk'&&!await page.locator('#session-hud').isVisible(),label+' 종료 후 지도·걷기 복구');
        await action('finished-reload',async()=>{await page.reload();await ready(page);});
        data=await stored(page);ok(data.sessions.length===1&&data.activeSession===null&&!await page.locator('#session-hud').isVisible(),label+' 완료 후 새로고침에도 중복 기록·세션 재개 없음');
        await action('auto-start',async()=>{await page.locator('.dock-building[data-select=camp]').click();await page.locator('[data-duration="25"]').click();await page.locator('[data-action=start]').click();});
        const automatic=(await stored(page)).activeSession;
        await action('auto-complete',async()=>{await page.evaluate(()=>advanceFocusClock(25*60+400));await page.locator('#session-hud').waitFor({state:'hidden'});});
        data=await stored(page);const row=data.sessions.find(s=>s.id===automatic.id);
        ok(data.activeSession===null&&data.sessions.length===2&&row.seconds===1500&&row.endedAt===automatic.started+1500000,label+' 자동 완료는 늦은 타이머 실행에도 설정 시간 25분을 상한으로 기록');
        await action('auto-reload',async()=>{await page.reload();await ready(page);});
        ok((await stored(page)).sessions.length===2&&(await stored(page)).activeSession===null,label+' 자동 완료 후 복원에서도 중복 종료 없음');
        if(width===320){
          await action('expired-start',async()=>{await page.locator('.dock-building[data-select=camp]').click();await page.locator('[data-action=start]').click();});
          const expired=(await stored(page)).activeSession;
          await action('expired-reload',async()=>{await page.evaluate(()=>{advanceFocusClock(4000);location.reload();});await page.waitForLoadState();await ready(page);await page.waitForFunction(()=>JSON.parse(localStorage.getItem(GachisupStore.KEY)).activeSession===null);});
          data=await stored(page);const expiredRow=data.sessions.find(s=>s.id===expired.id);
          ok(data.sessions.length===3&&expiredRow.seconds===expired.duration&&!await page.locator('#session-hud').isVisible()&&!await page.locator('#map-viewport').evaluate(e=>e.inert),label+' 만료된 집중을 새로고침으로 복원하면 즉시 상한 시간으로 한 번 종료');
        }
      }catch(error){failures.push(label+': '+error.message);await snap('failure');console.error('✗ '+failures.at(-1));}
      finally{await context.close();}
    }
    ok(errors.length===0,'집중 전체 경로 브라우저 런타임 오류 없음'+(errors.length?' · '+errors.join('; '):''));
    if(failures.length)throw Error(failures.join('\n'));
    console.log('\n'+passed+'개 집중 검증 통과');
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
