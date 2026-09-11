(() => {
  const canvas=document.getElementById('film'),seek=document.getElementById('seek'),play=document.getElementById('play');
  const query=new URLSearchParams(location.search);let id=Math.max(0,CutsceneProduction.films.findIndex(x=>x.id===query.get('film'))),time=0,playing=false,previous=0;
  const choices=document.getElementById('choices');
  function reviews(f){return CutsceneReviewLog.filter(r=>r.scope==='all-nine'||r.films?.includes(f.id));}
  CutsceneProduction.films.forEach(f=>{f.reviewCompleted=reviews(f).length;});
  choices.innerHTML=CutsceneProduction.films.map((o,i)=>`<button class="choice" data-index="${i}" aria-pressed="false"><strong>${String(i+1).padStart(2,'0')} · ${o.title}</strong><span>${o.directionTitle} · 검토 ${o.reviewCompleted} / ${o.reviewTarget}</span></button>`).join('');
  function updateChoice(){
    choices.querySelectorAll('button').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===id)));
    const f=CutsceneProduction.films[id];document.getElementById('logline').textContent=f.description;document.getElementById('together').textContent=GachisupPrologues[f.storyIndex].together;
    document.getElementById('review-status').textContent=`현재 기록 ${f.reviewCompleted} / ${f.reviewTarget}회 · 장면별 정지 프레임 검토 포함. 전체 연속 동작 검증과 구분합니다.`;
    document.getElementById('review-list').innerHTML=reviews(f).sort((a,b)=>b.round-a.round).map(r=>`<details><summary>${String(r.round).padStart(2,'0')} · ${r.focus}</summary><p>${r.finding}</p><p>${r.change}</p><p>${r.verification}</p><a href="${r.evidence}">해당 버전 검토 근거</a></details>`).join('');
  }
  function draw(){GachisupCinema.render(canvas,id,time);seek.value=time;document.getElementById('time').textContent=time.toFixed(1)+' / 24초';}
  function pause(){playing=false;play.textContent='재생';}
  choices.addEventListener('click',e=>{const button=e.target.closest('[data-index]');if(!button)return;id=Number(button.dataset.index);time=0;pause();query.set('film',CutsceneProduction.films[id].id);history.replaceState(null,'','?'+query);updateChoice();if(window.cutsceneReady)draw();});
  play.addEventListener('click',()=>{if(playing){pause();return;}if(time>=24)time=0;playing=true;previous=performance.now();play.textContent='일시 정지';requestAnimationFrame(tick);});
  seek.addEventListener('input',()=>{pause();time=Number(seek.value);if(window.cutsceneReady)draw();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
  function tick(now){if(!playing)return;time=Math.min(24,time+(now-previous)/1000);previous=now;draw();if(time===24){pause();return;}requestAnimationFrame(tick);}
  updateChoice();GachisupCinema.ready.then(()=>{window.cutsceneReady=true;play.disabled=false;draw();}).catch(e=>{const box=document.getElementById('error');box.hidden=false;box.textContent=e.message;});
  const section=document.getElementById('exports'),versions=['draft-v02','draft-v01'];let exportRequest=0;
  section.hidden=false;section.innerHTML='<h2>내려받아 보는 MP4 초안</h2><p>고정 시점의 영상입니다. 위 실시간 연출에는 출력 이후의 수정이 먼저 반영됩니다. 출력 횟수는 검토 완료 횟수가 아니에요.</p><label for="export-version">출력 버전 </label><select id="export-version">'+versions.map(v=>`<option value="${v}">${v}</option>`).join('')+'</select><p id="export-note" role="status"></p><div id="export-grid"></div>';
  async function loadExports(version){
    const request=++exportRequest,grid=document.getElementById('export-grid');grid.querySelectorAll('video').forEach(v=>v.pause());grid.innerHTML='';
    try{
      const r=await fetch('output/cutscenes/videos/'+version+'/manifest.json');if(!r.ok)throw Error('영상 목록을 불러오지 못했어요.');const batch=await r.json();if(request!==exportRequest)return;
      window.cutsceneExportBatch=batch;
      document.getElementById('export-note').textContent=version==='draft-v02'?'두 번째 초안 · 1080 × 1920. 이 출력 이후 고친 노 잡기·출항 경로는 위 실시간 연출에서 먼저 볼 수 있어요.':'첫 번째 초안 · 720 × 1280. 초기 상태 비교용으로 보존했어요.';
      grid.innerHTML=batch.films.map(f=>`<article class="export-row"><video controls playsinline preload="none" poster="${f.poster}" aria-label="${f.title} · ${f.direction}"><source src="${f.path}" type="video/mp4"></video><div><h3>${f.title}</h3><p>${f.direction} · ${f.duration}초 · ${f.width} × ${f.height}</p><p>${(f.bytes/1048576).toFixed(1)} MB · 무음 초안</p><a href="${f.path}" download>MP4 내려받기</a></div></article>`).join('');
      grid.querySelectorAll('video').forEach(video=>video.addEventListener('play',()=>{pause();grid.querySelectorAll('video').forEach(other=>{if(other!==video)other.pause();});}));
    }catch(e){if(request===exportRequest)document.getElementById('export-note').textContent=e.message;}
  }
  document.getElementById('export-version').addEventListener('change',e=>loadExports(e.target.value));loadExports(versions[0]);
})();
