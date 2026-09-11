/* 실행: node verify-activities.cjs. 새 브라우저 컨텍스트의 격리 데이터만 사용. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.VILLAGE_URL||(process.env.BASE_URL || 'http://127.0.0.1:4173/').replace(/\/$/, '');
const out=path.join(__dirname,'tmp/verification','activities');fs.mkdirSync(out,{recursive:true});
let passed=0;const errors=[];
const check=(condition,label)=>{assert.ok(condition,label);console.log('✓ '+label);passed++;};
const stored=page=>page.evaluate(()=>JSON.parse(localStorage.getItem(GachisupStore.KEY)));
const settled=page=>page.waitForFunction(()=>document.querySelector('#village-app')?.dataset.phase==='settled');
const ready=page=>page.waitForFunction(()=>document.querySelector('#load-state')?.hidden&&document.querySelector('.avatar-walker')?.dataset.walkState==='ready');
(async()=>{
  const browser=await chromium.launch();
  try{
    for(const [width,height] of [[1440,1000],[390,844],[320,640]]){
      const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1});
      const page=await context.newPage();const label=width+'×'+height;
      page.on('pageerror',e=>errors.push(label+' '+e.message));
      page.on('response',r=>{if(r.status()>=400&&r.url().startsWith(base))errors.push(r.status()+' '+r.url());});
      await page.addInitScript(()=>{if(!sessionStorage.getItem('activity.qa.clock'))sessionStorage.setItem('activity.qa.clock',String(Date.parse('2026-09-09T10:00:00+09:00')));Date.now=()=>Number(sessionStorage.getItem('activity.qa.clock'));window.advanceActivityClock=seconds=>sessionStorage.setItem('activity.qa.clock',String(Date.now()+seconds*1000));});
      try{
        await page.goto(base);await ready(page);await page.evaluate(()=>GachisupStore.create(localStorage).configure({samples:false}));await page.reload();await ready(page);await page.evaluate(()=>document.fonts.ready);
        check(await page.locator('#map-image').getAttribute('src')==='assets/village-map-cel-v3.png',label+' 선명도 보강 배경 기본값');
        check(await page.locator('.mini-map img').getAttribute('src')===await page.locator('#map-image').getAttribute('src'),label+' 축소 지도도 같은 원화');
        check(await page.evaluate(()=>!GachisupActivities.assetError),label+' 공부 배경 키 합성 성공');
        const alpha=await page.evaluate(async()=>{const image=new Image();image.src=GachisupActivities.specs.study.asset;await image.decode();const c=document.createElement('canvas');c.width=image.width;c.height=image.height;const x=c.getContext('2d');x.drawImage(image,0,0);const d=x.getImageData(0,0,c.width,c.height).data;let magenta=0;for(let i=0;i<d.length;i+=4)if(d[i+3]>100&&Math.min(d[i],d[i+2])-d[i+1]>90)magenta++;return {corner:d[3],magenta};});
        check(alpha.corner===0&&alpha.magenta===0,label+' 공부 원화에 불투명 체크무늬·마젠타 없음');
        await page.screenshot({path:path.join(out,label+'-village.png')});
        for(const [tag,id,actor] of [['독서','read','.avatar-reader'],['공부','study','#study-actor'],['휴식','rest','#rest-boat']]){
          await page.locator('.dock-building[data-select=camp]').click();await page.locator('#focus-task').selectOption(tag);
          await page.screenshot({path:path.join(out,label+'-'+id+'-prepare.png')});
          await page.locator('[data-action=start]').click();
          if(width===1440&&id==='rest'){
            await page.waitForFunction(()=>document.querySelector('#village-app').dataset.phase==='sailing');
            const from=await page.locator('#rest-boat').getAttribute('data-x');await page.waitForTimeout(600);
            check(from!==await page.locator('#rest-boat').getAttribute('data-x'),'휴식 출항 시 배의 월드 위치 실제 이동');
            await page.screenshot({path:path.join(out,label+'-rest-sailing.png')});
          }else if(await page.locator('[data-action=skip-entry]').isVisible())await page.locator('[data-action=skip-entry]').click();
          await settled(page);await page.waitForTimeout(700);
          const host=id==='rest'?page.locator('#rest-boat .boat-rig'):page.locator(actor);
          await host.locator('canvas').waitFor();await page.waitForFunction(sel=>document.querySelector(sel)?.dataset.rigState==='ready',id==='rest'?'#rest-boat .boat-rig':actor);
          const session=(await stored(page)).activeSession;
          check(session.tag===tag&&session.kind===(id==='rest'?'rest':'focus'),label+' '+tag+' 활동 종류 저장');
          check(await page.locator('#village-app').getAttribute('data-activity')===id,label+' '+tag+' 장소 분리');
          const layout=await page.evaluate(sel=>{const a=document.querySelector(sel).getBoundingClientRect(),h=document.querySelector('#session-hud').getBoundingClientRect(),f=document.querySelector('#focus-footer').getBoundingClientRect();return {actor:{x:a.x,y:a.y,w:a.width,h:a.height},hudBottom:h.bottom,footerTop:f.top,overflow:document.documentElement.scrollWidth>innerWidth,controls:[...document.querySelectorAll('.focus-controls button,.motion-toggle')].map(e=>{const r=e.getBoundingClientRect();return r.width>=44&&r.height>=44&&r.bottom<=innerHeight+.5;})};},actor);
          check(!layout.overflow&&layout.controls.every(Boolean),label+' '+tag+' 화면 넘침 없음·44px 조작');
          check(layout.actor.x>=-1&&layout.actor.x+layout.actor.w<=width+1&&layout.actor.y>=layout.hudBottom&&layout.actor.y+layout.actor.h<=layout.footerTop+1,label+' '+tag+' 캐릭터가 타이머와 버튼 사이에 배치 '+JSON.stringify(layout));
          const first=await host.getAttribute('data-rig-time');await page.waitForTimeout(300);
          check(first!==await host.getAttribute('data-rig-time'),label+' '+tag+' 관절 모션 재생');
          await page.locator('[data-action=motion]').click();const stopped=await host.getAttribute('data-rig-time');await page.waitForTimeout(300);
          check(stopped===await host.getAttribute('data-rig-time'),label+' '+tag+' 움직임 줄이기 적용');
          await page.screenshot({path:path.join(out,label+'-'+id+'-session.png')});await page.locator('[data-action=motion]').click();
          await page.evaluate(()=>advanceActivityClock(125));await page.waitForFunction(()=>document.querySelector('#session-elapsed').textContent.includes('2분 5초'));
          await page.reload();await ready(page);await settled(page);
          check((await stored(page)).activeSession.id===session.id&&await page.locator('#village-app').getAttribute('data-activity')===id,label+' '+tag+' 새로고침 시 같은 활동 복원');
          await page.locator('[data-action=finish]').click();await page.locator('[data-action=confirm-finish]').click();
          const data=await stored(page),row=data.sessions.find(s=>s.id===session.id);
          check(row.seconds===125&&row.kind===session.kind&&data.activeSession===null,label+' '+tag+' 실제 경과 시간 한 번 기록');
          check(!await page.locator('#map-viewport').evaluate(e=>e.inert)&&await page.locator('#avatar-position').getAttribute('data-mode')==='walk',label+' '+tag+' 종료 후 마을 복귀');
          await page.screenshot({path:path.join(out,label+'-'+id+'-result.png')});await page.locator('#building-panel [data-action=close-panel]').first().click();
        }
        const totals=await page.evaluate(()=>{const m=GachisupStore.create(localStorage);return [m.stats({scope:'me'}).seconds,m.restStats().seconds,m.questProgress(m.get().quests[0]).value];});
        check(totals[0]===250&&totals[1]===125&&totals[2]===4,label+' UI 전체 흐름에서 휴식·집중·퀘스트 분리');
        await page.locator('.dock-building[data-select=cabin]').click();await page.locator('[data-feature=tab-stats][data-value=me]').click();await page.locator('[data-feature=tab-detail][data-value=rest]').click();
        check((await page.locator('.rest-summary').innerText()).includes('2분'),label+' 오두막 휴식 기록 조회');
        await page.screenshot({path:path.join(out,label+'-rest-stats.png')});
      }catch(error){await page.screenshot({path:path.join(out,label+'-failure.png')});throw error;}
      finally{await context.close();}
    }
    check(errors.length===0,'브라우저 런타임·로컬 에셋 오류 없음 '+errors.join(';'));
    console.log(passed+'개 활동 브라우저 검증 통과');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
