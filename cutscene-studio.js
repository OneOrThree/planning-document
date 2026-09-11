(() => {
  const canvas=document.getElementById('film'),seek=document.getElementById('seek'),play=document.getElementById('play');
  const query=new URLSearchParams(location.search);let id=Math.max(0,CutsceneProduction.films.findIndex(x=>x.id===query.get('film'))),time=0,playing=false,previous=0;
  if(['sprite','poses','rig'].includes(query.get('actor')))CutsceneProduction.films.forEach(f=>{f.tuning.actorMode=query.get('actor');});
  if(['rig','pose'].includes(query.get('paddle')))CutsceneProduction.films.forEach(f=>{f.tuning.paddleRig=query.get('paddle')==='rig';});
  if(['rig','pose'].includes(query.get('walk')))CutsceneProduction.films.forEach(f=>{f.tuning.walkRig=query.get('walk')==='rig';});
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
      if(version==='draft-v08')document.getElementById('export-note').textContent='여덟 번째 초안 · 1080 × 1920. 같은 얼굴을 유지하며 발을 딛고 걸어요. 갑판에 착지한 뒤 앞발로 무게를 받고, 몸을 세운 다음 짐을 정리해요. 보행은 국소 관절, 도약·착지는 개별 원화 방식이에요.';
      if(archived)document.getElementById('export-note').textContent+=' 초기 버전 보관본입니다. 원본 MP4를 GitHub에서 내려받아 비교할 수 있어요.';
      grid.innerHTML=batch.films.map(f=>{
        const original='https://github.com/OneOrThree/planning-document/blob/main/'+f.path+'?raw=1';
        const media=archived?`<a class="archive-link" href="${original}"><img src="${f.poster}" alt="${f.title} · ${f.direction} 보관본" width="180" height="320" style="object-fit:cover;border-radius:12px"></a>`:`<video controls playsinline preload="none" poster="${f.poster}" aria-label="${f.title} · ${f.direction}"><source src="${f.path}" type="video/mp4"></video>`;
        return`<article class="export-row">${media}<div><h3>${f.title}</h3><p>${f.direction} · ${f.duration}초 · ${f.width} × ${f.height}</p><p>${(f.bytes/1048576).toFixed(1)} MB · 무음 초안${archived?' · GitHub 보관본':''}</p><a href="${archived?original:f.path}" ${archived?'':'download'}>${archived?'GitHub에서 원본 MP4 내려받기':'MP4 내려받기'}</a></div></article>`;
      }).join('');
      grid.querySelectorAll('video').forEach(video=>video.addEventListener('play',()=>{pause();grid.querySelectorAll('video').forEach(other=>{if(other!==video)other.pause();});}));
    }catch(e){if(request===exportRequest)document.getElementById('export-note').textContent=e.message;}
  }
  document.getElementById('export-version').addEventListener('change',e=>loadExports(e.target.value));loadExports(versions[0]);
})();
