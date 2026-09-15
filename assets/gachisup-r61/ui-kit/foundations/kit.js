/* UI kit의 상태만 시연한다. 네트워크 요청이나 실제 저장·발송은 없다. */
(() => {
  'use strict';
  const html = document.documentElement;
  const dialog = document.querySelector('.demo-dialog');
  const content = dialog.querySelector('.dialog-content');
  const title = dialog.querySelector('#live-dialog-title');
  const toast = document.querySelector('.toast');
  let toastTimer, returnFocus, selectedGarment = 0;
  const icon = (name) => ({check:'<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>',close:'<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>'})[name] || '';
  const notify = message => {
    clearTimeout(toastTimer); toast.textContent = message; toast.classList.add('show');
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3600);
  };
  const close = () => { if (dialog.open) dialog.close(); };
  dialog.addEventListener('keydown', event => {
    if(event.key!=='Tab')return;
    const nodes=[...dialog.querySelectorAll('button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),a[href],[tabindex="0"]')].filter(el=>el.getClientRects().length&&!el.hidden);
    if(!nodes.length){event.preventDefault();return;}
    const first=nodes[0],last=nodes[nodes.length-1];
    if(event.shiftKey&&(document.activeElement===first||document.activeElement===dialog)){event.preventDefault();last.focus();}
    else if(!event.shiftKey&&(document.activeElement===last||document.activeElement===dialog)){event.preventDefault();first.focus();}
  });
  dialog.addEventListener('close', () => { dialog.classList.remove('sheet-dialog'); returnFocus?.focus(); });
  dialog.addEventListener('click', event => { if (event.target === dialog) { const r=dialog.getBoundingClientRect(); if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom) close(); } });
  function open(titleText, body, sheet=false) {
    if(!dialog.open) returnFocus = document.activeElement; title.textContent = titleText;
    content.innerHTML = (body.includes('data-action="dismiss"')?'':`<div class="dialog-close"><button class="btn ghost icon-btn" data-action="dismiss" aria-label="닫기">${icon('close')}</button></div>`)+body;
    // 같은 표본을 열어도 입력 ID가 본문의 입력과 겹치지 않게 한다.
    const ids = new Map(); content.querySelectorAll('[id]').forEach(el => { const id = el.id; el.id='dialog-'+id; ids.set(id,el.id); });
    content.querySelectorAll('[for],[aria-describedby]').forEach(el => {
      for (const attr of ['for','aria-describedby']) if(el.hasAttribute(attr)) el.setAttribute(attr,el.getAttribute(attr).split(' ').map(id=>ids.get(id)||id).join(' '));
    });
    dialog.classList.toggle('sheet-dialog',sheet);
    if(!dialog.open) dialog.showModal();
  }
  function openTemplate(key, label, index=null, sheet=true) {
    const template=document.querySelector('#tpl-'+key);
    const fragment=template.content.cloneNode(true);
    const target=index===null?null:fragment.querySelectorAll('.specimen-body')[index];
    const wrapper=document.createElement('div');wrapper.append(fragment);
    const body=target?target.innerHTML:wrapper.innerHTML;
    open(label,body,sheet);
  }
  function confirm(kind='focus') {
    const data={focus:['집중을 마칠까요?','지금까지 쌓은 시간은 기록에 남아요.<br>잠깐 쉬었다가 다시 만나도 괜찮아요.','기록 남기기','primary'],danger:['방장을 위임할까요?','수아님에게 모임 관리 권한을 넘깁니다.<br>위임한 뒤에는 방장 설정을 바꿀 수 없어요.','위임하기','danger'],leave:['모임을 나갈까요?','이 모임에서 나가는 선택을 확인해요.<br>이 화면에서는 실제 소속이 변경되지 않아요.','나가기','danger']}[kind];
    open(data[0],`<div class="confirm-body"><h3 class="display">${data[0]}</h3><p>${data[1]}</p><div class="row gap"><button class="btn secondary" data-action="dismiss">취소</button><button class="btn ${data[3]}" data-action="confirm">${data[2]}</button></div></div>`);
  }
  document.addEventListener('click', event => {
    const button=event.target.closest('button');if(!button||button.disabled)return;
    const group=button.closest('.choice-group');
    if(group&&button.hasAttribute('aria-pressed')) {
      group.querySelectorAll('button[aria-pressed]').forEach(el=>el.setAttribute('aria-pressed',String(el===button)));
      
      const match=button.textContent.trim().match(/^(\d+)분$/);
      if(match) { const input=button.closest('.sheet')?.querySelector('input[type=number]');if(input)input.value=match[1]; }
    }
    if(button.matches('[role=switch]')) {
      const checked=button.getAttribute('aria-checked')!=='true';button.setAttribute('aria-checked',String(checked));button.closest('.toggle-row').querySelector('small').textContent=checked?'켜짐':'꺼짐';
    }
    if(button.dataset.pose) {
      const root=button.closest('.specimen-body,.dialog-content');const sprite=root.querySelector('.wardrobe-preview .sprite');
      sprite.classList.remove('pose-idle','pose-read','pose-music');sprite.classList.add('pose-'+button.dataset.pose);
      root.querySelector('.wardrobe-preview>span:last-child').textContent=(sprite.classList.contains('cat-scarf')?'바다 바람 스카프':'기본 모습')+' · '+button.textContent;
    }
    if(button.dataset.garment) {
      selectedGarment=Number(button.dataset.garment);
      const root=button.closest('.specimen-body');
      const names=['바다 바람 스카프','숲지기 니트 조끼','노을빛 망토'];
      root.querySelector('[data-action=buy]').textContent=names[selectedGarment]+' 구매';
      const preview=root.querySelector('.outfit-preview');
      preview.querySelector('.avatar').hidden=selectedGarment!==0;
      let garment=preview.querySelector('.selected-garment');
      if(!garment){garment=document.createElement('span');preview.prepend(garment);}
      garment.className='selected-garment garment-art garment-'+selectedGarment;
      garment.hidden=selectedGarment===0;
      garment.style.cssText='width:128px;height:170px;margin:0;';
      preview.querySelector('span:last-child').textContent=selectedGarment===0?'입어보기 · 구매 전':'상품 보기 · '+names[selectedGarment];
    }
    const action=button.dataset.action;
    if(!action)return;
    if(action==='theme') {
      const night=html.dataset.theme!=='night';html.dataset.theme=night?'night':'day';button.setAttribute('aria-pressed',String(night));button.setAttribute('aria-label',night?'낮 테마로 전환':'밤 테마로 전환');button.querySelector('span').textContent=night?'낮으로':'밤으로';
    } else if(action==='dismiss') { if(dialog.open)close(); else notify('닫힘 상태 표본이에요. 전체 페이지에는 표본을 남겨둡니다.'); }
    else if(action==='confirm') { close();notify('확인한 뒤의 상태예요. 실제 데이터는 변경하지 않았어요.'); }
    else if(action==='open-confirm') confirm();
    else if(action==='open-danger') confirm('danger');
    else if(action==='open-leave') confirm('leave');
    else if(action==='open-focus') openTemplate('focus','집중 준비');
    else if(action==='open-sound') openTemplate('sound','소리 조절',1);
    else if(action==='open-places') openTemplate('places','섬 홈');
    else if(action==='wardrobe') openTemplate('wardrobe','내 배 · 보유품');
    else if(action==='write') {
      openTemplate('write','공지 작성');

    } else if(action==='start-focus') {
      const root=button.closest('.sheet'),input=root.querySelector('input[type=number]'),minutes=Number(input.value),hint=root.querySelector('.minute-input+small');
      if(!Number.isInteger(minutes)||minutes<1||!Number.isSafeInteger(minutes)){input.setAttribute('aria-invalid','true');hint.textContent='1 이상의 분 단위 정수로 입력해 주세요.';hint.style.color='var(--danger)';input.focus();return;}
      input.removeAttribute('aria-invalid');close();notify(`${minutes}분 낚시 집중을 시작하는 UI 예시예요.`);
    } else if(action==='shared-track') {
      const name=button.textContent.trim();button.closest('.sheet').querySelector('.shared-track-status').textContent='우리 섬 재생 중 · '+name;notify('우리 섬 공동 음원을 '+name+'로 바꾼 UI 예시예요.');
    } else if(action==='decrease'||action==='increase') {
      const root=button.closest('.stepper'),output=root.querySelector('output');const value=Math.min(180,Math.max(5,Number(output.dataset.value)+(action==='increase'?5:-5)));output.dataset.value=value;output.textContent=value+'분';root.querySelector('[data-action=decrease]').disabled=value===5;root.querySelector('[data-action=increase]').disabled=value===180;
    } else if(action==='pause-focus') {
      const paused=button.getAttribute('aria-pressed')!=='true';button.setAttribute('aria-pressed',String(paused));button.innerHTML=(paused?'이어가기':'일시정지');button.closest('.focus-controls').querySelector('.display').textContent=paused?'잠시 쉬어 가는 중이에요.':'잠깐, 이 시간에 머물러요.';
    } else if(action==='calendar') {
      button.closest('.calendar-grid').querySelectorAll('button').forEach(el=>el.setAttribute('aria-pressed',String(el===button)));
      button.closest('.specimen-body').querySelector('.calendar-detail').textContent=`9월 ${button.dataset.day}일 · ${button.classList.contains('has-record')?'배 위 낚시 집중 25분':'아직 남긴 기록이 없어요.'}`;
    } else if(action==='location') { close();notify(`${button.dataset.place}을 선택했어요. 장소 선택 상태 표본이에요.`); }
    else if(action==='island') {
      const island=button.dataset.island;
      document.querySelectorAll('.destination-title').forEach(el=>el.textContent=island);notify(island+'을 골랐어요.');
    } else if(action==='sail') { notify('출발을 확인한 모습이에요. 실제 섬 이동은 하지 않아요.'); }
    else if(action==='buy') {
      const name=['바다 바람 스카프','숲지기 니트 조끼','노을빛 망토'][selectedGarment];
      open('구매 확인',`<div class="confirm-body"><h3 class="display">${name}를 살까요?</h3><p>${[60,90,120][selectedGarment]} 물고기를 사용하는 시연이에요.<br>실제 결제나 잔액 변경은 하지 않아요.</p><div class="row gap"><button class="btn secondary" data-action="dismiss">취소</button><button class="btn primary" data-action="purchase-confirm">시연 구매</button></div></div>`);
    } else if(action==='purchase-confirm') { close();notify('구매 완료 상태를 확인했어요.'); }
    else if(action==='equip'||action==='unequip') {
      const root=button.closest('.specimen-body,.dialog-content'),sprite=root.querySelector('.wardrobe-preview .sprite');
      sprite.classList.toggle('cat-scarf',action==='equip');sprite.classList.toggle('cat-base',action==='unequip');
      const pose=sprite.classList.contains('pose-read')?'독서':sprite.classList.contains('pose-music')?'연주':'가만히';root.querySelector('.wardrobe-preview>span:last-child').textContent=(action==='equip'?'바다 바람 스카프':'기본 모습')+' · '+pose;notify(action==='equip'?'스카프를 입은 모습이에요.':'기본 모습으로 돌아왔어요.');
    } else if(action==='send-mail') {
      location.href='../../../components/05-mail/index.html';
    } else if(action==='comment') {
      open('댓글 남기기','<form class="comment-form"><label class="field-label" for="comment-content">댓글</label><textarea class="input" id="comment-content" rows="3" required placeholder="함께하는 사람들에게 한마디"></textarea><div class="field-gap"></div><div class="row gap"><button class="btn secondary" type="button" data-action="dismiss">취소</button><button class="btn primary" type="submit">댓글 남기기</button></div></form>');
    } else {
      const messages={sample:'버튼을 누른 상태를 확인했어요.',toast:'오늘의 기록을 남겼어요. 25분의 집중이 쌓였어요.','finish-demo':'섬으로 돌아가는 동작의 확인 표본이에요.','save-intro':'소개 저장 완료 상태예요.','save-community':'모임 설정을 저장한 뒤의 모습이에요.'};notify(messages[action]||'선택한 상태를 확인했어요.');
    }
  });
  document.addEventListener('input',event=> {
    const el=event.target;
    if(el.type==='range'){el.parentElement.querySelector('output').textContent=el.value+'%';}
    if(el.matches('.discovery-input')) {
      const root=el.closest('.specimen-body'),query=el.value.trim();let count=0;
      root.querySelectorAll('.island-option').forEach(row=>{row.hidden=!row.dataset.island.includes(query);if(!row.hidden)count++;});root.querySelector('.island-empty').hidden=count>0;
    }
    if(el.id==='island-search'){const out=el.closest('.specimen-body').querySelector('.search-result');out.textContent=el.value.trim()?'“'+el.value.trim()+'” 검색 상태 표본이에요.':'섬 이름을 입력해 보세요.';}
  });
  document.addEventListener('change',event=>{
    if(event.target.type==='file'){event.target.closest('.upload-field').querySelector('.file-name').textContent=event.target.files[0]?.name||'선택한 파일 없음';}
  });
  document.addEventListener('submit',event=>{
    const form=event.target;event.preventDefault();
    if(form.matches('.demo-form')) {
      const input=form.elements.name,valid=input.value.trim().length>=1&&input.value.trim().length<=20,hint=form.querySelector('.field-hint');input.setAttribute('aria-invalid',String(!valid));hint.classList.toggle('error',!valid);hint.textContent=valid?'이 이름으로 사용할 수 있어요.':'섬 이름을 1–20자로 입력해 주세요.';if(!valid)input.focus();else notify('입력값을 확인했어요.');
    } else if(form.matches('.post-form,.comment-form')) { if(!form.reportValidity())return;close();notify(form.matches('.post-form')?'게시 완료 상태예요. 실제 글을 등록하지 않았어요.':'댓글 완료 상태예요. 실제 댓글을 등록하지 않았어요.'); }
  });
  const sections=document.querySelectorAll('.kit-section');
  if('IntersectionObserver' in window) {
    const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){document.querySelectorAll('.sidebar>a').forEach(link=>{const active=link.hash==='#'+entry.target.id;link.classList.toggle('active',active);if(active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});}},{rootMargin:'-90px 0px -60% 0px',threshold:0});sections.forEach(section=>observer.observe(section));
  }
})();
