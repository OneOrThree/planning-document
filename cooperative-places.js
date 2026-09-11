/* 함께 만든 장소와 시간 약속을 기존 마을·집중·게시판에 연결한다. 서버 presence는 시연하지 않는다. */
(() => {
  'use strict';
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const icon=name=>Art.icon(name);
  const button=(label,action,value='',kind='secondary',extra='')=>'<button type="button" class="'+kind+'" data-coop="'+action+'" data-value="'+esc(value)+'" '+extra+'>'+label+'</button>';
  const note=s=>'<p class="coop-note">'+s+'</p>';
  const stamp=t=>new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',month:'long',day:'numeric'}).format(t);
  const minutes=s=>Math.floor(s/60)+'분'+(s%60?' '+s%60+'초':'');
  const weekday=['일','월','화','수','목','금','토'];
  const api=()=>window.GachisupVillage;
  const current=model=>model.get().currentIsland;
  const footerNote=()=>'<p class="panel-footnote">이 기기에 저장 · 실제 초대·동시 접속은 연결 전이에요.</p>';
  function scene(ready){
    return '<div class="coop-scene '+(ready?'is-ready':'')+'"><svg viewBox="550 650 570 374" role="img" aria-label="우리 섬 지도와 같은 자리의 부두"><image href="'+GachisupBackground.map.src+'" width="1536" height="1024"/></svg><span class="coop-scene-caption">'+(ready?'함께 쓸 자리가 생겼어요':'이 부두에 우리의 자리를')+'</span></div>';
  }
  function projectView(state,model){
    const id=current(model),p=model.placeProject(id),owner=model.get().role==='OWNER',memories=model.placeMemories(id),quests=model.get().quests.filter(q=>q.islandId===id&&q.active&&q.placeId==='pier');
    const progress='<div class="coop-progress-title"><h3>부두 만들기</h3><b>'+Math.floor(p.seconds/60)+' <small>/ 60분</small></b></div><progress class="coop-progress" value="'+p.seconds+'" max="3600" aria-label="부두에 보탠 집중 시간"></progress>';
    const actions=p.ready?'<div class="coop-unlock">'+icon('check')+'<div><b>한 배에서 함께 낚시</b><span>현실에서는 각자의 공부·독서에 집중해요.</span></div></div>':'<div class="coop-unlock">'+icon('harbor')+'<div><b>완성하면, 한 배에서 함께 낚시</b><span>기본 집중은 지금도 모두 사용할 수 있어요.</span></div></div>';
    const meetings=p.ready?'<section class="coop-meetings"><h3>이곳에서 만날 약속</h3>'+(quests.length?quests.map(q=>button('<span><b>'+esc(q.title)+'</b><small>'+q.start+'–'+q.end+' · 각자 '+q.minutes+'분</small></span>'+icon('arrow'),'meeting',q.id,'coop-meeting-row')).join(''):note('아직 약속이 없어요. 첫 모임을 정해볼까요?'))+'</section>':'';
    const memory=p.ready?'<section class="coop-memory"><h3>우리 부두의 기억</h3>'+(memories.length?'<p>이곳에서 <b>'+memories.length+'번</b> 시간을 보냈어요.</p><ol>'+memories.slice(0,3).map((s,i)=>'<li><span>'+stamp(s.endedAt)+'</span><b>'+esc(s.meetingTitle||'부두 모임')+'</b><small>'+esc(s.tag)+' '+minutes(s.seconds)+' · 모임 인정 '+minutes(s.meetingSeconds||0)+'</small></li>').join('')+'</ol>':note('첫 모임을 마치면, 함께 쓸 장소에 내 기록이 남아요.'))+'</section>':'';
    return {title:'우리의 작은 부두',body:'<div class="coop-place">'+scene(p.ready)+'<span class="coop-kicker">같이 만들고, 다시 모이는 곳</span><h3 class="coop-headline">다음에도,<br>여기서 만나.</h3>'+(p.previewUnlocked&&!p.completedAt?note('완성 상태 미리보기 · 기여 시간·지갑은 바꾸지 않았어요.'):p.completedAt?note(stamp(p.completedAt)+' · 우리가 완성한 장소'):progress+note('오늘의 집중으로 함께 쓸 자리를 만들어요.'))+actions+meetings+memory+
      '<button type="button" class="coop-free-rest" data-activity="rest">'+icon('harbor')+'<span><b>혼자 쉬는 낚시는 언제나 무료</b><small>기본 낚싯대 제공 · 휴식은 따로 기록</small></span>'+icon('arrow')+'</button>'+
      (!p.ready?note('시연 조건: 선택한 집중을 총 60분 보태면 완성돼요. 실제 건설 비용과 금고 규칙은 미정이에요.'):'')+
      button('게시판에서 약속 보기','board','','coop-text')+button('다른 섬으로 이동하기','harbor','','coop-text')+'</div>',
      footer:(!p.ready?button('집중으로 힘 보태기','contribute','','primary')+(owner?button('완성 후 모습 미리보기','preview','','coop-text'):''):owner?button('이 부두에서 모임 정하기','create','','primary'):button(quests.length?'모임을 골라 참여해요':'기본 활동 시작하기',quests.length?'list':'activity','','primary'))+footerNote()};
  }
  function createView(state,model){
    const d=state.coopDraft||{},today=new Date(Date.now()+32400000).getUTCDay();
    return {title:'부두에서 만날 약속',body:'<div class="coop-place"><span class="coop-kicker">그룹장의 모임 퀘스트</span><h3 class="coop-headline">언제, 여기서<br>다시 만날까요?</h3><div class="coop-location-line">'+icon('harbor')+'<span><b>우리의 작은 부두</b><small>공동 액션 · 한 배에서 낚시</small></span></div><form id="coop-meeting-form"><label>약속 이름<input name="title" maxlength="100" required value="'+esc(d.title||'부두에서, 각자의 25분')+'"></label><div class="coop-time-pair"><label>시작 시각<input name="start" type="time" required value="'+esc(d.start||'20:00')+'"></label><span>—</span><label>종료 시각<input name="end" type="time" required value="'+esc(d.end||'21:00')+'"></label></div>'+button('시연: 지금부터 1시간','now','','coop-text')+'<label>이 시간 안에, 각자 집중할 시간<input name="minutes" type="number" min="6" max="1080" required value="'+esc(d.minutes||25)+'"><small>분 · 모두가 한 시간 내내 함께할 필요는 없어요.</small></label><fieldset class="coop-days"><legend>만날 요일 · 한국 시간</legend>'+[1,2,3,4,5,6,0].map(n=>'<label><input type="checkbox" name="day" value="'+n+'" '+((d.days||[today]).includes(n)?'checked':'')+'><span>'+weekday[n]+'</span></label>').join('')+'</fieldset></form><p id="coop-error" class="coop-error" role="alert" tabindex="-1" hidden></p>'+note('늦게 와도 참여할 수 있어요. 약속 시간 안에서 집중한 만큼 인정하고, 먼저 나가도 기록과 부두는 그대로예요.')+'</div>',
      footer:'<button type="submit" class="primary" form="coop-meeting-form">이 약속을 게시판에 남기기</button>'+button('부두로 돌아가기','open','','coop-text')+footerNote()};
  }
  function meetingStatus(q,w,now,remaining,p){return !w.scheduled?'오늘은 약속한 요일이 아니에요.':now<w.start?q.start+'에 시작해요. 다른 집중을 하고 있어도 자동 이동하지 않아요.':now>=w.end?'오늘의 모임 시간이 끝났어요. 다음 약속 때 다시 만나요.':remaining<Math.max(0,q.minutes-p.value)?'늦게 합류해도 괜찮아요. 오늘은 남은 '+remaining+'분까지 모임에 인정돼요.':'지금 합류할 수 있어요. 각자의 속도로 시작해요.';}
  function meetingView(state,model,q){
    if(!q)return {title:'부두 모임',body:note('종료되었거나 다른 섬의 모임이에요.'),footer:button('부두로 돌아가기','open','','primary')};
    const joined=q.participants.includes('me'),w=model.meetingWindow(q),now=Date.now(),live=w.scheduled&&now>=w.start&&now<w.end,remaining=Math.max(0,Math.floor((w.end-now)/60000)),p=model.questProgress(q);
    const status=meetingStatus(q,w,now,remaining,p);
    return {title:'부두에서 함께 집중',body:'<div class="coop-place"><span class="coop-kicker">우리의 작은 부두 · 공동 낚시</span><h3 class="coop-headline">'+esc(q.title)+'</h3><div class="coop-boat-preview"><img src="'+(window.GachisupCooperativeArt?.source||GachisupActivities.specs.rest.asset)+'" alt="한 배에서 낚시하는 공동 액션 시안"><small>함께하는 모습의 연출 예시 · 실제 접속 친구가 아니에요.</small></div><div class="coop-window"><b>'+q.start+' — '+q.end+'</b><span>이 시간 안에 각자 '+q.minutes+'분 집중</span><small>'+q.days.map(n=>weekday[n]).join(' · ')+'요일 · 한국 시간</small></div><p class="coop-status" role="status">'+status+'</p><div class="coop-progress-title"><span>내가 오늘 모임에서 쌓은 시간</span><b>'+p.value+' / '+q.minutes+'분</b></div><progress class="coop-progress" value="'+p.value+'" max="'+q.minutes+'" aria-label="나의 모임 목표 진행"></progress><label class="coop-record-type">나는 무엇에 집중할까요?<select id="coop-record-tag"><option>공부</option><option>독서</option><option>작업</option></select><small>기록은 선택한 유형으로, 캐릭터는 함께 낚시해요.</small></label>'+note('화면을 내려놓아도 시간은 흘러요. 낚시를 위해 반복해서 누를 버튼은 없어요.')+(joined?button('참여 취소하기','leave',q.id,'coop-text'):'')+(model.get().role==='OWNER'?button('이 약속 종료하기','end',q.id,'coop-text'):'')+'</div>',footer:button(joined?(live?'이 부두에서 '+q.minutes+'분 시작하기':'약속 시간에 다시 만나요'):'이 모임에 참여하기',joined?'start-meeting':'join',q.id,'primary',joined&&!live?'disabled':'')+button('부두로 돌아가기','open','','coop-text')+footerNote()};
  }
  function decorate(key,state,model,content){
    if(state.visiting)return content;
    const id=current(model);
    if(key==='harbor'&&state.coopView){
      if(state.coopView.kind==='create')return createView(state,model);
      if(state.coopView.kind==='meeting')return meetingView(state,model,model.get().quests.find(q=>q.id===state.coopView.id&&q.islandId===id&&q.active));
      return projectView(state,model);
    }
    if(['town','harbor'].includes(key)){
      const p=model.placeProject(id);
      content.body=button('<span>'+icon('harbor')+'</span><span><b>'+(p.ready?'우리가 만든 부두':'함께 쓸 부두를 만들어요')+'</b><small>'+(p.ready?'모임을 정하고, 이곳에 다시 모여요':'집중으로 힘 보태기 → 공동 낚시')+'</small></span>'+icon('arrow'),'open','','coop-entry')+content.body;
    }
    if(key==='board'){
      const view=api()?.features.ui.view;
      if(!view)content.body=button('같이 만든 부두에서 모임 정하기 '+icon('arrow'),'open','','coop-entry')+content.body;
      if(view?.type==='quest'){
        const q=model.get().quests.find(q=>q.id===view.id&&q.placeId==='pier');
        if(q)content.footer=button('약속한 부두로 가기','meeting',q.id,'primary')+footerNote();
      }
      if(view?.type==='compose'&&view.kind==='quest')content.body=button('장소와 공동 액션이 있는 모임 만들기 '+icon('arrow'),'open','','coop-entry')+content.body;
    }
    if(key==='camp'&&state.projectContribution?.islandId===id&&state.activityTag!=='휴식'){
      content.body='<div class="coop-contribution-banner">'+icon('harbor')+'<span>이번 집중은 부두 만들기에 보태요.</span>'+button('취소','cancel-contribution','','coop-text')+'</div>'+content.body;
    }
    if(key==='result'&&!state.lastCooperative)content.body+=button('우리 부두에서 다시 만나기','open','','coop-entry');
    if(key==='result'&&state.lastCooperative){
      const r=state.lastCooperative,project=r.projectId==='pier';
      content.body='<div class="coop-result">'+icon(project?'sprout':'harbor')+'<h3>'+(project?'부두에 한 걸음 보탰어요.':'같은 부두로 돌아왔어요.')+'</h3><p>'+(project?'부두 만들기에 '+minutes(r.projectSeconds||0)+' 보탰어요.':'내 집중 '+minutes(r.seconds)+' · 모임 인정 '+minutes(r.meetingSeconds||0))+'</p>'+note('개인의 집중 기록은 그대로 남겨요. 기본 보상을 중복 발행하지 않아요.')+'</div>'+content.body;
      content.footer=button('우리 부두로 돌아가기','open','','primary')+footerNote();
    }
    return content;
  }
  function open(id){
    const a=api();if(!a||a.state.session||a.state.visiting)return;
    document.querySelector('#village-dialog')?.close();
    a.selectBuilding('harbor');a.state.coopView=id?{kind:'meeting',id}:{kind:'place'};a.renderPanel();a.expand();
  }
  function error(message){
    let el=document.getElementById('coop-error');
    if(!el){el=document.createElement('p');el.id='coop-error';el.className='coop-error';el.setAttribute('role','alert');el.tabIndex=-1;document.querySelector('#building-panel .panel-content')?.prepend(el);}
    el.hidden=false;el.textContent=message;el.focus({preventScroll:true});
  }
  function render(){api().renderPanel(false);syncWorld();}
  function syncWorld(){
    const a=api();if(!a)return;
    const marker=document.getElementById('coop-pier-marker');if(!marker)return;
    marker.hidden=a.state.visiting||!!a.state.session;
    const p=a.model.placeProject();
    const label=p.ready?'우리의 부두':'부두 함께 만들기';
    if(marker.textContent!==label)marker.textContent=label;
    marker.dataset.ready=String(p.ready);
  }
  function refreshMeeting(){
    const a=api(),s=a?.state;if(!s||s.session||s.visiting||s.selected!=='harbor'||s.coopView?.kind!=='meeting')return;
    const q=a.model.get().quests.find(q=>q.id===s.coopView.id&&q.active);if(!q)return;
    const w=a.model.meetingWindow(q),now=Date.now(),live=w.scheduled&&now>=w.start&&now<w.end,p=a.model.questProgress(q);
    const status=meetingStatus(q,w,now,Math.max(0,Math.floor((w.end-now)/60000)),p),el=document.querySelector('.coop-status');if(el&&el.textContent!==status)el.textContent=status;
    const start=document.querySelector('[data-coop=start-meeting]');if(start){start.disabled=!live;const label=live?'이 부두에서 '+q.minutes+'분 시작하기':'약속 시간에 다시 만나요';if(start.textContent!==label)start.textContent=label;}
  }
  let mounted=false;
  function init(){
    if(mounted||!api())return;mounted=true;
    const marker=document.createElement('button');marker.id='coop-pier-marker';marker.className='coop-pier-marker';marker.dataset.coop='open';marker.setAttribute('aria-label','공동 부두 프로젝트와 모임 열기');document.querySelector('#map-layer').append(marker);
    syncWorld();setInterval(refreshMeeting,1000);
    new MutationObserver(syncWorld).observe(document.getElementById('island-name'),{childList:true});
    if(new URLSearchParams(location.search).get('place')==='pier'&&!new URLSearchParams(location.search).has('ia')){
      const show=()=>{if(document.getElementById('load-state').hidden)open();else requestAnimationFrame(show);};show();
    }
  }
  document.addEventListener('click',event=>{
    const el=event.target.closest('[data-coop]');if(!el||!api())return;
    event.preventDefault();event.stopImmediatePropagation();
    const a=api(),m=a.model,s=a.state,value=el.dataset.value,id=current(m);
    if(s.session||s.visiting)return;
    try{
      switch(el.dataset.coop){
        case 'open':case 'list':open();break;
        case 'meeting':open(value);break;
        case 'harbor':s.coopView=null;a.renderPanel();break;
        case 'board':a.selectBuilding('board');a.features.ui.board='quests';a.features.ui.view=null;a.renderPanel();break;
        case 'contribute':s.projectContribution={islandId:id};a.chooseActivity('read');break;
        case 'cancel-contribution':s.projectContribution=null;render();break;
        case 'activity':a.chooseActivity('read');break;
        case 'preview':m.previewPlace(id);render();a.toast('완성 상태로 열었어요. 기여 시간·지갑·통계는 바꾸지 않았어요.');break;
        case 'create':if(m.get().role!=='OWNER')throw Error('그룹장이 모임을 정할 수 있어요.');if(!m.placeProject().ready)throw Error('부두를 마련한 뒤 모임을 정해요.');s.coopView={kind:'create'};s.coopDraft=null;a.renderPanel();break;
        case 'now':{
          const date=new Date(Date.now()+32400000),start=date.getUTCHours()*60+date.getUTCMinutes(),end=Math.min(1439,start+60);
          if(end-start<6)throw Error('오늘 남은 시간이 짧아요. 내일 모일 시간을 정해주세요.');
          const f=document.getElementById('coop-meeting-form'),clock=n=>String(Math.floor(n/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0');
          f.elements.start.value=clock(start);f.elements.end.value=clock(end);f.elements.minutes.value=Math.min(25,end-start);
          f.querySelectorAll('[name=day]').forEach(x=>x.checked=Number(x.value)===date.getUTCDay());break;
        }
        case 'join':{const q=m.get().quests.find(q=>q.id===value);if(q?.islandId!==id)throw Error('현재 섬의 모임을 골라주세요.');if(!q.participants.includes('me'))m.joinQuest(value);render();break;}
        case 'leave':{const q=m.get().quests.find(q=>q.id===value);if(q?.participants.includes('me'))m.joinQuest(value);render();break;}
        case 'start-meeting':a.beginMeeting(value,document.getElementById('coop-record-tag').value);syncWorld();break;
        case 'end':a.showDialog('이 약속을 종료할까요?','<p class="dialog-copy">다음 참여만 닫아요. 이미 한 집중과 완성된 부두는 남아 있어요.</p>',button('약속 종료하기','confirm-end',value,'primary'));break;
        case 'confirm-end':m.endQuest(value);document.getElementById('village-dialog').close();open();break;
      }
    }catch(e){error(e.message);}
  },true);
  document.addEventListener('submit',event=>{
    if(event.target.id!=='coop-meeting-form')return;
    event.preventDefault();const a=api();if(a.state.session||a.state.visiting)return;
    const v=Object.fromEntries(new FormData(event.target)),days=[...event.target.querySelectorAll('[name=day]:checked')].map(x=>Number(x.value));
    a.state.coopDraft={...v,days};
    try{const id=a.model.saveQuest({...v,days,islandId:current(a.model),category:'FOCUS',type:'TIME_WINDOW',fee:0,placeId:'pier',worldAction:'fishing'});a.state.coopDraft=null;open(id);a.toast('약속을 이 기기의 게시판에 남겼어요. 실제 알림은 보내지 않았어요.');}catch(e){error(e.message);}
  });
  addEventListener('gachisup:session-finished',syncWorld);
  addEventListener('gachisup:village-ready',init);
  window.GachisupCooperative={decorate,open,syncWorld};
})();
