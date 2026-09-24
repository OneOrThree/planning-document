/* 하나의 원화, 하나의 좌표계. 줌·건물·캐릭터·축소 지도가 같은 좌표를 쓴다. */
(async () => {
  'use strict';
  await GachisupActivities.ready;
  const MAP = GachisupBackground.map;
  const icon = Art.icon;
  const $ = selector => document.querySelector(selector);
  const escape = text => String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const clamp = (n,min,max) => Math.max(min,Math.min(max,n));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const buildings = {
    town:{name:'마을회관',short:'회관',description:'섬의 성장과 우리 약속',rect:[601,40,300,290],entry:'town',crop:[565,45,390,310]},
    camp:{name:'모닥불',short:'모닥불',description:'곁에 앉아, 각자의 집중',rect:[818,412,206,140],entry:'camp',crop:[780,383,296,212]},
    board:{name:'게시판',short:'게시판',description:'함께 정한 작은 약속',rect:[307,262,168,149],entry:'board',crop:[279,237,236,211]},
    cabin:{name:'오두막',short:'오두막',description:'시간이 남긴 우리의 기록',rect:[325,509,276,224],entry:'cabin',crop:[296,484,329,270]},
    tower:{name:'전망대',short:'전망대',description:'함께 쌓은 시간의 높이',rect:[1110,157,157,259],entry:'tower',crop:[1070,135,231,310],locked:false},
    post:{name:'우체국',short:'우체국',description:'다정한 안부가 머무는 곳',rect:[1080,532,211,220],entry:'post',crop:[1051,507,277,263],locked:false},
    harbor:{name:'항구',short:'항구',description:'다른 섬으로 떠나는 길',rect:[679,735,305,216],entry:'harbor',crop:[645,708,370,266]}
  };
  const order=['town','camp','board','cabin','tower','post','harbor'];
  const state={selected:null,night:false,quiet:false,duration:25,session:null,recordSeconds:0,lastSeconds:0,recordTab:'group',visiting:false,island:'느티나무 섬',myIsland:'느티나무 섬',sound:false,audio:null,source:null,overview:true};
  Object.assign(state,{boardTab:'quests',harborTab:'mine',rankingTab:'group',recordDay:6,letterPreset:0,destination:null,islandSeconds:{home:0,dawn:0},islands:[{id:'home',name:'느티나무 섬',level:3,members:5},{id:'dawn',name:'새벽의 서재',level:2,members:4}]});
  let panelExpanded=false,panelOpener=null;
  state.activityTag='독서';state.activityPhase='settled';state.motionPaused=false;
  const activitySpec=()=>state.session?.worldAction==='fishing'?GachisupActivities.cooperative:GachisupActivities.forTag(state.session?.tag||state.activityTag);
  const boating=spec=>['rest','gather'].includes(spec.id);
  const motionOff=()=>reduced.matches||state.motionPaused;
  let voyageFrame=0,entryVersion=0;
  const localModel=GachisupStore.create(window.GachisupIAStorage||{getItem:key=>localStorage.getItem(key),setItem:(key,value)=>localStorage.setItem(key,value)});
  function syncLocal(){const d=localModel.get();state.islands=d.islands;state.myIsland=d.islands.find(i=>i.id===d.currentIsland)?.name||d.islands[0]?.name||'함께할 섬';if(!state.visiting)state.island=state.myIsland;const focus=d.sessions.filter(s=>s.kind!=='rest'&&s.tag!=='휴식');state.recordSeconds=focus.reduce((sum,s)=>sum+s.seconds,0);state.islandSeconds=Object.fromEntries(d.islands.map(i=>[i.id,focus.filter(s=>s.islandId===i.id).reduce((sum,s)=>sum+s.seconds,0)]));}
  syncLocal();
  const camera={x:0,y:0,scale:1};
  let viewportWidth=innerWidth,viewportHeight=innerHeight,fit=1,previousCamera=null,cameraFrame=0,walkFrame=0,toastTimeout=0,suppressUntil=0;
  const avatar={x:747,y:555};
  const paths={
    a:[739,352],b:[961,338],c:[1051,410],d:[1158,484],e:[1113,555],f:[1025,627],g:[875,676],h:[774,699],i:[694,773],j:[596,721],k:[620,650],l:[658,594],m:[608,541],n:[510,507],o:[421,457],p:[448,413],q:[533,377],r:[626,339],
    center:[747,555],stone1:[790,527],stone2:[753,492],stone3:[711,455],
    town:[720,324],board:[419,419],camp:[929,567],study:[647,495],cabin:[529,734],tower:[1180,422],post:[1121,747],postpath:[1084,691],harbor:[795,761],pier:[802,827],embark:[803,885]
  };
  const adjacency={};
  function edge(a,b){(adjacency[a]??=[]).push(b);(adjacency[b]??=[]).push(a);}
  const ring='abcdefghijklmnopqr'.split('');ring.forEach((n,i)=>edge(n,ring[(i+1)%ring.length]));
  [['center','stone1'],['stone1','stone2'],['stone2','stone3'],['stone3','r'],['center','h'],['town','a'],['board','p'],['camp','e'],['cabin','j'],['tower','c'],['post','postpath'],['postpath','f'],['harbor','h']].forEach(([a,b])=>edge(a,b));
  edge('study','m');
  edge('harbor','pier');edge('pier','embark');
  const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
  function nearest(point){return Object.keys(paths).reduce((best,n)=>distance(point,paths[n])<distance(point,paths[best])?n:best,'center');}
  function routeTo(target){const start=nearest([avatar.x,avatar.y]);const dist={[start]:0},prev={},queue=new Set(Object.keys(paths));while(queue.size){const n=[...queue].reduce((best,k)=>(dist[k]??Infinity)<(dist[best]??Infinity)?k:best);if(n===target)break;queue.delete(n);for(const next of adjacency[n]||[]){const d=(dist[n]??Infinity)+distance(paths[n],paths[next]);if(d<(dist[next]??Infinity)){dist[next]=d;prev[next]=n;}}}const route=[target];while(route[0]!==start&&prev[route[0]])route.unshift(prev[route[0]]);return [[avatar.x,avatar.y],...route.map(n=>paths[n])];}
  function thumbnail(key,extra=''){const r=buildings[key].crop;return `<svg class="building-thumb ${extra}" viewBox="${r.join(' ')}" aria-hidden="true"><image href="${MAP.src}" width="${MAP.width}" height="${MAP.height}"/></svg>`;}
  function detail(key){return `<div class="scene-detail">${thumbnail(key)}<span class="scene-detail-caption">${buildings[key].name} 앞</span></div>`;}
  const actionButton=(label,action,kind='primary',glyph='')=>`<button class="${kind}" data-action="${action}">${glyph?icon(glyph):''}${label}</button>`;
  const buildingButton=(label,key,kind='primary')=>`<button class="${kind}" data-select="${key}">${label}${icon('arrow')}</button>`;
  function markup(){
    const useSeparated = new URLSearchParams(location.search).get('separated') === '1';
    let mapHTML = '';
    if (useSeparated && GachisupBackground.layers) {
      // 분리된 에셋들을 레이어별로 렌더링 (Z-index는 y축 기준 정렬)
      mapHTML = GachisupBackground.layers.map(layer => {
        if (layer.isBase) {
          return `<img class="map-image map-separated-base" id="map-image" src="${layer.src}" width="1536" height="1024" alt="" draggable="false">`;
        }
        // 원래 색감을 확인하기 위해 mix-blend-mode를 제거합니다 (임시로 흰 배경이 보임)
        return `<img class="map-separated-prop" src="${layer.src}" style="position:absolute; left:${layer.x}px; top:${layer.y}px; width:${layer.w}px; z-index:${layer.z}; pointer-events:none;" alt="" draggable="false">`;
      }).join('');
    } else {
      mapHTML = `<img class="map-image" id="map-image" src="${MAP.src}" width="1536" height="1024" alt="나무와 둘레길로 이어진 하나의 섬. 마을회관, 게시판, 모닥불, 오두막, 전망대, 우체국, 항구가 있습니다." draggable="false">`;
    }

    return `<div class="village-app" id="village-app"><div class="map-viewport" id="map-viewport" role="region" aria-label="마을 지도. 방향키로 이동, 더하기와 빼기로 확대·축소, Home 키로 전체 보기" tabindex="0"><div class="map-layer" id="map-layer">${mapHTML}<svg class="route-line" viewBox="0 0 1536 1024" aria-hidden="true"><path id="walk-route"/></svg><div class="map-night"></div>${order.map(key=>{const b=buildings[key],[x,y,w,h]=b.rect;return `<button class="landmark" data-building="${key}" data-select="${key}" style="left:${x+w/2}px;top:${y+h/2}px;width:${w}px;height:${h}px;z-index:${y+h}" aria-label="${b.name}${b.locked?' · 아직 열리지 않음':''}" aria-expanded="false" aria-controls="building-panel"><span class="landmark-ring"></span><span class="landmark-label">${b.locked?icon('lock'):''}${b.name}</span></button>`;}).join('')}<button class="camp-presence" data-select="camp" style="z-index:900"><span class="live-dot"></span>3명 집중 중</button><span class="walk-destination" id="walk-destination" hidden></span><div class="avatar-position" id="avatar-position" style="z-index:1000"><span class="avatar-name">나</span></div></div></div><header class="world-heading"><div class="island-card"><div class="island-kicker">${icon('sprout')}Catus · 우리의 작은 섬</div><button class="island-name" data-select="town"><span id="island-name">느티나무 섬</span>${icon('down')}</button><div class="island-meta"><span>Lv. 3</span><i class="mini-rule"></i><span>친구 5명</span><i class="mini-rule"></i><span>오늘도 함께</span></div></div><button class="header-presence" data-select="camp"><span class="live-dot"></span>모닥불에 3명이 있어요${icon('arrow')}</button></header><div class="top-tools"><button class="tool wide" data-action="quiet" aria-label="마을만 보기" aria-pressed="false">${icon('grid')}<span>마을만 보기</span></button><button class="tool" data-action="night" aria-label="밤으로 바꾸기" aria-pressed="false">${icon('moon')}</button><button class="tool" data-action="help" aria-label="마을 둘러보기 도움말">${icon('book')}</button></div><div class="camera-controls"><button class="tool overview-control" data-action="overview" aria-label="마을 전체 보기">${icon('grid')}<span>마을 전체</span></button><div class="zoom-group"><button data-action="zoom-in" aria-label="마을 확대">${icon('plus')}</button><span class="zoom-readout" id="zoom-readout">100%</span><button data-action="zoom-out" aria-label="마을 축소"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 12H19"/></svg></button></div><button class="tool" data-action="locate" aria-label="내 고양이 찾기">${icon('cat')}</button></div><div class="map-hint" id="map-hint">${icon('leaf')}드래그로 둘러보기 · 건물 누르기 · 길을 눌러 걷기</div><nav class="village-dock" aria-label="마을 건물 바로 찾기">${order.map(key=>`<button class="dock-building" data-select="${key}" aria-label="${buildings[key].name} 찾기" aria-pressed="false">${thumbnail(key)}${buildings[key].locked?`<span class="small-lock">${icon('lock')}</span>`:''}<span>${buildings[key].short}</span></button>`).join('')}</nav><button class="mini-map" id="mini-map" aria-label="축소 지도에서 위치로 이동"><img src="${MAP.src}" alt="" draggable="false"><span class="mini-window" id="mini-window"></span><span class="mini-map-label">우리 섬 전체</span></button><span class="demo-label">디자인 프로토타입 · 예시 데이터</span><aside class="building-panel" id="building-panel" aria-label="선택한 건물" hidden></aside><section class="session-hud" id="session-hud" aria-label="집중 세션" hidden></section><div class="focus-footer" id="focus-footer" hidden></div><div class="visit-banner" id="visit-banner" hidden>다른 섬을 구경 중이에요 · 읽기 전용</div><div class="village-toast" id="village-toast" role="status" hidden></div><div class="load-state" id="load-state">${icon('sprout')}<h2>우리 숲으로 가는 길</h2><p>마을의 풍경을 불러오고 있어요.</p></div><dialog class="village-dialog" id="village-dialog" aria-labelledby="dialog-title"></dialog></div>`;}
  $('#village-root').innerHTML=markup();
  const viewport=$('#map-viewport'),layer=$('#map-layer'),app=$('#village-app');
  const features=GachisupFeatures.create(state,localModel,{render:renderPanel,select:selectBuilding,expand:()=>{panelExpanded=true;},sync:()=>{syncLocal();updateChrome();},toast,activity:chooseActivityTag,dialog:showDialog,closeDialog:()=>$('#village-dialog').close()});
  const softener=document.createElement('div');softener.className='focus-softener';softener.setAttribute('aria-hidden','true');layer.append(softener);
  const activityWorld=GachisupActivities.createWorld(layer);
  const avatarMount=$('#avatar-position');
  const walkerMount=document.createElement('div');walkerMount.className='avatar-walker';
  const readerMount=document.createElement('div');readerMount.className='avatar-reader';
  avatarMount.prepend(walkerMount,readerMount);avatarMount.dataset.mode='walk';
  const walker=GachisupWalkRig.create(walkerMount,{resolution:512});
  let playerReader=null;
  function playerMode(mode){
    avatarMount.dataset.mode=mode;walker.paused=mode==='read';
    if(mode==='read'){
      playerReader??=GachisupCatRig.create(readerMount,{clip:'read',resolution:512});
      playerReader.paused=motionOff();
    }else if(playerReader){playerReader.paused=true;}
  }
  // 배경에 그려 넣지 않은 실제 관절 애니메이션. 한 리그를 시차를 두고 재사용한다.
  const residents=[[871,485,0],[944,467,2.7],[991,506,5.2]].map(([x,y,phase])=>{
    const mount=document.createElement('div');mount.className='resident-cat';
    mount.style.left=x+'px';mount.style.top=y+'px';mount.setAttribute('aria-hidden','true');
    layer.append(mount);return GachisupCatRig.create(mount,{clip:'read',phase,resolution:512});
  });
  const rigLink=document.createElement('a');rigLink.href='rig.html';rigLink.className='tool rig-link';
  rigLink.innerHTML=icon('cat')+'<span>캐릭터 작업실</span>';rigLink.setAttribute('aria-label','리깅 캐릭터 작업실 열기');
  $('.top-tools').prepend(rigLink);
  addEventListener('pagehide',event=>{if(!event.persisted){residents.forEach(rig=>rig.destroy());walker.destroy();playerReader?.destroy();activityWorld.destroy();}});
  function phoneLandscape(){return document.documentElement.classList.contains('mobile-device')&&viewportWidth>600&&viewportHeight<=500;}
  function measure(){viewportWidth=viewport.clientWidth;viewportHeight=viewport.clientHeight;fit=Math.min((viewportWidth-(viewportWidth<600?16:70))/MAP.width,(viewportHeight-(phoneLandscape()?48:viewportWidth<600?210:170))/MAP.height);}
  function constrain(next){const marginX=viewportWidth*.4,marginY=viewportHeight*.38;next.scale=clamp(next.scale,fit,3.2);next.x=clamp(next.x,Math.min(viewportWidth-MAP.width*next.scale-marginX,marginX),marginX);next.y=clamp(next.y,Math.min(viewportHeight-(MAP.height+(state.session&&boating(activitySpec())?500:0))*next.scale-marginY,marginY),marginY);return next;}
  function paintCamera(){Object.assign(softener.style,{width:viewportWidth+'px',height:viewportHeight+'px',transform:`translate(${-camera.x/camera.scale}px,${-camera.y/camera.scale}px) scale(${1/camera.scale})`});layer.style.transform=`translate(${camera.x}px,${camera.y}px) scale(${camera.scale})`;layer.style.setProperty('--map-scale',camera.scale);layer.style.setProperty('--inverse-scale',1/camera.scale);$('#zoom-readout').textContent=`${Math.round(camera.scale/fit*100)}%`;const x=clamp(-camera.x/camera.scale/MAP.width,0,1),y=clamp(-camera.y/camera.scale/MAP.height,0,1),w=clamp(viewportWidth/camera.scale/MAP.width,0,1-x),h=clamp(viewportHeight/camera.scale/MAP.height,0,1-y);Object.assign($('#mini-window').style,{left:x*100+'%',top:y*100+'%',width:w*100+'%',height:h*100+'%'});$('[data-action="zoom-out"]').disabled=camera.scale<=fit+.001;$('[data-action="zoom-in"]').disabled=camera.scale>=3.199;}
  function setCamera(next,animate=false){cancelAnimationFrame(cameraFrame);const target=constrain({...next});if(!animate||motionOff()){Object.assign(camera,target);paintCamera();return;}const from={...camera},start=performance.now();function tick(now){const p=clamp((now-start)/440,0,1),e=1-(1-p)**3;for(const k of ['x','y','scale'])camera[k]=from[k]+(target[k]-from[k])*e;paintCamera();if(p<1)cameraFrame=requestAnimationFrame(tick);}cameraFrame=requestAnimationFrame(tick);}
  function worldPoint(x,y){return [(x-camera.x)/camera.scale,(y-camera.y)/camera.scale];}
  function zoomAt(scale,x=viewportWidth/2,y=viewportHeight/2,animate=false){const [wx,wy]=worldPoint(x,y),s=clamp(scale,fit,3.2);state.overview=false;setCamera({x:x-wx*s,y:y-wy*s,scale:s},animate);}
  function centerOn(x,y,scale,animate=true,area=null){state.overview=false;const a=area||{x:0,y:110,w:viewportWidth,h:viewportHeight-215};setCamera({x:a.x+a.w/2-x*scale,y:a.y+a.h/2-y*scale,scale},animate);}
  function overview(animate=true){if(state.session)return;closePanel(false);state.overview=true;setCamera({x:(viewportWidth-MAP.width*fit)/2,y:(viewportHeight-MAP.height*fit)/2+10,scale:fit},animate);}
  function initialCamera(){measure();if(phoneLandscape()){const area={x:0,y:60,w:viewportWidth,h:viewportHeight-126};centerOn(810,510,Math.max(fit,Math.min(.75,viewportWidth/1100,(viewportHeight-60)/500)),false,area);}else if(viewportWidth>600){overview(false);}else{const area={x:0,y:96,w:viewportWidth,h:Math.max(230,viewportHeight-255)},scale=Math.max(fit,Math.min(.9,area.h/640,viewportWidth/485));centerOn(810,510,scale,false,area);}}
  function focusBuilding(key){
    const b=buildings[key],[x,y,w,h]=b.rect,mobile=viewportWidth<=600;
    const panelWidth=$('#building-panel').getBoundingClientRect().width;
    const area=mobile?{x:12,y:108,w:viewportWidth-24,h:Math.max(65,viewportHeight*.36-121)}:{x:28,y:132,w:Math.max(160,viewportWidth-panelWidth-94),h:viewportHeight-258};
    const s=clamp(Math.min(area.w/(w*1.6),area.h/(h*1.35)),fit,1.9);
    centerOn(x+w/2,y+h/2,s,true,area);
  }
  function placeAvatar(){avatarMount.style.transform=`translate(${avatar.x}px,${avatar.y}px)`;avatarMount.dataset.x=avatar.x.toFixed(2);avatarMount.dataset.y=avatar.y.toFixed(2);}
  function stopWalking(){cancelAnimationFrame(walkFrame);walker.setWalking(false);$('#walk-route').removeAttribute('d');$('#walk-destination').hidden=true;app.classList.remove('is-moving');}
  function walkTo(target,{sessionEntry=false,onArrive=()=>{}}={}){
    if(state.session&&!sessionEntry||state.visiting||!paths[target])return;
    stopWalking();playerMode('walk');
    const route=routeTo(target).filter((p,i,all)=>i===0||distance(p,all[i-1])>.01),end=route.at(-1);
    if(route.length<2){onArrive();return;}
    $('#walk-route').setAttribute('d','M'+route.map(p=>p.join(' ')).join('L'));
    Object.assign($('#walk-destination').style,{left:end[0]+'px',top:end[1]+'px'});$('#walk-destination').hidden=false;
    if(motionOff()){[avatar.x,avatar.y]=end;placeAvatar();stopWalking();onArrive();return;}
    app.classList.add('is-moving');walker.setWalking(true);
    const lengths=route.slice(1).map((p,i)=>distance(route[i],p)),total=lengths.reduce((a,b)=>a+b,0);
    let travelled=0,last=performance.now();
    function step(now){
      const dt=document.hidden?0:Math.min((now-last)/1000,.05);last=now;
      // 최종 22px에서 감속. 보폭도 동일한 실제 이동량으로 진행해 도착 시 헛발질하지 않는다.
      const speed=(sessionEntry?185:112)*Math.min(1,Math.sqrt(Math.max(.01,(total-travelled)/22)));
      const delta=Math.min(total-travelled,speed*dt);travelled+=delta;
      let offset=travelled,index=0;while(index<lengths.length-1&&offset>lengths[index])offset-=lengths[index++];
      const from=route[index],to=route[index+1],t=lengths[index]?offset/lengths[index]:1;
      avatar.x=from[0]+(to[0]-from[0])*t;avatar.y=from[1]+(to[1]-from[1])*t;
      walker.advance(delta,to[0]-from[0],to[1]-from[1]);placeAvatar();
      if(travelled>=total-.001){[avatar.x,avatar.y]=end;placeAvatar();stopWalking();onArrive();return;}
      walkFrame=requestAnimationFrame(step);
    }
    walkFrame=requestAnimationFrame(step);
  }
  function selectBuilding(key){if(!buildings[key]||state.session)return;state.coopView=null;if(!state.selected){previousCamera={...camera};panelOpener=document.activeElement;}features.navigate(key);panelExpanded=key==='cabin'&&viewportWidth<=600;state.selected=key;state.overview=false;state.quiet=false;updateChrome();renderPanel();if(key==='camp')focusActivityPanel();else focusBuilding(key);walkTo(key==='camp'?activitySpec().entry:buildings[key].entry);}
  function closePanel(restore=true){const hadFocus=$('#building-panel').contains(document.activeElement);state.selected=null;panelExpanded=false;$('#building-panel').hidden=true;app.classList.remove('panel-open');updateChrome();if(restore&&previousCamera)setCamera(previousCamera,true);previousCamera=null;if(hadFocus){const target=panelOpener?.isConnected&&panelOpener!==document.body?panelOpener:viewport;target.focus({preventScroll:true});}panelOpener=null;}
  function updateChrome(){app.dataset.activity=activitySpec().id;app.dataset.phase=state.activityPhase;app.classList.toggle('motion-paused',motionOff());app.classList.toggle('is-night',state.night);app.classList.toggle('quiet-view',state.quiet);app.classList.toggle('focus-mode',!!state.session);app.classList.toggle('panel-open',!!state.selected&&!state.session);$('#island-name').textContent=state.island;const activeIsland=state.islands.find(i=>i.name===state.island);$('.island-meta').innerHTML=activeIsland?`<span>Lv. ${activeIsland.level}</span><i class="mini-rule"></i><span>친구 ${activeIsland.members}명</span><i class="mini-rule"></i><span>오늘도 함께</span>`:'<span>다른 섬에 방문 중</span>';$('#visit-banner').hidden=!state.visiting;document.querySelectorAll('.landmark[data-building]').forEach(b=>b.setAttribute('aria-expanded',state.selected===b.dataset.building));document.querySelectorAll('.dock-building').forEach(b=>b.setAttribute('aria-pressed',state.selected===b.dataset.select));const quiet=$('[data-action="quiet"]');quiet.setAttribute('aria-pressed',state.quiet);quiet.setAttribute('aria-label',state.quiet?'메뉴 다시 보기':'마을만 보기');quiet.innerHTML=icon('grid')+`<span>${state.quiet?'메뉴 다시 보기':'마을만 보기'}</span>`;const night=$('[data-action="night"]');night.setAttribute('aria-pressed',state.night);night.setAttribute('aria-label',state.night?'낮으로 바꾸기':'밤으로 바꾸기');night.innerHTML=icon(state.night?'sun':'moon');}
  function renderPanel(focus=true){
    if(!state.selected)return;
    const key=state.selected,b=buildings[key]||{name:'함께 자란 시간'},panel=$('#building-panel');
    const scroll=focus?0:panel.querySelector('.panel-content')?.scrollTop||0;
    const activeId=!focus&&panel.contains(document.activeElement)?document.activeElement.id:null;
    let content=(!state.visiting&&features.render(key))||GachisupPanels.render(key,state,buildings);const [description,glyph]=key==='camp'&&!state.visiting?[activitySpec().place+' · '+state.activityTag,activitySpec().icon]:GachisupPanels.meta[key];if(key==='town'&&!state.visiting)content.body+=features.townExtra();if(key==='harbor'&&!state.visiting)content.body+='<button class="harbor-rest-link" data-activity="rest">'+icon('harbor')+'<span><b>잠깐 바람 쐬고 오기</b><small>섬을 옮기지 않고, 배에서 쉬어 가요.</small></span>'+icon('arrow')+'</button>';
    content=window.GachisupCooperative?.decorate(key,state,localModel,content)||content;
    panel.dataset.cooperative=String(key==='harbor'&&!!state.coopView);
    panel.hidden=false;panel.dataset.building=key;panel.classList.toggle('is-expanded',panelExpanded);
    panel.setAttribute('aria-labelledby','building-panel-title');
    panel.innerHTML=`<button id="panel-grip" class="panel-grip" data-action="panel-size" aria-label="건물 화면 ${panelExpanded?'줄이기':'크게 보기'}" aria-expanded="${panelExpanded}"><span></span></button><header class="panel-header"><span class="building-mark">${window.GachisupIslandTheme?.mark(key,b.crop)||icon(glyph)}</span><div><h2 id="building-panel-title" tabindex="-1">${escape(content.title||b.name)}</h2><p>${key==='harbor'&&state.coopView?'같이 만들고, 다시 모이는 곳':description}</p></div><button id="panel-expand" class="panel-expand" data-action="panel-size" aria-label="건물 화면 ${panelExpanded?'줄이기':'크게 보기'}" aria-expanded="${panelExpanded}">${icon('down')}</button><button class="panel-close" data-action="close-panel" aria-label="마을로 돌아가기">${icon('close')}</button></header><div class="panel-content building-content">${content.body}</div><footer class="panel-footer">${content.footer}</footer>`;
    panel.querySelector('.panel-content').scrollTop=scroll;
    if(focus)panel.querySelector('h2').focus({preventScroll:true});
    else if(activeId)document.getElementById(activeId)?.focus({preventScroll:true});
  }
  function resizePanel(){
    if(viewportWidth>600||!state.selected)return;
    panelExpanded=!panelExpanded;renderPanel(false);
    if(!panelExpanded)focusBuilding(state.selected==='result'?'camp':state.selected);
  }
  function choosePanelTab(scope,value){
    const choices={board:['quests','notice'],harbor:['mine','explore'],ranking:['group','islands']};
    if(!choices[scope]?.includes(value))return;
    state[{board:'boardTab',harbor:'harborTab',ranking:'rankingTab'}[scope]]=value;
    renderPanel(false);$('#'+scope+'-tab-'+value)?.focus({preventScroll:true});
  }
  // 시트 손잡이는 탭과 스와이프 모두 지원한다. 지도 드래그와 별도로 처리한다.
  let sheetGesture=null,sheetSuppressUntil=0;
  $('#building-panel').addEventListener('pointerdown',event=>{
    if(viewportWidth>600||!event.target.closest('.panel-grip'))return;
    sheetGesture={id:event.pointerId,y:event.clientY};event.currentTarget.setPointerCapture(event.pointerId);
  });
  $('#building-panel').addEventListener('pointerup',event=>{
    if(!sheetGesture||sheetGesture.id!==event.pointerId)return;
    const delta=event.clientY-sheetGesture.y;sheetGesture=null;
    sheetSuppressUntil=performance.now()+350;
    if(Math.abs(delta)<28){resizePanel();return;}
    if((delta<0)!==panelExpanded)resizePanel();
  });
  $('#building-panel').addEventListener('pointercancel',()=>{sheetGesture=null;});
  $('#building-panel').addEventListener('click',event=>{
    if(performance.now()<sheetSuppressUntil){event.preventDefault();event.stopPropagation();}
  },true);
  function toast(message){clearTimeout(toastTimeout);$('#village-toast').textContent=message;$('#village-toast').hidden=false;toastTimeout=setTimeout(()=>$('#village-toast').hidden=true,4000);}
  function showDialog(title,content,buttons=''){const d=$('#village-dialog');d.innerHTML=`<div class="dialog-heading"><h2 id="dialog-title">${title}</h2><button class="panel-close" data-action="close-dialog" aria-label="닫기">${icon('close')}</button></div>${content}${buttons?`<div class="dialog-buttons">${buttons}</div>`:''}`;if(!d.open)d.showModal();}
  function chooseActivityTag(tag){
    if(state.session||state.visiting||!['독서','공부','작업','휴식'].includes(tag))return;
    const focusId=document.activeElement?.matches('#focus-task,[data-focus-tag]')?document.activeElement.id:null,previous=activitySpec().id;state.activityTag=tag;features.ui.tag=tag;if(tag==='휴식')state.projectContribution=null;
    const spec=activitySpec();if(previous!==spec.id&&!spec.durations.includes(state.duration))state.duration=spec.id==='rest'?10:25;
    if(state.selected==='camp'){renderPanel(false);focusActivityPanel();if(focusId)document.getElementById(focusId)?.focus({preventScroll:true});}updateChrome();
  }
  function chooseActivity(id){
    if(state.session||state.visiting||!GachisupActivities.specs[id])return;
    chooseActivityTag(GachisupActivities.specs[id].tag);selectBuilding('camp');
  }
  function focusActivityPanel(){
    const spec=activitySpec();if(spec.id==='read'){focusBuilding('camp');return;}
    if(spec.id==='rest'){focusBuilding('harbor');return;}
    const mobile=viewportWidth<=600,panelWidth=$('#building-panel').getBoundingClientRect().width;
    const area=mobile?{x:12,y:108,w:viewportWidth-24,h:Math.max(65,viewportHeight*.36-121)}:{x:28,y:132,w:Math.max(160,viewportWidth-panelWidth-94),h:viewportHeight-258};
    centerOn(...spec.point,Math.min(1.6,area.w/340,area.h/290),true,area);
  }
  function startSession(context={}){
    if(state.visiting||state.session)return;
    if(activitySpec().id==='study'&&GachisupActivities.assetError){toast('공부 원화를 불러오지 못했어요. 새로고침 후 다시 시도해주세요.');return;}
    const island=state.islands.find(i=>i.name===state.island),tag=features.readTag();
    const session={started:Date.now(),duration:state.duration*60,island:state.island,islandId:island.id,tag,...(state.projectContribution?.islandId===island.id&&tag!=='휴식'?{projectId:'pier'}:{}),...context};
    if(context.questId&&GachisupCooperativeArt.error){toast('공동 낚시 원화를 불러오지 못했어요. 새로고침 후 다시 시도해주세요.');return;}
    try{localModel.startSession(session);}catch(e){toast(e.message);return;}
    state.session=localModel.get().activeSession;state.projectContribution=null;state.lastCooperative=null;showSession();
  }
  function renderSoundButton(){
    if(!state.session)return;
    const spec=activitySpec(),rest=spec.id==='rest';
    $('#focus-footer').innerHTML='<div class="focus-company"><i class="live-dot"></i>'+spec.company+'</div><div class="focus-controls">'+actionButton(state.sound?'소리 끄기':boating(spec)?'물결 소리':'숲 소리','sound','secondary',state.sound?'volume':'mute')+actionButton(rest?'섬으로 돌아가기':'집중 마치기','finish','secondary','check')+'</div><button class="motion-toggle" data-action="motion" aria-pressed="'+motionOff()+'" '+(reduced.matches?'disabled':'')+'>'+(reduced.matches?'기기 설정 · 동작 줄임':state.motionPaused?'움직임 다시 켜기':'움직임 줄이기')+'</button><p>'+(rest?'휴식은 따로 기록해요 · 집중 순위에 더하지 않아요':spec.id==='gather'?'현실의 '+escape(state.session.tag)+'로 기록 · 약속 시간 안의 집중만 모임 인정':'집중한 시간은 이 섬에 남아요 · 로컬 기록')+'</p><button class="entry-skip" data-action="skip-entry">이동 건너뛰기</button>';
  }
  function tickSession(){
    if(!state.session)return;
    const elapsed=Math.max(0,Math.floor((Date.now()-state.session.started)/1000)),remain=Math.max(0,state.session.duration-elapsed);
    $('#session-timer').textContent=String(Math.floor(remain/60)).padStart(2,'0')+':'+String(remain%60).padStart(2,'0');
    const spent=Math.min(state.session.duration,elapsed);
    $('#session-elapsed').textContent=state.session.duration/60+'분 중 '+(Math.floor(spent/60)?Math.floor(spent/60)+'분 ':'')+spent%60+(activitySpec().id==='rest'?'초 쉬어 가고 있어요':'초를 쌓았어요');
    $('#session-progress-fill').style.width=Math.min(100,elapsed/state.session.duration*100)+'%';
    if(remain<=0)finishSession();
  }
  function finishSession(){
    if(!state.session)return;let record;
    try{record=localModel.finishSession();}catch(e){toast(e.message);return;}if(!record)return;
    const spec=activitySpec();state.lastSeconds=record.seconds;state.lastOrigin=state.session.island;state.lastKind=record.kind;state.lastCooperative=record.questId||record.projectId?record:null;
    entryVersion++;cancelAnimationFrame(voyageFrame);stopWalking();activityWorld.stop();
    [avatar.x,avatar.y]=boating(spec)?paths.harbor:spec.id==='study'?paths.study:paths.camp;placeAvatar();
    state.session=null;state.activityPhase='settled';syncLocal();stopSound();$('#village-dialog').close();
    $('#session-hud').hidden=true;$('#focus-footer').hidden=true;viewport.inert=false;playerMode('walk');
    state.selected='result';updateChrome();renderPanel();focusBuilding(boating(spec)?'harbor':'camp');
    dispatchEvent(new CustomEvent('gachisup:session-finished',{detail:record}));
  }
  function focusCamera(animate=true){
    const spec=activitySpec(),hud=$('#session-hud').getBoundingClientRect(),footer=$('#focus-footer').getBoundingClientRect();
    const top=Math.max(viewportHeight<=700?205:260,hud.bottom+18),bottom=footer.height?viewportHeight-footer.top+16:190;
    const area=phoneLandscape()?{x:8,y:12,w:viewportWidth-294,h:viewportHeight-24}:{x:0,y:top,w:viewportWidth,h:Math.max(100,viewportHeight-top-bottom)};
    let target=spec.point;
    if(boating(spec))target=state.activityPhase==='walking'?[849,860]:[Number($('#rest-boat').dataset.x)||spec.point[0],Number($('#rest-boat').dataset.y)||spec.point[1]];
    const width=spec.id==='read'?285:spec.id==='gather'?325:245,height=spec.id==='read'?195:235;
    centerOn(...target,Math.min(spec.id==='read'?2.5:2.35,area.w/width,area.h/height),animate,area);
  }
  function changePhase(phase){state.activityPhase=phase;updateChrome();}
  function settleActivity(greet=false){
    if(!state.session)return;
    entryVersion++;cancelAnimationFrame(voyageFrame);stopWalking();
    const spec=activitySpec();changePhase('settled');
    if(spec.id==='read'){avatar.x=963;avatar.y=558;placeAvatar();playerMode('read');activityWorld.stop();}
    else{playerMode('walk');walker.paused=true;avatarMount.dataset.mode=spec.id;activityWorld.show(spec.id);activityWorld.freeze(motionOff());if(boating(spec))activityWorld.moveBoat(...spec.point);if(greet)activityWorld.greet();}
    focusCamera(!motionOff());
    if(document.activeElement?.dataset.action==='skip-entry')$('#session-hud h2').focus({preventScroll:true});
  }
  function enterActivity(){
    if(motionOff()){settleActivity();return;}
    const spec=activitySpec(),version=++entryVersion;changePhase('walking');focusCamera();
    walkTo(spec.entry,{sessionEntry:true,onArrive:()=>{
      if(!state.session||version!==entryVersion)return;
      if(!boating(spec)){settleActivity(true);return;}
      changePhase('boarding');activityWorld.show(spec.id);activityWorld.freeze(motionOff());walker.paused=true;
      const from=GachisupActivities.voyage.start,to=spec.point;activityWorld.moveBoat(...from);
      const departureCamera={...camera};
      let elapsed=0,last=performance.now();
      function sail(now){
        if(!state.session||version!==entryVersion)return;
        elapsed+=document.hidden?0:Math.min(80,now-last);last=now;
        if(elapsed>=650&&state.activityPhase==='boarding')changePhase('sailing');
        const p=Math.min(1,Math.max(0,elapsed-650)/6800),ease=p*p*(3-2*p),point=GachisupActivities.voyage.at(ease,spec.point);
        activityWorld.moveBoat(point.x,point.y,point.heading,Math.sin(p*Math.PI));
        // 출항 지점을 잠시 남겨두고 따라간다. 화면 속 배도 움직여야 출항이 읽힌다.
        const hud=$('#session-hud').getBoundingClientRect(),footer=$('#focus-footer').getBoundingClientRect();
        const top=Math.max(viewportHeight<=700?205:260,hud.bottom+18),area=phoneLandscape()?{x:8,y:12,w:viewportWidth-294,h:viewportHeight-24}:{x:0,y:top,w:viewportWidth,h:Math.max(100,footer.top-top-16)};
        const finalScale=Math.min(2.35,area.w/(spec.id==='gather'?325:245),area.h/235),zoom=.72+.28*ease,scale=finalScale*zoom;
        const lag=42*Math.sin(p*Math.PI),target={scale,x:area.x+area.w/2-(point.x-lag)*scale,y:area.y+area.h/2-(point.y-lag*.5)*scale};
        const blend=Math.min(1,elapsed/950),soft=blend*blend*(3-2*blend);
        setCamera({scale:departureCamera.scale+(target.scale-departureCamera.scale)*soft,x:departureCamera.x+(target.x-departureCamera.x)*soft,y:departureCamera.y+(target.y-departureCamera.y)*soft});
        if(p<1)voyageFrame=requestAnimationFrame(sail);else settleActivity();
      }
      voyageFrame=requestAnimationFrame(sail);
    }});
  }
  function applyMotionPreference(){
    app.classList.toggle('motion-paused',motionOff());residents.forEach(r=>r.paused=motionOff());
    if(playerReader)playerReader.paused=avatarMount.dataset.mode!=='read'||motionOff();
    activityWorld.freeze(motionOff());
    if(state.session){if(motionOff()&&state.activityPhase!=='settled')settleActivity();renderSoundButton();focusCamera(false);}
  }
  reduced.addEventListener('change',applyMotionPreference);
  function showSession({restore=false}={}){
    clearTimeout(toastTimeout);$('#village-toast').hidden=true;
    stopWalking();state.activityTag=state.session.tag||'독서';state.selected=null;$('#building-panel').hidden=true;state.quiet=false;
    changePhase(restore||motionOff()?'settled':'walking');viewport.inert=true;
    const spec=activitySpec(),rest=spec.id==='rest';
    $('#session-hud').hidden=false;$('#session-hud').setAttribute('aria-label',rest?'휴식 세션':'집중 세션');
    $('#session-hud').innerHTML='<div class="session-eyebrow">'+icon(spec.icon)+escape(state.session.island)+' · '+spec.place+'</div><h2 tabindex="-1">'+(spec.id==='gather'?spec.heading:state.session.tag==='작업'?'지금은, 할 일에 머무는 시간':spec.heading)+'</h2><div class="session-timer" id="session-timer" role="timer" aria-label="남은 '+(rest?'휴식':'집중')+' 시간"></div><p id="session-elapsed"></p><div class="session-progress" aria-hidden="true"><i id="session-progress-fill"></i></div>';
    $('#focus-footer').hidden=false;renderSoundButton();tickSession();if(!state.session)return;
    if(restore||motionOff())settleActivity();else enterActivity();
    $('#session-hud h2').focus({preventScroll:true});
  }
  function stopSound(){state.source?.stop();state.source=null;state.audio?.close();state.audio=null;state.sound=false;}
  async function toggleSound(){if(state.sound){stopSound();renderSoundButton();return;}try{const Ctx=window.AudioContext||window.webkitAudioContext;const ctx=new Ctx();state.audio=ctx;await ctx.resume();const buf=ctx.createBuffer(1,ctx.sampleRate*3,ctx.sampleRate),data=buf.getChannelData(0);let last=0;for(let i=0;i<data.length;i++){last=(last+(Math.random()*2-1)*.02)/1.02;data[i]=last*3.5;}const src=ctx.createBufferSource(),gain=ctx.createGain(),filter=ctx.createBiquadFilter();src.buffer=buf;src.loop=true;gain.gain.value=.12;filter.type='lowpass';filter.frequency.value=850;src.connect(filter).connect(gain).connect(ctx.destination);src.start();state.source=src;state.sound=true;renderSoundButton();}catch{stopSound();toast('소리를 재생하지 못했어요. 브라우저의 소리 설정을 확인해주세요.');}}
  const actions={
    'panel-size':resizePanel,
    members(){showDialog('같은 숲에 있는 친구들',GachisupPanels.friendRows(state.islands.find(i=>i.name===state.island)?.members),actionButton('마을회관으로 돌아가기','close-dialog'));},
    'quest-focus'(){const mins=Math.floor(35+state.recordSeconds/60);showDialog('나를 위한 한 시간',`<p class="dialog-copy">오늘은 나를 위해 60분을 남겨두기로 했어요.</p><div class="dialog-quantity">${mins}<span> / 60분</span></div><p class="dialog-copy">매일 반복 · 예시 퀘스트<br>지금까지의 집중 시간은 목표에 반영됩니다.</p>`,actionButton('모닥불로 가기','quest-go'));},
    'quest-go'(){$('#village-dialog').close();selectBuilding('camp');},
    'quest-phone'(){showDialog('폰보다 나에게 가까이','<p class="dialog-copy">하루 폰 사용 시간을 2시간 안으로.<br>오늘은 48분 사용한 상태를 시연하고 있어요.</p><div class="dialog-quantity">48<span> / 120분</span></div><p class="panel-note">예시 데이터입니다. 실제 기기 사용량 권한과 측정은 연결되지 않았어요.</p>',actionButton('약속으로 돌아가기','close-dialog'));},
    travel(){
      const dest=state.islands.find(i=>i.id===state.destination);
      if(!dest||dest.name===state.island||state.session||state.visiting)return;
      try{localModel.configure({currentIsland:dest.id});}catch(e){toast(e.message);return;}stopWalking();syncLocal();state.destination=null;
      avatar.x=795;avatar.y=761;placeAvatar();updateChrome();overview();toast(dest.name+'에 도착했어요.');
    },
    overview:()=>overview(), 'zoom-in':()=>zoomAt(camera.scale*1.3,viewportWidth/2,viewportHeight/2,true), 'zoom-out':()=>zoomAt(camera.scale/1.3,viewportWidth/2,viewportHeight/2,true),
    locate(){closePanel(false);centerOn(avatar.x,avatar.y,Math.max(camera.scale,fit*1.75));},
    quiet(){if(state.selected)closePanel(false);state.quiet=!state.quiet;updateChrome();},night(){state.night=!state.night;updateChrome();},'close-panel':()=>closePanel(),
    help(){showDialog('마을에서 함께',`<p class="dialog-copy">드래그하거나 두 손가락으로 움직여 마을을 둘러보세요.<br><br>휠·핀치 또는 + / − 버튼으로 가까이 볼 수 있어요. ‘마을 전체’를 누르면 같은 마을이 한눈에 들어와요.<br><br>건물을 누르면 그곳으로 다가가고, 길을 누르면 내 고양이가 둘레길을 따라 걸어요. 아래 건물 메뉴도 같은 위치로 이어져요.<br><br>키보드: 지도에 포커스를 두고 방향키로 이동, + / − 확대·축소, Home 전체 보기, Escape 패널 닫기.</p>`,actionButton('마을 둘러보기','close-dialog'));},
    'close-dialog':()=>$('#village-dialog').close(),start:startSession,'skip-entry':()=>settleActivity(),motion(){state.motionPaused=!state.motionPaused;applyMotionPreference();},
    finish(){const rest=activitySpec().id==='rest';showDialog(rest?'섬으로 돌아갈까요?':'여기까지 집중할까요?',rest?'<p class="dialog-copy">쉬어 간 시간은 휴식 기록에만 남겨요.<br>집중 시간·순위에는 더하지 않아요.</p>':'<p class="dialog-copy">지금까지 집중한 시간은 그대로 기록돼요.<br>준비되면 다시 곁에 앉아요.</p>',actionButton(rest?'조금 더 쉬기':'조금 더 하기','close-dialog','secondary')+actionButton(rest?'섬으로 돌아가기':'집중 마치기','confirm-finish'));},'confirm-finish':finishSession,sound:toggleSound,
    rename(){showDialog('우리 섬의 이름',`<label class="input-label" for="rename-input">함께 부를 이름</label><input id="rename-input" value="${escape(state.island)}" maxlength="16" aria-describedby="rename-error"><p class="input-error" id="rename-error"></p><p class="panel-note">이 페이지 안에서만 변경됩니다.</p>`,actionButton('이 이름으로 부르기','save-name'));},
    'save-name'(){const input=$('#rename-input'),name=input.value.trim();if(name.length<2||name.length>16){input.setAttribute('aria-invalid','true');$('#rename-error').textContent='섬 이름을 2~16글자로 적어주세요.';input.focus();return;}if(state.islands.some(i=>i.name===name&&i.name!==state.island)){input.setAttribute('aria-invalid','true');$('#rename-error').textContent='이미 같은 이름의 섬이 있어요.';input.focus();return;}const island=state.islands.find(i=>i.name===state.island);try{localModel.rename(island.id,name);}catch(e){input.setAttribute('aria-invalid','true');$('#rename-error').textContent=e.message;return;}syncLocal();$('#village-dialog').close();updateChrome();renderPanel();},
    share(){showDialog('자료 공유','<p class="dialog-copy">이미지 · PDF · 텍스트로 오늘 배운 내용을 공유하는 공간입니다.<br><br>이 시안은 실제 업로드와 서버 저장에 연결되지 않았어요.</p>',actionButton('게시판으로 돌아가기','close-dialog'));},
    visit(){state.myIsland=state.island;state.island='햇살 머무는 섬';state.visiting=true;stopWalking();updateChrome();overview();},
    return(){state.island=state.myIsland;state.visiting=false;updateChrome();overview();},retry:()=>location.reload()
  };
  document.addEventListener('click',event=>{const target=event.target.closest('button');if(!target)return;if(event.detail>0&&performance.now()<suppressUntil&&viewport.contains(target))return;if(state.session&&!['finish','confirm-finish','close-dialog','sound','skip-entry','motion'].includes(target.dataset.action))return;if(target.dataset.activity){chooseActivity(target.dataset.activity);return;}if(features.handle(target))return;if(target.dataset.panelTab){choosePanelTab(target.dataset.panelTab,target.dataset.value);}else if(target.dataset.recordDay!==undefined){const day=Number(target.dataset.recordDay);if(Number.isInteger(day)&&day>=0&&day<7){state.recordDay=day;renderPanel(false);}}else if(target.dataset.letter!==undefined){const letter=Number(target.dataset.letter);if(Number.isInteger(letter)&&letter>=0&&letter<GachisupPanels.presets.length){state.letterPreset=letter;renderPanel(false);}}else if(target.dataset.destination){const dest=state.islands.find(i=>i.id===target.dataset.destination);if(dest&&dest.name!==state.island){state.destination=dest.id;renderPanel(false);}}else if(target.dataset.select){selectBuilding(target.dataset.select);}else if(target.dataset.action){actions[target.dataset.action]?.();}else if(target.dataset.duration){const duration=Number(target.dataset.duration);if(activitySpec().durations.includes(duration)){state.duration=duration;renderPanel(false);}}else if(target.dataset.tab){state.recordTab=target.dataset.tab;renderPanel(false);$(`#record-tab-${state.recordTab}`).focus({preventScroll:true});}});
  document.addEventListener('click',event=>{
    const choice=event.target.closest('button[data-focus-tag]');
    if(!choice||state.session||state.visiting)return;
    const select=$('#focus-task');if(!select)return;
    select.value=choice.dataset.focusTag;select.dispatchEvent(new Event('change',{bubbles:true}));
  });
  document.addEventListener('keydown',event=>{
    if(!event.target.matches('.activity-choices [role=radio]')||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key))return;
    event.preventDefault();const options=[...event.target.closest('[role=radiogroup]').querySelectorAll('[role=radio]')],current=options.indexOf(event.target);
    const next=event.key==='Home'?0:event.key==='End'?options.length-1:(current+(['ArrowRight','ArrowDown'].includes(event.key)?1:-1)+options.length)%options.length;
    options[next].focus({preventScroll:true});options[next].click();
  });
  const pointers=new Map();let gesture=null;
  function pinchStart(){const ps=[...pointers.values()];if(ps.length<2)return;const mid=[(ps[0].x+ps[1].x)/2,(ps[0].y+ps[1].y)/2];gesture={type:'pinch',distance:distance([ps[0].x,ps[0].y],[ps[1].x,ps[1].y]),scale:camera.scale,world:worldPoint(...mid),moved:true};}
  viewport.addEventListener('pointerdown',event=>{if(state.session||event.button>0)return;cancelAnimationFrame(cameraFrame);pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});viewport.setPointerCapture(event.pointerId);if(pointers.size===2){pinchStart();}else if(pointers.size===1){gesture={type:'pan',x:event.clientX,y:event.clientY,camera:{...camera},target:event.target.closest('[data-select]')?.dataset.select,activity:event.target.closest('button[data-activity]')?.dataset.activity,moved:false};}event.preventDefault();});
  viewport.addEventListener('pointermove',event=>{if(!pointers.has(event.pointerId)||!gesture)return;pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});if(pointers.size>=2){if(gesture.type!=='pinch')pinchStart();const ps=[...pointers.values()],mid=[(ps[0].x+ps[1].x)/2,(ps[0].y+ps[1].y)/2],s=clamp(gesture.scale*distance([ps[0].x,ps[0].y],[ps[1].x,ps[1].y])/Math.max(1,gesture.distance),fit,3.2);setCamera({scale:s,x:mid[0]-gesture.world[0]*s,y:mid[1]-gesture.world[1]*s});state.overview=false;return;}const dx=event.clientX-gesture.x,dy=event.clientY-gesture.y;if(Math.hypot(dx,dy)>5)gesture.moved=true;if(gesture.moved){viewport.classList.add('dragging');setCamera({x:gesture.camera.x+dx,y:gesture.camera.y+dy,scale:gesture.camera.scale});state.overview=false;}});
  function endPointer(event,cancelled=false){if(!pointers.has(event.pointerId))return;const old=gesture;pointers.delete(event.pointerId);suppressUntil=performance.now()+300;if(pointers.size===1){const p=[...pointers.values()][0];gesture={type:'pan',x:p.x,y:p.y,camera:{...camera},moved:true};return;}if(pointers.size)return;gesture=null;viewport.classList.remove('dragging');if(!cancelled&&old&&!old.moved&&old.type==='pan'){if(old.activity)chooseActivity(old.activity);else if(old.target)selectBuilding(old.target);else{const p=worldPoint(event.clientX,event.clientY),n=nearest(p);if(distance(p,paths[n])<120){if(state.selected)closePanel(false);walkTo(n);}else if(state.visiting)toast('다른 섬에서는 풍경만 둘러볼 수 있어요.');}}}
  viewport.addEventListener('pointerup',e=>endPointer(e));viewport.addEventListener('pointercancel',e=>endPointer(e,true));
  viewport.addEventListener('wheel',event=>{if(state.session)return;event.preventDefault();zoomAt(camera.scale*Math.exp(-event.deltaY*.0015),event.clientX,event.clientY);},{passive:false});
  viewport.addEventListener('keydown',event=>{if(state.session||event.target!==viewport)return;const key=event.key;if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-','Home'].includes(key))event.preventDefault();if(key==='Home')overview();else if(key==='+'||key==='=')actions['zoom-in']();else if(key==='-')actions['zoom-out']();else if(key.startsWith('Arrow')){const delta={ArrowLeft:[90,0],ArrowRight:[-90,0],ArrowUp:[0,90],ArrowDown:[0,-90]}[key];if(delta)setCamera({x:camera.x+delta[0],y:camera.y+delta[1],scale:camera.scale},true);}});
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&!$('#village-dialog').open&&!state.session){if(state.selected)closePanel();else if(state.quiet){state.quiet=false;updateChrome();}}
    if(event.target.matches('[role=tab]')&&['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){
      event.preventDefault();const tabs=[...event.target.closest('[role=tablist]').querySelectorAll('[role=tab]')],index=tabs.indexOf(event.target);
      const next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(index+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;
      tabs[next].click();
    }
  });
  $('#mini-map').addEventListener('click',event=>{if(state.session)return;const r=event.currentTarget.getBoundingClientRect();if(event.detail===0){overview();return;}centerOn((event.clientX-r.left)/r.width*MAP.width,(event.clientY-r.top)/r.height*MAP.height,camera.scale);});
  $('#village-dialog').addEventListener('click',event=>{const d=event.currentTarget,r=d.getBoundingClientRect();if(event.target===d&&(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom))d.close();});
  new ResizeObserver(()=>{const oldCenter=worldPoint(viewportWidth/2,viewportHeight/2),wasOverview=state.overview;measure();if(state.session){focusCamera(false);}else if(state.selected==='camp')focusActivityPanel();else if(state.selected&&buildings[state.selected])focusBuilding(state.selected);else if(wasOverview)overview(false);else centerOn(...oldCenter,Math.max(fit,camera.scale),false);}).observe(viewport);
  window.GachisupVillage={state,model:localModel,features,actions,buildings,selectBuilding,chooseActivity,beginMeeting(questId,tag){if(state.session||state.visiting)return;const q=localModel.get().quests.find(q=>q.id===questId);if(!q)return;state.activityTag=tag;features.ui.tag=tag;state.duration=q.minutes;startSession({questId});},renderPanel,closePanel,showDialog,toast,finishSession,settleActivity,overview,homeCamera:initialCamera,updateChrome,sync:()=>{syncLocal();updateChrome();},refocus:()=>focusCamera(false),placeStudy(point){GachisupActivities.specs.study.point=[...point];activityWorld.placeStudy(point);paths.study=[point[0]+14,point[1]+68];for(const key of ['m','stone2'])adjacency[key]=adjacency[key].filter(n=>n!=='study');adjacency.study=[];edge('study',point[0]>700?'stone2':'m');if(state.session&&activitySpec().id==='study')focusCamera(false);},expand:()=>{panelExpanded=true;renderPanel(false);}};
  dispatchEvent(new Event('gachisup:village-ready'));
  const img=$('#map-image');function loaded(){$('#load-state').hidden=true;initialCamera();placeAvatar();updateChrome();const screen=new URLSearchParams(location.search).get('screen');if(localModel.loadError)toast(localModel.loadError);if(localModel.get().activeSession){state.session=localModel.get().activeSession;showSession({restore:true});return;}const requestedActivity=new URLSearchParams(location.search).get('activity');if(requestedActivity&&GachisupActivities.specs[requestedActivity])chooseActivity(requestedActivity);else if(screen&&buildings[screen])selectBuilding(screen);else if(screen==='session'){state.selected='camp';startSession();}else if(new URLSearchParams(location.search).has('walk')){walker.ready.then(()=>{if(state.session||state.selected)return;centerOn(760,638,viewportWidth<600?1.05:1.5,false);walkTo('harbor');});}}
  function failed(){$('#load-state').innerHTML=icon('leaf')+'<h2>마을을 불러오지 못했어요.</h2><p>이미지 연결을 확인하고 다시 시도해주세요.</p>'+actionButton('다시 불러오기','retry');}
  if(img.complete&&img.naturalWidth)loaded();else{img.addEventListener('load',loaded,{once:true});img.addEventListener('error',failed,{once:true});}
  setInterval(tickSession,1000);document.addEventListener('visibilitychange',tickSession);addEventListener('pagehide',()=>{stopWalking();stopSound();cancelAnimationFrame(cameraFrame);cancelAnimationFrame(voyageFrame);});addEventListener('pageshow',event=>{if(event.persisted&&state.session)showSession({restore:true});});
})();
