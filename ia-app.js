/* 원본 IA 번호를 실제 마을·폼·시트에 연결하는 시연 라우터. */
(() => {
  'use strict';
  const params=new URLSearchParams(location.search);if(!params.has('ia'))return;
  const V=GachisupIAView,{esc,icon,button:b,link,heading:h,note,input}=V,$=s=>document.querySelector(s);
  const design=GachisupIAModel.create(GachisupIAStorage),ui={current:null,invite:null,search:'',filter:'전체',product:'beret',ledger:'all',recipient:'tofu',preset:0,letter:null,mail:'inbox',visit:null};
  let api,page,sheet,initialized=false,observing=false,lastIsland=null,initialActivity=['read','study','rest'].includes(params.get('activity'))?params.get('activity'):null;
  const lookup=id=>[...GachisupIA.screens,...GachisupIA.sheets].find(s=>s.id===id);
  const ctx=()=>({data:design.get({islandId:api.model.get().currentIsland}),model:design,ui,api,role:api.model.get().role,...V});
  function announce(id){if(!lookup(id))return;const activity=GachisupActivities.forTag(api.state.session?.tag||api.state.activityTag).id,activityQuery=['fo1','fo2','fo3','fo4','sh1','sh2'].includes(id)?'&activity='+activity:'';ui.current=id;document.body.dataset.iaScreen=id;history.replaceState(null,'','?ia='+id+(params.get('preview')==='1'?'&preview=1':'')+'&role='+api.model.get().role+activityQuery+(params.get('device')==='phone'?'&device=phone':'')+(['original','refined'].includes(params.get('background'))?'&background='+params.get('background'):'')+(params.get('invite')?'&invite='+encodeURIComponent(params.get('invite')):''));if(parent!==window)parent.postMessage({type:'gachisup:screen',id,role:api.model.get().role,activity},location.origin);}
  function error(message){const host=sheet.open?sheet:page.hidden?$('#building-panel'):page;let box=host.querySelector('.ia-error');if(!box){box=document.createElement('p');box.className='ia-error';box.setAttribute('role','alert');box.tabIndex=-1;(host.querySelector('.ia-page-content')||host).prepend(box);}box.hidden=false;box.textContent=message;box.focus({preventScroll:true});}
  function render(id=ui.current){const renderer=GachisupIAPages[id];if(!renderer)throw Error('아직 연결하지 않은 화면: '+id);const view=renderer(ctx());page.hidden=false;$('#village-root').inert=true;page.dataset.kind=view.kind||'standard';page.dataset.screen=id;page.innerHTML=`<header>${view.back===null?'':`<button type="button" class="ia-back" data-ia-go="${view.back||'plaza'}" aria-label="이전 화면">${icon('back')}</button>`}${window.GachisupIslandTheme?.mark(GachisupIslandTheme.forScreen(id))||''}<h1>${view.title}</h1>${view.step?`<small>${view.step}</small>`:''}${view.header||''}</header><div class="ia-page-content">${view.body}</div>${view.footer?`<footer>${view.footer}</footer>`:''}`;announce(id);page.querySelector('.ia-intro h2,.ia-splash-brand h2,h1')?.focus({preventScroll:true});window.GachisupIAWorldSync?.(ctx());}
  function feature(action,value=''){api.features.handle({dataset:{feature:action,value}});}
  function prepareBoard(tab){api.selectBuilding('board');api.features.ui.board=tab;api.features.ui.view=null;api.renderPanel();api.expand();}
  const existing={
    plaza(){api.closePanel(false);api.homeCamera();},
    fo1(){api.chooseActivity(initialActivity||'read');initialActivity=null;},
    fo2(){if(!api.state.session){api.chooseActivity(initialActivity||'read');initialActivity=null;api.actions.start();}api.settleActivity();},
    fo3(){api.state.overview=false;if(api.state.session)api.finishSession();else if(api.state.selected==='result'&&!api.state.iaResultSample){api.renderPanel();}else{api.state.iaResultSample=true;Object.assign(api.state,{lastSeconds:initialActivity==='rest'?600:1500,activityTag:initialActivity?GachisupActivities.specs[initialActivity].tag:api.state.activityTag,lastOrigin:api.state.island,lastKind:initialActivity==='rest'?'rest':'focus',selected:'result'});api.updateChrome();api.renderPanel();initialActivity=null;}},
    cp1(){GachisupCooperative.open();},
    vh1(){api.selectBuilding('town');api.expand();},
    vh2(){api.selectBuilding('cabin');api.state.recordTab='group';api.features.ui.period='WEEK';api.features.ui.user=null;api.renderPanel();api.expand();},
    bd1(){prepareBoard('notice');},bd1a(){prepareBoard('notice');const p=api.model.get().posts.find(p=>p.kind==='notice');if(p)feature('read-post',p.id);},
    bd2(){prepareBoard('quests');},bd3(){prepareBoard('quests');const q=api.model.get().quests[0];if(q)feature('read-quest',q.id);},
    bd3a(){prepareBoard('share');},bd4(){prepareBoard('quests');feature('compose','quest');},
    ob1(){api.selectBuilding('tower');api.features.ui.ranking='group';api.renderPanel();api.expand();},
    ob2(){api.selectBuilding('tower');api.features.ui.ranking='islands';api.renderPanel();api.expand();},
    hb1(){api.state.harborTab='mine';api.selectBuilding('harbor');api.renderPanel();api.expand();},
    hb3(){const p=ui.visit||design.places().find(p=>p.id==='moon');api.closePanel(false);api.state.visiting=true;api.state.island=p.name;api.updateChrome();api.overview();const controls=document.createElement('div');controls.className='ia-visit-controls';controls.innerHTML=b('내 섬으로 돌아가기','return','','primary');document.body.append(controls);$('#visit-banner').textContent=p.name+' 구경 중 · 읽기 전용';}
  };
  function navigate(id){
    if(!lookup(id))return error('화면 번호를 찾을 수 없어요.');
    if(id==='plaza'&&ui.current?.startsWith('on')&&!design.get().membership)return error('먼저 새 섬을 만들거나 초대받은 섬에 참여해주세요.');
    if(api.state.session&&!['fo2','fo4','sh2'].includes(id)){api.toast('집중을 마친 뒤 다른 화면으로 갈 수 있어요.');return;}
    if(api.state.visiting&&!['hb3','hb2','hb1','plaza'].includes(id)){api.toast('구경 중에는 풍경만 둘러볼 수 있어요.');return;}
    if(id.startsWith('sh')){if(!ui.current&&id!=='sh2')navigate(lookup(id).parent);openSheet(id);return;}
    sheet.close();document.querySelectorAll('.ia-visit-controls').forEach(e=>e.remove());
    if(api.state.visiting&&id!=='hb3'){api.state.visiting=false;api.sync();}
    if(id==='bd4'&&api.model.get().role!=='OWNER'){api.closePanel(false);render(id);return;}
    if(existing[id]){page.hidden=true;$('#village-root').inert=false;existing[id]();announce(id);enhance();}
    else{if(id==='fo4'&&!api.state.session)existing.fo2();if(id!=='fo4')api.closePanel(false);render(id);}
  }
  function openSheet(id,body,title){
    if(id==='sh3'&&api.model.get().role!=='OWNER'){body=h('그룹장만 작성할 수 있어요.','자료와 댓글은 모든 친구가 나눌 수 있어요.')+b('닫기','close-sheet','','primary');title='공지 작성 권한';}
    if(['sh3','sh4','sh5'].includes(id)&&!body){
      page.hidden=true;$('#village-root').inert=false;prepareBoard(id==='sh3'?'notice':'share');
      if(id==='sh5'){const p=api.model.get().posts.find(p=>p.kind==='share');if(p)feature('report-post',p.id);}else feature('compose',id==='sh3'?'notice':'share');announce(id);return;
    }
    if(id==='sh2'){if(!api.state.session)existing.fo2();api.actions.finish();announce(id);return;}
    const view=window.GachisupIASheets?.[id]?.(ctx());
    if(!view&&!body)return error('아직 연결하지 않은 시트: '+id);
    if(!sheet.open){sheet.dataset.parent=ui.current||lookup(id)?.parent||'plaza';ui.sheetTrigger=document.activeElement;}
    sheet.dataset.screen=id;sheet.innerHTML=`<header><h2>${title||view.title}</h2><button type="button" data-ia-action="close-sheet" aria-label="시트 닫기">${icon('close')}</button></header>${body||view.body}`;
    if(!sheet.open)sheet.showModal();announce(id);
  }
  function enhance(){
    window.GachisupIAWorldSync?.(ctx());
    if(!page.hidden)return;
    const live=$('#session-hud');if(api.state.session&&live&&!live.querySelector('.ia-lock-link')){const btn=document.createElement('button');btn.className='ia-lock-link';btn.dataset.iaGo='fo4';btn.textContent='잠금화면 시안 보기';live.append(btn);api.refocus();}
    const content=$('#building-panel .building-content');if(!content||content.querySelector('.ia-extension-links'))return;
    let html='';const s=api.state,u=api.features.ui;
    if(s.selected==='town')html=link('우리 섬의 기록','vh2')+link('섬 설정·친구 관리','vh3')+link('섬 금고 내역','vh4');
    if(s.selected==='camp')html=link('집중할 동안 쉬어 갈 앱','sh1','ia-row','shield');
    if(s.selected==='harbor'&&!s.coopView)html=link('새로운 섬 찾기','hb2');
    if(s.selected==='tower'&&u.ranking==='islands')html=link('다른 섬의 풍경 구경하기','hb3');
    if(s.selected==='board'&&u.view?.type==='quest')html=link('함께 나눈 자료','bd3a');
    if(s.selected==='result'&&s.lastKind!=='rest')html=(s.iaResultSample?note('세션 결과 디자인 예시 · 아래 25분을 실제 기록·적립하지 않아요.'):'')+'<div class="ia-reward-pair"><span>개인 지갑 <b>+'+Math.floor(s.lastSeconds/600)+'</b></span><span>섬 금고 <b>+'+Math.floor(s.lastSeconds/600)+'</b></span></div>'+note('시간 적립 시연 · 집중 10분당 1개(제안값). 실제 정산은 앱 연결 후 제공해요.');
    html+=window.GachisupIABoardDetails?.(ctx())||'';
    if(html){const extra=document.createElement('section');extra.className='ia-extension-links';extra.innerHTML=html;content.append(extra);}
  }
  function infer(){const current=api.model.get().currentIsland;if(current&&current!==lastIsland){lastIsland=current;api.model.configure({role:design.get().roles[current]||'MEMBER'});api.updateChrome();}
    if(!page.hidden||sheet.open)return;if($('#village-dialog').open){const id=api.state.session&&$('#village-dialog [data-action=confirm-finish]')?'sh2':$('#feature-report')?'sh5':null;if(id&&ui.current!==id)announce(id);return;}const s=api.state,u=api.features.ui;let id;
    if(s.session)id='fo2';else if(s.visiting)id='hb3';else if(!s.selected)id='plaza';else if(s.selected==='result')id='fo3';else if(s.selected==='town')id='vh1';else if(s.selected==='cabin')id='vh2';else if(s.selected==='camp')id='fo1';else if(s.selected==='harbor')id=s.coopView?'cp1':'hb1';else if(s.selected==='tower')id=u.ranking==='islands'?'ob2':'ob1';else if(s.selected==='post'){navigate('po1');return;}else if(s.selected==='board')id=u.view?.type==='compose'?({notice:'sh3',share:'sh4',quest:'bd4'}[u.view.kind]):u.view?.type==='post'?(api.model.get().posts.find(p=>p.id===u.view.id)?.kind==='share'?'bd3a':'bd1a'):u.view?.type==='quest'?'bd3':{quests:'bd2',notice:'bd1',share:'bd3a'}[u.board];
    const activityChanged=id==='fo1'&&new URLSearchParams(location.search).get('activity')!==GachisupActivities.forTag(s.activityTag).id;
    if(id&&(id!==ui.current||activityChanged))announce(id);enhance();
  }
  const handlers={
    login:provider=>{if(!design.get().membership){ui.onboarding=true;design.beginOnboarding();}design.profile({provider});navigate('on4');},
    'close-sheet':()=>{const parentId=sheet.dataset.parent||lookup(ui.current)?.parent||'plaza';sheet.close();if(page.hidden&&!api.state.selected&&parentId!=='plaza')navigate(parentId);else announce(parentId);ui.sheetTrigger?.focus?.({preventScroll:true});},
    return:()=>{api.state.visiting=false;api.sync();navigate('hb1');},
    'check-invite':()=>{const code=page.querySelector('[name=code]').value;design.draft('on5b',{code});try{ui.invite=design.invite(code);ui.inviteError=null;}catch(err){ui.invite=null;ui.inviteError=err.message;}render('on5b');},
    'join-invite':()=>{if(!ui.invite)throw Error('먼저 초대를 확인해주세요.');join(ui.invite.id);},
    'join-island':id=>join(id),
    'preview-island':id=>{ui.visit=design.places().find(p=>p.id===id);navigate('hb3');}
  };
  function join(id){const role=design.get().joined.includes(id)?design.get().roles[id]||'MEMBER':'MEMBER';const result=design.join(id);if(result.status==='pending'){ui.invite=result.place;ui.joinStatus='pending';render(ui.current==='on5b'?'on5b':'hb2');return;}if(ui.onboarding){api.model.enterFirstIsland(result.place,role);ui.onboarding=false;}else{api.model.addIsland(result.place);api.model.configure({currentIsland:result.place.id,role});}design.setRole(result.place.id,role);lastIsland=result.place.id;api.sync();navigate('on6');}
  async function init(){
    if(initialized||!window.GachisupVillage)return;initialized=true;api=GachisupVillage;
    if(design.error||api.model.loadError){document.body.classList.add('ia-mode');$('#village-root').inert=true;const failure=document.createElement('section');failure.className='ia-page';failure.innerHTML='<header><h1>시연 데이터를 확인해주세요</h1></header><div class="ia-page-content">'+h('기록을 읽지 못했어요.','기존 데이터는 덮어쓰지 않았어요.')+note(esc(design.error||api.model.loadError),'notice')+'</div><footer><a class="ia-button primary" href="index.html?ia=on1&preview=1">임시 시연으로 열기</a></footer>';document.body.append(failure);return;}
    if(params.get('role')==='MEMBER')api.model.configure({role:'MEMBER'});design.setRole(api.model.get().currentIsland,api.model.get().role);lastIsland=api.model.get().currentIsland;
    if(params.get('ia')?.startsWith('on')&&params.get('ia')!=='on6'&&!design.get().membership){ui.onboarding=true;design.beginOnboarding();}
    document.body.classList.add('ia-mode');page=document.createElement('section');page.className='ia-page';page.id='ia-page';page.hidden=true;page.setAttribute('aria-label','같이숲 상세 화면');sheet=document.createElement('dialog');sheet.className='ia-sheet';sheet.id='ia-sheet';document.body.append(page,sheet);sheet.addEventListener('cancel',e=>{e.preventDefault();handlers['close-sheet']();});
    const profile=document.createElement('button');profile.className='tool ia-profile-button';profile.dataset.iaGo='pr1';profile.innerHTML=icon('cat')+'<span>나의 친구</span>';profile.setAttribute('aria-label','나의 친구 프로필');$('.top-tools').prepend(profile);
    const avatar=$('#avatar-position');avatar.dataset.iaGo='pr1';avatar.setAttribute('role','button');avatar.setAttribute('aria-label','내 고양이 프로필');avatar.tabIndex=0;
    const oldNavigate=api.features.navigate;api.features.navigate=key=>{oldNavigate(key);if(key==='board')api.features.ui.board='notice';};
    $('#village-dialog').addEventListener('close',()=>requestAnimationFrame(infer));
    const ready=()=>new Promise(resolve=>{function check(){if($('#load-state').hidden)resolve();else requestAnimationFrame(check);}check();});await ready();
    document.addEventListener('click',e=>{const route=e.target.closest('[data-ia-go]'),action=e.target.closest('[data-ia-action]');if(!route&&!action)return;e.preventDefault();e.stopImmediatePropagation();try{if(route)navigate(route.dataset.iaGo);else (handlers[action.dataset.iaAction]||window.GachisupIAActions?.[action.dataset.iaAction])?.(action.dataset.value,ctx());}catch(err){error(err.message);}},true);
    document.addEventListener('pointerdown',e=>{if(e.target.closest('#avatar-position')){e.preventDefault();e.stopImmediatePropagation();navigate('pr1');}},true);
    document.addEventListener('keydown',e=>{if(e.target===avatar&&['Enter',' '].includes(e.key)){e.preventDefault();navigate('pr1');}});
    document.addEventListener('input',e=>{const form=e.target.closest('#ia-form');if(!form)return;try{const values=Object.fromEntries(new FormData(form));design.draft(ui.current,values);if(form.dataset.form==='invite'&&e.target.name==='code'){ui.invite=null;ui.inviteError=null;page.querySelector('.ia-invite-result')?.remove();page.querySelector('footer')?.remove();page.querySelector('.ia-error')?.remove();}const counter=page.querySelector('[data-count="'+e.target.name+'"]');if(counter)counter.textContent=e.target.value.length+' / '+e.target.maxLength;}catch(err){error(err.message);}});
    document.addEventListener('submit',e=>{if(e.target.id!=='ia-form')return;e.preventDefault();try{const form=e.target,v=Object.fromEntries(new FormData(form));if(form.dataset.form==='character'){design.profile({name:v.name});navigate(params.get('invite')?'on5b':'on5');}else if(form.dataset.form==='create-island'){const place=design.createIsland({...v,approval:v.approval==='approve'});if(ui.onboarding){api.model.enterFirstIsland(place,'OWNER');ui.onboarding=false;}else{api.model.addIsland(place);api.model.configure({currentIsland:place.id,role:'OWNER'});}design.setRole(place.id,'OWNER');lastIsland=place.id;api.sync();navigate('on6');}else window.GachisupIAForms?.[form.dataset.form]?.(v,ctx());}catch(err){error(err.message);}});
    document.addEventListener('change',e=>{if(e.target.dataset.iaPref){try{design.preference(e.target.dataset.iaPref,e.target.checked);}catch(err){e.target.checked=!e.target.checked;error(err.message);}}});
    addEventListener('gachisup:session-finished',e=>{api.state.iaResultSample=false;design.reward(e.detail);if(ui.current==='fo4')navigate('fo3');setTimeout(enhance,0);});
    new MutationObserver(()=>{if(observing)return;observing=true;requestAnimationFrame(()=>{observing=false;infer();});}).observe($('#village-app'),{subtree:true,childList:true,attributes:true,attributeFilter:['class','hidden','data-phase','open']});
    window.GachisupIAApp={navigate,render,openSheet,error,design,ui,api,handlers,ctx,enhance};
    setInterval(()=>{if(ui.current==='fo4'&&api.state.session){const timer=$('#ia-live-timer'),source=$('#session-timer');if(timer&&source)timer.textContent=source.textContent;const progress=$('.ia-live-progress i');if(progress)progress.style.width=Math.min(100,(Date.now()-api.state.session.started)/1000/api.state.session.duration*100)+'%';}},1000);
    setInterval(()=>window.GachisupIAWorldSync?.(ctx()),60000);
    if(params.get('invite')){try{ui.invite=design.invite(params.get('invite'));}catch(err){ui.inviteError=err.message;}design.draft('on5b',{code:params.get('invite').slice(0,6)});}
    if(params.get('preview')==='1'&&params.get('ia')==='on6')design.join('home');
    for(const record of api.model.get().sessions)design.reward(record);
    if(api.state.session)navigate('fo2');else if(api.state.selected==='result')navigate('fo3');else navigate(params.get('ia')||'on1');
  }
  addEventListener('gachisup:village-ready',()=>init().catch(e=>console.error(e)));if(window.GachisupVillage)init().catch(e=>console.error(e));
})();
