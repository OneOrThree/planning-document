/* 출력 시점의 원본 색 표본을 쓴다. 이후 수정된 Canvas와 옛 MP4를 비교하지 않는다. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright'),{startServer}=require('./serve.cjs');
const catalog=require('../cutscene-export-catalog.js'),profile=require('./cutscene-video-profile.cjs');
const root=path.resolve(__dirname,'..');
(async()=>{
  const version=process.argv.find(a=>a.startsWith('--version='))?.slice(10)||catalog.versions[0];
  if(!/^[a-z0-9-]+$/.test(version))throw Error('안전한 버전 이름이 필요합니다.');
  const batch=JSON.parse(fs.readFileSync(path.join(root,'output/cutscenes/videos',version,'manifest.json')));
  if(!batch.videoProfile){console.log(JSON.stringify({result:'LEGACY-NOT-COLOR-VERIFIED',version,note:'이전 출력은 원본 색 표본이 없습니다. 색 통과로 표시하지 않습니다.'}));return;}
  assert.equal(batch.films.length,9);assert.deepEqual(batch.videoProfile.expected,profile.expected);
  const own=process.env.BASE_URL?null:await startServer({prefix:'/planning-document/'}),url=process.env.BASE_URL||own.url;let browser;
  try{
    browser=await chromium.launch();const page=await browser.newPage();await page.goto(url+'cutscenes.html');const films=[];
    for(const film of batch.films){
      assert.equal(film.colorReference.length,3);assert.ok(film.colorReference.every(f=>f.points.length===84));
      const measurements=await page.evaluate(async film=>{
        const video=document.createElement('video');video.muted=true;video.preload='auto';document.body.append(video);
        const event=name=>new Promise((resolve,reject)=>{const timer=setTimeout(()=>end(Error(name+' 시간 초과')),15000),ok=()=>end(),bad=()=>end(Error('영상 로드 실패'));function end(error){clearTimeout(timer);video.removeEventListener(name,ok);video.removeEventListener('error',bad);error?reject(error):resolve();}video.addEventListener(name,ok);video.addEventListener('error',bad);});
        const ready=event('loadeddata');video.src=film.path;await ready;
        const canvas=document.createElement('canvas');canvas.width=film.width;canvas.height=film.height;const ctx=canvas.getContext('2d'),results=[];
        for(const sample of film.colorReference){
          const seek=event('seeked');video.currentTime=sample.time;await seek;ctx.drawImage(video,0,0);const error=[0,0,0],shift=[0,0,0];let maxPatchError=0;
          for(const point of sample.points){const data=ctx.getImageData(point.x-2,point.y-2,5,5).data,rgb=[0,0,0];for(let i=0;i<data.length;i+=4)for(let ch=0;ch<3;ch++)rgb[ch]+=data[i+ch]/25;
            const difference=rgb.map((v,ch)=>v-point.rgb[ch]);for(let ch=0;ch<3;ch++){error[ch]+=Math.abs(difference[ch]);shift[ch]+=difference[ch];}maxPatchError=Math.max(maxPatchError,...difference.map(Math.abs));
          }
          results.push({time:sample.time,patches:sample.points.length,meanError:error.map(v=>v/sample.points.length),meanShift:shift.map(v=>v/sample.points.length),maxPatchError});
        }
        video.removeAttribute('src');video.load();video.remove();return results;
      },film);
      for(const m of measurements)assert.ok(m.meanError.reduce((a,b)=>a+b)/3<3.5,film.id+' '+m.time+'초: 출력 색이 원본과 다릅니다.');
      films.push({id:film.id,measurements});
    }
    const report={result:'PASS',version,profile:batch.videoProfile.id,films,note:'출력 당시 3시점 × 84개 5×5 영역의 RGB 평균을 Chromium 디코딩과 비교. 모든 디스플레이의 색 인증은 아님.'};
    fs.writeFileSync(path.join(root,'output/cutscenes/qa/video-color-check.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
  }finally{if(browser)await browser.close();if(own)await new Promise(r=>own.server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
