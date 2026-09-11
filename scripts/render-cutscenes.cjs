/* 재현 가능한 9편 MP4 출력. 실행 시 원본을 스냅샷으로 고정한다. */
const fs=require('node:fs');
const path=require('node:path');
const os=require('node:os');
const crypto=require('node:crypto');
const {spawn,spawnSync}=require('node:child_process');
const {once}=require('node:events');
const {chromium}=require('playwright');
const {startServer}=require('./serve.cjs');
const root=path.resolve(__dirname,'..');
const sources=['cutscenes.html','prologue-scenarios-data.js','cutscene-settings.js','cutscene-production.js','cutscene-renderer.js','cutscene-sprites.js','cutscene-rig.js','cutscene-cinema.js','cutscene-review-log.js','cutscene-studio.js'];
async function main(){
  const args=process.argv.slice(2),value=(name,otherwise)=>args.find(x=>x.startsWith('--'+name+'='))?.slice(name.length+3)??otherwise;
  const width=Number(value('width',720)),height=width*16/9,fps=24,version=value('version','draft-v01'),selected=value('film',null);
  if(!Number.isInteger(height)||width%2||height%2||width<360||width>2160)throw Error('짝수 9:16 해상도가 필요합니다.');
  if(!/^[a-z0-9-]+$/.test(version))throw Error('안전한 버전 이름이 필요합니다.');
  const out=path.join(root,'output/cutscenes/videos',version);
  if(fs.existsSync(path.join(out,'manifest.json'))&&!args.includes('--replace'))throw Error('기존 출력 버전 보호: 새 --version을 사용하세요.');
  if(selected&&fs.existsSync(path.join(out,'manifest.json')))throw Error('단일 영상으로 기존 배치 명세를 덮어쓸 수 없습니다. 새 --version을 사용하세요.');
  fs.mkdirSync(out,{recursive:true});
  const snapshot=fs.mkdtempSync(path.join(os.tmpdir(),'gachisup-film-snapshot-'));
  const hash=crypto.createHash('sha256');
  for(const file of sources){const bytes=fs.readFileSync(path.join(root,file));hash.update(file).update(bytes);fs.writeFileSync(path.join(snapshot,file),bytes);}
  for(const dir of ['assets/cutscenes','assets/figma-cats'])fs.cpSync(path.join(root,dir),path.join(snapshot,dir),{recursive:true});
  function hashAssets(dir){for(const item of fs.readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))){const file=path.join(dir,item.name);if(item.isDirectory())hashAssets(file);else hash.update(path.relative(snapshot,file)).update(fs.readFileSync(file));}}
  hashAssets(path.join(snapshot,'assets'));
  const fingerprint=hash.digest('hex'),{server,url}=await startServer({prefix:'/planning-document/',directory:snapshot});
  let browser,ff;
  const records=[];
  try{
    browser=await chromium.launch();const page=await browser.newPage({viewport:{width:1280,height:960}}),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto(url+'cutscenes.html');await page.waitForFunction(()=>window.cutsceneReady,{timeout:30000});await page.evaluate(()=>document.fonts.ready);
    await page.evaluate(({width,height})=>{const c=document.getElementById('film');c.width=width;c.height=height;},{width,height});
    const films=await page.evaluate(()=>CutsceneProduction.films);
    if(selected&&!films.some(x=>x.id===selected))throw Error('알 수 없는 영상 ID: '+selected);
    for(const film of films.filter(x=>!selected||x.id===selected)){
      const dest=path.join(out,film.id+'.mp4'),partial=path.join(out,film.id+'.partial.mp4');
      if(fs.existsSync(dest)&&!args.includes('--replace'))throw Error('기존 영상 보호: 새 --version을 쓰거나 --replace를 명시하세요.');
      ff=spawn('ffmpeg',['-hide_banner','-loglevel','error','-y','-f','image2pipe','-vcodec','mjpeg','-framerate',String(fps),'-i','pipe:0','-an','-c:v','libx264','-preset','medium','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',partial]);
      let ffError='';ff.stderr.on('data',d=>{ffError+=d;});
      const completed=new Promise((resolve,reject)=>{ff.once('error',reject);ff.once('close',code=>code?reject(Error(ffError||'ffmpeg '+code)):resolve());});
      completed.catch(()=>{});ff.stdin.on('error',()=>{});
      const frameCount=Math.round(film.duration*fps);
      for(let frame=0;frame<frameCount;frame++){
        if(ff.exitCode!==null)throw Error(ffError||'영상 인코더가 중단되었습니다.');
        const jpeg=await page.evaluate(({film,t})=>{const c=document.getElementById('film');GachisupCinema.render(c,film,t);return c.toDataURL('image/jpeg',.98).split(',')[1];},{film,t:frame/fps});
        if(!ff.stdin.write(Buffer.from(jpeg,'base64')))await Promise.race([once(ff.stdin,'drain'),completed.then(()=>{throw Error('인코더 조기 종료');})]);
        if(frame%144===0)console.log(film.id+' · '+frame+'/'+frameCount);
      }
      ff.stdin.end();await completed;ff=null;
      if(errors.length)throw Error(errors.join('\n'));
      const probe=spawnSync('ffprobe',['-v','error','-count_frames','-show_entries','stream=codec_name,width,height,nb_read_frames,r_frame_rate,duration','-of','json',partial],{encoding:'utf8'});
      if(probe.status!==0)throw Error(probe.stderr);
      const stream=JSON.parse(probe.stdout).streams[0];
      if(Number(stream.nb_read_frames)!==frameCount||stream.width!==width||stream.height!==height||Math.abs(Number(stream.duration)-film.duration)>.05)throw Error('출력 영상 규격이 일치하지 않습니다.');
      fs.renameSync(partial,dest);
      const poster=await page.evaluate(({film})=>{const c=document.getElementById('film');GachisupCinema.render(c,film,film.timing.boardingEnd+.5);return c.toDataURL('image/jpeg',.94).split(',')[1];},{film});
      fs.writeFileSync(path.join(out,film.id+'.jpg'),Buffer.from(poster,'base64'));
      const record={id:film.id,title:film.title,direction:film.directionTitle,status:'draft',path:path.relative(root,dest),poster:path.relative(root,path.join(out,film.id+'.jpg')),bytes:fs.statSync(dest).size,sha256:crypto.createHash('sha256').update(fs.readFileSync(dest)).digest('hex'),width,height,fps,duration:film.duration,frames:frameCount};
      records.push(record);
      fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify({version,createdAt:new Date().toISOString(),fingerprint,reviewTarget:30,reviewNote:'출력과 프레임 수 검증은 시각 검토 완료 횟수가 아닙니다.',films:records},null,2)+'\n');
      console.log('완료: '+record.path+' · '+(record.bytes/1048576).toFixed(1)+' MB');
    }
  }finally{
    if(ff)ff.kill('SIGTERM');
    if(browser)await browser.close();await new Promise(r=>server.close(r));
    // 이 실행에서 mkdtemp로 만든, 내용이 고정된 스냅샷만 제거한다.
    fs.rmSync(snapshot,{recursive:true,force:true});
  }
}
main().catch(e=>{console.error(e);process.exitCode=1;});
