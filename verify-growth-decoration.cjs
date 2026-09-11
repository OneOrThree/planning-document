/* 04·07 기획 반영 검증. 제품 저장 데이터·런타임을 변경하지 않는다. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {chromium}=require('playwright');
let checks=0;
const check=(value,note)=>{assert.ok(value,note);checks++;};
const base=((process.env.BASE_URL || 'http://127.0.0.1:4173/').replace(/\/$/, '') + '/');
(async()=>{
  const sandbox={window:{}};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'feature-inventory-data.js'),'utf8'),sandbox);
  const data=sandbox.window.GachisupFeatureInventory;
  const feature=id=>data.features.find(f=>f.id===id);
  check(data.features.length===170,'전체 170개');
  check(data.features.filter(f=>f.group==='focus').length===19,'집중 19개');
  for(const id of ['D13','F12','N05','P01'])check(!feature(id)&&data.retiredFeatures[id],id+' 제외/통합 이력');
  check(!feature('I07'),'콕찌르기 복구하지 않음');
  check(feature('L04').note.includes('개인80%·섬20%')&&feature('L04').action.includes('전량'),'이전 분배 대신 초기 전량 건설');
  check(feature('L16').decision==='chosen'&&feature('L16').note.includes('100 마을 포인트는 확정'),'축음기100P 확정');
  check(feature('L16').note.includes('상점의 필수')===false&&feature('L16').note.includes('선행 조건도'),'축음기는 상점 선행 아님');
  check(feature('E03').decision==='proposal'&&feature('L14').decision==='proposal','다른 비용을 임의 확정하지 않기');
  check(feature('L13').note.includes('비용은 제안'),'배 업그레이드 비용 제안 유지');
  check(feature('L17').note.includes('개인별 다른 ASMR은 두지 않는다'),'공동 음원으로 전환');
  check(feature('I06').action.includes('그룹 전체')&&feature('I06').note.includes('개인 수신자 선택'),'섬 전체 자유 편지');
  check(feature('I05').note.includes('읽음 표시는 없다'),'읽음 표시 제외');
  check(feature('N01').note.includes('플레이어는 고양이만')&&feature('N01').action.includes('삼색'),'고양이6색 플레이어');
  check(feature('E14').note.includes('강아지 NPC 전용'),'강아지 상점 NPC');
  check(feature('D20').action.includes('모든 배')&&feature('D20').note.includes('전환 버튼'),'핀치 나/모든 그룹원 배');
  check(feature('D14').action.includes('책을 읽고')&&feature('D14').action.includes('배 위 낚시'),'동일 모닥불 독서 후 배 복귀');
  check(feature('D01').note.includes('충돌')&&feature('D10').note.includes('추가 검토'),'공개·강제 종료 충돌을 숨기지 않음');
  for(const f of data.features.filter(f=>f.document))check(fs.existsSync(path.join(__dirname,f.document)),f.id+' 최신 문서 링크');
  const plan=fs.readFileSync(path.join(__dirname,'story-loop-plan.md'),'utf8');
  for(const phrase of ['기러기가 전달한다','우리 섬에서 같이하자','재방문 때는 항해를 줄인다','동료의 존재가 가장 중요하다'])check(plan.includes(phrase),'Plannotator '+phrase);
  const browser=await chromium.launch({headless:true});
  const errors=[];
  try{
    for(const width of [1440,390,320]){
      const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
      page.on('pageerror',e=>errors.push(e.message));
      for(const file of ['feature-inventory.html','revisions/04-island-growth.html','revisions/07-personal-shared-decoration.html']){
        const response=await page.goto(base+file,{waitUntil:'networkidle'});
        check(response.ok(),file+' 응답');
        check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),file+' '+width+' 가로 넘침 없음');
        if(file==='feature-inventory.html'){
          await page.locator('[data-planning-tab=story]').click();
          check(await page.locator('#latest-growth-decoration').isVisible(),'최신 결정 노출');
          check(!(await page.locator('#previous-growth-proposals').evaluate(e=>e.open)),'과거 논의 기본 접힘');
          if(width===390){await page.locator('#latest-growth-decoration').scrollIntoViewIfNeeded();await page.screenshot({path:'/tmp/gachisup-growth-decoration-390.png'});}
        }else{
          const links=await page.locator('a[href]').evaluateAll(es=>es.map(e=>e.href));
          for(const href of [...new Set(links)]){
            const url=new URL(href);
            if(url.origin!==new URL(base).origin)continue;
            const linked=await page.request.get(url.origin+url.pathname+url.search);
            check(linked.ok(),'보관본 링크 '+url.pathname);
            if(url.pathname===new URL(page.url()).pathname&&url.hash)check(await page.evaluate(id=>Boolean(document.getElementById(decodeURIComponent(id))),url.hash.slice(1)),'원본 내부 앵커 '+url.hash);
          }
        }
      }
      await page.close();
    }
    check(!errors.length,'브라우저 오류 없음');
    console.log(JSON.stringify({checks,features:data.features.length,errors},null,2));
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
