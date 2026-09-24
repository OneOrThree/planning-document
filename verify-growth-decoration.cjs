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
  check(data.features.length===167,'전체 167개');
  check(data.features.filter(f=>f.group==='focus').length===18,'집중 18개');
  for(const id of ['D13','F12','N05','P01','D04','D06','H08','L04','L10','L13','M01','M02'])check(!feature(id)&&data.retiredFeatures[id],id+' 제외/통합 이력');
  check(!feature('I07'),'콕찌르기 복구하지 않음');
  check(data.retiredFeatures.L04.includes('섬 소유 물고기 하나')&&feature('D11').title==='집중한 섬 귀속'&&!feature('D11').note.includes('개인에게'),'게시판 전후 귀속 전환 폐지, 집중한 섬 귀속');
  check(feature('L16').decision==='chosen'&&feature('L16').title==='축음기 건설 퀘스트'&&feature('L16').note.includes('고정 총액 1,360마리')&&feature('L16').note.includes('30분')&&!feature('L16').note.includes('마을 포인트'),'축음기는 고정 총액 1,360마리·30분 건설 퀘스트');
  check(!feature('L16').note.includes('상점')&&feature('L17').note.includes('상점은 필요하지 않다'),'축음기·음원은 상점 선행 아님');
  check(feature('E03').decision==='chosen'&&feature('E03').note.includes('건설하기')&&feature('E03').note.includes('고정 총액')&&feature('L14').decision==='proposal','건설 차감은 채택한 고정 총액, 테마 가격은 미정 유지');
  check(data.retiredFeatures.L13.includes('기본 뗏목')&&data.retiredFeatures.L10.includes('기본 뗏목'),'배 업그레이드·배 소품 폐지 이력');
  check(feature('L17').note.includes('개인별 다른 ASMR은 두지 않는다')&&feature('L17').note.includes('상점은 필요하지 않다'),'공동 음원은 축음기에서 직접 구매');
  check(feature('I06').action.includes('그룹 전체')&&feature('I06').note.includes('개인 수신자 선택')&&feature('I06').note.includes('I09'),'섬 전체 자유 편지와 친구 비동기 편지 구분');
  check(feature('I06').note.includes('읽음 표시'),'섬 전체 편지방 읽음 표시 제외');
  check(feature('N01').note.includes('플레이어는 고양이만')&&feature('N01').action.includes('삼색'),'고양이6색 플레이어');
  check(feature('E14').note.includes('강아지 NPC')&&feature('E14').note.includes('고정 총액은 6,800마리')&&feature('E14').note.includes('4시간'),'강아지 상점 NPC·마지막 상점 고정 총액');
  check(feature('D20').action.includes('현재 집중 중인 주민 전체')&&!feature('D20').action.includes('모든 배')&&feature('D20').note.includes('보기 전환 버튼은 없어요'),'핀치 내 낚시 자리/현재 집중 중인 주민 전체');
  check(feature('D14').action.includes('전용 모닥불 화면')&&feature('D14').action.includes('기존 낚시 자리')&&!feature('D14').action.includes('책을 읽고'),'전용 모닥불 휴식 후 기존 낚시 자리 복귀');
  check(feature('D01').note.includes('표시 정보예요')&&feature('D10').note.includes('추가 검토'),'이름·과목·경과 시간은 표시 정보로 확정, 강제 종료는 검토 유지');
  check(!JSON.stringify(data.groups).includes('마을 포인트'),'현행 기능·영역 설명에 마을 포인트 없음');
  check(feature('F13').note.includes('완료 도장')&&feature('F13').note.includes('건설하기')&&feature('F13').note.includes('일일 초기화하지 않아요')&&feature('D22').note.includes('1분(60초)')&&feature('D22').note.includes('하루 최대 480마리'),'건물 건설 퀘스트·1분 1마리·하루 최대 480마리 기준');
  check(feature('F03').note.includes('물고기 10마리')&&feature('F04').note.includes('물고기 10마리')&&feature('F03').note.includes('대상 주민 수×5마리')&&feature('F04').note.includes('대상 주민 수×5마리')&&feature('L05').title==='일일 퀘스트 물고기 보상','집중·스크린타임 일일 퀘스트 보상 동일');
  check(feature('H01').title==='도서관 기록·조회 범위'&&feature('H01').note.includes('같은 섬 주민 전체')&&feature('H01').note.includes('다른 섬 방문자는 도서관을 이용하지 않는다')&&feature('M03').note.includes('일요일 00시')&&feature('M03').note.includes('전체 주민 수'),'도서관 같은 섬 전체 공개·방문자 비공개·섬 간 랭킹 공식');
  check(feature('H10').note.includes('하루 총 스크린타임만 같은 섬 주민 전체')&&feature('H10').note.includes('앱별 사용 시간')&&feature('H12').note.includes('다른 섬 방문자는 조회할 수 없다')&&feature('I04').note.includes('친구라는 이유만으로')&&feature('O08').decision==='chosen'&&feature('O08').proof==='pending','사용량·물고기·친구 공개 범위와 개인정보 동의 결정/구현 상태 분리');
  check(feature('A03').decision==='chosen'&&feature('A03').title==='별도 신규 앱 안내'&&feature('O02').decision==='chosen'&&feature('O02').note.includes('단일 진실원'),'Catus 별도 신규 앱·앱별 사용시간 서버 저장 결정');
  check(feature('L09').decision==='chosen'&&feature('L18').decision==='chosen'&&feature('D21').world.includes('하트뿅뿅'),'주민 누구나 공동 외양·개인 의상 유지·이모티콘 5종');
  check(feature('D12').note.includes('이번 휴식 경과 시간')&&feature('D07').note.includes('현재 음악')&&feature('B06').note.includes('공개 섬 둘러보기에는 초대 코드 입력을 두지 않아요'),'휴식 그룹원·현재 음악 선택·초대 코드 진입 위치');
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
