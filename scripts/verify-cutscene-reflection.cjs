const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright'),{startServer}=require('./serve.cjs');
const root=path.resolve(__dirname,'..');
(async()=>{
  const own=process.env.BASE_URL?null:await startServer({prefix:'/planning-document/'}),url=process.env.BASE_URL||own.url;let browser;
  try{
    browser=await chromium.launch();const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(url+'cutscenes.html');await page.waitForFunction(()=>window.cutsceneReady);
    const cases=await page.evaluate(()=>{
      // 첫 GPU 샘플과 다음 소프트웨어 리샘플 간 차이를 반사 변화로 오인하지 않도록 읽기용 표면을 고정한다.
      const make=()=>{const c=document.createElement('canvas');c.width=720;c.height=1280;c.getContext('2d',{willReadFrequently:true});return c;},before=make(),after=make(),mask=make(),results=[];
      // 같은 배경의 첫 리샘플 캐시를 먼저 완성한다. 반사를 끈 대조군도 그 다음에 검사한다.
      const control=CutsceneProduction.films[0],controlTime=control.timing.boardingEnd+.16;
      for(let i=0;i<3;i++){GachisupCinema.render(before,{...control,tuning:{...control.tuning,raftReflection:false}},controlTime);before.getContext('2d').getImageData(0,0,720,1280);}
      for(const f of CutsceneProduction.films){
        for(const time of [f.timing.boardingEnd+.16,f.timing.departureStart+.9,f.timing.seaStart-.5,23.5]){
          const a=GachisupCinema.render(before,{...f,tuning:{...f.tuning,raftReflection:false}},time),b=GachisupCinema.render(after,{...f,tuning:{...f.tuning,raftReflection:true}},time);
          const cam=b.camera,mc=mask.getContext('2d');mc.setTransform(1,0,0,1,0,0);mc.clearRect(0,0,720,1280);mc.translate(360,640);mc.scale(cam.z,cam.z);mc.translate(-cam.x,-cam.y);
          const boundary=CutsceneWaterMotion.boundaries[f.directionId==='journey'?'home':'shore'];mc.fillStyle='#fff';mc.beginPath();boundary.forEach(([x,y],i)=>i?mc.lineTo(x,y):mc.moveTo(x,y));mc.closePath();mc.fill();
          const d0=before.getContext('2d').getImageData(0,0,720,1280).data,d1=after.getContext('2d').getImageData(0,0,720,1280).data,m=mc.getImageData(0,0,720,1280).data;let outsideChanged=0,changed=0,maxDifference=0;
          for(let i=0;i<d0.length;i+=4){const delta=Math.max(...[0,1,2,3].map(ch=>Math.abs(d0[i+ch]-d1[i+ch])));if(delta){changed++;if(m[i+3]===0)outsideChanged++;maxDifference=Math.max(maxDifference,delta);}}
          results.push({film:f.id,time,changed,outsideChanged,maxDifference,metadataStable:JSON.stringify(a)===JSON.stringify(b)});
        }
      }
      return results;
    });
    for(const c of cases){assert.equal(c.outsideChanged,0,c.film+' 육지·하늘 영역 변경');assert.ok(c.changed>0,c.film+' 반사가 나오지 않음');assert.ok(c.metadataStable,c.film+' 원본 동작 좌표 변경');assert.ok(c.maxDifference<55,c.film+' 반사가 너무 진함');}
    assert.deepEqual(errors,[]);const report={result:'PASS',cases,errors,note:'같은 willReadFrequently 표면에서 9편 × 4시점의 반사 유무 비교. 수면 마스크 밖 불변·원본 동작 메타데이터 보존. 2D 투영이며 광학 시뮬레이션이 아님. 첫 GPU/다음 CPU 표본 차이는 반사를 둘 다 꺼도 재현되어 검사에서 렌더 표면을 통일했다.'};
    fs.writeFileSync(path.join(root,'output/cutscenes/qa/reflection-check.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
  }finally{if(browser)await browser.close();if(own)await new Promise(r=>own.server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
