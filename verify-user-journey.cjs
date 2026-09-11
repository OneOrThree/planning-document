const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
let checks=0;
const check=(value,message)=>{assert.ok(value,message);checks++;};
for(const [slug,nodeCount,edgeCount] of [['gachisup-user-journey',5,5],['gachisup-participation-flow',9,10]]){
  const stem=path.join(__dirname,'diagrams',slug);
  const scene=JSON.parse(fs.readFileSync(stem+'.excalidraw','utf8'));
  const source=fs.readFileSync(stem+'.mmd','utf8');
  const labels=[...source.matchAll(/^\s*\w+\["(.*?)"\]/gm)].map(m=>m[1].replace(/<br\s*\/?\s*>/gi,'\n'));
  const nodes=scene.elements.filter(e=>e.type==='rectangle');
  const arrows=scene.elements.filter(e=>e.type==='arrow');
  check(nodes.length===nodeCount&&arrows.length===edgeCount,slug+' 구조');
  nodes.forEach((node,i)=>{
    const text=scene.elements.find(e=>e.containerId===node.id&&e.type==='text');
    check(node.roundness===null&&node.roughness===0,'각진 노드');
    check(text?.text===labels[i],'원본과 편집본 한글·줄바꿈 일치');
    check(text.x>=node.x&&text.y>=node.y&&text.x+text.width<=node.x+node.width&&text.y+text.height<=node.y+node.height,'텍스트가 노드 안에 배치');
  });
  for(const arrow of arrows){
    const points=arrow.points.map(([x,y])=>[x+arrow.x,y+arrow.y]);
    for(let i=1;i<points.length;i++){
      const [a,b]=[points[i-1],points[i]];
      check(a[0]===b[0]||a[1]===b[1],'직각 연결선');
      for(const n of nodes){
        const crosses=a[0]===b[0]
          ?a[0]>n.x&&a[0]<n.x+n.width&&Math.max(a[1],b[1])>n.y&&Math.min(a[1],b[1])<n.y+n.height
          :a[1]>n.y&&a[1]<n.y+n.height&&Math.max(a[0],b[0])>n.x&&Math.min(a[0],b[0])<n.x+n.width;
        check(!crosses,'연결선이 노드를 관통하지 않음');
      }
    }
  }
  const png=fs.readFileSync(stem+'.png');
  check(png.subarray(1,4).toString()==='PNG'&&png.readUInt32BE(16)===2400,'PNG 형식·해상도');
  check(fs.readFileSync(stem+'.svg','utf8').includes('<svg'),'SVG 생성');
}
(async()=>{
  const browser=await chromium.launch({headless:true});
  const failures=[];
  try{
    for(const viewport of [{width:1440,height:1000},{width:390,height:844}]){
      const page=await browser.newPage({viewport,deviceScaleFactor:1});
      page.on('pageerror',e=>failures.push(e.message));
      page.on('response',r=>{if(r.status()>=400)failures.push(`${r.status()} ${r.url()}`);});
      await page.goto(((process.env.BASE_URL || 'http://127.0.0.1:4173/').replace(/\/$/, '') + '/user-journey.html'),{waitUntil:'networkidle'});
      check(await page.locator('h1').innerText()==='같이 만든 곳으로,\n다시 모이는 여정.','뷰어 제목');
      check(await page.locator('.diagram-scroll img').evaluateAll(images=>images.length===2&&images.every(img=>img.complete&&img.naturalWidth>0)),'SVG 두 장 로드');
      check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),viewport.width+'px 페이지 가로 넘침 없음');
      if(viewport.width<700)check(await page.locator('.diagram-scroll').evaluateAll(els=>els.every(el=>el.scrollWidth>el.clientWidth)),'모바일 다이어그램 내부 스크롤');
      for(const href of await page.locator('a[href]').evaluateAll(links=>[...new Set(links.map(a=>a.getAttribute('href')))].filter(h=>!h.startsWith('#')))){
        const response=await page.request.get(new URL(href,page.url()).href);
        check(response.ok(),'뷰어 링크 '+href);
      }
      await page.screenshot({path:`/tmp/gachisup-user-journey-${viewport.width}.png`,fullPage:true});
      await page.close();
    }
    check(failures.length===0,'브라우저 오류 없음: '+failures.join(', '));
    console.log(JSON.stringify({checks,errors:failures,screenshots:['/tmp/gachisup-user-journey-1440.png','/tmp/gachisup-user-journey-390.png']},null,2));
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
