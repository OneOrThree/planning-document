/* 같은 Canvas 프레임을 여러 색 관리 방식으로 인코딩하고 브라우저 디코드와 비교한다. */
const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const {chromium}=require('playwright'),{startServer}=require('./serve.cjs');
const root=path.resolve(__dirname,'..');
const matrix='scale=in_range=pc:out_range=tv:in_color_matrix=bt601:out_color_matrix=bt709';
const tags=trc=>['-color_range','tv','-colorspace','bt709','-color_primaries','bt709','-color_trc',trc];
const profiles=[
  {id:'legacy',title:'기존 인코딩',args:[]},
  {id:'limited-srgb',title:'709 행렬 · sRGB',args:['-vf',matrix,...tags('iec61966-2-1')]},
  {id:'limited-709',title:'709 행렬 · 709 표기',args:['-vf',matrix,...tags('bt709')]},
  {id:'tagged-srgb',title:'709 행렬 · sRGB 고정',args:['-vf',matrix+',setparams=range=limited:color_primaries=bt709:color_trc=iec61966-2-1:colorspace=bt709',...tags('iec61966-2-1')]},
  {id:'tagged-709',title:'709 행렬 · 709 고정',args:['-vf',matrix+',setparams=range=limited:color_primaries=bt709:color_trc=bt709:colorspace=bt709',...tags('bt709')]},
  {id:'managed-709',title:'sRGB → 709 변환',args:['-vf','colorspace=ispace=bt470bg:iprimaries=bt709:itrc=srgb:irange=pc:space=bt709:primaries=bt709:trc=bt709:range=tv:format=yuv420p',...tags('bt709')]},
];
(async()=>{
  const val=(n,d)=>process.argv.find(a=>a.startsWith('--'+n+'='))?.slice(n.length+3)??d,label=val('label',''),filmId=val('film','');
  const selected=val('profiles','legacy,limited-srgb,tagged-srgb,tagged-709').split(','),active=selected.map(id=>profiles.find(p=>p.id===id));if(active.some(p=>!p))throw Error('없는 인코딩 프로필');
  if(!/^[a-z0-9-]+$/.test(label))throw Error('새 --label이 필요합니다.');
  const out=path.join(root,'output/cutscenes/details',label);if(fs.existsSync(out))throw Error('기존 근거를 덮어쓰지 않습니다.');fs.mkdirSync(out,{recursive:true});
  const {server,url}=await startServer({prefix:'/planning-document/'});let browser;
  try{
    browser=await chromium.launch();const page=await browser.newPage();await page.goto(url+'cutscenes.html');await page.waitForFunction(()=>window.cutsceneReady);
    const films=await page.evaluate(id=>CutsceneProduction.films.filter(f=>!id||f.id===id),filmId),results=[];if(!films.length)throw Error('없는 영상');
    for(const film of films){
      const shots=[];
      for(const time of [2.5,16,23.5]){
        const name=film.id+'-'+time,source=await page.evaluate(({film,time})=>{const c=document.createElement('canvas');c.width=1080;c.height=1920;GachisupCinema.render(c,film,time);return{png:c.toDataURL('image/png').split(',')[1],jpeg:c.toDataURL('image/jpeg',.98).split(',')[1]};},{film,time});
        const jpg=path.join(out,name+'.jpg');fs.writeFileSync(jpg,Buffer.from(source.jpeg,'base64'));fs.writeFileSync(path.join(out,name+'.png'),Buffer.from(source.png,'base64'));
        const variants=[];
        for(const profile of active){
          const dest=path.join(out,name+'-'+profile.id+'.mp4');
          const r=spawnSync('ffmpeg',['-hide_banner','-loglevel','error','-loop','1','-framerate','24','-i',jpg,'-frames:v','12','-an',...profile.args,'-c:v','libx264','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',dest],{encoding:'utf8'});if(r.status)throw Error(r.stderr);
          const probe=spawnSync('ffprobe',['-v','error','-select_streams','v:0','-show_entries','stream=color_range,color_space,color_transfer,color_primaries,pix_fmt','-of','json',dest],{encoding:'utf8'});
          variants.push({...profile,path:path.relative(root,dest),stream:JSON.parse(probe.stdout).streams[0]});
        }
        shots.push({time,source:path.relative(root,path.join(out,name+'.png')),variants});
      }
      const result=await page.evaluate(async({film,shots})=>{
        const sheet=document.createElement('canvas');sheet.width=(shots[0].variants.length+1)*216;sheet.height=1284;const sc=sheet.getContext('2d');sc.fillStyle='#f3ecda';sc.fillRect(0,0,sheet.width,1284);
        const canvas=()=>{const c=document.createElement('canvas');c.width=1080;c.height=1920;return c;},src=canvas(),dst=canvas(),metrics=[];
        for(const [row,shot]of shots.entries()){
          const im=new Image();im.src=shot.source;await im.decode();src.getContext('2d').drawImage(im,0,0);const a=src.getContext('2d').getImageData(0,0,1080,1920).data;
          sc.drawImage(src,0,row*428+24,216,384);sc.fillStyle='#3c493c';sc.font='14px system-ui';sc.fillText('Canvas 원본 · '+shot.time+'s',6,row*428+17);
          for(const [col,v]of shot.variants.entries()){
            const video=document.createElement('video');video.muted=true;video.src=v.path;await new Promise((resolve,reject)=>{video.onloadeddata=resolve;video.onerror=()=>reject(Error('색 비교 MP4 로드 실패'));});
            const seek=new Promise(r=>video.onseeked=r);video.currentTime=.25;await seek;dst.getContext('2d').drawImage(video,0,0);const b=dst.getContext('2d').getImageData(0,0,1080,1920).data;
            let count=0,absolute=[0,0,0],shift=[0,0,0];for(let i=0;i<a.length;i+=16){count++;for(let j=0;j<3;j++){absolute[j]+=Math.abs(b[i+j]-a[i+j]);shift[j]+=b[i+j]-a[i+j];}}
            const mean=absolute.map(x=>x/count),signed=shift.map(x=>x/count);metrics.push({time:shot.time,profile:v.id,meanError:mean,meanShift:signed,stream:v.stream});
            sc.drawImage(dst,(col+1)*216,row*428+24,216,384);sc.fillText(v.title,(col+1)*216+6,row*428+17);sc.fillText('평균 차이 '+(mean.reduce((a,b)=>a+b)/3).toFixed(2),(col+1)*216+6,row*428+423);video.removeAttribute('src');video.load();
          }
        }
        return{id:film.id,metrics,png:sheet.toDataURL('image/png').split(',')[1]};
      },{film,shots});
      fs.writeFileSync(path.join(out,film.id+'-comparison.png'),Buffer.from(result.png,'base64'));delete result.png;results.push(result);console.log(JSON.stringify(result));
    }
    fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({label,profiles:active,results,note:'고정 장면 0.5초 인코딩 비교다. 새 완성 영상이나 검토 회차로 자동 계산하지 않는다.'},null,2)+'\n');
  }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
