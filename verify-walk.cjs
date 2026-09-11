const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.VILLAGE_URL||(process.env.BASE_URL || 'http://127.0.0.1:4173/').replace(/\/$/, '');
let count=0;const errors=[];
const ok=(v,s)=>{assert.ok(v,s);console.log('✓ '+s);count++;};
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
(async()=>{const browser=await chromium.launch();try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}});page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/walk.html');await page.locator('#walk-mount[data-walk-state=ready]').waitFor();
  ok(await page.locator('.walk-canvas').count()===1,'걷기 원화 WebGL 메시 준비');
  ok(await page.locator('#walk-speed option').count()===3&&await page.locator('#walk-speed').inputValue()==='100','걷기 속도 세 단계 및 기본 속도 일치');
  await page.locator('#walk-speed').selectOption('56');await page.locator('#walk-speed').selectOption('100');
  const d=Number(await page.locator('#walk-mount').getAttribute('data-distance'));await sleep(180);
  ok(Number(await page.locator('#walk-mount').getAttribute('data-distance'))>d,'작업실에서 보행 거리·주기 증가');
  await page.locator('#walk-cycle').fill('0.25');
  const first=await page.locator('.walk-canvas').evaluate(c=>c.toDataURL());
  ok(Number(await page.locator('#walk-mount').getAttribute('data-left-lift'))>26&&Number(await page.locator('#walk-mount').getAttribute('data-right-lift'))<.01,'왼발을 들 때 오른발은 지지');
  const frozen=await page.locator('#walk-mount').getAttribute('data-distance');await sleep(180);
  ok(frozen===await page.locator('#walk-mount').getAttribute('data-distance'),'타임라인 조작 시 관절 일시정지');
  await page.locator('#walk-cycle').fill('0.75');
  ok(Number(await page.locator('#walk-mount').getAttribute('data-right-lift'))>26&&Number(await page.locator('#walk-mount').getAttribute('data-left-lift'))<.01,'다음 반 주기에는 반대 발 디딤');
  ok(first!==await page.locator('.walk-canvas').evaluate(c=>c.toDataURL()),'캔버스의 실제 메시 포즈가 변경됨');
  await page.locator('#walk-bones').click();
  ok(await page.locator('[data-walk-bone]').count()===20,'20개 관절 표시');
  ok((await page.locator('.walk-mesh').getAttribute('d')).length>1000,'변형되는 가중치 메시 시각화');
  await page.locator('#walk-joint-shinL').fill('12');
  ok(await page.locator('#walk-output-shinL').textContent()==='12°','무릎 관절 독립 제어');
  await page.locator('#walk-reset').click();await page.locator('#walk-bones').click();
  for(const dir of ['ne','nw','se','sw']){
    await page.locator('[data-direction='+dir+']').click();
    ok(await page.locator('#walk-mount').getAttribute('data-direction')===dir&&await page.locator('.walk-fallback').getAttribute('src')===`assets/momo-walk-${dir[0]==='n'?'back':'front'}.png`,'앞·뒤 원화와 반전으로 '+dir+' 방향 전환');
  }
  const downloadPromise=page.waitForEvent('download');await page.locator('#export-walk').click();const download=await downloadPromise;
  const rig=JSON.parse(await fs.readFile(await download.path(),'utf8'));
  ok(Object.keys(rig.bones).length===20&&rig.stride===74,'걷기 리그의 관절·보폭 JSON 내보내기');
  for(const view of ['front','back']){
    const mesh=rig.views[view].mesh;
    ok(mesh.indices.length/3===4608&&mesh.vertices.length/2===2401,view+' 원화의 2,401 정점·4,608 삼각형');
    ok(mesh.weights.every(row=>row.length===20&&row.every(w=>w>=0)&&Math.abs(row.reduce((a,b)=>a+b,0)-1)<.00001),view+' 스키닝 가중치 합 1');
  }
  const alpha=await page.evaluate(async()=>{const out=[];for(const src of ['assets/momo-walk-front.png','assets/momo-walk-back.png']){const image=new Image();image.src=src;await image.decode();const c=document.createElement('canvas');c.width=c.height=1254;const ctx=c.getContext('2d');ctx.drawImage(image,0,0);out.push([ctx.getImageData(3,3,1,1).data[3],ctx.getImageData(630,600,1,1).data[3]]);}return out;});
  ok(alpha.every(([outside,fur])=>outside===0&&fur>=250),'앞·뒤 이미지 실제 투명 배경, 크림색 털 알파 98% 이상');
  const palette=await page.evaluate(async()=>{
    const samples=[
      {src:'assets/momo-rig-source.png',boxes:[[270,230,110,70],[510,240,90,90]]},
      {src:'assets/momo-walk-front.png',direction:'sw',boxes:[[270,210,110,70],[500,220,100,90]]},
      {src:'assets/momo-walk-back.png',direction:'ne',boxes:[[650,250,80,70],[330,230,90,70]]}
    ];
    const result=[];
    for(const sample of samples){
      const img=new Image();img.src=sample.src;await img.decode();
      const host=document.createElement('div');host.className='momo-walk-host';host.dataset.direction=sample.direction||'sw';
      host.innerHTML='<canvas class="walk-canvas"></canvas><img class="walk-fallback">';document.body.append(host);
      const filter=sample.direction?getComputedStyle(host.querySelector('canvas')).filter:'none';
      const fallbackFilter=getComputedStyle(host.querySelector('img')).filter;
      const render=value=>{const c=document.createElement('canvas');c.width=c.height=1000;const ctx=c.getContext('2d');ctx.filter=value;ctx.drawImage(img,0,0,1000,1000);return {colors:sample.boxes.map(box=>{const d=ctx.getImageData(...box).data,sum=[0,0,0];for(let i=0;i<d.length;i+=4)for(let channel=0;channel<3;channel++)sum[channel]+=d[i+channel];return sum.map(n=>n/(d.length/4));}),alpha:[ctx.getImageData(3,3,1,1).data[3],ctx.getImageData(500,400,1,1).data[3]]};};
      result.push({raw:render('none'),corrected:render(filter),filter,fallbackFilter});host.remove();
    }
    return result;
  });
  const colorDistance=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
  for(const [index,view] of [[1,'앞면'],[2,'뒷면']]){
    const sample=palette[index];
    const before=sample.raw.colors.map((color,i)=>colorDistance(color,palette[0].raw.colors[i]));
    const after=sample.corrected.colors.map((color,i)=>colorDistance(color,palette[0].raw.colors[i]));
    console.log(view+' 색 차이(갈색·주황색): '+before.map(n=>n.toFixed(2)).join(', ')+' → '+after.map(n=>n.toFixed(2)).join(', '));
    ok(after.every((error,i)=>error<5&&error<before[i]*.45),view+' 갈색·주황색이 승인 독서 원화와 RGB 거리 5 미만 · 색 차이 55% 이상 감소');
    ok(sample.filter===sample.fallbackFilter&&sample.raw.alpha.every((a,i)=>a===sample.corrected.alpha[i]),view+' WebGL·대체 이미지 색 보정 동일 · 배경과 털 알파 보존');
  }
  await page.locator('[data-walk-clip=idle]').click();await sleep(550);
  ok(Number(await page.locator('#walk-mount').getAttribute('data-blend'))<.001,'걷기 → 대기 부드러운 전환');
  await page.screenshot({path:path.join(__dirname,'tmp/verification/momo-walk-desktop.png'),fullPage:true});
  for(const width of [320,390,768]){await page.setViewportSize({width,height:844});ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),width+'px 걷기 작업실 가로 넘침 없음');}
  await page.setViewportSize({width:390,height:844});await page.screenshot({path:path.join(__dirname,'tmp/verification/momo-walk-mobile.png'),fullPage:true});
  await page.setViewportSize({width:1440,height:1000});await page.goto(base+'/?walk=1');await page.locator('.avatar-walker[data-walk-state=ready]').waitFor();
  const avatar=page.locator('#avatar-position'),walker=page.locator('.avatar-walker');
  ok(await page.locator('#avatar-image').count()===0,'섬의 기존 SVG 이동 캐릭터를 새 모모로 교체');
  await page.locator('#village-app.is-moving').waitFor();const before=await avatar.evaluate(e=>[+e.dataset.x,+e.dataset.y]);const walkDistance=Number(await walker.getAttribute('data-distance'));await sleep(250);const after=await avatar.evaluate(e=>[+e.dataset.x,+e.dataset.y]);
  ok(Math.hypot(after[0]-before[0],after[1]-before[1])>5&&Number(await walker.getAttribute('data-distance'))>walkDistance,'섬에서 실제 이동과 발걸음 위상 연동');
  await page.screenshot({path:path.join(__dirname,'tmp/verification/momo-walk-island.png')});
  await page.waitForFunction(()=>!document.querySelector('#village-app').classList.contains('is-moving'),null,{timeout:12000});await sleep(550);
  ok(Math.abs(Number(await avatar.getAttribute('data-x'))-795)<.1&&Math.abs(Number(await avatar.getAttribute('data-y'))-761)<.1,'지정 경로를 따라 항구 입구까지 도착');
  ok(await walker.getAttribute('data-motion')==='idle'&&Number(await walker.getAttribute('data-blend'))<.001,'도착하면 걷기 중지 및 중립 자세 복원');
  const arrived=await avatar.getAttribute('style');await page.locator('[data-action=overview]').click();await sleep(500);await page.locator('[data-action=zoom-in]').click();await sleep(500);
  ok(arrived===await avatar.getAttribute('style'),'확대·축소 시 캐릭터의 섬 좌표 유지');
  const ground=await page.locator('#map-layer').evaluate(e=>{const m=new DOMMatrix(getComputedStyle(e).transform);return {x:774*m.a+m.e,y:699*m.d+m.f};});
  await page.mouse.move(ground.x,ground.y);await page.mouse.down();await page.mouse.move(ground.x+45,ground.y+25,{steps:8});await page.mouse.up();await sleep(200);
  ok(arrived===await avatar.getAttribute('style')&&await walker.getAttribute('data-motion')==='idle','지도 드래그는 캐릭터 이동으로 오인하지 않음');
  const tap=await page.locator('#map-layer').evaluate(e=>{const m=new DOMMatrix(getComputedStyle(e).transform);return {x:774*m.a+m.e,y:699*m.d+m.f};});
  await page.mouse.click(tap.x,tap.y);await sleep(180);
  ok(await walker.getAttribute('data-motion')==='walk','건물 메뉴뿐 아니라 실제 길 터치로 보행 시작');
  await page.locator('.dock-building[data-select=town]').click();await sleep(220);await page.locator('.dock-building[data-select=cabin]').click();await sleep(200);
  ok(await walker.getAttribute('data-motion')==='walk'&&await page.locator('#walk-route').getAttribute('d')!==null,'이동 도중 목적지를 바꿔도 보행 계속');
  await page.locator('.dock-building[data-select=camp]').click();await page.locator('[data-action=start]').click();await page.locator('.avatar-reader[data-rig-state=ready]').waitFor();
  ok(await avatar.getAttribute('data-mode')==='read'&&await walker.getAttribute('data-motion')==='idle','집중 시작 시 이동 중지 + 승인된 독서 리그 전환');
  await page.locator('[data-action=finish]').click();await page.locator('[data-action=confirm-finish]').click();
  ok(await avatar.getAttribute('data-mode')==='walk','집중 종료 시 서 있는 모모 복원');
  await page.locator('[data-action=close-panel]').first().click();await page.locator('.dock-building[data-select=harbor]').click();await page.locator('[data-panel-tab=harbor][data-value=explore]').first().click();await page.locator('[data-action=visit]').click();
  const visitPosition=await avatar.getAttribute('style');await page.locator('.dock-building[data-select=town]').click();await sleep(250);
  ok(visitPosition===await avatar.getAttribute('style')&&await walker.getAttribute('data-motion')==='idle','방문 중 읽기 전용 유지 · 이동하지 않음');
  await page.setViewportSize({width:390,height:844});await page.goto(base+'/?walk=1');await page.locator('.avatar-walker[data-walk-state=ready]').waitFor();
  ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'모바일 섬에서 가로 넘침 없음');
  await page.screenshot({path:path.join(__dirname,'tmp/verification/momo-walk-island-mobile.png')});
  const reduced=await browser.newPage({reducedMotion:'reduce'});await reduced.goto(base+'/walk.html');await reduced.locator('#walk-mount[data-walk-state=ready]').waitFor();const initial=await reduced.locator('#walk-mount').getAttribute('data-distance');await sleep(180);
  ok(initial===await reduced.locator('#walk-mount').getAttribute('data-distance'),'동작 줄이기 환경의 작업실 자동 재생 없음');
  await reduced.locator('#walk-play').click();await sleep(180);ok(Number(await reduced.locator('#walk-mount').getAttribute('data-distance'))>Number(initial),'명시적으로 재생하면 동작 줄이기에서도 걷기 가능');
  await reduced.goto(base+'/?walk=1');await reduced.locator('.avatar-walker[data-walk-state=ready]').waitFor();await sleep(250);
  ok(await reduced.locator('#avatar-position').getAttribute('data-x')==='795.00'&&await reduced.locator('#village-app.is-moving').count()===0,'동작 줄이기 환경에서는 목적지 즉시 이동');await reduced.close();
  const fallback=await browser.newPage();await fallback.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return type==='webgl'?null:get.call(this,type,...args);};});await fallback.goto(base+'/walk.html');await fallback.locator('[data-walk-state=fallback]').waitFor();
  ok(await fallback.locator('#walk-cycle').isDisabled()&&await fallback.locator('.walk-fallback').evaluate(e=>getComputedStyle(e).opacity==='1'),'WebGL 미지원 시 원화 대체와 미지원 조작 비활성화');await fallback.close();
  ok(errors.length===0,'브라우저 런타임 오류 없음');console.log('\n'+count+'개 검증 통과');
}finally{await browser.close();}})().catch(error=>{console.error(error);process.exitCode=1;});
