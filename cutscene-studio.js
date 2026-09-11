(() => {
  const canvas=document.getElementById('film'),seek=document.getElementById('seek'),play=document.getElementById('play');
  const query=new URLSearchParams(location.search);let id=Math.max(0,CutsceneProduction.films.findIndex(x=>x.id===query.get('film'))),time=0,playing=false,previous=0;
  if(['sprite','poses','rig'].includes(query.get('actor')))CutsceneProduction.films.forEach(f=>{f.tuning.actorMode=query.get('actor');});
  if(['rig','pose'].includes(query.get('paddle')))CutsceneProduction.films.forEach(f=>{f.tuning.paddleRig=query.get('paddle')==='rig';});
  if(['rig','pose'].includes(query.get('walk')))CutsceneProduction.films.forEach(f=>{f.tuning.walkRig=query.get('walk')==='rig';});
  if(query.get('water')==='still')CutsceneProduction.films.forEach(f=>{f.tuning.waterMotion=false;});
  if(query.get('raft')==='shadow')CutsceneProduction.films.forEach(f=>{f.tuning.raftContact=false;});
  if(query.get('weight')==='still')CutsceneProduction.films.forEach(f=>{f.tuning.paddleWeight=false;});
  if(query.get('cloth')==='fold')CutsceneProduction.films.forEach(f=>{f.tuning.clothFold=true;});
  if(query.get('cloth')==='shrink')CutsceneProduction.films.forEach(f=>{f.tuning.clothFold=false;});
  if(query.get('dock')==='pose')CutsceneProduction.films.forEach(f=>{f.tuning.dockRig=false;});
  if(['rig','still'].includes(query.get('tail')))CutsceneProduction.films.forEach(f=>{f.tuning.tailRig=query.get('tail')==='rig';});
  if(['glide','off'].includes(query.get('birds')))CutsceneProduction.films.forEach(f=>{f.tuning.seabirds=query.get('birds')==='glide';});
  if(['stroke','even'].includes(query.get('travel')))CutsceneProduction.films.forEach(f=>{f.tuning.oarTravel=query.get('travel')==='stroke';});
  if(['water','off'].includes(query.get('reflection')))CutsceneProduction.films.forEach(f=>{f.tuning.raftReflection=query.get('reflection')==='water';});
  if(['on','off'].includes(query.get('readingblink')))CutsceneProduction.films.forEach(f=>{f.tuning.readingBlink=query.get('readingblink')==='on';});
  if(query.get('actor')==='sprite')document.querySelector('.status').textContent='이전 아틀라스 자세를 비교하는 모드입니다. 기본 실시간 연출은 같은 얼굴의 개별 자세를 사용합니다. MP4는 표시된 버전의 고정본입니다.';
  const choices=document.getElementById('choices');
  function reviews(f){return CutsceneReviewLog.filter(r=>r.scope==='all-nine'||r.films?.includes(f.id));}
  CutsceneProduction.films.forEach(f=>{f.reviewCompleted=reviews(f).length;});
  choices.innerHTML=CutsceneProduction.films.map((o,i)=>`<button class="choice" data-index="${i}" aria-pressed="false"><strong>${String(i+1).padStart(2,'0')} · ${o.title}</strong><span>${o.directionTitle} · 검토 ${o.reviewCompleted} / ${o.reviewTarget}</span></button>`).join('');
  function updateChoice(){
    choices.querySelectorAll('button').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===id)));
    const f=CutsceneProduction.films[id];document.getElementById('logline').textContent=f.description;document.getElementById('together').textContent=GachisupPrologues[f.storyIndex].together;
    document.getElementById('review-status').textContent=`현재 기록 ${f.reviewCompleted} / ${f.reviewTarget}회 · 장면별 정지 프레임 검토 포함. 전체 연속 동작 검증과 구분합니다.`;
    document.getElementById('review-list').innerHTML=reviews(f).sort((a,b)=>b.round-a.round).map(r=>`<details><summary>${String(r.round).padStart(2,'0')} · ${r.focus}</summary><p>${r.finding}</p><p>${r.change}</p><p>${r.verification}</p>${[r.evidence,...r.additionalEvidence||[]].map((path,i)=>`<p><a href="${path}">검토 기록 ${i+1}</a> · <a href="https://github.com/OneOrThree/planning-document/tree/main/${path.slice(0,path.lastIndexOf('/'))}">프레임 원본</a></p>`).join('')}</details>`).join('');
  }
  function draw(){GachisupCinema.render(canvas,id,time);seek.value=time;document.getElementById('time').textContent=time.toFixed(1)+' / 24초';}
  function pause(){playing=false;play.textContent='재생';}
  choices.addEventListener('click',e=>{const button=e.target.closest('[data-index]');if(!button)return;id=Number(button.dataset.index);time=0;pause();query.set('film',CutsceneProduction.films[id].id);history.replaceState(null,'','?'+query);updateChoice();if(window.cutsceneReady)draw();});
  play.addEventListener('click',()=>{if(playing){pause();return;}if(time>=24)time=0;playing=true;previous=performance.now();play.textContent='일시 정지';requestAnimationFrame(tick);});
  seek.addEventListener('input',()=>{pause();time=Number(seek.value);if(window.cutsceneReady)draw();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
  function tick(now){if(!playing)return;time=Math.min(24,time+(now-previous)/1000);previous=now;draw();if(time===24){pause();return;}requestAnimationFrame(tick);}
  updateChoice();GachisupCinema.ready.then(()=>{window.cutsceneReady=true;play.disabled=false;draw();}).catch(e=>{const box=document.getElementById('error');box.hidden=false;box.textContent=e.message;});
  const section=document.getElementById('exports'),versions=CutsceneExportCatalog.versions;let exportRequest=0;
  section.hidden=false;section.innerHTML='<h2>내려받아 보는 MP4 초안</h2><p>고정 시점의 영상입니다. 위 실시간 연출에는 출력 이후의 수정이 먼저 반영됩니다. 출력 횟수는 검토 완료 횟수가 아니에요.</p><label for="export-version">출력 버전 </label><select id="export-version">'+versions.map(v=>`<option value="${v}">${v}</option>`).join('')+'</select><p id="export-note" role="status"></p><div id="export-grid"></div>';
  async function loadExports(version){
    const request=++exportRequest,grid=document.getElementById('export-grid');grid.querySelectorAll('video').forEach(v=>v.pause());grid.innerHTML='';
    try{
      const r=await fetch('output/cutscenes/videos/'+version+'/manifest.json');if(!r.ok)throw Error('영상 목록을 불러오지 못했어요.');const batch=await r.json();if(request!==exportRequest)return;
      window.cutsceneExportBatch=batch;
      document.getElementById('export-note').textContent=({'draft-v07':'일곱 번째 초안 · 1080 × 1920. 책을 놓고 천천히 고개를 든 다음, 앞발을 올려 노를 집어요. 짐 정리와 출항을 구분했어요. 걷기는 기존 개별 자세를 유지하며 관절 보행 시험은 아직 포함하지 않았어요.','draft-v06':'여섯 번째 초안 · 1080 × 1920. 같은 몸체에서 앞발만 움직여 노를 젓고, 손 옆에 내려 둔 노를 집어요. 감정형 장소 전환의 흰 섬광도 없앴어요. 고개 들기·걷기·도약의 연결은 계속 개선 중이에요.','draft-v05':'다섯 번째 초안 · 1080 × 1920. 같은 얼굴의 걷기·도약·앞발·눈깜빡임을 연결했어요. 가방과 책은 앞발 쪽에서 차례로 정리하고 갑판에 남겨요. 발의 주기 연결과 노를 집는 동작은 계속 개선 중이에요.','draft-v04':'네 번째 초안 · 1080 × 1920. 책·가방 동작의 순서와 가림, 모래 그림→공책의 연결, 떠난 자리에 남는 그림, 이동 방향을 따르는 물결을 포함해요. 걷기·도약의 자세 연결은 계속 개선 중이에요.','draft-v03':'세 번째 초안 · 1080 × 1920. 책을 보는 자세·짧은 부두·승선 준비·그림책 전환·자막 개선을 포함해요. 가방·밧줄 겹침은 다음 버전에서 수정했어요.','draft-v02':'두 번째 초안 · 1080 × 1920. 이전 노 잡기·출항 경로를 비교할 수 있어요.','draft-v01':'첫 번째 초안 · 720 × 1280. 초기 상태 비교용으로 보존했어요.'})[version];
      const archived=versions.indexOf(version)>=CutsceneExportCatalog.inlineCount;
      if(version==='draft-v18')document.getElementById('export-note').textContent='열여덟 번째 초안 · 1080 × 1920 · 60fps. v17과 같은 동작을 초당 60장으로 직접 다시 그렸어요. 24fps 보간 영상이 아니며, 수면 반사와 준비 중 눈 깜빡임은 다음 출력에 포함돼요.';
      if(version==='draft-v08')document.getElementById('export-note').textContent='여덟 번째 초안 · 1080 × 1920. 같은 얼굴을 유지하며 발을 딛고 걸어요. 갑판에 착지한 뒤 앞발로 무게를 받고, 몸을 세운 다음 짐을 정리해요. 보행은 국소 관절, 도약·착지는 개별 원화 방식이에요.';
      if(version==='draft-v09')document.getElementById('export-note').textContent='아홉 번째 초안 · 1080 × 1920. 걷는 중 눈을 자연스럽게 깜빡여요. 얼굴 바탕과 눈을 분리해 색 자국을 없애고, 딛는 발 아래의 작은 그림자와 부드러운 몸 그림자로 바닥 접촉을 맞췄어요. 자세 사이의 털색은 계속 보완 중이에요.';
      if(version==='draft-v10')document.getElementById('export-note').textContent='열 번째 초안 · 1080 × 1920. 30개 파츠의 털·외곽선·동공 색을 기준 고양이에 맞춰 걷기·착지·노 젓기 사이의 붉고 밝은 변화를 줄였어요. 원본 그림·알파·등록점은 유지하며, 소품 재질과 자세 연결은 계속 개선 중이에요.';
      if(version==='draft-v11')document.getElementById('export-note').textContent='열한 번째 초안 · 1080 × 1920. 책을 보는 네 자세에도 털색을 맞췄어요. 뗏목과 같은 나뭇결의 노를 낮은 갑판에서 집고, 천 가방은 책을 넣은 뒤 덮개가 닫혀요. 같은 가방이 걷기와 갑판 정리까지 이어져요. 노의 입수와 앞발의 자세 연결은 계속 개선 중이에요.';
      if(version==='draft-v12')document.getElementById('export-note').textContent='열두 번째 초안 · 1080 × 1920. 바다가 넓은 새 배경과 카메라로 노 전체가 화면 안에 들어와요. 부두의 발·밧줄 위치를 다시 맞췄고, 노가 물에 잠겼다가 얇게 돌아 나와요. 수면의 미세 흐름은 아직 별도 실험이에요.';
      if(version==='draft-v13')document.getElementById('export-note').textContent='열세 번째 초안 · 1080 × 1920. v12의 넓은 해안과 노 동작을 유지하면서 MP4의 색 관리도 맞췄어요. 원화보다 붉고 노랗게 보이던 차이를 줄여 낮은 채도의 바다·모래·종이 색이 이어져요. 출력 당시의 색 표본으로 실제 MP4를 검사해요.';
      if(version==='draft-v16')document.getElementById('export-note').textContent='열여섯 번째 초안 · 1080 × 1920. 같은 얼굴·손 접점을 유지하면서 부두와 노 젓기 장면에서 꼬리가 작게 움직여요. 먼 하늘의 갈매기는 별도 실험으로, 이 MP4에는 없어요.';
      if(version==='draft-v17')document.getElementById('export-note').textContent='열일곱 번째 초안 · 1080 × 1920 · 24fps. 먼 하늘에 작은 갈매기가 활공하고, 노를 당기는 박자에 맞춰 뗏목이 조금씩 전진해요. 수면 반사와 60fps 출력은 별도 시험 중이며 이 9편에는 포함하지 않았어요.';
      if(version==='draft-v15')document.getElementById('export-note').textContent='열다섯 번째 초안 · 1080 × 1920. 덮개를 두 번 접어 갑판 한쪽에 싣고, 부두에서는 같은 얼굴을 유지하며 앞발을 연속으로 움직여요. 꼬리 움직임은 별도 후보로, 이 MP4에는 아직 없어요.';
      if(version==='draft-v14')document.getElementById('export-note').textContent='열네 번째 초안 · 1080 × 1920. 뗏목 가장자리에 작은 물결이 닿고, 물 영역만 잔잔히 움직여요. 노를 당길 때 고양이 상체도 조금 따라가며 발바닥과 손잡이 접점은 유지해요. 덮개를 접는 새 실험은 이 영상에 포함하지 않았어요.';
      if(!batch.videoProfile)document.getElementById('export-note').textContent+=' 색 관리 수정 전 비교본으로, 현재 원화보다 색이 진하게 보일 수 있어요.';
      if(archived)document.getElementById('export-note').textContent+=' 초기 버전 보관본입니다. 원본 MP4를 GitHub에서 내려받아 비교할 수 있어요.';
      grid.innerHTML=batch.films.map(f=>{
        const original='https://github.com/OneOrThree/planning-document/blob/main/'+f.path+'?raw=1';
        const media=archived?`<a class="archive-link" href="${original}"><img src="${f.poster}" alt="${f.title} · ${f.direction} 보관본" width="180" height="320" style="object-fit:cover;border-radius:12px"></a>`:`<video controls playsinline preload="none" poster="${f.poster}" aria-label="${f.title} · ${f.direction}"><source src="${f.path}" type="video/mp4"></video>`;
        return`<article class="export-row">${media}<div><h3>${f.title}</h3><p>${f.direction} · ${f.duration}초 · ${f.fps}fps · ${f.width} × ${f.height}</p><p>${(f.bytes/1048576).toFixed(1)} MB · 무음 초안${archived?' · GitHub 보관본':''}</p><a href="${archived?original:f.path}" ${archived?'':'download'}>${archived?'GitHub에서 원본 MP4 내려받기':'MP4 내려받기'}</a></div></article>`;
      }).join('');
      grid.querySelectorAll('video').forEach(video=>video.addEventListener('play',()=>{pause();grid.querySelectorAll('video').forEach(other=>{if(other!==video)other.pause();});}));
    }catch(e){if(request===exportRequest)document.getElementById('export-note').textContent=e.message;}
  }
  document.getElementById('export-version').addEventListener('change',e=>loadExports(e.target.value));loadExports(versions[0]);
})();
