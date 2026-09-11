/* 장소별 활동 원화·관절·화면 정의. 세션 저장과 카메라는 village.js가 소유한다. */
(() => {
  'use strict';
  const specs={
    read:{id:'read',tag:'독서',place:'모닥불',heading:'지금은, 책에 머무는 시간',copy:'불빛 곁에 앉아, 한 장씩 천천히.',company:'모모 · 두부 · 밤이와 함께',asset:'assets/momo-rig-source.png',icon:'fire',point:[937,482],entry:'camp',durations:[25,50,90]},
    study:{id:'study',tag:'공부',place:'섬의 공부 테이블',heading:'지금은, 배움에 머무는 시간',copy:'네 자리의 테이블, 오늘의 작은 배움.',company:'빈자리 세 곳 · 혼자서도 시작할 수 있어요',asset:'assets/momo-study-table.png',icon:'book',point:[624,433],entry:'study',durations:[25,50,90]},
    rest:{id:'rest',tag:'휴식',place:'배 위 낚시',heading:'지금은, 물결을 기다리는 시간',copy:'작은 배에서 낚시하며 쉬어요. 잡지 않아도 괜찮아요.',company:'작은 찌를 바라보며, 천천히',asset:'assets/momo-fishing-boat-v1.png',icon:'harbor',point:[1195,1180],entry:'embark',durations:[5,10,15]}
  };
  const cooperative={id:'gather',tag:'공부',place:'우리의 작은 부두',heading:'한 배에서, 각자의 집중',company:'공동 낚시 연출 · 나 외의 두 친구는 예시예요',icon:'harbor',point:[1110,1160],entry:'embark',durations:[25,50,90]};
  const forTag=tag=>tag==='휴식'?specs.rest:['공부','작업'].includes(tag)?specs.study:specs.read;
  const voyage={start:[794,963],at(t,destination=specs.rest.point){t=Math.max(0,Math.min(1,t));const p=[this.start,[871,1015],[1060,1110],destination],u=1-t;
    const x=u*u*u*p[0][0]+3*u*u*t*p[1][0]+3*u*t*t*p[2][0]+t*t*t*p[3][0],y=u*u*u*p[0][1]+3*u*u*t*p[1][1]+3*u*t*t*p[2][1]+t*t*t*p[3][1];
    const dx=3*u*u*(p[1][0]-p[0][0])+6*u*t*(p[2][0]-p[1][0])+3*t*t*(p[3][0]-p[2][0]),dy=3*u*u*(p[1][1]-p[0][1])+6*u*t*(p[2][1]-p[1][1])+3*t*t*(p[3][1]-p[2][1]);
    return {x,y,heading:Math.max(-12,Math.min(8,Math.atan2(dy,dx)*180/Math.PI-38))};}};
  const transparent='data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>';
  let emptyTableSource=transparent;
  specs.study.asset=transparent;
  // 생성 원본은 보존하고, 크로마키 배경은 렌더링할 때만 알파로 합성한다.
  async function keyedTexture(source){
    const image=new Image();image.src=source;await image.decode();
    const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;
    const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0);
    const bitmap=ctx.getImageData(0,0,canvas.width,canvas.height),pixels=bitmap.data;
    for(let i=0;i<pixels.length;i+=4){
      const r=pixels[i],g=pixels[i+1],b=pixels[i+2],key=Math.min(r,b)-g;
      if(key>45&&b>g+45&&r>g+45){
        const alpha=1-Math.min(1,Math.max(0,(key-45)/95));pixels[i+3]=Math.round(pixels[i+3]*alpha);
        if(alpha>0){pixels[i]=Math.min(r,g+75);pixels[i+2]=Math.min(b,g+38);}
      }
    }
    ctx.putImageData(bitmap,0,0);return canvas.toDataURL('image/png');
  }
  const bone=(parent,pivot,limit,label)=>({parent,pivot,limit,label});
  const region=(name,polygon,feather=10)=>({bone:name,polygon,feather,strength:1});
  const studyProfile={
    source:specs.study.asset,
    bones:{root:bone(null,[500,850],0,'테이블'),body:bone('root',[590,355],2,'호흡'),head:bone('body',[553,310],4,'고개'),paw:bone('root',[474,322],7,'필기하는 앞발'),pencil:bone('paw',[452,310],8,'연필'),tail:bone('root',[701,370],5,'꼬리')},
    regions:[region('body',[[467,272],[655,274],[690,383],[651,382],[585,355],[547,353]],12),region('head',[[421,220],[465,83],[508,103],[548,141],[661,116],[689,233],[670,281],[627,311],[558,318],[482,301]],13),region('paw',[[421,279],[451,285],[476,322],[457,345],[425,328],[418,307]],7),region('pencil',[[421,256],[437,250],[494,355],[484,361]],4),region('tail',[[677,301],[693,267],[734,254],[769,280],[773,318],[750,365],[697,391]],12)],
    motions:{read:{body:{amplitude:.08,frequency:1.2},head:{amplitude:.65,frequency:.58},paw:{amplitude:3.2,frequency:4.8},pencil:{amplitude:2.2,frequency:4.8,phase:.3},tail:{amplitude:1.2,frequency:.7}},idle:{head:{amplitude:.5,frequency:.55},tail:{amplitude:1,frequency:.65}},nod:{head:{amplitude:2.4,frequency:1.8},tail:{amplitude:1.8,frequency:.9}}}
  };
  const boatProfile={
    source:specs.rest.asset,
    bones:{root:bone(null,[530,750],0,'배'),body:bone('root',[570,584],2,'호흡'),head:bone('body',[569,506],4,'바라보기'),pawL:bone('body',[472,555],3,'왼쪽 앞발'),pawR:bone('root',[669,548],2,'낚싯대와 앞발'),tail:bone('root',[410,531],4,'꼬리')},
    regions:[region('body',[[434,492],[643,478],[691,555],[663,597],[593,625],[474,595],[418,564]],10),region('head',[[398,327],[427,272],[486,290],[558,308],[651,250],[680,345],[710,413],[697,467],[641,509],[554,527],[462,503],[406,461]],15),region('pawL',[[423,549],[466,530],[532,561],[558,588],[549,609],[507,605],[475,590]],8),region('pawR',[[626,531],[649,505],[688,511],[714,548],[696,578],[648,584],[626,558]],12),region('pawR',[[622,621],[646,534],[669,463],[763,318],[835,189],[942,107],[962,121],[857,211],[795,340],[716,477],[692,555],[659,622]],12),region('tail',[[336,428],[374,406],[414,432],[422,498],[400,531],[355,539],[333,497]],10)],
    motions:{idle:{body:{amplitude:.15,frequency:.85},head:{amplitude:1.1,frequency:.32},pawR:{amplitude:.55,frequency:.65},tail:{amplitude:.9,frequency:.6}},nod:{body:{amplitude:.35,frequency:1.1},head:{amplitude:2.2,frequency:.9},pawL:{amplitude:1.8,frequency:.9},pawR:{amplitude:.85,frequency:.65}}}
  };
  function panel(state){
    const tag=state.activityTag||'독서',spec=forTag(tag),rest=spec.id==='rest';
    const title=rest?'배 위에서 낚시':spec.id==='study'?'테이블에서 공부':'모닥불에서 독서';
    const copy=rest?'작은 찌를 바라보며 느긋하게 쉬어요.':spec.id==='study'?'네 자리의 테이블에서 조용히 써 내려가요.':'책장을 넘기며 조용히 집중해요.';
    const choices=Object.values(specs).map(item=>`<button type="button" id="activity-choice-${item.id}" role="radio" aria-checked="${item.id===spec.id}" tabindex="${item.id===spec.id?0:-1}" data-focus-tag="${item.tag}"><span class="activity-choice-icon">${item.id==='study'?'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m16 3 5 5-12 12-6 1 1-6Z M13 6l5 5 M4 15l5 5"/></svg>':Art.icon(item.id==='read'?'book':'harbor')}</span><span>${item.tag}</span><span class="activity-choice-check" aria-hidden="true">${Art.icon('check')}</span></button>`).join('');
    return {title:'오늘의 활동',body:`
      <div class="activity-choices" role="radiogroup" aria-label="어떤 시간을 보낼까요?">${choices}</div>
      <select id="focus-task" class="activity-compat-control" aria-hidden="true" tabindex="-1">${['독서','공부','휴식','작업'].map(t=>`<option${t===tag?' selected':''}>${t}</option>`).join('')}</select>
      <div class="activity-preview" data-preview="${spec.id}" aria-live="polite" aria-atomic="true"><img src="${spec.asset}" alt="${spec.place}에서 ${tag}하는 모모"><div><h4>${title}</h4><p>${copy}</p></div></div>
      ${spec.id==='study'?`<div class="activity-study-kind"><span>기록할 유형</span><div role="group" aria-label="공부 테이블 기록 유형"><button type="button" id="activity-kind-study" data-focus-tag="공부" aria-pressed="${tag==='공부'}">공부</button><button type="button" id="activity-kind-work" data-focus-tag="작업" aria-pressed="${tag==='작업'}">작업</button></div></div>`:''}
      <div class="activity-duration-heading"><span>${rest?'쉬어 갈 시간':'집중 시간'}</span><b>${state.duration}분</b></div>
      <div class="duration-options" role="group" aria-label="${rest?'휴식':'집중'} 시간">${spec.durations.map(n=>`<button id="duration-${n}" data-duration="${n}" aria-pressed="${state.duration===n}"><b>${n}<small>분</small></b></button>`).join('')}</div>
      ${rest?'<div class="fishing-default-item">'+Art.icon('check')+'<span><b>기본 낚싯대</b> · 무료 제공 · 바로 사용</span></div>':''}
      <p class="activity-policy">${Art.icon(rest?'harbor':'leaf')}${rest?'휴식은 따로 기록해요. 집중 순위와 목표에는 더하지 않아요.':spec.id==='study'?'지금은 혼자 시작해요. 친구의 공부 모션은 준비 중이에요.':'화면은 내려놓고, 내 책에 집중해요.'}</p>`,
      footer:`<button class="primary" data-action="start"><span>${rest?`${state.duration}분 낚시하며 쉬기`:`${state.duration}분 ${tag} 시작하기`}</span>${Art.icon(spec.icon)}</button><p class="panel-footnote">로컬 시연 · 실제 앱 차단은 연결되지 않았어요.</p>`};
  }
  function oceanMarkup(){
    let ripples='';
    for(let i=0;i<100;i++){
      const x=((i*613)%3600)-900,y=((i*419)%2400)-700,length=20+(i%7)*9;
      ripples+=`<path d="M${x} ${y}q${length*.45} -5 ${length} 0t${length*.65} 0" opacity="${.10+(i%5)*.025}"/>`;
    }
    return `<div class="ocean-field" aria-hidden="true"><svg viewBox="-900 -700 3600 2400" preserveAspectRatio="none"><g fill="none" stroke="#e1f4e9" stroke-width="1.3" stroke-linecap="round">${ripples}</g></svg></div>`;
  }
  function createWorld(layer){
    layer.insertAdjacentHTML('afterbegin',oceanMarkup());
    const ground=document.createElement('div');ground.className='study-ground';ground.setAttribute('aria-hidden','true');ground.innerHTML='<svg viewBox="0 0 160 160"><ellipse cx="80" cy="116" rx="67" ry="26" fill="#405e361c"/><g fill="#354f2c32"><ellipse cx="75" cy="149" rx="13" ry="3"/><ellipse cx="16" cy="115" rx="11" ry="3"/><ellipse cx="104" cy="132" rx="9" ry="3"/><ellipse cx="148" cy="100" rx="8" ry="3"/></g></svg>';layer.append(ground);
    const foreground=document.createElement('div');foreground.className='study-foreground';foreground.setAttribute('aria-hidden','true');foreground.innerHTML='<svg viewBox="0 0 160 160"><path fill="#75914c" d="M18 120q-9-11-9-2l3 6q2-13 6-4M77 149q-8-15-8-4l4 8q2-14 4-4M107 130q6-15 8-8l-3 12q9-10 10-3l-10 4"/></svg>';layer.append(foreground);
    const empty=document.createElement('button');empty.className='study-location';empty.dataset.activity='study';empty.setAttribute('aria-label','숲속 공부 테이블에서 공부 시작하기');empty.innerHTML='<img alt=""><span>공부 테이블</span>';empty.querySelector('img').src=emptyTableSource;layer.append(empty);
    const study=document.createElement('div');study.id='study-actor';study.className='activity-study';study.hidden=true;study.setAttribute('aria-label','공부 테이블에서 필기하는 모모');layer.append(study);
    const boat=document.createElement('div');boat.id='rest-boat';boat.dataset.equipment='basic-fishing-rod';boat.setAttribute('aria-label','기본 낚싯대로 배 위에서 낚시하며 쉬는 모모');boat.className='activity-boat';boat.hidden=true;boat.innerHTML='<svg class="boat-wake" viewBox="0 0 200 160" aria-hidden="true"><path class="boat-contact" d="M41 62C16 81 38 111 88 128S174 144 177 124"/><g class="boat-trail"><path d="M43 75Q8 67-13 27M63 120Q18 115-12 78"/><path d="M17 68Q-16 56-31 20M30 119Q-7 111-30 76"/></g></svg><div class="boat-rig"></div><svg class="fishing-tackle" viewBox="0 0 1000 1000" aria-hidden="true"><path class="fishing-line" fill="none" stroke="#eee6ca" stroke-width="3" stroke-linecap="round"/><g class="fishing-float"><ellipse class="fishing-ripple" cy="10" rx="37" ry="10" fill="none" stroke="#e6f4df" stroke-width="3"/><path d="M0-24V18" stroke="#766347" stroke-width="3"/><ellipse rx="9" ry="13" fill="#fbf1d7" stroke="#857050" stroke-width="2"/><path d="M-8 0A8 12 0 0 1 8 0Z" fill="#b97a59"/></g></svg>';layer.append(boat);
    const soloHost=boat.querySelector('.boat-rig');const groupHost=document.createElement('div');groupHost.className='cooperative-rig';groupHost.hidden=true;boat.append(groupHost);
    let studyRig,boatRig,groupRig,active=null,paused=false,greeting=0;
    function freeze(value){paused=value;[studyRig,boatRig,groupRig].filter(Boolean).forEach(r=>{r.paused=value||r!==active;});}
    function stop(){clearTimeout(greeting);active=null;freeze(paused);study.hidden=true;boat.hidden=true;empty.hidden=false;}
    // 카메라가 따라가는 활동 리그는 pause/stop으로 제어한다. 변환된 지도 밖의 낚시를 IO가 비가시로 오판하지 않게 한다.
    function show(id){if(id==='study'&&active===studyRig&&!study.hidden||id==='rest'&&active===boatRig&&!boat.hidden||id==='gather'&&active===groupRig&&!boat.hidden)return active;stop();if(id==='study'){empty.hidden=true;study.hidden=false;studyRig??=GachisupCatRig.create(study,{profile:studyProfile,label:'모모의 노트 필기',clip:'read',resolution:1024,observeVisibility:false});active=studyRig;}else if(id==='rest'){boat.hidden=false;boat.dataset.cooperative='false';soloHost.hidden=false;groupHost.hidden=true;boatRig??=GachisupCatRig.create(boat.querySelector('.boat-rig'),{profile:boatProfile,label:'기본 낚싯대로 낚시하는 모모',clip:'idle',resolution:1024,observeVisibility:false,onRender:renderFishing});active=boatRig;}else if(id==='gather'){boat.hidden=false;boat.dataset.cooperative='true';soloHost.hidden=true;groupHost.hidden=false;groupRig??=GachisupCatRig.create(groupHost,{profile:GachisupCooperativeArt.profile,label:'한 배에서 낚시하는 세 친구 · 동료는 연출 예시',clip:'idle',resolution:1024,observeVisibility:false,onRender:rig=>GachisupCooperativeArt.renderFishing(rig,boat)});active=groupRig;}freeze(paused);return active;}
    function greet(){if(!active||paused)return;const rig=active;rig.setClip('nod');clearTimeout(greeting);greeting=setTimeout(()=>{if(active===rig)rig.setClip(rig===studyRig?'read':'idle');},2400);}
    function moveBoat(x,y,heading=voyage.at(1).heading,speed=0){boat.style.left=x+'px';boat.style.top=y+'px';boat.style.setProperty('--boat-heading',heading+'deg');boat.style.setProperty('--boat-speed',speed);boat.dataset.x=x.toFixed(2);boat.dataset.y=y.toFixed(2);boat.dataset.heading=heading.toFixed(2);}
    function renderFishing(rig){const line=boat.querySelector('.fishing-line'),float=boat.querySelector('.fishing-float');if(!line||!float)return;const [x,y]=rig.transformPoint(947,116),t=rig.time,fx=1035+Math.sin(t*.55)*8,fy=707+Math.sin(t*1.15)*10;line.setAttribute('d',`M${x.toFixed(2)} ${y.toFixed(2)} Q${(fx+18).toFixed(2)} ${((y+fy)*.5).toFixed(2)} ${fx.toFixed(2)} ${fy.toFixed(2)}`);float.setAttribute('transform',`translate(${fx.toFixed(2)} ${fy.toFixed(2)}) rotate(${(Math.sin(t*.7)*5).toFixed(2)})`);boat.dataset.fishingTime=t.toFixed(3);}
    function placeStudy(point){for(const el of [empty,study,ground,foreground]){el.style.left=(point[0]-80)+'px';el.style.top=(point[1]-80)+'px';}}
    placeStudy(specs.study.point);
    return {show,stop,freeze,greet,moveBoat,placeStudy,ready:()=>active?.ready||Promise.resolve(),get active(){return active;},destroy(){stop();studyRig?.destroy();boatRig?.destroy();groupRig?.destroy();}};
  }
  const api={specs,cooperative,forTag,panel,createWorld,voyage,defaultEquipment:Object.freeze({rest:Object.freeze({id:'basic-fishing-rod',name:'기본 낚싯대',price:0,owned:true})}),get tableAsset(){return emptyTableSource;},assetError:null};
  api.ready=Promise.all([(async()=>{const image=new Image();image.src='assets/momo-study-table-v2.png';await image.decode();return image.src;})(),keyedTexture('assets/study-table-empty-v2-key.png')]).then(([study,table])=>{specs.study.asset=study;studyProfile.source=study;emptyTableSource=table;return window.GachisupCooperativeArt?.ready;}).catch(error=>{api.assetError=error.message;});
  window.GachisupActivities=api;
})();
