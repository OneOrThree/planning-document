(() => {
  'use strict';
  const $=s=>document.querySelector(s);
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const characters=[{id:'momo',label:'모모'},...['puppy','capybara','red-panda'].map(id=>({id,profile:window.GachisupWalkProfiles?.[id],label:$(`[data-walk-character="${id}"] span`).textContent}))];
  let rig=null,selected=null,joints=[];
  const controls='.playback button,.playback input,.playback select,.walk-clips button,.direction-controls button,#walk-joints input,#walk-bones,#walk-reset,#export-walk';
  function selectCharacter(id,updateUrl=true){
    const next=characters.find(c=>c.id===id&&(c.id==='momo'||c.profile))||characters[0];
    rig?.destroy();selected=next;rig=GachisupWalkRig.create($('#walk-mount'),{preview:true,resolution:1254,profile:next.profile});
    rig.setWalking(true);rig.paused=reduced.matches;
    joints=next.profile?.controls||['pelvis','armL','thighL','shinL','tail'];
    $('#walk-joints').innerHTML=joints.map(key=>{const [,label,limit]=rig.hierarchy[key];return `<label class="joint-control" for="walk-joint-${key}">${label}<output id="walk-output-${key}">자동</output><input id="walk-joint-${key}" data-walk-joint="${key}" type="range" min="${-limit}" max="${limit}" step=".1" value="0"></label>`;}).join('');
    $('.stage-heading h1').textContent='산책하는 '+next.label;$('.asset-tag').textContent='앞·뒤 원화 · '+rig.names.length+'관절';
    $('.inspector>.eyebrow').textContent='같은 '+next.label+', 새로운 하루';
    $('.rig-info p').textContent=next.profile?.note||'20개 관절과 4,608개 삼각형으로 원화를 변형합니다. 발을 들 때 무릎이 접히고, 팔과 꼬리는 반대 박자로 따라와요.';
    $('.bone-tree').textContent=rig.names.map(key=>rig.hierarchy[key][1]).join(' · ');
    $('[data-walk-clip=walk] small').textContent=rig.hierarchy.tail?'양발 · 팔 · 몸통 · 꼬리':'양발 · 팔 · 몸통 · 귀';
    $('#walk-character-select').value=next.id;
    document.querySelectorAll('#walk-character-options [data-walk-character]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.walkCharacter===next.id));
    document.querySelectorAll('[data-direction]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.direction==='sw'));
    document.querySelectorAll('[data-walk-clip]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.walkClip==='walk'));
    $('#walk-bones').setAttribute('aria-pressed','false');$('#walk-speed').value='100';$('#walk-cycle').value='0';$('#cycle-output').textContent='0%';
    $('.motion-nav a[href^="rig.html"]').href='rig.html?character='+next.id;
    $('.walk-island-link').href=next.id==='momo'?'./?walk=1':'./';$('.walk-island-link').textContent=next.id==='momo'?'섬에서 직접 걸어보기 →':'마을로 돌아가기 →';
    $('.implementation-note').textContent='2D 원화 메시 리그입니다. 앞·뒤 두 원화와 좌우 반전으로 네 방향을 표현합니다. 3D 회전이나 Spine·Rive 파일은 아닙니다.'+(next.id==='momo'?'':' 새 친구는 이 작업실에서 비교하며 섬의 모모는 그대로 유지됩니다.');
    $('#walk-status').textContent=reduced.matches?'동작 줄이기 설정 · 재생 버튼으로 시작':'가벼운 발걸음으로 걸어요';
    if(updateUrl){const url=new URL(location.href);url.searchParams.set('character',next.id);history.replaceState(null,'',url);}
    playback();document.querySelectorAll(controls).forEach(e=>e.disabled=true);const current=rig;
    rig.ready.then(()=>{if(rig!==current)return;document.querySelectorAll(controls).forEach(e=>e.disabled=!!rig.error);if(rig.error)$('#walk-status').textContent=rig.error;});
  }
  for(const c of characters){const b=$(`[data-walk-character="${c.id}"]`),available=c.id==='momo'||!!c.profile,option=$('#walk-character-select').querySelector(`[value="${c.id}"]`);b.disabled=option.disabled=!available;if(c.profile){b.querySelector('img').src=c.profile.views.front.src;b.querySelector('small').textContent=Object.keys(c.profile.hierarchy).length+'관절 리깅';option.textContent=c.label;}}
  $('#walk-character-options').onclick=e=>{const b=e.target.closest('[data-walk-character]');if(b&&!b.disabled)selectCharacter(b.dataset.walkCharacter);};
  $('#walk-character-select').onchange=e=>selectCharacter(e.target.value);
  function playback(){$('#walk-play').textContent=rig.paused?'▶':'Ⅱ';$('#walk-play').setAttribute('aria-label',rig.paused?'걷기 재생':'걷기 일시정지');}
  $('#walk-play').onclick=()=>{if(rig.paused)rig.play();else rig.paused=true;playback();};
  $('#walk-cycle').oninput=e=>{rig.paused=true;rig.seek(e.target.value);playback();};
  $('#walk-speed').onchange=e=>rig.speed=Number(e.target.value);
  $('#walk-bones').onclick=e=>{const on=!rig.debug;rig.setDebug(on);e.currentTarget.setAttribute('aria-pressed',on);};
  document.querySelectorAll('[data-direction]').forEach(button=>button.onclick=()=>{rig.setDirection(button.dataset.direction);document.querySelectorAll('[data-direction]').forEach(b=>b.setAttribute('aria-pressed',b===button));});
  document.querySelectorAll('[data-walk-clip]').forEach(button=>button.onclick=()=>{rig.setWalking(button.dataset.walkClip==='walk');rig.play();playback();document.querySelectorAll('[data-walk-clip]').forEach(b=>b.setAttribute('aria-pressed',b===button));$('#walk-status').textContent=rig.walking?'가벼운 발걸음으로 걸어요':'잠깐, 바람을 느끼는 중';});
  $('#walk-joints').oninput=e=>{const key=e.target.dataset.walkJoint;if(!key)return;rig.setBone(key,e.target.value);$('#walk-output-'+key).textContent=e.target.value+'°';};
  $('#walk-reset').onclick=()=>{rig.overrides={};rig.render();for(const key of joints){$('#walk-joint-'+key).value=0;$('#walk-output-'+key).textContent='자동';}};
  $('#export-walk').onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(rig.exportRig())],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=selected.id+'-walk-rig.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);};
  const timer=setInterval(()=>{if(!rig)return;$('#walk-cycle').value=(rig.distance/rig.stride)%1;$('#cycle-output').textContent=Math.round((rig.distance/rig.stride)%1*100)+'%';$('#left-contact').dataset.grounded=!(rig.footLift?.L>3);$('#right-contact').dataset.grounded=!(rig.footLift?.R>3);},60);
  selectCharacter(new URLSearchParams(location.search).get('character')||'momo',false);
  addEventListener('pagehide',event=>{if(!event.persisted){clearInterval(timer);rig.destroy();}});
})();
