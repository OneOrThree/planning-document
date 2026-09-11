(() => {
  'use strict';
  const $=s=>document.querySelector(s),mount=$('#character-mount');
  let rig=null,selected=null;
  const fullJoints=[['head','고개',4],['earR','오른쪽 귀',6],['book','책을 든 각도',4],['armR','오른쪽 앞발',5],['tail','꼬리',8]];
  let joints=fullJoints;
  $('#joint-controls').innerHTML=joints.map(([key,label,limit])=>`<label class="joint-control" for="joint-${key}">${label}<output id="output-${key}">자동</output><input type="range" id="joint-${key}" data-joint="${key}" min="${-limit}" max="${limit}" value="0" step="0.1"></label>`).join('');
  function resetControls(){for(const [key] of joints){$(`#joint-${key}`).value=0;$(`#output-${key}`).textContent='자동';}}
  function playState(){$('#play-toggle').textContent=!rig||rig.paused?'▶':'Ⅱ';$('#play-toggle').setAttribute('aria-label',!rig||rig.paused?'애니메이션 재생':'애니메이션 일시정지');}
  function compare(on){mount.classList.toggle('compare-original',on);$('#reference-toggle').setAttribute('aria-pressed',on);$('#reference-toggle').textContent=on?'리깅으로 돌아가기':(selected?.id==='momo'?'승인 원화와 비교':'원화와 비교');}
  $('#reference-toggle').onclick=()=>compare(!mount.classList.contains('compare-original'));
  $('#joint-controls').addEventListener('input',e=>{const key=e.target.dataset.joint;if(!key)return;compare(false);rig.setBone(key,e.target.value);$(`#output-${key}`).textContent=e.target.value+'°';});
  $('#reset-pose').onclick=()=>{rig.overrides={};rig.render();resetControls();};
  $('#bones-toggle').onclick=e=>{compare(false);const on=e.currentTarget.getAttribute('aria-pressed')!=='true';rig.setDebug(on);e.currentTarget.setAttribute('aria-pressed',on);};
  $('#play-toggle').onclick=()=>{compare(false);if(rig.paused)rig.play();else rig.paused=true;playState();};
  $('#timeline').oninput=e=>{compare(false);rig.paused=true;rig.seek(e.target.value);playState();};
  $('#speed').onchange=e=>rig.speed=Number(e.target.value);
  $('#blink').onclick=()=>{compare(false);rig.play();rig.blink();playState();};
  $('#turn-page').onclick=()=>{compare(false);if(rig.clip!=='read')chooseClip('read');rig.play();rig.turnPage();playState();};
  function chooseClip(clip){compare(false);rig.setClip(clip);rig.play();resetControls();playState();document.querySelectorAll('[data-clip]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.clip===clip));$('#stage-status').textContent={read:'책을 읽고 있어요',idle:'잠깐, 생각을 정리하는 중',nod:'응, 듣고 있어요'}[clip];}
  document.querySelectorAll('[data-clip]').forEach(b=>b.onclick=()=>chooseClip(b.dataset.clip));
  function download(name,body,type){const url=URL.createObjectURL(body instanceof Blob?body:new Blob([body],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);}
  $('#export-png').onclick=async()=>{const button=$('#export-png'),character=selected,current=rig;button.disabled=true;try{const blob=current?await current.snapshot():await fetch(character.source).then(r=>{if(!r.ok)throw new Error('원화를 불러오지 못했어요.');return r.blob();});if(!blob)throw new Error('PNG 저장에 실패했어요.');download(character.id+(current?'-pose.png':'-concept.png'),blob,'image/png');}catch(error){if(selected===character)$('#stage-status').textContent=error.message;}finally{if(selected===character)button.disabled=false;}};
  $('#export-rig').onclick=()=>download(selected.id+'-rig.json',JSON.stringify(rig.exportRig()),'application/json');
  const interval=setInterval(()=>{if(!rig)return;$('#timeline').value=rig.time%12;$('#time-output').textContent=(rig.time%12).toFixed(2)+'초';},80);

  // 목록은 HTML에 남겨 원화가 스크립트 초기화와 무관하게 보이도록 한다.
  const characters=Array.from(document.querySelectorAll('#character-options [data-character]'),button=>({
    id:button.dataset.character,label:button.querySelector('span').textContent,
    source:button.querySelector('img').getAttribute('src'),reference:button.dataset.reference,mode:button.dataset.mode
  }));
  for(const character of characters){const profile=window.GachisupReadingProfiles?.[character.id];if(!profile)continue;character.profile=profile;character.source=profile.source;character.mode='species';const button=$(`[data-character="${character.id}"]`);button.querySelector('img').src=profile.source;button.querySelector('small').textContent=Object.keys(profile.bones).length+'관절 리깅';}
  const intros={full:'눈을 깜빡이고, 조용히 숨을 쉬어요. 승인한 원화에 작은 움직임을 연결했습니다.',basic:'호흡과 고개 움직임을 먼저 연결했어요. 눈 깜빡임과 책장 넘기기는 전용 원화를 준비한 뒤 추가할 예정이에요.',species:'투명 원화에 이 친구만의 관절을 연결했어요. 책 읽기·잠깐 쉬기·고개 끄덕을 눌러 움직임을 비교해 보세요.',concept:'체크무늬가 이미지에 포함된 원화 시안이에요. 지금은 외형을 비교할 수 있으며, 움직임은 아직 연결하지 않았어요.'};
  function controls(enabled){
    document.querySelectorAll('.playback button,.playback input,.playback select,.clip-options button,.action-pair button,#joint-controls input,#bones-toggle,#reset-pose,#reference-toggle,#export-rig').forEach(e=>e.disabled=!enabled);
    if(enabled){$('#blink').disabled=!rig.capabilities.blink;$('#turn-page').disabled=!rig.capabilities.pageTurn;$('[data-clip=read]').disabled=rig.basic;}
  }
  function selectCharacter(id,updateUrl=true){
    const next=characters.find(c=>c.id===id)||characters[0];if(rig)rig.destroy();rig=null;selected=next;
    mount.replaceChildren();mount.classList.remove('show-bones','compare-original');mount.removeAttribute('title');mount.dataset.character=next.id;delete mount.dataset.rigTime;delete mount.dataset.blink;
    $('#character-title').textContent='책 읽는 '+next.label;$('#asset-tag').textContent=next.profile?'투명 원화 · '+Object.keys(next.profile.bones).length+'관절':{full:'승인 원화 · 12관절',basic:'투명 원화 · 기본 3관절',concept:'원화 시안'}[next.mode];
    $('#character-note').textContent=intros[next.mode];$('.intro').textContent=intros[next.mode];$('.inspector h2').textContent=next.mode==='concept'?next.label+' 원화 살펴보기':'조금씩 살아나는 '+next.label;
    document.querySelectorAll('#character-options [data-character]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.character===next.id));
    $('#character-select').value=next.id;
    $('.motion-nav a[href^="walk.html"]').href=['momo','puppy','capybara','red-panda'].includes(next.id)?'walk.html?character='+next.id:'walk.html';
    $('#bones-toggle').setAttribute('aria-pressed','false');$('#timeline').value=0;$('#time-output').textContent='0.00초';$('#speed').value='1';compare(false);
    joints=next.profile?next.profile.controls.filter(key=>next.profile.bones[key]).map(key=>[key,next.profile.bones[key].label,next.profile.bones[key].limit]):next.mode==='full'?fullJoints:next.mode==='basic'?[['head','고개',2],['body','몸통',2]]:[];
    $('#joint-controls').innerHTML=joints.map(([key,label,limit])=>`<label class="joint-control" for="joint-${key}">${label}<output id="output-${key}">자동</output><input type="range" id="joint-${key}" data-joint="${key}" min="${-limit}" max="${limit}" value="0" step="0.1"></label>`).join('');
    $('.rig-info h3').textContent=next.profile?next.label+'에게 맞춘 '+Object.keys(next.profile.bones).length+'개 관절':{full:'원화에 연결된 12개 관절',basic:'호흡과 고개를 잇는 3개 관절',concept:'움직임을 연결하기 전 원화'}[next.mode];
    $('.rig-info p').textContent=next.profile?(next.profile.note||'이 원화의 머리·귀·책·앞발 위치에 맞춰 관절과 가중치를 따로 잡았습니다. 작은 움직임 안에서 원화의 형태를 유지해요.'):{full:'3,200개 삼각형으로 이루어진 메시가 관절을 따라 움직입니다. 작은 각도 안에서 볼·책·앞발의 형태를 유지해요.',basic:'3,200개 삼각형 메시로 작은 호흡과 고개 움직임을 미리 봅니다. 귀·앞발·꼬리 개별 조작은 아직 지원하지 않아요.',concept:'배경의 체크무늬까지 포함된 이미지입니다. 투명 배경 추출과 전용 관절 작업이 필요해요.'}[next.mode];
    if(next.profile){$('.bone-tree').textContent=Object.values(next.profile.bones).map(bone=>bone.label).join(' · ');}else{$('.bone-tree').innerHTML={full:'몸통 → 머리 → 양쪽 귀<br><span>　└ 책 → 앞발 → 손목</span><br>기준 → 꼬리 → 꼬리 끝',basic:'기준 → 몸통 → 고개',concept:'원화 크기 · 1,254 × 1,254'}[next.mode];}
    $('#export-png').textContent=next.mode==='concept'?'원화 PNG 받기 ↓':'지금 포즈 PNG 받기 ↓';$('#export-png').disabled=false;
    $('.implementation-note').textContent=next.mode==='concept'?'원화 파일을 그대로 받을 수 있어요. 이 시안에는 아직 리그 데이터가 없습니다.':'원화 기반 WebGL 메시 리그입니다. 진짜 벡터나 Spine·Rive 전용 파일은 아닙니다. 원화와 관절·가중치 데이터를 함께 재사용할 수 있어요.';
    $('[data-clip=idle] small').textContent=next.profile?(next.profile.bones.tail?'귀 · 꼬리 · 호흡':'귀 · 고개 · 호흡'):next.mode==='full'?'귀 · 꼬리 · 호흡':'작은 호흡';
    if(updateUrl){const url=new URL(location.href);url.searchParams.set('character',next.id);history.replaceState(null,'',url);}
    if(next.mode==='concept'){
      mount.dataset.rigState='concept';const image=new Image();image.src=next.source;image.alt='책 읽는 '+next.label+' 원화 시안, 체크무늬 배경 포함';image.className='concept-reference';mount.append(image);
      controls(false);$('#stage-status').textContent='외형 비교용 원화 시안';document.querySelectorAll('[data-clip]').forEach(b=>b.setAttribute('aria-pressed','false'));playState();return;
    }
    const full=next.mode==='full'||next.mode==='species';
    rig=GachisupCatRig.create(mount,{resolution:1254,source:next.source,profile:next.profile,basic:!full,name:next.profile?next.id+'-reading-rig':next.id==='momo'?'momo-approved-reading-cat':'golden-retriever-reading-preview',label:'책을 읽는 '+next.label,clip:full?'read':'idle'});
    const reference=new Image();reference.src=next.reference||next.source;reference.alt=next.label+' 원화';reference.className='approved-reference';mount.append(reference);
    controls(true);document.querySelectorAll('[data-clip]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.clip===rig.clip));$('#stage-status').textContent=full?'책을 읽고 있어요':'조용히 숨을 쉬어요';playState();
    const current=rig;rig.ready.then(()=>{if(rig!==current)return;if(current.error){$('#stage-status').textContent=current.error;controls(false);$('#export-png').disabled=true;}});
    if(matchMedia('(prefers-reduced-motion: reduce)').matches)$('#stage-status').textContent='동작 줄이기 설정 · 재생 버튼으로 시작';
  }
  $('#character-options').onclick=e=>{const button=e.target.closest('[data-character]');if(button)selectCharacter(button.dataset.character);};
  $('#character-select').onchange=e=>selectCharacter(e.target.value);
  selectCharacter(new URLSearchParams(location.search).get('character')||'momo',false);

  addEventListener('pagehide',event=>{if(!event.persisted){clearInterval(interval);rig?.destroy();}});
})();
